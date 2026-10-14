const db = require('../config/database');
const vendaModel = require('../models/vendaModel');
const itemVendaModel = require('../models/itemVendaModel');
const produtoModel = require('../models/produtoModel');
const ServiceError = require('../utils/ServiceError');

// Finaliza uma venda do PDV: valida os itens, confirma preço atual do produto,
// dá baixa no estoque e grava a venda — tudo dentro de uma única transação.
// Se qualquer item falhar (produto inexistente ou estoque insuficiente), a
// venda inteira é desfeita (rollback), evitando estoque inconsistente.
// Pagamento em dinheiro: exige valor_recebido >= total e devolve o troco calculado.
// A validação é feita aqui (servidor) e não só no navegador, porque o front pode
// ser burlado. Todos os cálculos de dinheiro são em centavos (inteiros) pra evitar
// erros de ponto flutuante tipo 0.1 + 0.2 = 0.30000000000000004.
async function finalizarVenda({ usuario_id, forma_pagamento, itens, valor_recebido }) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new ServiceError('A venda precisa ter pelo menos um item.');
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let totalCentavos = 0;
    const itensProcessados = [];

    for (const item of itens) {
      const { produto_id, quantidade } = item;
      if (!produto_id || !quantidade || quantidade <= 0) {
        throw new ServiceError('Item de venda inválido: produto e quantidade são obrigatórios.');
      }

      const produto = await produtoModel.buscarPorId(produto_id);
      if (!produto) {
        throw new ServiceError(`Produto ${produto_id} não encontrado.`, 404);
      }

      const baixaOk = await produtoModel.decrementarEstoque(produto_id, quantidade, connection);
      if (!baixaOk) {
        throw new ServiceError(
          `Estoque insuficiente para "${produto.nome}" (disponível: ${produto.estoque}).`,
          409
        );
      }

      const precoUnitario = produto.preco;
      totalCentavos += Math.round(Number(precoUnitario) * 100) * Number(quantidade);
      itensProcessados.push({ produto_id, quantidade, preco_unitario: precoUnitario });
    }

    const total = totalCentavos / 100;

    let recebido = null;
    let troco = null;
    if (forma_pagamento === 'dinheiro') {
      const recebidoCentavos = Math.round(Number(valor_recebido) * 100);
      if (valor_recebido === undefined || valor_recebido === null || valor_recebido === '' || !Number.isFinite(recebidoCentavos)) {
        throw new ServiceError('Informe o valor recebido do cliente para pagamento em dinheiro.');
      }
      if (recebidoCentavos < totalCentavos) {
        throw new ServiceError('O valor recebido é menor que o total da venda.');
      }
      recebido = recebidoCentavos / 100;
      troco = (recebidoCentavos - totalCentavos) / 100;
    }

    const vendaId = await vendaModel.criar({ usuario_id, total, forma_pagamento }, connection);

    for (const item of itensProcessados) {
      await itemVendaModel.criar({ venda_id: vendaId, ...item }, connection);
    }

    await connection.commit();
    const venda = await vendaModel.buscarPorId(vendaId);
    // valor_recebido e troco não são gravados no banco; só voltam na resposta
    // pra o operador ver o troco na tela (e vão no log de auditoria).
    return { ...venda, valor_recebido: recebido, troco };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function listarVendas(filtros) {
  return vendaModel.listar(filtros);
}

async function buscarVenda(id) {
  const venda = await vendaModel.buscarPorId(id);
  if (!venda) throw new ServiceError('Venda não encontrada.', 404);
  return venda;
}

async function totalVendidoHoje() {
  return vendaModel.contarTotalHoje();
}

module.exports = { finalizarVenda, listarVendas, buscarVenda, totalVendidoHoje };

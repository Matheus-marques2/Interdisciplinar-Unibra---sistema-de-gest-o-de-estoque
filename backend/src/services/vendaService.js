const db = require('../config/database');
const vendaModel = require('../models/vendaModel');
const itemVendaModel = require('../models/itemVendaModel');
const produtoModel = require('../models/produtoModel');
const ServiceError = require('../utils/ServiceError');

// Finaliza uma venda do PDV: valida os itens, confirma preço atual do produto,
// dá baixa no estoque e grava a venda — tudo dentro de uma única transação.
// Se qualquer item falhar (produto inexistente ou estoque insuficiente), a
// venda inteira é desfeita (rollback), evitando estoque inconsistente.
async function finalizarVenda({ usuario_id, forma_pagamento, itens }) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new ServiceError('A venda precisa ter pelo menos um item.');
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let total = 0;
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
      total += precoUnitario * quantidade;
      itensProcessados.push({ produto_id, quantidade, preco_unitario: precoUnitario });
    }

    const vendaId = await vendaModel.criar({ usuario_id, total, forma_pagamento }, connection);

    for (const item of itensProcessados) {
      await itemVendaModel.criar({ venda_id: vendaId, ...item }, connection);
    }

    await connection.commit();
    return vendaModel.buscarPorId(vendaId);
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

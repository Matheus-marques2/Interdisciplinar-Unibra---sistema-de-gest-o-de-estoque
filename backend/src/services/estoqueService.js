const produtoModel = require('../models/produtoModel');
const vendaModel = require('../models/vendaModel');

// Agrega os dados usados pelo Dashboard: vendas de hoje, itens em estoque,
// valor total do estoque, alertas de estoque baixo e vendas recentes.
async function resumoDashboard() {
  const [totalHoje, itensEValor, estoqueBaixo, vendasRecentes] = await Promise.all([
    vendaModel.contarTotalHoje(),
    produtoModel.contarItensEValor(),
    produtoModel.listarEstoqueBaixo(),
    vendaModel.listar({ limite: 5 }),
  ]);

  return {
    vendas_hoje: Number(totalHoje),
    itens_em_estoque: Number(itensEValor.itens),
    valor_estoque: Number(itensEValor.valor),
    estoque_baixo: estoqueBaixo.map((p) => ({
      id: p.id,
      nome: p.nome,
      estoque: p.estoque,
      estoque_minimo: p.estoque_minimo,
    })),
    vendas_recentes: vendasRecentes,
  };
}

module.exports = { resumoDashboard };

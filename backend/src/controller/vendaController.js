const vendaService = require('../services/vendaService');
const { registrarAuditoria } = require('../utils/auditoria');

async function finalizar(req, res, next) {
  try {
    const usuario_id = req.session ? req.session.usuarioId : null;
    const venda = await vendaService.finalizarVenda({ ...req.body, usuario_id });
    await registrarAuditoria(req, {
      acao: 'criar',
      entidade: 'venda',
      entidade_id: venda.id,
      detalhes:
        `Venda #${venda.id} finalizada - total ${venda.total}` +
        (venda.troco !== null && venda.troco !== undefined
          ? ` (dinheiro: recebido ${venda.valor_recebido}, troco ${venda.troco})`
          : ''),
    });
    res.status(201).json(venda);
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const vendas = await vendaService.listarVendas(req.query);
    res.json(vendas);
  } catch (err) {
    next(err);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const venda = await vendaService.buscarVenda(req.params.id);
    res.json(venda);
  } catch (err) {
    next(err);
  }
}

module.exports = { finalizar, listar, buscarPorId };

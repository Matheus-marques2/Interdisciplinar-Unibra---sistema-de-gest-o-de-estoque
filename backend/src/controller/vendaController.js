const vendaService = require('../services/vendaService');

async function finalizar(req, res, next) {
  try {
    const usuario_id = req.session ? req.session.usuarioId : null;
    const venda = await vendaService.finalizarVenda({ ...req.body, usuario_id });
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

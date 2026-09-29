const fornecedorService = require('../services/fornecedorService');

async function listar(req, res, next) {
  try {
    const fornecedores = await fornecedorService.listarFornecedores(req.query.busca);
    res.json(fornecedores);
  } catch (err) {
    next(err);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const fornecedor = await fornecedorService.buscarFornecedor(req.params.id);
    res.json(fornecedor);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const fornecedor = await fornecedorService.criarFornecedor(req.body);
    res.status(201).json(fornecedor);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const fornecedor = await fornecedorService.atualizarFornecedor(req.params.id, req.body);
    res.json(fornecedor);
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    await fornecedorService.removerFornecedor(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };

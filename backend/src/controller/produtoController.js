const produtoService = require('../services/produtoService');

async function listar(req, res, next) {
  try {
    const { busca, categoria } = req.query;
    const produtos = await produtoService.listarProdutos({ busca, categoria });
    res.json(produtos);
  } catch (err) {
    next(err);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const produto = await produtoService.buscarProduto(req.params.id);
    res.json(produto);
  } catch (err) {
    next(err);
  }
}

async function buscarPorCodigoBarras(req, res, next) {
  try {
    const produto = await produtoService.buscarPorCodigoBarras(req.params.codigo);
    res.json(produto);
  } catch (err) {
    next(err);
  }
}

async function estoqueBaixo(req, res, next) {
  try {
    const produtos = await produtoService.listarEstoqueBaixo();
    res.json(produtos);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const produto = await produtoService.criarProduto(req.body);
    res.status(201).json(produto);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const produto = await produtoService.atualizarProduto(req.params.id, req.body);
    res.json(produto);
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    await produtoService.removerProduto(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, buscarPorCodigoBarras, estoqueBaixo, criar, atualizar, remover };

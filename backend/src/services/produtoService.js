const produtoModel = require('../models/produtoModel');
const ServiceError = require('../utils/ServiceError');

async function listarProdutos(filtros) {
  return produtoModel.listar(filtros);
}

async function buscarProduto(id) {
  const produto = await produtoModel.buscarPorId(id);
  if (!produto) throw new ServiceError('Produto não encontrado.', 404);
  return produto;
}

async function buscarPorCodigoBarras(codigo) {
  const produto = await produtoModel.buscarPorCodigoBarras(codigo);
  if (!produto) throw new ServiceError('Produto não encontrado para esse código de barras.', 404);
  return produto;
}

async function listarEstoqueBaixo() {
  return produtoModel.listarEstoqueBaixo();
}

function validarProduto(dados) {
  const { codigo_barras, nome, preco } = dados;
  if (!codigo_barras || !nome) {
    throw new ServiceError('Código de barras e nome são obrigatórios.');
  }
  if (preco === undefined || Number(preco) < 0) {
    throw new ServiceError('Preço inválido.');
  }
  if (dados.estoque !== undefined && Number(dados.estoque) < 0) {
    throw new ServiceError('Estoque não pode ser negativo.');
  }
}

async function criarProduto(dados) {
  validarProduto(dados);
  const existente = await produtoModel.buscarPorCodigoBarras(dados.codigo_barras);
  if (existente) throw new ServiceError('Já existe um produto com esse código de barras.', 409);
  return produtoModel.criar(dados);
}

async function atualizarProduto(id, dados) {
  validarProduto(dados);
  await buscarProduto(id); // garante que existe (lança 404 se não)
  return produtoModel.atualizar(id, dados);
}

async function removerProduto(id) {
  await buscarProduto(id);
  return produtoModel.remover(id);
}

module.exports = {
  listarProdutos,
  buscarProduto,
  buscarPorCodigoBarras,
  listarEstoqueBaixo,
  criarProduto,
  atualizarProduto,
  removerProduto,
};

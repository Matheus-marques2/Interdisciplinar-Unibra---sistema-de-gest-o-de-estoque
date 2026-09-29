const fornecedorModel = require('../models/fornecedorModel');
const ServiceError = require('../utils/ServiceError');

function validarCnpj(cnpj) {
  const digitos = String(cnpj || '').replace(/\D/g, '');
  return digitos.length === 14;
}

function validarFornecedor(dados) {
  if (!dados.nome || !dados.cnpj) {
    throw new ServiceError('Nome e CNPJ são obrigatórios.');
  }
  if (!validarCnpj(dados.cnpj)) {
    throw new ServiceError('CNPJ inválido — deve conter 14 dígitos.');
  }
}

async function listarFornecedores(busca) {
  return fornecedorModel.listar(busca);
}

async function buscarFornecedor(id) {
  const fornecedor = await fornecedorModel.buscarPorId(id);
  if (!fornecedor) throw new ServiceError('Fornecedor não encontrado.', 404);
  return fornecedor;
}

async function criarFornecedor(dados) {
  validarFornecedor(dados);
  return fornecedorModel.criar(dados);
}

async function atualizarFornecedor(id, dados) {
  validarFornecedor(dados);
  await buscarFornecedor(id);
  return fornecedorModel.atualizar(id, dados);
}

async function removerFornecedor(id) {
  await buscarFornecedor(id);
  return fornecedorModel.remover(id);
}

module.exports = {
  listarFornecedores,
  buscarFornecedor,
  criarFornecedor,
  atualizarFornecedor,
  removerFornecedor,
};

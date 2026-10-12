const fornecedorService = require('../services/fornecedorService');
const { registrarAuditoria } = require('../utils/auditoria');

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
    await registrarAuditoria(req, {
      acao: 'criar',
      entidade: 'fornecedor',
      entidade_id: fornecedor.id,
      detalhes: `Fornecedor "${fornecedor.nome}" criado`,
    });
    res.status(201).json(fornecedor);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const fornecedor = await fornecedorService.atualizarFornecedor(req.params.id, req.body);
    await registrarAuditoria(req, {
      acao: 'atualizar',
      entidade: 'fornecedor',
      entidade_id: fornecedor.id,
      detalhes: `Fornecedor "${fornecedor.nome}" atualizado`,
    });
    res.json(fornecedor);
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    const fornecedor = await fornecedorService.buscarFornecedor(req.params.id);
    await fornecedorService.removerFornecedor(req.params.id);
    await registrarAuditoria(req, {
      acao: 'remover',
      entidade: 'fornecedor',
      entidade_id: Number(req.params.id),
      detalhes: `Fornecedor "${fornecedor.nome}" removido`,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };

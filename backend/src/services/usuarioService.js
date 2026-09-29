const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarioModel');
const ServiceError = require('../utils/ServiceError');

const SALT_ROUNDS = 10;

async function registrar({ nome, email, senha, cargo }) {
  if (!nome || !email || !senha) {
    throw new ServiceError('Nome, email e senha são obrigatórios.');
  }
  if (senha.length < 6) {
    throw new ServiceError('A senha deve ter pelo menos 6 caracteres.');
  }

  const existente = await usuarioModel.buscarPorEmail(email);
  if (existente) throw new ServiceError('Já existe um usuário com esse email.', 409);

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  return usuarioModel.criar({ nome, email, senhaHash, cargo });
}

async function autenticar({ email, senha }) {
  if (!email || !senha) throw new ServiceError('Email e senha são obrigatórios.');

  const usuario = await usuarioModel.buscarPorEmail(email);
  if (!usuario || !usuario.ativo) {
    throw new ServiceError('Email ou senha inválidos.', 401);
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senha);
  if (!senhaConfere) throw new ServiceError('Email ou senha inválidos.', 401);

  // Nunca devolve o hash da senha para o cliente.
  const { senha: _descartada, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

async function buscarPorId(id) {
  const usuario = await usuarioModel.buscarPorId(id);
  if (!usuario) throw new ServiceError('Usuário não encontrado.', 404);
  return usuario;
}

module.exports = { registrar, autenticar, buscarPorId };

const usuarioService = require('../services/usuarioService');

async function registrar(req, res, next) {
  try {
    const usuario = await usuarioService.registrar(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const usuario = await usuarioService.autenticar(req.body);
    req.session.usuarioId = usuario.id;
    req.session.cargo = usuario.cargo;
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  // cookie-session: atribuir null apaga o cookie de sessão no navegador.
  req.session = null;
  res.status(204).send();
}

async function me(req, res, next) {
  try {
    const usuario = await usuarioService.buscarPorId(req.session.usuarioId);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

module.exports = { registrar, login, logout, me };

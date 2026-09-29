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

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.status(204).send();
  });
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

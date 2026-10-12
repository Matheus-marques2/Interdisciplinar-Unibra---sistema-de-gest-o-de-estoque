const usuarioService = require('../services/usuarioService');
const { registrarAuditoria } = require('../utils/auditoria');

async function registrar(req, res, next) {
  try {
    const usuario = await usuarioService.registrar(req.body);
    await registrarAuditoria(req, {
      acao: 'criar',
      entidade: 'usuario',
      entidade_id: usuario.id,
      detalhes: `Usuário "${usuario.email}" cadastrado (cargo: ${usuario.cargo})`,
    });
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
    await registrarAuditoria(req, {
      acao: 'login',
      entidade: 'usuario',
      entidade_id: usuario.id,
      detalhes: `Login de "${usuario.email}"`,
    });
    res.json(usuario);
  } catch (err) {
    // Tentativa de login que falhou (senha/email errados) também é um evento
    // de segurança relevante pra auditoria - ajuda a detectar força bruta.
    if (err.status === 401) {
      await registrarAuditoria(req, {
        acao: 'login_falhou',
        entidade: 'usuario',
        detalhes: `Tentativa de login falhou para "${req.body && req.body.email}"`,
      });
    }
    next(err);
  }
}

async function logout(req, res) {
  const usuario_id = req.session ? req.session.usuarioId : null;
  // Registra ANTES de zerar a sessão — senão o helper não sabe mais quem estava logado.
  await registrarAuditoria(req, { acao: 'logout', entidade: 'usuario', entidade_id: usuario_id });
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

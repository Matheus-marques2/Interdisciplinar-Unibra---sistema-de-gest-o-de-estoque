// Bloqueia rotas que exigem usuário logado (sessão criada no login).
function exigirAutenticacao(req, res, next) {
  if (!req.session || !req.session.usuarioId) {
    return res.status(401).json({ erro: 'Não autenticado. Faça login para continuar.' });
  }
  next();
}

// Bloqueia rotas restritas a um determinado cargo (ex.: só admin pode cadastrar fornecedor).
function exigirCargo(...cargosPermitidos) {
  return (req, res, next) => {
    if (!req.session || !req.session.usuarioId) {
      return res.status(401).json({ erro: 'Não autenticado. Faça login para continuar.' });
    }
    if (!cargosPermitidos.includes(req.session.cargo)) {
      return res.status(403).json({ erro: 'Você não tem permissão para essa ação.' });
    }
    next();
  };
}

module.exports = { exigirAutenticacao, exigirCargo };

const auditoriaModel = require('../models/auditoriaModel');

// Helper usado pelos controllers para registrar uma ação crítica no log.
// Nunca lança erro: uma falha ao gravar o log não pode derrubar a
// requisição principal do usuário (ex.: produto foi criado com sucesso,
// não faz sentido devolver 500 pro cliente só porque o log falhou).
async function registrarAuditoria(req, { acao, entidade, entidade_id, detalhes }) {
  try {
    const usuario_id = req.session ? req.session.usuarioId : null;
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
    await auditoriaModel.registrar({ usuario_id, acao, entidade, entidade_id, detalhes, ip });
  } catch (err) {
    console.error('[auditoria] falha ao registrar log:', err.message);
  }
}

module.exports = { registrarAuditoria };

const auditoriaService = require('../services/auditoriaService');

async function listar(req, res, next) {
  try {
    const { entidade, limite } = req.query;
    const logs = await auditoriaService.listarLogs({ entidade, limite });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };

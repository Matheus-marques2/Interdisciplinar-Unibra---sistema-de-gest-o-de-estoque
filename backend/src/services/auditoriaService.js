const auditoriaModel = require('../models/auditoriaModel');

async function listarLogs(filtros) {
  return auditoriaModel.listar(filtros);
}

module.exports = { listarLogs };

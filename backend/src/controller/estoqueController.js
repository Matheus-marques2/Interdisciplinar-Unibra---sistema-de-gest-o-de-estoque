const estoqueService = require('../services/estoqueService');

async function dashboard(req, res, next) {
  try {
    const resumo = await estoqueService.resumoDashboard();
    res.json(resumo);
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard };

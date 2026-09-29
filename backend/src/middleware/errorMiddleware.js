const ServiceError = require('../utils/ServiceError');

// Middleware de erro central: qualquer next(err) nos controllers cai aqui.
// ServiceError já traz o status HTTP correto; qualquer outro erro é tratado
// como 500 (erro inesperado) e logado no servidor sem vazar detalhes internos.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ServiceError) {
    return res.status(err.status).json({ erro: err.message });
  }

  // Erros de constraint do MySQL (ex.: FK/UNIQUE violado por fora das validações do service)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Registro duplicado.' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
    return res.status(409).json({ erro: 'Não é possível excluir: existem registros vinculados.' });
  }

  console.error('[erro não tratado]', err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, rotaNaoEncontrada };

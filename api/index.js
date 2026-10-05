// Ponto de entrada usado pela Vercel: qualquer arquivo dentro de /api vira uma
// Serverless Function. Aqui só reaproveitamos o app Express que já existe -
// sem chamar app.listen(), a própria Vercel cuida de receber a requisição HTTP
// e repassar pro Express.
module.exports = require('../backend/src/app');

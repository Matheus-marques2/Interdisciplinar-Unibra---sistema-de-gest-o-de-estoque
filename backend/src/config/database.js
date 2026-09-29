const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexões: reaproveita conexões em vez de abrir uma nova a cada query.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mercafacil',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // evita conversão automática de DATE/DATETIME para objeto Date do JS
});

// Testa a conexão assim que o módulo é carregado (útil para detectar erro de config cedo).
async function testarConexao() {
  try {
    const conn = await pool.getConnection();
    console.log('[database] Conectado ao MySQL com sucesso.');
    conn.release();
  } catch (err) {
    console.error('[database] Falha ao conectar ao MySQL:', err.message);
  }
}

testarConexao();

module.exports = pool;

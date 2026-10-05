const mysql = require('mysql2/promise');
require('dotenv').config();

console.log("[DB CONFIG]", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  hasPassword: !!process.env.DB_PASSWORD,
  passwordLength: process.env.DB_PASSWORD?.length,
  ssl: process.env.DB_SSL
});

console.log("[DB USER DEBUG]", {
  value: JSON.stringify(process.env.DB_USER),
  length: process.env.DB_USER?.length
});

// Pool de conexões: reaproveita conexões em vez de abrir uma nova a cada query.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mercafacil',
  waitForConnections: true,
  // Em ambiente serverless (Vercel) cada execução pode abrir seu próprio pool,
  // então mantemos esse número baixo para não esgotar o limite de conexões
  // simultâneas do plano gratuito do banco (ex: Aiven free tier).
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 5,
  queueLimit: 0,
  dateStrings: true, // evita conversão automática de DATE/DATETIME para objeto Date do JS
  // Bancos gerenciados (Aiven, PlanetScale, etc.) normalmente exigem SSL.
  // rejectUnauthorized: false é aceitável para projeto acadêmico; em produção
  // real, o ideal é validar com o certificado CA fornecido pelo provedor.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
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

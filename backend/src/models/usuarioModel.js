const db = require('../config/database');

async function buscarPorEmail(email) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0] || null;
}

async function buscarPorId(id) {
  const [rows] = await db.query(
    'SELECT id, nome, email, cargo, ativo, criado_em FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function criar({ nome, email, senhaHash, cargo }) {
  const [result] = await db.query(
    'INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)',
    [nome, email, senhaHash, cargo || 'operador']
  );
  return buscarPorId(result.insertId);
}

module.exports = { buscarPorEmail, buscarPorId, criar };

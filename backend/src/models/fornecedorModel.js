const db = require('../config/database');

async function listar(busca) {
  if (busca) {
    const [rows] = await db.query(
      `SELECT * FROM fornecedores
       WHERE nome LIKE ? OR cnpj LIKE ? OR email LIKE ?
       ORDER BY nome ASC`,
      [`%${busca}%`, `%${busca}%`, `%${busca}%`]
    );
    return rows;
  }
  const [rows] = await db.query('SELECT * FROM fornecedores ORDER BY nome ASC');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.query('SELECT * FROM fornecedores WHERE id = ?', [id]);
  return rows[0] || null;
}

async function criar(fornecedor) {
  const { cnpj, nome, descricao, telefone, email, cidade, estado } = fornecedor;
  const [result] = await db.query(
    `INSERT INTO fornecedores (cnpj, nome, descricao, telefone, email, cidade, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [cnpj, nome, descricao || null, telefone || null, email || null, cidade || null, estado || null]
  );
  return buscarPorId(result.insertId);
}

async function atualizar(id, fornecedor) {
  const { cnpj, nome, descricao, telefone, email, cidade, estado } = fornecedor;
  await db.query(
    `UPDATE fornecedores SET
      cnpj = ?, nome = ?, descricao = ?, telefone = ?, email = ?, cidade = ?, estado = ?
     WHERE id = ?`,
    [cnpj, nome, descricao || null, telefone || null, email || null, cidade || null, estado || null, id]
  );
  return buscarPorId(id);
}

async function remover(id) {
  const [result] = await db.query('DELETE FROM fornecedores WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };

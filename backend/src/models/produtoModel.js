const db = require('../config/database');

const SELECT_BASE = `
  SELECT p.id, p.codigo_barras, p.nome, p.marca, p.categoria, p.preco,
         p.estoque, p.estoque_minimo, p.validade, p.fornecedor_id,
         f.nome AS fornecedor_nome
  FROM produtos p
  LEFT JOIN fornecedores f ON f.id = p.fornecedor_id
`;

async function listar({ busca, categoria } = {}) {
  const condicoes = [];
  const params = [];

  if (busca) {
    condicoes.push('(p.nome LIKE ? OR p.marca LIKE ? OR p.codigo_barras LIKE ?)');
    params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }
  if (categoria) {
    condicoes.push('p.categoria = ?');
    params.push(categoria);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  const [rows] = await db.query(`${SELECT_BASE} ${where} ORDER BY p.nome ASC`, params);
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.query(`${SELECT_BASE} WHERE p.id = ?`, [id]);
  return rows[0] || null;
}

async function buscarPorCodigoBarras(codigo) {
  const [rows] = await db.query(`${SELECT_BASE} WHERE p.codigo_barras = ?`, [codigo]);
  return rows[0] || null;
}

async function listarEstoqueBaixo() {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE p.estoque <= p.estoque_minimo ORDER BY p.estoque ASC`
  );
  return rows;
}

async function criar(produto) {
  const { codigo_barras, nome, marca, categoria, preco, estoque, estoque_minimo, validade, fornecedor_id } = produto;
  const [result] = await db.query(
    `INSERT INTO produtos
      (codigo_barras, nome, marca, categoria, preco, estoque, estoque_minimo, validade, fornecedor_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [codigo_barras, nome, marca || null, categoria || null, preco, estoque || 0, estoque_minimo || 0, validade || null, fornecedor_id || null]
  );
  return buscarPorId(result.insertId);
}

async function atualizar(id, produto) {
  const { codigo_barras, nome, marca, categoria, preco, estoque, estoque_minimo, validade, fornecedor_id } = produto;
  await db.query(
    `UPDATE produtos SET
      codigo_barras = ?, nome = ?, marca = ?, categoria = ?, preco = ?,
      estoque = ?, estoque_minimo = ?, validade = ?, fornecedor_id = ?
     WHERE id = ?`,
    [codigo_barras, nome, marca || null, categoria || null, preco, estoque, estoque_minimo, validade || null, fornecedor_id || null, id]
  );
  return buscarPorId(id);
}

async function remover(id) {
  const [result] = await db.query('DELETE FROM produtos WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Decrementa estoque de forma atômica (usado na finalização de uma venda).
// connection: permite rodar dentro de uma transação já aberta pelo vendaService.
async function decrementarEstoque(id, quantidade, connection = db) {
  const [result] = await connection.query(
    'UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?',
    [quantidade, id, quantidade]
  );
  return result.affectedRows > 0; // false = estoque insuficiente
}

async function contarItensEValor() {
  const [rows] = await db.query(
    'SELECT COALESCE(SUM(estoque), 0) AS itens, COALESCE(SUM(estoque * preco), 0) AS valor FROM produtos'
  );
  return rows[0];
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorCodigoBarras,
  listarEstoqueBaixo,
  criar,
  atualizar,
  remover,
  decrementarEstoque,
  contarItensEValor,
};

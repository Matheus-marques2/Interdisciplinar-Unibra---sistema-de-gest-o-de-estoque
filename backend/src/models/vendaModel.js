const db = require('../config/database');

async function criar({ usuario_id, total, forma_pagamento }, connection = db) {
  const [result] = await connection.query(
    'INSERT INTO vendas (usuario_id, total, forma_pagamento) VALUES (?, ?, ?)',
    [usuario_id || null, total, forma_pagamento || 'dinheiro']
  );
  return result.insertId;
}

async function listar({ limite = 50 } = {}) {
  const [rows] = await db.query(
    `SELECT v.id, v.total, v.forma_pagamento, v.criado_em, u.nome AS usuario_nome,
            (SELECT COUNT(*) FROM itens_venda iv WHERE iv.venda_id = v.id) AS total_itens
     FROM vendas v
     LEFT JOIN usuarios u ON u.id = v.usuario_id
     ORDER BY v.criado_em DESC
     LIMIT ?`,
    [Number(limite)]
  );
  return rows;
}

async function buscarPorId(id) {
  const [vendas] = await db.query(
    `SELECT v.id, v.total, v.forma_pagamento, v.criado_em, u.nome AS usuario_nome
     FROM vendas v
     LEFT JOIN usuarios u ON u.id = v.usuario_id
     WHERE v.id = ?`,
    [id]
  );
  const venda = vendas[0];
  if (!venda) return null;

  const [itens] = await db.query(
    `SELECT iv.id, iv.produto_id, p.nome AS produto_nome, iv.quantidade, iv.preco_unitario, iv.subtotal
     FROM itens_venda iv
     JOIN produtos p ON p.id = iv.produto_id
     WHERE iv.venda_id = ?`,
    [id]
  );

  return { ...venda, itens };
}

async function contarTotalHoje() {
  const [rows] = await db.query(
    `SELECT COALESCE(SUM(total), 0) AS total_hoje
     FROM vendas WHERE DATE(criado_em) = CURDATE()`
  );
  return rows[0].total_hoje;
}

module.exports = { criar, listar, buscarPorId, contarTotalHoje };

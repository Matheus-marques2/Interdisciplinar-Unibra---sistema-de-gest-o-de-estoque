const db = require('../config/database');

async function criar({ venda_id, produto_id, quantidade, preco_unitario }, connection = db) {
  const subtotal = Number(preco_unitario) * Number(quantidade);
  await connection.query(
    `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
     VALUES (?, ?, ?, ?, ?)`,
    [venda_id, produto_id, quantidade, preco_unitario, subtotal]
  );
  return subtotal;
}

module.exports = { criar };

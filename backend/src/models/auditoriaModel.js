const db = require('../config/database');

async function registrar({ usuario_id, acao, entidade, entidade_id, detalhes, ip }) {
  await db.query(
    `INSERT INTO logs_auditoria (usuario_id, acao, entidade, entidade_id, detalhes, ip)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id || null, acao, entidade, entidade_id || null, detalhes || null, ip || null]
  );
}

async function listar({ entidade, limite = 100 } = {}) {
  const condicoes = [];
  const params = [];

  if (entidade) {
    condicoes.push('l.entidade = ?');
    params.push(entidade);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  params.push(Number(limite));

  const [rows] = await db.query(
    `SELECT l.id, l.acao, l.entidade, l.entidade_id, l.detalhes, l.ip, l.criado_em,
            u.nome AS usuario_nome
     FROM logs_auditoria l
     LEFT JOIN usuarios u ON u.id = l.usuario_id
     ${where}
     ORDER BY l.criado_em DESC
     LIMIT ?`,
    params
  );
  return rows;
}

module.exports = { registrar, listar };

const express = require('express');
const router = express.Router();
const produtoController = require('../controller/produtoController');
const { exigirAutenticacao, exigirCargo } = require('../middleware/authMiddleware');

// Consulta: qualquer usuário autenticado (operador do PDV precisa listar produtos e ler por código de barras).
router.get('/estoque-baixo', exigirAutenticacao, produtoController.estoqueBaixo);
router.get('/codigo/:codigo', exigirAutenticacao, produtoController.buscarPorCodigoBarras);
router.get('/:id', exigirAutenticacao, produtoController.buscarPorId);
router.get('/', exigirAutenticacao, produtoController.listar);

// Escrita: só admin. Evita que um operador comum altere catálogo/preço/estoque
// diretamente (isso é "Broken Access Control" se liberado pra qualquer logado).
router.post('/', exigirCargo('admin'), produtoController.criar);
router.put('/:id', exigirCargo('admin'), produtoController.atualizar);
router.delete('/:id', exigirCargo('admin'), produtoController.remover);

module.exports = router;

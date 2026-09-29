const express = require('express');
const router = express.Router();
const produtoController = require('../controller/produtoController');
const { exigirAutenticacao } = require('../middleware/authMiddleware');

router.get('/estoque-baixo', exigirAutenticacao, produtoController.estoqueBaixo);
router.get('/codigo/:codigo', exigirAutenticacao, produtoController.buscarPorCodigoBarras);
router.get('/:id', exigirAutenticacao, produtoController.buscarPorId);
router.get('/', exigirAutenticacao, produtoController.listar);
router.post('/', exigirAutenticacao, produtoController.criar);
router.put('/:id', exigirAutenticacao, produtoController.atualizar);
router.delete('/:id', exigirAutenticacao, produtoController.remover);

module.exports = router;

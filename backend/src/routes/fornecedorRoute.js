const express = require('express');
const router = express.Router();
const fornecedorController = require('../controller/forcenedorController');
const { exigirAutenticacao } = require('../middleware/authMiddleware');

router.get('/:id', exigirAutenticacao, fornecedorController.buscarPorId);
router.get('/', exigirAutenticacao, fornecedorController.listar);
router.post('/', exigirAutenticacao, fornecedorController.criar);
router.put('/:id', exigirAutenticacao, fornecedorController.atualizar);
router.delete('/:id', exigirAutenticacao, fornecedorController.remover);

module.exports = router;

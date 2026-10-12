const express = require('express');
const router = express.Router();
const fornecedorController = require('../controller/forcenedorController');
const { exigirAutenticacao, exigirCargo } = require('../middleware/authMiddleware');

// Consulta: qualquer usuário autenticado (ex.: tela de Estoque precisa listar fornecedores no <select>).
router.get('/:id', exigirAutenticacao, fornecedorController.buscarPorId);
router.get('/', exigirAutenticacao, fornecedorController.listar);

// Escrita: só admin.
router.post('/', exigirCargo('admin'), fornecedorController.criar);
router.put('/:id', exigirCargo('admin'), fornecedorController.atualizar);
router.delete('/:id', exigirCargo('admin'), fornecedorController.remover);

module.exports = router;

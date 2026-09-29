const express = require('express');
const router = express.Router();
const vendaController = require('../controller/vendaController');
const { exigirAutenticacao } = require('../middleware/authMiddleware');

router.post('/', exigirAutenticacao, vendaController.finalizar);
router.get('/', exigirAutenticacao, vendaController.listar);
router.get('/:id', exigirAutenticacao, vendaController.buscarPorId);

module.exports = router;

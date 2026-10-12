const express = require('express');
const router = express.Router();
const auditoriaController = require('../controller/auditoriaController');
const { exigirCargo } = require('../middleware/authMiddleware');

// Só admin acessa a trilha de auditoria - é informação sobre o comportamento
// de todos os usuários do sistema, não é algo que um operador deve enxergar.
router.get('/', exigirCargo('admin'), auditoriaController.listar);

module.exports = router;

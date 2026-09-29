const express = require('express');
const router = express.Router();
const estoqueController = require('../controller/estoqueController');
const { exigirAutenticacao } = require('../middleware/authMiddleware');

router.get('/dashboard', exigirAutenticacao, estoqueController.dashboard);

module.exports = router;

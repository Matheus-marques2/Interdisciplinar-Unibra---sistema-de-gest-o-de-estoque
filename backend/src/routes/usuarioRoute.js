const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');
const { exigirAutenticacao } = require('../middleware/authMiddleware');

router.post('/registrar', usuarioController.registrar);
router.post('/login', usuarioController.login);
router.post('/logout', exigirAutenticacao, usuarioController.logout);
router.get('/me', exigirAutenticacao, usuarioController.me);

module.exports = router;

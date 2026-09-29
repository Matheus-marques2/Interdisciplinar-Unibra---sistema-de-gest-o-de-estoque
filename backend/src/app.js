const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const usuarioRoute = require('./routes/usuarioRoute');
const produtoRoute = require('./routes/produtoRoute');
const fornecedorRoute = require('./routes/fornecedorRoute');
const vendaRoute = require('./routes/vendaRoute');
const estoqueRoute = require('./routes/estoqueRoute');
const { errorHandler, rotaNaoEncontrada } = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'troque-este-segredo-em-producao',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 horas
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

// Serve o frontend estático (páginas em frontend/pages, assets em frontend/assets, etc.)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Rotas da API
app.use('/api/usuarios', usuarioRoute);
app.use('/api/produtos', produtoRoute);
app.use('/api/fornecedores', fornecedorRoute);
app.use('/api/vendas', vendaRoute);
app.use('/api/estoque', estoqueRoute);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(rotaNaoEncontrada);
app.use(errorHandler);

module.exports = app;

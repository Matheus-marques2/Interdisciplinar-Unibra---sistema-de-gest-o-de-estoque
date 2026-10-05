const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
require('dotenv').config();

const usuarioRoute = require('./routes/usuarioRoute');
const produtoRoute = require('./routes/produtoRoute');
const fornecedorRoute = require('./routes/fornecedorRoute');
const vendaRoute = require('./routes/vendaRoute');
const estoqueRoute = require('./routes/estoqueRoute');
const { errorHandler, rotaNaoEncontrada } = require('./middleware/errorMiddleware');

const app = express();

// Necessário atrás de um proxy (Vercel, Render, etc.) para o Express reconhecer
// corretamente conexões HTTPS e o cookie "secure" funcionar.
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie-session guarda os dados da sessão (usuarioId, cargo) num cookie assinado
// no próprio navegador — diferente do express-session, não depende de memória do
// processo, então funciona igual em ambientes serverless (cada requisição pode
// rodar numa instância/processo diferente da anterior).
app.use(
  cookieSession({
    name: 'sessao',
    secret: process.env.SESSION_SECRET || 'troque-este-segredo-em-producao',
    maxAge: 1000 * 60 * 60 * 8, // 8 horas
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
);

// Serve o frontend estático (páginas em frontend/pages, assets em frontend/assets, etc.).
// Usa process.cwd() em vez de __dirname porque, em ambientes serverless (Vercel),
// o diretório de execução da função nem sempre preserva a mesma estrutura relativa
// de pastas do projeto — process.cwd() aponta pra raiz do projeto de forma confiável.
app.use(express.static(path.join(process.cwd(), 'frontend')));

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

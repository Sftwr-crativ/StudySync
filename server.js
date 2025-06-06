const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const methodOverride = require('method-override');
const router = require('./routes/index');
const { addUserToViews } = require('./middleware/auth');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração de sessões
app.use(session({
  secret: process.env.SESSION_SECRET || 'studysync-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true apenas em HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Suporte para PUT e DELETE via formulários
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/view', express.static(path.join(__dirname, 'view')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Middleware para adicionar usuário às views
app.use(addUserToViews);

// Rotas
app.use(router);

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
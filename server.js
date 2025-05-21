const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const router = require('./routes/index');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/view', express.static(path.join(__dirname, 'view')));
app.use(router);

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
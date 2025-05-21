const express = require('express');
const router = express.Router();
const TarefaController = require('../controllers/TarefaController');

// Formulário HTML
router.get('/', (req, res) =>
  res.sendFile('index.html', { root: './view' })
);

// Rotas CRUD (form e REST)
router.post('/tarefas', TarefaController.criarTarefa);
router.get('/tarefas', TarefaController.listarTarefas);
router.put('/tarefas/:id', TarefaController.editarTarefa);
router.delete('/tarefas/:id', TarefaController.excluirTarefa);

// API JSON
router.get('/api/tasks', TarefaController.list);
router.post('/api/tasks', TarefaController.create);

module.exports = router;
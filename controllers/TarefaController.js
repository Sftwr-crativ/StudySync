const TaskModel = require('../models/task');

module.exports = {
  // Renderiza via form POST
  async criarTarefa(req, res) {
    const { title, due_date } = req.body;
    try {
      await TaskModel.create({ group_id: 1, user_id: 1, title, due_date });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao criar tarefa');
    }
  },

  // Listar tarefas (JSON) para <ul>
  async listarTarefas(req, res) {
    try {
      const tasks = await TaskModel.getAll();
      res.json(tasks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // CRUD completo via REST:
  async list(req, res) { 
    // Copie o conteúdo de listarTarefas aqui, ou chame diretamente a função exportada
    try {
      const tasks = await TaskModel.getAll();
      res.json(tasks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    const { group_id, user_id, title, due_date } = req.body;
    try {
      const t = await TaskModel.create({ group_id, user_id, title, due_date });
      res.status(201).json(t);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async editarTarefa(req, res) {
    const id = parseInt(req.params.id);
    try {
      const t = await TaskModel.update(id, req.body);
      res.json(t);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao editar tarefa');
    }
  },

  async excluirTarefa(req, res) {
    const id = parseInt(req.params.id);
    try {
      await TaskModel.delete(id);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao excluir tarefa');
    }
  }
};
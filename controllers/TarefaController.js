const TaskModel = require('../models/task');
const GroupModel = require('../models/group');
const { validationResult } = require('express-validator');

module.exports = {
  // Renderizar página de listagem de tarefas
  async renderTasks(req, res) {
    try {
      const userId = req.session.userId;
      const tasks = await TaskModel.getUserTasks(userId);
      const stats = await TaskModel.getUserStats(userId);
      const upcomingTasks = await TaskModel.getUpcomingTasks(userId, 7);
      const overdueTasks = await TaskModel.getOverdueTasks(userId);

      res.render('tasks/index', {
        title: 'Minhas Tarefas - StudySync',
        tasks: tasks,
        stats: stats,
        upcomingTasks: upcomingTasks,
        overdueTasks: overdueTasks,
        user: req.session.user
      });
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      res.render('tasks/index', {
        title: 'Minhas Tarefas - StudySync',
        tasks: [],
        stats: { total: 0, todo: 0, doing: 0, done: 0 },
        upcomingTasks: [],
        overdueTasks: [],
        user: req.session.user,
        error: 'Erro ao carregar tarefas'
      });
    }
  },

  // Renderizar página de criação de tarefa
  async renderCreateTask(req, res) {
    try {
      const userId = req.session.userId;
      const groups = await GroupModel.getUserGroups(userId);
      const groupId = req.query.group || null;

      res.render('tasks/create', {
        title: 'Criar Tarefa - StudySync',
        groups: groups,
        selectedGroupId: groupId,
        user: req.session.user,
        errors: [],
        formData: {}
      });
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      res.render('tasks/create', {
        title: 'Criar Tarefa - StudySync',
        groups: [],
        selectedGroupId: null,
        user: req.session.user,
        errors: [{ msg: 'Erro ao carregar grupos' }],
        formData: {}
      });
    }
  },

  // Processar criação de tarefa
  async createTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const userId = req.session.userId;
        const groups = await GroupModel.getUserGroups(userId);

        return res.render('tasks/create', {
          title: 'Criar Tarefa - StudySync',
          groups: groups,
          selectedGroupId: req.body.group_id,
          user: req.session.user,
          errors: errors.array(),
          formData: req.body
        });
      }

      const { group_id, title, description, due_date, assigned_user_id } = req.body;
      const userId = req.session.userId;

      // Verificar se o usuário tem permissão para criar tarefas no grupo
      const group = await GroupModel.getById(parseInt(group_id), userId);
      if (!group || !group.is_member) {
        throw new Error('Você não tem permissão para criar tarefas neste grupo');
      }

      const task = await TaskModel.create({
        group_id: parseInt(group_id),
        user_id: (assigned_user_id && assigned_user_id !== '') ? parseInt(assigned_user_id) : userId,
        title,
        description,
        due_date
      });

      res.redirect(`/tasks/${task.id}`);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      const userId = req.session.userId;
      const groups = await GroupModel.getUserGroups(userId);

      res.render('tasks/create', {
        title: 'Criar Tarefa - StudySync',
        groups: groups,
        selectedGroupId: req.body.group_id,
        user: req.session.user,
        errors: [{ msg: error.message || 'Erro interno do servidor' }],
        formData: req.body
      });
    }
  },

  // Renderizar página de detalhes da tarefa
  async renderTaskDetails(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.session.userId;

      const task = await TaskModel.getById(taskId, userId);

      if (!task) {
        return res.status(404).render('error', {
          title: 'Tarefa não encontrada - StudySync',
          message: 'A tarefa solicitada não foi encontrada.',
          user: req.session.user
        });
      }

      res.render('tasks/details', {
        title: `${task.title} - StudySync`,
        task: task,
        user: req.session.user
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes da tarefa:', error);
      if (error.message === 'Acesso negado') {
        return res.status(403).render('error', {
          title: 'Acesso negado - StudySync',
          message: 'Você não tem permissão para acessar esta tarefa.',
          user: req.session.user
        });
      }

      res.status(500).render('error', {
        title: 'Erro - StudySync',
        message: 'Erro interno do servidor.',
        user: req.session.user
      });
    }
  },

  // Renderizar página de edição da tarefa
  async renderEditTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.session.userId;

      const task = await TaskModel.getById(taskId, userId);

      if (!task) {
        return res.status(404).render('error', {
          title: 'Tarefa não encontrada - StudySync',
          message: 'A tarefa solicitada não foi encontrada.',
          user: req.session.user
        });
      }

      // Verificar se pode editar
      if (task.user_id !== userId) {
        // Verificar se é admin do grupo
        const group = await GroupModel.getById(task.group_id, userId);
        if (!group || (group.created_by !== userId && group.user_role !== 'admin')) {
          return res.status(403).render('error', {
            title: 'Acesso negado - StudySync',
            message: 'Você não tem permissão para editar esta tarefa.',
            user: req.session.user
          });
        }
      }

      const groups = await GroupModel.getUserGroups(userId);

      res.render('tasks/edit', {
        title: `Editar ${task.title} - StudySync`,
        task: task,
        groups: groups,
        user: req.session.user,
        errors: [],
        formData: task
      });
    } catch (error) {
      console.error('Erro ao buscar tarefa para edição:', error);
      res.status(500).render('error', {
        title: 'Erro - StudySync',
        message: 'Erro interno do servidor.',
        user: req.session.user
      });
    }
  },

  // Processar edição da tarefa
  async updateTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.session.userId;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const task = await TaskModel.getById(taskId, userId);
        const groups = await GroupModel.getUserGroups(userId);

        return res.render('tasks/edit', {
          title: `Editar ${task.title} - StudySync`,
          task: task,
          groups: groups,
          user: req.session.user,
          errors: errors.array(),
          formData: req.body
        });
      }

      const { title, description, due_date, status } = req.body;
      await TaskModel.update(taskId, { title, description, due_date, status }, userId);

      res.redirect(`/tasks/${taskId}`);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      const task = await TaskModel.getById(parseInt(req.params.id), req.session.userId);
      const groups = await GroupModel.getUserGroups(req.session.userId);

      res.render('tasks/edit', {
        title: `Editar ${task.title} - StudySync`,
        task: task,
        groups: groups,
        user: req.session.user,
        errors: [{ msg: error.message || 'Erro interno do servidor' }],
        formData: req.body
      });
    }
  },

  // Deletar tarefa
  async deleteTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.session.userId;

      await TaskModel.delete(taskId, userId);
      res.redirect('/tasks');
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
  },

  // Atualizar status da tarefa (AJAX)
  async updateTaskStatus(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.session.userId;

      // Validar status
      const validStatuses = ['to-do', 'doing', 'done'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status inválido. Use: to-do, doing ou done' });
      }

      const task = await TaskModel.update(taskId, { status }, userId);
      res.json(task);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
  },

  // API REST para tarefas
  async getAllTasks(req, res) {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const tasks = await TaskModel.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async getTaskById(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.session?.userId;

      const task = await TaskModel.getById(taskId, userId);

      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      res.json(task);
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      if (error.message === 'Acesso negado') {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async createTaskAPI(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { group_id, title, description, due_date, assigned_user_id } = req.body;
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const task = await TaskModel.create({
        group_id: parseInt(group_id),
        user_id: (assigned_user_id && assigned_user_id !== '') ? parseInt(assigned_user_id) : userId,
        title,
        description,
        due_date
      });

      res.status(201).json(task);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async updateTaskAPI(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.session?.userId;
      const updates = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const task = await TaskModel.update(taskId, updates, userId);
      res.json(task);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
  },

  async deleteTaskAPI(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      await TaskModel.delete(taskId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
  },

  // Métodos legados para compatibilidade
  async criarTarefa(req, res) {
    return this.createTask(req, res);
  },

  async listarTarefas(req, res) {
    return this.getAllTasks(req, res);
  },

  async list(req, res) {
    return this.getAllTasks(req, res);
  },

  async create(req, res) {
    return this.createTaskAPI(req, res);
  },

  async editarTarefa(req, res) {
    return this.updateTaskAPI(req, res);
  },

  async excluirTarefa(req, res) {
    return this.deleteTaskAPI(req, res);
  }
};
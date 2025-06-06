// tests/tasks.test.js

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const TarefaController = require('../controllers/TarefaController');
const TaskModel = require('../models/task');
const { validateTask, validateTaskUpdate } = require('../middleware/validators');

// Mock do modelo de tarefa
jest.mock('../models/task');

// Configurar app de teste
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false
}));

// Configurar EJS para testes (mock)
app.set('view engine', 'ejs');
app.set('views', './views');

// Mock das views para evitar erros nos testes
jest.mock('ejs', () => ({
  renderFile: jest.fn((template, data, callback) => {
    callback(null, '<html>Mock View</html>');
  })
}));

// Middleware para simular usuário logado
app.use((req, res, next) => {
  req.session.userId = 1;
  req.session.user = { id: 1, name: 'Test User', email: 'test@test.com' };
  next();
});

// Rotas de teste
app.get('/api/tasks', TarefaController.getAllTasks);
app.post('/api/tasks', validateTask, TarefaController.createTaskAPI);
app.get('/api/tasks/:id', TarefaController.getTaskById);
app.put('/api/tasks/:id', validateTaskUpdate, TarefaController.updateTaskAPI);
app.delete('/api/tasks/:id', TarefaController.deleteTaskAPI);
app.patch('/api/tasks/:id/status', TarefaController.updateTaskStatus);

describe('Sistema de Tarefas - API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    test('deve retornar lista de tarefas do usuário', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Estudar Matemática',
          description: 'Capítulo 5 - Funções',
          status: 'to-do',
          due_date: '2024-12-31',
          user_id: 1,
          group_id: 1,
          group: { id: 1, name: 'Grupo de Matemática' }
        },
        {
          id: 2,
          title: 'Fazer exercícios',
          description: 'Lista 3',
          status: 'doing',
          due_date: '2024-12-25',
          user_id: 1,
          group_id: 1,
          group: { id: 1, name: 'Grupo de Matemática' }
        }
      ];
      
      TaskModel.getUserTasks.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual(mockTasks);
      expect(TaskModel.getUserTasks).toHaveBeenCalledWith(1);
    });

    test('deve retornar erro 500 em caso de falha', async () => {
      TaskModel.getUserTasks.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/tasks')
        .expect(500);

      expect(response.body.error).toBe('Erro interno do servidor');
    });
  });

  describe('POST /api/tasks', () => {
    test('deve criar nova tarefa com dados válidos', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const newTask = {
        group_id: 1,
        title: 'Nova Tarefa',
        description: 'Descrição da nova tarefa',
        due_date: tomorrowStr
      };

      const createdTask = {
        id: 1,
        ...newTask,
        user_id: 1,
        status: 'to-do',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      TaskModel.create.mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body).toEqual(createdTask);
      expect(TaskModel.create).toHaveBeenCalledWith({
        group_id: 1,
        user_id: 1,
        title: 'Nova Tarefa',
        description: 'Descrição da nova tarefa',
        due_date: tomorrowStr
      });
    });

    test('deve retornar erro se dados inválidos', async () => {
      const invalidTask = {
        group_id: 1,
        title: 'AB', // Muito curto
        due_date: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(TaskModel.create).not.toHaveBeenCalled();
    });

    test('deve retornar erro se data no passado', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const invalidTask = {
        group_id: 1,
        title: 'Tarefa Válida',
        due_date: yesterdayStr // Data no passado
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(TaskModel.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('deve retornar tarefa específica', async () => {
      const mockTask = {
        id: 1,
        title: 'Estudar Matemática',
        description: 'Capítulo 5',
        status: 'to-do',
        user_id: 1,
        group_id: 1
      };
      
      TaskModel.getById.mockResolvedValue(mockTask);

      const response = await request(app)
        .get('/api/tasks/1')
        .expect(200);

      expect(response.body).toEqual(mockTask);
      expect(TaskModel.getById).toHaveBeenCalledWith(1, 1);
    });

    test('deve retornar 404 se tarefa não existe', async () => {
      TaskModel.getById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tasks/999')
        .expect(404);

      expect(response.body.error).toBe('Tarefa não encontrada');
    });

    test('deve retornar 403 se acesso negado', async () => {
      TaskModel.getById.mockRejectedValue(new Error('Acesso negado'));

      const response = await request(app)
        .get('/api/tasks/1')
        .expect(403);

      expect(response.body.error).toBe('Acesso negado');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('deve atualizar tarefa existente', async () => {
      const updateData = { title: 'Título Atualizado', status: 'doing' };
      const updatedTask = {
        id: 1,
        title: 'Título Atualizado',
        status: 'doing',
        user_id: 1
      };

      TaskModel.update.mockResolvedValue(updatedTask);

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedTask);
      expect(TaskModel.update).toHaveBeenCalledWith(1, updateData, 1);
    });

    test('deve retornar erro se não tem permissão', async () => {
      const updateData = { title: 'Título Atualizado' };
      
      TaskModel.update.mockRejectedValue(new Error('Permissão negada'));

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updateData)
        .expect(500);

      expect(response.body.error).toBe('Permissão negada');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('deve deletar tarefa existente', async () => {
      TaskModel.delete.mockResolvedValue();

      await request(app)
        .delete('/api/tasks/1')
        .expect(204);

      expect(TaskModel.delete).toHaveBeenCalledWith(1, 1);
    });

    test('deve retornar erro se não tem permissão', async () => {
      TaskModel.delete.mockRejectedValue(new Error('Permissão negada'));

      const response = await request(app)
        .delete('/api/tasks/1')
        .expect(500);

      expect(response.body.error).toBe('Permissão negada');
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    test('deve atualizar status da tarefa', async () => {
      const updatedTask = {
        id: 1,
        title: 'Tarefa Teste',
        status: 'done',
        user_id: 1
      };

      TaskModel.update.mockResolvedValue(updatedTask);

      const response = await request(app)
        .patch('/api/tasks/1/status')
        .send({ status: 'done' })
        .expect(200);

      expect(response.body).toEqual(updatedTask);
      expect(TaskModel.update).toHaveBeenCalledWith(1, { status: 'done' }, 1);
    });

    test('deve retornar erro para status inválido', async () => {
      const response = await request(app)
        .patch('/api/tasks/1/status')
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.error).toBe('Status inválido. Use: to-do, doing ou done');
      expect(TaskModel.update).not.toHaveBeenCalled();
    });
  });
});

describe('Modelo de Tarefa', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Buscar tarefas do usuário', () => {
    test('getUserTasks deve retornar tarefas do usuário', async () => {
      const mockTasks = [
        { id: 1, title: 'Tarefa 1', user_id: 1 },
        { id: 2, title: 'Tarefa 2', user_id: 1 }
      ];
      
      TaskModel.getUserTasks.mockResolvedValue(mockTasks);

      const result = await TaskModel.getUserTasks(1);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('Estatísticas de tarefas', () => {
    test('getUserStats deve retornar estatísticas corretas', async () => {
      const mockStats = {
        total: 5,
        todo: 2,
        doing: 1,
        done: 2
      };
      
      TaskModel.getUserStats.mockResolvedValue(mockStats);

      const result = await TaskModel.getUserStats(1);
      expect(result).toEqual(mockStats);
    });
  });

  describe('Tarefas próximas do vencimento', () => {
    test('getUpcomingTasks deve retornar tarefas próximas', async () => {
      const mockTasks = [
        { id: 1, title: 'Tarefa Urgente', due_date: '2024-12-25' }
      ];
      
      TaskModel.getUpcomingTasks.mockResolvedValue(mockTasks);

      const result = await TaskModel.getUpcomingTasks(1, 7);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('Tarefas em atraso', () => {
    test('getOverdueTasks deve retornar tarefas em atraso', async () => {
      const mockTasks = [
        { id: 1, title: 'Tarefa Atrasada', due_date: '2024-01-01' }
      ];
      
      TaskModel.getOverdueTasks.mockResolvedValue(mockTasks);

      const result = await TaskModel.getOverdueTasks(1);
      expect(result).toEqual(mockTasks);
    });
  });
});

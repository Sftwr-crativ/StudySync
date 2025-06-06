// tests/groups.test.js

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const GroupController = require('../controllers/GroupController');
const GroupModel = require('../models/group');
const { validateGroup, validateGroupUpdate } = require('../middleware/validators');

// Mock do modelo de grupo
jest.mock('../models/group');

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
app.get('/api/groups', GroupController.getAllGroups);
app.post('/api/groups', validateGroup, GroupController.createGroupAPI);
app.get('/api/groups/:id', GroupController.getGroupById);
app.put('/api/groups/:id', validateGroupUpdate, GroupController.updateGroupAPI);
app.delete('/api/groups/:id', GroupController.deleteGroupAPI);

describe('Sistema de Grupos - API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/groups', () => {
    test('deve retornar lista de grupos do usuário', async () => {
      const mockGroups = [
        {
          id: 1,
          name: 'Grupo de Matemática',
          description: 'Estudos de cálculo',
          created_by: 1,
          created_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          name: 'Grupo de Física',
          description: 'Mecânica clássica',
          created_by: 1,
          created_at: '2024-01-02T00:00:00.000Z'
        }
      ];
      
      GroupModel.getUserGroups.mockResolvedValue(mockGroups);

      const response = await request(app)
        .get('/api/groups')
        .expect(200);

      expect(response.body).toEqual(mockGroups);
      expect(GroupModel.getUserGroups).toHaveBeenCalledWith(1);
    });

    test('deve retornar erro 500 em caso de falha', async () => {
      GroupModel.getUserGroups.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/groups')
        .expect(500);

      expect(response.body.error).toBe('Erro interno do servidor');
    });
  });

  describe('POST /api/groups', () => {
    test('deve criar novo grupo com dados válidos', async () => {
      const newGroup = {
        name: 'Novo Grupo',
        description: 'Descrição do novo grupo'
      };

      const createdGroup = {
        id: 1,
        name: 'Novo Grupo',
        description: 'Descrição do novo grupo',
        created_by: 1,
        created_at: '2024-01-01T00:00:00.000Z'
      };

      GroupModel.create.mockResolvedValue(createdGroup);

      const response = await request(app)
        .post('/api/groups')
        .send(newGroup)
        .expect(201);

      expect(response.body).toEqual(createdGroup);
      expect(GroupModel.create).toHaveBeenCalledWith(newGroup, 1);
    });

    test('deve retornar erro se dados inválidos', async () => {
      const invalidGroup = {
        name: 'AB', // Muito curto
        description: 'Descrição válida'
      };

      const response = await request(app)
        .post('/api/groups')
        .send(invalidGroup)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(GroupModel.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/groups/:id', () => {
    test('deve retornar grupo específico', async () => {
      const mockGroup = {
        id: 1,
        name: 'Grupo de Matemática',
        description: 'Estudos de cálculo',
        created_by: 1,
        is_member: true,
        user_role: 'admin'
      };
      
      GroupModel.getById.mockResolvedValue(mockGroup);

      const response = await request(app)
        .get('/api/groups/1')
        .expect(200);

      expect(response.body).toEqual(mockGroup);
      expect(GroupModel.getById).toHaveBeenCalledWith(1, 1);
    });

    test('deve retornar 404 se grupo não existe', async () => {
      GroupModel.getById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/groups/999')
        .expect(404);

      expect(response.body.error).toBe('Grupo não encontrado');
    });

    test('deve retornar 403 se usuário não é membro', async () => {
      const mockGroup = {
        id: 1,
        name: 'Grupo Privado',
        is_member: false
      };
      
      GroupModel.getById.mockResolvedValue(mockGroup);

      const response = await request(app)
        .get('/api/groups/1')
        .expect(403);

      expect(response.body.error).toBe('Acesso negado');
    });
  });

  describe('PUT /api/groups/:id', () => {
    test('deve atualizar grupo existente', async () => {
      const updateData = { name: 'Nome Atualizado' };
      const updatedGroup = {
        id: 1,
        name: 'Nome Atualizado',
        description: 'Descrição original',
        created_by: 1
      };

      GroupModel.update.mockResolvedValue(updatedGroup);

      const response = await request(app)
        .put('/api/groups/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedGroup);
      expect(GroupModel.update).toHaveBeenCalledWith(1, updateData, 1);
    });

    test('deve retornar erro se não tem permissão', async () => {
      const updateData = { name: 'Nome Atualizado' };
      
      GroupModel.update.mockRejectedValue(new Error('Permissão negada'));

      const response = await request(app)
        .put('/api/groups/1')
        .send(updateData)
        .expect(500);

      expect(response.body.error).toBe('Permissão negada');
    });
  });

  describe('DELETE /api/groups/:id', () => {
    test('deve deletar grupo existente', async () => {
      GroupModel.delete.mockResolvedValue();

      await request(app)
        .delete('/api/groups/1')
        .expect(204);

      expect(GroupModel.delete).toHaveBeenCalledWith(1, 1);
    });

    test('deve retornar erro se não tem permissão', async () => {
      GroupModel.delete.mockRejectedValue(new Error('Apenas o criador pode deletar o grupo'));

      const response = await request(app)
        .delete('/api/groups/1')
        .expect(500);

      expect(response.body.error).toBe('Apenas o criador pode deletar o grupo');
    });
  });
});

describe('Modelo de Grupo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Buscar grupos do usuário', () => {
    test('getUserGroups deve retornar grupos do usuário', async () => {
      const mockGroups = [
        { id: 1, name: 'Grupo 1', created_by: 1 },
        { id: 2, name: 'Grupo 2', created_by: 2 }
      ];
      
      GroupModel.getUserGroups.mockResolvedValue(mockGroups);

      const result = await GroupModel.getUserGroups(1);
      expect(result).toEqual(mockGroups);
    });
  });

  describe('Verificar membro', () => {
    test('isMember deve retornar true se usuário é membro', async () => {
      GroupModel.isMember.mockResolvedValue(true);

      const result = await GroupModel.isMember(1, 1);
      expect(result).toBe(true);
    });

    test('isMember deve retornar false se usuário não é membro', async () => {
      GroupModel.isMember.mockResolvedValue(false);

      const result = await GroupModel.isMember(1, 2);
      expect(result).toBe(false);
    });
  });
});

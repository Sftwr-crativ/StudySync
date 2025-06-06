// tests/auth.test.js

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const UserController = require('../controllers/UserController');
const UserModel = require('../models/user');

// Mock do modelo de usuário
jest.mock('../models/user');

// Configurar app de teste
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Rotas de teste
app.get('/api/users', UserController.getAllUsers);
app.post('/api/users', UserController.createUser);
app.get('/api/users/:id', UserController.getUserById);
app.put('/api/users/:id', UserController.updateUser);
app.delete('/api/users/:id', UserController.deleteUser);

describe('Sistema de Autenticação - API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    test('deve retornar lista de usuários', async () => {
      const mockUsers = [
        { id: 1, name: 'João Silva', email: 'joao@test.com', created_at: '2024-01-01T00:00:00.000Z' },
        { id: 2, name: 'Maria Santos', email: 'maria@test.com', created_at: '2024-01-01T00:00:00.000Z' }
      ];

      UserModel.getAll.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(UserModel.getAll).toHaveBeenCalledTimes(1);
    });

    test('deve retornar erro 500 em caso de falha', async () => {
      UserModel.getAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users')
        .expect(500);

      expect(response.body.error).toBe('Erro interno do servidor');
    });
  });

  describe('POST /api/users', () => {
    test('deve criar novo usuário com dados válidos', async () => {
      const newUser = {
        name: 'Teste User',
        email: 'teste@test.com',
        password: 'Test123!'
      };

      const createdUser = {
        id: 1,
        name: 'Teste User',
        email: 'teste@test.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      UserModel.emailExists.mockResolvedValue(false);
      UserModel.create.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toEqual(createdUser);
      expect(UserModel.emailExists).toHaveBeenCalledWith('teste@test.com');
      expect(UserModel.create).toHaveBeenCalledWith(newUser);
    });

    test('deve retornar erro se email já existe', async () => {
      const newUser = {
        name: 'Teste User',
        email: 'existe@test.com',
        password: 'Test123!'
      };

      UserModel.emailExists.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(400);

      expect(response.body.error).toBe('Este email já está cadastrado');
      expect(UserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/users/:id', () => {
    test('deve retornar usuário específico', async () => {
      const mockUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };
      
      UserModel.getById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(UserModel.getById).toHaveBeenCalledWith(1);
    });

    test('deve retornar 404 se usuário não existe', async () => {
      UserModel.getById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });
  });

  describe('PUT /api/users/:id', () => {
    test('deve atualizar usuário existente', async () => {
      const existingUser = { 
        id: 1, 
        name: 'João Silva', 
        email: 'joao@test.com' 
      };
      
      const updatedUser = {
        id: 1,
        name: 'João Santos',
        email: 'joao@test.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      const updateData = { name: 'João Santos' };

      UserModel.getById.mockResolvedValue(existingUser);
      UserModel.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/users/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedUser);
      expect(UserModel.update).toHaveBeenCalledWith(1, updateData);
    });

    test('deve retornar 404 se usuário não existe', async () => {
      UserModel.getById.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/users/999')
        .send({ name: 'Novo Nome' })
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('deve deletar usuário existente', async () => {
      const existingUser = { 
        id: 1, 
        name: 'João Silva', 
        email: 'joao@test.com' 
      };

      UserModel.getById.mockResolvedValue(existingUser);
      UserModel.delete.mockResolvedValue();

      await request(app)
        .delete('/api/users/1')
        .expect(204);

      expect(UserModel.delete).toHaveBeenCalledWith(1);
    });

    test('deve retornar 404 se usuário não existe', async () => {
      UserModel.getById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/users/999')
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });
  });
});

describe('Modelo de Usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validação de Senha', () => {
    test('validatePassword deve retornar true para senha correta', async () => {
      const plainPassword = 'Test123!';
      const hashedPassword = '$2a$10$hashedpassword';
      
      UserModel.validatePassword.mockResolvedValue(true);

      const result = await UserModel.validatePassword(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    test('validatePassword deve retornar false para senha incorreta', async () => {
      const plainPassword = 'WrongPassword';
      const hashedPassword = '$2a$10$hashedpassword';
      
      UserModel.validatePassword.mockResolvedValue(false);

      const result = await UserModel.validatePassword(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('Verificação de Email', () => {
    test('emailExists deve retornar true se email existe', async () => {
      UserModel.emailExists.mockResolvedValue(true);

      const result = await UserModel.emailExists('existe@test.com');
      expect(result).toBe(true);
    });

    test('emailExists deve retornar false se email não existe', async () => {
      UserModel.emailExists.mockResolvedValue(false);

      const result = await UserModel.emailExists('naoexiste@test.com');
      expect(result).toBe(false);
    });
  });
});

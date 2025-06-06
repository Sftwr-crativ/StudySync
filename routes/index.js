const express = require('express');
const router = express.Router();
const TarefaController = require('../controllers/TarefaController');
const UserController = require('../controllers/UserController');
const GroupController = require('../controllers/GroupController');
const { requireAuth, requireGuest } = require('../middleware/auth');
const { validateRegister, validateLogin, validateUserAPI, validateUserUpdate, validateGroup, validateGroupUpdate, validateTask, validateTaskUpdate } = require('../middleware/validators');

// Página inicial - redireciona baseado na autenticação
router.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Rotas de autenticação (apenas para usuários não logados)
router.get('/register', requireGuest, UserController.renderRegister);
router.post('/register', requireGuest, validateRegister, UserController.register);
router.get('/login', requireGuest, UserController.renderLogin);
router.post('/login', requireGuest, validateLogin, UserController.login);

// Rota de logout (apenas para usuários logados)
router.post('/logout', requireAuth, UserController.logout);

// Dashboard (apenas para usuários logados)
router.get('/dashboard', requireAuth, UserController.renderDashboard);

// Rotas de grupos (protegidas) - rotas específicas primeiro
router.get('/groups', requireAuth, GroupController.renderGroups);
router.get('/groups/create', requireAuth, GroupController.renderCreateGroup);
router.post('/groups', requireAuth, validateGroup, GroupController.createGroup);
router.get('/groups/:id/edit', requireAuth, GroupController.renderEditGroup);
router.put('/groups/:id', requireAuth, validateGroupUpdate, GroupController.updateGroup);
router.delete('/groups/:id', requireAuth, GroupController.deleteGroup);
router.post('/groups/:id/leave', requireAuth, GroupController.leaveGroup);
router.get('/groups/:id', requireAuth, GroupController.renderGroupDetails);

// Rotas de tarefas (protegidas) - rotas específicas primeiro
router.get('/tasks', requireAuth, TarefaController.renderTasks);
router.get('/tasks/create', requireAuth, TarefaController.renderCreateTask);
router.post('/tasks', requireAuth, validateTask, TarefaController.createTask);
router.get('/tasks/:id/edit', requireAuth, TarefaController.renderEditTask);
router.put('/tasks/:id', requireAuth, validateTaskUpdate, TarefaController.updateTask);
router.delete('/tasks/:id', requireAuth, TarefaController.deleteTask);
router.patch('/tasks/:id/status', requireAuth, TarefaController.updateTaskStatus);
router.get('/tasks/:id', requireAuth, TarefaController.renderTaskDetails);

// Rotas legadas de tarefas (para compatibilidade)
router.post('/tarefas', requireAuth, TarefaController.criarTarefa);
router.get('/tarefas', requireAuth, TarefaController.listarTarefas);
router.put('/tarefas/:id', requireAuth, TarefaController.editarTarefa);
router.delete('/tarefas/:id', requireAuth, TarefaController.excluirTarefa);

// APIs REST
// API de usuários
router.get('/api/users', UserController.getAllUsers);
router.get('/api/users/:id', UserController.getUserById);
router.post('/api/users', validateUserAPI, UserController.createUser);
router.put('/api/users/:id', validateUserUpdate, UserController.updateUser);
router.delete('/api/users/:id', UserController.deleteUser);

// API de grupos
router.get('/api/groups', GroupController.getAllGroups);
router.get('/api/groups/:id', GroupController.getGroupById);
router.post('/api/groups', validateGroup, GroupController.createGroupAPI);
router.put('/api/groups/:id', validateGroupUpdate, GroupController.updateGroupAPI);
router.delete('/api/groups/:id', GroupController.deleteGroupAPI);

// API de tarefas
router.get('/api/tasks', TarefaController.getAllTasks);
router.get('/api/tasks/:id', TarefaController.getTaskById);
router.post('/api/tasks', validateTask, TarefaController.createTaskAPI);
router.put('/api/tasks/:id', validateTaskUpdate, TarefaController.updateTaskAPI);
router.delete('/api/tasks/:id', TarefaController.deleteTaskAPI);

module.exports = router;
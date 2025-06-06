const UserModel = require('../models/user');
const { validationResult } = require('express-validator');

module.exports = {
  // Renderizar página de registro
  renderRegister(req, res) {
    res.render('auth/register', { 
      title: 'Cadastro - StudySync',
      errors: [],
      formData: {}
    });
  },

  // Renderizar página de login
  renderLogin(req, res) {
    res.render('auth/login', { 
      title: 'Login - StudySync',
      errors: [],
      message: req.query.message || null
    });
  },

  // Processar registro de usuário
  async register(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('auth/register', {
          title: 'Cadastro - StudySync',
          errors: errors.array(),
          formData: req.body
        });
      }

      const { name, email, password } = req.body;

      // Verificar se email já existe
      const emailExists = await UserModel.emailExists(email);
      if (emailExists) {
        return res.render('auth/register', {
          title: 'Cadastro - StudySync',
          errors: [{ msg: 'Este email já está cadastrado' }],
          formData: req.body
        });
      }

      // Criar usuário
      const user = await UserModel.create({ name, email, password });
      
      // Fazer login automático após registro
      req.session.userId = user.id;
      req.session.user = user;
      
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Erro no registro:', error);
      res.render('auth/register', {
        title: 'Cadastro - StudySync',
        errors: [{ msg: 'Erro interno do servidor' }],
        formData: req.body
      });
    }
  },

  // Processar login
  async login(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('auth/login', {
          title: 'Login - StudySync',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuário por email
      const user = await UserModel.getByEmail(email);
      if (!user) {
        return res.render('auth/login', {
          title: 'Login - StudySync',
          errors: [{ msg: 'Email ou senha incorretos' }]
        });
      }

      // Validar senha
      const isValidPassword = await UserModel.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.render('auth/login', {
          title: 'Login - StudySync',
          errors: [{ msg: 'Email ou senha incorretos' }]
        });
      }

      // Criar sessão
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      res.redirect('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      res.render('auth/login', {
        title: 'Login - StudySync',
        errors: [{ msg: 'Erro interno do servidor' }]
      });
    }
  },

  // Logout
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao fazer logout:', err);
        return res.redirect('/dashboard');
      }
      res.redirect('/login?message=Logout realizado com sucesso');
    });
  },

  // Dashboard (página inicial após login)
  renderDashboard(req, res) {
    res.render('dashboard', {
      title: 'Dashboard - StudySync',
      user: req.session.user
    });
  },

  // API REST para usuários
  async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.getById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Verificar se email já existe
      const emailExists = await UserModel.emailExists(email);
      if (emailExists) {
        return res.status(400).json({ error: 'Este email já está cadastrado' });
      }

      const user = await UserModel.create({ name, email, password });
      res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Verificar se o usuário existe
      const existingUser = await UserModel.getById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Se está atualizando email, verificar se já existe
      if (updates.email && updates.email !== existingUser.email) {
        const emailExists = await UserModel.emailExists(updates.email);
        if (emailExists) {
          return res.status(400).json({ error: 'Este email já está cadastrado' });
        }
      }

      const user = await UserModel.update(parseInt(id), updates);
      res.json(user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o usuário existe
      const existingUser = await UserModel.getById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await UserModel.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

const GroupModel = require('../models/group');
const UserModel = require('../models/user');
const { validationResult } = require('express-validator');

module.exports = {
  // Renderizar página de listagem de grupos
  async renderGroups(req, res) {
    try {
      const userId = req.session.userId;
      const groups = await GroupModel.getUserGroups(userId);
      
      res.render('groups/index', {
        title: 'Meus Grupos - StudySync',
        groups: groups,
        user: req.session.user
      });
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      res.render('groups/index', {
        title: 'Meus Grupos - StudySync',
        groups: [],
        user: req.session.user,
        error: 'Erro ao carregar grupos'
      });
    }
  },

  // Renderizar página de criação de grupo
  renderCreateGroup(req, res) {
    try {
      console.log('Renderizando página de criação de grupo para usuário:', req.session.user?.name);
      res.render('groups/create', {
        title: 'Criar Grupo - StudySync',
        user: req.session.user,
        errors: [],
        formData: {}
      });
    } catch (error) {
      console.error('Erro ao renderizar página de criação:', error);
      res.status(500).send('Erro interno do servidor');
    }
  },

  // Processar criação de grupo
  async createGroup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('groups/create', {
          title: 'Criar Grupo - StudySync',
          user: req.session.user,
          errors: errors.array(),
          formData: req.body
        });
      }

      const { name, description } = req.body;
      const userId = req.session.userId;

      const group = await GroupModel.create({ name, description }, userId);
      
      res.redirect(`/groups/${group.id}`);
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      res.render('groups/create', {
        title: 'Criar Grupo - StudySync',
        user: req.session.user,
        errors: [{ msg: 'Erro interno do servidor' }],
        formData: req.body
      });
    }
  },

  // Renderizar página de detalhes do grupo
  async renderGroupDetails(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.session.userId;

      const group = await GroupModel.getById(groupId, userId);
      
      if (!group) {
        return res.status(404).render('error', {
          title: 'Grupo não encontrado - StudySync',
          message: 'O grupo solicitado não foi encontrado.',
          user: req.session.user
        });
      }

      if (!group.is_member) {
        return res.status(403).render('error', {
          title: 'Acesso negado - StudySync',
          message: 'Você não tem permissão para acessar este grupo.',
          user: req.session.user
        });
      }

      const stats = await GroupModel.getGroupStats(groupId);

      res.render('groups/details', {
        title: `${group.name} - StudySync`,
        group: group,
        stats: stats,
        user: req.session.user
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes do grupo:', error);
      res.status(500).render('error', {
        title: 'Erro - StudySync',
        message: 'Erro interno do servidor.',
        user: req.session.user
      });
    }
  },

  // Renderizar página de edição do grupo
  async renderEditGroup(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.session.userId;

      const group = await GroupModel.getById(groupId, userId);
      
      if (!group) {
        return res.status(404).render('error', {
          title: 'Grupo não encontrado - StudySync',
          message: 'O grupo solicitado não foi encontrado.',
          user: req.session.user
        });
      }

      if (group.created_by !== userId && group.user_role !== 'admin') {
        return res.status(403).render('error', {
          title: 'Acesso negado - StudySync',
          message: 'Você não tem permissão para editar este grupo.',
          user: req.session.user
        });
      }

      res.render('groups/edit', {
        title: `Editar ${group.name} - StudySync`,
        group: group,
        user: req.session.user,
        errors: [],
        formData: group
      });
    } catch (error) {
      console.error('Erro ao buscar grupo para edição:', error);
      res.status(500).render('error', {
        title: 'Erro - StudySync',
        message: 'Erro interno do servidor.',
        user: req.session.user
      });
    }
  },

  // Processar edição do grupo
  async updateGroup(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.session.userId;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const group = await GroupModel.getById(groupId, userId);
        return res.render('groups/edit', {
          title: `Editar ${group.name} - StudySync`,
          group: group,
          user: req.session.user,
          errors: errors.array(),
          formData: req.body
        });
      }

      const { name, description } = req.body;
      await GroupModel.update(groupId, { name, description }, userId);
      
      res.redirect(`/groups/${groupId}`);
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      const group = await GroupModel.getById(parseInt(req.params.id), req.session.userId);
      res.render('groups/edit', {
        title: `Editar ${group.name} - StudySync`,
        group: group,
        user: req.session.user,
        errors: [{ msg: error.message || 'Erro interno do servidor' }],
        formData: req.body
      });
    }
  },

  // Deletar grupo
  async deleteGroup(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.session.userId;

      await GroupModel.delete(groupId, userId);
      res.redirect('/groups');
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
  },

  // Sair do grupo
  async leaveGroup(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.session.userId;

      await GroupModel.removeMember(groupId, userId, userId);
      res.redirect('/groups');
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
      res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
  },

  // API REST para grupos
  async getAllGroups(req, res) {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const groups = await GroupModel.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async getGroupById(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.session?.userId;

      const group = await GroupModel.getById(groupId, userId);
      
      if (!group) {
        return res.status(404).json({ error: 'Grupo não encontrado' });
      }

      if (userId && !group.is_member) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      res.json(group);
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async createGroupAPI(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const group = await GroupModel.create({ name, description }, userId);
      res.status(201).json(group);
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async updateGroupAPI(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.session?.userId;
      const updates = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const group = await GroupModel.update(groupId, updates, userId);
      res.json(group);
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
  },

  async deleteGroupAPI(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      await GroupModel.delete(groupId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
  }
};

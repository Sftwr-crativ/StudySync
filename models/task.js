const { supabase } = require('../config/db');

module.exports = {
  // Buscar todas as tarefas do usuário
  async getUserTasks(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        group:study_groups(id, name),
        assigned_user:users(id, name, email)
      `)
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Buscar tarefas por grupo
  async getByGroup(groupId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users(id, name, email)
      `)
      .eq('group_id', groupId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Buscar tarefas por status
  async getByStatus(userId, status) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        group:study_groups(id, name),
        assigned_user:users(id, name, email)
      `)
      .eq('user_id', userId)
      .eq('status', status)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Buscar tarefa por ID com informações detalhadas
  async getById(id, userId = null) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        group:study_groups(id, name),
        assigned_user:users(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Verificar se o usuário tem acesso à tarefa
    if (userId && data.user_id !== userId) {
      // Verificar se o usuário é membro do grupo
      const { data: membership, error: memberError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', data.group_id)
        .eq('user_id', userId)
        .single();

      if (memberError && memberError.code === 'PGRST116') {
        // Verificar se é o criador do grupo
        const { data: group, error: groupError } = await supabase
          .from('study_groups')
          .select('created_by')
          .eq('id', data.group_id)
          .single();

        if (groupError || group.created_by !== userId) {
          throw new Error('Acesso negado');
        }
      } else if (memberError) {
        throw memberError;
      }
    }

    return data;
  },

  // Criar nova tarefa
  async create(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        group_id: task.group_id,
        user_id: task.user_id,
        title: task.title,
        description: task.description || null,
        due_date: task.due_date,
        status: task.status || 'to-do'
      }])
      .select(`
        *,
        group:study_groups(id, name),
        assigned_user:users(id, name, email)
      `);

    if (error) throw error;
    if (!data || !data[0]) throw new Error('Falha ao inserir tarefa');
    return data[0];
  },

  // Atualizar tarefa
  async update(id, updates, userId = null) {
    // Se userId fornecido, verificar permissões
    if (userId) {
      const task = await this.getById(id, userId);
      if (!task) throw new Error('Tarefa não encontrada');

      // Apenas o responsável pela tarefa ou admin do grupo pode editar
      if (task.user_id !== userId) {
        const { data: membership, error: memberError } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', task.group_id)
          .eq('user_id', userId)
          .single();

        if (memberError || membership.role !== 'admin') {
          const { data: group, error: groupError } = await supabase
            .from('study_groups')
            .select('created_by')
            .eq('id', task.group_id)
            .single();

          if (groupError || group.created_by !== userId) {
            throw new Error('Permissão negada');
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        group:study_groups(id, name),
        assigned_user:users(id, name, email)
      `);

    if (error) throw error;
    return data[0];
  },

  // Deletar tarefa
  async delete(id, userId = null) {
    // Se userId fornecido, verificar permissões
    if (userId) {
      const task = await this.getById(id, userId);
      if (!task) throw new Error('Tarefa não encontrada');

      // Apenas o responsável pela tarefa ou admin do grupo pode deletar
      if (task.user_id !== userId) {
        const { data: membership, error: memberError } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', task.group_id)
          .eq('user_id', userId)
          .single();

        if (memberError || membership.role !== 'admin') {
          const { data: group, error: groupError } = await supabase
            .from('study_groups')
            .select('created_by')
            .eq('id', task.group_id)
            .single();

          if (groupError || group.created_by !== userId) {
            throw new Error('Permissão negada');
          }
        }
      }
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return;
  },

  // Buscar estatísticas de tarefas do usuário
  async getUserStats(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data.length,
      todo: data.filter(t => t.status === 'to-do').length,
      doing: data.filter(t => t.status === 'doing').length,
      done: data.filter(t => t.status === 'done').length
    };

    return stats;
  },

  // Buscar tarefas próximas do vencimento
  async getUpcomingTasks(userId, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        group:study_groups(id, name)
      `)
      .eq('user_id', userId)
      .neq('status', 'done')
      .lte('due_date', futureDate.toISOString().split('T')[0])
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Buscar tarefas em atraso
  async getOverdueTasks(userId) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        group:study_groups(id, name)
      `)
      .eq('user_id', userId)
      .neq('status', 'done')
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  }
};
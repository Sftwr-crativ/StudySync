const { supabase } = require('../config/db');

module.exports = {
  // Buscar todos os grupos do usuário (como membro ou criador)
  async getUserGroups(userId) {
    try {
      // Primeiro, buscar grupos onde o usuário é criador
      const { data: createdGroups, error: createdError } = await supabase
        .from('study_groups')
        .select(`
          *,
          creator:users!study_groups_created_by_fkey(name, email)
        `)
        .eq('created_by', userId);

      if (createdError) throw createdError;

      // Depois, buscar grupos onde o usuário é membro
      const { data: memberGroups, error: memberError } = await supabase
        .from('study_groups')
        .select(`
          *,
          group_members!inner(role, joined_at),
          creator:users!study_groups_created_by_fkey(name, email)
        `)
        .eq('group_members.user_id', userId)
        .neq('created_by', userId); // Evitar duplicatas

      if (memberError) throw memberError;

      // Combinar e ordenar os resultados
      const allGroups = [...(createdGroups || []), ...(memberGroups || [])];
      allGroups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return allGroups;
    } catch (error) {
      console.error('Erro ao buscar grupos do usuário:', error);
      throw error;
    }
  },

  // Buscar grupo por ID com informações detalhadas
  async getById(groupId, userId = null) {
    let query = supabase
      .from('study_groups')
      .select(`
        *,
        creator:users!study_groups_created_by_fkey(id, name, email),
        group_members(
          user_id,
          role,
          joined_at,
          user:users(id, name, email)
        )
      `)
      .eq('id', groupId)
      .single();

    const { data, error } = await query;
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Se userId fornecido, verificar se o usuário é membro
    if (userId) {
      const isMember = data.created_by === userId || 
                      data.group_members.some(member => member.user_id === userId);
      data.is_member = isMember;
      
      // Encontrar o papel do usuário
      if (data.created_by === userId) {
        data.user_role = 'admin';
      } else {
        const memberInfo = data.group_members.find(member => member.user_id === userId);
        data.user_role = memberInfo ? memberInfo.role : null;
      }
    }

    return data;
  },

  // Criar novo grupo
  async create(groupData, creatorId) {
    const { data, error } = await supabase
      .from('study_groups')
      .insert([{
        name: groupData.name,
        description: groupData.description,
        id_user: creatorId, // Para compatibilidade com schema atual
        created_by: creatorId
      }])
      .select()
      .single();

    if (error) throw error;

    // Adicionar o criador como admin do grupo
    await this.addMember(data.id, creatorId, 'admin');

    return data;
  },

  // Atualizar grupo
  async update(groupId, updates, userId) {
    // Verificar se o usuário é admin do grupo
    const group = await this.getById(groupId, userId);
    if (!group || (group.created_by !== userId && group.user_role !== 'admin')) {
      throw new Error('Permissão negada');
    }

    const { data, error } = await supabase
      .from('study_groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar grupo
  async delete(groupId, userId) {
    // Verificar se o usuário é o criador do grupo
    const group = await this.getById(groupId);
    if (!group || group.created_by !== userId) {
      throw new Error('Apenas o criador pode deletar o grupo');
    }

    const { error } = await supabase
      .from('study_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
    return;
  },

  // Adicionar membro ao grupo
  async addMember(groupId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: userId,
        role: role
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remover membro do grupo
  async removeMember(groupId, userId, requesterId) {
    // Verificar permissões
    const group = await this.getById(groupId, requesterId);
    if (!group) throw new Error('Grupo não encontrado');
    
    const isAdmin = group.created_by === requesterId || group.user_role === 'admin';
    const isSelf = userId === requesterId;
    
    if (!isAdmin && !isSelf) {
      throw new Error('Permissão negada');
    }

    // Não permitir que o criador se remova
    if (userId === group.created_by) {
      throw new Error('O criador do grupo não pode ser removido');
    }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return;
  },

  // Atualizar papel do membro
  async updateMemberRole(groupId, userId, newRole, requesterId) {
    // Verificar se o solicitante é admin
    const group = await this.getById(groupId, requesterId);
    if (!group || (group.created_by !== requesterId && group.user_role !== 'admin')) {
      throw new Error('Permissão negada');
    }

    // Não permitir alterar o papel do criador
    if (userId === group.created_by) {
      throw new Error('Não é possível alterar o papel do criador');
    }

    const { data, error } = await supabase
      .from('group_members')
      .update({ role: newRole })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar grupos públicos para descoberta
  async getPublicGroups(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        creator:users!study_groups_created_by_fkey(name),
        member_count:group_members(count)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Verificar se usuário é membro do grupo
  async isMember(groupId, userId) {
    const { data, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') return false;
    if (error) throw error;
    return true;
  },

  // Buscar estatísticas do grupo
  async getGroupStats(groupId) {
    // Buscar contagem de membros
    const { count: memberCount, error: memberError } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (memberError) throw memberError;

    // Buscar contagem de tarefas por status
    const { data: taskStats, error: taskError } = await supabase
      .from('tasks')
      .select('status')
      .eq('group_id', groupId);

    if (taskError) throw taskError;

    const stats = {
      member_count: memberCount,
      total_tasks: taskStats.length,
      todo_tasks: taskStats.filter(t => t.status === 'to-do').length,
      doing_tasks: taskStats.filter(t => t.status === 'doing').length,
      done_tasks: taskStats.filter(t => t.status === 'done').length
    };

    return stats;
  }
};

const { supabase } = require('../config/db');

module.exports = {
  async getAll(groupId = 1) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select(); // Garante que retorna os dados inseridos
    if (error) throw error;
    if (!data || !data[0]) throw new Error('Falha ao inserir tarefa. Verifique as chaves estrangeiras.');
    return data[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return;
  }
};
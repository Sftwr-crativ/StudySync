const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');

module.exports = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at'); // Não retorna password_hash
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*') // Inclui password_hash para autenticação
      .eq('email', email)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Usuário não encontrado
      throw error;
    }
    return data;
  },

  async create(user) {
    // Hash da senha antes de salvar
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const userData = {
      name: user.name,
      email: user.email,
      password_hash: hashedPassword
    };

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select('id, name, email, created_at'); // Não retorna password_hash

    if (error) throw error;
    return data[0];
  },

  async update(id, updates) {
    // Se está atualizando a senha, fazer hash
    if (updates.password) {
      const saltRounds = 10;
      updates.password_hash = await bcrypt.hash(updates.password, saltRounds);
      delete updates.password; // Remove password do objeto
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, created_at');

    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return;
  },

  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  async emailExists(email) {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') return false; // Não encontrado
    if (error) throw error;
    return true;
  }
};
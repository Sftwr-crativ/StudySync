// Aguarda o carregamento completo do DOM antes de executar o código
document.addEventListener('DOMContentLoaded', function () {

  // Função assíncrona para buscar e exibir as tarefas da API
  async function fetchTasks() {
    // Faz uma requisição GET para a rota /api/tasks
    const res = await fetch('/api/tasks');
    // Converte a resposta para JSON (array de tarefas)
    const tasks = await res.json();
    // Seleciona o elemento <ul> onde as tarefas serão exibidas
    const list = document.getElementById('task-list');
    // Limpa a lista antes de adicionar os itens
    list.innerHTML = '';
    // Para cada tarefa recebida, cria um <li> e adiciona na lista
    tasks.forEach(t => {
      const li = document.createElement('li');
      li.textContent = `${t.title} (venc.: ${t.due_date})`;
      list.appendChild(li);
    });
  }

  // Adiciona um listener para o envio do formulário de tarefas
  document.getElementById('task-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Impede o envio tradicional do formulário (recarregar a página)
    const form = e.target;
    // Monta o objeto com os dados do formulário e IDs fixos
    const data = {
      title: form.title.value,
      due_date: form.due_date.value,
      group_id: 1, // ID fixo do grupo (deve existir no banco)
      user_id: 1   // ID fixo do usuário (deve existir no banco)
    };
    try {
      // Envia os dados para a API via POST em /api/tasks
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      // Se a resposta não for OK, exibe o erro retornado pela API
      if (!res.ok) {
        const err = await res.json();
        alert('Erro ao criar tarefa: ' + (err.error || res.status));
      }
    } catch (err) {
      // Se houver erro de conexão, exibe um alerta
      alert('Erro de conexão: ' + err.message);
    }
    form.reset(); // Limpa o formulário após o envio
    fetchTasks(); // Atualiza a lista de tarefas na tela
  });

  // Ao carregar a página, busca e exibe as tarefas existentes
  fetchTasks();
});
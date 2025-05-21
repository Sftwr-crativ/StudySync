// Função para buscar e exibir tarefas
document.addEventListener('DOMContentLoaded', function () {
async function fetchTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${t.title} (venc.: ${t.due_date})`;
    list.appendChild(li);
  });
}

// Intercepta o envio do formulário para criar tarefa via AJAX
document.getElementById('task-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    title: form.title.value,
    due_date: form.due_date.value,
    group_id: 1,
    user_id: 1
  };
  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Erro ao criar tarefa: ' + (err.error || res.status));
    }
  } catch (err) {
    alert('Erro de conexão: ' + err.message);
  }
  form.reset();
  fetchTasks();
});
});
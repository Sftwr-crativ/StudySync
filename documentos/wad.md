# Documento de Análise e Desenvolvimento (WAD) - StudySync

## Introdução

O projeto **StudySync** foi desenvolvido como parte da disciplina COMP do módulo 2025-1B. Seu objetivo é estruturar um sistema web completo no padrão MVC, utilizando Node.js com Express, além de projetar e implementar o banco de dados relacional que sustenta as operações da aplicação.

A proposta do StudySync é fornecer uma plataforma que permita a grupos de estudo organizarem tarefas de forma colaborativa, com controle de status (Kanban) e visibilidade coletiva do progresso. O sistema inclui funcionalidades completas de autenticação, gerenciamento de grupos, sistema de tarefas e interface web responsiva.

---

## Funcionalidades Implementadas

### Sistema de Autenticação
- Registro de usuários com validação de dados
- Login e logout com sessões seguras
- Middleware de proteção de rotas
- Validação de formulários com express-validator

### Sistema de Grupos
- Criação e gerenciamento de grupos de estudo
- Controle de permissões (criador, admin, membro)
- Listagem de grupos do usuário
- Edição e exclusão de grupos
- Sistema para sair de grupos
- Interface web completa com Bootstrap 5

### Sistema de Tarefas
- Criação de tarefas vinculadas a grupos
- Status de tarefas: to-do, doing, done
- Validação de datas (não permite datas no passado)
- Atribuição de responsáveis
- Edição e exclusão de tarefas
- Dashboard com estatísticas
- Filtros por status
- Alertas para tarefas em atraso e próximas do vencimento
- Interface Kanban-style

### Interface Web
- Design responsivo com Bootstrap 5
- Navegação intuitiva
- Formulários com validação em tempo real
- Mensagens de feedback para o usuário
- Páginas de erro personalizadas

## Diagrama do Banco de Dados

O banco de dados foi modelado utilizando PostgreSQL e projetado para refletir a lógica de colaboração entre usuários, grupos e tarefas. Ele inclui as seguintes tabelas principais:

* **Users**: cadastro dos usuários do sistema
* **StudyGroups**: grupos criados por usuários
* **GroupMembers**: tabela de associação entre usuários e grupos
* **Tasks**: tarefas atribuídas a usuários dentro de grupos
* **CalendarEvents**: eventos agendados nos grupos
* **GroupSyncStatus**: view que mostra o nível de sincronização do grupo com base na conclusão das tarefas

## Diagrama Relacional

<img src="https://github.com/Sftwr-crativ/StudySync/blob/8250c601f2d004173ff306d369c2d330bcf35d15/diagrama.png"></img>

---

## Modelo Físico

O modelo físico foi implementado em SQL e está disponível no arquivo:

```
scripts/init.sql
```

Este script cria todas as tabelas, enum de status, triggers e a view utilizada para calcular a sincronização de tarefas nos grupos.


## Pré-requisitos
Node.js (v18+ recomendado)
Conta no Supabase
npm

## Configuração do Banco de Dados

1. Crie um projeto no Supabase

Acesse app.supabase.com, crie um projeto e anote:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- Dados de conexão do banco (usuário, senha, host, porta)

2. Configure as variáveis de ambiente

Crie um arquivo .env na raiz do projeto com o seguinte conteúdo (ajuste para os dados do seu Supabase):

```
DB_USER=seu_usuario
DB_HOST=seu_host
DB_DATABASE=postgres
DB_PASSWORD=sua_senha
DB_PORT=6543
SUPABASE_URL=https://<sua-instancia>.supabase.co
SUPABASE_ANON_KEY=<sua_anon_key>
PORT=3000
```

3. Crie as tabelas e tipos

O projeto já possui um script de migração em init.sql para criar todas as tabelas necessárias.

## Rodando as Migrações

Para criar ou atualizar as tabelas no banco de dados Supabase, execute:

```
npm run init-db
```

Esse comando executa o script init.sql usando as credenciais do seu .env.

## Rodando o Projeto

1. Instale as dependências:

```
npm install
```

2. Inicie o servidor

```
node server.js
```
O servidor estará disponível em http://localhost:3000

## Estrutura do Projeto

```
StudySync/
├── controllers/          # Controladores MVC
│   ├── UserController.js    # Autenticação e usuários
│   ├── GroupController.js   # Gerenciamento de grupos
│   └── TarefaController.js  # Sistema de tarefas
├── models/              # Modelos de dados
│   ├── user.js             # Modelo de usuário
│   ├── group.js            # Modelo de grupo
│   └── task.js             # Modelo de tarefa
├── views/               # Templates EJS
│   ├── auth/               # Páginas de autenticação
│   ├── groups/             # Páginas de grupos
│   └── tasks/              # Páginas de tarefas
├── middleware/          # Middlewares customizados
│   ├── auth.js             # Proteção de rotas
│   └── validators.js       # Validação de dados
├── routes/              # Definição de rotas
├── tests/               # Testes automatizados
└── scripts/             # Scripts de banco de dados
```

## APIs Implementadas

### Autenticação
- `POST /register` - Registro de usuário
- `POST /login` - Login
- `POST /logout` - Logout

### Grupos
- `GET /groups` - Página de listagem de grupos
- `GET /groups/create` - Página de criação
- `POST /groups` - Criar grupo
- `GET /groups/:id` - Detalhes do grupo
- `GET /groups/:id/edit` - Página de edição
- `PUT /groups/:id` - Atualizar grupo
- `DELETE /groups/:id` - Deletar grupo
- `POST /groups/:id/leave` - Sair do grupo

### Tarefas
- `GET /tasks` - Página de listagem de tarefas
- `GET /tasks/create` - Página de criação
- `POST /tasks` - Criar tarefa
- `GET /tasks/:id` - Detalhes da tarefa
- `GET /tasks/:id/edit` - Página de edição
- `PUT /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Deletar tarefa
- `PATCH /tasks/:id/status` - Atualizar status

### APIs REST
- `GET /api/users` - Listar usuários
- `GET /api/groups` - Listar grupos
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa via API
- `PUT /api/tasks/:id` - Atualizar tarefa via API
- `DELETE /api/tasks/:id` - Deletar tarefa via API

## Testes

O projeto inclui testes automatizados com Jest:

```bash
npm test
```

Cobertura de testes:
- Testes de autenticação (14 testes)
- Testes de grupos (14 testes)
- Testes de tarefas (18 testes)
- Total: 46 testes implementados

## Validações Implementadas

### Usuários
- Email único e formato válido
- Senha com mínimo 6 caracteres
- Nome obrigatório

### Grupos
- Nome entre 3 e 100 caracteres
- Descrição opcional até 500 caracteres
- Controle de permissões

### Tarefas
- Título entre 3 e 200 caracteres
- Descrição opcional até 1000 caracteres
- Data de vencimento não pode ser no passado
- Status válido: to-do, doing, done
- Vinculação obrigatória a um grupo

## Exemplo de Uso

1. Acesse http://localhost:3000
2. Registre uma conta ou faça login
3. Crie um grupo de estudo
4. Adicione tarefas ao grupo
5. Gerencie o status das tarefas
6. Acompanhe o progresso no dashboard
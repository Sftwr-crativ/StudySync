# Documento de Análise e Desenvolvimento (WAD) - StudySync

## Introdução

O projeto **StudySync** foi desenvolvido como parte da disciplina COMP do módulo 2025-1B. Seu objetivo é estruturar a base de um sistema web no padrão MVC, utilizando Node.js com Express, além de projetar o banco de dados relacional que sustentará as operações futuras da aplicação.

A proposta do StudySync é fornecer uma plataforma que permita a grupos de estudo organizarem tarefas de forma colaborativa, com controle de status (Kanban) e visibilidade coletiva do progresso. A ênfase nesta fase foi na modelagem e implementação da estrutura base do backend e banco de dados, preparando o projeto para as próximas etapas.

---

## Diagrama do Banco de Dados

O banco de dados foi modelado utilizando PostgreSQL e projetado para refletir a lógica de colaboração entre usuários, grupos e tarefas. Ele inclui as seguintes tabelas principais:

* **Users**: cadastro dos usuários do sistema.
* **StudyGroups**: grupos criados por usuários.
* **GroupMembers**: tabela de associação entre usuários e grupos.
* **Tasks**: tarefas atribuídas a usuários dentro de grupos.
* **CalendarEvents**: eventos agendados nos grupos.
* **GroupSyncStatus**: view que mostra o nível de sincronização do grupo com base na conclusão das tarefas.

## Diagrama Relacional

<img src="https://github.com/Sftwr-crativ/StudySync/blob/8250c601f2d004173ff306d369c2d330bcf35d15/diagrama.png"></img>

---

## Modelo Físico

O modelo físico foi implementado em SQL e está disponível no arquivo:

```
scripts/init.sql
```

Este script cria todas as tabelas, enum de status, triggers e a view utilizada para calcular a sincronização de tarefas nos grupos.

## Diagrama MVC
<img src="https://github.com/Sftwr-crativ/StudySync/blob/8cc4dbafee515e68c766ed5e32d92220383ab2db/documentos/Diagrama_MVC.png"></img>

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

## Testando as APIs

Endpoints principais:
- Listar tarefas (JSON):
```
GET /api/tasks
```
- Criar tarefa (JSON):
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Nova tarefa",
  "due_date": "2024-06-01",
  "group_id": 1,
  "user_id": 1
}
```
Acesse http://localhost:3000/ para usar a interface web (EJS) e cadastrar tarefas.

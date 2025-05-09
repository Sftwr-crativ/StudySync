# StudySync - Projeto Individual

## Descrição do Sistema Escolhido

O **StudySync** é um sistema web colaborativo voltado para grupos de estudo. Ele permite que usuários criem grupos, atribuam tarefas com prazos e status (Kanban: `to-do`, `doing`, `done`) e acompanhem a sincronização do progresso coletivo. O sistema facilita o acompanhamento de tarefas e promove o senso de responsabilidade entre os membros.

Este projeto, na sua primeira etapa, foca na estruturação da base do sistema utilizando Node.js com Express e organização do código no padrão **MVC** (Model-View-Controller). Também inclui a modelagem do banco de dados que será utilizado nas próximas fases.

---

## Estrutura de Pastas e Arquivos

```
study-sync/
│
├── config/                # Configurações (ex: database.js)
├── controllers/           # Controladores da aplicação
├── models/                # Modelos de dados
├── routes/                # Definição das rotas
├── services/              # Serviços auxiliares (lógica de apoio)
├── assets/                # Arquivos públicos como imagens
├── scripts/               # Scripts SQL e utilitários
├── styles/                # Arquivos CSS
├── tests/                 # Testes automatizados (ex: example.test.js)
├── views/                 # Páginas EJS (se aplicável futuramente)
├── .env.example           # Exemplo de variáveis de ambiente
├── .gitignore             # Arquivos a serem ignorados no Git
├── jest.config.js         # Configuração do Jest (testes)
├── package.json           # Dependências do projeto
├── package-lock.json      # Lock das dependências
├── rest.http              # Arquivo para testar endpoints HTTP (opcional)
├── server.js              # Arquivo principal que inicia o servidor
├── readme.md              # Documentação do projeto
└── modelo-banco.png/pdf   # Diagrama do banco de dados
```

---

## Como Executar o Projeto Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar o servidor

```bash
node server.js
```

Ou, se tiver configurado:

```bash
npm start
```

A aplicação será iniciada em: `http://localhost:3000`

---

## Banco de Dados

* O banco de dados foi modelado em PostgreSQL.
* O modelo físico (SQL) está no arquivo: `scripts/init.sql`
* O diagrama do banco (modelo lógico/relacional) está salvo como `diagrama.png`
* O banco será futuramente implementado usando o Supabase.

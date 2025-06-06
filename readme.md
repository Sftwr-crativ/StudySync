# StudySync - Sistema de Grupos de Estudo Colaborativo

## Descrição do Sistema

O **StudySync** é um sistema web colaborativo voltado para grupos de estudo. Ele permite que usuários se cadastrem, criem grupos, atribuam tarefas com prazos e status (Kanban: `to-do`, `doing`, `done`) e acompanhem a sincronização do progresso coletivo. O sistema facilita o acompanhamento de tarefas e promove o senso de responsabilidade entre os membros.

## Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Cadastro de usuários com validação
- Login e logout seguros
- Sessões de usuário
- Hash de senhas com bcrypt
- Middleware de proteção de rotas
- Validação de formulários

### ✅ Interface Web
- Views EJS responsivas
- Design moderno com Bootstrap
- Páginas de login e cadastro
- Dashboard do usuário
- Navegação intuitiva

### ✅ API REST
- CRUD completo de usuários
- Endpoints para tarefas
- Validação de dados
- Tratamento de erros

### ✅ Arquitetura MVC
- Controllers organizados
- Models com Supabase
- Views EJS estruturadas
- Middleware customizado
- Rotas protegidas

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

### 1. Pré-requisitos
- Node.js (v18+ recomendado)
- Conta no Supabase
- npm ou yarn

### 2. Configuração do Banco de Dados

1. **Crie um projeto no Supabase**
   - Acesse [app.supabase.com](https://app.supabase.com)
   - Crie um novo projeto
   - Anote a URL e a chave anônima

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` com suas credenciais do Supabase:
   ```env
   DB_USER=seu_usuario
   DB_HOST=seu_host
   DB_NAME=postgres
   DB_PASSWORD=sua_senha
   DB_PORT=6543
   SUPABASE_URL=https://sua-instancia.supabase.co
   SUPABASE_ANON_KEY=sua_anon_key
   SESSION_SECRET=sua-chave-secreta-aqui
   PORT=3000
   ```

3. **Execute as migrações do banco**
   ```bash
   npm run init-db
   ```

### 3. Instalar dependências

```bash
npm install
```

### 4. Executar o servidor

**Modo desenvolvimento (com nodemon):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

A aplicação será iniciada em: `http://localhost:3000`

### 5. Executar testes

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm run test:coverage
```

## Primeiros Passos

1. Acesse `http://localhost:3000`
2. Clique em "Cadastrar" para criar uma conta
3. Faça login com suas credenciais
4. Explore o dashboard e as funcionalidades disponíveis

---

## Banco de Dados

* O banco de dados foi modelado em PostgreSQL.
* O modelo físico (SQL) está no arquivo: `scripts/init.sql`
* O diagrama do banco (modelo lógico/relacional) está salvo como `diagrama.png`
* O banco será futuramente implementado usando o Supabase.

# 🚀 Guia de Configuração do Supabase para StudySync

## Passo 1: Criar Projeto no Supabase

1. **Acesse o Supabase**
   - Vá para [app.supabase.com](https://app.supabase.com)
   - Faça login ou crie uma conta

2. **Criar Novo Projeto**
   - Clique em "New Project"
   - Escolha uma organização
   - Preencha:
     - **Name**: `StudySync` (ou nome de sua preferência)
     - **Database Password**: Crie uma senha forte (anote ela!)
     - **Region**: Escolha a região mais próxima
   - Clique em "Create new project"
   - ⏳ Aguarde alguns minutos para o projeto ser criado

## Passo 2: Obter Credenciais

1. **No Dashboard do seu projeto**, vá para:
   - **Settings** (ícone de engrenagem) → **API**

2. **Copie as seguintes informações:**
   - **Project URL** (algo como: `https://xxxxxxxxxxx.supabase.co`)
   - **anon/public key** (chave longa que começa com `eyJ...`)

3. **Para credenciais do banco PostgreSQL**, vá para:
   - **Settings** → **Database**
   - Copie:
     - **Host**
     - **Database name** (geralmente `postgres`)
     - **Port** (geralmente `6543`)
     - **User** (geralmente `postgres`)
     - **Password** (a senha que você criou no Passo 1)

## Passo 3: Configurar Arquivo .env

1. **Na raiz do projeto StudySync**, copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. **Edite o arquivo `.env`** com suas credenciais:
   ```env
   # Configurações do Servidor
   PORT=3000

   # Configurações do Banco PostgreSQL (do Supabase)
   DB_USER=postgres
   DB_HOST=db.xxxxxxxxxxx.supabase.co
   DB_NAME=postgres
   DB_PASSWORD=sua_senha_do_passo_1
   DB_PORT=6543

   # Configurações do Supabase
   SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...sua_chave_aqui

   # Configurações de Sessão
   SESSION_SECRET=mude-esta-chave-para-algo-seguro-em-producao
   ```

## Passo 4: Executar as Migrações

### Opção A: Execução Manual (Recomendada)

1. **Acesse o SQL Editor do Supabase:**
   - No dashboard do seu projeto
   - Vá para **SQL Editor** (ícone de banco de dados)

2. **Copie o conteúdo do arquivo `scripts/init.sql`**
   - Abra o arquivo no VS Code
   - Selecione todo o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)

3. **Execute no Supabase:**
   - Cole o SQL no editor
   - Clique em "Run" ou pressione Ctrl+Enter
   - ✅ Verifique se todas as tabelas foram criadas

### Opção B: Script Automático

```bash
npm run init-db
```

## Passo 5: Verificar Instalação

1. **Verificar tabelas criadas:**
   - No Supabase Dashboard → **Table Editor**
   - Você deve ver as tabelas:
     - `users`
     - `study_groups`
     - `group_members`
     - `tasks`
     - `pomodoro_sessions`
     - `calendar_events`
     - `group_sync_status`

2. **Testar conexão:**
   ```bash
   npm start
   ```
   - Acesse `http://localhost:3000`
   - Tente criar uma conta

## 🔧 Solução de Problemas

### Erro: "Tenant or user not found"
- ✅ Verifique se as credenciais no `.env` estão corretas
- ✅ Confirme se o projeto Supabase está ativo
- ✅ Teste a conexão no Supabase Dashboard

### Erro: "Connection refused"
- ✅ Verifique se o host e porta estão corretos
- ✅ Confirme se o projeto não está pausado

### Erro: "Authentication failed"
- ✅ Verifique a senha do banco de dados
- ✅ Confirme o usuário (geralmente `postgres`)

### Tabelas não aparecem
- ✅ Execute o SQL manualmente no SQL Editor
- ✅ Verifique se não há erros de sintaxe
- ✅ Confirme se o usuário tem permissões

## 📞 Suporte

Se ainda tiver problemas:

1. **Verifique os logs do Supabase:**
   - Dashboard → **Logs**

2. **Teste conexão básica:**
   ```javascript
   // Teste simples no console do navegador
   const { createClient } = require('@supabase/supabase-js');
   const supabase = createClient('SUA_URL', 'SUA_CHAVE');
   supabase.from('users').select('*').then(console.log);
   ```

3. **Documentação oficial:**
   - [Supabase Docs](https://supabase.com/docs)
   - [Getting Started](https://supabase.com/docs/guides/getting-started)

## ✅ Checklist Final

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas
- [ ] Arquivo `.env` configurado
- [ ] SQL executado (tabelas criadas)
- [ ] Servidor iniciando sem erros
- [ ] Página de login acessível

🎉 **Parabéns! Seu StudySync está configurado e pronto para uso!**

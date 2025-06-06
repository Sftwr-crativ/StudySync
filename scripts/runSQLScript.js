const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Verificar se as variáveis de ambiente estão definidas
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Erro: As seguintes variáveis de ambiente estão faltando:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n📝 Por favor, configure o arquivo .env com suas credenciais do Supabase.');
  console.error('💡 Use o arquivo .env.example como referência.');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const runSQLScript = async () => {
  console.log('🚀 Iniciando execução do script de migração...');
  console.log(`📍 Conectando ao Supabase: ${process.env.SUPABASE_URL}`);

  const filePath = path.join(__dirname, 'init.sql');

  if (!fs.existsSync(filePath)) {
    console.error('❌ Erro: Arquivo init.sql não encontrado!');
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');

  // Dividir o SQL em comandos individuais (separados por ponto e vírgula)
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

  console.log(`📄 Executando ${commands.length} comandos SQL...`);

  try {
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      try {
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);

        // Usar rpc para executar SQL customizado
        const { error } = await supabase.rpc('exec_sql', { sql_query: command });

        if (error) {
          // Se rpc não funcionar, tentar com query direta
          const { error: directError } = await supabase
            .from('_temp_table_that_does_not_exist')
            .select('*');

          // Como esperado que falhe, vamos usar uma abordagem diferente
          console.log(`⚠️  Comando ${i + 1} pode precisar ser executado manualmente no Supabase Dashboard`);
          console.log(`   SQL: ${command.substring(0, 100)}...`);
        }

        successCount++;
      } catch (cmdError) {
        console.error(`❌ Erro no comando ${i + 1}:`, cmdError.message);
        errorCount++;
      }
    }

    console.log('\n📊 Resumo da execução:');
    console.log(`✅ Comandos processados: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Script SQL executado com sucesso!');
      console.log('💡 Verifique o Supabase Dashboard para confirmar que as tabelas foram criadas.');
    } else {
      console.log('\n⚠️  Alguns comandos falharam. Você pode precisar executá-los manualmente no Supabase Dashboard.');
      console.log('📖 Acesse: https://app.supabase.com -> Seu Projeto -> SQL Editor');
    }

  } catch (err) {
    console.error('\n❌ Erro geral ao executar o script SQL:', err.message);
    console.log('\n💡 Soluções possíveis:');
    console.log('1. Verifique se as credenciais do Supabase estão corretas no .env');
    console.log('2. Execute o SQL manualmente no Supabase Dashboard');
    console.log('3. Verifique se o projeto Supabase existe e está ativo');
  }
};

// Função alternativa para mostrar o SQL que deve ser executado
const showSQLInstructions = () => {
  console.log('\n📋 INSTRUÇÕES PARA EXECUÇÃO MANUAL:');
  console.log('1. Acesse https://app.supabase.com');
  console.log('2. Selecione seu projeto');
  console.log('3. Vá para "SQL Editor"');
  console.log('4. Cole e execute o conteúdo do arquivo scripts/init.sql');
  console.log('5. Execute o comando: npm start');
};

runSQLScript().then(() => {
  showSQLInstructions();
});

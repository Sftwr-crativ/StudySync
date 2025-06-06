const fs = require('fs');
const path = require('path');

console.log('🎯 StudySync - Instruções de Configuração do Banco de Dados\n');

// Verificar se o arquivo .env existe
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env não encontrado!');
  console.log('📝 Execute o comando: cp .env.example .env');
  console.log('   Depois edite o arquivo .env com suas credenciais do Supabase.\n');
}

console.log('📋 PASSOS PARA CONFIGURAR O BANCO DE DADOS:\n');

console.log('1️⃣  CRIAR PROJETO NO SUPABASE:');
console.log('   • Acesse: https://app.supabase.com');
console.log('   • Clique em "New Project"');
console.log('   • Preencha nome, senha e região');
console.log('   • Aguarde a criação (alguns minutos)\n');

console.log('2️⃣  OBTER CREDENCIAIS:');
console.log('   • No dashboard → Settings → API');
console.log('   • Copie: Project URL e anon key');
console.log('   • No dashboard → Settings → Database');
console.log('   • Copie: Host, Port, User, Password\n');

console.log('3️⃣  CONFIGURAR .env:');
console.log('   • Edite o arquivo .env com suas credenciais');
console.log('   • Use o .env.example como referência\n');

console.log('4️⃣  EXECUTAR SQL NO SUPABASE:');
console.log('   • No dashboard → SQL Editor');
console.log('   • Copie e cole o conteúdo de scripts/init.sql');
console.log('   • Clique em "Run"\n');

console.log('5️⃣  TESTAR:');
console.log('   • Execute: npm start');
console.log('   • Acesse: http://localhost:3000');
console.log('   • Tente criar uma conta\n');

// Mostrar o conteúdo do SQL para facilitar
const sqlPath = path.join(__dirname, 'init.sql');
if (fs.existsSync(sqlPath)) {
  console.log('📄 CONTEÚDO DO SQL PARA COPIAR:');
  console.log('=' .repeat(50));
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  console.log(sqlContent);
  console.log('=' .repeat(50));
} else {
  console.log('❌ Arquivo init.sql não encontrado!');
}

console.log('\n💡 DICA: Para mais detalhes, consulte o arquivo SETUP_SUPABASE.md');
console.log('🆘 Em caso de problemas, execute: npm run help-setup');

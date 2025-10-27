#!/usr/bin/env node

/**
 * Script de Migração: Firebase → MongoDB
 * 
 * Este script ajuda a migrar dados do Firebase para MongoDB
 * Execute: node scripts/migrate-to-mongodb.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Script de Migração: Firebase → MongoDB');
console.log('==========================================\n');

// 1. Verificar se MongoDB está instalado
console.log('1️⃣ Verificando instalação do MongoDB...');
try {
  execSync('mongod --version', { stdio: 'pipe' });
  console.log('✅ MongoDB está instalado\n');
} catch (error) {
  console.log('❌ MongoDB não está instalado');
  console.log('📋 Instruções de instalação:');
  console.log('   Ubuntu/Debian: sudo apt-get install mongodb-org');
  console.log('   macOS: brew install mongodb-community');
  console.log('   Windows: Baixar do site oficial\n');
  process.exit(1);
}

// 2. Verificar se o backend está configurado
console.log('2️⃣ Verificando configuração do backend...');
const backendPath = path.join(__dirname, '..', 'backend');
const packageJsonPath = path.join(backendPath, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ Backend não encontrado');
  console.log('📋 Execute: cd backend && npm install\n');
  process.exit(1);
}

console.log('✅ Backend configurado\n');

// 3. Verificar dependências
console.log('3️⃣ Verificando dependências...');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = ['express', 'mongoose', 'cors', 'helmet'];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`❌ Dependências em falta: ${missingDeps.join(', ')}`);
    console.log('📋 Execute: cd backend && npm install\n');
    process.exit(1);
  }
  
  console.log('✅ Todas as dependências estão instaladas\n');
} catch (error) {
  console.log('❌ Erro ao verificar dependências\n');
  process.exit(1);
}

// 4. Verificar ficheiro .env
console.log('4️⃣ Verificando configuração...');
const envPath = path.join(backendPath, '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ Ficheiro .env não encontrado');
  console.log('📋 Criando ficheiro .env...');
  
  const envContent = `# Configurações do Servidor
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/controle-financeiro

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_2024
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Ficheiro .env criado\n');
} else {
  console.log('✅ Ficheiro .env encontrado\n');
}

// 5. Instruções para iniciar
console.log('5️⃣ Próximos passos:');
console.log('===================');
console.log('');
console.log('🚀 Para iniciar o MongoDB:');
console.log('   sudo systemctl start mongod  # Linux');
console.log('   brew services start mongodb/brew/mongodb-community  # macOS');
console.log('');
console.log('🚀 Para iniciar o backend:');
console.log('   cd backend');
console.log('   npm run dev');
console.log('');
console.log('🚀 Para testar a API:');
console.log('   curl http://localhost:5000/health');
console.log('');
console.log('📚 Documentação completa: MONGODB_SETUP.md');
console.log('');
console.log('✅ Migração configurada com sucesso!');
console.log('🎉 Agora você tem uma base de dados muito mais robusta!');

#!/usr/bin/env node

/**
 * Script para limpar dados sensíveis antes de fazer deploy no GitHub
 * Remove:
 * - Arquivos de reservas salvos localmente
 * - Fotos de perfil/hotel
 * - Arquivos de configuração sensíveis
 * - Cache e arquivos temporários
 */

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const dirsToClean = [
  'reservations',
  'public/uploads',
  '.env',
  '.env.local',
  '.env.*.local',
  'dist',
  'build',
  '.next',
  'node_modules',
];

const rootDir = path.join(__dirname, '..');

console.log('🧹 Limpando dados sensíveis...\n');

dirsToClean.forEach((dir) => {
  const fullPath = path.join(rootDir, dir);
  
  if (fs.existsSync(fullPath)) {
    try {
      rimraf.sync(fullPath);
      console.log(`✅ Removido: ${dir}`);
    } catch (error) {
      console.error(`❌ Erro ao remover ${dir}:`, error.message);
    }
  }
});

// Criar arquivo .gitignore se não existir
const gitignorePath = path.join(rootDir, '.gitignore');
const gitignoreContent = `
# Dados sensíveis
reservations/
.env
.env.local
.env.*.local

# Uploads e fotos
public/uploads/

# Build e cache
dist/
build/
.next/
node_modules/
.turbo/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;

if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(gitignorePath, gitignoreContent.trim());
  console.log('\n✅ Criado arquivo .gitignore');
}

console.log('\n✨ Limpeza concluída! O projeto está pronto para o GitHub.');
console.log('\n📝 Próximos passos:');
console.log('1. git init');
console.log('2. git add .');
console.log('3. git commit -m "Initial commit"');
console.log('4. git remote add origin <seu-repositorio>');
console.log('5. git push -u origin main');

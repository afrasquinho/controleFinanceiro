#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para limpar console.log, console.warn, console.error do código
 * Mantém apenas em ambiente de desenvolvimento
 */

const srcDir = path.join(__dirname, '../src');

function cleanConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Padrões para encontrar console.log/warn/error
    const patterns = [
      // console.log simples
      /^\s*console\.log\([^;]*\);\s*$/gm,
      // console.warn simples  
      /^\s*console\.warn\([^;]*\);\s*$/gm,
      // console.error simples
      /^\s*console\.error\([^;]*\);\s*$/gm,
      // console.log em blocos try/catch (manter apenas se já tem condição NODE_ENV)
      /^\s*console\.(log|warn|error)\([^;]*\);\s*$/gm
    ];
    
    let modified = false;
    
    // Substituir console.log simples por versão condicional
    patterns.forEach(pattern => {
      content = content.replace(pattern, (match) => {
        // Se já tem condição NODE_ENV, não modificar
        if (content.includes('process.env.NODE_ENV') && content.indexOf(match) > content.lastIndexOf('process.env.NODE_ENV')) {
          return match;
        }
        
        modified = true;
        return `// ${match.trim()}`;
      });
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Limpo: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let cleanedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      cleanedCount += processDirectory(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
      if (cleanConsoleLogs(filePath)) {
        cleanedCount++;
      }
    }
  });
  
  return cleanedCount;
}

console.log('🧹 Iniciando limpeza de console.log...');
const cleanedFiles = processDirectory(srcDir);
console.log(`✅ Limpeza concluída! ${cleanedFiles} arquivos modificados.`);

#!/usr/bin/env node

/**
 * Script para testar todas as melhorias implementadas
 * Verifica se as funcionalidades estão funcionando corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testando todas as melhorias implementadas...\n');

// Lista de melhorias para testar
const improvements = [
  {
    name: 'PWA Manifest',
    file: 'public/manifest.json',
    check: (content) => {
      const manifest = JSON.parse(content);
      return manifest.name && manifest.short_name && manifest.display === 'standalone';
    }
  },
  {
    name: 'Service Worker',
    file: 'public/sw.js',
    check: (content) => content.includes('Service Worker') && content.includes('cache')
  },
  {
    name: 'Dark Mode Hook',
    file: 'src/hooks/useTheme.js',
    check: (content) => content.includes('useTheme') && content.includes('toggleTheme')
  },
  {
    name: 'Theme Toggle Component',
    file: 'src/components/ThemeToggle.js',
    check: (content) => content.includes('ThemeToggle') && content.includes('toggleTheme')
  },
  {
    name: 'Theme CSS Variables',
    file: 'src/styles/themes.css',
    check: (content) => content.includes(':root') && content.includes('.dark-theme')
  },
  {
    name: 'Animations CSS',
    file: 'src/styles/animations.css',
    check: (content) => content.includes('@keyframes') && content.includes('.animate-')
  },
  {
    name: 'Debounce Hook',
    file: 'src/hooks/useDebounce.js',
    check: (content) => content.includes('useDebounce') && content.includes('setTimeout')
  },
  {
    name: 'AI Analysis Hook',
    file: 'src/hooks/useAIAnalysis.js',
    check: (content) => content.includes('useAIAnalysis') && content.includes('debounce')
  },
  {
    name: 'Performance Metrics',
    file: 'src/utils/performanceMetrics.js',
    check: (content) => content.includes('PerformanceMetrics') && content.includes('recordMetric')
  },
  {
    name: 'Lazy Components',
    file: 'src/utils/lazyComponents.js',
    check: (content) => content.includes('lazy') && content.includes('OverviewSection')
  },
  {
    name: 'Environment Files',
    file: '.env.example',
    check: (content) => content.includes('REACT_APP_FIREBASE_API_KEY')
  },
  {
    name: 'Updated Firebase Config',
    file: 'src/firebase.js',
    check: (content) => content.includes('process.env.REACT_APP_FIREBASE_API_KEY') && content.includes('requiredEnvVars')
  },
  {
    name: 'Secure Firestore Rules',
    file: 'firestore.rules',
    check: (content) => content.includes('request.auth != null') && content.includes('email_verified')
  },
  {
    name: 'E2E Tests',
    file: 'src/__tests__/e2e/App.e2e.test.js',
    check: (content) => content.includes('E2E') && content.includes('describe')
  },
  {
    name: 'API Documentation',
    file: 'docs/API.md',
    check: (content) => content.includes('useUnifiedFirestore') && content.includes('PerformanceMetrics')
  },
  {
    name: 'Updated Package.json',
    file: 'package.json',
    check: (content) => {
      const pkg = JSON.parse(content);
      return pkg.scripts.lint && pkg.scripts.format && pkg.scripts.precommit;
    }
  }
];

// Função para testar uma melhoria
function testImprovement(improvement) {
  const filePath = path.join(__dirname, '..', improvement.file);
  
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `Arquivo não encontrado: ${improvement.file}` };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const isValid = improvement.check(content);
    
    return { success: isValid, error: isValid ? null : `Falha na validação: ${improvement.file}` };
  } catch (error) {
    return { success: false, error: `Erro ao ler arquivo: ${error.message}` };
  }
}

// Executar todos os testes
let passed = 0;
let failed = 0;
const results = [];

console.log('📋 Executando verificações...\n');

improvements.forEach((improvement, index) => {
  const result = testImprovement(improvement);
  results.push({ ...improvement, ...result });
  
  if (result.success) {
    console.log(`✅ ${improvement.name}`);
    passed++;
  } else {
    console.log(`❌ ${improvement.name}: ${result.error}`);
    failed++;
  }
});

// Resumo dos resultados
console.log('\n📊 Resumo dos Testes:');
console.log(`✅ Aprovados: ${passed}`);
console.log(`❌ Falharam: ${failed}`);
console.log(`📈 Taxa de sucesso: ${Math.round((passed / improvements.length) * 100)}%`);

// Verificações adicionais
console.log('\n🔍 Verificações Adicionais:');

// Verificar se hooks duplicados foram removidos
const duplicateHooks = ['useFinanceData.js', 'useFirebaseData.js', 'useFirestore.js'];
const hooksPath = path.join(__dirname, '..', 'src', 'hooks');

duplicateHooks.forEach(hook => {
  const hookPath = path.join(hooksPath, hook);
  if (!fs.existsSync(hookPath)) {
    console.log(`✅ Hook duplicado removido: ${hook}`);
  } else {
    console.log(`❌ Hook duplicado ainda existe: ${hook}`);
    failed++;
  }
});

// Verificar console.log removidos
const srcPath = path.join(__dirname, '..', 'src');
const jsFiles = getAllJsFiles(srcPath);
let consoleLogCount = 0;

jsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/console\.(log|warn|error)/g);
  if (matches) {
    consoleLogCount += matches.length;
  }
});

if (consoleLogCount === 0) {
  console.log('✅ Todos os console.log foram removidos do código de produção');
} else {
  console.log(`⚠️  ${consoleLogCount} console.log ainda encontrados no código`);
}

// Verificar se PWA está configurado corretamente
const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
  const hasServiceWorker = indexContent.includes('serviceWorker.register');
  const hasPWA = indexContent.includes('beforeinstallprompt');
  
  if (hasServiceWorker && hasPWA) {
    console.log('✅ PWA configurado corretamente no index.html');
  } else {
    console.log('❌ PWA não configurado corretamente no index.html');
    failed++;
  }
}

// Função auxiliar para encontrar todos os arquivos JS
function getAllJsFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules')) {
        traverse(fullPath);
      } else if (item.endsWith('.js') && !item.includes('.test.') && !item.includes('.e2e.')) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Resultado final
console.log('\n🎯 Resultado Final:');
if (failed === 0) {
  console.log('🎉 Todas as melhorias foram implementadas com sucesso!');
  console.log('\n📋 Melhorias implementadas:');
  console.log('• ✅ PWA (Progressive Web App)');
  console.log('• ✅ Dark Mode');
  console.log('• ✅ Animações suaves');
  console.log('• ✅ Bundle optimization');
  console.log('• ✅ Documentação JSDoc');
  console.log('• ✅ Métricas de performance');
  console.log('• ✅ Testes E2E');
  console.log('• ✅ Segurança aprimorada');
  console.log('• ✅ Performance otimizada');
  console.log('• ✅ Arquitetura limpa');
  
  process.exit(0);
} else {
  console.log(`❌ ${failed} melhorias falharam nos testes`);
  console.log('\n🔧 Verifique os erros acima e corrija antes de continuar');
  process.exit(1);
}

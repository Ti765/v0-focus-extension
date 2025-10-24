/**
 * Script para executar todos os testes de debug e gerar relatório
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando testes de debug da extensão...\n');

const testFiles = [
  'debug-communication.test.ts',
  'debug-initialization.test.ts', 
  'debug-storage.test.ts',
  'debug-content-script.test.ts',
  'debug-dnr.test.ts',
  'debug-integration.test.ts'
];

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  summary: {}
};

async function runTests() {
  console.log('📋 Executando testes individuais...\n');
  
  for (const testFile of testFiles) {
    const testName = testFile.replace('.test.ts', '');
    console.log(`🧪 Executando ${testName}...`);
    
    try {
      const output = execSync(`npx vitest run tests/${testFile} --reporter=verbose`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      console.log(`✅ ${testName} - PASSOU`);
      results.passed++;
      results.summary[testName] = 'PASSOU';
      
    } catch (error) {
      console.log(`❌ ${testName} - FALHOU`);
      console.log(`Erro: ${error.message}`);
      results.failed++;
      results.errors.push({
        test: testName,
        error: error.message
      });
      results.summary[testName] = 'FALHOU';
    }
    
    results.total++;
    console.log('');
  }
  
  // Gera relatório
  generateReport();
}

function generateReport() {
  console.log('📊 Gerando relatório de diagnóstico...\n');
  
  const report = `
# RELATÓRIO DE DIAGNÓSTICO DA EXTENSÃO

## Resumo Executivo
- **Total de Testes**: ${results.total}
- **Testes Aprovados**: ${results.passed}
- **Testes Falharam**: ${results.failed}
- **Taxa de Sucesso**: ${((results.passed / results.total) * 100).toFixed(1)}%

## Resultados por Teste
${Object.entries(results.summary).map(([test, status]) => 
  `- **${test}**: ${status === 'PASSOU' ? '✅ PASSOU' : '❌ FALHOU'}`
).join('\n')}

## Possíveis Problemas Identificados
${results.errors.length > 0 ? results.errors.map(err => 
  `- **${err.test}**: ${err.error}`
).join('\n') : '- Nenhum problema crítico identificado'}

## Próximos Passos Recomendados
${generateRecommendations()}

## Logs de Debug
Para mais detalhes, verifique os logs do console do navegador:
1. Abra as Ferramentas do Desenvolvedor (F12)
2. Vá para a aba "Console"
3. Procure por mensagens que começam com "[v0]" ou "[DEBUG-TEST]"
4. Verifique a aba "Service Worker" para logs do background script

---
Relatório gerado em: ${new Date().toISOString()}
`;

  // Salva relatório
  const reportPath = path.join(process.cwd(), 'debug-report.md');
  fs.writeFileSync(reportPath, report);
  
  console.log('📄 Relatório salvo em: debug-report.md');
  console.log(report);
}

function generateRecommendations() {
  const recommendations = [];
  
  if (results.failed > 0) {
    recommendations.push('🔧 Corrigir testes que falharam');
  }
  
  if (results.summary['debug-communication'] === 'FALHOU') {
    recommendations.push('📡 Verificar comunicação entre popup e background script');
    recommendations.push('🔍 Verificar se as mensagens estão sendo enviadas corretamente');
  }
  
  if (results.summary['debug-initialization'] === 'FALHOU') {
    recommendations.push('⚙️ Verificar inicialização dos módulos');
    recommendations.push('🔍 Verificar se todos os módulos estão sendo carregados');
  }
  
  if (results.summary['debug-storage'] === 'FALHOU') {
    recommendations.push('💾 Verificar storage e persistência de dados');
    recommendations.push('🔍 Verificar se os dados estão sendo salvos corretamente');
  }
  
  if (results.summary['debug-content-script'] === 'FALHOU') {
    recommendations.push('📜 Verificar injeção de content script');
    recommendations.push('🔍 Verificar se o script está sendo injetado nas páginas');
  }
  
  if (results.summary['debug-dnr'] === 'FALHOU') {
    recommendations.push('🚫 Verificar regras DNR (Declarative Net Request)');
    recommendations.push('🔍 Verificar se as regras estão sendo aplicadas');
  }
  
  if (results.summary['debug-integration'] === 'FALHOU') {
    recommendations.push('🔗 Verificar integração completa da extensão');
    recommendations.push('🔍 Verificar fluxo completo de funcionalidades');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Todos os testes passaram! A extensão deve estar funcionando corretamente.');
  }
  
  return recommendations.join('\n');
}

// Executa os testes
runTests().catch(console.error);

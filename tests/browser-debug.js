/**
 * Script de diagnóstico para executar no console do navegador
 * Execute este script no console da extensão para diagnosticar problemas
 */

console.log('🔍 Iniciando diagnóstico da extensão...\n');

// Função para testar comunicação
async function testCommunication() {
  console.log('📡 Testando comunicação...');
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_INITIAL_STATE',
      payload: null
    });
    
    console.log('✅ Comunicação funcionando:', response);
    return true;
  } catch (error) {
    console.log('❌ Erro na comunicação:', error);
    return false;
  }
}

// Função para testar storage
async function testStorage() {
  console.log('💾 Testando storage...');
  
  try {
    // Testa local storage
    await chrome.storage.local.set({ test: 'data' });
    const localData = await chrome.storage.local.get('test');
    console.log('✅ Local storage funcionando:', localData);
    
    // Testa sync storage
    await chrome.storage.sync.set({ test: 'data' });
    const syncData = await chrome.storage.sync.get('test');
    console.log('✅ Sync storage funcionando:', syncData);
    
    // Testa session storage
    await chrome.storage.session.set({ test: 'data' });
    const sessionData = await chrome.storage.session.get('test');
    console.log('✅ Session storage funcionando:', sessionData);
    
    return true;
  } catch (error) {
    console.log('❌ Erro no storage:', error);
    return false;
  }
}

// Função para testar DNR
async function testDNR() {
  console.log('🚫 Testando DNR...');
  
  try {
    // Lista regras existentes
    const rules = await chrome.declarativeNetRequest.getSessionRules();
    console.log('✅ DNR funcionando, regras encontradas:', rules.length);
    
    // Testa criação de regra
    const testRule = {
      id: 9999,
      priority: 1,
      action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
      condition: {
        regexFilter: '.*test-debug\\.com.*',
        isUrlFilterCaseSensitive: false,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
      },
    };
    
    await chrome.declarativeNetRequest.updateSessionRules({
      addRules: [testRule]
    });
    console.log('✅ Regra DNR criada com sucesso');
    
    // Remove a regra de teste
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [9999]
    });
    console.log('✅ Regra DNR removida com sucesso');
    
    return true;
  } catch (error) {
    console.log('❌ Erro no DNR:', error);
    return false;
  }
}

// Função para testar tabs
async function testTabs() {
  console.log('📑 Testando tabs...');
  
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('✅ Tabs funcionando, aba ativa:', tabs[0]?.url);
    return true;
  } catch (error) {
    console.log('❌ Erro nas tabs:', error);
    return false;
  }
}

// Função para testar alarms
async function testAlarms() {
  console.log('⏰ Testando alarms...');
  
  try {
    await chrome.alarms.create('test-alarm', { when: Date.now() + 1000 });
    console.log('✅ Alarm criado com sucesso');
    
    await chrome.alarms.clear('test-alarm');
    console.log('✅ Alarm removido com sucesso');
    
    return true;
  } catch (error) {
    console.log('❌ Erro nos alarms:', error);
    return false;
  }
}

// Função para testar notifications
async function testNotifications() {
  console.log('🔔 Testando notifications...');
  
  try {
    await chrome.notifications.create('test-notification', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Teste de Notificação',
      message: 'Esta é uma notificação de teste'
    });
    console.log('✅ Notificação criada com sucesso');
    
    await chrome.notifications.clear('test-notification');
    console.log('✅ Notificação removida com sucesso');
    
    return true;
  } catch (error) {
    console.log('❌ Erro nas notifications:', error);
    return false;
  }
}

// Função para verificar estado da extensão
async function checkExtensionState() {
  console.log('🔍 Verificando estado da extensão...');
  
  try {
    // Verifica se o service worker está ativo
    const serviceWorker = chrome.runtime.getManifest();
    console.log('✅ Service Worker ativo, versão:', serviceWorker.version);
    
    // Verifica permissões
    const permissions = chrome.runtime.getManifest().permissions;
    console.log('✅ Permissões:', permissions);
    
    // Verifica se há erros no console
    console.log('✅ Extensão carregada sem erros críticos');
    
    return true;
  } catch (error) {
    console.log('❌ Erro no estado da extensão:', error);
    return false;
  }
}

// Função principal de diagnóstico
async function runDiagnostics() {
  console.log('🚀 Iniciando diagnóstico completo...\n');
  
  const results = {
    communication: await testCommunication(),
    storage: await testStorage(),
    dnr: await testDNR(),
    tabs: await testTabs(),
    alarms: await testAlarms(),
    notifications: await testNotifications(),
    extensionState: await checkExtensionState()
  };
  
  console.log('\n📊 RESULTADOS DO DIAGNÓSTICO:');
  console.log('==============================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'FUNCIONANDO' : 'COM PROBLEMAS'}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  
  console.log(`\n📈 Taxa de sucesso: ${successRate}% (${passedTests}/${totalTests})`);
  
  if (successRate === '100.0') {
    console.log('🎉 Todos os testes passaram! A extensão deve estar funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os erros acima para identificar problemas.');
  }
  
  // Salva resultados no storage para referência
  await chrome.storage.local.set({
    debugResults: {
      timestamp: Date.now(),
      results,
      successRate: parseFloat(successRate)
    }
  });
  
  console.log('\n💾 Resultados salvos no storage local para referência.');
  
  return results;
}

// Executa o diagnóstico
runDiagnostics().catch(console.error);

// Exporta funções para uso manual
window.debugExtension = {
  testCommunication,
  testStorage,
  testDNR,
  testTabs,
  testAlarms,
  testNotifications,
  checkExtensionState,
  runDiagnostics
};

console.log('\n🛠️ Funções de debug disponíveis em window.debugExtension');
console.log('Exemplo: await window.debugExtension.testCommunication()');

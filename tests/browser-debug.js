/**
 * Comprehensive Extension Diagnostic Script
 * Run this in the browser console to diagnose extension issues
 */

console.log('🔍 Starting Focus Extension Diagnostic...');

// Helper function to safely execute async code
async function safeExecute(name, fn) {
  try {
    console.log(`\n📋 Testing: ${name}`);
    const result = await fn();
    console.log(`✅ ${name}: SUCCESS`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${name}: FAILED`, error);
    return null;
  }
}

// 1. Check if extension is loaded and accessible
async function checkExtensionLoaded() {
  if (typeof chrome === 'undefined') {
    throw new Error('Chrome extension API not available');
  }
  
  if (!chrome.runtime) {
    throw new Error('Chrome runtime not available');
  }
  
  const manifest = chrome.runtime.getManifest();
  console.log('📦 Extension manifest:', manifest);
  
  return {
    manifest,
    version: manifest.version,
    name: manifest.name
  };
}

// 2. Check storage state
async function checkStorageState() {
  const storage = await chrome.storage.local.get();
  const syncStorage = await chrome.storage.sync.get();
  
  console.log('💾 Local storage keys:', Object.keys(storage));
  console.log('💾 Sync storage keys:', Object.keys(syncStorage));
  
  // Check critical keys
  const criticalKeys = ['blacklist', 'timeLimits', 'dailyUsage', 'pomodoroStatus'];
  const missingKeys = criticalKeys.filter(key => !(key in storage));
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ Missing critical storage keys:', missingKeys);
  }
  
  // Check data types
  if (storage.timeLimits && !Array.isArray(storage.timeLimits)) {
    console.error('❌ timeLimits is not an array:', typeof storage.timeLimits);
  }
  
  if (storage.dailyUsage && typeof storage.dailyUsage !== 'object') {
    console.error('❌ dailyUsage is not an object:', typeof storage.dailyUsage);
  }
  
  // Check if dailyUsage has today's date
  const today = new Date().toISOString().split('T')[0];
  if (storage.dailyUsage && !storage.dailyUsage[today]) {
    console.warn('⚠️ dailyUsage missing today\'s date:', today);
  }
  
  return {
    local: storage,
    sync: syncStorage,
    missingKeys,
    today
  };
}

// 3. Check DNR rules
async function checkDNRRules() {
  try {
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    const sessionRules = await chrome.declarativeNetRequest.getSessionRules();
    
    console.log('🛡️ Dynamic rules count:', dynamicRules.length);
    console.log('🛡️ Session rules count:', sessionRules.length);
    
    // Categorize rules
    const pomodoroRules = dynamicRules.filter(r => r.id >= 1000 && r.id < 2000);
    const blacklistRules = dynamicRules.filter(r => r.id >= 2000 && r.id < 3000);
    const otherRules = dynamicRules.filter(r => r.id < 1000 || r.id >= 3000);
    
    console.log('📊 Rule breakdown:');
    console.log('  - Pomodoro rules:', pomodoroRules.length);
    console.log('  - Blacklist rules:', blacklistRules.length);
    console.log('  - Other rules:', otherRules.length);
    
    // Test regex patterns
    if (blacklistRules.length > 0) {
      const testRule = blacklistRules[0];
      console.log('🧪 Testing regex pattern:', testRule.condition.regexFilter);
      
      const testUrls = [
        'https://example.com',
        'https://www.example.com',
        'https://subdomain.example.com'
      ];
      
      testUrls.forEach(url => {
        try {
          const regex = new RegExp(testRule.condition.regexFilter);
          const matches = regex.test(url);
          console.log(`  ${matches ? '✅' : '❌'} ${url}`);
        } catch (e) {
          console.error(`  ❌ Invalid regex for ${url}:`, e);
        }
      });
    }
    
    return {
      dynamic: dynamicRules,
      session: sessionRules,
      pomodoro: pomodoroRules,
      blacklist: blacklistRules,
      other: otherRules
    };
  } catch (error) {
    console.error('❌ DNR API not available or failed:', error);
    return null;
  }
}

// 4. Test message passing
async function testMessagePassing() {
  const testMessage = {
    type: 'GET_INITIAL_STATE',
    payload: null,
    id: 'debug-test-' + Date.now(),
    ts: Date.now()
  };
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.error('❌ Message timeout after 5 seconds');
      resolve(null);
    }, 5000);
    
    chrome.runtime.sendMessage(testMessage, (response) => {
      clearTimeout(timeout);
      if (chrome.runtime.lastError) {
        console.error('❌ Message failed:', chrome.runtime.lastError);
        resolve(null);
      } else {
        console.log('📨 Message response:', response);
        resolve(response);
      }
    });
  });
}

// 5. Check service worker status
async function checkServiceWorkerStatus() {
  try {
    // Try to get service worker info
    const context = chrome.runtime.getContexts ? await chrome.runtime.getContexts() : null;
    console.log('🔧 Service worker contexts:', context);
    
    // Test if we can communicate with service worker
    const pingMessage = {
      type: 'PING',
      payload: null,
      id: 'ping-' + Date.now(),
      ts: Date.now()
    };
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Service worker not responding to ping');
        resolve({ status: 'unresponsive' });
      }, 3000);
      
      chrome.runtime.sendMessage(pingMessage, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          console.error('❌ Service worker error:', chrome.runtime.lastError);
          resolve({ status: 'error', error: chrome.runtime.lastError });
        } else {
          console.log('✅ Service worker responding:', response);
          resolve({ status: 'active', response });
        }
      });
    });
  } catch (error) {
    console.error('❌ Service worker check failed:', error);
    return { status: 'failed', error };
  }
}

// 6. Check permissions
async function checkPermissions() {
  const manifest = chrome.runtime.getManifest();
  const permissions = manifest.permissions || [];
  const hostPermissions = manifest.host_permissions || [];
  
  console.log('🔐 Permissions:', permissions);
  console.log('🌐 Host permissions:', hostPermissions);
  
  // Check if we have required permissions
  const requiredPermissions = ['storage', 'tabs', 'alarms', 'notifications', 'declarativeNetRequest', 'scripting'];
  const missingPermissions = requiredPermissions.filter(p => !permissions.includes(p));
  
  if (missingPermissions.length > 0) {
    console.error('❌ Missing required permissions:', missingPermissions);
  }
  
  return {
    permissions,
    hostPermissions,
    missingPermissions
  };
}

// 7. Test content script injection
async function testContentScriptInjection() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      console.warn('⚠️ No active tab found for content script test');
      return null;
    }
    
    const tab = tabs[0];
    console.log('📄 Testing content script on tab:', tab.url);
    
    // Check if content script is injected
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          hasContentScript: !!(window as any).v0ContentScriptInjected,
          hasGlobal: typeof (window as any).v0ContentScriptInjected !== 'undefined'
        };
      }
    });
    
    console.log('📄 Content script status:', result[0]?.result);
    return result[0]?.result;
  } catch (error) {
    console.error('❌ Content script test failed:', error);
    return null;
  }
}

// Main diagnostic function
async function runFullDiagnostic() {
  console.log('🚀 Running full extension diagnostic...\n');
  
  const results = {};
  
  // Run all diagnostics
  results.extension = await safeExecute('Extension Loaded', checkExtensionLoaded);
  results.storage = await safeExecute('Storage State', checkStorageState);
  results.dnr = await safeExecute('DNR Rules', checkDNRRules);
  results.messages = await safeExecute('Message Passing', testMessagePassing);
  results.serviceWorker = await safeExecute('Service Worker', checkServiceWorkerStatus);
  results.permissions = await safeExecute('Permissions', checkPermissions);
  results.contentScript = await safeExecute('Content Script', testContentScriptInjection);
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('========================');
  
  const checks = [
    { name: 'Extension Loaded', result: results.extension },
    { name: 'Storage State', result: results.storage },
    { name: 'DNR Rules', result: results.dnr },
    { name: 'Message Passing', result: results.messages },
    { name: 'Service Worker', result: results.serviceWorker },
    { name: 'Permissions', result: results.permissions },
    { name: 'Content Script', result: results.contentScript }
  ];
  
  checks.forEach(check => {
    const status = check.result ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
  });
  
  // Specific issues
  if (results.storage?.missingKeys?.length > 0) {
    console.log('\n⚠️ STORAGE ISSUES:');
    console.log('Missing keys:', results.storage.missingKeys);
  }
  
  if (results.dnr?.blacklist?.length === 0 && results.storage?.local?.blacklist?.length > 0) {
    console.log('\n⚠️ DNR ISSUES:');
    console.log('Blacklist has items but no DNR rules created');
  }
  
  if (!results.messages) {
    console.log('\n⚠️ COMMUNICATION ISSUES:');
    console.log('Background not responding to messages');
  }
  
  console.log('\n🏁 Diagnostic complete!');
  return results;
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  runFullDiagnostic();
} else {
  // Export for manual use
  (globalThis as any).runExtensionDiagnostic = runFullDiagnostic;
  console.log('🔧 Diagnostic functions available. Call runExtensionDiagnostic() to start.');
}
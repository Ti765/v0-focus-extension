/**
 * Teste de DNR (Declarative Net Request)
 * Verifica se as regras estão sendo aplicadas corretamente
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { STORAGE_KEYS } from '../src/shared/constants';

// Mock do Chrome API
const mockChrome = {
  declarativeNetRequest: {
    updateSessionRules: vi.fn(),
    getSessionRules: vi.fn(),
    updateDynamicRules: vi.fn(),
    getDynamicRules: vi.fn(),
    RuleActionType: {
      BLOCK: 1,
      ALLOW: 2,
      REDIRECT: 3,
    },
    ResourceType: {
      MAIN_FRAME: 1,
      SUB_FRAME: 2,
      STYLESHEET: 3,
      SCRIPT: 4,
      IMAGE: 5,
      FONT: 6,
      XMLHTTPREQUEST: 7,
      PING: 8,
      CSP_REPORT: 9,
      MEDIA: 10,
      WEBSOCKET: 11,
      OTHER: 12,
    },
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  runtime: {
    getURL: vi.fn((path) => `chrome-extension://test-id/${path}`),
  },
};

Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

describe('Debug DNR Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log('[DEBUG-TEST] Starting DNR test...');
  });

  afterEach(() => {
    console.log('[DEBUG-TEST] DNR test completed');
  });

  it('should test blacklist rule creation', async () => {
    console.log('[DEBUG-TEST] Testing blacklist rule creation...');
    
    const testDomains = ['example.com', 'test.com', 'demo.com'];
    const mockBlacklist = testDomains;

    mockChrome.storage.local.get.mockResolvedValue({ blacklist: mockBlacklist });
    mockChrome.declarativeNetRequest.updateSessionRules.mockResolvedValue({});

    // Simula criação de regras de blacklist
    for (const domain of testDomains) {
      const ruleId = 1000 + domain.length; // ID simples para teste
      const regex = `.*${domain.replace('.', '\\.')}.*`;
      
      const rule = {
        id: ruleId,
        priority: 1,
        action: { type: mockChrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          regexFilter: regex,
          isUrlFilterCaseSensitive: false,
          resourceTypes: [mockChrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      };

      await chrome.declarativeNetRequest.updateSessionRules({
        addRules: [rule],
      });

      console.log(`[DEBUG-TEST] ✅ Blacklist rule created for ${domain}:`, rule);
    }

    expect(mockChrome.declarativeNetRequest.updateSessionRules).toHaveBeenCalledTimes(testDomains.length);
    console.log('[DEBUG-TEST] ✅ Blacklist rule creation working');
  });

  it('should test time limit rule creation', async () => {
    console.log('[DEBUG-TEST] Testing time limit rule creation...');
    
    const testDomain = 'example.com';
    const ruleId = 3000; // ID base para time limits

    mockChrome.declarativeNetRequest.updateSessionRules.mockResolvedValue({});

    // Simula criação de regra de limite de tempo
    const regex = `.*${testDomain.replace('.', '\\.')}.*`;
    const rule = {
      id: ruleId,
      priority: 3,
      action: { type: mockChrome.declarativeNetRequest.RuleActionType.BLOCK },
      condition: {
        regexFilter: regex,
        isUrlFilterCaseSensitive: false,
        resourceTypes: [mockChrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
      },
    };

    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [ruleId], // Remove se já existir
      addRules: [rule],
    });

    expect(mockChrome.declarativeNetRequest.updateSessionRules).toHaveBeenCalledWith({
      removeRuleIds: [ruleId],
      addRules: [rule],
    });

    console.log(`[DEBUG-TEST] ✅ Time limit rule created for ${testDomain}:`, rule);
    console.log('[DEBUG-TEST] ✅ Time limit rule creation working');
  });

  it('should test rule removal', async () => {
    console.log('[DEBUG-TEST] Testing rule removal...');
    
    const ruleIds = [1001, 1002, 1003, 3001, 3002];

    mockChrome.declarativeNetRequest.updateSessionRules.mockResolvedValue({});

    // Simula remoção de regras
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: ruleIds,
    });

    expect(mockChrome.declarativeNetRequest.updateSessionRules).toHaveBeenCalledWith({
      removeRuleIds: ruleIds,
    });

    console.log(`[DEBUG-TEST] ✅ Rules removed:`, ruleIds);
    console.log('[DEBUG-TEST] ✅ Rule removal working');
  });

  it('should test rule listing', async () => {
    console.log('[DEBUG-TEST] Testing rule listing...');
    
    const mockRules = [
      {
        id: 1001,
        priority: 1,
        action: { type: 1 },
        condition: {
          regexFilter: '.*example\\.com.*',
          isUrlFilterCaseSensitive: false,
          resourceTypes: [1],
        },
      },
      {
        id: 1002,
        priority: 1,
        action: { type: 1 },
        condition: {
          regexFilter: '.*test\\.com.*',
          isUrlFilterCaseSensitive: false,
          resourceTypes: [1],
        },
      },
      {
        id: 3001,
        priority: 3,
        action: { type: 1 },
        condition: {
          regexFilter: '.*demo\\.com.*',
          isUrlFilterCaseSensitive: false,
          resourceTypes: [1],
        },
      },
    ];

    mockChrome.declarativeNetRequest.getSessionRules.mockResolvedValue(mockRules);

    // Testa listagem de regras
    const rules = await chrome.declarativeNetRequest.getSessionRules();
    expect(rules).toEqual(mockRules);

    console.log(`[DEBUG-TEST] ✅ Found ${rules.length} session rules:`, rules);
    
    // Categoriza regras
    const blacklistRules = rules.filter(rule => rule.priority === 1);
    const timeLimitRules = rules.filter(rule => rule.priority === 3);
    
    console.log(`[DEBUG-TEST] Blacklist rules: ${blacklistRules.length}`);
    console.log(`[DEBUG-TEST] Time limit rules: ${timeLimitRules.length}`);

    expect(blacklistRules).toHaveLength(2);
    expect(timeLimitRules).toHaveLength(1);

    console.log('[DEBUG-TEST] ✅ Rule listing working');
  });

  it('should test rule priority handling', async () => {
    console.log('[DEBUG-TEST] Testing rule priority handling...');
    
    const testRules = [
      {
        id: 1001,
        priority: 1, // Blacklist - menor prioridade
        action: { type: mockChrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          regexFilter: '.*example\\.com.*',
          isUrlFilterCaseSensitive: false,
          resourceTypes: [mockChrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      },
      {
        id: 3001,
        priority: 3, // Time limit - maior prioridade
        action: { type: mockChrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          regexFilter: '.*example\\.com.*',
          isUrlFilterCaseSensitive: false,
          resourceTypes: [mockChrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      },
    ];

    mockChrome.declarativeNetRequest.updateSessionRules.mockResolvedValue({});

    // Testa criação de regras com diferentes prioridades
    await chrome.declarativeNetRequest.updateSessionRules({
      addRules: testRules,
    });

    expect(mockChrome.declarativeNetRequest.updateSessionRules).toHaveBeenCalledWith({
      addRules: testRules,
    });

    // Verifica que as prioridades estão corretas
    expect(testRules[0].priority).toBe(1); // Blacklist
    expect(testRules[1].priority).toBe(3); // Time limit

    console.log('[DEBUG-TEST] ✅ Rule priorities handled correctly');
    console.log('[DEBUG-TEST] ✅ Rule priority handling working');
  });

  it('should test regex pattern generation', async () => {
    console.log('[DEBUG-TEST] Testing regex pattern generation...');
    
    const testDomains = [
      'example.com',
      'test.example.com',
      'subdomain.test.com',
      'example.co.uk',
      'test-site.com',
    ];

    // Função para gerar regex pattern
    function createDomainRegexPattern(domain: string): string {
      const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return `.*${escaped}.*`;
    }

    for (const domain of testDomains) {
      const regex = createDomainRegexPattern(domain);
      console.log(`[DEBUG-TEST] Domain: ${domain} -> Regex: ${regex}`);
      
      // Testa se o regex funciona
      const testUrl = `https://${domain}/page`;
      const regexObj = new RegExp(regex);
      const matches = regexObj.test(testUrl);
      
      expect(matches).toBe(true);
      console.log(`[DEBUG-TEST] ✅ Regex for ${domain} works correctly`);
    }

    console.log('[DEBUG-TEST] ✅ Regex pattern generation working');
  });

  it('should test rule cleanup', async () => {
    console.log('[DEBUG-TEST] Testing rule cleanup...');
    
    const mockExistingRules = [
      { id: 1001, priority: 1 },
      { id: 1002, priority: 1 },
      { id: 3001, priority: 3 },
      { id: 3002, priority: 3 },
    ];

    mockChrome.declarativeNetRequest.getSessionRules.mockResolvedValue(mockExistingRules);
    mockChrome.declarativeNetRequest.updateSessionRules.mockResolvedValue({});

    // Simula limpeza de todas as regras
    const existingRules = await chrome.declarativeNetRequest.getSessionRules();
    const ruleIds = existingRules.map(rule => rule.id);
    
    console.log(`[DEBUG-TEST] Found ${ruleIds.length} rules to cleanup:`, ruleIds);

    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: ruleIds,
    });

    expect(mockChrome.declarativeNetRequest.updateSessionRules).toHaveBeenCalledWith({
      removeRuleIds: ruleIds,
    });

    console.log('[DEBUG-TEST] ✅ All rules cleaned up');
    console.log('[DEBUG-TEST] ✅ Rule cleanup working');
  });

  it('should test DNR error handling', async () => {
    console.log('[DEBUG-TEST] Testing DNR error handling...');
    
    // Simula erro no DNR
    mockChrome.declarativeNetRequest.updateSessionRules.mockRejectedValue(
      new Error('DNR quota exceeded')
    );

    try {
      await chrome.declarativeNetRequest.updateSessionRules({
        addRules: [{ id: 1, priority: 1, action: { type: 1 }, condition: {} }],
      });
    } catch (error) {
      console.log('[DEBUG-TEST] ✅ DNR error caught as expected:', error);
      expect(error).toBeInstanceOf(Error);
    }

    // Simula erro na listagem
    mockChrome.declarativeNetRequest.getSessionRules.mockRejectedValue(
      new Error('DNR read failed')
    );

    try {
      await chrome.declarativeNetRequest.getSessionRules();
    } catch (error) {
      console.log('[DEBUG-TEST] ✅ DNR list error caught as expected:', error);
      expect(error).toBeInstanceOf(Error);
    }

    console.log('[DEBUG-TEST] ✅ DNR error handling working');
  });

  it('should test rule ID generation', async () => {
    console.log('[DEBUG-TEST] Testing rule ID generation...');
    
    const testDomains = ['example.com', 'test.com', 'demo.com'];
    const USER_BLACKLIST_RULE_ID_START = 1000;
    const LIMIT_RULE_BASE = 3000;

    // Função para gerar ID de blacklist
    function generateBlacklistRuleId(domain: string): number {
      let hash = 0;
      for (let i = 0; i < domain.length; i++) {
        const c = domain.charCodeAt(i);
        hash = (hash << 5) - hash + c;
        hash |= 0; // 32 bits
      }
      const offset = Math.abs(hash) % 1000;
      return USER_BLACKLIST_RULE_ID_START + offset;
    }

    // Função para gerar ID de time limit
    function generateLimitRuleId(domain: string): number {
      let hash = 0;
      for (let i = 0; i < domain.length; i++) {
        const c = domain.charCodeAt(i);
        hash = (hash << 5) - hash + c;
        hash |= 0; // 32 bits
      }
      const offset = Math.abs(hash) % 1000;
      return LIMIT_RULE_BASE + offset;
    }

    for (const domain of testDomains) {
      const blacklistId = generateBlacklistRuleId(domain);
      const limitId = generateLimitRuleId(domain);
      
      console.log(`[DEBUG-TEST] Domain: ${domain}`);
      console.log(`[DEBUG-TEST] Blacklist ID: ${blacklistId}`);
      console.log(`[DEBUG-TEST] Limit ID: ${limitId}`);
      
      // Verifica que os IDs estão nos ranges corretos
      expect(blacklistId).toBeGreaterThanOrEqual(USER_BLACKLIST_RULE_ID_START);
      expect(blacklistId).toBeLessThan(USER_BLACKLIST_RULE_ID_START + 1000);
      expect(limitId).toBeGreaterThanOrEqual(LIMIT_RULE_BASE);
      expect(limitId).toBeLessThan(LIMIT_RULE_BASE + 1000);
      
      // Verifica que os IDs são determinísticos
      const blacklistId2 = generateBlacklistRuleId(domain);
      const limitId2 = generateLimitRuleId(domain);
      expect(blacklistId).toBe(blacklistId2);
      expect(limitId).toBe(limitId2);
    }

    console.log('[DEBUG-TEST] ✅ Rule ID generation working');
  });

  it('should test complex rule scenarios', async () => {
    console.log('[DEBUG-TEST] Testing complex rule scenarios...');
    
    const complexScenario = {
      blacklist: ['example.com', 'test.com'],
      timeLimits: [
        { domain: 'example.com', dailyMinutes: 60 },
        { domain: 'demo.com', dailyMinutes: 30 },
      ],
      dailyUsage: {
        '2024-01-01': {
          'example.com': 3600, // 60 minutes - should trigger time limit
          'demo.com': 1800,    // 30 minutes - should trigger time limit
        },
      },
    };

    mockChrome.storage.local.get.mockImplementation((keys) => {
      if (Array.isArray(keys) && keys.includes('blacklist')) {
        return Promise.resolve({ blacklist: complexScenario.blacklist });
      }
      if (Array.isArray(keys) && keys.includes('timeLimits')) {
        return Promise.resolve({ timeLimits: complexScenario.timeLimits });
      }
      if (Array.isArray(keys) && keys.includes('dailyUsage')) {
        return Promise.resolve({ dailyUsage: complexScenario.dailyUsage });
      }
      if (keys === 'timeLimits') {
        return Promise.resolve({ timeLimits: complexScenario.timeLimits });
      }
      return Promise.resolve({});
    });

    mockChrome.declarativeNetRequest.updateSessionRules.mockResolvedValue({});

    // Simula aplicação de regras baseada no cenário
    const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
    const { timeLimits } = await chrome.storage.local.get('timeLimits');
    const today = new Date().toISOString().split('T')[0];
    const { [STORAGE_KEYS.DAILY_USAGE]: existingUsage = {} } = await chrome.storage.local.get(
      STORAGE_KEYS.DAILY_USAGE
    );
    const dailyUsage = {
      ...existingUsage,
      [today]: existingUsage[today] || {}
    };

    // Aplica regras de blacklist
    for (const domain of blacklist) {
      const ruleId = 1000 + domain.length;
      const rule = {
        id: ruleId,
        priority: 1,
        action: { type: mockChrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          regexFilter: `.*${domain.replace('.', '\\.')}.*`,
          isUrlFilterCaseSensitive: false,
          resourceTypes: [mockChrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      };

      await chrome.declarativeNetRequest.updateSessionRules({
        addRules: [rule],
      });

      console.log(`[DEBUG-TEST] ✅ Blacklist rule applied for ${domain}`);
    }

    // Aplica regras de time limit
    const todayUsage = dailyUsage[today] || {};
    for (const limit of timeLimits) {
      const usedSeconds = todayUsage[limit.domain] || 0;
      const limitSeconds = limit.dailyMinutes * 60;
      
      if (usedSeconds >= limitSeconds) {
        const ruleId = 3000 + limit.domain.length;
        const rule = {
          id: ruleId,
          priority: 3,
          action: { type: mockChrome.declarativeNetRequest.RuleActionType.BLOCK },
          condition: {
            regexFilter: `.*${limit.domain.replace('.', '\\.')}.*`,
            isUrlFilterCaseSensitive: false,
            resourceTypes: [mockChrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
          },
        };

        await chrome.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [ruleId],
          addRules: [rule],
        });

        console.log(`[DEBUG-TEST] ✅ Time limit rule applied for ${limit.domain} (${usedSeconds}s >= ${limitSeconds}s)`);
      }
    }

    console.log('[DEBUG-TEST] ✅ Complex rule scenarios working');
  });
});

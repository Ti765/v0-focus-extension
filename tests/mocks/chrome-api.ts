/**
 * Comprehensive Chrome API mocks for testing
 * Simulates Chrome extension APIs with proper async behavior
 */

import type { chrome as ChromeType } from '@types/chrome';

export interface Chrome {
  storage: {
    local: ChromeStorageArea;
    sync: ChromeStorageArea;
    session: ChromeStorageArea;
    onChanged: ChromeStorageOnChanged;
  };
  declarativeNetRequest: ChromeDeclarativeNetRequest;
  alarms: ChromeAlarms;
  tabs: ChromeTabs;
  runtime: ChromeRuntime;
  notifications: ChromeNotifications;
  scripting: ChromeScripting;
  windows: ChromeWindows;
}

interface ChromeStorageArea {
  get(keys?: string | string[] | Record<string, any>): Promise<Record<string, any>>;
  set(items: Record<string, any>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

interface ChromeStorageOnChanged {
  addListener(callback: (changes: Record<string, chrome.storage.StorageChange>, areaName: 'local' | 'sync' | 'session') => void): void;
  removeListener(callback: Function): void;
  hasListener(callback: Function): boolean;
}

interface ChromeDeclarativeNetRequest {
  getDynamicRules(): Promise<chrome.declarativeNetRequest.Rule[]>;
  getSessionRules(): Promise<chrome.declarativeNetRequest.Rule[]>;
  updateDynamicRules(options: chrome.declarativeNetRequest.UpdateRuleOptions): Promise<void>;
  updateSessionRules(options: chrome.declarativeNetRequest.UpdateRuleOptions): Promise<void>;
  reset(): void;
  RuleActionType: {
    REDIRECT: chrome.declarativeNetRequest.RuleActionType;
    MODIFY_HEADERS: chrome.declarativeNetRequest.RuleActionType;
    BLOCK: chrome.declarativeNetRequest.RuleActionType;
  };
  ResourceType: {
    MAIN_FRAME: chrome.declarativeNetRequest.ResourceType;
    SUB_FRAME: chrome.declarativeNetRequest.ResourceType;
  };
}

interface ChromeAlarms {
  create(name: string, alarmInfo: chrome.alarms.AlarmCreateInfo): Promise<void>;
  get(name?: string): Promise<chrome.alarms.Alarm | undefined>;
  getAll(): Promise<chrome.alarms.Alarm[]>;
  clear(name?: string): Promise<boolean>;
  clearAll(): Promise<void>;
  onAlarm: {
    addListener(callback: (alarm: chrome.alarms.Alarm) => void): void;
    removeListener(callback: Function): void;
  };
}

interface ChromeTabs {
  query(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]>;
  get(tabId: number): Promise<chrome.tabs.Tab>;
  update(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab>;
  reset(): void;
  onActivated: {
    addListener(callback: (activeInfo: chrome.tabs.TabActiveInfo) => void): void;
    removeListener(callback: Function): void;
  };
  onUpdated: {
    addListener(callback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void): void;
    removeListener(callback: Function): void;
  };
}

interface ChromeRuntime {
  getManifest(): chrome.runtime.Manifest;
  getURL(path: string): string;
  sendMessage(message: any, responseCallback?: (response: any) => void): void;
  onMessage: {
    addListener(callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean | void): void;
    removeListener(callback: Function): void;
  };
  onConnect: {
    addListener(callback: (port: chrome.runtime.Port) => void): void;
    removeListener(callback: Function): void;
  };
  lastError: chrome.runtime.LastError | undefined;
  reset(): void;
}

interface ChromeNotifications {
  create(notificationId: string, options: chrome.notifications.NotificationOptions): Promise<string>;
  clear(notificationId: string): Promise<boolean>;
  onButtonClicked: {
    addListener(callback: (notificationId: string, buttonIndex: number) => void): void;
  };
}

interface ChromeScripting {
  executeScript(injection: chrome.scripting.ScriptInjection): Promise<any[]>;
}

interface ChromeWindows {
  onFocusChanged: {
    addListener(callback: (windowId: number) => void): void;
    removeListener(callback: Function): void;
  };
}

class MockStorageArea implements ChromeStorageArea {
  private data: Record<string, any> = {};
  private previousData: Record<string, any> = {};

  async get(keys?: string | string[] | Record<string, any>): Promise<Record<string, any>> {
    if (!keys) {
      return { ...this.data };
    }

    if (typeof keys === 'string') {
      return { [keys]: this.data[keys] };
    }

    if (Array.isArray(keys)) {
      const result: Record<string, any> = {};
      for (const key of keys) {
        result[key] = this.data[key];
      }
      return result;
    }

    // Object with default values
    const result: Record<string, any> = {};
    for (const key in keys) {
      result[key] = this.data[key] ?? keys[key];
    }
    return result;
  }

  async set(items: Record<string, any>): Promise<void> {
    // Store previous values for onChanged event
    this.previousData = { ...this.data };
    Object.assign(this.data, items);
    // Trigger onChanged listeners
    this.triggerOnChanged(items);
  }

  async remove(keys: string | string[]): Promise<void> {
    const keysToRemove = Array.isArray(keys) ? keys : [keys];
    const changes: Record<string, chrome.storage.StorageChange> = {};
    
    for (const key of keysToRemove) {
      if (key in this.data) {
        changes[key] = {
          oldValue: this.data[key],
          newValue: undefined,
        };
        delete this.data[key];
      }
    }
    
    if (Object.keys(changes).length > 0) {
      this.triggerOnChanged(changes);
    }
  }

  async clear(): Promise<void> {
    const changes: Record<string, chrome.storage.StorageChange> = {};
    this.previousData = { ...this.data };
    for (const key in this.data) {
      changes[key] = {
        oldValue: this.data[key],
        newValue: undefined,
      };
    }
    this.data = {};
    if (Object.keys(changes).length > 0) {
      this.triggerOnChanged(changes);
    }
  }

  private triggerOnChanged(changes: Record<string, any>): void {
    const storageChanges: Record<string, chrome.storage.StorageChange> = {};
    for (const key in changes) {
      const oldValue = this.previousData[key];
      const newValue = changes[key]?.newValue ?? changes[key];
      storageChanges[key] = {
        oldValue,
        newValue,
      };
    }
    // Update previousData after creating changes object
    this.previousData = { ...this.data };
    
    if (mockChrome.storage.onChanged.listeners.length > 0) {
      const areaName = this === mockChrome.storage.local ? 'local' : 
                      this === mockChrome.storage.sync ? 'sync' : 'session';
      mockChrome.storage.onChanged.listeners.forEach(cb => {
        cb(storageChanges, areaName);
      });
    }
  }

  getData(): Record<string, any> {
    return { ...this.data };
  }

  setData(data: Record<string, any>): void {
    this.data = { ...data };
  }
}

class MockDeclarativeNetRequest implements ChromeDeclarativeNetRequest {
  private dynamicRules: chrome.declarativeNetRequest.Rule[] = [];
  private sessionRules: chrome.declarativeNetRequest.Rule[] = [];

  RuleActionType = {
    REDIRECT: 'redirect' as chrome.declarativeNetRequest.RuleActionType,
    MODIFY_HEADERS: 'modifyHeaders' as chrome.declarativeNetRequest.RuleActionType,
    BLOCK: 'block' as chrome.declarativeNetRequest.RuleActionType,
  };

  ResourceType = {
    MAIN_FRAME: 'main_frame' as chrome.declarativeNetRequest.ResourceType,
    SUB_FRAME: 'sub_frame' as chrome.declarativeNetRequest.ResourceType,
  };

  async getDynamicRules(): Promise<chrome.declarativeNetRequest.Rule[]> {
    return [...this.dynamicRules];
  }

  async getSessionRules(): Promise<chrome.declarativeNetRequest.Rule[]> {
    return [...this.sessionRules];
  }

  async updateDynamicRules(options: chrome.declarativeNetRequest.UpdateRuleOptions): Promise<void> {
    if (options.removeRuleIds) {
      this.dynamicRules = this.dynamicRules.filter(r => !options.removeRuleIds!.includes(r.id));
    }
    if (options.addRules) {
      this.dynamicRules.push(...options.addRules);
    }
  }

  async updateSessionRules(options: chrome.declarativeNetRequest.UpdateRuleOptions): Promise<void> {
    if (options.removeRuleIds) {
      this.sessionRules = this.sessionRules.filter(r => !options.removeRuleIds!.includes(r.id));
    }
    if (options.addRules) {
      this.sessionRules.push(...options.addRules);
    }
  }

  reset(): void {
    this.dynamicRules = [];
    this.sessionRules = [];
  }
}

class MockAlarms implements ChromeAlarms {
  private alarms: Map<string, chrome.alarms.Alarm> = new Map();
  public onAlarm = {
    listeners: [] as Array<(alarm: chrome.alarms.Alarm) => void>,
    addListener(callback: (alarm: chrome.alarms.Alarm) => void): void {
      this.listeners.push(callback);
    },
    removeListener(callback: Function): void {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    },
  };

  async create(name: string, alarmInfo: chrome.alarms.AlarmCreateInfo): Promise<void> {
    const alarm: chrome.alarms.Alarm = {
      name,
      scheduledTime: alarmInfo.when || Date.now() + (alarmInfo.delayInMinutes || 0) * 60 * 1000,
      periodInMinutes: alarmInfo.periodInMinutes,
    };
    this.alarms.set(name, alarm);
  }

  async get(name?: string): Promise<chrome.alarms.Alarm | undefined> {
    if (!name) {
      return Array.from(this.alarms.values())[0];
    }
    return this.alarms.get(name);
  }

  async getAll(): Promise<chrome.alarms.Alarm[]> {
    return Array.from(this.alarms.values());
  }

  async clear(name?: string): Promise<boolean> {
    if (!name) {
      this.alarms.clear();
      return true;
    }
    return this.alarms.delete(name);
  }

  async clearAll(): Promise<void> {
    this.alarms.clear();
  }

  triggerAlarm(name: string): void {
    const alarm = this.alarms.get(name);
    if (alarm) {
      this.onAlarm.listeners.forEach(cb => cb(alarm));
    }
  }
}

class MockTabs implements ChromeTabs {
  private tabs: chrome.tabs.Tab[] = [
    { id: 1, url: 'https://example.com', active: true, windowId: 1 },
  ];

  onActivated = {
    listeners: [] as Array<(activeInfo: chrome.tabs.TabActiveInfo) => void>,
    addListener(callback: (activeInfo: chrome.tabs.TabActiveInfo) => void): void {
      this.listeners.push(callback);
    },
    removeListener(callback: Function): void {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    },
  };

  onUpdated = {
    listeners: [] as Array<(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void>,
    addListener(callback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void): void {
      this.listeners.push(callback);
    },
    removeListener(callback: Function): void {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    },
  };

  async query(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    return this.tabs.filter(tab => {
      if (queryInfo.active !== undefined && tab.active !== queryInfo.active) return false;
      if (queryInfo.url && tab.url && !queryInfo.url.includes(tab.url.split('/')[2])) return false;
      return true;
    });
  }

  async get(tabId: number): Promise<chrome.tabs.Tab> {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) throw new Error(`Tab ${tabId} not found`);
    return tab;
  }

  async update(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab> {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) throw new Error(`Tab ${tabId} not found`);
    Object.assign(tab, updateProperties);
    return tab;
  }

  reset(): void {
    this.tabs = [
      { id: 1, url: 'https://example.com', active: true, windowId: 1 },
    ];
    this.onActivated.listeners = [];
    this.onUpdated.listeners = [];
  }

  setTabs(tabs: chrome.tabs.Tab[]): void {
    this.tabs = tabs;
  }
}

class MockRuntime implements ChromeRuntime {
  private messageListeners: Array<(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean | void> = [];
  private connectListeners: Array<(port: chrome.runtime.Port) => void> = [];
  public lastError: chrome.runtime.LastError | undefined = undefined;

  getManifest(): chrome.runtime.Manifest {
    return {
      manifest_version: 3,
      name: 'v0-focus-extension',
      version: '1.0.0',
      permissions: ['storage', 'declarativeNetRequest', 'alarms', 'tabs'],
    } as chrome.runtime.Manifest;
  }

  getURL(path: string): string {
    return `chrome-extension://test-id/${path}`;
  }

  sendMessage(message: any, responseCallback?: (response: any) => void): void {
    // Simulate message handling
    if (this.messageListeners.length > 0) {
      const sender: chrome.runtime.MessageSender = {
        tab: { id: 1 },
      } as chrome.runtime.MessageSender;
      
      let responseSent = false;
      const sendResponse = (response?: any) => {
        if (!responseSent && responseCallback) {
          responseSent = true;
          responseCallback(response);
        }
      };

      this.messageListeners.forEach(listener => {
        const result = listener(message, sender, sendResponse);
        if (result === true) {
          // Async response expected
        }
      });
    } else if (responseCallback) {
      this.lastError = { message: 'Receiving end does not exist' };
      responseCallback(undefined);
    }
  }

  onMessage = {
    addListener(callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean | void): void {
      mockChrome.runtime.messageListeners.push(callback);
    },
    removeListener(callback: Function): void {
      mockChrome.runtime.messageListeners = mockChrome.runtime.messageListeners.filter(cb => cb !== callback);
    },
  };

  onConnect = {
    addListener(callback: (port: chrome.runtime.Port) => void): void {
      mockChrome.runtime.connectListeners.push(callback);
    },
    removeListener(callback: Function): void {
      mockChrome.runtime.connectListeners = mockChrome.runtime.connectListeners.filter(cb => cb !== callback);
    },
  };

  reset(): void {
    this.messageListeners = [];
    this.connectListeners = [];
    this.lastError = undefined;
  }
}

class MockNotifications implements ChromeNotifications {
  private notifications: Map<string, chrome.notifications.NotificationOptions> = new Map();
  public onButtonClicked = {
    listeners: [] as Array<(notificationId: string, buttonIndex: number) => void>,
    addListener(callback: (notificationId: string, buttonIndex: number) => void): void {
      this.listeners.push(callback);
    },
  };

  async create(notificationId: string, options: chrome.notifications.NotificationOptions): Promise<string> {
    this.notifications.set(notificationId, options);
    return notificationId;
  }

  async clear(notificationId: string): Promise<boolean> {
    return this.notifications.delete(notificationId);
  }
}

class MockScripting implements ChromeScripting {
  async executeScript(injection: chrome.scripting.ScriptInjection): Promise<any[]> {
    if ('func' in injection && injection.func) {
      // Execute function
      return [injection.func()];
    }
    if ('files' in injection && injection.files) {
      // Script injection - return mock result
      return [{ result: 'script executed' }];
    }
    return [];
  }
}

class MockWindows implements ChromeWindows {
  public onFocusChanged = {
    listeners: [] as Array<(windowId: number) => void>,
    addListener(callback: (windowId: number) => void): void {
      this.listeners.push(callback);
    },
    removeListener(callback: Function): void {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    },
  };
}

class MockStorageOnChanged implements ChromeStorageOnChanged {
  listeners: Array<(changes: Record<string, chrome.storage.StorageChange>, areaName: 'local' | 'sync' | 'session') => void> = [];

  addListener(callback: (changes: Record<string, chrome.storage.StorageChange>, areaName: 'local' | 'sync' | 'session') => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: Function): void {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  hasListener(callback: Function): boolean {
    return this.listeners.includes(callback as any);
  }
}

export const mockChrome: Chrome = {
  storage: {
    local: new MockStorageArea(),
    sync: new MockStorageArea(),
    session: new MockStorageArea(),
    onChanged: new MockStorageOnChanged(),
  },
  declarativeNetRequest: new MockDeclarativeNetRequest(),
  alarms: new MockAlarms(),
  tabs: new MockTabs(),
  runtime: new MockRuntime(),
  notifications: new MockNotifications(),
  scripting: new MockScripting(),
  windows: new MockWindows(),
};

export function setupChromeMocks(): void {
  global.chrome = mockChrome as any;
}

// Export types for use in tests
export type { Chrome };


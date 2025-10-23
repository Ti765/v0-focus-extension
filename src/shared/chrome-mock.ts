interface ChromeStorageArea {
  get(keys?: string | string[] | object): Promise<any>;
  set(items: object): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

interface ChromeStorageChangeInfo {
  oldValue?: any;
  newValue?: any;
}

type StorageChangeListener = (changes: Record<string, ChromeStorageChangeInfo>, areaName: string) => void;

const createStorageChangeHub = () => {
  const listeners = new Set<StorageChangeListener>();
  return {
    addListener: (cb: StorageChangeListener) => listeners.add(cb),
    removeListener: (cb: StorageChangeListener) => listeners.delete(cb),
    emit: (changes: Record<string, ChromeStorageChangeInfo>, areaName: string) => {
      // make a copy to avoid mutation during iteration
      Array.from(listeners).forEach((cb) => cb(changes, areaName));
    },
    hasListeners: () => listeners.size > 0,
  };
};

interface ChromeStorage {
  local: ChromeStorageArea;
  sync: ChromeStorageArea;
  onChanged: { addListener: (cb: StorageChangeListener) => void; removeListener: (cb: StorageChangeListener) => void; emit: (changes: Record<string, ChromeStorageChangeInfo>, areaName: string) => void };
}

interface ChromeRuntime {
  id?: string;
  sendMessage: <T = any>(message: any, callback?: (response: T) => void) => void;
  onMessage: {
    addListener: (cb: (msg: any, sender: any, sendResponse: any) => void) => void;
    removeListener: (cb: (msg: any, sender: any, sendResponse: any) => void) => void;
    // test helper: dispatch a message to registered listeners
    emit?: (msg: any, sender?: any, sendResponse?: any) => void;
  };
  lastError: null | { message: string };
}

declare const chrome: { runtime: ChromeRuntime; storage: ChromeStorage };
export const isChromeExtension = typeof chrome !== "undefined" && !!(chrome as any).runtime && !!(chrome as any).runtime.id;

// in-memory mock storage backing
const makeMockStorageArea = (mem: Record<string, any>, hub: ReturnType<typeof createStorageChangeHub>, areaName: string) => ({
  get: async (keys?: string | string[] | Record<string, any>) => {
    if (typeof keys === "string") return { [keys]: mem[keys] };
    if (Array.isArray(keys)) return keys.reduce((acc: Record<string, any>, k) => ((acc[k] = mem[k]), acc), {} as Record<string, any>);
    if (keys && typeof keys === "object") return Object.keys(keys).reduce((acc: Record<string, any>, k) => ((acc[k] = mem[k] ?? (keys as any)[k]), acc), {} as Record<string, any>);
    return { ...mem };
  },
  set: async (items: Record<string, any>) => {
    const old = { ...mem };
    Object.assign(mem, items);
    const changes: Record<string, ChromeStorageChangeInfo> = {};
    for (const k of Object.keys(items)) {
      changes[k] = { oldValue: old[k], newValue: mem[k] };
    }
    hub.emit(changes, areaName);
  },
  remove: async (keys: string | string[]) => {
    const arr = Array.isArray(keys) ? keys : [keys];
    const old = { ...mem };
    for (const k of arr) delete mem[k];
    const changes: Record<string, ChromeStorageChangeInfo> = {};
    for (const k of arr) changes[k] = { oldValue: old[k], newValue: undefined };
    hub.emit(changes, areaName);
  },
  clear: async () => {
    const old = { ...mem };
    for (const k of Object.keys(mem)) delete mem[k];
    const changes: Record<string, ChromeStorageChangeInfo> = {};
    for (const k of Object.keys(old)) changes[k] = { oldValue: old[k], newValue: undefined };
    hub.emit(changes, areaName);
  },
});

const storageHub = createStorageChangeHub();
const localMem: Record<string, any> = {};
const syncMem: Record<string, any> = {};

const mockChromeAPI: { runtime: ChromeRuntime; storage: ChromeStorage } = {
  runtime: {
    id: "mock-extension-id",
    sendMessage: (message: any, callback?: (response: any) => void) => {
      void message;
      // very small mock: echo minimal response and set lastError to null
      (mockChromeAPI.runtime as any).lastError = null;
      if (callback) callback({ ok: true });
    },
      // simple listener registry for onMessage to allow tests to register handlers
        onMessage: (function () {
          const listeners = new Set<(msg: any, sender: any, sendResponse: any) => void>();
          const obj = {
            addListener: (cb: (msg: any, sender: any, sendResponse: any) => void) => listeners.add(cb),
            removeListener: (cb: (msg: any, sender: any, sendResponse: any) => void) => listeners.delete(cb),
            // helper to dispatch messages to registered listeners (used by tests)
            emit: (msg: any, sender: any = {}, sendResponse?: any) => {
              Array.from(listeners).forEach((cb) => {
                try {
                  cb(msg, sender, sendResponse ?? (() => {}));
                } catch (e) {
                  // swallow test errors here
                }
              });
            },
          } as {
            addListener: (cb: (msg: any, sender: any, sendResponse: any) => void) => void;
            removeListener: (cb: (msg: any, sender: any, sendResponse: any) => void) => void;
            emit: (msg: any, sender?: any, sendResponse?: any) => void;
          };
          return obj;
        })(),
      lastError: null,
  },
  storage: {
    local: makeMockStorageArea(localMem, storageHub, "local"),
    sync: makeMockStorageArea(syncMem, storageHub, "sync"),
    onChanged: {
      addListener: (cb: StorageChangeListener) => storageHub.addListener(cb),
      removeListener: (cb: StorageChangeListener) => storageHub.removeListener(cb),
      emit: (changes: Record<string, ChromeStorageChangeInfo>, areaName: string) => storageHub.emit(changes, areaName),
    },
  },
};

// (helper removed — not needed in the mock)

// Export real chrome API in extension environment, mock in development
export const chromeAPI = isChromeExtension ? chrome : mockChromeAPI;

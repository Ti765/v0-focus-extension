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
      listeners.forEach((cb) => cb(changes, areaName));
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
  onMessage: { addListener: (cb: (msg: any, sender: any, sendResponse: any) => void) => void; removeListener: (cb: (msg: any, sender: any, sendResponse: any) => void) => void };
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
    sendMessage: (_message: any, callback?: (response: any) => void) => {
      // very small mock: echo minimal response
      if (callback) callback({ ok: true });
    },
    onMessage: {
      addListener: () => {},
      removeListener: () => {},
    },
    lastError: null,
  },
  storage: {
    local: makeMockStorageArea(localMem, storageHub, "local"),
    sync: makeMockStorageArea(syncMem, storageHub, "sync"),
    onChanged: {
      addListener: storageHub.addListener,
      removeListener: storageHub.removeListener,
      emit: storageHub.emit,
    },
  },
};

// (helper removed — not needed in the mock)

// Export real chrome API in extension environment, mock in development
export const chromeAPI = isChromeExtension ? chrome : mockChromeAPI;

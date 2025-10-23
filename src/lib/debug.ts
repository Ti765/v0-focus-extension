export const isDebug = typeof (globalThis as any).__V0_DEBUG !== 'undefined' ? !!(globalThis as any).__V0_DEBUG : false;

export function debug(...args: any[]) {
  if (isDebug) {
    // eslint-disable-next-line no-console
    console.debug(...args);
  }
}

export default debug;

/**
 * Process Polyfill for Chrome Extensions
 * 
 * Chrome extensions don't have the Node.js `process` object.
 * This polyfill defines it globally IMMEDIATELY using an IIFE.
 * 
 * CRITICAL: This code executes synchronously as soon as the module is loaded,
 * before any other code in the module can run. This ensures `process` is
 * available when the Sentry SDK (or any other library) tries to access it.
 */

// IIFE (Immediately Invoked Function Expression) to execute synchronously
(function defineProcessPolyfill() {
  // Only define if process doesn't already exist
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).process === 'undefined') {
    // Get environment from Vite-injected import.meta.env
    let env = 'production';
    
    try {
      // @ts-ignore - import.meta.env is injected by Vite at build time
      const viteEnv = import.meta.env;
      if (viteEnv) {
        env = viteEnv.MODE || viteEnv.NODE_ENV || 'production';
      }
    } catch {
      // Fallback if import.meta.env is not available
    }

    // Define minimal process object with only what libraries typically need
    // This executes SYNCHRONOUSLY before any other module code runs
    (globalThis as any).process = {
      env: {
        NODE_ENV: env,
      },
      version: '',
      versions: {},
      platform: 'browser',
      browser: true,
    };
    
    // Log only in development to confirm polyfill loaded
    if (env === 'development') {
      console.log('[v0][Polyfill] process object defined:', (globalThis as any).process);
    }
  }
})();

export {};


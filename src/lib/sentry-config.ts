/**
 * Sentry Configuration
 * Shared configuration for all extension contexts
 * Based on official Sentry documentation and best practices for browser extensions
 * 
 * IMPORTANT: For browser extensions, we MUST NOT use Sentry.init().
 * Instead, we manually create clients with isolated scopes to avoid global state pollution.
 * 
 * @see https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/
 */

// Note: We don't import Sentry here since integrations will be imported
// separately in each context file (React vs Browser)

/**
 * Sentry DSNs from project configuration
 * 
 * IMPORTANT: React and Browser SDKs require separate DSNs in Sentry.
 * - SENTRY_DSN_REACT: For @sentry/react (popup and options pages)
 * - SENTRY_DSN_BROWSER: For @sentry/browser (background and content scripts)
 * 
 * @see sentry_configuration.md
 * @see sentry_browser.md
 */
export const SENTRY_DSN_REACT = "https://58e161b5578429493e2034e4dadd3f58@o4510270313660416.ingest.us.sentry.io/4510293785640960";
export const SENTRY_DSN_BROWSER = "https://817f965a1b1055130ff59d97bef82e5f@o4510270313660416.ingest.us.sentry.io/4510294325198848";

// Keep SENTRY_DSN for backward compatibility (defaults to React DSN)
export const SENTRY_DSN = SENTRY_DSN_REACT;

/**
 * Determine environment based on build mode
 * 
 * Vite injects environment variables at build-time:
 * - import.meta.env.MODE and import.meta.env.NODE_ENV are always available after Vite build
 * - process.env.NODE_ENV is replaced by Vite with a string literal during build
 * 
 * IMPORTANT: Must safely handle process.env.NODE_ENV in case Vite didn't replace it,
 * since process doesn't exist in Chrome extension runtime.
 */
export const getEnvironment = (): string => {
  try {
    // Direct access to Vite-injected environment variables
    // @ts-expect-error - import.meta.env is injected by Vite at build time
    const env = import.meta.env;
    if (env) {
      const mode = env.MODE;
      const nodeEnv = env.NODE_ENV;
      
      // If we have mode or nodeEnv, use them (Vite injected them)
      if (mode || nodeEnv) {
        return mode || nodeEnv || 'production';
      }
    }
  } catch {
    // import.meta.env may not be available - fall through to fallback
  }
  
  // Final fallback - never access process.env directly in Chrome extensions
  // Vite will replace process.env.NODE_ENV at build time if it exists in the code,
  // but we should rely on import.meta.env instead
  return 'production';
};

/**
 * Get release version from extension manifest
 */
export const getRelease = (): string => {
  try {
    if (typeof chrome !== 'undefined' && chrome?.runtime?.getManifest) {
      const manifest = chrome.runtime.getManifest();
      return manifest?.version || '1.0.0';
    }
  } catch (error) {
    // chrome.runtime may not be available in all contexts
    console.warn('[Sentry] Could not read manifest version:', error);
  }
  return '1.0.0';
};

/**
 * Common Sentry configuration options shared across all contexts
 * These are used when creating manual clients (NOT for Sentry.init())
 * 
 * IMPORTANT: integrations are NOT included here - they must be added
 * manually per context after filtering out global state integrations
 */
export interface CommonSentryOptions {
  dsn: string;
  environment: string;
  enableLogs: boolean;
  tracesSampleRate: number;
  tracePropagationTargets: (string | RegExp)[];
  release: string;
  sendDefaultPii: boolean;
  beforeSend?: (event: any) => any;
  beforeSendLog?: (log: any) => any | null;
  initialScope?: {
    tags?: Record<string, string>;
  };
}

export const getCommonSentryOptions = (): Omit<CommonSentryOptions, 'dsn'> => {
  const env = getEnvironment();
  
  return {
    environment: env,
    enableLogs: true,
    tracesSampleRate: env === 'development' ? 1.0 : 0.1,
    tracePropagationTargets: ["localhost", /^https:\/\/.*\.sentry\.io/],
    release: getRelease(),
    sendDefaultPii: false,
    beforeSend(event) {
      // Filter out any potentially sensitive data from URLs or breadcrumbs
      if (event.request?.url) {
        // Remove query parameters that might contain sensitive data
        try {
          const url = new URL(event.request.url);
          url.search = ''; // Clear query params
          event.request.url = url.toString();
        } catch (e) {
          // If URL parsing fails, keep original
        }
      }
      return event;
    },
    beforeSendLog(log) {
      // Allow all logs in development
      if (env === 'development') {
        return log;
      }
      // In production, filter out trace/debug level logs
      if (log.level === 'trace' || log.level === 'debug') {
        return null;
      }
      return log;
    },
  };
};

/**
 * Filter integrations that use global state
 * These integrations must be excluded in browser extensions to prevent
 * state pollution and event leakage between extension and web pages
 * 
 * @param integrations Array of integration instances or functions
 * @returns Filtered array with global state integrations removed
 */
export function filterGlobalStateIntegrations<T extends { name?: string } | (() => any)>(
  integrations: T[]
): T[] {
  return integrations.filter((integration) => {
    // Get integration name - could be from instance.name or function name
    const name = integration.name || 
                 (typeof integration === 'function' ? integration.name : undefined);
    
    // Filter out integrations that use global state
    const globalStateIntegrations = [
      'BrowserApiErrors',
      'Breadcrumbs', 
      'GlobalHandlers',
    ];
    
    return !name || !globalStateIntegrations.includes(name);
  });
}

/**
 * Background service worker specific options
 * 
 * IMPORTANT: sendDefaultPii is set to true for background worker
 * as it's a safe context (no user page content) and helps with debugging
 */
export const getBackgroundSentryOptions = (): Omit<CommonSentryOptions, 'dsn'> => {
  return {
    ...getCommonSentryOptions(),
    sendDefaultPii: true, // Enable PII collection for background worker (safe context)
    initialScope: {
      tags: {
        context: 'background',
        type: 'service-worker',
      },
    },
  };
};

/**
 * Popup React app specific options
 */
export const getPopupSentryOptions = (): Omit<CommonSentryOptions, 'dsn'> => {
  return {
    ...getCommonSentryOptions(),
    initialScope: {
      tags: {
        context: 'popup',
        type: 'react-ui',
      },
    },
  };
};

/**
 * Options page React app specific options
 */
export const getOptionsSentryOptions = (): Omit<CommonSentryOptions, 'dsn'> => {
  return {
    ...getCommonSentryOptions(),
    initialScope: {
      tags: {
        context: 'options',
        type: 'react-ui',
      },
    },
  };
};

/**
 * Content script specific options
 * Minimal tracking to respect user privacy
 */
export const getContentSentryOptions = (): Omit<CommonSentryOptions, 'dsn'> => {
  const env = getEnvironment();
  
  return {
    ...getCommonSentryOptions(),
    tracesSampleRate: env === 'development' ? 0.5 : 0.05,
    sendDefaultPii: false,
    initialScope: {
      tags: {
        context: 'content',
        type: 'content-script',
      },
    },
    beforeSend(event) {
      // First apply common beforeSend
      const commonResult = getCommonSentryOptions().beforeSend?.(event) ?? event;
      
      // Additional filtering for content scripts
      // Remove all breadcrumbs in content scripts (may contain page data)
      if (commonResult.breadcrumbs) {
        commonResult.breadcrumbs = [];
      }
      
      // Remove request data that might leak page URLs
      if (commonResult.request) {
        delete commonResult.request.url;
        delete commonResult.request.headers;
      }
      
      return commonResult;
    },
  };
};


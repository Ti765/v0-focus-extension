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

type SafeImportMetaEnv = {
  MODE?: string;
  NODE_ENV?: string;
  [key: string]: string | boolean | undefined;
};

type ImportMetaWithEnv = { env?: SafeImportMetaEnv };

let cachedViteEnv: SafeImportMetaEnv | undefined;

export const getViteEnv = (): SafeImportMetaEnv => {
  if (cachedViteEnv) {
    return cachedViteEnv;
  }

  try {
    cachedViteEnv = ((import.meta as ImportMetaWithEnv) ?? {}).env ?? {};
  } catch {
    cachedViteEnv = {};
  }

  return cachedViteEnv;
};

const asString = (value: SafeImportMetaEnv[keyof SafeImportMetaEnv]): string | undefined => {
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

const isEnvTrue = (value: SafeImportMetaEnv[keyof SafeImportMetaEnv]): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  return value === "true";
};

/**
 * Sentry DSNs from environment variables
 *
 * IMPORTANT: React and Browser SDKs require separate DSNs in Sentry.
 * - SENTRY_DSN_REACT: For @sentry/react (popup and options pages)
 * - SENTRY_DSN_BROWSER: For @sentry/browser (background and content scripts)
 *
 * These values are read from environment variables at build time.
 * See .env.example for configuration instructions.
 *
 * @see sentry_configuration.md
 * @see sentry_browser.md
 */
const env = getViteEnv();

export const SENTRY_DSN_REACT =
  asString(env.VITE_SENTRY_DSN_REACT) ??
  asString(env.SENTRY_DSN_REACT) ??
  "";
export const SENTRY_DSN_BROWSER =
  asString(env.VITE_SENTRY_DSN_BROWSER) ??
  asString(env.SENTRY_DSN_BROWSER) ??
  "";

// Keep SENTRY_DSN for backward compatibility (defaults to React DSN)
export const SENTRY_DSN = SENTRY_DSN_REACT || SENTRY_DSN_BROWSER;

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
  const viteEnv = getViteEnv();
  const mode = asString(viteEnv.MODE);
  const nodeEnv = asString(viteEnv.NODE_ENV);

  return mode || nodeEnv || "production";
};

export const isDevEnvironment = (): boolean => getEnvironment() === "development";

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
 * Validate Sentry configuration
 * Checks that required DSNs are configured
 * 
 * @param mode - Which DSN(s) to validate: 'react', 'browser', or 'any' (default: 'any')
 * @returns true if configuration is valid, false otherwise
 */
export const validateSentryConfig = (mode: 'react' | 'browser' | 'any' = 'any'): boolean => {
  const hasReactDSN = !!SENTRY_DSN_REACT;
  const hasBrowserDSN = !!SENTRY_DSN_BROWSER;
  
  let isValid = false;
  let missingDSNs: string[] = [];
  
  if (mode === 'react') {
    isValid = hasReactDSN;
    if (!hasReactDSN) {
      missingDSNs = ['VITE_SENTRY_DSN_REACT'];
    }
  } else if (mode === 'browser') {
    isValid = hasBrowserDSN;
    if (!hasBrowserDSN) {
      missingDSNs = ['VITE_SENTRY_DSN_BROWSER'];
    }
  } else {
    // 'any' mode: require at least one DSN
    isValid = hasReactDSN || hasBrowserDSN;
    if (!hasReactDSN && !hasBrowserDSN) {
      missingDSNs = ['VITE_SENTRY_DSN_REACT', 'VITE_SENTRY_DSN_BROWSER'];
    } else if (!hasReactDSN) {
      missingDSNs = ['VITE_SENTRY_DSN_REACT'];
    } else if (!hasBrowserDSN) {
      missingDSNs = ['VITE_SENTRY_DSN_BROWSER'];
    }
  }
  
  if (!isValid) {
    const env = getEnvironment();
    if (env === 'development') {
      const dsnList = missingDSNs.join(' and ');
      const modeText = mode === 'any' 
        ? 'at least one DSN' 
        : mode === 'react' 
          ? 'React DSN' 
          : 'Browser DSN';
      console.warn(`[Sentry] Missing ${modeText} configuration. Set ${dsnList} in .env file.`);
    }
    return false;
  }
  
  return true;
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
 * IMPORTANT: sendDefaultPii is configurable via environment variable
 * Defaults to false for privacy compliance (GDPR/CCPA)
 * Set VITE_SENTRY_SEND_DEFAULT_PII=true only if you have user consent and compliance approval
 */
export const getBackgroundSentryOptions = (): Omit<CommonSentryOptions, 'dsn'> => {
  // Read from env with safe default (false)
  const sendPii = isEnvTrue(getViteEnv().VITE_SENTRY_SEND_DEFAULT_PII);
  
  return {
    ...getCommonSentryOptions(),
    sendDefaultPii: sendPii, // Configurable via environment variable
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


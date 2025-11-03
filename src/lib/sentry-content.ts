/**
 * Sentry Initialization for Content Scripts
 * 
 * This file initializes Sentry for content scripts running on user pages using manual client setup
 * to avoid global state pollution in browser extensions.
 * 
 * PRIVACY CONSIDERATIONS:
 * - Minimal configuration to respect user privacy
 * - NO sendDefaultPii (avoids collecting page URLs and content)
 * - Lower sampling rates
 * - Filtered breadcrumbs and request data
 * - Only tracks critical errors that affect extension functionality
 * 
 * IMPORTANT: We use BrowserClient (not ReactClient) with isolated Scope to follow browser extension
 * best practices. This prevents interference with websites that also use Sentry.
 * 
 * @see https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/
 */

// IMPORTANT: Import process polyfill FIRST, before Sentry
import "./process-polyfill";

import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
  logger as sentryLogger,
  startSpan as sentryStartSpan,
} from "@sentry/browser";
import { 
  SENTRY_DSN_BROWSER, 
  getContentSentryOptions,
  filterGlobalStateIntegrations,
  getEnvironment,
  validateSentryConfig 
} from "./sentry-config";
import { createNoOpSpan } from "./sentry-utils";

// CRITICAL: Use page-level flag to prevent multiple initializations
// Content scripts can be injected multiple times into the same page
// Using a flag on window/globalThis ensures we only init once per page, not per injection
const SENTRY_INIT_FLAG = '__V0_SENTRY_CONTENT_INITIALIZED';

// Flag to prevent multiple initializations in this module instance
let isInitialized = false;
let client: BrowserClient | null = null;
let scope: Scope | null = null;
let initPromise: Promise<{ client: BrowserClient | null; scope: Scope }> | null = null;

/**
 * Retry loop to wait for initialization to complete
 * Returns the same promise for concurrent callers
 */
async function waitForInitialization(
  maxAttempts: number = 3,
  backoffMs: number = 50
): Promise<{ client: BrowserClient | null; scope: Scope }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (isInitialized && client && scope) {
      return { client, scope };
    }
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  // If still not ready after retries, log warning and return fallback
  const env = getEnvironment();
  if (env === 'development') {
    console.warn('[v0][Sentry] Content script Sentry initialization still not ready after retries');
  }
  const dummyScope = new Scope();
  return { client: null, scope: dummyScope };
}

/**
 * Initialize Sentry client for content script context
 * This creates an isolated client that doesn't pollute global state
 */
function initializeSentry(): { client: BrowserClient | null; scope: Scope } {
  // Validate configuration before attempting initialization
  if (!validateSentryConfig('browser')) {
    const dummyScope = new Scope();
    return { client: null, scope: dummyScope };
  }

  // Atomic check-and-set: if flag is already true, return early immediately
  if ((globalThis as any)[SENTRY_INIT_FLAG] === true) {
    // Another script is initializing or already initialized
    // Check if we can use existing client
    if (isInitialized && client && scope) {
      return { client, scope };
    }
    // If not ready yet, use retry loop with initPromise
    // Multiple concurrent callers will wait on the same promise
    if (!initPromise) {
      initPromise = waitForInitialization();
      // Update module state when promise resolves
      initPromise.then((result) => {
        if (result.client && result.scope) {
          client = result.client;
          scope = result.scope;
          isInitialized = true;
        }
        initPromise = null;
      }).catch(() => {
        initPromise = null;
      });
    }
    // For synchronous return at module load, we need immediate value
    // So we return dummy scope and let async resolution update state
    // This means first access might miss, but subsequent will work
    const dummyScope = new Scope();
    return { client: null, scope: dummyScope };
  }

  // Atomically set flag BEFORE any initialization work to prevent race conditions
  (globalThis as any)[SENTRY_INIT_FLAG] = true;

  // Create initPromise immediately so concurrent callers can await it
  initPromise = performInitialization().then(
    (result) => {
      client = result.client;
      scope = result.scope;
      isInitialized = true;
      initPromise = null; // Clear when done
      return result;
    },
    (error) => {
      // Reset flag on failure so retry is possible
      (globalThis as any)[SENTRY_INIT_FLAG] = false;
      isInitialized = false;
      client = null;
      scope = null;
      initPromise = null; // Clear on error
      throw error;
    }
  );

  // Return dummy immediately for synchronous callers
  // Real values will be available once promise resolves
  const dummyScope = new Scope();
  return { client: null, scope: dummyScope };
}

async function performInitialization(): Promise<{ client: BrowserClient | null; scope: Scope }> {
  try {
    // Get configuration options
    const options = getContentSentryOptions();
    
    // Get default integrations and filter out those that use global state
    const defaultIntegrations = getDefaultIntegrations({});
    
    // Filter out integrations that use global state
    // Content scripts should have minimal integrations for privacy
    const safeIntegrations = filterGlobalStateIntegrations(defaultIntegrations);
    
    // Note: We don't add consoleLoggingIntegration to content scripts to avoid
    // capturing logs from the host page, maintaining privacy

    // Create client manually (NOT using Sentry.init())
    const sentryClient = new BrowserClient({
      dsn: SENTRY_DSN_BROWSER,
      transport: makeFetchTransport,
      stackParser: defaultStackParser,
      integrations: safeIntegrations,
      ...options,
    });

    // Create isolated scope
    const isolatedScope = new Scope();
    isolatedScope.setClient(sentryClient);
    
    // Set initial scope tags if provided
    if (options.initialScope?.tags) {
      Object.entries(options.initialScope.tags).forEach(([key, value]) => {
        isolatedScope.setTag(key, value);
      });
    }

    // Initialize client (must be done after setting scope)
    sentryClient.init();

    // Log successful initialization (only in dev)
    const env = getEnvironment();
    if (env === 'development') {
      console.log('[v0][Sentry] Content script monitoring initialized with isolated client');
    }
    
    return { client: sentryClient, scope: isolatedScope };
  } catch (error) {
    // Log error silently - content scripts should not pollute page console
    // Only log in development to aid debugging
    const env = getEnvironment();
    if (env === 'development') {
      console.warn('[v0][Sentry] Failed to initialize Sentry in content script:', error);
    }
    
    // Return dummy client/scope to prevent errors
    const dummyScope = new Scope();
    return { client: null, scope: dummyScope };
  }
}

// Initialize on module load (for side effects only)
initializeSentry();

/**
 * Helper functions that access current client/scope values
 * These read from the mutable module-level variables, not frozen constants
 */
function getCurrentClient(): BrowserClient | null {
  return client;
}

function getCurrentScope(): Scope | null {
  return scope;
}

/**
 * Sentry object with methods that use the isolated scope
 * Maintains compatibility with existing code
 */
export const Sentry = {
  // Capture exception using isolated scope
  captureException: (error: Error, hint?: any) => {
    const currentScope = getCurrentScope();
    const currentClient = getCurrentClient();
    if (!currentScope || !currentClient) return;
    return currentScope.captureException(error, hint);
  },
  
  // Capture message using isolated scope
  captureMessage: (message: string, level?: any) => {
    const currentScope = getCurrentScope();
    const currentClient = getCurrentClient();
    if (!currentScope || !currentClient) return;
    return currentScope.captureMessage(message, level);
  },
  
  // Logger methods using isolated scope
  logger: {
    info: (message: string, data?: any) => {
      const currentScope = getCurrentScope();
      const currentClient = getCurrentClient();
      if (!currentScope || !currentClient) return;
      return sentryLogger.info(message, data, { scope: currentScope });
    },
    warn: (message: string, data?: any) => {
      const currentScope = getCurrentScope();
      const currentClient = getCurrentClient();
      if (!currentScope || !currentClient) return;
      return sentryLogger.warn(message, data, { scope: currentScope });
    },
    error: (message: string, data?: any) => {
      const currentScope = getCurrentScope();
      const currentClient = getCurrentClient();
      if (!currentScope || !currentClient) return;
      return sentryLogger.error(message, data, { scope: currentScope });
    },
  },
  
  // Start span using isolated scope
  startSpan: <T,>(options: Parameters<typeof sentryStartSpan>[0], callback: Parameters<typeof sentryStartSpan>[1]): T => {
    const currentScope = getCurrentScope();
    const currentClient = getCurrentClient();
    if (!currentScope || !currentClient) {
      // If Sentry not available, run callback with a safe no-op span to prevent runtime errors
      return callback(createNoOpSpan() as any) as T;
    }
    // Pass scope explicitly in options for manual clients
    return sentryStartSpan({ ...options, scope: currentScope }, callback) as T;
  },
  
  // Get client (for advanced usage)
  getClient: () => getCurrentClient(),
  
  // Get scope (for advanced usage)
  getScope: () => getCurrentScope(),
};

// Export scope getter for advanced usage
export const getContentScope = () => scope;


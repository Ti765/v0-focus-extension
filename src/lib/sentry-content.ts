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
  startSpan as sentryStartSpan,
} from "@sentry/browser";
import { 
  SENTRY_DSN_BROWSER, 
  getContentSentryOptions,
  filterGlobalStateIntegrations,
  getEnvironment,
  validateSentryConfig 
} from "./sentry-config";
import {
  captureWithIsolatedScope,
  createNoOpSpan,
  logWithIsolatedScope,
  withIsolatedScope,
} from "./sentry-utils";

// CRITICAL: Use page-level flag to prevent multiple initializations
// Content scripts can be injected multiple times into the same page
// Using a flag on window/globalThis ensures we only init once per page, not per injection
const SENTRY_INIT_FLAG = '__V0_SENTRY_CONTENT_INITIALIZED';

interface ContentSentryState {
  isInitialized: boolean;
  client: BrowserClient | null;
  scope: Scope | null;
  initPromise: Promise<{ client: BrowserClient; scope: Scope }> | null;
}

const contentCarrier = globalThis as typeof globalThis & {
  __V0_CONTENT_SENTRY_STATE__?: ContentSentryState;
};

const sharedState: ContentSentryState =
  contentCarrier.__V0_CONTENT_SENTRY_STATE__ ??
  (contentCarrier.__V0_CONTENT_SENTRY_STATE__ = {
    isInitialized: false,
    client: null,
    scope: null,
    initPromise: null,
  });

/**
 * Retry loop to wait for initialization to complete
 * Returns the same promise for concurrent callers
 */
async function waitForInitialization(
  maxAttempts: number = 3,
  backoffMs: number = 50
): Promise<{ client: BrowserClient | null; scope: Scope }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (sharedState.isInitialized && sharedState.client && sharedState.scope) {
      return { client: sharedState.client, scope: sharedState.scope };
    }
    if (sharedState.initPromise) {
      return sharedState.initPromise;
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  const env = getEnvironment();
  if (env === "development") {
    console.warn("[v0][Sentry] Content script Sentry initialization still not ready after retries");
  }
  const dummyScope = new Scope();
  return { client: null, scope: dummyScope };
}

/**
 * Initialize Sentry client for content script context
 * This creates an isolated client that doesn't pollute global state
 */
function initializeSentry(): { client: BrowserClient | null; scope: Scope } {
  if (!validateSentryConfig("browser")) {
    const dummyScope = new Scope();
    return { client: null, scope: dummyScope };
  }

  if ((globalThis as any)[SENTRY_INIT_FLAG] === true) {
    if (sharedState.isInitialized && sharedState.client && sharedState.scope) {
      return { client: sharedState.client, scope: sharedState.scope };
    }
    if (!sharedState.initPromise) {
      sharedState.initPromise = waitForInitialization().then((result) => {
        if (result.client && result.scope) {
          sharedState.client = result.client;
          sharedState.scope = result.scope;
          sharedState.isInitialized = true;
        }
        sharedState.initPromise = null;
        return result as { client: BrowserClient; scope: Scope };
      });
    }
    const fallbackScope = sharedState.scope ?? new Scope();
    return { client: sharedState.client, scope: fallbackScope };
  }

  (globalThis as any)[SENTRY_INIT_FLAG] = true;

  sharedState.initPromise = performInitialization()
    .then((result) => {
      sharedState.client = result.client;
      sharedState.scope = result.scope;
      sharedState.isInitialized = true;
      sharedState.initPromise = null;
      return result;
    })
    .catch((error) => {
      (globalThis as any)[SENTRY_INIT_FLAG] = false;
      sharedState.isInitialized = false;
      sharedState.client = null;
      sharedState.scope = null;
      sharedState.initPromise = null;
      throw error;
    });
  sharedState.initPromise.catch(() => {});

  const dummyScope = new Scope();
  return { client: null, scope: dummyScope };
}

async function performInitialization(): Promise<{ client: BrowserClient; scope: Scope }> {
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
    const env = getEnvironment();
    if (env === "development") {
      console.warn("[v0][Sentry] Failed to initialize Sentry in content script:", error);
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// Initialize on module load (for side effects only)
initializeSentry();

/**
 * Helper functions that access current client/scope values
 * These read from the mutable module-level variables, not frozen constants
 */
function getCurrentClient(): BrowserClient | null {
  return sharedState.client;
}

function getCurrentScope(): Scope | null {
  return sharedState.scope;
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
    return captureWithIsolatedScope(error, hint, currentClient, currentScope);
  },
  
  // Capture message using isolated scope
  captureMessage: (message: string, level?: any) => {
    const currentScope = getCurrentScope();
    const currentClient = getCurrentClient();
    if (!currentScope || !currentClient) return;
    return withIsolatedScope(currentClient, currentScope, (scope) => scope.captureMessage(message, level));
  },
  
  // Logger methods using isolated scope
  logger: {
    info: (message: string, data?: any) => {
      const currentScope = getCurrentScope();
      const currentClient = getCurrentClient();
      if (!currentScope || !currentClient) return;
      logWithIsolatedScope("info", message, data, currentClient, currentScope);
    },
    warn: (message: string, data?: any) => {
      const currentScope = getCurrentScope();
      const currentClient = getCurrentClient();
      if (!currentScope || !currentClient) return;
      logWithIsolatedScope("warning", message, data, currentClient, currentScope);
    },
    error: (message: string, data?: any) => {
      const currentScope = getCurrentScope();
      const currentClient = getCurrentClient();
      if (!currentScope || !currentClient) return;
      logWithIsolatedScope("error", message, data, currentClient, currentScope);
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
    return withIsolatedScope(
      currentClient,
      currentScope,
      () => sentryStartSpan(options, callback) as T,
      () => (callback(createNoOpSpan() as any) as T)
    );
  },
  
  // Get client (for advanced usage)
  getClient: () => getCurrentClient(),
  
  // Get scope (for advanced usage)
  getScope: () => getCurrentScope(),
};

// Export scope getter for advanced usage
export const getContentScope = () => sharedState.scope;


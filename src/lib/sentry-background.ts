/**
 * Sentry Initialization for Background Service Worker
 * 
 * This file initializes Sentry for the background service worker context using manual client setup
 * to avoid global state pollution in browser extensions.
 * 
 * Service workers have special considerations:
 * - Can be terminated and restarted at any time
 * - No DOM access, so no browser tracing integration
 * - Must be lightweight and fast to initialize
 * 
 * IMPORTANT: We use BrowserClient (not ReactClient) with isolated Scope to follow browser extension
 * best practices. This prevents interference with websites that also use Sentry.
 * 
 * @see https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/
 */

// IMPORTANT: Import process polyfill FIRST, before Sentry
// This prevents "process is not defined" errors from libraries
import "./process-polyfill";

import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
  logger as sentryLogger,
  startSpan as sentryStartSpan,
  consoleLoggingIntegration,
} from "@sentry/browser";
import { 
  SENTRY_DSN_BROWSER, 
  getBackgroundSentryOptions,
  filterGlobalStateIntegrations 
} from "./sentry-config";

// Flag to prevent multiple initializations
let isInitialized = false;
let client: BrowserClient | null = null;
let scope: Scope | null = null;

/**
 * Initialize Sentry client for background service worker context
 * This creates an isolated client that doesn't pollute global state
 */
function initializeSentry(): { client: BrowserClient | null; scope: Scope } {
  if (isInitialized && client && scope) {
    return { client, scope };
  }

  try {
    // Get configuration options
    const options = getBackgroundSentryOptions();
    
    // Get default integrations and filter out those that use global state
    const defaultIntegrations = getDefaultIntegrations({});
    
    // Filter out integrations that use global state
    const safeIntegrations = filterGlobalStateIntegrations(defaultIntegrations);
    
    // Add console logging integration for automatic log capture
    // consoleLoggingIntegration should be safe as it only listens to console methods
    try {
      const consoleLogging = consoleLoggingIntegration({ levels: ['warn', 'error'] });
      safeIntegrations.push(consoleLogging);
    } catch (e) {
      console.warn('[v0][Sentry] Console logging integration not available:', e);
    }

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

    client = sentryClient;
    scope = isolatedScope;
    isInitialized = true;

    console.log('[v0][Sentry] Background service worker monitoring initialized with isolated client');
    console.log('[v0][Sentry] Environment:', options.environment);
    console.log('[v0][Sentry] Release:', options.release);
    console.log('[v0][Sentry] DSN:', SENTRY_DSN_BROWSER);
    console.log('[v0][Sentry] sendDefaultPii:', options.sendDefaultPii);
    console.log('[v0][Sentry] Client initialized:', !!sentryClient);
    
    // Test connection by capturing a test message
    try {
      isolatedScope.captureMessage('[v0][Sentry] Background worker connected successfully', { level: 'info' });
      console.log('[v0][Sentry] Test message sent to verify connection');
    } catch (testError) {
      console.warn('[v0][Sentry] Test message failed:', testError);
    }
    
    return { client: sentryClient, scope: isolatedScope };
  } catch (error) {
    // Log error but DO NOT throw - service worker must start regardless
    console.error('[v0][Sentry] Failed to initialize Sentry in background worker:', error);
    console.warn('[v0][Sentry] Extension will continue without Sentry monitoring');
    
    // Return dummy client/scope to prevent errors
    const dummyScope = new Scope();
    return { client: null, scope: dummyScope };
  }
}

// Initialize on module load
const { client: backgroundClient, scope: backgroundScope } = initializeSentry();

/**
 * Sentry object with methods that use the isolated scope
 * Maintains compatibility with existing code
 */
export const Sentry = {
  // Capture exception using isolated scope
  captureException: (error: Error, hint?: any) => {
    if (!backgroundScope || !backgroundClient) return;
    return backgroundScope.captureException(error, hint);
  },
  
  // Capture message using isolated scope
  captureMessage: (message: string, level?: any) => {
    if (!backgroundScope || !backgroundClient) return;
    return backgroundScope.captureMessage(message, level);
  },
  
  // Logger methods using isolated scope
  logger: {
    info: (message: string, data?: any) => {
      if (!backgroundScope || !backgroundClient) return;
      return sentryLogger.info(message, data, { scope: backgroundScope });
    },
    warn: (message: string, data?: any) => {
      if (!backgroundScope || !backgroundClient) return;
      return sentryLogger.warn(message, data, { scope: backgroundScope });
    },
    error: (message: string, data?: any) => {
      if (!backgroundScope || !backgroundClient) return;
      return sentryLogger.error(message, data, { scope: backgroundScope });
    },
  },
  
  // Start span using isolated scope
  startSpan: <T,>(options: Parameters<typeof sentryStartSpan>[0], callback: Parameters<typeof sentryStartSpan>[1]): T => {
    if (!backgroundScope || !backgroundClient) {
      // If Sentry not available, just execute callback
      return callback({} as any);
    }
    // Pass scope explicitly in options for manual clients
    // This ensures startSpan uses our isolated scope instead of trying to access global Sentry context
    return sentryStartSpan({ ...options, scope: backgroundScope }, callback);
  },
  
  // Get client (for advanced usage)
  getClient: () => backgroundClient,
  
  // Get scope (for advanced usage)
  getScope: () => backgroundScope,
};

// Export scope for advanced usage
export { backgroundScope as scope };


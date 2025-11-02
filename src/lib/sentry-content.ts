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
  getEnvironment 
} from "./sentry-config";

// CRITICAL: Use page-level flag to prevent multiple initializations
// Content scripts can be injected multiple times into the same page
// Using a flag on window/globalThis ensures we only init once per page, not per injection
const SENTRY_INIT_FLAG = '__V0_SENTRY_CONTENT_INITIALIZED';

// Flag to prevent multiple initializations in this module instance
let isInitialized = false;
let client: BrowserClient | null = null;
let scope: Scope | null = null;

/**
 * Initialize Sentry client for content script context
 * This creates an isolated client that doesn't pollute global state
 */
function initializeSentry(): { client: BrowserClient | null; scope: Scope } {
  // Atomic check-and-set: if flag is already true, return early immediately
  if ((globalThis as any)[SENTRY_INIT_FLAG] === true) {
    // Another script is initializing or already initialized
    // Check if we can use existing client
    if (isInitialized && client && scope) {
      return { client, scope };
    }
    // If not ready yet, return null to prevent duplicate initialization
    const dummyScope = new Scope();
    return { client: null, scope: dummyScope };
  }

  // Atomically set flag BEFORE any initialization work to prevent race conditions
  (globalThis as any)[SENTRY_INIT_FLAG] = true;

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

    client = sentryClient;
    scope = isolatedScope;
    isInitialized = true;

    // Log successful initialization (only in dev)
    const env = getEnvironment();
    if (env === 'development') {
      console.log('[v0][Sentry] Content script monitoring initialized with isolated client');
    }
    
    return { client: sentryClient, scope: isolatedScope };
  } catch (error) {
    // Reset flag on failure so retry is possible
    (globalThis as any)[SENTRY_INIT_FLAG] = false;
    isInitialized = false;
    client = null;
    scope = null;
    
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

// Initialize on module load
const { client: contentClient, scope: contentScope } = initializeSentry();

/**
 * Sentry object with methods that use the isolated scope
 * Maintains compatibility with existing code
 */
export const Sentry = {
  // Capture exception using isolated scope
  captureException: (error: Error, hint?: any) => {
    if (!contentScope || !contentClient) return;
    return contentScope.captureException(error, hint);
  },
  
  // Capture message using isolated scope
  captureMessage: (message: string, level?: any) => {
    if (!contentScope || !contentClient) return;
    return contentScope.captureMessage(message, level);
  },
  
  // Logger methods using isolated scope
  logger: {
    info: (message: string, data?: any) => {
      if (!contentScope || !contentClient) return;
      return sentryLogger.info(message, data, { scope: contentScope });
    },
    warn: (message: string, data?: any) => {
      if (!contentScope || !contentClient) return;
      return sentryLogger.warn(message, data, { scope: contentScope });
    },
    error: (message: string, data?: any) => {
      if (!contentScope || !contentClient) return;
      return sentryLogger.error(message, data, { scope: contentScope });
    },
  },
  
  // Start span using isolated scope
  startSpan: <T,>(options: Parameters<typeof sentryStartSpan>[0], callback: Parameters<typeof sentryStartSpan>[1]): T => {
    if (!contentScope || !contentClient) {
      // If Sentry not available, just execute callback
      return callback({} as any);
    }
    // Pass scope explicitly in options for manual clients
    // This ensures startSpan uses our isolated scope instead of trying to access global Sentry context
    return sentryStartSpan({ ...options, scope: contentScope }, callback);
  },
  
  // Get client (for advanced usage)
  getClient: () => contentClient,
  
  // Get scope (for advanced usage)
  getScope: () => contentScope,
};

// Export scope for advanced usage
export { contentScope as scope };


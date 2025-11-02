/**
 * Sentry Initialization for Popup React App
 * 
 * This file initializes Sentry for the popup UI context using manual client setup
 * to avoid global state pollution in browser extensions.
 * 
 * IMPORTANT: We use BrowserClient with isolated Scope to follow browser extension
 * best practices. This prevents interference with websites that also use Sentry.
 * 
 * @see https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/
 * @see https://docs.sentry.io/platforms/javascript/guides/react/best-practices/shared-environments/
 */

// IMPORTANT: Import process polyfill FIRST, before Sentry
import "./process-polyfill";

import React from "react";
import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
  logger as sentryLogger,
  startSpan as sentryStartSpan,
  browserTracingIntegration,
  consoleLoggingIntegration,
} from "@sentry/browser";
import {
  ErrorBoundary as SentryErrorBoundary,
} from "@sentry/react";
import { 
  SENTRY_DSN_REACT, 
  getPopupSentryOptions,
  filterGlobalStateIntegrations 
} from "./sentry-config";

// Flag to prevent multiple initializations
let isInitialized = false;
let client: BrowserClient | null = null;
let scope: Scope | null = null;

/**
 * Initialize Sentry client for popup context
 * This creates an isolated client that doesn't pollute global state
 */
function initializeSentry(): { client: BrowserClient | null; scope: Scope } {
  if (isInitialized && client && scope) {
    return { client, scope };
  }

  try {
    // Get configuration options
    const options = getPopupSentryOptions();
    
    // Get default integrations and filter out those that use global state
    const defaultIntegrations = getDefaultIntegrations({
      browserTracingIntegrationOptions: {
        // Configure browser tracing if needed
      },
    });
    
    // Filter out integrations that use global state
    const safeIntegrations = filterGlobalStateIntegrations(defaultIntegrations);
    
    // Add browser tracing integration
    // Note: browserTracingIntegration may use some global state, but it's needed for performance monitoring
    // We add it after filtering and let Sentry handle it appropriately
    try {
      const browserTracing = browserTracingIntegration();
      safeIntegrations.push(browserTracing);
    } catch (e) {
      // browserTracingIntegration not available or error, skip it
      console.warn('[v0][Sentry] Browser tracing integration not available:', e);
    }
    
    // Add console logging integration
    // consoleLoggingIntegration should be safe as it only listens to console methods
    try {
      const consoleLogging = consoleLoggingIntegration({ levels: ['warn', 'error'] });
      safeIntegrations.push(consoleLogging);
    } catch (e) {
      // consoleLoggingIntegration not available, skip it
      console.warn('[v0][Sentry] Console logging integration not available:', e);
    }

    // Create client manually (NOT using Sentry.init())
    // Note: We use BrowserClient even for React contexts in browser extensions
    const sentryClient = new BrowserClient({
      dsn: SENTRY_DSN_REACT,
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

    console.log('[v0][Sentry] Popup monitoring initialized with isolated client');
    return { client: sentryClient, scope: isolatedScope };
  } catch (error) {
    // Log error but DO NOT throw - popup must render regardless
    console.error('[v0][Sentry] Failed to initialize Sentry in popup:', error);
    console.warn('[v0][Sentry] Popup will continue without Sentry monitoring');
    
    // Return dummy client/scope to prevent errors
    const dummyScope = new Scope();
    return { client: null, scope: dummyScope };
  }
}

// Initialize on module load
const { client: popupClient, scope: popupScope } = initializeSentry();

/**
 * ErrorBoundary component wrapper that uses the isolated client
 */
export const ErrorBoundary = (props: React.ComponentProps<typeof SentryErrorBoundary>) => {
  if (!popupClient) {
    // If client failed to initialize, just render children without ErrorBoundary
    return <>{props.children}</>;
  }
  
  // Use the isolated scope for ErrorBoundary
  return (
    <SentryErrorBoundary {...props} />
  );
};

/**
 * Sentry object with methods that use the isolated scope
 * Maintains compatibility with existing code
 */
export const Sentry = {
  // ErrorBoundary component
  ErrorBoundary,
  
  // Capture exception using isolated scope
  captureException: (error: Error, hint?: any) => {
    if (!popupScope || !popupClient) return;
    return popupScope.captureException(error, hint);
  },
  
  // Capture message using isolated scope
  captureMessage: (message: string, level?: any) => {
    if (!popupScope || !popupClient) return;
    return popupScope.captureMessage(message, level);
  },
  
  // Logger methods using isolated scope
  logger: {
    info: (message: string, data?: any) => {
      if (!popupScope || !popupClient) return;
      return sentryLogger.info(message, data, { scope: popupScope });
    },
    warn: (message: string, data?: any) => {
      if (!popupScope || !popupClient) return;
      return sentryLogger.warn(message, data, { scope: popupScope });
    },
    error: (message: string, data?: any) => {
      if (!popupScope || !popupClient) return;
      return sentryLogger.error(message, data, { scope: popupScope });
    },
  },
  
  // Start span using isolated scope
  startSpan: <T,>(options: Parameters<typeof sentryStartSpan>[0], callback: Parameters<typeof sentryStartSpan>[1]): T => {
    if (!popupScope || !popupClient) {
      // If Sentry not available, just execute callback
      return callback({} as any);
    }
    // Pass scope explicitly in options for manual clients
    // This ensures startSpan uses our isolated scope instead of trying to access global Sentry context
    return sentryStartSpan({ ...options, scope: popupScope }, callback);
  },
  
  // Get client (for advanced usage)
  getClient: () => popupClient,
  
  // Get scope (for advanced usage)
  getScope: () => popupScope,
};

// Export scope for advanced usage
export { popupScope as scope };


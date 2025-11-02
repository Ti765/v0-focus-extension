/**
 * Sentry Initialization for Options Page React App
 * 
 * This file initializes Sentry for the options/settings page context using manual client setup
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
// Note: We don't import SentryErrorBoundary from @sentry/react
// Instead, we implement a custom ErrorBoundary that uses our isolated scope
import { 
  SENTRY_DSN_REACT, 
  getOptionsSentryOptions,
  filterGlobalStateIntegrations 
} from "./sentry-config";
import { createNoOpSpan } from "./sentry-utils";

// Flag to prevent multiple initializations
let isInitialized = false;
let client: BrowserClient | null = null;
let scope: Scope | null = null;

/**
 * Initialize Sentry client for options page context
 * This creates an isolated client that doesn't pollute global state
 */
function initializeSentry(): { client: BrowserClient | null; scope: Scope } {
  if (isInitialized && client && scope) {
    return { client, scope };
  }

  try {
    // Get configuration options
    const options = getOptionsSentryOptions();
    
    // Get default integrations and filter out those that use global state
    const defaultIntegrations = getDefaultIntegrations({});
    
    // Filter out integrations that use global state
    const safeIntegrations = filterGlobalStateIntegrations(defaultIntegrations);
    
    // Add browser tracing integration
    // Note: browserTracingIntegration may use some global state, but it's needed for performance monitoring
    try {
      const browserTracing = browserTracingIntegration();
      safeIntegrations.push(browserTracing);
    } catch (e) {
      console.warn('[v0][Sentry] Browser tracing integration not available:', e);
    }
    
    // Add console logging integration
    try {
      const consoleLogging = consoleLoggingIntegration({ levels: ['warn', 'error'] });
      safeIntegrations.push(consoleLogging);
    } catch (e) {
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

    console.log('[v0][Sentry] Options page monitoring initialized with isolated client');
    return { client: sentryClient, scope: isolatedScope };
  } catch (error) {
    // Log error but DO NOT throw - options page must render regardless
    console.error('[v0][Sentry] Failed to initialize Sentry in options page:', error);
    console.warn('[v0][Sentry] Options page will continue without Sentry monitoring');
    
    // Return dummy client/scope to prevent errors
    const dummyScope = new Scope();
    return { client: null, scope: dummyScope };
  }
}

// Initialize on module load
const { client: optionsClient, scope: optionsScope } = initializeSentry();

/**
 * ErrorBoundary component that uses the isolated Sentry client/scope
 * This custom implementation ensures React errors are captured even when using manual client setup
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; retryKey: number }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, retryKey: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Capture error using our isolated scope
    // Fallback handling is done via state.hasError and render method
    if (optionsClient && optionsScope) {
      optionsScope.setContext('react', {
        componentStack: errorInfo.componentStack,
      });
      optionsScope.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default from props
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Default fallback with retry that forces remount via key change
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, retryKey: this.state.retryKey + 1 })}>
            Try again
          </button>
        </div>
      );
    }

    // Force remount on retry by using key prop
    return (
      <React.Fragment key={this.state.retryKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

/**
 * Sentry object with methods that use the isolated scope
 * Maintains compatibility with existing code
 */
export const Sentry = {
  // ErrorBoundary component
  ErrorBoundary,
  
  // Capture exception using isolated scope
  captureException: (error: Error, hint?: any) => {
    if (!optionsScope || !optionsClient) return;
    return optionsScope.captureException(error, hint);
  },
  
  // Capture message using isolated scope
  captureMessage: (message: string, level?: any) => {
    if (!optionsScope || !optionsClient) return;
    return optionsScope.captureMessage(message, level);
  },
  
  // Logger methods using isolated scope
  logger: {
    info: (message: string, data?: any) => {
      if (!optionsScope || !optionsClient) return;
      return sentryLogger.info(message, data, { scope: optionsScope });
    },
    warn: (message: string, data?: any) => {
      if (!optionsScope || !optionsClient) return;
      return sentryLogger.warn(message, data, { scope: optionsScope });
    },
    error: (message: string, data?: any) => {
      if (!optionsScope || !optionsClient) return;
      return sentryLogger.error(message, data, { scope: optionsScope });
    },
  },
  
  // Start span using isolated scope
  startSpan: <T,>(options: Parameters<typeof sentryStartSpan>[0], callback: Parameters<typeof sentryStartSpan>[1]): T => {
    if (!optionsScope || !optionsClient) {
      // If Sentry not available, run callback with a safe no-op span to prevent runtime errors
      return callback(createNoOpSpan() as any) as T;
    }
    // Pass scope explicitly in options for manual clients
    // This ensures startSpan uses our isolated scope instead of trying to access global Sentry context
    return sentryStartSpan({ ...options, scope: optionsScope }, callback) as T;
  },
  
  // Get client (for advanced usage)
  getClient: () => optionsClient,
  
  // Get scope (for advanced usage)
  getScope: () => optionsScope,
};

// Export scope for advanced usage
export { optionsScope as scope };


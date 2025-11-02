/**
 * Utility functions for Sentry integration
 * 
 * Provides helpers for safe span operations when Sentry client may be unavailable
 */

/**
 * Creates a no-op span stub that implements common Sentry span methods
 * Used when Sentry client is not available to prevent runtime errors
 * 
 * All methods return void or the stub itself for method chaining compatibility
 */
export function createNoOpSpan() {
  const stub = {
    setAttribute: () => stub,
    setTag: () => stub,
    setContext: () => stub,
    setStatus: () => stub,
    finish: () => {},
    end: () => {},
    startChild: () => stub,
    updateName: () => stub,
    isRecording: () => false,
  };
  return stub;
}

/**
 * Safely sets a span attribute, falling back to no-op if span is unavailable
 * 
 * @param span - The span object (may be undefined or lack setAttribute method)
 * @param key - Attribute key to set
 * @param value - Attribute value to set
 */
export function safeSetSpanAttribute(span: any, key: string, value: unknown): void {
  if (span && typeof span.setAttribute === 'function') {
    span.setAttribute(key, value);
  }
}


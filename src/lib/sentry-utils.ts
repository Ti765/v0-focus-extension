import type { BrowserClient, Scope, SeverityLevel } from "@sentry/browser";

/**
 * Utility functions for Sentry integration
 *
 * Provides helpers for safe span operations when Sentry client may be unavailable
 */

/**
 * Creates a no-op span stub that implements common Sentry span methods.
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
 * Safely sets a span attribute, falling back to no-op if span is unavailable.
 */
export function safeSetSpanAttribute(span: any, key: string, value: unknown): void {
  if (span && typeof span.setAttribute === "function") {
    span.setAttribute(key, value);
  }
}

function cloneScope(scope: Scope, client: BrowserClient): Scope {
  const cloned = scope.clone();
  cloned.setClient(client);
  return cloned;
}

type WithIsolatedScopeCallback<T> = (isolatedScope: Scope, client: BrowserClient) => T;

/**
 * Runs a callback with a cloned isolation scope so modifications don't leak.
 * The overloads ensure callers that provide a fallback always receive `T`.
 */
export function withIsolatedScope<T>(
  client: BrowserClient | null,
  scope: Scope | null,
  callback: WithIsolatedScopeCallback<T>
): T | undefined;
export function withIsolatedScope<T>(
  client: BrowserClient | null,
  scope: Scope | null,
  callback: WithIsolatedScopeCallback<T>,
  fallback: () => T
): T;
export function withIsolatedScope<T>(
  client: BrowserClient | null,
  scope: Scope | null,
  callback: WithIsolatedScopeCallback<T>,
  fallback?: () => T
): T | undefined {
  if (!client || !scope) {
    return fallback?.();
  }

  return callback(cloneScope(scope, client), client);
}

function sanitizeLoggerData(input: unknown): Record<string, unknown> | undefined {
  if (input === undefined) {
    return undefined;
  }

  if (input === null) {
    return { value: null };
  }

  if (typeof input === "object") {
    try {
      return JSON.parse(JSON.stringify(input));
    } catch {
      return { value: "[unserializable]" };
    }
  }

  return { value: input };
}

/**
 * Capture a structured log entry using the isolated client/scope.
 */
export function logWithIsolatedScope(
  level: SeverityLevel,
  message: string,
  data: unknown,
  client: BrowserClient | null,
  scope: Scope | null
): void {
  withIsolatedScope(client, scope, (isolatedScope) => {
    const context = sanitizeLoggerData(data);
    if (context) {
      isolatedScope.setContext("logger", context);
    }
    isolatedScope.setLevel(level);
    isolatedScope.captureMessage(message, level);
  });
}

/**
 * Capture an exception with a temporary scope to avoid context pollution.
 */
export function captureWithIsolatedScope(
  error: Error,
  hint: any,
  client: BrowserClient | null,
  scope: Scope | null
) {
  return withIsolatedScope(client, scope, (isolatedScope) => {
    return isolatedScope.captureException(error, hint);
  });
}


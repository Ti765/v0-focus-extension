/**
 * Sentry Test Utilities
 * 
 * Helper functions to test Sentry integration in different contexts
 * Use these functions to verify that Sentry is working correctly
 * 
 * IMPORTANT: Each function imports Sentry from the appropriate context
 * to use the isolated client/scope setup required for browser extensions.
 * 
 * USAGE:
 * - In background service worker console: testSentryBackground()
 * - In popup: Add test button that calls testSentryPopup()
 * - In options: Add test button that calls testSentryOptions()
 * - In content script console: testSentryContent()
 */

// Note: Sentry is imported dynamically in each function to use
// the correct isolated client from each context

/**
 * Test error tracking in background service worker
 * Opens DevTools > Console and call: testSentryBackground()
 */
export async function testSentryBackground() {
  // Import Sentry from background context
  const { Sentry } = await import("./sentry-background");
  
  console.log("[Sentry Test] Testing background error tracking...");
  
  try {
    // Test span
    Sentry.startSpan(
      { op: "test", name: "Background Test Span" },
      (span) => {
        span.setAttribute("test_attribute", "test_value");
        span.setAttribute("context", "background");
        console.log("[Sentry Test] Span created");
        
        // Test log
        Sentry.logger.info("Background test log", {
          test: true,
          timestamp: new Date().toISOString(),
        });
        console.log("[Sentry Test] Log sent");
      }
    );
    
    // Test error capture
    setTimeout(() => {
      try {
        throw new Error("Sentry Test Error - Background Context");
      } catch (error) {
        Sentry.captureException(error);
        console.log("[Sentry Test] Error captured");
      }
    }, 100);
    
  } catch (error) {
    Sentry.captureException(error);
    console.log("[Sentry Test] Error captured");
  }
  
  console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
  console.log("[Sentry Test] Dashboard: https://sentry.io/issues/");
}

/**
 * Test error tracking in popup
 * Call this from a test button in popup
 */
export async function testSentryPopup() {
  // Import Sentry from popup context
  const { Sentry } = await import("./sentry-popup");
  
  console.log("[Sentry Test] Testing popup error tracking...");
  
  // Test span with user interaction
  Sentry.startSpan(
    { op: "ui.click", name: "Popup Test Button Click" },
    (span) => {
      span.setAttribute("context", "popup");
      span.setAttribute("test", true);
      
      // Test log
      Sentry.logger.info("Popup test log", {
        test: true,
        ui_element: "test_button",
      });
      
      // Test error
      setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Popup Context");
        } catch (error) {
          Sentry.captureException(error);
          console.log("[Sentry Test] Error captured from popup");
        }
      }, 100);
    }
  );
  
  console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
}

/**
 * Test error tracking in options page
 * Call this from a test button in options
 */
export async function testSentryOptions() {
  // Import Sentry from options context
  const { Sentry } = await import("./sentry-options");
  
  console.log("[Sentry Test] Testing options error tracking...");
  
  // Test span
  Sentry.startSpan(
    { op: "ui.settings", name: "Options Test Action" },
    (span) => {
      span.setAttribute("context", "options");
      span.setAttribute("test", true);
      
      // Test log
      Sentry.logger.info("Options test log", {
        test: true,
        settings_modified: false,
      });
      
      // Test error
      setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Options Context");
        } catch (error) {
          Sentry.captureException(error);
          console.log("[Sentry Test] Error captured from options");
        }
      }, 100);
    }
  );
  
  console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
}

/**
 * Test error tracking in content script
 * Open browser console on any page and call: testSentryContent()
 */
export async function testSentryContent() {
  // Import Sentry from content context
  const { Sentry } = await import("./sentry-content");
  
  console.log("[Sentry Test] Testing content script error tracking...");
  
  // Test minimal span (privacy-conscious)
  Sentry.startSpan(
    { op: "test", name: "Content Script Test" },
    (span) => {
      span.setAttribute("context", "content");
      span.setAttribute("test", true);
      
      // Test error
      setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Content Script Context");
        } catch (error) {
          Sentry.captureException(error);
          console.log("[Sentry Test] Error captured from content script");
        }
      }, 100);
    }
  );
  
  console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
  console.log("[Sentry Test] Note: Content script tracking is minimal for privacy");
}

/**
 * Comprehensive test that validates all Sentry features
 */
export async function testSentryComprehensive(context: "background" | "popup" | "options" | "content") {
  // Import Sentry from appropriate context
  let Sentry: any;
  switch (context) {
    case "background":
      Sentry = (await import("./sentry-background")).Sentry;
      break;
    case "popup":
      Sentry = (await import("./sentry-popup")).Sentry;
      break;
    case "options":
      Sentry = (await import("./sentry-options")).Sentry;
      break;
    case "content":
      Sentry = (await import("./sentry-content")).Sentry;
      break;
  }
  
  console.log(`[Sentry Test] Running comprehensive test for ${context}...`);
  
  Sentry.startSpan(
    { op: "test.comprehensive", name: "Comprehensive Sentry Test" },
    async (span) => {
      span.setAttribute("context", context);
      span.setAttribute("test_type", "comprehensive");
      
      // 1. Test info log
      Sentry.logger.info("Test info log", { level: "info", context });
      
      // 2. Test warn log
      Sentry.logger.warn("Test warn log", { level: "warn", context });
      
      // 3. Test error log
      Sentry.logger.error("Test error log", { level: "error", context });
      
      // 4. Test span with attributes
      await Sentry.startSpan(
        { op: "test.nested", name: "Nested Test Span" },
        async (nestedSpan) => {
          nestedSpan.setAttribute("nested", true);
          nestedSpan.setAttribute("parent", "comprehensive_test");
          
          // Simulate some work
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      );
      
      // 5. Test exception capture
      try {
        throw new Error(`Comprehensive Test Error - ${context}`);
      } catch (error) {
        Sentry.captureException(error);
      }
      
      console.log(`[Sentry Test] Comprehensive test complete for ${context}`);
      console.log("[Sentry Test] Expected results:");
      console.log("  - 3 log entries (info, warn, error)");
      console.log("  - 2 spans (comprehensive + nested)");
      console.log("  - 1 error issue");
      console.log("  - Check dashboard: https://sentry.io/issues/");
    }
  );
}

// Export for global access in browser console (development/test only)
// Only expose test functions in non-production environments to avoid
// exposing debugging utilities in production builds
if (typeof globalThis !== 'undefined') {
  // Check if we're in development/test mode
  // In Chrome extensions, process.env is NOT available at runtime
  // We use Vite's import.meta.env which is injected at build-time
  // IMPORTANT: Only allow exposure in development builds to prevent security risks
  let isDevelopment = false;
  
  try {
    // Primary check: Vite's import.meta.env (injected at build-time)
    const env = (import.meta as any).env;
    if (env) {
      const mode = env.MODE;
      const nodeEnv = env.NODE_ENV;
      isDevelopment = mode === 'development' || nodeEnv === 'development';
    }
  } catch (error) {
    // import.meta.env may not be available, continue to fallback checks
  }
  
  // Fallback: check for development indicators in extension context
  if (!isDevelopment) {
    try {
      if (typeof chrome !== 'undefined' && chrome?.runtime?.getManifest) {
        const manifest = chrome.runtime.getManifest();
        if (manifest?.version?.includes('dev')) {
          isDevelopment = true;
        }
      }
    } catch (error) {
      // chrome.runtime may not be available
    }
  }
  
  // Only allow explicit flag for testing if set at build time (not runtime)
  // SENTRY_TEST_EXPOSE must be set during build via Vite, not via console
  let allowBuildTimeFlag = false;
  
  try {
    // Check Vite's import.meta.env for test flags
    const env = (import.meta as any).env;
    if (env) {
      // Vite prefix is required for custom env vars: VITE_*
      allowBuildTimeFlag = env.VITE_SENTRY_TEST_EXPOSE === 'true' ||
                          // Also check without prefix for legacy support
                          env.SENTRY_TEST_EXPOSE === 'true';
    }
  } catch (error) {
    // import.meta.env may not be available, skip
  }
  
  const allowTestExposure = isDevelopment || allowBuildTimeFlag;
  
  // SECURITY: No runtime override allowed
  // Removed window.__SENTRY_ALLOW_TEST_EXPOSURE to prevent production exploits
  // Test functions should only be available in development builds
  
  if (allowTestExposure) {
    (globalThis as any).testSentryBackground = testSentryBackground;
    (globalThis as any).testSentryPopup = testSentryPopup;
    (globalThis as any).testSentryOptions = testSentryOptions;
    (globalThis as any).testSentryContent = testSentryContent;
    (globalThis as any).testSentryComprehensive = testSentryComprehensive;
    
    console.log('[Sentry Test] Test functions exposed to globalThis (development mode)');
  }
}


# Sentry Testing Guide

This guide explains how to test Sentry monitoring in your Chrome extension across all contexts.

## Prerequisites

1. Sentry is installed: `@sentry/react` package
2. Extension is loaded in Chrome (development mode)
3. Sentry project is configured with DSN in `src/lib/sentry-config.ts`

## Quick Start

### Test Background Service Worker

1. Open Chrome DevTools
2. Go to **Application** > **Service Workers**
3. Click **inspect** next to your extension's service worker
4. In the console, run:

```javascript
testSentryBackground()
```

Expected output:
- Console messages confirming span, log, and error were sent
- Check [Sentry Issues](https://sentry.io/issues/) after 10-15 seconds
- Look for issue tagged with `context:background`

### Test Popup

1. Open your extension's popup
2. Right-click > Inspect to open DevTools
3. In the console, run:

```javascript
testSentryPopup()
```

Or add a test button to your popup temporarily:

```tsx
// In src/popup/App.tsx
import { testSentryPopup } from '../lib/sentry-test';

// Add button somewhere:
<button onClick={() => testSentryPopup()}>
  Test Sentry
</button>
```

Expected output:
- Error in Sentry dashboard tagged with `context:popup`
- Span showing `ui.click` operation
- Log entry with test data

### Test Options Page

1. Open your extension's options page (right-click extension icon > Options)
2. Open DevTools (F12)
3. In console, run:

```javascript
testSentryOptions()
```

Expected output:
- Error tagged with `context:options`
- Span showing settings-related operation
- Log entry

### Test Content Script

1. Navigate to any webpage (e.g., https://example.com)
2. Open browser DevTools (F12)
3. In console, run:

```javascript
testSentryContent()
```

Expected output:
- Error tagged with `context:content`
- Minimal data (privacy-conscious)
- No page URLs or sensitive content

## Comprehensive Testing

Run comprehensive tests to verify all Sentry features:

### Background Context
```javascript
testSentryComprehensive("background")
```

### Popup Context
```javascript
testSentryComprehensive("popup")
```

### Options Context
```javascript
testSentryComprehensive("options")
```

### Content Context
```javascript
testSentryComprehensive("content")
```

This will test:
- Info, warn, and error logs
- Nested spans
- Exception capture
- Attribute tagging

## Verifying Results in Sentry Dashboard

### 1. Check Issues
Go to https://sentry.io/issues/

Filter by tags:
- `context:background`
- `context:popup`
- `context:options`
- `context:content`

Each test should create one issue per context.

### 2. Check Performance/Traces
Go to https://sentry.io/explore/traces/

Look for:
- Span names: "Background Test Span", "Popup Test Button Click", etc.
- Operations: `test`, `ui.click`, `ui.settings`
- Attributes: `test`, `context`, etc.

### 3. Check Logs
Go to https://sentry.io/explore/logs/

Filter by:
- `context` attribute
- `test` attribute
- Log levels (info, warn, error)

## Production Testing

### Build Production Extension

```bash
npm run build
```

### Load Production Build

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

### Verify Production Events

1. Use the extension normally for 5-10 minutes
2. Trigger some actions:
   - Add/remove domains from blacklist
   - Start/stop Pomodoro timer
   - Change settings
   - Navigate to blocked sites

3. Check Sentry dashboard for:
   - Real errors (not test errors)
   - Performance traces for user actions
   - Logs from actual usage
   - Lower sample rates (10% vs 100% in dev)

## Expected Behavior

### Development Mode
- **tracesSampleRate**: 1.0 (100% of transactions)
- **replaysSessionSampleRate**: 0.1 (10% of sessions)
- **replaysOnErrorSampleRate**: 1.0 (100% of errors)
- **Console logs**: Verbose
- **All contexts**: Fully instrumented

### Production Mode
- **tracesSampleRate**: 0.1 (10% of transactions)
- **replaysSessionSampleRate**: 0.1 (10% of sessions)
- **replaysOnErrorSampleRate**: 1.0 (100% of errors)
- **Console logs**: Error/warn only
- **Content scripts**: Minimal tracking

## Context-Specific Tags

Every Sentry event is tagged with its source context:

| Tag | Value | Source |
|-----|-------|--------|
| `context` | `background` | Service Worker |
| `context` | `popup` | Extension Popup |
| `context` | `options` | Options/Settings Page |
| `context` | `content` | Content Scripts |

Additional tags:
- `type`: `service-worker`, `react-ui`, or `content-script`
- `environment`: `development` or `production`
- `release`: Extension version from manifest

## Troubleshooting

### No Events in Sentry

1. **Check DSN**: Verify `src/lib/sentry-config.ts` has correct DSN
2. **Check CSP**: Manifest should allow connections to Sentry endpoints
3. **Check Console**: Look for Sentry initialization messages
4. **Check Network**: DevTools > Network, filter for "sentry.io"

### Events Missing Context Tags

1. **Verify initialization**: Each context should import its Sentry init file first
2. **Check imports**:
   - Background: `import '../lib/sentry-background'`
   - Popup: `import '../lib/sentry-popup'`
   - Options: `import '../lib/sentry-options'`
   - Content: `import '../lib/sentry-content'`

### Content Script Events Not Showing

This is expected! Content scripts have minimal tracking for privacy:
- Lower sample rate (5% vs 10% in prod)
- No URL or page content collection
- Only critical errors tracked

### CSP Errors in Console

If you see Content Security Policy errors:

1. Check `manifest.json` has:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'; connect-src 'self' https://o4510270313660416.ingest.us.sentry.io https://us.sentry.io"
}
```

2. Replace the organization ID in the URL with your own from DSN

## Manual Testing Checklist

- [ ] Background context sends errors
- [ ] Background context sends logs
- [ ] Background context creates spans
- [ ] Popup context sends errors
- [ ] Popup context has error boundary
- [ ] Options context sends errors
- [ ] Options context has error boundary
- [ ] Content script sends errors (minimal)
- [ ] All events have correct context tags
- [ ] Production build has lower sample rates
- [ ] Session replay works in popup/options
- [ ] Logs are filtered properly
- [ ] Privacy: content scripts don't leak page data

## Support

If you encounter issues:

1. Check [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
2. Review `src/lib/sentry-config.ts` for configuration
3. Inspect `.cursor/rules/sentry-rules.md` for instrumentation patterns
4. Open browser DevTools > Console for Sentry logs


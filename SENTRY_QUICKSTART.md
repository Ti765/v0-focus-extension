# Sentry Quick Start Guide

## ⚡ Fast Track to Testing Sentry

### 1. Load Extension in Chrome

```bash
# Make sure you're in the project directory
cd v0-focus-extension

# Run development build (or use existing build)
npm run dev
```

Then:
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `dist` folder

### 2. Test Background Context (Service Worker)

1. On `chrome://extensions/` page
2. Find your extension
3. Click "service worker" link (it will say "inspect views: service worker")
4. In the DevTools console that opens, run:

```javascript
testSentryBackground()
```

Expected console output:
```
[Sentry Test] Testing background error tracking...
[Sentry Test] Span created
[Sentry Test] Log sent
[Sentry Test] Error captured
[Sentry Test] Check Sentry dashboard in 10-15 seconds
[Sentry Test] Dashboard: https://sentry.io/issues/
```

### 3. Test Popup Context

1. Click your extension icon in Chrome toolbar
2. Popup opens
3. Right-click inside popup > "Inspect"
4. In DevTools console, run:

```javascript
testSentryPopup()
```

### 4. Test Options Page Context

1. Right-click extension icon > "Options"
2. Options page opens
3. Press F12 to open DevTools
4. In console, run:

```javascript
testSentryOptions()
```

### 5. Test Content Script Context

1. Navigate to any website (e.g., https://example.com)
2. Press F12 to open DevTools
3. In console, run:

```javascript
testSentryContent()
```

### 6. Verify in Sentry Dashboard

Wait 10-15 seconds, then go to:

**https://sentry.io/issues/**

You should see 4 new issues (one per context):
- ❌ "Sentry Test Error - Background Context" (tag: `context:background`)
- ❌ "Sentry Test Error - Popup Context" (tag: `context:popup`)
- ❌ "Sentry Test Error - Options Context" (tag: `context:options`)
- ❌ "Sentry Test Error - Content Script Context" (tag: `context:content`)

## ✅ Success Checklist

- [ ] Background error appears in Sentry
- [ ] Popup error appears in Sentry
- [ ] Options error appears in Sentry
- [ ] Content error appears in Sentry
- [ ] All errors have correct `context` tag
- [ ] Console shows "[Sentry Test]" messages
- [ ] No CSP errors in console

## 🐛 Troubleshooting

### No Errors in Sentry?

1. **Check DSN:** Open `src/lib/sentry-config.ts` and verify DSN is correct
2. **Check Network:** In DevTools > Network tab, filter for "sentry.io" - you should see POST requests
3. **Check Console:** Look for "[v0][Sentry]" initialization messages
4. **Wait Longer:** Sometimes it takes 30-60 seconds for events to appear

### CSP Errors?

If you see "Refused to connect" errors:

1. Open `public/manifest.json`
2. Find `content_security_policy` section
3. Verify it contains your Sentry ingest URL

### Test Functions Not Found?

1. **For background:** Reload the extension (disable/enable or reload button)
2. **For popup/options:** Close and reopen the popup/options page
3. **For content:** Reload the webpage

## 📖 Next Steps

- **Full Testing Guide:** See `SENTRY_TESTING.md`
- **Implementation Details:** See `SENTRY_IMPLEMENTATION_SUMMARY.md`
- **Instrumentation Examples:** See `.cursor/rules/sentry-rules.md`

## 🎉 You're Done!

Sentry is now monitoring your extension. Use it normally and check the dashboard for real errors and performance data!


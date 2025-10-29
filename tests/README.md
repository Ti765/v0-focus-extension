# Testing Infrastructure

This directory contains the comprehensive testing infrastructure for the Chrome extension.

## Structure

```
tests/
├── setup.ts                 # Global test configuration
├── mocks/
│   └── chrome-api.ts        # Chrome API mocks
├── utils/
│   ├── test-helpers.ts     # Test utility functions
│   ├── log-collector.ts    # Structured logging
│   └── state-helpers.ts    # State management helpers
├── unit/
│   └── shared/             # Unit tests for utilities
└── integration/            # Integration tests for modules
```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Specific Module Tests
```bash
npm run test:blocker      # Blocker module
npm run test:tracker      # Usage tracker module
npm run test:pomodoro     # Pomodoro module
npm run test:messages     # Message handler
```

### Watch Mode
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

### Debug Mode
```bash
npm run test:debug
```

## Test Execution and Analysis

### Run Tests with Log Collection
```bash
npm run test:run
```

This will:
- Execute all tests
- Collect structured logs
- Generate test execution reports
- Save logs to `test-logs/`

### Analyze Errors
```bash
npm run test:analyze
```

This will:
- Analyze error logs
- Identify error patterns
- Generate error diagnosis report
- Suggest fixes

## Logs Structure

Logs are saved to `test-logs/` with the following structure:

```
test-logs/
├── execution/              # Test execution logs
├── errors/                 # Error logs with stack traces
├── state-snapshots/        # State snapshots
├── dnr-verification/       # DNR rule verifications
├── storage-audit/         # Storage audits
└── reports/                # Consolidated reports
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getLogCollector } from '../utils/log-collector';
import { mockChrome } from '../mocks/chrome-api';

describe('My Module', () => {
  beforeEach(async () => {
    getLogCollector().setTestName('my-module');
    await mockChrome.storage.local.clear();
  });

  it('should do something', async () => {
    // Test implementation
    getLogCollector().log('info', 'Test executed', { /* context */ });
  });
});
```

### Logging in Tests

Use the log collector to capture test execution details:

```typescript
// Log info
getLogCollector().log('info', 'Operation completed', { domain: 'example.com' });

// Log error
getLogCollector().logError('Operation failed', error, { context }, 'Suggested fix');

// Log state changes
getLogCollector().logStateChange('State updated', stateBefore, stateAfter, { context });
```

### State Snapshots

Capture state snapshots for debugging:

```typescript
import { createStateSnapshot } from '../utils/test-helpers';

const snapshot = createStateSnapshot('label');
```

### Chrome API Mocks

All Chrome APIs are mocked. Access them via:

```typescript
import { mockChrome } from '../mocks/chrome-api';

await mockChrome.storage.local.set({ key: 'value' });
const rules = await mockChrome.declarativeNetRequest.getDynamicRules();
```

## Test Reports

After running tests, check `test-logs/reports/` for:
- `test-report.md` - Test execution summary
- `error-analysis-report.md` - Error diagnosis and suggested fixes

## Best Practices

1. **Always clear state** in `beforeEach` hooks
2. **Use log collector** to capture test context
3. **Take state snapshots** before/after critical operations
4. **Verify storage consistency** after operations
5. **Test error cases** not just happy paths
6. **Use descriptive test names** that explain what is being tested


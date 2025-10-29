/**
 * Structured log collector for tests
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface TestLog {
  timestamp: string;
  test: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, any>;
  stateBefore?: Record<string, any>;
  stateAfter?: Record<string, any>;
  suggestedFix?: string;
}

class LogCollector {
  private logs: TestLog[] = [];
  private testName: string = '';
  private logDir: string = '';

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logDir = join(process.cwd(), 'test-logs', timestamp);
    mkdirSync(this.logDir, { recursive: true });
  }

  setTestName(testName: string): void {
    this.testName = testName;
  }

  log(level: TestLog['level'], message: string, context?: Record<string, any>, error?: Error): void {
    const logEntry: TestLog = {
      timestamp: new Date().toISOString(),
      test: this.testName,
      level,
      message,
      context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };
    this.logs.push(logEntry);
  }

  logStateChange(
    message: string,
    stateBefore: Record<string, any>,
    stateAfter: Record<string, any>,
    context?: Record<string, any>
  ): void {
    this.log('info', message, context);
    const lastLog = this.logs[this.logs.length - 1];
    lastLog.stateBefore = stateBefore;
    lastLog.stateAfter = stateAfter;
  }

  logError(message: string, error: Error, context?: Record<string, any>, suggestedFix?: string): void {
    const logEntry: TestLog = {
      timestamp: new Date().toISOString(),
      test: this.testName,
      level: 'error',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      suggestedFix,
    };
    this.logs.push(logEntry);
  }

  save(): string {
    const filename = join(this.logDir, `${this.testName.replace(/[^a-z0-9]/gi, '_')}.json`);
    writeFileSync(filename, JSON.stringify(this.logs, null, 2), 'utf-8');
    return filename;
  }

  getLogs(): TestLog[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

// Singleton instance
let collector: LogCollector | null = null;

export function getLogCollector(): LogCollector {
  if (!collector) {
    collector = new LogCollector();
  }
  return collector;
}

export function resetLogCollector(): void {
  if (collector) {
    collector.clear();
  }
  collector = null;
}

export function createLogCollector(): LogCollector {
  return new LogCollector();
}


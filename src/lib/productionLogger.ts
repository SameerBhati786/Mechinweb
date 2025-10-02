// Production-grade logging system for comprehensive error tracking and system monitoring
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  component?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

export class ProductionLogger {
  private static instance: ProductionLogger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeLogger();
  }

  public static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeLogger(): void {
    // Set up global error handlers
    window.addEventListener('error', (event) => {
      this.log('error', 'Global JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.log('error', 'Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Log page navigation
    this.log('info', 'Logger initialized', {
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  public log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any, component?: string): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      component,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add to memory logs
    this.logs.push(logEntry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging with enhanced formatting
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`, data || '');

    // Store critical errors in localStorage for debugging
    if (level === 'error') {
      try {
        const errorLogs = JSON.parse(localStorage.getItem('mechinweb_error_logs') || '[]');
        errorLogs.push(logEntry);
        // Keep only last 50 error logs
        const trimmedLogs = errorLogs.slice(-50);
        localStorage.setItem('mechinweb_error_logs', JSON.stringify(trimmedLogs));
      } catch (e) {
        console.error('Failed to store error log:', e);
      }
    }

    // In production, you could send logs to external service
    if (import.meta.env.PROD && level === 'error') {
      this.sendToExternalLogging(logEntry);
    }
  }

  private async sendToExternalLogging(logEntry: LogEntry): Promise<void> {
    try {
      // In production, send to logging service like LogRocket, Sentry, etc.
      // For now, we'll just log to console
      console.log('Would send to external logging service:', logEntry);
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  public getLogs(level?: 'info' | 'warn' | 'error' | 'debug'): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  public getErrorLogs(): LogEntry[] {
    return this.getLogs('error');
  }

  public clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('mechinweb_error_logs');
    this.log('info', 'Logs cleared');
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public getSystemSummary(): {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    sessionId: string;
    sessionDuration: number;
  } {
    const now = Date.now();
    const sessionStart = new Date(this.sessionId.split('_')[1]).getTime();
    
    return {
      totalLogs: this.logs.length,
      errorCount: this.logs.filter(log => log.level === 'error').length,
      warningCount: this.logs.filter(log => log.level === 'warn').length,
      sessionId: this.sessionId,
      sessionDuration: now - sessionStart
    };
  }
}

// Global logger instance
export const logger = ProductionLogger.getInstance();

// Global debug functions for browser console
(window as any).mechinwebLogger = {
  getLogs: () => logger.getLogs(),
  getErrors: () => logger.getErrorLogs(),
  clearLogs: () => logger.clearLogs(),
  exportLogs: () => logger.exportLogs(),
  getSummary: () => logger.getSystemSummary()
};
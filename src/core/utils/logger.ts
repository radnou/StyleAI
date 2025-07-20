import { Logger } from '../types/api';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  meta?: any;
  tags?: string[];
}

/**
 * Console logger implementation
 */
class ConsoleLogger implements Logger {
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    let formattedMessage = `[${timestamp}] ${levelName}: ${message}`;
    
    if (meta) {
      formattedMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return formattedMessage;
  }

  public debug(message: string, meta?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    if (__DEV__) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  public info(message: string, meta?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    console.info(this.formatMessage(LogLevel.INFO, message, meta));
  }

  public warn(message: string, meta?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  public error(message: string, meta?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    console.error(this.formatMessage(LogLevel.ERROR, message, meta));
  }
}

/**
 * Remote logger implementation for production
 */
class RemoteLogger implements Logger {
  private consoleLogger: ConsoleLogger;
  private logQueue: LogEntry[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private maxQueueSize: number = 100;

  constructor() {
    this.consoleLogger = new ConsoleLogger();
    this.startFlushTimer();
  }

  private startFlushTimer(): void {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private addToQueue(level: LogLevel, message: string, meta?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      meta,
    };

    this.logQueue.push(entry);

    // Flush immediately if queue is full
    if (this.logQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const entries = [...this.logQueue];
    this.logQueue = [];

    try {
      // TODO: Send logs to remote service
      // await this.sendLogsToRemote(entries);
    } catch (error) {
      // Fallback to console logging
      this.consoleLogger.error('Failed to send logs to remote service', { error });
      
      // Put logs back in queue for retry
      this.logQueue.unshift(...entries);
    }
  }

  public debug(message: string, meta?: any): void {
    this.consoleLogger.debug(message, meta);
    this.addToQueue(LogLevel.DEBUG, message, meta);
  }

  public info(message: string, meta?: any): void {
    this.consoleLogger.info(message, meta);
    this.addToQueue(LogLevel.INFO, message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.consoleLogger.warn(message, meta);
    this.addToQueue(LogLevel.WARN, message, meta);
  }

  public error(message: string, meta?: any): void {
    this.consoleLogger.error(message, meta);
    this.addToQueue(LogLevel.ERROR, message, meta);
  }
}

/**
 * Logger factory
 */
class LoggerFactory {
  private static instance: Logger;

  public static getLogger(): Logger {
    if (!this.instance) {
      this.instance = __DEV__ 
        ? new ConsoleLogger(LogLevel.DEBUG)
        : new RemoteLogger();
    }
    
    return this.instance;
  }

  public static setLogger(logger: Logger): void {
    this.instance = logger;
  }
}

// Export the default logger instance
export const logger = LoggerFactory.getLogger();

// Export factory for custom logger creation
export { LoggerFactory };

// Export implementations for testing
export { ConsoleLogger, RemoteLogger };
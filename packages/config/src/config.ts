import { dotenvLoad } from 'dotenv-mono';
import type { AppConfig, ConfigOptions, Environment, ServerConfig, SplunkConfig } from './types';

/**
 * Load and parse environment variables
 */
export class Config {
  private static instance: Config | null = null;
  private config: AppConfig;

  private constructor(options?: ConfigOptions) {
    // Load environment variables from centralized .env files
    dotenvLoad();

    // Build configuration
    this.config = this.buildConfig();

    // Validate unless skipped
    if (!options?.skipValidation) {
      this.validate();
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(options?: ConfigOptions): Config {
    if (!Config.instance) {
      Config.instance = new Config(options);
    }
    return Config.instance;
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static reset(): void {
    Config.instance = null;
  }

  /**
   * Build configuration from environment variables
   */
  private buildConfig(): AppConfig {
    return {
      env: this.getEnv(),
      logLevel: process.env.LOG_LEVEL || 'info',
      server: this.getServerConfig(),
      splunk: this.getSplunkConfig(),
    };
  }

  /**
   * Get environment
   */
  private getEnv(): Environment {
    const env = process.env.NODE_ENV || 'development';
    if (env !== 'development' && env !== 'production' && env !== 'test') {
      return 'development';
    }
    return env as Environment;
  }

  /**
   * Get server configuration
   */
  private getServerConfig(): ServerConfig {
    return {
      port: parseInt(process.env.PORT || '3000', 10),
    };
  }

  /**
   * Get Splunk configuration
   */
  private getSplunkConfig(): SplunkConfig {
    return {
      token: process.env.SPLUNK_TOKEN || '',
      host: process.env.SPLUNK_HOST || '',
      port: parseInt(process.env.SPLUNK_PORT || '8088', 10),
      hecEndpoint: process.env.SPLUNK_HEC_ENDPOINT || '/services/collector/event',
    };
  }

  /**
   * Validate required configuration
   */
  private validate(): void {
    const errors: string[] = [];

    if (!this.config.splunk.token) {
      errors.push('SPLUNK_TOKEN is required');
    }

    if (!this.config.splunk.host) {
      errors.push('SPLUNK_HOST is required');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Get full configuration
   */
  public get all(): Readonly<AppConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Get server configuration
   */
  public get server(): Readonly<ServerConfig> {
    return Object.freeze({ ...this.config.server });
  }

  /**
   * Get Splunk configuration
   */
  public get splunk(): Readonly<SplunkConfig> {
    return Object.freeze({ ...this.config.splunk });
  }

  /**
   * Get environment
   */
  public get environment(): Environment {
    return this.config.env;
  }

  /**
   * Get log level
   */
  public get logLevel(): string {
    return this.config.logLevel;
  }

  /**
   * Check if running in production
   */
  public get isProduction(): boolean {
    return this.config.env === 'production';
  }

  /**
   * Check if running in development
   */
  public get isDevelopment(): boolean {
    return this.config.env === 'development';
  }

  /**
   * Check if running in test
   */
  public get isTest(): boolean {
    return this.config.env === 'test';
  }
}

/**
 * Get configuration instance
 */
export function getConfig(options?: ConfigOptions): Config {
  return Config.getInstance(options);
}

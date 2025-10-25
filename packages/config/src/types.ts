/**
 * Environment type
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Splunk configuration
 */
export interface SplunkConfig {
  token: string;
  host: string;
  port: number;
  hecEndpoint: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
  env: Environment;
  logLevel: string;
  splunk: SplunkConfig;
}

/**
 * Configuration options for initialization
 */
export interface ConfigOptions {
  /**
   * Skip environment validation
   */
  skipValidation?: boolean;
}

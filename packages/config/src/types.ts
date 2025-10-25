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
 * Server configuration
 */
export interface ServerConfig {
  port: number;
}

/**
 * Application configuration
 */
export interface AppConfig {
  env: Environment;
  logLevel: string;
  server: ServerConfig;
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

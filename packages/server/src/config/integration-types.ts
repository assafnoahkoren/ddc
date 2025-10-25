import { z } from 'zod';

// Strategy types
export const IntegrationStrategy = {
  API_KEY: 'api_key',
  OAUTH: 'oauth',
} as const;

export type IntegrationStrategyType = typeof IntegrationStrategy[keyof typeof IntegrationStrategy];

// Configuration field types
export interface IntegrationConfigField {
  name: string;
  type: 'text' | 'password' | 'url' | 'email';
  description: string;
  required?: boolean;
}

// Configuration schema with fields
export interface IntegrationConfigSchema {
  name: IntegrationConfigField;
  fields: IntegrationConfigField[];
}

// Integration type definitions
export interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  supportedStrategies: IntegrationStrategyType[];
  configSchema: IntegrationConfigSchema;
}

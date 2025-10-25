import { z } from 'zod';

// Strategy types
export const IntegrationStrategy = {
  API_KEY: 'api_key',
  OAUTH: 'oauth',
} as const;

export type IntegrationStrategyType = typeof IntegrationStrategy[keyof typeof IntegrationStrategy];

// Configuration schemas for each strategy
export const ApiKeyConfigSchema = z.object({
  host: z.string().url(),
  apiKey: z.string().min(1),
});

export const OAuthConfigSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type ApiKeyConfig = z.infer<typeof ApiKeyConfigSchema>;
export type OAuthConfig = z.infer<typeof OAuthConfigSchema>;

// Integration type definitions
export interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  supportedStrategies: IntegrationStrategyType[];
  configSchema: z.ZodSchema;
}

// Available integrations configuration
export const availableIntegrations: Record<string, IntegrationDefinition> = {
  'splunk': {
    id: 'splunk',
    name: 'Splunk',
    description: 'Connect to Splunk for log analysis',
    icon: '/logos/splunk.png',
    supportedStrategies: [IntegrationStrategy.API_KEY],
    configSchema: ApiKeyConfigSchema,
  },
  // Future integrations can be added here
  // 'datadog': {
  //   id: 'datadog',
  //   name: 'Datadog',
  //   description: 'Monitor your infrastructure with Datadog',
  //   icon: '/logos/datadog.png',
  //   supportedStrategies: [IntegrationStrategy.API_KEY, IntegrationStrategy.OAUTH],
  //   configSchema: ApiKeyConfigSchema, // or a union schema
  // },
};

// Helper to get integration definition
export function getIntegrationDefinition(integrationId: string): IntegrationDefinition | undefined {
  return availableIntegrations[integrationId];
}

// Helper to validate configuration for a specific integration
export function validateIntegrationConfig(integrationId: string, config: unknown) {
  const definition = getIntegrationDefinition(integrationId);
  if (!definition) {
    throw new Error(`Unknown integration type: ${integrationId}`);
  }
  return definition.configSchema.parse(config);
}

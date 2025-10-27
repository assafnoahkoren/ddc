import type { Prisma } from '@ddc/db';
import type { IntegrationDefinition } from './integration-types';
import { DatasourceConfig } from '../integrations/infra';

// Re-export types from separate file
export * from './integration-types';

// Re-export available integrations from separate file
export { availableIntegrations } from './available-integrations';

// Helper to get integration definition
export function getIntegrationDefinition(integrationId: string): IntegrationDefinition | undefined {
  // Lazy import to avoid circular dependency
  const { availableIntegrations } = require('./available-integrations');
  return availableIntegrations[integrationId];
}

// Helper to validate configuration for a specific integration
export function validateIntegrationConfig(integrationId: string, config: unknown): any {
  const definition = getIntegrationDefinition(integrationId);
  if (!definition) {
    throw new Error(`Unknown integration type: ${integrationId}`);
  }

  if (typeof config !== 'object' || config === null) {
    throw new Error('Configuration must be an object');
  }

  const configObj = config as Record<string, unknown>;

  // Validate that all required fields are present
  for (const field of definition.configSchema.fields) {
    if (field.required !== false && !configObj[field.name]) {
      throw new Error(`Missing required field: ${field.name}`);
    }
  }

  return config as Prisma.InputJsonValue;
}

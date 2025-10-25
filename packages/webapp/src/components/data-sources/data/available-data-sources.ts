import type { DataSource } from '../../../types/data-source';
import { availableIntegrations } from '@ddc/server/src/config/integrations';

export const availableDataSources: DataSource[] = Object.values(availableIntegrations).map((integration) => ({
  id: integration.id,
  name: integration.name,
  icon: integration.icon,
  integrationId: integration.id,
  description: integration.description,
}));

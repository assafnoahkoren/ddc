export * from './DatasourceSDK';

import type { DatasourceSDK } from './DatasourceSDK';
import { splunkSDK } from '../splunk';

// Integration IDs
export const INTEGRATION_IDS = ['splunk'] as const;
export type IntegrationId = typeof INTEGRATION_IDS[number];

// SDK Registry - maps integration ID to its SDK implementation
export const SDK_REGISTRY: Record<IntegrationId, DatasourceSDK> = {
  splunk: splunkSDK,
};

export * from './DatasourceSDK';

import type { DatasourceSDK } from './DatasourceSDK';
import { splunkSDK } from '../splunk';
import { splunkMockSDK } from '../splunk-mock';

// Integration IDs
export const INTEGRATION_TYPES = ['splunk', 'splunk-mock'] as const;
export type IntegrationType = typeof INTEGRATION_TYPES[number];

// SDK Registry - maps integration ID to its SDK implementation
export const SDK_REGISTRY: Record<IntegrationType, DatasourceSDK> = {
  splunk: splunkSDK,
  'splunk-mock': splunkMockSDK,
};

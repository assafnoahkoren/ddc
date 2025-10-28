/**
 * Splunk Mock DatasourceSDK Implementation
 *
 * Provides fake Splunk data for development and testing without requiring
 * actual Splunk Cloud Platform connection or IP allowlisting.
 */

import type {
  DatasourceSDK,
  DatasourceConfig,
  SchemaDiscoveryResult,
  FieldDiscoveryResult,
} from '../infra';
import type { QueryAST } from '../../types/query-ast';
import {
  mockValidateConnection,
  mockDiscoverCollections,
  mockDiscoverFields,
  mockQuery,
} from '@ddc/data-pumper';

/**
 * Splunk Mock SDK - Uses fake data generators
 */
export class SplunkMockSDK implements DatasourceSDK {
  /**
   * Validate the connection (always succeeds in mock mode)
   */
  async validateConnection(config: DatasourceConfig): Promise<boolean> {
    return mockValidateConnection();
  }

  /**
   * Discover collections using mock data
   */
  async discoverCollections(config: DatasourceConfig): Promise<SchemaDiscoveryResult> {
    return mockDiscoverCollections();
  }

  /**
   * Discover fields using mock data
   */
  async discoverFields(
    config: DatasourceConfig,
    collectionName: string
  ): Promise<FieldDiscoveryResult> {
    return mockDiscoverFields(collectionName);
  }

  /**
   * Convert a QueryAST to Splunk SPL (uses the same implementation as real Splunk SDK)
   */
  convertQueryAST(queryAST: QueryAST, fieldMappings: Record<string, string>): string {
    // Import and use the real SplunkSDK implementation
    const { splunkSDK } = require('../splunk/SplunkSDK');
    return splunkSDK.convertQueryAST(queryAST, fieldMappings);
  }

  /**
   * Query data using mock data
   */
  async query(
    config: DatasourceConfig,
    collectionName: string,
    query: Record<string, unknown>
  ): Promise<unknown[]> {
    return mockQuery(collectionName, query);
  }
}

// Export singleton instance
export const splunkMockSDK = new SplunkMockSDK();

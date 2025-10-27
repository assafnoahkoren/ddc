/**
 * DatasourceSDK Interface
 *
 * This interface defines the contract that all datasource integrations must implement
 * to enable schema discovery and data access capabilities.
 */

import { FieldDataType } from '@ddc/db';

/**
 * Represents a collection discovered from a datasource
 * (e.g., Splunk index+sourcetype, Datadog log source, etc.)
 */
export interface DiscoveredCollection {
  name: string;
  metadata?: Record<string, unknown>;
}

/**
 * Represents a physical field discovered from a collection
 */
export interface DiscoveredField {
  name: string;
  dataType: FieldDataType;
  metadata?: Record<string, unknown>;
}

/**
 * Result of schema discovery operation
 */
export interface SchemaDiscoveryResult {
  collections: DiscoveredCollection[];
  success: boolean;
  error?: string;
}

/**
 * Result of field discovery for a specific collection
 */
export interface FieldDiscoveryResult {
  fields: DiscoveredField[];
  success: boolean;
  error?: string;
}

/**
 * Configuration for connecting to a datasource
 */
export interface DatasourceConfig {
  [key: string]: unknown;
}

/**
 * DatasourceSDK Interface
 *
 * All datasource integrations (Splunk, Datadog, etc.) must implement this interface
 * to provide schema discovery and data access capabilities.
 */
export interface DatasourceSDK {
  /**
   * Validate the connection to the datasource
   * @param config - Datasource configuration
   * @returns Promise resolving to true if connection is valid
   */
  validateConnection(config: DatasourceConfig): Promise<boolean>;

  /**
   * Discover all available collections from the datasource
   * @param config - Datasource configuration
   * @returns Promise resolving to schema discovery result
   */
  discoverCollections(config: DatasourceConfig): Promise<SchemaDiscoveryResult>;

  /**
   * Discover all fields available in a specific collection
   * @param config - Datasource configuration
   * @param collectionName - Name of the collection to discover fields for
   * @returns Promise resolving to field discovery result
   */
  discoverFields(
    config: DatasourceConfig,
    collectionName: string
  ): Promise<FieldDiscoveryResult>;

  /**
   * Query data from a collection
   * @param config - Datasource configuration
   * @param collectionName - Name of the collection to query
   * @param query - Query parameters (datasource-specific)
   * @returns Promise resolving to query results
   */
  query(
    config: DatasourceConfig,
    collectionName: string,
    query: Record<string, unknown>
  ): Promise<unknown[]>;
}

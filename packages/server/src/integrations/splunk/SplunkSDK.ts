/**
 * Splunk DatasourceSDK Implementation
 *
 * Implements the DatasourceSDK interface for Splunk integration,
 * providing schema discovery and data access capabilities.
 */

import axios, { type AxiosInstance } from 'axios';
import { FieldDataType } from '@ddc/db';
import type {
  DatasourceSDK,
  DatasourceConfig,
  SchemaDiscoveryResult,
  FieldDiscoveryResult,
  DiscoveredCollection,
  DiscoveredField,
} from '../infra';
import type { QueryAST, FilterCondition, ComparisonFilter, LogicalFilter } from '../../types/query-ast';
import { QueryOperator, LogicalOperator } from '../../types/query-ast';

interface SplunkConfig extends DatasourceConfig {
  host: string;
  'management-port': string;
  'api-key': string;
}

interface SplunkIndex {
  name: string;
  totalEventCount?: string;
  currentDBSizeMB?: string;
}

interface SplunkSourcetype {
  name: string;
}

interface SplunkFieldSummary {
  name: string;
  count: number;
  distinct_count: number;
}

/**
 * Create a configured Axios client for Splunk API
 */
function createSplunkClient(config: SplunkConfig): AxiosInstance {
  const isSplunkCloud = config.host.includes('.splunkcloud.com');

  // Splunk Cloud uses port 443 and a different path structure
  const baseURL = isSplunkCloud
    ? `${config.host}/en-US/splunkd/__raw`
    : `${config.host}:${config['management-port']}`;

  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${config['api-key']}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
    maxRedirects: 5,
    // Disable SSL verification for development (should be configurable in production)
    httpsAgent: new (require('https').Agent)({
      rejectUnauthorized: false,
    }),
  });
}

/**
 * Splunk DatasourceSDK Implementation
 */
export class SplunkSDK implements DatasourceSDK {
  /**
   * Validate the connection to Splunk
   */
  async validateConnection(config: DatasourceConfig): Promise<boolean> {
    const splunkConfig = config as SplunkConfig;

    try {
      console.log('====== Validating Splunk Connection ======');
      console.log('Host:', splunkConfig.host);
      console.log('Port:', splunkConfig['management-port']);

      const client = createSplunkClient(splunkConfig);

      // Test connection by fetching server info
      const response = await client.get('/services/server/info', {
        params: { output_mode: 'json' },
      });

      console.log('Connection successful!');
      console.log('Server version:', response.data?.entry?.[0]?.content?.version);

      return response.status === 200;
    } catch (error) {
      console.error('Connection validation failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Message:', error.message);
      }
      return false;
    }
  }

  /**
   * Discover all available collections (index + sourcetype combinations) from Splunk
   */
  async discoverCollections(config: DatasourceConfig): Promise<SchemaDiscoveryResult> {
    const splunkConfig = config as SplunkConfig;

    try {
      console.log('====== Discovering Splunk Collections ======');

      const client = createSplunkClient(splunkConfig);

      // Fetch indexes
      console.log('Step 1: Fetching indexes...');
      const indexesResponse = await client.get('/services/data/indexes', {
        params: { output_mode: 'json', count: 0 },
      });

      const indexes: SplunkIndex[] = indexesResponse.data?.entry?.map((entry: any) => ({
        name: entry.name,
        totalEventCount: entry.content?.totalEventCount,
        currentDBSizeMB: entry.content?.currentDBSizeMB,
      })) || [];

      console.log(`Found ${indexes.length} indexes`);

      // Fetch sourcetypes
      console.log('Step 2: Fetching sourcetypes...');
      const sourcetypesResponse = await client.get('/services/saved/sourcetypes', {
        params: { output_mode: 'json', count: 0 },
      });

      const sourcetypes: SplunkSourcetype[] = sourcetypesResponse.data?.entry?.map((entry: any) => ({
        name: entry.name,
      })) || [];

      console.log(`Found ${sourcetypes.length} sourcetypes`);

      // Create collections from index + sourcetype combinations
      const collections: DiscoveredCollection[] = [];

      for (const index of indexes) {
        for (const sourcetype of sourcetypes) {
          collections.push({
            name: `index:${index.name}, sourcetype:${sourcetype.name}`,
            metadata: {
              index: index.name,
              sourcetype: sourcetype.name,
              totalEventCount: index.totalEventCount,
              currentDBSizeMB: index.currentDBSizeMB,
            },
          });
        }
      }

      console.log(`Created ${collections.length} collections from combinations`);
      console.log('====== Collection Discovery Complete ======');

      return {
        collections,
        success: true,
      };
    } catch (error) {
      console.error('Collection discovery failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Error details:', error.response?.data);
      }

      return {
        collections: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Discover fields in a specific collection
   */
  async discoverFields(
    config: DatasourceConfig,
    collectionName: string
  ): Promise<FieldDiscoveryResult> {
    const splunkConfig = config as SplunkConfig;

    try {
      console.log('====== Discovering Fields for Collection ======');
      console.log('Collection:', collectionName);

      // Parse collection name (format: "index:main, sourcetype:sysmon")
      const indexMatch = collectionName.match(/index:([^,]+)/);
      const sourcetypeMatch = collectionName.match(/sourcetype:(.+)/);

      if (!indexMatch || !sourcetypeMatch) {
        throw new Error('Invalid collection name format');
      }

      const index = indexMatch[1].trim();
      const sourcetype = sourcetypeMatch[1].trim();

      console.log('Index:', index);
      console.log('Sourcetype:', sourcetype);

      const client = createSplunkClient(splunkConfig);

      // Run a search to discover fields
      console.log('Step 1: Running field discovery search...');
      const searchQuery = `search index="${index}" sourcetype="${sourcetype}" | fieldsummary maxvals=0 | table field`;

      const searchResponse = await client.post(
        '/services/search/jobs',
        new URLSearchParams({
          search: searchQuery,
          output_mode: 'json',
          earliest_time: '-24h',
          latest_time: 'now',
        })
      );

      const searchId = searchResponse.data?.sid;
      console.log('Search job created:', searchId);

      // Wait for search to complete
      console.log('Step 2: Waiting for search to complete...');
      let isComplete = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!isComplete && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const statusResponse = await client.get(`/services/search/jobs/${searchId}`, {
          params: { output_mode: 'json' },
        });

        const dispatchState = statusResponse.data?.entry?.[0]?.content?.dispatchState;
        isComplete = dispatchState === 'DONE';
        attempts++;

        console.log(`Attempt ${attempts}: ${dispatchState}`);
      }

      if (!isComplete) {
        throw new Error('Search job timed out');
      }

      // Get search results
      console.log('Step 3: Fetching search results...');
      const resultsResponse = await client.get(`/services/search/jobs/${searchId}/results`, {
        params: { output_mode: 'json', count: 0 },
      });

      const fields: DiscoveredField[] = resultsResponse.data?.results?.map((result: any) => ({
        name: result.field,
        dataType: FieldDataType.STRING, // For now, all fields are strings
        metadata: {
          discoveredAt: new Date().toISOString(),
        },
      })) || [];

      console.log(`Discovered ${fields.length} fields`);
      console.log('====== Field Discovery Complete ======');

      return {
        fields,
        success: true,
      };
    } catch (error) {
      console.error('Field discovery failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Error details:', error.response?.data);
      }

      return {
        fields: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Convert a QueryAST to Splunk SPL (Search Processing Language)
   */
  convertQueryAST(queryAST: QueryAST, fieldMappings: Record<string, string>): string {
    // Helper to map logical field to physical field
    const mapField = (logicalField: string): string => {
      return fieldMappings[logicalField] || logicalField;
    };

    // Helper to convert filter condition to SPL
    const convertFilter = (filter: FilterCondition): string => {
      if (filter.type === 'comparison') {
        const compFilter = filter as ComparisonFilter;
        const physicalField = mapField(compFilter.field);
        const value = compFilter.value;

        switch (compFilter.operator) {
          case QueryOperator.EQUALS:
            return `${physicalField}="${value}"`;
          case QueryOperator.CONTAINS:
            return `${physicalField}=*${value}*`;
          case QueryOperator.GREATER_THAN:
            return `${physicalField}>${value}`;
          case QueryOperator.LESS_THAN:
            return `${physicalField}<${value}`;
          default:
            return `${physicalField}="${value}"`;
        }
      } else {
        const logicalFilter = filter as LogicalFilter;
        const conditions = logicalFilter.conditions.map(convertFilter);

        switch (logicalFilter.operator) {
          case LogicalOperator.AND:
            return conditions.join(' AND ');
          case LogicalOperator.OR:
            return `(${conditions.join(' OR ')})`;
          default:
            return conditions.join(' AND ');
        }
      }
    };

    // Build SPL query
    let spl = 'search';

    // Add filter conditions
    if (queryAST.where) {
      spl += ` ${convertFilter(queryAST.where)}`;
    }

    // Add field selection (table command)
    if (queryAST.select && queryAST.select.length > 0) {
      const physicalFields = queryAST.select.map(mapField);
      spl += ` | table ${physicalFields.join(', ')}`;
    }

    // Add limit (head command)
    if (queryAST.limit) {
      spl += ` | head ${queryAST.limit}`;
    }

    return spl;
  }

  /**
   * Query data from a Splunk collection
   */
  async query(
    config: DatasourceConfig,
    collectionName: string,
    query: Record<string, unknown>
  ): Promise<unknown[]> {
    const splunkConfig = config as SplunkConfig;

    try {
      console.log('====== Querying Splunk Collection ======');
      console.log('Collection:', collectionName);
      console.log('Query:', query);

      // Parse collection name
      const indexMatch = collectionName.match(/index:([^,]+)/);
      const sourcetypeMatch = collectionName.match(/sourcetype:(.+)/);

      if (!indexMatch || !sourcetypeMatch) {
        throw new Error('Invalid collection name format');
      }

      const index = indexMatch[1].trim();
      const sourcetype = sourcetypeMatch[1].trim();

      const client = createSplunkClient(splunkConfig);

      // Build search query
      const searchQuery = query.search as string || `search index="${index}" sourcetype="${sourcetype}"`;
      const earliestTime = query.earliest_time as string || '-1h';
      const latestTime = query.latest_time as string || 'now';
      const limit = query.limit as number || 100;

      console.log('Search query:', searchQuery);

      // Run search
      const searchResponse = await client.post(
        '/services/search/jobs',
        new URLSearchParams({
          search: searchQuery,
          output_mode: 'json',
          earliest_time: earliestTime,
          latest_time: latestTime,
        })
      );

      const searchId = searchResponse.data?.sid;

      // Wait for completion
      let isComplete = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!isComplete && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const statusResponse = await client.get(`/services/search/jobs/${searchId}`, {
          params: { output_mode: 'json' },
        });

        const dispatchState = statusResponse.data?.entry?.[0]?.content?.dispatchState;
        isComplete = dispatchState === 'DONE';
        attempts++;
      }

      if (!isComplete) {
        throw new Error('Search job timed out');
      }

      // Get results
      const resultsResponse = await client.get(`/services/search/jobs/${searchId}/results`, {
        params: { output_mode: 'json', count: limit },
      });

      const results = resultsResponse.data?.results || [];

      console.log(`Query returned ${results.length} results`);
      console.log('====== Query Complete ======');

      return results;
    } catch (error) {
      console.error('Query failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Error details:', error.response?.data);
      }

      throw error;
    }
  }
}

// Export singleton instance
export const splunkSDK = new SplunkSDK();

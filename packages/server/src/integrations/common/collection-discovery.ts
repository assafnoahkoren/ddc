/**
 * Collection Discovery
 *
 * Discovers collections from a datasource and saves them to the database
 */

import type { IntegrationType, DatasourceConfig, SDK_REGISTRY } from '../infra';
import { prisma } from '@ddc/db';

export interface CollectionDiscoveryResult {
  success: boolean;
  collectionsCreated: number;
  error?: string;
}

/**
 * Discover and save collections from a datasource
 * @param integrationId - The database ID of the integration record
 * @param sdk - The SDK to use for discovery
 * @param config - Datasource configuration
 */
export async function discoverAndSaveCollections(
  integrationId: string,
  sdk: typeof SDK_REGISTRY[IntegrationType],
  config: DatasourceConfig
): Promise<CollectionDiscoveryResult> {
  try {
    console.log('====== Starting Collection Discovery ======');
    console.log('Integration ID:', integrationId);

    // Discover collections using the SDK
    const discoveryResult = await sdk.discoverCollections(config);

    if (!discoveryResult.success) {
      console.error('Collection discovery failed:', discoveryResult.error);
      return {
        success: false,
        collectionsCreated: 0,
        error: discoveryResult.error,
      };
    }

    console.log(`Discovered ${discoveryResult.collections.length} collections`);

    // Save collections to database
    let collectionsCreated = 0;

    for (const collection of discoveryResult.collections) {
      try {
        await prisma.collection.create({
          data: {
            integrationId,
            name: collection.name,
            metadata: collection.metadata as any,
          },
        });
        collectionsCreated++;
      } catch (error) {
        console.error(`Failed to save collection ${collection.name}:`, error);
        // Continue with next collection
      }
    }

    console.log(`Successfully saved ${collectionsCreated} collections`);
    console.log('====== Collection Discovery Complete ======');

    return {
      success: true,
      collectionsCreated,
    };
  } catch (error) {
    console.error('Collection discovery failed:', error);
    return {
      success: false,
      collectionsCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

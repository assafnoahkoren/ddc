import { prisma } from '@ddc/db';

/**
 * Datasource Discovery
 *
 * Main entry point for discovering datasource schema (collections and fields)
 * Uses the SDK registry to delegate to the appropriate datasource implementation
 */

import type { IntegrationType as IntegrationType, DatasourceConfig } from '../infra';
import { SDK_REGISTRY } from '../infra';
import { discoverAndSaveCollections } from './collection-discovery';
import { discoverAndSaveFields } from './field-discovery';

export interface DatasourceDiscoveryResult {
  success: boolean;
  collectionsCreated: number;
  fieldsCreated: number;
  error?: string;
}

export interface DatasourceDiscoveryOptions {
  /** If true, also discover fields for each collection (can be slow) */
  discoverFields?: boolean;
  /** Maximum number of collections to discover fields for (if discoverFields is true) */
  maxCollections?: number;
}

/**
 * Discover datasource schema (collections and optionally fields)
 * @param integrationId - The database ID of the integration record
 * @param integrationType - The type of integration (e.g., 'splunk')
 * @param config - Datasource configuration
 * @param options - Discovery options
 */
export async function discoverDatasourceSchema(
  integrationId: string,
  integrationType: IntegrationType,
  config: DatasourceConfig,
  options: DatasourceDiscoveryOptions = {}
): Promise<DatasourceDiscoveryResult> {
  const { discoverFields = false, maxCollections = 10 } = options;

  try {
    console.log('====== Starting Datasource Discovery ======');
    console.log('Integration Type:', integrationType);
    console.log('Discover Fields:', discoverFields);

    // Get the SDK for this integration type
    const sdk = SDK_REGISTRY[integrationType];
    if (!sdk) {
      throw new Error(`No SDK found for integration type: ${integrationType}`);
    }

    // Step 1: Discover and save collections
    const collectionResult = await discoverAndSaveCollections(
      integrationId,
      sdk,
      config
    );

    if (!collectionResult.success) {
      return {
        success: false,
        collectionsCreated: 0,
        fieldsCreated: 0,
        error: collectionResult.error,
      };
    }

    let totalFieldsCreated = 0;

    // Step 2: Optionally discover fields for each collection
    if (discoverFields && collectionResult.collectionsCreated > 0) {
      console.log('====== Starting Field Discovery for Collections ======');

      // Fetch the collections we just created (limit to maxCollections)
      const collections = await prisma.collection.findMany({
        where: { integrationId },
        take: maxCollections,
        orderBy: { createdAt: 'desc' },
      });

      console.log(`Discovering fields for ${collections.length} collections`);

      // Discover fields for each collection
      for (const collection of collections) {
        const fieldResult = await discoverAndSaveFields(
          collection.id,
          collection.name,
          sdk,
          config
        );

        if (fieldResult.success) {
          totalFieldsCreated += fieldResult.fieldsCreated;
        } else {
          console.error(
            `Field discovery failed for collection ${collection.name}:`,
            fieldResult.error
          );
          // Continue with next collection
        }
      }
    }

    console.log('====== Datasource Discovery Complete ======');
    console.log('Collections created:', collectionResult.collectionsCreated);
    console.log('Fields created:', totalFieldsCreated);

    return {
      success: true,
      collectionsCreated: collectionResult.collectionsCreated,
      fieldsCreated: totalFieldsCreated,
    };
  } catch (error) {
    console.error('Datasource discovery failed:', error);
    return {
      success: false,
      collectionsCreated: 0,
      fieldsCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

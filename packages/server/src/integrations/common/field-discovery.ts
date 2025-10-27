/**
 * Field Discovery
 *
 * Discovers physical fields from a collection and saves them to the database
 */

import type { IntegrationType, DatasourceConfig, SDK_REGISTRY } from '../infra';
import { prisma } from '@ddc/db';

export interface FieldDiscoveryResult {
  success: boolean;
  fieldsCreated: number;
  error?: string;
}

/**
 * Discover and save fields for a specific collection
 * @param collectionId - The database ID of the collection record
 * @param collectionName - The name of the collection to discover fields for
 * @param sdk - The SDK to use for discovery
 * @param config - Datasource configuration
 */
export async function discoverAndSaveFields(
  collectionId: string,
  collectionName: string,
  sdk: typeof SDK_REGISTRY[IntegrationType],
  config: DatasourceConfig
): Promise<FieldDiscoveryResult> {
  try {
    console.log('====== Starting Field Discovery ======');
    console.log('Collection ID:', collectionId);
    console.log('Collection Name:', collectionName);

    // Discover fields using the SDK
    const discoveryResult = await sdk.discoverFields(config, collectionName);

    if (!discoveryResult.success) {
      console.error('Field discovery failed:', discoveryResult.error);
      return {
        success: false,
        fieldsCreated: 0,
        error: discoveryResult.error,
      };
    }

    console.log(`Discovered ${discoveryResult.fields.length} fields`);

    // Save fields to database
    let fieldsCreated = 0;

    for (const field of discoveryResult.fields) {
      try {
        await prisma.physicalField.create({
          data: {
            collectionId,
            name: field.name,
            dataType: field.dataType,
            metadata: field.metadata as any,
          },
        });
        fieldsCreated++;
      } catch (error) {
        console.error(`Failed to save field ${field.name}:`, error);
        // Continue with next field
      }
    }

    console.log(`Successfully saved ${fieldsCreated} fields`);
    console.log('====== Field Discovery Complete ======');

    return {
      success: true,
      fieldsCreated,
    };
  } catch (error) {
    console.error('Field discovery failed:', error);
    return {
      success: false,
      fieldsCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

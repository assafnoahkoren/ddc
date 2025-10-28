import { prisma } from './index';
import type {
  LogicalSchemaToCollection,
  LogicalToPhysicalFieldMapping,
  Prisma,
} from '../_generated/client';

export class SchemaMappingService {
  /**
   * Get all mappings for a logical schema with full details
   */
  async getMappingsForSchema(logicalSchemaId: string) {
    return prisma.logicalSchemaToCollection.findMany({
      where: { logicalSchemaId },
      include: {
        collection: {
          include: {
            physicalFields: {
              orderBy: { name: 'asc' },
            },
            integration: true,
          },
        },
        fieldMappings: {
          include: {
            logicalField: true,
            physicalField: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new mapping between logical schema and collection with field mappings
   */
  async createMapping(data: {
    logicalSchemaId: string;
    collectionId: string;
    fieldMappings: Array<{
      logicalFieldId: string;
      physicalFieldId: string;
      transformation?: string;
      confidence?: number;
    }>;
    metadata?: Prisma.InputJsonValue;
  }) {
    const { fieldMappings, ...schemaToCollectionData } = data;

    return prisma.logicalSchemaToCollection.create({
      data: {
        ...schemaToCollectionData,
        fieldMappings: {
          create: fieldMappings,
        },
      },
      include: {
        collection: {
          include: {
            physicalFields: true,
            integration: true,
          },
        },
        fieldMappings: {
          include: {
            logicalField: true,
            physicalField: true,
          },
        },
      },
    });
  }

  /**
   * Update field mappings for an existing schema-to-collection mapping
   */
  async updateFieldMappings(
    schemaToCollectionId: string,
    fieldMappings: Array<{
      logicalFieldId: string;
      physicalFieldId: string;
      transformation?: string;
      confidence?: number;
    }>
  ) {
    // Delete existing field mappings
    await prisma.logicalToPhysicalFieldMapping.deleteMany({
      where: { schemaToCollectionId },
    });

    // Create new field mappings
    await prisma.logicalToPhysicalFieldMapping.createMany({
      data: fieldMappings.map((mapping) => ({
        schemaToCollectionId,
        ...mapping,
      })),
    });

    // Return updated mapping
    return prisma.logicalSchemaToCollection.findUnique({
      where: { id: schemaToCollectionId },
      include: {
        collection: {
          include: {
            physicalFields: true,
            integration: true,
          },
        },
        fieldMappings: {
          include: {
            logicalField: true,
            physicalField: true,
          },
        },
      },
    });
  }

  /**
   * Delete a schema-to-collection mapping (and all its field mappings via cascade)
   */
  async deleteMapping(id: string): Promise<LogicalSchemaToCollection> {
    return prisma.logicalSchemaToCollection.delete({
      where: { id },
    });
  }

  /**
   * Get a specific mapping by ID
   */
  async getMappingById(id: string) {
    return prisma.logicalSchemaToCollection.findUnique({
      where: { id },
      include: {
        collection: {
          include: {
            physicalFields: {
              orderBy: { name: 'asc' },
            },
            integration: true,
          },
        },
        fieldMappings: {
          include: {
            logicalField: true,
            physicalField: true,
          },
        },
        logicalSchema: {
          include: {
            logicalFields: {
              orderBy: { name: 'asc' },
            },
          },
        },
      },
    });
  }

  /**
   * Get field mappings for a logical schema and collection
   * Used for query conversion to map logical field names to physical field names
   */
  async getFieldMappings(logicalSchemaId: string, collectionId: string) {
    const schemaToCollection = await prisma.logicalSchemaToCollection.findFirst({
      where: {
        logicalSchemaId,
        collectionId,
      },
      include: {
        fieldMappings: {
          include: {
            logicalField: true,
            physicalField: true,
          },
        },
      },
    });

    return schemaToCollection?.fieldMappings || [];
  }
}

// Export singleton instance
export const schemaMappingService = new SchemaMappingService();

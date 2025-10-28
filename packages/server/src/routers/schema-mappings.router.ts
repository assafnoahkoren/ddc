import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { schemaMappingService } from '@ddc/db';

const fieldMappingSchema = z.object({
  logicalFieldId: z.string(),
  physicalFieldId: z.string(),
  transformation: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const schemaMappingsRouter = router({
  /**
   * Get all mappings for a logical schema
   */
  getForSchema: protectedProcedure
    .input(z.object({ logicalSchemaId: z.string() }))
    .query(async ({ input }) => {
      return schemaMappingService.getMappingsForSchema(input.logicalSchemaId);
    }),

  /**
   * Get a specific mapping by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const mapping = await schemaMappingService.getMappingById(input.id);
      if (!mapping) {
        throw new Error('Schema mapping not found');
      }
      return mapping;
    }),

  /**
   * Create a new schema-to-collection mapping with field mappings
   */
  create: protectedProcedure
    .input(
      z.object({
        logicalSchemaId: z.string(),
        collectionId: z.string(),
        fieldMappings: z.array(fieldMappingSchema),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return schemaMappingService.createMapping(input);
    }),

  /**
   * Update field mappings for an existing schema-to-collection mapping
   */
  updateFieldMappings: protectedProcedure
    .input(
      z.object({
        schemaToCollectionId: z.string(),
        fieldMappings: z.array(fieldMappingSchema),
      })
    )
    .mutation(async ({ input }) => {
      return schemaMappingService.updateFieldMappings(
        input.schemaToCollectionId,
        input.fieldMappings
      );
    }),

  /**
   * Delete a schema-to-collection mapping
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return schemaMappingService.deleteMapping(input.id);
    }),
});

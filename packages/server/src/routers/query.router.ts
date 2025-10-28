import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { integrationService, schemaMappingService } from '@ddc/db';
import { SDK_REGISTRY } from '../integrations/infra';
import type { QueryAST } from '../types/query-ast';

/**
 * Zod schema for QueryAST validation
 */
const queryASTSchema: z.ZodType<QueryAST> = z.object({
  logicalSchemaId: z.string(),
  select: z.array(z.string()).optional(),
  where: z.any().optional(), // Simplified for now - could be more strict
  limit: z.number().optional(),
}) as any;

export const queryRouter = router({
  /**
   * Convert a QueryAST to datasource-specific queries for ALL mapped collections
   */
  convertToQuery: protectedProcedure
    .input(
      z.object({
        queryAST: queryASTSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { queryAST } = input;

      // Get all collections mapped to this logical schema
      const schemaMappings = await schemaMappingService.getMappingsForSchema(
        queryAST.logicalSchemaId
      );

      if (schemaMappings.length === 0) {
        throw new Error(`No collections mapped to schema: ${queryAST.logicalSchemaId}`);
      }

      // Generate queries for each mapped collection
      const queries = [];

      for (const schemaMapping of schemaMappings) {
        const collection = schemaMapping.collection;
        const integrationType = collection.integration.type;

        // Get the datasource SDK for the integration type
        const sdk = SDK_REGISTRY[integrationType as keyof typeof SDK_REGISTRY];
        if (!sdk) {
          console.warn(`No SDK found for integration type: ${integrationType}`);
          continue;
        }

        // Build field mapping object (logical field name -> physical field name)
        const fieldMappings: Record<string, string> = {};
        for (const mapping of schemaMapping.fieldMappings) {
          fieldMappings[mapping.logicalField.name] = mapping.physicalField.name;
        }

        // Convert QueryAST to datasource-specific query
        const datasourceQuery = sdk.convertQueryAST(queryAST, fieldMappings);

        queries.push({
          collectionId: collection.id,
          collectionName: collection.name,
          integrationType,
          query: datasourceQuery,
          fieldMappings,
        });
      }

      return {
        queries,
        totalCollections: queries.length,
      };
    }),
});

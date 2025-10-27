import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { integrationService, Prisma } from '@ddc/db';
import { validateIntegrationConfig, getIntegrationDefinition } from '../config/integrations';
import { discoverDatasourceSchema } from '../integrations/common';
import type { IntegrationType } from '../integrations/infra';

export const integrationsRouter = router({
  /**
   * List all integrations for the authenticated user
   */
  listUserIntegrations: protectedProcedure.query(async ({ ctx }) => {
    return integrationService.findByUserId(ctx.user.userId);
  }),

  /**
   * Get a specific integration by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const integration = await integrationService.findById(input.id);

      // Ensure user owns this integration
      if (integration && integration.userId !== ctx.user.userId) {
        throw new Error('Unauthorized');
      }

      return integration;
    }),

  /**
   * Create a new integration
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.string(),
        strategy: z.string(),
        configuration: z.any(), // Will be validated by integration config
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate configuration against integration schema
      const validatedConfig = validateIntegrationConfig(input.type, input.configuration);

      // Get integration definition to access onCreate hook
      const integrationDef = getIntegrationDefinition(input.type);

      // Create the integration in the database
      const integration = await integrationService.create({
        userId: ctx.user.userId,
        name: input.name,
        type: input.type,
        strategy: input.strategy,
        configuration: validatedConfig,
      });

      // Discover datasource schema (collections only, not fields yet)
      console.log('Starting datasource discovery for integration:', integration.id);
      const discoveryResult = await discoverDatasourceSchema(
        integration.id,
        input.type as IntegrationType,
        validatedConfig,
        {
          discoverFields: false, // Don't discover fields during creation (too slow)
        }
      );

      console.log('Discovery result:', discoveryResult);

      // TODO: Allow user to manually map logical schemas to collections

      return integration;
    }),

  /**
   * Update an integration
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        configuration: z.any().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const integration = await integrationService.findById(input.id);

      if (!integration) {
        throw new Error('Integration not found');
      }

      // Ensure user owns this integration
      if (integration.userId !== ctx.user.userId) {
        throw new Error('Unauthorized');
      }

      // Validate configuration if provided
      let validatedConfig: Prisma.InputJsonValue | undefined;
      if (input.configuration) {
        validatedConfig = validateIntegrationConfig(integration.type, input.configuration);
      }

      return integrationService.update(input.id, {
        name: input.name,
        configuration: validatedConfig,
        isActive: input.isActive,
      });
    }),

  /**
   * Delete an integration
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const integration = await integrationService.findById(input.id);

      if (!integration) {
        throw new Error('Integration not found');
      }

      // Ensure user owns this integration
      if (integration.userId !== ctx.user.userId) {
        throw new Error('Unauthorized');
      }

      return integrationService.delete(input.id);
    }),

  /**
   * Toggle integration active state
   */
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const integration = await integrationService.findById(input.id);

      if (!integration) {
        throw new Error('Integration not found');
      }

      // Ensure user owns this integration
      if (integration.userId !== ctx.user.userId) {
        throw new Error('Unauthorized');
      }

      return integrationService.toggleActive(input.id);
    }),

  /**
   * Discover fields for a specific collection
   */
  discoverCollectionFields: protectedProcedure
    .input(z.object({ collectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { prisma } = await import('@ddc/db');
      const { discoverAndSaveFields } = await import('../integrations/common');
      const { SDK_REGISTRY } = await import('../integrations/infra');

      // Fetch the collection with its integration
      const collection = await prisma.collection.findUnique({
        where: { id: input.collectionId },
        include: { integration: true },
      });

      if (!collection) {
        throw new Error('Collection not found');
      }

      // Ensure user owns this integration
      if (collection.integration.userId !== ctx.user.userId) {
        throw new Error('Unauthorized');
      }

      // Get the SDK for this integration type
      const sdk = SDK_REGISTRY[collection.integration.type as IntegrationType];
      if (!sdk) {
        throw new Error(`No SDK found for integration type: ${collection.integration.type}`);
      }

      // Discover and save fields
      return await discoverAndSaveFields(
        collection.id,
        collection.name,
        sdk,
        collection.integration.configuration as any
      );
    }),
});

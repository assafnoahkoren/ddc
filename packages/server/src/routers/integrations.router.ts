import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { integrationService, Prisma } from '@ddc/db';
import { validateIntegrationConfig } from '../config/integrations';

export const integrationsRouter = router({

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

      return integrationService.create({
        userId: ctx.user.userId,
        name: input.name,
        type: input.type,
        strategy: input.strategy,
        configuration: validatedConfig,
      });
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
});

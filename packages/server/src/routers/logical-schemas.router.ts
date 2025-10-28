import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { logicalSchemaService, FieldDataType } from '@ddc/db';

const logicalFieldSchema = z.object({
  name: z.string().min(1),
  dataType: z.nativeEnum(FieldDataType),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
});

export const logicalSchemasRouter = router({
  /**
   * List all logical schemas
   */
  list: protectedProcedure.query(async () => {
    return logicalSchemaService.getAll();
  }),

  /**
   * Get a specific logical schema by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const schema = await logicalSchemaService.findById(input.id);

      if (!schema) {
        throw new Error('Logical schema not found');
      }

      return schema;
    }),

  /**
   * Create a new logical schema with fields
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        version: z.string().optional(),
        metadata: z.any().optional(),
        fields: z.array(logicalFieldSchema),
      })
    )
    .mutation(async ({ input }) => {
      // Check if schema with same name already exists
      const existing = await logicalSchemaService.findByName(input.name);
      if (existing) {
        throw new Error(`Logical schema with name "${input.name}" already exists`);
      }

      return logicalSchemaService.create(input);
    }),

  /**
   * Update a logical schema
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        version: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      // If name is being updated, check it doesn't conflict
      if (data.name) {
        const existing = await logicalSchemaService.findByName(data.name);
        if (existing && existing.id !== id) {
          throw new Error(`Logical schema with name "${data.name}" already exists`);
        }
      }

      return logicalSchemaService.update(id, data);
    }),

  /**
   * Delete a logical schema
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return logicalSchemaService.delete(input.id);
    }),

  /**
   * Add field to logical schema
   */
  addField: protectedProcedure
    .input(
      z.object({
        schemaId: z.string(),
        field: logicalFieldSchema,
      })
    )
    .mutation(async ({ input }) => {
      return logicalSchemaService.addField(input.schemaId, input.field);
    }),

  /**
   * Update logical field
   */
  updateField: protectedProcedure
    .input(
      z.object({
        fieldId: z.string(),
        data: logicalFieldSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      return logicalSchemaService.updateField(input.fieldId, input.data);
    }),

  /**
   * Delete logical field
   */
  deleteField: protectedProcedure
    .input(z.object({ fieldId: z.string() }))
    .mutation(async ({ input }) => {
      return logicalSchemaService.deleteField(input.fieldId);
    }),
});

import { prisma } from './index';
import type { LogicalSchema, LogicalField, Prisma, FieldDataType } from '../_generated/client';

export class LogicalSchemaService {
  /**
   * Create a new logical schema with fields
   */
  async create(data: {
    name: string;
    description?: string;
    version?: string;
    metadata?: Prisma.InputJsonValue;
    fields: Array<{
      name: string;
      dataType: FieldDataType;
      description?: string;
      isRequired?: boolean;
    }>;
  }): Promise<LogicalSchema> {
    const { fields, ...schemaData } = data;

    return prisma.logicalSchema.create({
      data: {
        ...schemaData,
        logicalFields: {
          create: fields,
        },
      },
      include: {
        logicalFields: true,
      },
    });
  }

  /**
   * Get all logical schemas
   */
  async getAll(): Promise<LogicalSchema[]> {
    return prisma.logicalSchema.findMany({
      include: {
        logicalFields: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get logical schema by ID
   */
  async findById(id: string): Promise<(LogicalSchema & { logicalFields: LogicalField[] }) | null> {
    return prisma.logicalSchema.findUnique({
      where: { id },
      include: {
        logicalFields: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  /**
   * Get logical schema by name
   */
  async findByName(name: string): Promise<(LogicalSchema & { logicalFields: LogicalField[] }) | null> {
    return prisma.logicalSchema.findUnique({
      where: { name },
      include: {
        logicalFields: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  /**
   * Update logical schema
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      version?: string;
      metadata?: Prisma.InputJsonValue;
    }
  ): Promise<LogicalSchema> {
    return prisma.logicalSchema.update({
      where: { id },
      data,
      include: {
        logicalFields: true,
      },
    });
  }

  /**
   * Delete logical schema
   */
  async delete(id: string): Promise<LogicalSchema> {
    return prisma.logicalSchema.delete({
      where: { id },
    });
  }

  /**
   * Add field to logical schema
   */
  async addField(
    schemaId: string,
    field: {
      name: string;
      dataType: FieldDataType;
      description?: string;
      isRequired?: boolean;
    }
  ): Promise<LogicalField> {
    return prisma.logicalField.create({
      data: {
        ...field,
        schemaId,
      },
    });
  }

  /**
   * Update logical field
   */
  async updateField(
    fieldId: string,
    data: {
      name?: string;
      dataType?: FieldDataType;
      description?: string;
      isRequired?: boolean;
    }
  ): Promise<LogicalField> {
    return prisma.logicalField.update({
      where: { id: fieldId },
      data,
    });
  }

  /**
   * Delete logical field
   */
  async deleteField(fieldId: string): Promise<LogicalField> {
    return prisma.logicalField.delete({
      where: { id: fieldId },
    });
  }
}

// Export singleton instance
export const logicalSchemaService = new LogicalSchemaService();

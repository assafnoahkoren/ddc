import { prisma } from './index';
import type { Integration, Prisma } from '../_generated/client';

export class IntegrationService {
  /**
   * Create a new integration
   */
  async create(data: {
    userId: string;
    name: string;
    type: string;
    strategy: string;
    configuration: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
  }): Promise<Integration> {
    return prisma.integration.create({
      data,
    });
  }

  /**
   * Get all integrations
   */
  async getAll(): Promise<Integration[]> {
    return prisma.integration.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get integration by ID
   */
  async findById(id: string): Promise<Integration | null> {
    return prisma.integration.findUnique({
      where: { id },
    });
  }

  /**
   * Get all integrations for a user
   */
  async findByUserId(userId: string): Promise<Integration[]> {
    return prisma.integration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get active integrations for a user
   */
  async findActiveByUserId(userId: string): Promise<Integration[]> {
    return prisma.integration.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get integrations by type for a user
   */
  async findByUserIdAndType(userId: string, type: string): Promise<Integration[]> {
    return prisma.integration.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update integration
   */
  async update(
    id: string,
    data: {
      name?: string;
      configuration?: Prisma.InputJsonValue;
      metadata?: Prisma.InputJsonValue;
      isActive?: boolean;
    }
  ): Promise<Integration> {
    return prisma.integration.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete integration
   */
  async delete(id: string): Promise<Integration> {
    return prisma.integration.delete({
      where: { id },
    });
  }

  /**
   * Toggle integration active state
   */
  async toggleActive(id: string): Promise<Integration> {
    const integration = await this.findById(id);
    if (!integration) {
      throw new Error('Integration not found');
    }

    return this.update(id, {
      isActive: !integration.isActive,
    });
  }

  /**
   * Update integration metadata (e.g., last connection test result)
   */
  async updateMetadata(id: string, metadata: Prisma.InputJsonValue): Promise<Integration> {
    return this.update(id, { metadata });
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();

import { useState } from 'react';
import { DataSourceCard } from '../../components/data-sources/DataSourceCard';
import { IntegrationForm } from '../../components/integrations/IntegrationForm';
import type { IntegrationDefinition } from '@ddc/server/src/config/integration-types';
import { availableIntegrations } from '@ddc/server/src/config/integrations';
import { trpc } from '../../utils/trpc';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Type for integration configuration to avoid Prisma's deeply nested types
type IntegrationConfig = Record<string, string | number | boolean>;

export default function DataSourcesPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user integrations
  const { data: userIntegrations, isLoading, refetch } = trpc.integrations.listUserIntegrations.useQuery();

  // Create integration mutation
  // @ts-expect-error ...
  const createMutation = trpc.integrations.create.useMutation({
    onSuccess: () => {
      toast.success('Integration connected successfully!');
      refetch();
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(`Failed to connect: ${error.message}`);
    },
  });

  const handleConnect = (integration: IntegrationDefinition) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIntegration(null);
  };

  const handleSubmit = async (values: Record<string, string>) => {
    if (!selectedIntegration) return;

    // Extract name from values
    const { name, ...configuration } = values;

    createMutation.mutate({
      name,
      type: selectedIntegration.id,
      strategy: selectedIntegration.supportedStrategies[0], // Use first supported strategy
      configuration: configuration as IntegrationConfig,
    });
  };

  const integrations = Object.values(availableIntegrations);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Sources</h1>
        <p className="text-muted-foreground">Manage your data source connections</p>
      </div>

      {/* Existing Integrations */}
      {userIntegrations && userIntegrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Existing Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userIntegrations.map((integration) => {
              const integrationDef = availableIntegrations[integration.type];
              return (
                <DataSourceCard
                  key={integration.id}
                  dataSource={{
                    id: integrationDef.id,
                    name: integration.name,
                    icon: integrationDef.icon,
                    description: `Connected on ${new Date(integration.createdAt).toLocaleDateString()}`,
                    supportedStrategies: integrationDef.supportedStrategies,
                    configSchema: integrationDef.configSchema,
                  }}
                  onConnect={() => {
                    // TODO: Handle edit
                    console.log('Edit integration:', integration.id);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <DataSourceCard
              key={integration.id}
              dataSource={integration}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </div>

      {/* Integration Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connect to {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <IntegrationForm
              integration={selectedIntegration}
              mode="create"
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

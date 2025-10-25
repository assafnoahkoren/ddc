import { useState } from 'react';
import { DataSourceCard } from '../../components/data-sources/DataSourceCard';
import { IntegrationForm } from '../../components/integrations/IntegrationForm';
import type { IntegrationDefinition } from '@ddc/server/src/config/integration-types';
import { availableIntegrations } from '@ddc/server/src/config/integrations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function DataSourcesPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnect = (integration: IntegrationDefinition) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIntegration(null);
  };

  const handleSubmit = async (values: Record<string, string>) => {
    console.log('Submitting integration:', selectedIntegration?.id, values);
    // TODO: Call tRPC mutation to create integration
    handleCloseModal();
  };

  const integrations = Object.values(availableIntegrations);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Sources</h1>
        <p className="text-muted-foreground">Manage your data source connections</p>
      </div>

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

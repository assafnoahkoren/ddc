import { DataSourceCard } from '../../components/data-sources/DataSourceCard';
import type { DataSource } from '../../types/data-source';
import { availableIntegrations } from '@ddc/server/src/config/integrations';

export default function DataSourcesPage() {
  const handleConnect = (dataSource: DataSource) => {
    console.log('Connecting to:', dataSource);
    // TODO: Implement connection logic
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
          {integrations.map((integration) => {
            const dataSource: DataSource = {
              id: integration.id,
              name: integration.name,
              icon: integration.icon,
              integrationId: integration.id,
              description: integration.description,
            };
            return (
              <DataSourceCard
                key={integration.id}
                dataSource={dataSource}
                onConnect={handleConnect}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

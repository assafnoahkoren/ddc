import { DataSourceCard } from '../../components/data-sources/DataSourceCard';
import type { DataSource } from '../../types/data-source';
import { trpc } from '../../utils/trpc';
import { Loader2 } from 'lucide-react';

export default function DataSourcesPage() {
  const { data: integrations, isLoading } = trpc.integrations.list.useQuery();

  const handleConnect = (dataSource: DataSource) => {
    console.log('Connecting to:', dataSource);
    // TODO: Implement connection logic
  };

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

      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations?.map((integration) => {
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

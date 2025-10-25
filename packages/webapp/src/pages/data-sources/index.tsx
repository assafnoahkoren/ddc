import { DataSourceCard } from '../../components/data-sources/DataSourceCard';
import type { DataSource } from '../../types/data-source';
import { availableDataSources } from '../../components/data-sources/data/available-data-sources';

export default function DataSourcesPage() {
  const handleConnect = (dataSource: DataSource) => {
    console.log('Connecting to:', dataSource);
    // TODO: Implement connection logic
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Sources</h1>
        <p className="text-muted-foreground">Manage your data source connections</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDataSources.map((dataSource) => (
            <DataSourceCard
              key={dataSource.id}
              dataSource={dataSource}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

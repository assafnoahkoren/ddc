import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { IntegrationDefinition } from '@ddc/server/src/config/integration-types';
import { Plug } from 'lucide-react';

interface DataSourceCardProps {
  dataSource: IntegrationDefinition;
  onConnect?: (dataSource: IntegrationDefinition) => void;
}

export function DataSourceCard({ dataSource, onConnect }: DataSourceCardProps) {
  const handleConnect = () => {
    onConnect?.(dataSource);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-24 flex items-center justify-center">
              <img
                src={dataSource.icon}
                alt={`${dataSource.name} logo`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <CardTitle>{dataSource.name}</CardTitle>
              {dataSource.description && (
                <CardDescription>{dataSource.description}</CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={handleConnect} className="w-full">
          <Plug className="mr-2 h-4 w-4" />
          Connect
        </Button>
      </CardContent>
    </Card>
  );
}

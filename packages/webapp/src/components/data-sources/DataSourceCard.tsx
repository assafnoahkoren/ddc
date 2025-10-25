import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { IntegrationDefinition } from '@ddc/server/src/config/integration-types';
import { Plug, Unplug } from 'lucide-react';

interface DataSourceCardProps {
  dataSource: IntegrationDefinition;
  mode?: 'connect' | 'disconnect';
  onConnect?: (dataSource: IntegrationDefinition) => void;
  onDisconnect?: (dataSource: IntegrationDefinition) => void;
}

export function DataSourceCard({ dataSource, mode = 'connect', onConnect, onDisconnect }: DataSourceCardProps) {
  const handleAction = () => {
    if (mode === 'connect') {
      onConnect?.(dataSource);
    } else {
      onDisconnect?.(dataSource);
    }
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
        <Button
          onClick={handleAction}
          className="w-full"
          variant={mode === 'disconnect' ? 'destructive' : 'default'}
        >
          {mode === 'connect' ? (
            <>
              <Plug className="mr-2 h-4 w-4" />
              Connect
            </>
          ) : (
            <>
              <Unplug className="mr-2 h-4 w-4" />
              Disconnect
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

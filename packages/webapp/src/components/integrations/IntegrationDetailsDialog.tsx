import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntegrationForm } from './IntegrationForm';
import { IntegrationCollections } from './IntegrationCollections';
import type { IntegrationDefinition } from '@ddc/server/src/config/integration-types';
import { availableIntegrations } from '@ddc/server/src/config/integrations';
import { trpc } from '../../utils/trpc';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationDetailsDialogProps {
  integrationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntegrationDetailsDialog({
  integrationId,
  open,
  onOpenChange,
}: IntegrationDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('settings');

  // Fetch integration details
  const { data: integration, isLoading, refetch } = trpc.integrations.getById.useQuery(
    { id: integrationId },
    { enabled: open && !!integrationId }
  );

  // Update integration mutation
  // @ts-expect-error ...
  const updateMutation = trpc.integrations.update.useMutation({
    onSuccess: () => {
      toast.success('Integration updated successfully!');
      refetch();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  if (isLoading || !integration) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Get the integration definition from the config
  const integrationDefinition = availableIntegrations[integration.type];

  if (!integrationDefinition) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Integration type "{integration.type}" not found
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Prepare initial values from the database integration
  const initialValues: Record<string, string> = {
    name: integration.name,
    ...Object.entries(integration.configuration).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>),
  };

  const handleSubmit = async (values: Record<string, string>) => {
    // Extract name from values
    const { name, ...configuration } = values;

    updateMutation.mutate({
      id: integrationId,
      name,
      configuration: configuration as Record<string, string | number | boolean>,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{integration.name}</DialogTitle>
          <DialogDescription>
            Integration type: {integration.type}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-4">
            <IntegrationForm
              integration={integrationDefinition}
              mode="update"
              initialValues={initialValues}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="collections" className="mt-4">
            <IntegrationCollections integrationId={integrationId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { Loader2, ChevronDown, ChevronRight, Database, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface IntegrationCollectionsProps {
  integrationId: string;
}

export function IntegrationCollections({ integrationId }: IntegrationCollectionsProps) {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  // Fetch collections for this integration
  const { data: collections, isLoading } = trpc.integrations.listCollections.useQuery(
    { integrationId },
    { enabled: !!integrationId }
  );

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No collections found for this integration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Collections ({collections.length})</h3>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {collections.map((collection: any) => (
          <Collapsible
            key={collection.id}
            open={expandedCollections.has(collection.id)}
            onOpenChange={() => toggleCollection(collection.id)}
          >
            <div className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    {expandedCollections.has(collection.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{collection.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {collection.physicalFields?.length || 0} fields
                  </span>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3">
                {collection.physicalFields && collection.physicalFields.length > 0 ? (
                  <div className="ml-6 space-y-1">
                    {collection.physicalFields.map((field: any) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50"
                      >
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{field.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {field.dataType}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="ml-6 text-sm text-muted-foreground">
                    No fields discovered yet
                  </p>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

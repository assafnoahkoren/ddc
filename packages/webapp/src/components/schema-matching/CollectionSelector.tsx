import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IntegrationIcon, getIntegrationDisplayName } from '../integrations/IntegrationIcon';

interface CollectionSelectorProps {
  logicalSchemaId: string;
  onSelect: (collectionId: string) => void;
  onCancel: () => void;
}

export function CollectionSelector({
  logicalSchemaId,
  onSelect,
  onCancel,
}: CollectionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch all collections
  const { data: collections, isLoading } = trpc.integrations.listAllCollections.useQuery();

  // Fetch existing mappings to exclude already mapped collections
  const { data: existingMappings } = trpc.schemaMappings.getForSchema.useQuery({
    logicalSchemaId,
  });

  const mappedCollectionIds = new Set(
    existingMappings?.map((mapping: any) => mapping.collection.id) || []
  );

  // Filter collections
  const filteredCollections = collections
    ?.filter((collection: any) => !mappedCollectionIds.has(collection.id))
    .filter((collection: any) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleContinue = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Collections List */}
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {filteredCollections && filteredCollections.length > 0 ? (
          <div className="divide-y">
            {filteredCollections.map((collection: any) => (
              <div
                key={collection.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedId === collection.id
                    ? 'bg-primary/10 border-l-4 border-l-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedId(collection.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 px-2 rounded-lg bg-primary/10 flex items-center justify-center ">
                    <IntegrationIcon className='w-12' type={collection.integration?.type || 'unknown'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getIntegrationDisplayName(collection.integration?.type || 'unknown')} ·{' '}
                      {collection.integration?.name} · {collection.physicalFields?.length || 0}{' '}
                      fields
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No collections found matching your search'
                : 'No available collections to map'}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleContinue} disabled={!selectedId}>
          Continue
        </Button>
      </div>
    </div>
  );
}

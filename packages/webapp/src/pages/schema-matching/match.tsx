import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExistingMappingsList } from '../../components/schema-matching/ExistingMappingsList';
import { AddMappingDialog } from '../../components/schema-matching/AddMappingDialog';

export default function SchemaMatchingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);

  // Fetch logical schema
  const { data: schema, isLoading: isLoadingSchema } = trpc.logicalSchemas.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  // Fetch existing mappings
  const {
    data: mappings,
    isLoading: isLoadingMappings,
    refetch: refetchMappings,
  } = trpc.schemaMappings.getForSchema.useQuery(
    { logicalSchemaId: id! },
    { enabled: !!id }
  );

  // Delete mapping mutation
  // @ts-expect-error ...
  const deleteMutation = trpc.schemaMappings.delete.useMutation({
    onSuccess: () => {
      toast.success('Mapping deleted successfully');
      refetchMappings();
    },
    onError: (error) => {
      toast.error(`Failed to delete mapping: ${error.message}`);
    },
  });

  const handleDeleteMapping = (mappingId: string, collectionName: string) => {
    if (confirm(`Are you sure you want to delete the mapping to "${collectionName}"?`)) {
      deleteMutation.mutate({ id: mappingId });
    }
  };

  if (isLoadingSchema) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Schema not found</h2>
          <Button onClick={() => navigate('/logical-schemas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schemas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/logical-schemas')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schemas
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{schema.name}</h1>
            <p className="text-muted-foreground mt-2">
              Map logical fields to physical fields in collections
            </p>
          </div>
          <Button onClick={() => setIsAddMappingOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mapping
          </Button>
        </div>
      </div>

      {/* Logical Schema Fields Overview */}
      <div className="mb-8 p-6 border rounded-lg bg-muted/30">
        <h2 className="text-lg font-semibold mb-4">Logical Schema Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {schema.logicalFields?.map((field: any) => (
            <div
              key={field.id}
              className="flex items-center justify-between px-3 py-2 bg-background border rounded-md"
            >
              <span className="font-mono text-sm">{field.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{field.dataType}</span>
                {field.isRequired && <span className="text-xs text-red-500">*</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Mappings */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Collection Mappings</h2>
        {isLoadingMappings ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ExistingMappingsList
            mappings={mappings || []}
            onDelete={handleDeleteMapping}
            onEdit={(mappingId) => {
              // TODO: Implement edit functionality
              toast.info('Edit functionality coming soon');
            }}
          />
        )}
      </div>

      {/* Add Mapping Dialog */}
      <AddMappingDialog
        open={isAddMappingOpen}
        onOpenChange={setIsAddMappingOpen}
        logicalSchema={schema}
        onSuccess={() => {
          setIsAddMappingOpen(false);
          refetchMappings();
        }}
      />
    </div>
  );
}

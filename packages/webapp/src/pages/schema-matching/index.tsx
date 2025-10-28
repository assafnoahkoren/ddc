import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { Loader2, Plus, Database, Edit, Trash2, GitCompareArrows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateLogicalSchemaForm } from '../../components/schemas/CreateLogicalSchemaForm';
import { toast } from 'sonner';

export default function SchemaMatchingPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch logical schemas
  const { data: schemas, isLoading, refetch } = trpc.logicalSchemas.list.useQuery();

  // Delete mutation
  // @ts-expect-error ...
  const deleteMutation = trpc.logicalSchemas.delete.useMutation({
    onSuccess: () => {
      toast.success('Logical schema deleted successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the schema "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logical Schemas</h1>
          <p className="text-muted-foreground">
            Create logical schemas and map them to physical data sources
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Schema
        </Button>
      </div>

      {/* Logical Schemas List */}
      {schemas && schemas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemas.map((schema: any) => (
            <div
              key={schema.id}
              className="border rounded-lg p-6 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{schema.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      v{schema.version}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Edit schema"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title="Delete schema"
                    onClick={() => handleDelete(schema.id, schema.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {schema.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {schema.description}
                </p>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">
                  Fields ({schema.logicalFields?.length || 0})
                </p>
                {schema.logicalFields && schema.logicalFields.length > 0 ? (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {schema.logicalFields.map((field: any) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/50"
                      >
                        <span className="font-mono">{field.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {field.dataType}
                          </span>
                          {field.isRequired && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No fields defined</p>
                )}
              </div>

              {/* Match Button */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/logical-schemas/${schema.id}/match`)}
                >
                  <GitCompareArrows className="h-4 w-4 mr-2" />
                  Match to Collections
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No logical schemas yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first logical schema to start mapping data sources
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Schema
          </Button>
        </div>
      )}

      {/* Create Schema Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Logical Schema</DialogTitle>
            <DialogDescription>
              Define a logical schema with fields that can be mapped to physical data sources
            </DialogDescription>
          </DialogHeader>
          <CreateLogicalSchemaForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
              refetch();
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

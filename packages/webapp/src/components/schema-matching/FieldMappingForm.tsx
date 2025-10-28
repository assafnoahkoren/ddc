import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SearchableFieldSelect } from './SearchableFieldSelect';

interface LogicalField {
  id: string;
  name: string;
  dataType: string;
  isRequired: boolean;
}

interface LogicalSchema {
  id: string;
  name: string;
  logicalFields: LogicalField[];
}

interface FieldMapping {
  logicalFieldId: string;
  physicalFieldId: string | null;
}

interface FieldMappingFormProps {
  logicalSchema: LogicalSchema;
  collectionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FieldMappingForm({
  logicalSchema,
  collectionId,
  onSuccess,
  onCancel,
}: FieldMappingFormProps) {
  // Initialize field mappings for all logical fields
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(
    logicalSchema.logicalFields.map((field) => ({
      logicalFieldId: field.id,
      physicalFieldId: null,
    }))
  );

  // Fetch collection details with physical fields
  const { data: collections, isLoading } = trpc.integrations.listAllCollections.useQuery();
  const collection = collections?.find((c: any) => c.id === collectionId);

  // Create mapping mutation
  // @ts-expect-error ...
  const createMutation = trpc.schemaMappings.create.useMutation({
    onSuccess: () => {
      toast.success('Mapping created successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to create mapping: ${error.message}`);
    },
  });

  const handleFieldMappingChange = (logicalFieldId: string, physicalFieldId: string | null) => {
    setFieldMappings((prev) =>
      prev.map((mapping) =>
        mapping.logicalFieldId === logicalFieldId
          ? { ...mapping, physicalFieldId }
          : mapping
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields are mapped
    const requiredFields = logicalSchema.logicalFields.filter((f) => f.isRequired);
    const unmappedRequired = requiredFields.filter((field) => {
      const mapping = fieldMappings.find((m) => m.logicalFieldId === field.id);
      return !mapping?.physicalFieldId;
    });

    if (unmappedRequired.length > 0) {
      toast.error(
        `Please map all required fields: ${unmappedRequired.map((f) => f.name).join(', ')}`
      );
      return;
    }

    // Filter out unmapped optional fields
    const validMappings = fieldMappings.filter((m) => m.physicalFieldId);

    if (validMappings.length === 0) {
      toast.error('Please map at least one field');
      return;
    }

    createMutation.mutate({
      logicalSchemaId: logicalSchema.id,
      collectionId,
      fieldMappings: validMappings.map((m) => ({
        logicalFieldId: m.logicalFieldId,
        physicalFieldId: m.physicalFieldId!,
      })),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return <div className="text-center py-12">Collection not found</div>;
  }

  const physicalFields = collection.physicalFields || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Collection Info */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold mb-1">{collection.name}</h3>
        <p className="text-sm text-muted-foreground">
          {collection.integration?.name} · {physicalFields.length} physical fields
        </p>
      </div>

      {/* Field Mappings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Field Mappings</Label>
          <p className="text-sm text-muted-foreground">
            {fieldMappings.filter((m) => m.physicalFieldId).length} /{' '}
            {logicalSchema.logicalFields.length} mapped
          </p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
          {logicalSchema.logicalFields.map((logicalField) => {
            const mapping = fieldMappings.find((m) => m.logicalFieldId === logicalField.id);

            return (
              <div key={logicalField.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-4">
                  {/* Logical Field */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="font-mono text-sm">{logicalField.name}</Label>
                      {logicalField.isRequired && (
                        <span className="text-xs text-red-500">* Required</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{logicalField.dataType}</p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                  {/* Physical Field Select */}
                  <div className="flex-1">
                    <SearchableFieldSelect
                      fields={physicalFields}
                      value={mapping?.physicalFieldId || null}
                      onChange={(value) => handleFieldMappingChange(logicalField.id, value)}
                      placeholder="Select physical field..."
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={createMutation.isPending}>
          Back
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Mapping'
          )}
        </Button>
      </div>
    </form>
  );
}

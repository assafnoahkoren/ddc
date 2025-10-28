import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CollectionSelector } from './CollectionSelector';
import { FieldMappingForm } from './FieldMappingForm';

interface LogicalSchema {
  id: string;
  name: string;
  logicalFields: Array<{
    id: string;
    name: string;
    dataType: string;
    isRequired: boolean;
  }>;
}

interface AddMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logicalSchema: LogicalSchema;
  onSuccess: () => void;
}

export function AddMappingDialog({
  open,
  onOpenChange,
  logicalSchema,
  onSuccess,
}: AddMappingDialogProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const handleCancel = () => {
    setSelectedCollectionId(null);
    onOpenChange(false);
  };

  const handleSuccess = () => {
    setSelectedCollectionId(null);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Collection Mapping</DialogTitle>
          <DialogDescription>
            {selectedCollectionId
              ? 'Map logical fields to physical fields in the collection'
              : 'Select a collection to map to this logical schema'}
          </DialogDescription>
        </DialogHeader>

        {!selectedCollectionId ? (
          <CollectionSelector
            logicalSchemaId={logicalSchema.id}
            onSelect={setSelectedCollectionId}
            onCancel={handleCancel}
          />
        ) : (
          <FieldMappingForm
            logicalSchema={logicalSchema}
            collectionId={selectedCollectionId}
            onSuccess={handleSuccess}
            onCancel={() => setSelectedCollectionId(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

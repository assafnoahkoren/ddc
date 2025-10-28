import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '../../utils/trpc';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface LogicalField {
  name: string;
  dataType: 'STRING';
  isRequired: boolean;
}

interface CreateLogicalSchemaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateLogicalSchemaForm({
  onSuccess,
  onCancel,
}: CreateLogicalSchemaFormProps) {
  const [name, setName] = useState('');
  const [fields, setFields] = useState<LogicalField[]>([
    { name: '', dataType: 'STRING', isRequired: false },
  ]);

  // @ts-expect-error ...
  const createMutation = trpc.logicalSchemas.create.useMutation({
    onSuccess: () => {
      toast.success('Logical schema created successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to create schema: ${error.message}`);
    },
  });

  const handleAddField = () => {
    setFields([
      ...fields,
      { name: '', dataType: 'STRING', isRequired: false },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (
    index: number,
    key: keyof LogicalField,
    value: string | boolean
  ) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Schema name is required');
      return;
    }

    if (fields.length === 0) {
      toast.error('At least one field is required');
      return;
    }

    // Validate all fields have names
    const invalidFields = fields.filter((f) => !f.name.trim());
    if (invalidFields.length > 0) {
      toast.error('All fields must have a name');
      return;
    }

    // Check for duplicate field names
    const fieldNames = fields.map((f) => f.name.trim().toLowerCase());
    const duplicates = fieldNames.filter(
      (name, index) => fieldNames.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      toast.error('Field names must be unique');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      fields: fields.map((f) => ({
        name: f.name.trim(),
        dataType: f.dataType,
        isRequired: f.isRequired,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Schema Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Schema Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., ProcessCreation, NetworkConnection"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Fields Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">
            Fields <span className="text-red-500">*</span>
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddField}>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
          {fields.map((field, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`field-name-${index}`} className="text-sm">
                      Field Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`field-name-${index}`}
                      placeholder="e.g., process_name, user"
                      value={field.name}
                      onChange={(e) =>
                        handleFieldChange(index, 'name', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`field-type-${index}`} className="text-sm">
                      Data Type
                    </Label>
                    <select
                      id={`field-type-${index}`}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={field.dataType}
                      onChange={(e) =>
                        handleFieldChange(index, 'dataType', e.target.value as 'STRING')
                      }
                    >
                      <option value="STRING">String</option>
                    </select>
                  </div>
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive mt-7"
                    onClick={() => handleRemoveField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`field-required-${index}`}
                  checked={field.isRequired}
                  onChange={(e) =>
                    handleFieldChange(index, 'isRequired', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor={`field-required-${index}`} className="text-sm">
                  Required field
                </Label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={createMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create Schema'}
        </Button>
      </div>
    </form>
  );
}

import { Database, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface FieldMapping {
  id: string;
  logicalField: {
    id: string;
    name: string;
    dataType: string;
    isRequired: boolean;
  };
  physicalField: {
    id: string;
    name: string;
    dataType: string;
  };
  transformation?: string | null;
  confidence?: number | null;
}

interface CollectionMapping {
  id: string;
  collection: {
    id: string;
    name: string;
    integration: {
      id: string;
      name: string;
    };
    physicalFields: Array<{
      id: string;
      name: string;
      dataType: string;
    }>;
  };
  fieldMappings: FieldMapping[];
  createdAt: string;
  updatedAt: string;
}

interface ExistingMappingsListProps {
  mappings: CollectionMapping[];
  onDelete: (mappingId: string, collectionName: string) => void;
  onEdit: (mappingId: string) => void;
}

export function ExistingMappingsList({ mappings, onDelete, onEdit }: ExistingMappingsListProps) {
  const [expandedMappings, setExpandedMappings] = useState<Set<string>>(new Set());

  const toggleExpanded = (mappingId: string) => {
    const newExpanded = new Set(expandedMappings);
    if (newExpanded.has(mappingId)) {
      newExpanded.delete(mappingId);
    } else {
      newExpanded.add(mappingId);
    }
    setExpandedMappings(newExpanded);
  };

  if (mappings.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No mappings yet</h3>
        <p className="text-muted-foreground">
          Click "Add Mapping" to map this logical schema to a collection
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mappings.map((mapping) => {
        const isExpanded = expandedMappings.has(mapping.id);
        const totalFields = mapping.fieldMappings.length;

        return (
          <div key={mapping.id} className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{mapping.collection.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {mapping.collection.integration.name} · {totalFields} field
                    {totalFields !== 1 ? 's' : ''} mapped
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleExpanded(mapping.id)}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(mapping.id)}
                  title="Edit mapping"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(mapping.id, mapping.collection.name)}
                  title="Delete mapping"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Expanded Field Mappings */}
            {isExpanded && (
              <div className="p-4 space-y-2">
                {mapping.fieldMappings.length > 0 ? (
                  <div className="space-y-2">
                    {mapping.fieldMappings.map((fieldMapping) => (
                      <div
                        key={fieldMapping.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-md"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">
                                {fieldMapping.logicalField.name}
                              </span>
                              {fieldMapping.logicalField.isRequired && (
                                <span className="text-xs text-red-500">*</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {fieldMapping.logicalField.dataType}
                            </span>
                          </div>

                          <div className="text-muted-foreground">→</div>

                          <div className="flex-1">
                            <div className="font-mono text-sm">
                              {fieldMapping.physicalField.name}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {fieldMapping.physicalField.dataType}
                            </span>
                          </div>
                        </div>

                        {fieldMapping.confidence !== null && fieldMapping.confidence !== undefined && (
                          <div className="ml-4">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {Math.round(fieldMapping.confidence * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No field mappings defined
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

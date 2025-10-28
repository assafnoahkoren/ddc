import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { Loader2, Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterRow } from '@/components/query-builder/FilterRow';
import type { QueryAST } from '@ddc/server/src/types/query-ast';
import { LogicalOperator } from '@ddc/server/src/types/query-ast';

interface FilterRowData {
  id: number;
  field: string;
  operator: string;
  value: string;
}

export default function QueryDataPage() {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('');
  const [filters, setFilters] = useState<FilterRowData[]>([
    { id: 1, field: '', operator: 'eq', value: '' },
    { id: 2, field: '', operator: 'eq', value: '' },
  ]);
  const [limit, setLimit] = useState<number>(100);
  const [generatedQueries, setGeneratedQueries] = useState<any[]>([]);

  const { data: schemas, isLoading: schemasLoading } = trpc.logicalSchemas.list.useQuery();
  const { data: selectedSchema } = trpc.logicalSchemas.getById.useQuery(
    { id: selectedSchemaId },
    { enabled: !!selectedSchemaId }
  );

  const fields = selectedSchema?.logicalFields || [];

  const updateFilter = (id: number, field: keyof FilterRowData, value: string) => {
    setFilters(filters.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const addFilter = () => {
    const newId = Math.max(...filters.map(f => f.id), 0) + 1;
    setFilters([...filters, { id: newId, field: '', operator: 'eq', value: '' }]);
  };

  const convertQueryMutation = trpc.query.convertToQuery.useMutation();

  const executeQuery = async () => {
    const activeFilters = filters.filter(f => f.field && f.value);
    const query: Partial<QueryAST> = {
      logicalSchemaId: selectedSchemaId,
      limit,
    };

    if (activeFilters.length > 0) {
      if (activeFilters.length === 1) {
        query.where = {
          type: 'comparison',
          field: activeFilters[0].field,
          operator: activeFilters[0].operator as any,
          value: activeFilters[0].value,
        };
      } else {
        query.where = {
          type: 'logical',
          operator: LogicalOperator.AND,
          conditions: activeFilters.map(f => ({
            type: 'comparison' as const,
            field: f.field,
            operator: f.operator as any,
            value: f.value,
          })),
        };
      }
    }

    console.log('Executing query:', query);

    try {
      const result = await convertQueryMutation.mutateAsync({
        queryAST: query as QueryAST,
      });

      setGeneratedQueries(result.queries);
    } catch (error) {
      console.error('Failed to convert query:', error);
    }
  };

  if (schemasLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Query Data</h1>
        <p className="text-muted-foreground">Build and execute queries against your logical schemas</p>
      </div>

      <div className="space-y-4 max-w-5xl">
        {/* Schema Selection Row */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium w-24">Schema</label>
          <select
            className="flex-1 h-10 px-3 border rounded-md bg-background"
            value={selectedSchemaId}
            onChange={(e) => setSelectedSchemaId(e.target.value)}
          >
            <option value="">Select a logical schema...</option>
            {schemas?.map((schema: any) => (
              <option key={schema.id} value={schema.id}>
                {schema.name} ({schema.logicalFields?.length || 0} fields)
              </option>
            ))}
          </select>
        </div>

        {/* Filter Rows */}
        {selectedSchemaId && (
          <>
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Filters</h3>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filter
                </Button>
              </div>

              <div className="space-y-3">
                {filters.map((filter, index) => {
                  const isActive = index === 0 || filters[index - 1].field !== '';

                  return (
                    <FilterRow
                      key={filter.id}
                      label={index === 0 ? 'Where' : 'And'}
                      field={filter.field}
                      operator={filter.operator}
                      value={filter.value}
                      fields={fields}
                      isActive={isActive}
                      onFieldChange={(value) => updateFilter(filter.id, 'field', value)}
                      onOperatorChange={(value) => updateFilter(filter.id, 'operator', value)}
                      onValueChange={(value) => updateFilter(filter.id, 'value', value)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Limit */}
            <div className="flex items-center gap-4 border-t pt-4">
              <label className="text-sm font-medium w-24">Limit</label>
              <Input
                type="number"
                className="w-32"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
                min={1}
                max={10000}
              />
            </div>

            {/* Execute Button */}
            <div className="flex justify-end border-t pt-4">
              <Button
                size="lg"
                onClick={executeQuery}
                disabled={!selectedSchemaId || convertQueryMutation.isLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                {convertQueryMutation.isLoading ? 'Generating...' : 'Execute Query'}
              </Button>
            </div>

            {/* Generated Queries Display */}
            {generatedQueries.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-3">Generated Queries ({generatedQueries.length} collections)</h3>
                <div className="space-y-4">
                  {generatedQueries.map((queryResult: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{queryResult.collectionName}</h4>
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                          {queryResult.integrationType}
                        </span>
                      </div>
                      <div className="bg-muted p-3 rounded font-mono text-xs overflow-x-auto">
                        {queryResult.query}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhysicalField {
  id: string;
  name: string;
  dataType: string;
}

interface SearchableFieldSelectProps {
  fields: PhysicalField[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export function SearchableFieldSelect({
  fields,
  value,
  onChange,
  placeholder = 'Select field...',
}: SearchableFieldSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedField = fields.find((f) => f.id === value);

  // Filter fields based on search
  const filteredFields = fields.filter((field) =>
    field.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (fieldId: string) => {
    onChange(fieldId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedField ? (
          <span className="flex items-center justify-between w-full">
            <span className="font-mono text-sm truncate">{selectedField.name}</span>
            <X
              className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
          {/* Search Input */}
          <div className="p-2">
            <Input
              placeholder="Search fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredFields.length > 0 ? (
              filteredFields.map((field) => (
                <div
                  key={field.id}
                  className={cn(
                    'px-3 py-2 cursor-pointer hover:bg-accent transition-colors',
                    value === field.id && 'bg-accent'
                  )}
                  onClick={() => handleSelect(field.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm truncate">{field.name}</div>
                      <div className="text-xs text-muted-foreground">{field.dataType}</div>
                    </div>
                    {value === field.id && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No fields found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

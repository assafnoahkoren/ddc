import { Input } from '@/components/ui/input';

interface FilterRowProps {
  label: string;
  field: string;
  operator: string;
  value: string;
  fields: Array<{ id: string; name: string }>;
  isActive: boolean;
  onFieldChange: (value: string) => void;
  onOperatorChange: (value: string) => void;
  onValueChange: (value: string) => void;
}

export function FilterRow({
  label,
  field,
  operator,
  value,
  fields,
  isActive,
  onFieldChange,
  onOperatorChange,
  onValueChange,
}: FilterRowProps) {
  return (
    <div
      className={`flex items-center gap-3 transition-opacity ${
        isActive ? 'opacity-100' : 'opacity-40'
      }`}
    >
      <div className="text-sm font-medium w-24">{label}</div>

      {/* Field Dropdown */}
      <select
        className="flex-1 h-10 px-3 border rounded-md bg-background"
        value={field}
        onChange={(e) => onFieldChange(e.target.value)}
        disabled={!isActive}
      >
        <option value="">Select field...</option>
        {fields.map((f) => (
          <option key={f.id} value={f.name}>
            {f.name}
          </option>
        ))}
      </select>

      {/* Operator Dropdown */}
      <select
        className="w-40 h-10 px-3 border rounded-md bg-background"
        value={operator}
        onChange={(e) => onOperatorChange(e.target.value)}
        disabled={!isActive}
      >
        <option value="eq">Equals</option>
        <option value="contains">Contains</option>
        <option value="gt">Greater Than</option>
        <option value="lt">Less Than</option>
      </select>

      {/* Value Input */}
      <Input
        className="flex-1"
        placeholder="Value..."
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={!isActive}
      />
    </div>
  );
}

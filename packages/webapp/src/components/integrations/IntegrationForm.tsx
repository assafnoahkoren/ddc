import { useState } from 'react';
import type { IntegrationDefinition } from '@ddc/server/src/config/integration-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IntegrationFormProps {
  integration: IntegrationDefinition;
  mode: 'create' | 'update';
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
  onCancel: () => void;
}

export function IntegrationForm({
  integration,
  mode,
  initialValues = {},
  onSubmit,
  onCancel,
}: IntegrationFormProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (fieldName: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate name field
    const nameField = integration.configSchema.name;
    if (nameField.required !== false && !values[nameField.name]?.trim()) {
      newErrors[nameField.name] = `${nameField.name} is required`;
    }

    // Validate other fields
    integration.configSchema.fields.forEach((field) => {
      if (field.required !== false && !values[field.name]?.trim()) {
        newErrors[field.name] = `${field.name} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputType = (fieldType: string) => {
    switch (fieldType) {
      case 'password':
        return 'password';
      case 'email':
        return 'email';
      case 'url':
        return 'url';
      default:
        return 'text';
    }
  };

  const nameField = integration.configSchema.name;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Name field */}
        <div className="space-y-2">
          <Label htmlFor={nameField.name}>
            {nameField.name}
            {nameField.required !== false && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={nameField.name}
            type={getInputType(nameField.type)}
            value={values[nameField.name] || ''}
            onChange={(e) => handleChange(nameField.name, e.target.value)}
            className={errors[nameField.name] ? 'border-red-500' : ''}
          />
          {nameField.description && (
            <p className="text-sm text-muted-foreground">{nameField.description}</p>
          )}
          {errors[nameField.name] && (
            <p className="text-sm text-red-500">{errors[nameField.name]}</p>
          )}
        </div>

        {/* Other configuration fields */}
        {integration.configSchema.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.name}
              {field.required !== false && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={getInputType(field.type)}
              value={values[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={errors[field.name] ? 'border-red-500' : ''}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {errors[field.name] && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Connect' : 'Update'}
        </Button>
      </div>
    </form>
  );
}

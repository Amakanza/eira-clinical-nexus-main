
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormSection } from '@/types/templates';

interface TemplateFormBuilderProps {
  sections: FormSection[];
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
}

export const TemplateFormBuilder = ({ sections, formData, onFieldChange }: TemplateFormBuilderProps) => {
  const renderField = (field: FormField) => {
    const value = formData[field.id] || field.defaultValue || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
          />
        );

      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => onFieldChange(field.id, e.target.value ? parseFloat(e.target.value) : '')}
              placeholder={field.placeholder}
              required={field.required}
              min={field.min}
              max={field.max}
              className="flex-1"
            />
            {field.unit && (
              <span className="text-sm text-gray-500 min-w-fit">{field.unit}</span>
            )}
          </div>
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(newValue) => onFieldChange(field.id, newValue)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value}
              onCheckedChange={(checked) => onFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="text-sm font-normal">
              {field.label}
            </Label>
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              id={field.id}
              type="range"
              value={value}
              onChange={(e) => onFieldChange(field.id, parseFloat(e.target.value))}
              min={field.min || 0}
              max={field.max || 100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{field.min || 0}</span>
              <span className="font-medium">{value}</span>
              <span>{field.max || 100}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.id} className={field.type === 'checkbox' ? 'md:col-span-2' : ''}>
                  {field.type !== 'checkbox' && (
                    <Label htmlFor={field.id} className="block text-sm font-medium mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

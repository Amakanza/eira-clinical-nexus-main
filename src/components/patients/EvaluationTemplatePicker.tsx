import React from 'react';
import { z } from 'zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const evaluationTemplateSchema = z.object({
  domain: z.enum(['musculoskeletal', 'respiratory', 'neurological']),
  templateName: z.string().optional(),
  measurements: z.record(z.object({
    min: z.number(),
    max: z.number(),
    unit: z.string()
  })).optional(),
  assessmentScales: z.array(z.string()).optional()
});

type EvaluationTemplate = z.infer<typeof evaluationTemplateSchema>;

interface EvaluationTemplatePickerProps {
  onSelectTemplate: (template: EvaluationTemplate) => void;
  onCustomize: (template: EvaluationTemplate) => void;
}

const defaultTemplates: Record<string, EvaluationTemplate> = {
  musculoskeletal: {
    domain: 'musculoskeletal',
    templateName: 'Default Musculoskeletal',
    measurements: {
      rangeOfMotion: { min: 0, max: 180, unit: 'degrees' },
      painScale: { min: 0, max: 10, unit: 'VAS' }
    },
    assessmentScales: ['Berg Balance Scale', 'TUG Test']
  },
  respiratory: {
    domain: 'respiratory',
    templateName: 'Default Respiratory',
    measurements: {
      peakFlow: { min: 0, max: 800, unit: 'L/min' },
      oxygenSaturation: { min: 0, max: 100, unit: '%' }
    },
    assessmentScales: ['Borg Scale', '6MWT']
  },
  neurological: {
    domain: 'neurological',
    templateName: 'Default Neurological',
    measurements: {
      muscleStrength: { min: 0, max: 5, unit: 'MRC Scale' },
      sensation: { min: 0, max: 2, unit: 'grade' }
    },
    assessmentScales: ['Fugl-Meyer', 'NIH Stroke Scale']
  }
};

export const EvaluationTemplatePicker: React.FC<EvaluationTemplatePickerProps> = ({ 
  onSelectTemplate, 
  onCustomize 
}) => {
  const [selectedDomain, setSelectedDomain] = React.useState<string>('');

  return (
    <div className="space-y-4">
      <FormField
        name="domain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Evaluation Domain</FormLabel>
            <Select onValueChange={(value) => {
              field.onChange(value);
              setSelectedDomain(value);
            }} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select evaluation domain" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="musculoskeletal">Musculoskeletal</SelectItem>
                <SelectItem value="respiratory">Respiratory</SelectItem>
                <SelectItem value="neurological">Neurological</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedDomain && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSelectTemplate(defaultTemplates[selectedDomain])}
          >
            Use Default {selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)} Template
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onCustomize(defaultTemplates[selectedDomain])}
          >
            Customize Template
          </Button>
        </div>
      )}
    </div>
  );
};

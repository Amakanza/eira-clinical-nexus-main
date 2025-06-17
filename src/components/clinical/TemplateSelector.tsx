
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Activity, Brain, Stethoscope } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (type: 'initial-evaluation' | 'progress-note', specialty: 'msk' | 'respiratory' | 'neuro' | 'general') => void;
  onCancel: () => void;
}

export const TemplateSelector = ({ onSelectTemplate, onCancel }: TemplateSelectorProps) => {
  const evaluationTemplates = [
    {
      specialty: 'msk' as const,
      name: 'Musculoskeletal',
      description: 'For orthopedic, sports injuries, and movement disorders',
      icon: Activity,
      color: 'bg-blue-500'
    },
    {
      specialty: 'respiratory' as const,
      name: 'Respiratory',
      description: 'For pulmonary conditions and breathing disorders',
      icon: Stethoscope,
      color: 'bg-green-500'
    },
    {
      specialty: 'neuro' as const,
      name: 'Neurological',
      description: 'For neurological conditions and brain injuries',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      specialty: 'general' as const,
      name: 'General',
      description: 'For general physiotherapy assessments',
      icon: FileText,
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Select Clinical Note Type</h2>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Initial Evaluation</span>
              <Badge variant="secondary">New Patient Assessment</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Comprehensive initial assessment for new patients or new conditions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluationTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <Button
                    key={template.specialty}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2 p-4"
                    onClick={() => onSelectTemplate('initial-evaluation', template.specialty)}
                  >
                    <div className={`w-8 h-8 rounded-full ${template.color} flex items-center justify-center`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Progress Note</span>
              <Badge variant="secondary">Follow-up Visit</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Standard SOAP note for follow-up visits and ongoing treatment
            </p>
            <Button
              variant="outline"
              className="w-full h-16 flex items-center justify-center space-x-3"
              onClick={() => onSelectTemplate('progress-note', 'general')}
            >
              <FileText className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">SOAP Progress Note</div>
                <div className="text-sm text-gray-500">Subjective, Objective, Assessment, Plan</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

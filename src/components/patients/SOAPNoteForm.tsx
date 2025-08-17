import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from 'use-debounce';
import DescriptionIcon from '@mui/icons-material/Description';

export const soapSchema = z.object({
  subjective: z.string().min(1, 'Required when finalizing'),
  objective: z.string().min(1, 'Required when finalizing'),
  action: z.string().min(1, 'Required when finalizing'),
  plan: z.string().min(1, 'Required when finalizing'),
  status: z.enum(['draft', 'finalized'])
});

type SOAPFormData = z.infer<typeof soapSchema>;

interface SOAPNoteFormProps {
  patientId: string;
  initialData?: Partial<SOAPFormData>;
  onSave: (data: SOAPFormData) => Promise<void>;
  onFinalize: (data: SOAPFormData) => Promise<void>;
}

export const SOAPNoteForm: React.FC<SOAPNoteFormProps> = ({ 
  patientId, 
  initialData, 
  onSave, 
  onFinalize 
}) => {
  const form = useForm<SOAPFormData>({
    resolver: zodResolver(soapSchema),
    defaultValues: {
      status: 'draft',
      ...initialData
    }
  });

  const [isDirty, setIsDirty] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [previewContent, setPreviewContent] = React.useState(null);
  const [showPreview, setShowPreview] = React.useState(false);

  const debouncedSave = useDebouncedCallback(async (data: SOAPFormData) => {
    if (isDirty && data.status === 'draft') {
      setIsSaving(true);
      await onSave(data);
      setIsSaving(false);
      setIsDirty(false);
    }
  }, 30000); // 30 second debounce

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && name !== 'status') {
        setIsDirty(true);
        debouncedSave(form.getValues());
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleGenerateReport = async () => {
    try {
      const reportData = {
        patient: {
          firstName: 'John', // TODO: Replace with actual patient data
          lastName: 'Doe',
          dob: '01/01/1970',
          insuranceProvider: 'Medical Aid'
        },
        soapData: form.getValues(),
        therapist: {
          displayName: 'Dr. Smith' // TODO: Replace with actual therapist data
        }
      };
      
      // TODO: Implement report generation and preview logic
      console.log('Generating report with data:', reportData);
      setPreviewContent(reportData);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleFinalize = async (data: SOAPFormData) => {
    try {
      setIsSaving(true);
      const validated = soapSchema.parse(data);
      await onFinalize({ ...validated, status: 'finalized' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleFinalize)} 
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <Badge variant={form.watch('status') === 'draft' ? 'secondary' : 'default'}>
            {form.watch('status') === 'draft' ? 'Draft' : 'Finalized'}
          </Badge>
          {isSaving && <span className="text-sm text-muted-foreground">Saving...</span>}
        </div>

        <FormField
          control={form.control}
          name="subjective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subjective</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Patient's reported symptoms and concerns" 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="objective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objective</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Clinical findings and measurements" 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Treatments and interventions performed" 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Follow-up and future treatment plan" 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={form.handleSubmit((data) => onSave(data))}
            disabled={!isDirty}
          >
            Save Draft
          </Button>
          <Button 
            type="button"
            variant="outline"
            onClick={handleGenerateReport}
            className="flex items-center gap-2"
          >
            <DescriptionIcon fontSize="small" />
            Generate Report
          </Button>
          <Button 
            type="submit"
            disabled={isSaving}
          >
            Finalize Note
          </Button>
        </div>
      </form>
    </Form>
  );
};

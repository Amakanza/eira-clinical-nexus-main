import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientFormData, SupabasePatient } from '@/hooks/useSupabasePatients';

const patientSchema = z.object({
  patient_name: z.string().min(1, 'Patient name is required'),
  case_number: z.string().optional(),
  occupation: z.string().optional(),
  date_of_birth: z.string().optional(),
  referring_dr: z.string().optional(),
  date_of_initial_ax: z.string().optional(),
  case_manager: z.string().optional(),
  facility: z.string().optional(),
  physiotherapist: z.string().optional(),
  diagnosis: z.string().optional(),
  medical_aid: z.string().optional(),
  medical_aid_number: z.string().optional(),
  home_address: z.string().optional(),
});

interface SimplePatientFormProps {
  patient?: SupabasePatient;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SimplePatientForm = ({ patient, onSubmit, onCancel, isLoading }: SimplePatientFormProps) => {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      patient_name: patient?.patient_name || '',
      case_number: patient?.case_number || '',
      occupation: patient?.occupation || '',
      date_of_birth: patient?.date_of_birth || '',
      referring_dr: patient?.referring_dr || '',
      date_of_initial_ax: patient?.date_of_initial_ax || '',
      case_manager: patient?.case_manager || '',
      facility: patient?.facility || '',
      physiotherapist: patient?.physiotherapist || '',
      diagnosis: patient?.diagnosis || '',
      medical_aid: patient?.medical_aid || '',
      medical_aid_number: patient?.medical_aid_number || '',
      home_address: patient?.home_address || '',
    },
  });

  const handleSubmit = (data: PatientFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{patient ? 'Edit Patient' : 'Add New Patient'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_name">Patient Name *</Label>
              <Input
                id="patient_name"
                {...form.register('patient_name')}
                placeholder="Enter patient name"
              />
              {form.formState.errors.patient_name && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.patient_name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="case_number">Case Number</Label>
              <Input
                id="case_number"
                {...form.register('case_number')}
                placeholder="Enter case number"
              />
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...form.register('date_of_birth')}
              />
            </div>

            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                {...form.register('occupation')}
                placeholder="Enter occupation"
              />
            </div>

            <div>
              <Label htmlFor="referring_dr">Referring Doctor</Label>
              <Input
                id="referring_dr"
                {...form.register('referring_dr')}
                placeholder="Enter referring doctor"
              />
            </div>

            <div>
              <Label htmlFor="physiotherapist">Physiotherapist</Label>
              <Input
                id="physiotherapist"
                {...form.register('physiotherapist')}
                placeholder="Enter physiotherapist"
              />
            </div>

            <div>
              <Label htmlFor="medical_aid">Medical Aid</Label>
              <Input
                id="medical_aid"
                {...form.register('medical_aid')}
                placeholder="Enter medical aid"
              />
            </div>

            <div>
              <Label htmlFor="medical_aid_number">Medical Aid Number</Label>
              <Input
                id="medical_aid_number"
                {...form.register('medical_aid_number')}
                placeholder="Enter medical aid number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              {...form.register('diagnosis')}
              placeholder="Enter diagnosis"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="home_address">Home Address</Label>
            <Textarea
              id="home_address"
              {...form.register('home_address')}
              placeholder="Enter home address"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : patient ? 'Update Patient' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
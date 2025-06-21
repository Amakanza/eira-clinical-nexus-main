
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft } from 'lucide-react';
import { SOAPNote, Patient } from '@/types/clinical';
import { TemplateFormBuilder } from './TemplateFormBuilder';
import { BodyChart } from './BodyChart';
import { useSOAPNotes } from '@/hooks/useSOAPNotes';

interface SOAPNoteFormProps {
  patient: Patient;
  template: {
    type: 'initial-evaluation' | 'progress-note';
    specialty: 'msk' | 'respiratory' | 'neuro' | 'general';
  };
  onSave: (noteData: Omit<SOAPNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SOAPNoteForm = ({ patient, template, onSave, onCancel, isLoading }: SOAPNoteFormProps) => {
  const { getTemplatesByType } = useSOAPNotes();
  const templateData = getTemplatesByType(template.type, template.specialty)[0];

  const [formData, setFormData] = useState({
    // Header information
    date: new Date().toISOString().split('T')[0],
    clinician: 'Current User', // TODO: Get from auth context
    location: 'opd' as const,
    referredBy: '',
    reasonForReferral: '',
    diagnosis: '',
    icd10Code: '',
    
    // Subjective
    chiefComplaint: '',
    historyOfPresentIllness: '',
    symptoms: [] as string[],
    otherSymptoms: '',
    bodyChartAreas: [] as string[],
    
    // Objective
    vitalSigns: {
      heartRate: '',
      bloodPressure: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: ''
    },
    observations: '',
    
    // Action (Management)
    interventionsPerformed: [] as string[],
    managementProvided: '',
    homeProgram: '',
    
    // Plan
    shortTermGoals: [] as string[],
    longTermGoals: [] as string[],
    nextVisitFocus: [] as string[],
    frequency: '',
    duration: ''
  });

  // Template-specific form data
  const [templateFormData, setTemplateFormData] = useState<Record<string, any>>({});

  const commonSymptoms = [
    'Pain', 'Stiffness', 'Weakness', 'Numbness', 'Tingling', 
    'Swelling', 'Instability', 'Fatigue', 'Balance issues'
  ];

  const getCommonInterventions = () => {
    switch (template.specialty) {
      case 'msk':
        return [
          'Manual Therapy', 'Joint Mobilization', 'Soft Tissue Mobilization',
          'Therapeutic Exercise', 'Strengthening Exercises', 'Stretching',
          'Postural Training', 'Gait Training', 'Balance Training',
          'Patient Education', 'Home Exercise Program', 'Ergonomic Advice',
          'Hot/Cold Therapy', 'Ultrasound', 'TENS', 'Taping'
        ];
      case 'respiratory':
        return [
          'Breathing Exercises', 'Airway Clearance', 'Postural Drainage',
          'Percussion & Vibration', 'Active Cycle Breathing', 'Huffing',
          'Incentive Spirometry', 'Exercise Training', 'Walking Program',
          'Patient Education', 'Energy Conservation', 'Positioning'
        ];
      case 'neuro':
        return [
          'Gait Training', 'Balance Training', 'Transfer Training',
          'Coordination Exercises', 'Functional Training', 'ADL Training',
          'Strengthening Exercises', 'Range of Motion', 'Stretching',
          'Sensory Re-education', 'Patient Education', 'Family Training',
          'Assistive Device Training', 'Environmental Modification'
        ];
      default:
        return [
          'Therapeutic Exercise', 'Manual Therapy', 'Patient Education',
          'Gait Training', 'Balance Training', 'Strengthening',
          'Stretching', 'Functional Training', 'Home Program'
        ];
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleInterventionToggle = (intervention: string) => {
    setFormData(prev => ({
      ...prev,
      interventionsPerformed: prev.interventionsPerformed.includes(intervention)
        ? prev.interventionsPerformed.filter(i => i !== intervention)
        : [...prev.interventionsPerformed, intervention]
    }));
  };

  const handleBodyChartChange = (areas: string[]) => {
    setFormData(prev => ({ ...prev, bodyChartAreas: areas }));
  };

  const handleTemplateFieldChange = (fieldId: string, value: any) => {
    setTemplateFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const noteData: Omit<SOAPNote, 'id' | 'createdAt' | 'updatedAt'> = {
      patientId: patient.id,
      templateId: templateData?.id || `${template.specialty}-${template.type}`,
      type: template.type,
      specialty: template.specialty,
      date: formData.date,
      clinician: formData.clinician,
      location: formData.location,
      referredBy: formData.referredBy || undefined,
      reasonForReferral: formData.reasonForReferral || undefined,
      diagnosis: formData.diagnosis || undefined,
      icd10Code: formData.icd10Code || undefined,
      subjective: {
        chiefComplaint: formData.chiefComplaint,
        historyOfPresentIllness: formData.historyOfPresentIllness,
        symptoms: formData.symptoms,
        otherSymptoms: formData.otherSymptoms || undefined,
        bodyChart: formData.bodyChartAreas
      },
      objective: {
        vitalSigns: {
          heartRate: formData.vitalSigns.heartRate ? parseInt(formData.vitalSigns.heartRate) : undefined,
          bloodPressure: formData.vitalSigns.bloodPressure || undefined,
          respiratoryRate: formData.vitalSigns.respiratoryRate ? parseInt(formData.vitalSigns.respiratoryRate) : undefined,
          oxygenSaturation: formData.vitalSigns.oxygenSaturation ? parseInt(formData.vitalSigns.oxygenSaturation) : undefined,
          temperature: formData.vitalSigns.temperature ? parseFloat(formData.vitalSigns.temperature) : undefined
        },
        observations: formData.observations,
        measurements: templateFormData,
        tests: {}
      },
      action: {
        interventionsPerformed: formData.interventionsPerformed,
        managementProvided: formData.managementProvided,
        homeProgram: formData.homeProgram || undefined
      },
      plan: {
        goals: {
          shortTerm: formData.shortTermGoals,
          longTerm: formData.longTermGoals
        },
        frequency: formData.frequency || undefined,
        duration: formData.duration || undefined,
        nextVisitFocus: formData.nextVisitFocus
      },
      formData: templateFormData,
      createdBy: 'current-user', // TODO: Get from auth context
      status: 'draft'
    };

    onSave(noteData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {template.type === 'initial-evaluation' ? 'Initial Evaluation' : 'Progress Note'}
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline">{template.specialty.toUpperCase()}</Badge>
            <span className="text-gray-600">
              {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </div>

      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={formData.location} onValueChange={(value: any) => setFormData(prev => ({ ...prev, location: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opd">Outpatient Department</SelectItem>
                <SelectItem value="ward">Ward</SelectItem>
                <SelectItem value="home">Home Visit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="clinician">Clinician</Label>
            <Input
              id="clinician"
              value={formData.clinician}
              onChange={(e) => setFormData(prev => ({ ...prev, clinician: e.target.value }))}
              required
            />
          </div>
          {template.type === 'initial-evaluation' && (
            <>
              <div>
                <Label htmlFor="referredBy">Referred By</Label>
                <Input
                  id="referredBy"
                  value={formData.referredBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, referredBy: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="diagnosis">Primary Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="e.g., Low back pain"
                />
              </div>
              <div>
                <Label htmlFor="icd10Code">ICD-10 Code</Label>
                <Input
                  id="icd10Code"
                  value={formData.icd10Code}
                  onChange={(e) => setFormData(prev => ({ ...prev, icd10Code: e.target.value }))}
                  placeholder="e.g., M54.5"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subjective */}
      <Card>
        <CardHeader>
          <CardTitle>S - Subjective</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Textarea
              id="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
              placeholder="Patient's primary concern in their own words..."
              required
            />
          </div>
          
          <div>
            <Label>Symptoms</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {commonSymptoms.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={formData.symptoms.includes(symptom)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                  />
                  <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="historyOfPresentIllness">History of Present Illness</Label>
            <Textarea
              id="historyOfPresentIllness"
              value={formData.historyOfPresentIllness}
              onChange={(e) => setFormData(prev => ({ ...prev, historyOfPresentIllness: e.target.value }))}
              placeholder="Detailed history of the current condition..."
              rows={4}
            />
          </div>

          {/* Body Chart */}
          <BodyChart
            markedAreas={formData.bodyChartAreas}
            onAreasChange={handleBodyChartChange}
          />
        </CardContent>
      </Card>

      {/* Objective */}
      <Card>
        <CardHeader>
          <CardTitle>O - Objective</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Vital Signs</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
              <div>
                <Label htmlFor="heartRate" className="text-xs">Heart Rate (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={formData.vitalSigns.heartRate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="bloodPressure" className="text-xs">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  value={formData.vitalSigns.bloodPressure}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                  }))}
                  placeholder="120/80"
                />
              </div>
              <div>
                <Label htmlFor="respiratoryRate" className="text-xs">Resp. Rate (bpm)</Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, respiratoryRate: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="oxygenSaturation" className="text-xs">O₂ Sat (%)</Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  max="100"
                  value={formData.vitalSigns.oxygenSaturation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, oxygenSaturation: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="temperature" className="text-xs">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.vitalSigns.temperature}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="observations">Clinical Observations</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Objective findings, measurements, test results..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Specialty-Specific Template Sections */}
      {templateData && templateData.sections && (
        <TemplateFormBuilder
          sections={templateData.sections}
          formData={templateFormData}
          onFieldChange={handleTemplateFieldChange}
        />
      )}

      {/* Action (Management) */}
      <Card>
        <CardHeader>
          <CardTitle>A - Action (Management Provided)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Interventions Performed</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {getCommonInterventions().map((intervention) => (
                <div key={intervention} className="flex items-center space-x-2">
                  <Checkbox
                    id={intervention}
                    checked={formData.interventionsPerformed.includes(intervention)}
                    onCheckedChange={() => handleInterventionToggle(intervention)}
                  />
                  <Label htmlFor={intervention} className="text-sm">{intervention}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="managementProvided">Additional Management Details</Label>
            <Textarea
              id="managementProvided"
              value={formData.managementProvided}
              onChange={(e) => setFormData(prev => ({ ...prev, managementProvided: e.target.value }))}
              placeholder="Detailed description of management provided..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="homeProgram">Home Program/Instructions</Label>
            <Textarea
              id="homeProgram"
              value={formData.homeProgram}
              onChange={(e) => setFormData(prev => ({ ...prev, homeProgram: e.target.value }))}
              placeholder="Exercise program, activity modifications, precautions..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle>P - Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">Treatment Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="e.g., 3x/week"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 6 weeks"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

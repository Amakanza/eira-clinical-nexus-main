
export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'multiselect' | 'range';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  unit?: string;
  min?: number;
  max?: number;
  defaultValue?: any;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
  collapsible?: boolean;
}

export interface ClinicalTemplate {
  id: string;
  name: string;
  type: 'initial-evaluation' | 'progress-note';
  specialty: 'msk' | 'respiratory' | 'neuro' | 'general';
  sections: FormSection[];
  createdAt: string;
  updatedAt: string;
}

export interface SOAPNote {
  id: string;
  patientId: string;
  templateId: string;
  type: 'initial-evaluation' | 'progress-note';
  specialty: 'msk' | 'respiratory' | 'neuro' | 'general';
  
  // Common header data
  date: string;
  clinician: string;
  location: 'opd' | 'ward' | 'home';
  referredBy?: string;
  reasonForReferral?: string;
  
  // SOAP structure
  subjective: {
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    symptoms: string[];
    otherSymptoms?: string;
    bodyChart?: any; // Will store body chart data
  };
  
  objective: {
    vitalSigns?: {
      heartRate?: number;
      bloodPressure?: string;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      temperature?: number;
    };
    observations?: string;
    measurements: Record<string, any>; // Flexible structure for different specialty measurements
    tests: Record<string, any>; // Special tests, outcome measures, etc.
  };
  
  assessment: {
    summary: string;
    impairments: string[];
    prognosis?: string;
  };
  
  plan: {
    goals: {
      shortTerm: string[];
      longTerm: string[];
    };
    interventions: string[];
    frequency?: string;
    duration?: string;
    nextVisitFocus?: string[];
  };
  
  // Additional form data from templates
  formData: Record<string, any>;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed' | 'signed';
}

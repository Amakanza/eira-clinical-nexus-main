export interface MainMember {
  medicalAidName: string;
  medicalAidNumber: string;
  medicalAidId: string;
  idNumber: string;
  bank: string;
  bankAccountNumber: string;
  occupation: string;
  employerName: string;
  referringDoctor?: string;
  familyDoctor?: string;
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  idNumber?: string;
  email?: string;
}

export interface Diagnosis {
  id: string;
  icd10Code: string;
  description: string;
  dateAdded: string;
  addedBy: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  idNumber: string;
  phone?: string;
  cellNumber?: string;
  email?: string;
  occupation?: string;
  dependentCode?: string;
  
  // Main member information
  mainMember?: MainMember;
  
  // Address (simplified - no state/zip)
  address?: {
    street: string;
    city: string;
  };
  
  // Two next of kin contacts
  nextOfKin1?: NextOfKin;
  nextOfKin2?: NextOfKin;
  
  // Medical information
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string[];
  diagnoses?: Diagnosis[];
  
  lastVisit?: string;
  status: 'active' | 'inactive' | 'deceased';
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  type: 'progress' | 'admission' | 'discharge' | 'consultation' | 'procedure';
  title: string;
  content: string;
  templateId?: string;
  status: 'draft' | 'completed' | 'reviewed' | 'signed';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  reviewedBy?: string;
  attachments?: string[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'clinician' | 'nurse' | 'reception';
  department?: string;
  license?: string;
  signature?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  clinicianId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'procedure' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  location?: string;
}

// ICD-10 code interface
export interface ICD10Code {
  code: string;
  description: string;
  category?: string;
}

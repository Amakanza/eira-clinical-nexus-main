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
  type: 'progress' | 'admission' | 'discharge' | 'consultation' | 'procedure' | 'soap-note';
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
  role: 'admin' | 'clinician' | 'supervisor';
  department?: string;
  license?: string;
  signature?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string;
  isEarlyMorning: boolean;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  isGym: boolean;
}

export interface SpecialEvent {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  clinicianIds: string[];
  type: 'meeting' | 'leave' | 'training' | 'other';
  description?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  clinicianId?: string; // Optional for early morning
  clinicianName?: string; // Optional for early morning
  date: string; // YYYY-MM-DD
  timeSlot?: TimeSlot; // For regular slots
  customStartTime?: string; // For early morning (07:30-09:00)
  customEndTime?: string; // For early morning
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'procedure' | 'emergency' | 'early-morning';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  roomId: string;
  roomName: string;
  notes?: string;
  additionalInfo?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ICD-10 code interface
export interface ICD10Code {
  code: string;
  description: string;
  category?: string;
}

// Re-export template types
export * from './templates';

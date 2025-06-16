
export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string[];
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

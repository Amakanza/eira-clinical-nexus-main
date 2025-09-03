// src/pages/Patients.tsx - Updated to use direct Supabase hook
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PatientForm } from '@/components/patients/PatientForm';
import { PatientList } from '@/components/patients/PatientList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { useSupabasePatients, type PatientFormData, type DatabasePatient } from '@/hooks/useSupabasePatients';
import { useClinicalNotes } from '@/hooks/useClinicalNotes';

type ViewMode = 'list' | 'add' | 'edit' | 'details';

const Patients = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<DatabasePatient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { patients, loading, addPatient, updatePatient, archivePatient, error } = useSupabasePatients();
  const { addNote } = useClinicalNotes();

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setViewMode('add');
  };

  const handleEditPatient = (patient: DatabasePatient) => {
    setSelectedPatient(patient);
    setViewMode('edit');
  };

  const handleViewPatient = (patient: DatabasePatient) => {
    setSelectedPatient(patient);
    setViewMode('details');
  };

  const handleCreateNote = async () => {
    if (!selectedPatient) return;
    
    try {
      await addNote({
        patientId: selectedPatient.id,
        type: 'soap-note',
        title: 'SOAP Note',
        content: '',
        authorId: 'currentUserId', // TODO: Replace with actual user ID
        authorName: 'Current User', // TODO: Replace with actual user name
        status: 'draft'
      });
      // TODO: Navigate to note editor
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleArchivePatient = async (patient: DatabasePatient) => {
    if (window.confirm(`Are you sure you want to archive ${patient.first_name} ${patient.last_name}?`)) {
      try {
        await archivePatient(patient.id);
      } catch (error) {
        console.error('Failed to archive patient:', error);
      }
    }
  };

  const handleUnarchivePatient = async (patient: DatabasePatient) => {
    if (window.confirm(`Are you sure you want to unarchive ${patient.first_name} ${patient.last_name}?`)) {
      try {
        // TODO: Implement unarchive functionality
        console.log('Unarchive not implemented yet');
      } catch (error) {
        console.error('Failed to unarchive patient:', error);
      }
    }
  };

  const handleFormSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedPatient) {
        await updatePatient(selectedPatient.id, data);
      } else {
        await addPatient(data);
      }
      setViewMode('list');
      setSelectedPatient(null);
    } catch (error) {
      console.error('Failed to save patient:', error);
      // Error is already shown by the hook via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'add':
      case 'edit':
        return (
          <PatientFormWrapper
            patient={selectedPatient}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        );
      
      case 'details':
        return selectedPatient ? (
          <PatientDetailsWrapper
            patient={selectedPatient}
            onEdit={() => setViewMode('edit')}
            onArchive={() => handleArchivePatient(selectedPatient)}
            onBack={() => setViewMode('list')}
            onCreateNote={handleCreateNote}
          />
        ) : null;
      
      default:
        return (
          <PatientListWrapper
            patients={patients}
            onEditPatient={handleEditPatient}
            onViewPatient={handleViewPatient}
            onArchivePatient={handleArchivePatient}
            onUnarchivePatient={handleUnarchivePatient}
            isLoading={loading}
          />
        );
    }
  };

  return (
    <MainLayout currentPath="/patients">
      <div className="space-y-6">
        {viewMode === 'list' && (
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
              {error && (
                <p className="text-sm text-red-600 mt-1">
                  Error: {error}
                </p>
              )}
            </div>
            <Button onClick={handleAddPatient} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Register Patient</span>
            </Button>
          </div>
        )}

        {renderContent()}
      </div>
    </MainLayout>
  );
};

// Wrapper components to adapt between frontend Patient type and database format

const PatientFormWrapper = ({ 
  patient, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  patient: DatabasePatient | null;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  // Convert database patient to form data if editing
  const formPatient = patient ? {
    id: patient.id,
    mrn: patient.mrn,
    firstName: patient.first_name,
    lastName: patient.last_name,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    idNumber: patient.id_number,
    phone: patient.phone,
    cellNumber: patient.cell_number,
    email: patient.email,
    occupation: patient.occupation,
    dependentCode: patient.dependent_code,
    
    // Main member information (flattened back to form structure)
    medicalAidName: patient.medical_aid_name,
    medicalAidNumber: patient.medical_aid_number,
    medicalAidId: patient.medical_aid_id,
    mainMemberIdNumber: patient.main_member_id_number,
    bank: patient.bank,
    bankAccountNumber: patient.bank_account_number,
    mainMemberOccupation: patient.main_member_occupation,
    employerName: patient.employer_name,
    referringDoctor: patient.referring_doctor,
    familyDoctor: patient.family_doctor,
    
    // Address
    street: patient.street,
    city: patient.city,
    
    // Medical info
    allergies: patient.allergies?.split(',').map(s => s.trim()).join(', '),
    medications: patient.medications?.split(',').map(s => s.trim()).join(', '),
    medicalHistory: patient.medical_history?.split(',').map(s => s.trim()).join(', '),
    
    // Convert status back to frontend format
    status: patient.status === 'inactive' ? 'inactive' : 'active',
    createdAt: patient.created_at || '',
    updatedAt: patient.updated_at || '',
  } : undefined;

  const handleSubmit = async (data: any) => {
    // Convert form data to PatientFormData format
    const formData: PatientFormData = {
      mrn: data.mrn,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      idNumber: data.idNumber,
      phone: data.phone,
      cellNumber: data.cellNumber,
      email: data.email,
      occupation: data.occupation,
      dependentCode: data.dependentCode,
      medicalAidName: data.medicalAidName,
      medicalAidNumber: data.medicalAidNumber,
      medicalAidId: data.medicalAidId,
      mainMemberIdNumber: data.mainMemberIdNumber,
      bank: data.bank,
      bankAccountNumber: data.bankAccountNumber,
      mainMemberOccupation: data.mainMemberOccupation,
      employerName: data.employerName,
      referringDoctor: data.referringDoctor,
      familyDoctor: data.familyDoctor,
      street: data.street,
      city: data.city,
      allergies: data.allergies,
      medications: data.medications,
      medicalHistory: data.medicalHistory,
    };
    
    await onSubmit(formData);
  };

  return (
    <PatientForm
      patient={formPatient}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};

const PatientDetailsWrapper = ({ 
  patient, 
  onEdit, 
  onArchive, 
  onBack, 
  onCreateNote 
}: {
  patient: DatabasePatient;
  onEdit: () => void;
  onArchive: () => void;
  onBack: () => void;
  onCreateNote: () => void;
}) => {
  // Convert database patient to frontend Patient type
  const frontendPatient = {
    id: patient.id,
    mrn: patient.mrn,
    firstName: patient.first_name,
    lastName: patient.last_name,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    idNumber: patient.id_number,
    phone: patient.phone,
    cellNumber: patient.cell_number,
    email: patient.email,
    occupation: patient.occupation,
    dependentCode: patient.dependent_code,
    
    // Main member information
    mainMember: patient.medical_aid_name ? {
      medicalAidName: patient.medical_aid_name,
      medicalAidNumber: patient.medical_aid_number || "",
      medicalAidId: patient.medical_aid_id || "",
      idNumber: patient.main_member_id_number || "",
      bank: patient.bank || "",
      bankAccountNumber: patient.bank_account_number || "",
      occupation: patient.main_member_occupation || "",
      employerName: patient.employer_name || "",
      referringDoctor: patient.referring_doctor,
      familyDoctor: patient.family_doctor,
    } : undefined,
    
    // Address
    address: patient.street ? {
      street: patient.street,
      city: patient.city || "",
    } : undefined,
    
    // Medical information
    allergies: patient.allergies ? patient.allergies.split(',').map(s => s.trim()) : [],
    medications: patient.medications ? patient.medications.split(',').map(s => s.trim()) : [],
    medicalHistory: patient.medical_history ? patient.medical_history.split(',').map(s => s.trim()) : [],
    diagnoses: [],
    
    status: patient.status === 'inactive' ? 'inactive' as const : 'active' as const,
    createdAt: patient.created_at || '',
    updatedAt: patient.updated_at || '',
  };

  return (
    <PatientDetails
      patient={frontendPatient}
      onEdit={onEdit}
      onArchive={onArchive}
      onBack={onBack}
      onCreateNote={onCreateNote}
    />
  );
};

const PatientListWrapper = ({ 
  patients, 
  onEditPatient, 
  onViewPatient, 
  onArchivePatient, 
  onUnarchivePatient, 
  isLoading 
}: {
  patients: DatabasePatient[];
  onEditPatient: (patient: DatabasePatient) => void;
  onViewPatient: (patient: DatabasePatient) => void;
  onArchivePatient: (patient: DatabasePatient) => void;
  onUnarchivePatient: (patient: DatabasePatient) => void;
  isLoading: boolean;
}) => {
  // Convert database patients to frontend Patient type
  const frontendPatients = patients.map(patient => ({
    id: patient.id,
    mrn: patient.mrn,
    firstName: patient.first_name,
    lastName: patient.last_name,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    idNumber: patient.id_number,
    phone: patient.phone,
    cellNumber: patient.cell_number,
    email: patient.email,
    occupation: patient.occupation,
    dependentCode: patient.dependent_code,
    
    // Main member information
    mainMember: patient.medical_aid_name ? {
      medicalAidName: patient.medical_aid_name,
      medicalAidNumber: patient.medical_aid_number || "",
      medicalAidId: patient.medical_aid_id || "",
      idNumber: patient.main_member_id_number || "",
      bank: patient.bank || "",
      bankAccountNumber: patient.bank_account_number || "",
      occupation: patient.main_member_occupation || "",
      employerName: patient.employer_name || "",
      referringDoctor: patient.referring_doctor,
      familyDoctor: patient.family_doctor,
    } : undefined,
    
    // Address
    address: patient.street ? {
      street: patient.street,
      city: patient.city || "",
    } : undefined,
    
    // Medical information
    allergies: patient.allergies ? patient.allergies.split(',').map(s => s.trim()) : [],
    medications: patient.medications ? patient.medications.split(',').map(s => s.trim()) : [],
    medicalHistory: patient.medical_history ? patient.medical_history.split(',').map(s => s.trim()) : [],
    diagnoses: [],
    
    status: patient.status === 'inactive' ? 'inactive' as const : 'active' as const,
    createdAt: patient.created_at || '',
    updatedAt: patient.updated_at || '',
  }));

  const handleEditPatient = (frontendPatient: any) => {
    const dbPatient = patients.find(p => p.id === frontendPatient.id);
    if (dbPatient) onEditPatient(dbPatient);
  };

  const handleViewPatient = (frontendPatient: any) => {
    const dbPatient = patients.find(p => p.id === frontendPatient.id);
    if (dbPatient) onViewPatient(dbPatient);
  };

  const handleArchivePatient = (frontendPatient: any) => {
    const dbPatient = patients.find(p => p.id === frontendPatient.id);
    if (dbPatient) onArchivePatient(dbPatient);
  };

  const handleUnarchivePatient = (frontendPatient: any) => {
    const dbPatient = patients.find(p => p.id === frontendPatient.id);
    if (dbPatient) onUnarchivePatient(dbPatient);
  };

  return (
    <PatientList
      patients={frontendPatients}
      onEditPatient={handleEditPatient}
      onViewPatient={handleViewPatient}
      onArchivePatient={handleArchivePatient}
      onUnarchivePatient={handleUnarchivePatient}
      isLoading={isLoading}
    />
  );
};

export default Patients;

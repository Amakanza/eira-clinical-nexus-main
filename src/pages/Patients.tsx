
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PatientForm } from '@/components/patients/PatientForm';
import { PatientList } from '@/components/patients/PatientList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { usePatients } from '@/hooks/usePatients';
import { useClinicalNotes } from '@/hooks/useClinicalNotes';
import { Patient } from '@/types/clinical';

type ViewMode = 'list' | 'add' | 'edit' | 'details';

const Patients = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { patients, loading, addPatient, updatePatient, archivePatient, unarchivePatient, isOffline } = usePatients();
  const { addNote } = useClinicalNotes();

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setViewMode('add');
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('edit');
  };

  const handleViewPatient = (patient: Patient) => {
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

  const handleArchivePatient = async (patient: Patient) => {
    if (window.confirm(`Are you sure you want to archive ${patient.firstName} ${patient.lastName}?`)) {
      try {
        await archivePatient(patient.id);
      } catch (error) {
        console.error('Failed to archive patient:', error);
      }
    }
  };

  const handleUnarchivePatient = async (patient: Patient) => {
    if (window.confirm(`Are you sure you want to unarchive ${patient.firstName} ${patient.lastName}?`)) {
      try {
        await unarchivePatient(patient.id);
      } catch (error) {
        console.error('Failed to unarchive patient:', error);
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
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
          <PatientForm
            patient={selectedPatient || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        );
      
      case 'details':
        console.log('Rendering PatientDetails', { viewMode, selectedPatient });
        return selectedPatient ? (
          <PatientDetails
            patient={selectedPatient}
            onEdit={() => setViewMode('edit')}
            onArchive={() => handleArchivePatient(selectedPatient)}
            onBack={() => setViewMode('list')}
            onCreateNote={handleCreateNote}
          />
        ) : null;
      
      default:
        return (
          <PatientList
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
              {isOffline && (
                <p className="text-sm text-amber-600 mt-1">
                  You're currently offline. Changes will sync when reconnected.
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

export default Patients;

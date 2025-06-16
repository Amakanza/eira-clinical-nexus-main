
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PatientForm } from '@/components/patients/PatientForm';
import { PatientList } from '@/components/patients/PatientList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { usePatients } from '@/hooks/usePatients';
import { Patient } from '@/types/clinical';

type ViewMode = 'list' | 'add' | 'edit' | 'details';

const Patients = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { patients, loading, addPatient, updatePatient, archivePatient, isOffline } = usePatients();

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

  const handleArchivePatient = async (patient: Patient) => {
    if (window.confirm(`Are you sure you want to archive ${patient.firstName} ${patient.lastName}?`)) {
      try {
        await archivePatient(patient.id);
      } catch (error) {
        console.error('Failed to archive patient:', error);
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
        return selectedPatient ? (
          <PatientDetails
            patient={selectedPatient}
            onEdit={() => setViewMode('edit')}
            onArchive={() => handleArchivePatient(selectedPatient)}
            onBack={() => setViewMode('list')}
          />
        ) : null;
      
      default:
        return (
          <PatientList
            patients={patients}
            onEditPatient={handleEditPatient}
            onViewPatient={handleViewPatient}
            onArchivePatient={handleArchivePatient}
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

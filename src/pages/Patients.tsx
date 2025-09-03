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

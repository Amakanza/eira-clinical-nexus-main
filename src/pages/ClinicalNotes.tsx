
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, User } from 'lucide-react';
import { TemplateSelector } from '@/components/clinical/TemplateSelector';
import { SOAPNoteForm } from '@/components/clinical/SOAPNoteForm';
import { useSOAPNotes } from '@/hooks/useSOAPNotes';
import { usePatients } from '@/hooks/usePatients';
import { Patient } from '@/types/clinical';

type ViewMode = 'list' | 'template-selector' | 'note-form' | 'patient-selector';

const ClinicalNotes = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<{
    type: 'initial-evaluation' | 'progress-note';
    specialty: 'msk' | 'respiratory' | 'neuro' | 'general';
  } | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { soapNotes, loading, createSOAPNote } = useSOAPNotes();
  const { patients } = usePatients();

  const handleNewNote = () => {
    setViewMode('patient-selector');
  };

  const handlePatientSelected = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('template-selector');
  };

  const handleTemplateSelected = (type: 'initial-evaluation' | 'progress-note', specialty: 'msk' | 'respiratory' | 'neuro' | 'general') => {
    setSelectedTemplate({ type, specialty });
    setViewMode('note-form');
  };

  const handleSaveNote = async (noteData: any) => {
    setIsSubmitting(true);
    try {
      await createSOAPNote(noteData);
      setViewMode('list');
      setSelectedTemplate(null);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedTemplate(null);
    setSelectedPatient(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'patient-selector':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Select Patient</h2>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
            <div className="grid gap-4">
              {patients.filter(p => p.status === 'active').map((patient) => (
                <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handlePatientSelected(patient)}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-gray-400" />
                      <div>
                        <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                        <div className="text-sm text-gray-500">MRN: {patient.mrn} • DOB: {patient.dateOfBirth}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Select
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'template-selector':
        return (
          <TemplateSelector
            onSelectTemplate={handleTemplateSelected}
            onCancel={handleCancel}
          />
        );

      case 'note-form':
        return selectedPatient && selectedTemplate ? (
          <SOAPNoteForm
            patient={selectedPatient}
            template={selectedTemplate}
            onSave={handleSaveNote}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        ) : null;

      default:
        return (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Clinical Notes</h1>
              <Button onClick={handleNewNote} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Note</span>
              </Button>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Recent Clinical Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-gray-600">Loading clinical notes...</p>
                  ) : soapNotes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No clinical notes yet</p>
                      <p className="text-sm text-gray-500">Create your first SOAP note to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {soapNotes.slice(0, 10).map((note) => {
                        const patient = patients.find(p => p.id === note.patientId);
                        return (
                          <div key={note.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {note.type === 'initial-evaluation' ? 'Initial Evaluation' : 'Progress Note'} • 
                                  {note.specialty.toUpperCase()} • 
                                  {new Date(note.date).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {note.subjective.chiefComplaint}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {note.status}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        );
    }
  };

  return (
    <MainLayout currentPath="/notes">
      <div className="space-y-6">
        {renderContent()}
      </div>
    </MainLayout>
  );
};

export default ClinicalNotes;

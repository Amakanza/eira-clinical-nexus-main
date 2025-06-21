
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, User, Calendar, Stethoscope } from 'lucide-react';
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

  // Group notes by episodes (simplified version - same patient, similar conditions)
  const groupNotesByEpisodes = (notes: any[]) => {
    const grouped = notes.reduce((acc, note) => {
      const key = `${note.patientId}-${note.specialty}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(note);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([key, notes]) => ({
      id: key,
      patientId: notes[0].patientId,
      specialty: notes[0].specialty,
      diagnosis: notes[0].diagnosis || 'No diagnosis recorded',
      icd10Code: notes[0].icd10Code || '',
      startDate: notes[notes.length - 1].date, // Oldest note
      endDate: notes[0].date, // Newest note
      noteCount: notes.length,
      notes: notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }));
  };

  const episodes = groupNotesByEpisodes(soapNotes);

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
                    <span>Care Episodes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-gray-600">Loading clinical notes...</p>
                  ) : episodes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No clinical notes yet</p>
                      <p className="text-sm text-gray-500">Create your first SOAP note to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {episodes.map((episode) => {
                        const patient = patients.find(p => p.id === episode.patientId);
                        return (
                          <div key={episode.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="font-medium text-lg">
                                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                                  </div>
                                  <Badge variant="outline">{episode.specialty.toUpperCase()}</Badge>
                                  <div className="text-sm text-gray-500">
                                    {episode.noteCount} note{episode.noteCount !== 1 ? 's' : ''}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <Stethoscope className="h-4 w-4" />
                                    <span>{episode.diagnosis}</span>
                                    {episode.icd10Code && (
                                      <Badge variant="secondary" className="text-xs">
                                        {episode.icd10Code}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {episode.startDate === episode.endDate 
                                        ? new Date(episode.startDate).toLocaleDateString()
                                        : `${new Date(episode.startDate).toLocaleDateString()} - ${new Date(episode.endDate).toLocaleDateString()}`
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Individual Notes in Episode */}
                            <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                              {episode.notes.slice(0, 3).map((note: any) => (
                                <div key={note.id} className="text-sm">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant={note.type === 'initial-evaluation' ? 'default' : 'secondary'} className="text-xs">
                                        {note.type === 'initial-evaluation' ? 'Initial' : 'Progress'}
                                      </Badge>
                                      <span className="text-gray-600">
                                        {new Date(note.date).toLocaleDateString()}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        by {note.clinician}
                                      </span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {note.status}
                                    </Badge>
                                  </div>
                                  {note.subjective?.chiefComplaint && (
                                    <div className="text-gray-600 mt-1 truncate">
                                      {note.subjective.chiefComplaint}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {episode.noteCount > 3 && (
                                <div className="text-xs text-gray-500 italic">
                                  ... and {episode.noteCount - 3} more note{episode.noteCount - 3 !== 1 ? 's' : ''}
                                </div>
                              )}
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

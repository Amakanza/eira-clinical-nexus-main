import { useState } from 'react';
import { ClinicalNote } from '@/types/clinical';
import { usePatients } from '@/hooks/usePatients';
import { useClinicalNotes } from '@/hooks/useClinicalNotes';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const ClinicalNotesViewer = () => {
  const { patients, loading: patientsLoading } = usePatients();
  const { notes, loading: notesLoading, updateNote } = useClinicalNotes();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);

  const getPatientNoteCount = (patientId: string) => {
    return notes.filter(note => note.patientId === patientId).length;
  };

  const handleNoteClick = (note: ClinicalNote) => {
    setSelectedNote(note);
  };

  const handleNoteUpdate = async (updatedContent: string) => {
    if (!selectedNote) return;
    
    await updateNote(selectedNote.id, { content: updatedContent });
    setSelectedNote(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Clinical Notes</h2>
      
      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map(patient => (
          <div
            key={patient.id}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedPatientId(patient.id)}
          >
            <div className="font-medium">{patient.firstName} {patient.lastName}</div>
            <div className="text-sm text-gray-500">
              Notes: {getPatientNoteCount(patient.id)}
            </div>
          </div>
        ))}
      </div>

      {/* Notes Table */}
      {selectedPatientId && (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes
                .filter(note => note.patientId === selectedPatientId)
                .map(note => (
                  <TableRow key={note.id}>
                    <TableCell>{new Date(note.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{note.type}</TableCell>
                    <TableCell>{note.title}</TableCell>
                    <TableCell>{note.status}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNoteClick(note)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Note Detail Modal */}
      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <textarea
              className="w-full h-64 p-2 border rounded"
              value={selectedNote?.content || ''}
              onChange={(e) => selectedNote && setSelectedNote({
                ...selectedNote,
                content: e.target.value
              })}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedNote(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedNote && handleNoteUpdate(selectedNote.content)}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

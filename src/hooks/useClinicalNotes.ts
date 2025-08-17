import { useState, useEffect } from 'react';
import { ClinicalNote } from '@/types/clinical';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineStorage } from './useOfflineStorage';
import { toast } from '@/components/ui/use-toast';

const STORAGE_CONFIG = {
  dbName: 'EiraClinicalNotes',
  version: 1,
  stores: [
    {
      name: 'clinicalNotes',
      keyPath: 'id',
      indexes: [
        { name: 'patientId', keyPath: 'patientId' },
        { name: 'createdAt', keyPath: 'createdAt' },
        { name: 'type', keyPath: 'type' }
      ]
    }
  ]
};

export const useClinicalNotes = () => {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const storage = useOfflineStorage(STORAGE_CONFIG);

  useEffect(() => {
    loadNotes();
  }, [storage.db]);

  const loadNotes = async () => {
    if (!storage.db) return;
    
    try {
      const allNotes = await storage.getAllFromStore('clinicalNotes') as ClinicalNote[];
      setNotes(allNotes || []);
    } catch (error) {
      console.error('Error loading clinical notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load clinical notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (noteData: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClinicalNote> => {
    const newNote: ClinicalNote = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await storage.saveToStore('clinicalNotes', newNote);
      setNotes(prev => [...prev, newNote]);
      
      if (!storage.isOnline) {
        storage.addToSyncQueue({ 
          type: 'CREATE_NOTE', 
          data: newNote 
        });
      } else {
        await supabase
          .from('clinical_notes')
          .insert(newNote)
          .throwOnError();
      }

      toast({
        title: 'Success',
        description: 'Clinical note added successfully',
      });

      return newNote;
    } catch (error) {
      console.error('Error adding clinical note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add clinical note',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateNote = async (noteId: string, noteData: Partial<ClinicalNote>): Promise<ClinicalNote> => {
    const existingNote = notes.find(n => n.id === noteId);
    if (!existingNote) throw new Error('Note not found');

    const updatedNote = {
      ...existingNote,
      ...noteData,
      updatedAt: new Date().toISOString()
    };

    try {
      await storage.saveToStore('clinicalNotes', updatedNote);
      setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));
      
      if (!storage.isOnline) {
        storage.addToSyncQueue({ 
          type: 'UPDATE_NOTE', 
          data: updatedNote 
        });
      } else {
        await supabase
          .from('clinical_notes')
          .update(updatedNote)
          .eq('id', noteId)
          .throwOnError();
      }

      toast({
        title: 'Success',
        description: 'Clinical note updated successfully',
      });

      return updatedNote;
    } catch (error) {
      console.error('Error updating clinical note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update clinical note',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteNote = async (noteId: string): Promise<void> => {
    try {
      await storage.deleteFromStore('clinicalNotes', noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      
      if (!storage.isOnline) {
        storage.addToSyncQueue({ 
          type: 'DELETE_NOTE', 
          data: { id: noteId } 
        });
      } else {
        await supabase
          .from('clinical_notes')
          .delete()
          .eq('id', noteId)
          .throwOnError();
      }

      toast({
        title: 'Success',
        description: 'Clinical note deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting clinical note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete clinical note',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    isOffline: !storage.isOnline,
  };
};

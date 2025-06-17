
import { useState, useEffect } from 'react';
import { SOAPNote, ClinicalTemplate } from '@/types/clinical';
import { useOfflineStorage } from './useOfflineStorage';
import { toast } from '@/hooks/use-toast';

const STORAGE_CONFIG = {
  dbName: 'EiraSOAPNotes',
  version: 1,
  stores: [
    {
      name: 'soapNotes',
      keyPath: 'id',
      indexes: [
        { name: 'patientId', keyPath: 'patientId' },
        { name: 'type', keyPath: 'type' },
        { name: 'specialty', keyPath: 'specialty' },
        { name: 'status', keyPath: 'status' }
      ]
    },
    {
      name: 'templates',
      keyPath: 'id',
      indexes: [
        { name: 'type', keyPath: 'type' },
        { name: 'specialty', keyPath: 'specialty' }
      ]
    }
  ]
};

export const useSOAPNotes = () => {
  const [soapNotes, setSOAPNotes] = useState<SOAPNote[]>([]);
  const [templates, setTemplates] = useState<ClinicalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const storage = useOfflineStorage(STORAGE_CONFIG);

  useEffect(() => {
    loadData();
  }, [storage.db]);

  const loadData = async () => {
    if (!storage.db) return;
    
    try {
      const [notesData, templatesData] = await Promise.all([
        storage.getAllFromStore('soapNotes') as Promise<SOAPNote[]>,
        storage.getAllFromStore('templates') as Promise<ClinicalTemplate[]>
      ]);
      
      setSOAPNotes(notesData || []);
      setTemplates(templatesData || []);
      
      // Initialize default templates if none exist
      if (!templatesData || templatesData.length === 0) {
        await initializeDefaultTemplates();
      }
    } catch (error) {
      console.error('Error loading SOAP notes data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load clinical notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultTemplates = async () => {
    const defaultTemplates: ClinicalTemplate[] = [
      {
        id: 'msk-initial',
        name: 'MSK Initial Evaluation',
        type: 'initial-evaluation',
        specialty: 'msk',
        sections: [
          {
            id: 'systems-review',
            title: 'Systems Review',
            fields: [
              {
                id: 'cardiovascular',
                type: 'checkbox',
                label: 'Cardiovascular',
                defaultValue: false
              },
              {
                id: 'integumentary',
                type: 'checkbox',
                label: 'Integumentary',
                defaultValue: false
              },
              {
                id: 'neurological',
                type: 'checkbox',
                label: 'Neurological',
                defaultValue: false
              }
            ]
          },
          {
            id: 'rom-testing',
            title: 'Range of Motion Testing',
            fields: [
              {
                id: 'flexion',
                type: 'number',
                label: 'Flexion',
                unit: '°',
                min: 0,
                max: 180
              },
              {
                id: 'extension',
                type: 'number',
                label: 'Extension',
                unit: '°',
                min: 0,
                max: 180
              }
            ]
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const template of defaultTemplates) {
      await storage.saveToStore('templates', template);
    }
    setTemplates(defaultTemplates);
  };

  const createSOAPNote = async (noteData: Omit<SOAPNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<SOAPNote> => {
    const newNote: SOAPNote = {
      id: `soap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await storage.saveToStore('soapNotes', newNote);
      setSOAPNotes(prev => [...prev, newNote]);
      
      if (!storage.isOnline) {
        storage.addToSyncQueue({ 
          type: 'CREATE_SOAP_NOTE', 
          data: newNote 
        });
      }

      toast({
        title: 'Success',
        description: 'Clinical note created successfully',
      });

      return newNote;
    } catch (error) {
      console.error('Error creating SOAP note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create clinical note',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateSOAPNote = async (noteId: string, updates: Partial<SOAPNote>): Promise<SOAPNote> => {
    const existingNote = soapNotes.find(n => n.id === noteId);
    if (!existingNote) throw new Error('SOAP note not found');

    const updatedNote: SOAPNote = {
      ...existingNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      await storage.saveToStore('soapNotes', updatedNote);
      setSOAPNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));
      
      if (!storage.isOnline) {
        storage.addToSyncQueue({ 
          type: 'UPDATE_SOAP_NOTE', 
          data: updatedNote 
        });
      }

      toast({
        title: 'Success',
        description: 'Clinical note updated successfully',
      });

      return updatedNote;
    } catch (error) {
      console.error('Error updating SOAP note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update clinical note',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getSOAPNotesByPatient = (patientId: string): SOAPNote[] => {
    return soapNotes.filter(note => note.patientId === patientId);
  };

  const getTemplatesByType = (type: 'initial-evaluation' | 'progress-note', specialty?: string): ClinicalTemplate[] => {
    return templates.filter(template => 
      template.type === type && 
      (!specialty || template.specialty === specialty)
    );
  };

  return {
    soapNotes,
    templates,
    loading,
    createSOAPNote,
    updateSOAPNote,
    getSOAPNotesByPatient,
    getTemplatesByType,
    isOffline: !storage.isOnline,
  };
};

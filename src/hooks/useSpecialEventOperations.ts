
import { useState } from 'react';
import { SpecialEvent } from '@/types/clinical';

export const useSpecialEventOperations = () => {
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSpecialEvent = async (eventData: Partial<SpecialEvent>): Promise<SpecialEvent> => {
    setLoading(true);
    setError(null);
    
    try {
      const newEvent: SpecialEvent = {
        id: `event-${Date.now()}`,
        title: eventData.title || '',
        startDateTime: eventData.startDateTime || '',
        endDateTime: eventData.endDateTime || '',
        clinicianIds: eventData.clinicianIds || [],
        type: eventData.type || 'other',
        description: eventData.description
      };
      
      setSpecialEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create special event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSpecialEvent = async (id: string, updates: Partial<SpecialEvent>): Promise<SpecialEvent> => {
    setLoading(true);
    setError(null);
    
    try {
      setSpecialEvents(prev => prev.map(event => 
        event.id === id 
          ? { ...event, ...updates }
          : event
      ));
      
      return specialEvents.find(event => event.id === id)!;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update special event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSpecialEvent = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setSpecialEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete special event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    specialEvents,
    createSpecialEvent,
    updateSpecialEvent,
    deleteSpecialEvent,
    loading,
    error
  };
};

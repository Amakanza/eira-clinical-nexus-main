
import { useState } from 'react';
import { SpecialEvent } from '@/types/clinical';
import { supabase } from '@/integrations/supabase/client';

export const useSpecialEventOperations = (specialEvents: SpecialEvent[], refreshData: () => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSpecialEvent = async (eventData: Partial<SpecialEvent>): Promise<SpecialEvent> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('special_events')
        .insert({
          title: eventData.title || '',
          start_date_time: eventData.startDateTime || '',
          end_date_time: eventData.endDateTime || '',
          clinician_ids: eventData.clinicianIds || [],
          type: eventData.type || 'other',
          description: eventData.description
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      const newEvent: SpecialEvent = {
        id: data.id,
        title: data.title,
        startDateTime: data.start_date_time,
        endDateTime: data.end_date_time,
        clinicianIds: data.clinician_ids,
        type: data.type,
        description: data.description
      };
      
      refreshData();
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
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.startDateTime !== undefined) updateData.start_date_time = updates.startDateTime;
      if (updates.endDateTime !== undefined) updateData.end_date_time = updates.endDateTime;
      if (updates.clinicianIds !== undefined) updateData.clinician_ids = updates.clinicianIds;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.description !== undefined) updateData.description = updates.description;

      const { data, error: supabaseError } = await supabase
        .from('special_events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      const updatedEvent: SpecialEvent = {
        id: data.id,
        title: data.title,
        startDateTime: data.start_date_time,
        endDateTime: data.end_date_time,
        clinicianIds: data.clinician_ids,
        type: data.type,
        description: data.description
      };
      
      refreshData();
      return updatedEvent;
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
      const { error: supabaseError } = await supabase
        .from('special_events')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete special event';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSpecialEvent,
    updateSpecialEvent,
    deleteSpecialEvent,
    loading,
    error
  };
};

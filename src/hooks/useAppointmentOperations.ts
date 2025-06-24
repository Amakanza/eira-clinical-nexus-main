
import { useState } from 'react';
import { Appointment, SpecialEvent, Room } from '@/types/clinical';
import { validateAppointment } from '@/utils/appointmentValidation';

export const useAppointmentOperations = (
  appointments: Appointment[],
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>,
  specialEvents: SpecialEvent[],
  rooms: Room[]
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAppointment = async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    setLoading(true);
    setError(null);
    
    try {
      const validation = validateAppointment(appointmentData, appointments, specialEvents, rooms);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: appointmentData.patientId || '',
        patientName: appointmentData.patientName || '',
        clinicianId: appointmentData.clinicianId || '',
        clinicianName: appointmentData.clinicianName || '',
        date: appointmentData.date || '',
        timeSlot: appointmentData.timeSlot,
        customStartTime: appointmentData.customStartTime,
        customEndTime: appointmentData.customEndTime,
        duration: appointmentData.duration || 40,
        type: appointmentData.type || 'consultation',
        status: 'scheduled',
        roomId: appointmentData.roomId || '',
        roomName: appointmentData.roomName || '',
        notes: appointmentData.notes,
        additionalInfo: appointmentData.additionalInfo,
        createdBy: 'current-user',
        updatedBy: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Creating appointment:', newAppointment);
      
      setAppointments(currentAppointments => {
        const updated = [...currentAppointments, newAppointment];
        console.log('Updated appointments list:', updated);
        return updated;
      });
      
      setLoading(false);
      return newAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
    setLoading(true);
    setError(null);
    
    try {
      const validation = validateAppointment(updates, appointments, specialEvents, rooms, id);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      
      let updatedAppointment: Appointment;
      
      setAppointments(currentAppointments => {
        const updated = currentAppointments.map(apt => {
          if (apt.id === id) {
            updatedAppointment = { ...apt, ...updates, updatedAt: new Date().toISOString() };
            return updatedAppointment;
          }
          return apt;
        });
        console.log('Updated appointments after edit:', updated);
        return updated;
      });
      
      setLoading(false);
      return updatedAppointment!;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    loading,
    error
  };
};

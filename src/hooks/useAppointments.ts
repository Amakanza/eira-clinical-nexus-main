
import { useState, useEffect } from 'react';
import { Appointment } from '@/types/clinical';
import { generateTimeSlots } from '@/utils/timeSlotUtils';
import { mockRooms, mockClinicians, mockAppointments } from '@/data/mockData';
import { useAppointmentOperations } from './useAppointmentOperations';
import { useSpecialEventOperations } from './useSpecialEventOperations';
import { useAppointmentQueries } from './useAppointmentQueries';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Initialize mock data
  useEffect(() => {
    setAppointments(mockAppointments);
  }, []);

  const timeSlots = generateTimeSlots();
  const rooms = mockRooms;
  const clinicians = mockClinicians;

  // Special events operations
  const {
    specialEvents,
    createSpecialEvent,
    updateSpecialEvent,
    deleteSpecialEvent,
    loading: specialEventsLoading,
    error: specialEventsError
  } = useSpecialEventOperations();

  // Appointment operations
  const {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    loading: appointmentsLoading,
    error: appointmentsError
  } = useAppointmentOperations(appointments, setAppointments, specialEvents, rooms);

  // Appointment queries
  const {
    getAppointmentsByDate,
    getAppointmentsByClinician
  } = useAppointmentQueries(appointments);

  const loading = appointmentsLoading || specialEventsLoading;
  const error = appointmentsError || specialEventsError;

  return {
    appointments,
    specialEvents,
    timeSlots,
    rooms,
    clinicians,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByClinician,
    createSpecialEvent,
    updateSpecialEvent,
    deleteSpecialEvent
  };
};

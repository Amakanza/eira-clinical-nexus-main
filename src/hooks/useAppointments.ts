
import { useState, useEffect } from 'react';
import { Appointment, TimeSlot, Room, SpecialEvent, User } from '@/types/clinical';
import { generateTimeSlots, isClinicianAvailable, hasRoomCapacity } from '@/utils/timeSlotUtils';

// Mock data - in real app this would come from API
const mockRooms: Room[] = [
  { id: 'room-1', name: 'Treatment Room 1', capacity: 4, isGym: false },
  { id: 'room-2', name: 'Treatment Room 2', capacity: 4, isGym: false },
  { id: 'room-3', name: 'Gym', capacity: 10, isGym: true },
  { id: 'room-4', name: 'Consultation Room', capacity: 4, isGym: false },
];

const mockClinicians: User[] = [
  {
    id: 'clinician-1',
    email: 'sarah@clinic.com',
    firstName: 'Dr. Sarah',
    lastName: 'Thompson',
    role: 'clinician',
    department: 'Physiotherapy',
    license: 'PT12345',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'clinician-2',
    email: 'michael@clinic.com',
    firstName: 'Dr. Michael',
    lastName: 'Wilson',
    role: 'supervisor',
    department: 'Clinical Services',
    license: 'MD67890',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  }
];

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data initialization
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: 'apt-1',
        patientId: 'patient-1',
        patientName: 'John Smith',
        clinicianId: 'clinician-1',
        clinicianName: 'Dr. Sarah Thompson',
        date: '2024-12-23',
        timeSlot: {
          id: 'slot-0',
          startTime: '09:20',
          endTime: '10:00',
          isEarlyMorning: false
        },
        duration: 40,
        type: 'consultation',
        status: 'scheduled',
        roomId: 'room-1',
        roomName: 'Treatment Room 1',
        notes: 'Initial consultation',
        createdBy: 'user-1',
        updatedBy: 'user-1',
        createdAt: '2024-12-22T10:00:00Z',
        updatedAt: '2024-12-22T10:00:00Z'
      }
    ];
    
    setAppointments(mockAppointments);
  }, []);

  const timeSlots = generateTimeSlots();
  const rooms = mockRooms;
  const clinicians = mockClinicians;

  const createAppointment = async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate the appointment
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
      
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
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
      
      setAppointments(prev => prev.map(apt => 
        apt.id === id 
          ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
          : apt
      ));
      
      return appointments.find(apt => apt.id === id)!;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
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

  const getAppointmentsByDate = (date: string): Appointment[] => {
    return appointments.filter(apt => apt.date === date);
  };

  const getAppointmentsByClinician = (clinicianId: string, date?: string): Appointment[] => {
    return appointments.filter(apt => 
      apt.clinicianId === clinicianId && 
      (!date || apt.date === date)
    );
  };

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
    getAppointmentsByClinician
  };
};

// Validation function
const validateAppointment = (
  appointmentData: Partial<Appointment>,
  appointments: Appointment[],
  specialEvents: SpecialEvent[],
  rooms: Room[],
  excludeId?: string
): { isValid: boolean; error?: string } => {
  if (!appointmentData.clinicianId || !appointmentData.date) {
    return { isValid: false, error: 'Clinician and date are required' };
  }

  // For regular time slots
  if (appointmentData.timeSlot) {
    const isAvailable = isClinicianAvailable(
      appointmentData.clinicianId,
      appointmentData.date,
      appointmentData.timeSlot.startTime,
      appointmentData.timeSlot.endTime,
      appointments,
      specialEvents,
      excludeId
    );
    
    if (!isAvailable) {
      return { isValid: false, error: 'Clinician is not available at this time' };
    }
    
    if (appointmentData.roomId) {
      const hasCapacity = hasRoomCapacity(
        appointmentData.roomId,
        appointmentData.date,
        appointmentData.timeSlot,
        appointments,
        rooms,
        excludeId
      );
      
      if (!hasCapacity) {
        return { isValid: false, error: 'Room is at capacity for this time slot' };
      }
    }
  }

  return { isValid: true };
};


import { Room, User, Appointment } from '@/types/clinical';

export const mockRooms: Room[] = [
  { id: 'room-1', name: 'Treatment Room 1', capacity: 4, isGym: false },
  { id: 'room-2', name: 'Treatment Room 2', capacity: 4, isGym: false },
  { id: 'room-3', name: 'Treatment Room 3', capacity: 4, isGym: false },
  { id: 'room-4', name: 'Treatment Room 4', capacity: 4, isGym: false },
  { id: 'room-gym', name: 'Gym', capacity: 10, isGym: true },
];

export const mockClinicians: User[] = [
  {
    id: 'clinician-1',
    username: 'sthompson',
    email: 'sarah@clinic.com',
    firstName: 'Dr. Sarah',
    lastName: 'Thompson',
    role: 'clinician',
    department: 'Physiotherapy',
    license: 'PT12345',
    initials: 'ST',
    clinicianColor: '#3B82F6',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'clinician-2',
    username: 'mwilson',
    email: 'michael@clinic.com',
    firstName: 'Dr. Michael',
    lastName: 'Wilson',
    role: 'supervisor',
    department: 'Clinical Services',
    license: 'MD67890',
    initials: 'MW',
    clinicianColor: '#EF4444',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'patient-1',
    patientName: 'John Smith',
    clinicianId: 'clinician-1',
    clinicianName: 'Dr. Sarah Thompson',
    date: '2025-06-24',
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

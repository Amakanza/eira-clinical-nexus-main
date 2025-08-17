
import { Appointment, SpecialEvent, Room } from '@/types/clinical';
import { isClinicianAvailable, hasRoomCapacity } from '@/utils/timeSlotUtils';

export const validateAppointment = (
  appointmentData: Partial<Appointment>,
  appointments: Appointment[],
  specialEvents: SpecialEvent[],
  rooms: Room[],
  excludeId?: string
): { isValid: boolean; error?: string } => {
  if (!appointmentData.date) {
    return { isValid: false, error: 'Date is required' };
  }

  if (!appointmentData.patientName) {
    return { isValid: false, error: 'Patient name is required' };
  }

  if (!appointmentData.roomId) {
    return { isValid: false, error: 'Room is required' };
  }

  // For early morning appointments, clinician is optional
  const isEarlyMorning = appointmentData.type === 'early-morning';
  if (!isEarlyMorning && !appointmentData.clinicianId) {
    return { isValid: false, error: 'Clinician is required for regular appointments' };
  }

  // For regular time slots with clinician
  if (appointmentData.timeSlot && appointmentData.clinicianId) {
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
  }
  
  // Check room capacity for all appointments
  if (appointmentData.roomId && appointmentData.timeSlot) {
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

  return { isValid: true };
};

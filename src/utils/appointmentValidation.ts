
import { Appointment, SpecialEvent, Room } from '@/types/clinical';
import { isClinicianAvailable, hasRoomCapacity } from '@/utils/timeSlotUtils';

export const validateAppointment = (
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

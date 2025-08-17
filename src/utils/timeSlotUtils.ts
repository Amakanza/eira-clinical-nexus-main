import { TimeSlot, Room, Appointment, SpecialEvent } from '@/types/clinical';

// Format time string to remove seconds (HH:MM:SS -> HH:MM)
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  // Handle both HH:MM and HH:MM:SS formats
  return timeString.substring(0, 5);
};

// Generate all regular time slots from 09:20 to 16:00
export const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const startMinute = 20;
  const endHour = 16;
  const endMinute = 0;
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  let slotIndex = 0;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Calculate end time (40 minutes later)
    let endHour = currentHour;
    let endMin = currentMinute + 40;
    
    if (endMin >= 60) {
      endHour++;
      endMin -= 60;
    }
    
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    
    slots.push({
      id: `slot-${slotIndex}`,
      startTime,
      endTime,
      isEarlyMorning: false
    });
    
    // Move to next slot (40 minutes)
    currentMinute += 40;
    if (currentMinute >= 60) {
      currentHour++;
      currentMinute -= 60;
    }
    
    slotIndex++;
  }
  
  return slots;
};

// Check if a time is within early morning period (07:30-09:00)
export const isEarlyMorningTime = (time: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const earlyStart = 7 * 60 + 30; // 07:30
  const earlyEnd = 9 * 60; // 09:00
  
  return timeInMinutes >= earlyStart && timeInMinutes < earlyEnd;
};

// Check if a clinician is available at a specific time
export const isClinicianAvailable = (
  clinicianId: string,
  date: string,
  startTime: string,
  endTime: string,
  appointments: Appointment[],
  specialEvents: SpecialEvent[],
  excludeAppointmentId?: string
): boolean => {
  // Check appointments
  const conflictingAppointments = appointments.filter(apt => 
    apt.clinicianId === clinicianId &&
    apt.date === date &&
    apt.status !== 'cancelled' &&
    apt.id !== excludeAppointmentId &&
    ((apt.timeSlot && timeOverlap(apt.timeSlot.startTime, apt.timeSlot.endTime, startTime, endTime)) ||
     (apt.customStartTime && apt.customEndTime && timeOverlap(apt.customStartTime, apt.customEndTime, startTime, endTime)))
  );
  
  if (conflictingAppointments.length > 0) {
    return false;
  }
  
  // Check special events
  const conflictingEvents = specialEvents.filter(event =>
    event.clinicianIds.includes(clinicianId) &&
    dateTimeOverlap(event.startDateTime, event.endDateTime, `${date}T${startTime}:00`, `${date}T${endTime}:00`)
  );
  
  return conflictingEvents.length === 0;
};

// Check if room has capacity for a time slot
export const hasRoomCapacity = (
  roomId: string,
  date: string,
  timeSlot: TimeSlot,
  appointments: Appointment[],
  rooms: Room[],
  excludeAppointmentId?: string
): boolean => {
  const room = rooms.find(r => r.id === roomId);
  if (!room) return false;
  
  const existingAppointments = appointments.filter(apt =>
    apt.roomId === roomId &&
    apt.date === date &&
    apt.status !== 'cancelled' &&
    apt.id !== excludeAppointmentId &&
    apt.timeSlot?.id === timeSlot.id
  );
  
  return existingAppointments.length < room.capacity;
};

// Helper function to check time overlap
const timeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const [h1, m1] = start1.split(':').map(Number);
  const [h2, m2] = end1.split(':').map(Number);
  const [h3, m3] = start2.split(':').map(Number);
  const [h4, m4] = end2.split(':').map(Number);
  
  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = h2 * 60 + m2;
  const start2Minutes = h3 * 60 + m3;
  const end2Minutes = h4 * 60 + m4;
  
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

// Helper function to check datetime overlap
const dateTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const date1Start = new Date(start1);
  const date1End = new Date(end1);
  const date2Start = new Date(start2);
  const date2End = new Date(end2);
  
  return date1Start < date2End && date2Start < date1End;
};

// Get available time slots for a date and clinician
export const getAvailableTimeSlots = (
  date: string,
  clinicianId: string,
  appointments: Appointment[],
  specialEvents: SpecialEvent[],
  rooms: Room[]
): TimeSlot[] => {
  const allSlots = generateTimeSlots();
  
  return allSlots.filter(slot => {
    // Check if clinician is available
    const clinicianAvailable = isClinicianAvailable(
      clinicianId,
      date,
      slot.startTime,
      slot.endTime,
      appointments,
      specialEvents
    );
    
    if (!clinicianAvailable) return false;
    
    // Check if any room has capacity
    return rooms.some(room => 
      hasRoomCapacity('', date, slot, appointments, rooms)
    );
  });
};

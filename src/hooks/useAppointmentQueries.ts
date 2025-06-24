
import { Appointment } from '@/types/clinical';

export const useAppointmentQueries = (appointments: Appointment[]) => {
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
    getAppointmentsByDate,
    getAppointmentsByClinician
  };
};

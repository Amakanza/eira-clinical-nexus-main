import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { Appointment } from '@/types/clinical';

const Appointments = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<string>();
  const [preselectedTimeSlot, setPreselectedTimeSlot] = useState<string>();
  const [preselectedClinicianId, setPreselectedClinicianId] = useState<string>();

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleNewAppointment = (date?: string, timeSlotId?: string, clinicianId?: string) => {
    setSelectedAppointment(undefined);
    setPreselectedDate(date);
    setPreselectedTimeSlot(timeSlotId);
    setPreselectedClinicianId(clinicianId);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAppointment(undefined);
    setPreselectedDate(undefined);
    setPreselectedTimeSlot(undefined);
    setPreselectedClinicianId(undefined);
  };

  const handleAppointmentSave = (appointment: Appointment) => {
    // The hook handles the state update, we just need to close the form
    console.log('Appointment saved:', appointment);
  };

  return (
    <MainLayout currentPath="/appointments">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">
            Manage patient appointments with 40-minute time slots and room capacity tracking
          </p>
        </div>

        <AppointmentCalendar
          onAppointmentClick={handleAppointmentClick}
          onNewAppointment={handleNewAppointment}
        />

        <AppointmentForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          appointment={selectedAppointment}
          onSave={handleAppointmentSave}
          preselectedDate={preselectedDate}
          preselectedTimeSlot={preselectedTimeSlot}
          preselectedClinicianId={preselectedClinicianId}
        />
      </div>
    </MainLayout>
  );
};

export default Appointments;

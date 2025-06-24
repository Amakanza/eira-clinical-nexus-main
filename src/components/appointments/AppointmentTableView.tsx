
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, User } from 'lucide-react';
import { Appointment, TimeSlot, User as ClinicianType } from '@/types/clinical';
import { useAppointments } from '@/hooks/useAppointments';

interface AppointmentTableViewProps {
  date: string;
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: string, timeSlot?: string, clinicianId?: string) => void;
}

export const AppointmentTableView: React.FC<AppointmentTableViewProps> = ({
  date,
  onAppointmentClick,
  onNewAppointment
}) => {
  const { appointments, timeSlots, clinicians, updateAppointment } = useAppointments();

  console.log('AppointmentTableView - All appointments:', appointments);
  console.log('AppointmentTableView - Date filter:', date);

  const getAppointmentsForSlotAndClinician = (timeSlotId: string, clinicianId: string): Appointment[] => {
    const filtered = appointments.filter(apt => 
      apt.date === date && 
      apt.timeSlot?.id === timeSlotId && 
      apt.clinicianId === clinicianId &&
      apt.status !== 'cancelled'
    );
    console.log(`Appointments for slot ${timeSlotId} and clinician ${clinicianId}:`, filtered);
    return filtered;
  };

  const getEarlyMorningAppointments = (): Appointment[] => {
    const filtered = appointments.filter(apt => 
      apt.date === date && 
      apt.type === 'early-morning' && 
      apt.status !== 'cancelled'
    );
    console.log('Early morning appointments:', filtered);
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus as Appointment['status'] });
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Early Morning Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Early Morning (07:30 - 09:00)</CardTitle>
            <Button
              size="sm"
              onClick={() => onNewAppointment(date)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Early Morning
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {getEarlyMorningAppointments().length > 0 ? (
            <div className="grid gap-2">
              {getEarlyMorningAppointments().map(apt => (
                <div
                  key={apt.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div onClick={() => onAppointmentClick(apt)} className="flex-1">
                    <p className="font-medium">{apt.patientName}</p>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {apt.customStartTime} - {apt.customEndTime}
                    </div>
                    {apt.clinicianName && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        {apt.clinicianName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={apt.status}
                      onValueChange={(value) => handleStatusChange(apt.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No early morning appointments</p>
          )}
        </CardContent>
      </Card>

      {/* Regular Slots Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regular Appointments (09:20 - 16:00)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Time Slot</TableHead>
                {clinicians.map(clinician => (
                  <TableHead key={clinician.id} className="text-center min-w-[200px]">
                    {clinician.firstName} {clinician.lastName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeSlots.map(slot => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">
                    {slot.startTime} - {slot.endTime}
                  </TableCell>
                  {clinicians.map(clinician => {
                    const slotAppointments = getAppointmentsForSlotAndClinician(slot.id, clinician.id);
                    
                    return (
                      <TableCell key={`${slot.id}-${clinician.id}`} className="p-2">
                        <div className="space-y-1">
                          {slotAppointments.map(apt => (
                            <div
                              key={apt.id}
                              className="p-2 bg-blue-50 rounded border hover:bg-blue-100 transition-colors"
                            >
                              <div 
                                onClick={() => onAppointmentClick(apt)}
                                className="cursor-pointer"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium text-sm">{apt.patientName}</p>
                                    <p className="text-xs text-gray-600">{apt.roomName}</p>
                                  </div>
                                </div>
                              </div>
                              <Select
                                value={apt.status}
                                onValueChange={(value) => handleStatusChange(apt.id, value)}
                              >
                                <SelectTrigger className="w-full h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="no-show">No Show</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                          
                          {slotAppointments.length < 4 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-8 text-xs"
                              onClick={() => onNewAppointment(date, slot.id, clinician.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

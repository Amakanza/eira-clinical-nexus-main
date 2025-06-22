
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, User, MapPin } from 'lucide-react';
import { Appointment } from '@/types/clinical';
import { useAppointments } from '@/hooks/useAppointments';

interface AppointmentCalendarProps {
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: string, timeSlot?: string) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onAppointmentClick,
  onNewAppointment
}) => {
  const { appointments, timeSlots } = useAppointments();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const formatDateForComparison = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const getAppointmentsForDate = (date: string): Appointment[] => {
    return appointments.filter(apt => apt.date === date && apt.status !== 'cancelled');
  };

  const getAppointmentsForTimeSlot = (date: string, timeSlotId: string): Appointment[] => {
    return appointments.filter(apt => 
      apt.date === date && 
      apt.timeSlot?.id === timeSlotId && 
      apt.status !== 'cancelled'
    );
  };

  const getEarlyMorningAppointments = (date: string): Appointment[] => {
    return appointments.filter(apt => 
      apt.date === date && 
      apt.type === 'early-morning' && 
      apt.status !== 'cancelled'
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1));
    } else {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    }
  };

  const renderDayView = () => {
    const dateStr = formatDateForComparison(currentDate);
    const dayAppointments = getAppointmentsForDate(dateStr);
    const earlyMorningAppts = getEarlyMorningAppointments(dateStr);

    return (
      <div className="space-y-4">
        {/* Early Morning Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Early Morning (07:30 - 09:00)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earlyMorningAppts.length > 0 ? (
              <div className="space-y-2">
                {earlyMorningAppts.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => onAppointmentClick(apt)}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{apt.patientName}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {apt.customStartTime} - {apt.customEndTime}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <User className="h-4 w-4 mr-1" />
                          {apt.clinicianName}
                        </div>
                      </div>
                      <Badge variant="secondary">{apt.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">No early morning appointments</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNewAppointment(dateStr)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Early Morning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regular Time Slots */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Regular Appointments (09:20 - 16:00)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeSlots.map(slot => {
                const slotAppointments = getAppointmentsForTimeSlot(dateStr, slot.id);
                
                return (
                  <div key={slot.id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-sm">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onNewAppointment(dateStr, slot.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {slotAppointments.length > 0 ? (
                      <div className="grid gap-2">
                        {slotAppointments.map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => onAppointmentClick(apt)}
                            className="p-2 bg-blue-50 rounded-md hover:bg-blue-100 cursor-pointer border"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{apt.patientName}</p>
                                <div className="flex items-center text-xs text-gray-600 mt-1">
                                  <User className="h-3 w-3 mr-1" />
                                  {apt.clinicianName}
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {apt.roomName}
                                </div>
                              </div>
                              <Badge variant={apt.status === 'completed' ? 'default' : 'secondary'}>
                                {apt.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No appointments</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dateStr = formatDateForComparison(day);
          const dayAppointments = getAppointmentsForDate(dateStr);
          
          return (
            <Card key={dateStr} className="min-h-[200px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {format(day, 'EEE dd')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div
                      key={apt.id}
                      onClick={() => onAppointmentClick(apt)}
                      className="p-1 bg-blue-100 rounded text-xs cursor-pointer hover:bg-blue-200"
                    >
                      <p className="font-medium truncate">{apt.patientName}</p>
                      <p className="text-gray-600">
                        {apt.timeSlot ? 
                          apt.timeSlot.startTime : 
                          `${apt.customStartTime}-${apt.customEndTime}`
                        }
                      </p>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{dayAppointments.length - 3} more
                    </p>
                  )}
                  {dayAppointments.length === 0 && (
                    <p className="text-xs text-gray-400">No appointments</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold">
            {viewMode === 'day' 
              ? format(currentDate, 'EEEE, MMMM d, yyyy')
              : `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
            }
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          
          <Button onClick={() => onNewAppointment()}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      {viewMode === 'day' ? renderDayView() : renderWeekView()}
    </div>
  );
};

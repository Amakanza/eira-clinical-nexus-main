
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, User, MapPin, Calendar } from 'lucide-react';
import { Appointment, SpecialEvent } from '@/types/clinical';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentTableView } from './AppointmentTableView';
import { MonthlyView } from './MonthlyView';
import { SpecialEventForm } from './SpecialEventForm';

interface AppointmentCalendarProps {
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: string, timeSlot?: string, clinicianId?: string) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onAppointmentClick,
  onNewAppointment
}) => {
  const { appointments, timeSlots, specialEvents } = useAppointments();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [isSpecialEventFormOpen, setIsSpecialEventFormOpen] = useState(false);
  const [selectedSpecialEvent, setSelectedSpecialEvent] = useState<SpecialEvent | undefined>();

  const formatDateForComparison = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const getAppointmentsForDate = (date: string): Appointment[] => {
    return appointments.filter(apt => apt.date === date && apt.status !== 'cancelled');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const handleSpecialEventSave = (event: SpecialEvent) => {
    console.log('Special event saved:', event);
    setSelectedSpecialEvent(undefined);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
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

  const renderDayView = () => {
    const dateStr = formatDateForComparison(currentDate);
    return (
      <AppointmentTableView
        date={dateStr}
        onAppointmentClick={onAppointmentClick}
        onNewAppointment={(date, timeSlot, clinicianId) => 
          onNewAppointment(date, timeSlot, clinicianId)
        }
      />
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="space-y-4">
        {/* Week days headers */}
        <div className="grid grid-cols-8 gap-2">
          <div className="font-medium text-sm p-2">Time</div>
          {weekDays.map(day => (
            <div key={formatDateForComparison(day)} className="font-medium text-sm p-2 text-center">
              {format(day, 'EEE dd')}
            </div>
          ))}
        </div>

        {/* Early Morning Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Early Morning (07:30 - 09:00)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              <div className="text-sm font-medium">Early</div>
              {weekDays.map(day => {
                const dateStr = formatDateForComparison(day);
                const earlyAppts = getEarlyMorningAppointments(dateStr);
                
                return (
                  <div key={dateStr} className="space-y-1">
                    {earlyAppts.map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => onAppointmentClick(apt)}
                        className="p-1 bg-blue-100 rounded text-xs cursor-pointer hover:bg-blue-200"
                      >
                        <p className="font-medium truncate">{apt.patientName}</p>
                        <p className="text-gray-600">
                          {apt.customStartTime}-{apt.customEndTime}
                        </p>
                      </div>
                    ))}
                    {earlyAppts.length === 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-full text-xs"
                        onClick={() => onNewAppointment(dateStr)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
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
            <div className="space-y-2">
              {timeSlots.map(slot => (
                <div key={slot.id} className="grid grid-cols-8 gap-2 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium">
                    {slot.startTime}
                  </div>
                  {weekDays.map(day => {
                    const dateStr = formatDateForComparison(day);
                    const dayAppointments = getAppointmentsForTimeSlot(dateStr, slot.id);
                    
                    return (
                      <div key={`${dateStr}-${slot.id}`} className="space-y-1">
                        {dayAppointments.slice(0, 2).map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => onAppointmentClick(apt)}
                            className="p-1 bg-blue-100 rounded text-xs cursor-pointer hover:bg-blue-200"
                          >
                            <p className="font-medium truncate">{apt.patientName}</p>
                            <p className="text-gray-600 truncate">{apt.clinicianName}</p>
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{dayAppointments.length - 2} more
                          </p>
                        )}
                        {dayAppointments.length === 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-full text-xs"
                            onClick={() => onNewAppointment(dateStr, slot.id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <MonthlyView
        currentDate={currentDate}
        onDateClick={handleDateClick}
        onAppointmentClick={onAppointmentClick}
      />
    );
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        return `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Title */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold">
          {getViewTitle()}
        </h2>
      </div>

      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
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
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          
          <div className="h-4 w-px bg-gray-300" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSpecialEventFormOpen(true)}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Special Event
          </Button>
          
          <Button onClick={() => onNewAppointment()}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

      {/* Special Event Form */}
      <SpecialEventForm
        isOpen={isSpecialEventFormOpen}
        onClose={() => {
          setIsSpecialEventFormOpen(false);
          setSelectedSpecialEvent(undefined);
        }}
        event={selectedSpecialEvent}
        onSave={handleSpecialEventSave}
      />
    </div>
  );
};

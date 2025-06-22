
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { Appointment } from '@/types/clinical';
import { useAppointments } from '@/hooks/useAppointments';

interface MonthlyViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  onDateClick,
  onAppointmentClick
}) => {
  const { appointments } = useAppointments();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dateStr && apt.status !== 'cancelled');
  };

  const getStatusCount = (appointments: Appointment[]) => {
    const counts = {
      scheduled: 0,
      completed: 0,
      'no-show': 0,
      'in-progress': 0
    };
    
    appointments.forEach(apt => {
      if (apt.status in counts) {
        counts[apt.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };

  // Create a grid of 6 weeks (42 days) to properly display the calendar
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    calendarDays.push(day);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day);
              const statusCounts = getStatusCount(dayAppointments);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={index}
                  onClick={() => onDateClick(day)}
                  className={`
                    min-h-[100px] p-1 border rounded cursor-pointer hover:bg-gray-50 transition-colors
                    ${!isCurrentMonth ? 'bg-gray-100 text-gray-400' : ''}
                    ${isDayToday ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isDayToday ? 'text-blue-600' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {dayAppointments.length > 0 && (
                    <div className="space-y-1">
                      {/* Show first few appointments */}
                      {dayAppointments.slice(0, 2).map(apt => (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(apt);
                          }}
                          className="text-xs p-1 bg-blue-100 rounded truncate hover:bg-blue-200"
                        >
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {apt.timeSlot ? 
                              apt.timeSlot.startTime : 
                              apt.customStartTime
                            }
                          </div>
                          <div className="truncate font-medium">
                            {apt.patientName}
                          </div>
                        </div>
                      ))}
                      
                      {/* Show count if more appointments */}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-600 text-center">
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                      
                      {/* Status summary */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {statusCounts.completed > 0 && (
                          <Badge variant="default" className="text-xs px-1 py-0 bg-green-100 text-green-800">
                            ✓{statusCounts.completed}
                          </Badge>
                        )}
                        {statusCounts['no-show'] > 0 && (
                          <Badge variant="default" className="text-xs px-1 py-0 bg-orange-100 text-orange-800">
                            ✗{statusCounts['no-show']}
                          </Badge>
                        )}
                      </div>
                    </div>
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

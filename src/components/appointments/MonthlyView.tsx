
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
                    <div className="flex items-center justify-center mt-2">
                      <div className="p-2 bg-blue-100 rounded text-lg font-bold text-blue-800">
                        {dayAppointments.length}
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

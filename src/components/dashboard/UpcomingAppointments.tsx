
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  duration: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'John Smith',
    time: '9:00 AM',
    type: 'Follow-up Consultation',
    status: 'scheduled',
    location: 'Room 101',
    duration: '30 min'
  },
  {
    id: '2',
    patientName: 'Emma Johnson',
    time: '10:30 AM',
    type: 'Initial Consultation',
    status: 'scheduled',
    location: 'Room 203',
    duration: '45 min'
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    time: '2:00 PM',
    type: 'Procedure Review',
    status: 'in-progress',
    location: 'Room 105',
    duration: '20 min'
  },
  {
    id: '4',
    patientName: 'Sarah Davis',
    time: '3:30 PM',
    type: 'Therapy Session',
    status: 'scheduled',
    location: 'Room 301',
    duration: '60 min'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'in-progress': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const UpcomingAppointments = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Today's Appointments
        </CardTitle>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {appointment.patientName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.patientName}
                    </p>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {appointment.type}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {appointment.time} ({appointment.duration})
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {appointment.location}
                    </div>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Start Appointment</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem>Cancel</DropdownMenuItem>
                  <DropdownMenuItem>Patient Details</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

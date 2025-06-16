
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  UserPlus, 
  Calendar, 
  Edit,
  Clock
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'note' | 'patient' | 'appointment' | 'edit';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status?: 'completed' | 'pending' | 'draft';
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'note',
    title: 'Progress Note - John Smith',
    description: 'Completed clinical assessment and treatment plan',
    timestamp: '2 minutes ago',
    user: 'Dr. Sarah Wilson',
    status: 'completed'
  },
  {
    id: '2',
    type: 'patient',
    title: 'New Patient Registration',
    description: 'Emma Johnson registered for cardiology consultation',
    timestamp: '15 minutes ago',
    user: 'Nurse Jennifer',
    status: 'completed'
  },
  {
    id: '3',
    type: 'appointment',
    title: 'Appointment Scheduled',
    description: 'Follow-up appointment for Michael Brown',
    timestamp: '1 hour ago',
    user: 'Reception Desk',
    status: 'completed'
  },
  {
    id: '4',
    type: 'edit',
    title: 'Note Amendment',
    description: 'Updated medication list for Patricia Davis',
    timestamp: '2 hours ago',
    user: 'Dr. Mark Thompson',
    status: 'pending'
  },
  {
    id: '5',
    type: 'note',
    title: 'Discharge Summary',
    description: 'Draft discharge summary for Robert Wilson',
    timestamp: '3 hours ago',
    user: 'Dr. Sarah Wilson',
    status: 'draft'
  }
];

const getIcon = (type: string) => {
  switch (type) {
    case 'note': return FileText;
    case 'patient': return UserPlus;
    case 'appointment': return Calendar;
    case 'edit': return Edit;
    default: return Clock;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'draft': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <p className="text-xs text-gray-500">
                          {activity.user} • {activity.timestamp}
                        </p>
                        {activity.status && (
                          <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

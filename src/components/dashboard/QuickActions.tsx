
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Search,
  Clock,
  Users
} from 'lucide-react';

const quickActions = [
  {
    id: 'new-note',
    title: 'New Clinical Note',
    description: 'Create a new patient note',
    icon: FileText,
    color: 'bg-blue-600 hover:bg-blue-700',
    action: () => console.log('New note')
  },
  {
    id: 'new-patient',
    title: 'Register Patient',
    description: 'Add new patient to system',
    icon: Users,
    color: 'bg-green-600 hover:bg-green-700',
    action: () => console.log('New patient')
  },
  {
    id: 'schedule',
    title: 'Schedule Appointment',
    description: 'Book new appointment',
    icon: Calendar,
    color: 'bg-purple-600 hover:bg-purple-700',
    action: () => console.log('Schedule')
  },
  {
    id: 'search',
    title: 'Advanced Search',
    description: 'Find patients or records',
    icon: Search,
    color: 'bg-gray-600 hover:bg-gray-700',
    action: () => console.log('Search')
  }
];

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                onClick={action.action}
              >
                <div className="flex items-center space-x-2 w-full">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

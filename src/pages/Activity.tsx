
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, FileText, Calendar } from 'lucide-react';

const Activity = () => {
  return (
    <MainLayout currentPath="/activity">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recent Activity</h1>
          <p className="text-gray-600">Track recent actions and system activity</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Activity Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <User className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">New patient registered</p>
                    <p className="text-sm text-gray-500">John Doe - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">Clinical note completed</p>
                    <p className="text-sm text-gray-500">MSK Evaluation - 3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="font-medium">Appointment scheduled</p>
                    <p className="text-sm text-gray-500">Follow-up visit - 4 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Activity;

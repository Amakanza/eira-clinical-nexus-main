
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

const Appointments = () => {
  return (
    <MainLayout currentPath="/appointments">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Schedule Appointment</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Appointment Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Appointment scheduling functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Appointments;

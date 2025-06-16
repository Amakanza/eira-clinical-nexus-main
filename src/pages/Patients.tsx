
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

const Patients = () => {
  return (
    <MainLayout currentPath="/patients">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Register Patient</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Patient Directory</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Patient management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Patients;

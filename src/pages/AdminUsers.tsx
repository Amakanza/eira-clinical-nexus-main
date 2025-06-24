
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User, Plus } from 'lucide-react';
import { ClinicianBadge } from '@/components/ui/clinician-badge';
import { useState } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

const AdminUsers = () => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Mock user data with clinician colors
  const mockUsers = [
    {
      id: '1',
      firstName: 'Dr. Michael',
      lastName: 'Wilson',
      email: 'michael@clinic.com',
      role: 'Administrator',
      initials: 'MW',
      clinicianColor: '#EF4444'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Thompson',
      email: 'sarah@clinic.com',
      role: 'Physiotherapist',
      initials: 'ST',
      clinicianColor: '#3B82F6'
    }
  ];

  if (showRegisterForm) {
    return <RegisterForm />;
  }

  return (
    <MainLayout currentPath="/admin/users">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => setShowRegisterForm(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>System Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <ClinicianBadge 
                        clinician={user}
                        size="md"
                      />
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.role}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Button 
            variant="outline" 
            onClick={() => setShowRegisterForm(false)}
            className="w-full"
          >
            Back to User List
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminUsers;

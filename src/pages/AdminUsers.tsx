
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User, Plus } from 'lucide-react';
import { ClinicianBadge } from '@/components/ui/clinician-badge';
import { useState, useEffect } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';

const AdminUsers = () => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { currentUser } = useAuth();
  const { clinicians, loading, error } = useSupabaseAppointments();

  // Add current user to the list if they're an admin or supervisor and not already in clinicians
  const allUsers = [...clinicians];
  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor') && !clinicians.find(c => c.id === currentUser.id)) {
    allUsers.unshift(currentUser);
  }

  if (showRegisterForm) {
    return <RegisterForm onBack={() => setShowRegisterForm(false)} />;
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
              {loading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">Error loading users: {error}</div>
              ) : (
                <div className="space-y-4">
                  {allUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <ClinicianBadge 
                          clinician={user}
                          size="md"
                        />
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                          {user.username && (
                            <p className="text-xs text-gray-400">@{user.username}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminUsers;

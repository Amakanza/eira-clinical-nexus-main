
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/clinical';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canEditNotes: () => boolean;
  canViewBilling: () => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@clinic.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'admin',
    department: 'Administration',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'clinician@clinic.com',
    firstName: 'Dr. Sarah',
    lastName: 'Thompson',
    role: 'clinician',
    department: 'Physiotherapy',
    license: 'PT12345',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-3',
    email: 'supervisor@clinic.com',
    firstName: 'Dr. Michael',
    lastName: 'Wilson',
    role: 'supervisor',
    department: 'Clinical Services',
    license: 'MD67890',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Mock authentication - in real app, this would be an API call
      const user = mockUsers.find(u => u.email === email);
      if (user && password === 'password') { // Simple mock password
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    switch (permission) {
      case 'view_patients':
        return ['admin', 'clinician', 'supervisor'].includes(currentUser.role);
      case 'edit_notes':
        return ['clinician', 'supervisor'].includes(currentUser.role);
      case 'view_billing':
        return ['admin', 'supervisor'].includes(currentUser.role);
      case 'comment_notes':
        return currentUser.role === 'supervisor';
      default:
        return false;
    }
  };

  const canEditNotes = (): boolean => {
    return hasPermission('edit_notes');
  };

  const canViewBilling = (): boolean => {
    return hasPermission('view_billing');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      hasPermission,
      canEditNotes,
      canViewBilling,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

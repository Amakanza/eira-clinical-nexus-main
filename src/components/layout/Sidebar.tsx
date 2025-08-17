
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  Home,
  Clock,
  Archive,
  Shield,
  DollarSign,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  currentPath?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'clinician', 'supervisor'] },
  { name: 'Patients', href: '/patients', icon: Users, roles: ['admin', 'clinician', 'supervisor'] },
  { name: 'Clinical Notes', href: '/notes', icon: FileText, roles: ['admin', 'clinician', 'supervisor'] },
  { name: 'Appointments', href: '/appointments', icon: Calendar, roles: ['admin', 'clinician', 'supervisor'] },
  { name: 'Recent Activity', href: '/activity', icon: Clock, roles: ['admin', 'clinician', 'supervisor'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'clinician', 'supervisor'] },
  { name: 'Archive', href: '/archive', icon: Archive, roles: ['admin', 'clinician', 'supervisor'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['admin', 'clinician', 'supervisor'] },
];

const billingNavigation = [
  { name: 'Billing', href: '/billing', icon: DollarSign },
  { name: 'Reports', href: '/billing/reports', icon: Receipt },
];

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: Shield },
];

export const Sidebar = ({ isOpen, currentPath }: SidebarProps) => {
  const location = useLocation();
  const { currentUser, hasPermission } = useAuth();
  const activePath = currentPath || location.pathname;
  
  const isActive = (path: string) => activePath === path;

  const canViewItem = (roles?: string[]) => {
    if (!roles || !currentUser) return true;
    return roles.includes(currentUser.role);
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        'flex items-center p-4 border-b border-gray-200',
        !isOpen && 'justify-center px-2'
      )}>
        <img 
          src="/eira-logo.svg" 
          alt="Eira Notes" 
          className={cn(
            'transition-all duration-300',
            isOpen ? 'h-8 w-8' : 'h-6 w-6'
          )}
        />
        {isOpen && (
          <span className="ml-3 text-lg font-bold text-gray-900">Eira Notes</span>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.filter(item => canViewItem(item.roles)).map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-10',
                  isActive(item.href) && 'bg-blue-50 text-blue-700 border-blue-200',
                  !isOpen && 'justify-center px-2'
                )}
              >
                <Icon className={cn('h-5 w-5', isOpen && 'mr-3')} />
                {isOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Button>
            </Link>
          );
        })}

        {/* Billing Section - Only for Admin and Supervisor */}
        {hasPermission('view_billing') && isOpen && (
          <div className="pt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Billing
            </h3>
            <div className="mt-2 space-y-1">
              {billingNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive(item.href) ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start h-10',
                        isActive(item.href) && 'bg-blue-50 text-blue-700 border-blue-200'
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Admin Section */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && isOpen && (
          <div className="pt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </h3>
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive(item.href) ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start h-10',
                        isActive(item.href) && 'bg-blue-50 text-blue-700 border-blue-200'
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <div className={cn(
          'flex items-center space-x-2 p-2 rounded-lg bg-green-50',
          !isOpen && 'justify-center'
        )}>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          {isOpen && (
            <div>
              <p className="text-xs font-medium text-green-800">System Online</p>
              <p className="text-xs text-green-600">Sync: Active</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

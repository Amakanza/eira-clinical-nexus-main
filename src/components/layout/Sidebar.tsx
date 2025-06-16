
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  Home,
  Clock,
  Archive,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  currentPath?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Clinical Notes', href: '/notes', icon: FileText },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Recent Activity', href: '/activity', icon: Clock },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Archive', href: '/archive', icon: Archive },
];

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: Shield },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, currentPath = '/' }: SidebarProps) => {
  const isActive = (path: string) => currentPath === path;

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
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
          );
        })}

        {/* Admin Section */}
        {isOpen && (
          <div className="pt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </h3>
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start h-10',
                      isActive(item.href) && 'bg-blue-50 text-blue-700 border-blue-200'
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Button>
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

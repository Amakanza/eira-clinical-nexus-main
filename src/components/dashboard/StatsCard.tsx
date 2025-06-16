
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor = 'text-blue-600',
  description 
}: StatsCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        {change && (
          <p className="text-xs text-gray-600 flex items-center">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2',
                change.trend === 'up' && 'bg-green-100 text-green-800',
                change.trend === 'down' && 'bg-red-100 text-red-800',
                change.trend === 'neutral' && 'bg-gray-100 text-gray-800'
              )}
            >
              {change.value}
            </span>
            from last week
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

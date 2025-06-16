
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';

const Index = () => {
  return (
    <MainLayout currentPath="/">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Dr. Wilson</h1>
          <p className="text-blue-100">
            Today is Monday, June 16, 2025. You have 8 appointments scheduled and 3 notes pending review.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Patients"
            value="1,247"
            change={{ value: "+12%", trend: "up" }}
            icon={Users}
            iconColor="text-blue-600"
            description="Active patient records"
          />
          <StatsCard
            title="Notes Today"
            value="23"
            change={{ value: "+8%", trend: "up" }}
            icon={FileText}
            iconColor="text-green-600"
            description="Clinical notes created"
          />
          <StatsCard
            title="Appointments"
            value="8"
            change={{ value: "0%", trend: "neutral" }}
            icon={Calendar}
            iconColor="text-purple-600"
            description="Scheduled for today"
          />
          <StatsCard
            title="Pending Reviews"
            value="3"
            change={{ value: "-25%", trend: "down" }}
            icon={Clock}
            iconColor="text-orange-600"
            description="Notes awaiting review"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointments */}
          <div className="lg:col-span-2">
            <UpcomingAppointments />
          </div>
          
          {/* Right Column - Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />

        {/* System Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">All Systems Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Last Sync: 2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Performance: Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;

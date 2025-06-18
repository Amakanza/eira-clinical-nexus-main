
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive as ArchiveIcon, FileText, User } from 'lucide-react';

const Archive = () => {
  return (
    <MainLayout currentPath="/archive">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Archive</h1>
          <p className="text-gray-600">View archived patients and clinical records</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArchiveIcon className="h-5 w-5" />
                <span>Archived Records</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <User className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Archived 2 weeks ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium">Clinical Note #1234</p>
                    <p className="text-sm text-gray-500">Archived 1 month ago</p>
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

export default Archive;

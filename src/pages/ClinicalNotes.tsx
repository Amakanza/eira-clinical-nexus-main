
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

const ClinicalNotes = () => {
  return (
    <MainLayout currentPath="/notes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Clinical Notes</h1>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Note</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Clinical notes functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ClinicalNotes;

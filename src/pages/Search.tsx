
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  return (
    <MainLayout currentPath="/search">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Search</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SearchIcon className="h-5 w-5" />
              <span>Search Patients & Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input placeholder="Search patients, notes, appointments..." className="flex-1" />
              <Button>
                <SearchIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600">Advanced search functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Search;


import { MainLayout } from '@/components/layout/MainLayout';
import ReportsPage from "@/components/reports/ReportsPage";

const Reports = () => {
  return (
    <MainLayout currentPath="/reports">
      <ReportsPage />
    </MainLayout>
  );
};

export default Reports;

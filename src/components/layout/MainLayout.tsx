
import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export const MainLayout = ({ children, currentPath }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} currentPath={currentPath} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

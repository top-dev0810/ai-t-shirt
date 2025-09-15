'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import Gallery from './Gallery';
import Orders from './Orders';
import AdminDashboard from './AdminDashboard';
import VerifyOrdersPage from '../app/verify-orders/page';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LoadingSpinner from './LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type ViewType = 'chat' | 'gallery' | 'orders' | 'admin' | 'order-verification';

export default function MainLayout() {
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { accountState, loading: adminLoading } = useAdminAuth();
  const router = useRouter();

  // Redirect inactive admin accounts to 404 page
  useEffect(() => {
    if (accountState === 'inactive') {
      router.push('/not-found');
    }
  }, [accountState, router]);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  // Show loading spinner while admin status is being checked
  if (adminLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner
          size="xl"
          text="Loading Application"
          subtext="Please wait while we verify your access..."
        />
      </div>
    );
  }


  const renderContent = () => {
    switch (currentView) {
      case 'gallery':
        return <Gallery />;
      case 'orders':
        return <Orders />;
      case 'admin':
        return <AdminDashboard initialTab="overview" />;
      case 'order-verification':
        return <VerifyOrdersPage />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {renderContent()}
          </div>
          {/* Footer */}
          <footer className="mt-auto py-8 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <p className="text-sm">
                  © 2024 Band Adda AI T-Shirt Designer. All rights reserved.
                </p>
                <p className="text-xs mt-2">
                  Powered by AI • Made with ❤️ for music lovers
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}


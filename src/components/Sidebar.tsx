'use client';

import { X, ShoppingBag, Image, Plus, BarChart3 } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';

type ViewType = 'chat' | 'gallery' | 'orders' | 'admin' | 'order-verification';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ isOpen, onClose, currentView, onViewChange }: SidebarProps) {
  const { isAdmin, accountState, loading: adminLoading } = useAdminAuth();

  const navigation = [
    { name: 'New Design', icon: Plus, view: 'chat' as ViewType },
    { name: 'My Orders', icon: ShoppingBag, view: 'orders' as ViewType },
    { name: 'Design Gallery', icon: Image, view: 'gallery' as ViewType },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', icon: BarChart3, view: 'admin' as ViewType },
    { name: 'Order Verification', icon: BarChart3, view: 'order-verification' as ViewType },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-end px-6 py-3">
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-2 space-y-3">
            {/* User Page Label for Admin Users */}
            {!adminLoading && isAdmin && (
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                User Pages
              </div>
            )}
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => onViewChange(item.view)}
                className={cn(
                  'w-full flex items-center gap-3 px-5 py-3 rounded-xl text-base font-medium transition-all duration-200',
                  currentView === item.view
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                )}
              >
                <item.icon className="h-6 w-6" />
                {item.name}
              </button>
            ))}

            {/* Admin Navigation - Only show for active admin accounts */}
            {!adminLoading && isAdmin && accountState === 'active' && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Admin Panel
                </div>
                {adminNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => onViewChange(item.view)}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-3 rounded-xl text-base font-medium transition-all duration-200',
                      currentView === item.view
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    {item.name}
                  </button>
                ))}
              </>
            )}

            {/* Suspended Admin Notice */}
            {!adminLoading && accountState === 'suspended' && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider mb-1">
                    Account Status
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your admin account is suspended. You have limited access.
                  </div>
                </div>
              </>
            )}
          </nav>


        </div>
      </div>
    </>
  );
}

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEffect, useState } from 'react';
import { AlertTriangle, Home, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    const { user, logout } = useAuth();
    const { accountState, adminUser } = useAdminAuth();
    const [isInactiveAdmin, setIsInactiveAdmin] = useState(false);

    useEffect(() => {
        if (user && accountState === 'inactive' && adminUser) {
            setIsInactiveAdmin(true);
        }
    }, [user, accountState, adminUser]);

    const handleSignOut = async () => {
        logout();
    };

    if (isInactiveAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="mb-6">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Account Inactive
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your admin account has been deactivated. You cannot access any pages.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>

                        <Link
                            href="/"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Go to Home
                        </Link>
                    </div>

                    <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            If you believe this is an error, please contact the system administrator.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Regular 404 page
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Page Not Found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        The page you&apos;re looking for doesn&apos;t exist.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
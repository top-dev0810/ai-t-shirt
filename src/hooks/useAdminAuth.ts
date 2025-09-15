'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface AdminUser {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    account_state: 'active' | 'suspended' | 'inactive';
    created_at: string;
    updated_at: string;
}

export function useAdminAuth() {
    const { user, isLoading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [adminLoading, setAdminLoading] = useState(false);
    const [accountState, setAccountState] = useState<'none' | 'active' | 'suspended' | 'inactive'>('none');

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (authLoading) return;

            if (!user?.email) {
                setIsAdmin(false);
                setAdminUser(null);
                setAccountState('none');
                setAdminLoading(false);
                return;
            }

            setAdminLoading(true);
            try {
                const response = await fetch(`/api/admin/check-status?email=${encodeURIComponent(user.email)}`);
                const result = await response.json();

                setAccountState(result.accountState || 'none');

                if (result.success && result.isAdmin) {
                    setIsAdmin(true);
                    setAdminUser(result.adminUser);
                } else {
                    setIsAdmin(false);
                    setAdminUser(result.adminUser || null);
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
                setAdminUser(null);
                setAccountState('none');
            } finally {
                setAdminLoading(false);
            }
        };

        checkAdminStatus();
    }, [user?.email, authLoading]);

    return {
        isAdmin,
        adminUser,
        accountState,
        loading: authLoading || adminLoading,
        user
    };
}

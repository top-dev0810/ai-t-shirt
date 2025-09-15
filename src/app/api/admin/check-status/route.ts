import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';

export async function GET(request: Request) {
    try {
        // Get the user email from query parameters
        const url = new URL(request.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return NextResponse.json({
                success: false,
                isAdmin: false,
                message: 'Email parameter required'
            });
        }

        // Check if user is admin
        const adminUser = await DatabaseService.getAdminByEmail(email);

        if (adminUser) {
            // Check admin account state using account_state field
            if (adminUser.account_state === 'inactive') {
                return NextResponse.json({
                    success: true,
                    isAdmin: false,
                    message: 'Admin account is inactive',
                    accountState: 'inactive'
                });
            } else if (adminUser.account_state === 'suspended') {
                return NextResponse.json({
                    success: true,
                    isAdmin: false, // Treat as regular user
                    message: 'Admin account is suspended - limited access',
                    accountState: 'suspended',
                    adminUser: {
                        id: adminUser.id,
                        username: adminUser.username,
                        email: adminUser.email,
                        role: adminUser.role,
                        is_active: adminUser.is_active,
                        account_state: adminUser.account_state,
                        created_at: adminUser.created_at,
                        updated_at: adminUser.updated_at
                    }
                });
            } else if (adminUser.account_state === 'active') {
                return NextResponse.json({
                    success: true,
                    isAdmin: true,
                    message: 'Admin access granted',
                    accountState: 'active',
                    adminUser: {
                        id: adminUser.id,
                        username: adminUser.username,
                        email: adminUser.email,
                        role: adminUser.role,
                        is_active: adminUser.is_active,
                        account_state: adminUser.account_state,
                        created_at: adminUser.created_at,
                        updated_at: adminUser.updated_at
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            isAdmin: false,
            message: 'User is not an admin',
            accountState: 'none'
        });
    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json({
            success: false,
            isAdmin: false,
            message: 'Error checking admin status'
        }, { status: 500 });
    }
}

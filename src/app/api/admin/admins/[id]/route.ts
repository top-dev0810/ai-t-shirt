import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const data = await request.json();
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        // Get the current admin's ID from the request headers or session
        const currentAdminId = data.currentAdminId;

        // Prevent admins from updating their own data
        if (currentAdminId && currentAdminId === id) {
            return NextResponse.json({
                success: false,
                message: 'You cannot update your own admin data'
            }, { status: 403 });
        }

        const admin = await DatabaseService.updateAdmin(id, {
            username: data.username,
            email: data.email,
            is_active: data.is_active,
            account_state: data.account_state
        });

        return NextResponse.json({
            success: true,
            admin
        });
    } catch (error) {
        console.error('Error updating admin:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update admin'
        }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        // Get the current admin's ID from the request body
        const body = await request.json().catch(() => ({}));
        const currentAdminId = body.currentAdminId;

        // Prevent admins from deleting their own data
        if (currentAdminId && currentAdminId === id) {
            return NextResponse.json({
                success: false,
                message: 'You cannot delete your own admin account'
            }, { status: 403 });
        }

        await DatabaseService.deleteAdmin(id);

        return NextResponse.json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete admin'
        }, { status: 500 });
    }
}

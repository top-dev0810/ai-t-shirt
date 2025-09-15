import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';

export async function GET() {
    try {
        const admins = await DatabaseService.getAllAdmins();
        return NextResponse.json({
            success: true,
            admins
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch admins'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        if (!data.username || !data.email) {
            return NextResponse.json({
                success: false,
                message: 'Username and email are required'
            }, { status: 400 });
        }

        const admin = await DatabaseService.createAdmin({
            username: data.username,
            email: data.email,
            role: data.role || 'admin',
            account_state: data.account_state || 'active'
        });

        return NextResponse.json({
            success: true,
            admin
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create admin'
        }, { status: 500 });
    }
}

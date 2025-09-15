import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';

export async function GET() {
    try {
        const result = await DatabaseService.testConnection();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: `Database test failed: ${error}` },
            { status: 500 }
        );
    }
}

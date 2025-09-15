import { NextResponse } from 'next/server';
import { ftpNativeService } from '@/lib/services/ftpNative';

export async function GET() {
    try {
        console.log('Testing FTP connection...');

        const result = await ftpNativeService.testConnection();

        return NextResponse.json({
            success: result.success,
            message: result.message,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('FTP test error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}

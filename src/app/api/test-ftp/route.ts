import { NextRequest, NextResponse } from 'next/server';
import { serverFtpService } from '@/lib/services/ftpServer';

export async function GET() {
    try {
        console.log('Testing FTP connection...');

        const result = await serverFtpService.testConnection();

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

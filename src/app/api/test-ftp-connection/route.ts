import { NextResponse } from 'next/server';
import { serverFtpService } from '@/lib/services/ftpServer';

export async function GET() {
    try {
        console.log('🔄 API: Testing FTP connection...');

        // Check FTP configuration
        const ftpHost = process.env.FTP_HOST;
        const ftpUsername = process.env.FTP_USERNAME;
        const ftpPassword = process.env.FTP_PASSWORD;

        console.log('🔄 API: FTP Configuration check:', {
            host: ftpHost ? 'Set' : 'Missing',
            username: ftpUsername ? 'Set' : 'Missing',
            password: ftpPassword ? 'Set' : 'Missing'
        });

        if (!ftpHost || !ftpUsername || !ftpPassword) {
            return NextResponse.json({
                success: false,
                message: 'FTP configuration missing',
                details: {
                    host: !!ftpHost,
                    username: !!ftpUsername,
                    password: !!ftpPassword
                }
            }, { status: 500 });
        }

        // Test FTP connection
        const result = await serverFtpService.testConnection();

        return NextResponse.json({
            success: result.success,
            message: result.message,
            ftpConfig: {
                host: ftpHost,
                username: ftpUsername,
                password: ftpPassword ? '***' : 'Missing'
            }
        });

    } catch (error) {
        console.error('❌ API: FTP connection test failed:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            error: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}

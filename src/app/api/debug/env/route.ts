import { NextResponse } from 'next/server';

export async function GET() {
    // Only allow this in development or with a special key
    if (process.env.NODE_ENV === 'production' && process.env.DEBUG_KEY !== 'your-debug-key') {
        return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    const envCheck = {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
        DB_HOST: process.env.DB_HOST ? '✅ Set' : '❌ Missing',
        DB_NAME: process.env.DB_NAME ? '✅ Set' : '❌ Missing',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing',
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing',
    };

    return NextResponse.json({
        message: 'Environment Variables Check',
        environment: envCheck,
        timestamp: new Date().toISOString(),
        platform: process.platform,
        nodeVersion: process.version,
    });
}

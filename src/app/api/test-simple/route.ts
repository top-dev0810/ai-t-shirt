import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Simple test endpoint working',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
            GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
            NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
        },
        timestamp: new Date().toISOString(),
    });
}

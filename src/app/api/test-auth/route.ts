import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Check if we can import NextAuth without errors
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
        const NextAuth = require('next-auth');

        return NextResponse.json({
            success: true,
            message: 'NextAuth can be imported successfully',
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
                GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
                GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
    }
}

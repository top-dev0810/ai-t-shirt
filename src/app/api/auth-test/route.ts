import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Test if we can import NextAuth
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
        const NextAuth = require('next-auth');
        
        return NextResponse.json({
            success: true,
            message: 'NextAuth can be imported',
            env: {
                NODE_ENV: process.env.NODE_ENV,
                GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
                GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

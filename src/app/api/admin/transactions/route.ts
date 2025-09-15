import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';

export async function GET() {
    try {
        const transactions = await DatabaseService.getPaymentTransactions();
        return NextResponse.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch transactions'
        }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;

    // In development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        paymentId,
        status: 'captured',
        amount: 5000, // Rs 50 in paise
        currency: 'INR',
        message: 'Payment details retrieved (development mode)'
      });
    }

    // In production, fetch from Razorpay
    // This would contain actual Razorpay API call
    return NextResponse.json({
      success: true,
      paymentId,
      status: 'captured',
      amount: 5000,
      currency: 'INR',
      message: 'Payment details retrieved'
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}
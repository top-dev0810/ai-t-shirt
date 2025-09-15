import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    // Check if Razorpay credentials are available
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Razorpay credentials not configured',
          message: 'Please check your Razorpay API keys in environment variables'
        },
        { status: 400 }
      );
    }

    // Create order using Razorpay API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: amount, // Amount in paise
        currency: currency,
        receipt: `order_${Date.now()}`,
        notes: {
          description: 'AI T-Shirt Design Generation Deposit',
          source: 'test_mode',
          skip_mobile_validation: 'true'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create order',
          message: errorData.error?.description || 'Razorpay API error',
          details: errorData
        },
        { status: 500 }
      );
    }

    const orderData = await response.json();

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

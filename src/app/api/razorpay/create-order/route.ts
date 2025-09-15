import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    // Create order using Razorpay API (Test Mode)
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET}`).toString('base64')}`
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
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const orderData = await response.json();

    return NextResponse.json({
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

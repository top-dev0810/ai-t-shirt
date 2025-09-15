import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
});

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Create a new order
export async function createOrder(amount: number, receipt: string): Promise<PaymentOrder> {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: receipt,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);

    return {
      id: order.id,
      amount: amount,
      currency: 'INR',
      receipt: receipt,
      status: order.status,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}

// Verify payment signature
export async function verifyPaymentSignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<boolean> {
  const crypto = await import('crypto');
  const secret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!;
  
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return expectedSignature === razorpay_signature;
}

// Get order details
export async function getOrderDetails(orderId: string): Promise<unknown> {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error('Failed to fetch order details');
  }
}

// Refund payment
export async function refundPayment(paymentId: string, amount: number): Promise<unknown> {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Amount in paise
    });
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
}
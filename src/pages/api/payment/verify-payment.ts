import { NextApiRequest, NextApiResponse } from 'next';
import { verifyPaymentSignature } from '@/lib/services/razorpay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

    const isValid = await verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

        if (isValid) {
            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Invalid payment signature',
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
        });
    }
}

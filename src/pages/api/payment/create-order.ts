import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder } from '@/lib/services/razorpay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, receipt } = req.body;

        if (!amount || !receipt) {
            return res.status(400).json({ error: 'Amount and receipt are required' });
        }

        const order = await createOrder(amount, receipt);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment order'
        });
    }
}

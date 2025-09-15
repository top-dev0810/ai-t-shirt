# Razorpay Test Mode Setup Guide

## Current Issue
Your Razorpay configuration is currently in **LIVE MODE** but you're trying to test with test card credentials. Test cards only work in **TEST MODE**.

## Solution: Switch to Test Mode

### Step 1: Get Test Mode Credentials
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to **Test Mode** (toggle in top-right corner)
3. Go to **Settings** → **API Keys**
4. Generate new **Test API Keys** if you don't have them

### Step 2: Update Environment Variables
Update your `.env.local` file with **TEST MODE** credentials:

```env
# Razorpay TEST MODE Credentials (NOT LIVE MODE)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

**Important:** 
- Test keys start with `rzp_test_`
- Live keys start with `rzp_live_`
- Make sure you're using TEST keys, not LIVE keys

### Step 3: Test Card Credentials
Use these test card details for testing:

#### Successful Payment:
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)
- **Name:** Any name

#### Failed Payment:
- **Card Number:** 4000 0000 0000 0002
- **Expiry:** Any future date
- **CVV:** Any 3 digits

### Step 4: Test the Payment Flow
1. Start the development server: `npm run dev`
2. Go to the app and try to create a design
3. When payment modal opens, use the test card credentials above
4. Payment should work successfully in test mode

### Step 5: Verify Test Mode
- Check Razorpay Dashboard → **Test Mode** → **Payments**
- You should see test payments appearing there
- No real money will be charged

## Current Configuration Status
✅ API routes updated for test mode
✅ PaymentModal updated for test mode
❌ **You need to update your `.env.local` with TEST credentials**

## Next Steps
1. Get test credentials from Razorpay Dashboard
2. Update `.env.local` file
3. Restart the development server
4. Test with the provided test card credentials

## Troubleshooting
- If payment still fails, double-check you're using `rzp_test_` keys
- Make sure you're in Test Mode on Razorpay Dashboard
- Clear browser cache and try again
- Check browser console for any error messages

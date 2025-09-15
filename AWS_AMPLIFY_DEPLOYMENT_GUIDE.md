# 🚀 **AWS Amplify Deployment Guide for ai.bandadda.com**

## **Perfect Solution for Your Client's Requirements**

Your client wants:
- ✅ **Next.js latest version** (You have Next.js 15.4.7)
- ✅ **Tailwind CSS** (You have Tailwind v3.4.0)
- ✅ **Hosted on ai.bandadda.com**
- ✅ **Deployment via GitHub**
- ✅ **AWS Amplify hosting**

---

## **Step-by-Step Deployment Process**

### **Step 1: Prepare Your Project for GitHub**

1. **Initialize Git and commit your code:**
   ```bash
   git add .
   git commit -m "Initial commit - AI T-Shirt Designer for ai.bandadda.com"
   ```

2. **Create GitHub Repository:**
   - Go to https://github.com
   - Click "New repository"
   - Name: `ai-tshirt-designer` (or any name you prefer)
   - Make it **Public** (required for free AWS Amplify)
   - Don't initialize with README

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/ai-tshirt-designer.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Deploy to AWS Amplify**

1. **Go to AWS Amplify Console:**
   - Visit https://console.aws.amazon.com/amplify/
   - Sign in with your AWS account (or create one if needed)

2. **Create New App:**
   - Click "New app" → "Host web app"
   - Choose "GitHub" as source
   - Authorize GitHub if prompted
   - Select your repository: `ai-tshirt-designer`
   - Branch: `main`

3. **Configure Build Settings:**
   - App name: `ai-tshirt-designer`
   - Environment: `main`
   - Build specification: Use the `amplify.yml` file (already created)
   - Click "Next"

4. **Add Environment Variables:**
   - Go to "Environment variables" section
   - Add all the variables from `env.production.example`:
     ```
     NEXT_PUBLIC_OPENAI_API_KEY = your_openai_api_key
     NEXT_PUBLIC_WOOCOMMERCE_URL = https://bandadda.com
     NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY = your_consumer_key
     NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET = your_consumer_secret
     NEXT_PUBLIC_RAZORPAY_KEY_ID = your_razorpay_key_id
     RAZORPAY_KEY_SECRET = your_razorpay_secret
     FTP_HOST = 195.35.44.163
     FTP_USERNAME = u317671848.customized.bandadda.com
     FTP_PASSWORD = K1[nc=O=XpLMILc$
     DB_HOST = 193.203.184.29
     DB_USER = u317671848_BndadaAIDbAdm
     DB_PASSWORD = q&9TT/Y+o?&b
     DB_NAME = u317671848_BandaddaAI_DB
     NEXTAUTH_URL = https://ai.bandadda.com
     NEXTAUTH_SECRET = your_strong_random_secret
     GOOGLE_CLIENT_ID = your_google_client_id
     GOOGLE_CLIENT_SECRET = your_google_client_secret
     ```

5. **Deploy:**
   - Click "Save and deploy"
   - Wait for deployment to complete (5-10 minutes)

### **Step 3: Configure Custom Domain (ai.bandadda.com)**

1. **In AWS Amplify Console:**
   - Go to your app
   - Click "Domain management"
   - Click "Add domain"
   - Enter: `bandadda.com`
   - Click "Configure domain"

2. **Add Subdomain:**
   - Click "Add subdomain"
   - Enter: `ai`
   - Click "Save"

3. **Configure DNS:**
   - AWS will provide DNS records
   - Add these records to your domain provider (where bandadda.com is registered)
   - Wait for DNS propagation (up to 24 hours)

### **Step 4: Configure Google OAuth for Production**

1. **Update Google Console:**
   - Go to https://console.developers.google.com
   - Select your OAuth project
   - Go to "Credentials" → "OAuth 2.0 Client IDs"
   - Add authorized redirect URI: `https://ai.bandadda.com/api/auth/callback/google`
   - Save changes

2. **Update Environment Variables:**
   - In AWS Amplify, update:
     - `NEXTAUTH_URL = https://ai.bandadda.com`
     - `GOOGLE_CLIENT_ID = your_google_client_id`
     - `GOOGLE_CLIENT_SECRET = your_google_client_secret`

### **Step 5: Configure Razorpay for Production**

1. **Update Razorpay Dashboard:**
   - Go to https://dashboard.razorpay.com
   - Go to "Settings" → "Webhooks"
   - Add webhook URL: `https://ai.bandadda.com/api/razorpay/webhook`
   - Save settings

2. **Update Environment Variables:**
   - In AWS Amplify, update:
     - `NEXT_PUBLIC_RAZORPAY_KEY_ID = your_live_razorpay_key_id`
     - `RAZORPAY_KEY_SECRET = your_live_razorpay_secret`

---

## **Automatic Deployment Setup**

### **GitHub Integration:**
- Every time you push to `main` branch
- AWS Amplify automatically builds and deploys
- No manual intervention needed

### **Deployment Process:**
1. You make changes to code
2. Push to GitHub: `git push origin main`
3. AWS Amplify detects changes
4. Automatically builds and deploys
5. Website updates on ai.bandadda.com

---

## **Post-Deployment Checklist**

### **✅ Test Everything:**
- [ ] Visit https://ai.bandadda.com
- [ ] Test Google login
- [ ] Test design creation
- [ ] Test payment process
- [ ] Test order placement
- [ ] Test on mobile devices

### **✅ Monitor Performance:**
- [ ] Check AWS Amplify logs
- [ ] Monitor error rates
- [ ] Check loading times
- [ ] Test all features

---

## **Cost Estimation**

### **AWS Amplify Pricing:**
- **Free Tier**: 1,000 build minutes/month
- **Hosting**: Free for static sites
- **Custom Domain**: Free
- **Total Cost**: $0/month (within free tier limits)

### **Additional Costs:**
- **Domain**: Only if you don't own bandadda.com
- **External Services**: OpenAI, Razorpay, WooCommerce (as per their pricing)

---

## **Troubleshooting**

### **Common Issues:**
1. **Build Fails**: Check environment variables
2. **Domain Not Working**: Check DNS records
3. **Google Login Fails**: Check redirect URLs
4. **Payment Fails**: Check Razorpay configuration

### **Support Resources:**
- AWS Amplify Docs: https://docs.aws.amazon.com/amplify/
- Next.js Docs: https://nextjs.org/docs
- Your project is production-ready! 🎉

---

## **Summary**

✅ **Perfect Solution for Your Client:**
- Next.js 15.4.7 (latest version)
- Tailwind CSS v3.4.0
- Hosted on ai.bandadda.com
- GitHub-triggered deployment
- AWS Amplify hosting
- Automatic deployments
- Free hosting (within limits)

**Your AI T-Shirt Designer will be live on ai.bandadda.com!** 🚀

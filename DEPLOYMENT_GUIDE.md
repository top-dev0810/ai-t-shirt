# 🚀 **AI T-Shirt Designer - Deployment Guide**

## **Option 1: Vercel (Recommended)**

### **Step 1: Prepare Your Project**
1. Make sure your project builds successfully:
   ```bash
   npm run build
   ```

2. Create a `.env.production` file with your production environment variables:
   ```env
   # OpenAI
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key

   # WooCommerce
   NEXT_PUBLIC_WOOCOMMERCE_URL=https://bandadda.com
   NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
   NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret

   # Razorpay
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret

   # FTP
   FTP_HOST=195.35.44.163
   FTP_USERNAME=u317671848.customized.bandadda.com
   FTP_PASSWORD=K1[nc=O=XpLMILc$

   # Database
   DB_HOST=193.203.184.29
   DB_USER=u317671848_BndadaAIDbAdm
   DB_PASSWORD=q&9TT/Y+o?&b
   DB_NAME=u317671848_BandaddaAI_DB

   # NextAuth
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_strong_random_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### **Step 2: Push to GitHub**
1. Initialize Git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AI T-Shirt Designer"
   ```

2. Create a new repository on GitHub:
   - Go to https://github.com
   - Click "New repository"
   - Name it "ai-tshirt-designer" (or any name you prefer)
   - Make it public or private (your choice)
   - Don't initialize with README (since you already have files)

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/ai-tshirt-designer.git
   git branch -M main
   git push -u origin main
   ```

### **Step 3: Deploy to Vercel**
1. Go to https://vercel.com
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - Go to Project Settings → Environment Variables
   - Add all your production environment variables
6. Click "Deploy"

### **Step 4: Configure Domain (Optional)**
1. In Vercel dashboard, go to your project
2. Go to Settings → Domains
3. Add your custom domain (if you have one)
4. Update `NEXTAUTH_URL` in environment variables

---

## **Option 2: Netlify**

### **Step 1: Prepare for Netlify**
1. Create `netlify.toml` in your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### **Step 2: Deploy**
1. Go to https://netlify.com
2. Sign up/Login with GitHub
3. Click "New site from Git"
4. Connect your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables in Site Settings
7. Deploy

---

## **Option 3: Railway (For Full-Stack)**

### **Step 1: Prepare for Railway**
1. Create `railway.json`:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

### **Step 2: Deploy**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Deploy

---

## **Post-Deployment Checklist**

### **1. Test Your Application**
- [ ] Visit your deployed URL
- [ ] Test Google login
- [ ] Test design creation
- [ ] Test payment process
- [ ] Test order placement

### **2. Configure External Services**
- [ ] Update Google OAuth redirect URLs
- [ ] Update Razorpay webhook URLs
- [ ] Test database connection
- [ ] Test FTP uploads

### **3. Monitor Performance**
- [ ] Check Vercel/Netlify analytics
- [ ] Monitor error logs
- [ ] Test on mobile devices
- [ ] Check loading times

---

## **Environment Variables Reference**

### **Required for Production:**
```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
NEXT_PUBLIC_WOOCOMMERCE_URL=https://bandadda.com
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY=ck_...
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET=cs_...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret
FTP_HOST=195.35.44.163
FTP_USERNAME=u317671848.customized.bandadda.com
FTP_PASSWORD=K1[nc=O=XpLMILc$
DB_HOST=193.203.184.29
DB_USER=u317671848_BndadaAIDbAdm
DB_PASSWORD=q&9TT/Y+o?&b
DB_NAME=u317671848_BandaddaAI_DB
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_strong_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## **Troubleshooting**

### **Common Issues:**
1. **Build Fails**: Check environment variables
2. **Google Login Fails**: Update redirect URLs
3. **Payment Fails**: Check Razorpay configuration
4. **Database Errors**: Verify connection details

### **Support:**
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Your project is ready for production! 🎉

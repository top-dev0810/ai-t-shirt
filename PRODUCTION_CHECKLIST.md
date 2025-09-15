# 🚨 Production Deployment Checklist

## **NextAuth.js Configuration Issues**

The server error you're seeing is typically caused by missing or incorrect environment variables in production.

### **Required Environment Variables for Production:**

```env
# 1. NextAuth Configuration (CRITICAL)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secure-secret-key-minimum-32-characters

# 2. Google OAuth (CRITICAL)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 3. Database (CRITICAL)
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_NAME=ai_tshirt_production
DB_USER=your_db_username
DB_PASSWORD=your_secure_db_password

# 4. Other Required Variables
NODE_ENV=production
OPENAI_API_KEY=sk-your-openai-api-key
RAZORPAY_KEY_ID=rzp_live_your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

## **🔧 Step-by-Step Fix:**

### **Step 1: Check Your Google OAuth Configuration**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (or create one)
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - **Authorized redirect URIs**: 
     ```
     https://your-domain.com/api/auth/callback/google
     ```
   - **Authorized JavaScript origins**:
     ```
     https://your-domain.com
     ```

### **Step 2: Generate NEXTAUTH_SECRET**

```bash
# Generate a secure secret (run this in terminal)
openssl rand -base64 32
```

### **Step 3: Set Environment Variables in Your Deployment Platform**

#### **For AWS Amplify:**
1. Go to your Amplify app console
2. Go to "Environment variables"
3. Add all the required variables

#### **For AWS Elastic Beanstalk:**
```bash
eb setenv NEXTAUTH_URL=https://your-domain.com
eb setenv NEXTAUTH_SECRET=your-generated-secret
eb setenv GOOGLE_CLIENT_ID=your-google-client-id
eb setenv GOOGLE_CLIENT_SECRET=your-google-client-secret
# ... add all other variables
```

#### **For Vercel:**
1. Go to your project dashboard
2. Go to "Settings" > "Environment Variables"
3. Add all variables

### **Step 4: Test Your Configuration**

1. **Check if environment variables are loaded**:
   ```javascript
   // Add this to a test API route
   console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
   console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
   ```

2. **Test the auth endpoint directly**:
   ```
   https://your-domain.com/api/auth/providers
   ```

## **🚨 Common Issues & Solutions:**

### **Issue 1: "NEXTAUTH_URL not set"**
- **Solution**: Set `NEXTAUTH_URL` to your exact domain (with https://)

### **Issue 2: "Invalid redirect URI"**
- **Solution**: Check Google OAuth redirect URI matches exactly:
  ```
  https://your-domain.com/api/auth/callback/google
  ```

### **Issue 3: "NEXTAUTH_SECRET not set"**
- **Solution**: Generate and set a secure secret (32+ characters)

### **Issue 4: "Database connection failed"**
- **Solution**: Check RDS endpoint, credentials, and security groups

## **🔍 Debug Steps:**

1. **Check server logs** for specific error messages
2. **Verify environment variables** are actually set in production
3. **Test database connection** separately
4. **Check Google OAuth configuration** in Google Cloud Console
5. **Verify domain and SSL certificate** are working

## **📞 Quick Fix Commands:**

```bash
# 1. Generate NEXTAUTH_SECRET
openssl rand -base64 32

# 2. Test environment variables (add to a test API route)
console.log(process.env.NEXTAUTH_URL);
console.log(process.env.GOOGLE_CLIENT_ID);

# 3. Check if auth endpoint is working
curl https://your-domain.com/api/auth/providers
```

## **✅ Success Indicators:**

- ✅ No server errors when accessing `/api/auth/providers`
- ✅ Google OAuth login button appears
- ✅ Login redirects to Google successfully
- ✅ After Google auth, user is redirected back to your app
- ✅ User session is created successfully

## **🚀 After Fixing:**

1. **Redeploy your application**
2. **Test the complete login flow**
3. **Check that user data is saved to database**
4. **Verify admin functionality works**

---

**Need more help?** Check the server logs for specific error messages and share them for more targeted assistance.

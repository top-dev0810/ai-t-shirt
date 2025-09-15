# 🚀 AWS Deployment Guide for AI T-Shirt App

## 📋 **Prerequisites**
- AWS Account with appropriate permissions
- Domain name (optional but recommended)
- SSL certificate (AWS Certificate Manager)
- GitHub repository with your code

## 🏗️ **Recommended AWS Architecture**

### **Option 1: AWS Amplify (Easiest)**
- **Frontend**: Next.js app on AWS Amplify
- **Backend**: API routes in Next.js
- **Database**: AWS RDS MySQL
- **Storage**: AWS S3 for images
- **Authentication**: NextAuth.js with Google OAuth

### **Option 2: AWS Elastic Beanstalk (Recommended)**
- **Application**: Next.js on Elastic Beanstalk
- **Database**: AWS RDS MySQL
- **Storage**: AWS S3 + CloudFront
- **Load Balancer**: Application Load Balancer
- **SSL**: AWS Certificate Manager

### **Option 3: AWS ECS/Fargate (Advanced)**
- **Containers**: Dockerized Next.js app
- **Orchestration**: ECS with Fargate
- **Database**: AWS RDS MySQL
- **Storage**: AWS S3 + CloudFront

## 🚀 **Step-by-Step Deployment (Option 2 - Elastic Beanstalk)**

### **Step 1: Prepare Your Application**

1. **Create production environment file:**
```bash
# Create .env.production
cp .env.local .env.production
```

2. **Update environment variables for production:**
```env
# Database Configuration (AWS RDS MySQL)
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_NAME=ai_tshirt_production
DB_USER=your_db_username
DB_PASSWORD=your_secure_db_password

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secure-nextauth-secret-key-here

# Google OAuth (for production)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Razorpay Configuration (for production)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# FTP Configuration (for image storage)
FTP_HOST=your-ftp-server.com
FTP_PORT=21
FTP_USERNAME=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_BASE_PATH=/public_html/images/orders
NEXT_PUBLIC_IMAGE_BASE_URL=https://your-domain.com/images

# Environment
NODE_ENV=production
```

### **Step 2: Create AWS RDS MySQL Database**

1. **Go to AWS RDS Console**
2. **Create Database:**
   - Engine: MySQL 8.0
   - Instance: db.t3.micro (free tier) or db.t3.small
   - Storage: 20 GB (minimum)
   - Username: `admin`
   - Password: Generate secure password
   - VPC: Default VPC
   - Public access: Yes (for initial setup)

3. **Note down the endpoint URL**

### **Step 3: Set Up Database**

1. **Connect to your RDS instance:**
```bash
mysql -h your-rds-endpoint.region.rds.amazonaws.com -u admin -p
```

2. **Create database and run setup:**
```sql
CREATE DATABASE ai_tshirt_production;
USE ai_tshirt_production;
```

3. **Run your database setup script:**
```bash
node setup-database-ftp-test.js
```

### **Step 4: Deploy to Elastic Beanstalk**

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize EB application:**
```bash
eb init
# Select region
# Select platform: Node.js
# Select application name
```

3. **Create environment:**
```bash
eb create production
```

4. **Configure environment variables:**
```bash
eb setenv NODE_ENV=production
eb setenv DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
eb setenv DB_PORT=3306
eb setenv DB_NAME=ai_tshirt_production
eb setenv DB_USER=admin
eb setenv DB_PASSWORD=your-db-password
# ... set all other environment variables
```

5. **Deploy:**
```bash
eb deploy
```

### **Step 5: Configure Custom Domain (Optional)**

1. **Get SSL certificate from AWS Certificate Manager**
2. **Configure Route 53 for your domain**
3. **Update EB environment with custom domain**

## 🐳 **Alternative: Docker Deployment**

### **Create Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### **Deploy with Docker:**
```bash
# Build and push to ECR
docker build -t ai-tshirt-app .
docker tag ai-tshirt-app:latest your-account.dkr.ecr.region.amazonaws.com/ai-tshirt-app:latest
docker push your-account.dkr.ecr.region.amazonaws.com/ai-tshirt-app:latest

# Deploy to ECS or EKS
```

## 🔧 **Production Optimizations**

### **1. Update next.config.js for production:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker deployment
  images: {
    domains: ['your-domain.com', 'oaidalleapiprodscus.blob.core.windows.net'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

### **2. Set up monitoring:**
- AWS CloudWatch for logs
- AWS X-Ray for tracing
- Application Load Balancer health checks

### **3. Security considerations:**
- Use AWS Secrets Manager for sensitive data
- Enable VPC for database
- Configure security groups properly
- Use HTTPS everywhere

## 📊 **Cost Estimation (Monthly)**

### **Small Scale (100-1000 users):**
- Elastic Beanstalk: $20-50
- RDS MySQL (db.t3.micro): $15-25
- S3 Storage: $1-5
- **Total: ~$40-80/month**

### **Medium Scale (1000-10000 users):**
- Elastic Beanstalk: $50-150
- RDS MySQL (db.t3.small): $25-50
- S3 + CloudFront: $10-30
- **Total: ~$100-250/month**

## 🚨 **Important Notes**

1. **Database Security**: Never expose RDS publicly in production
2. **Environment Variables**: Use AWS Secrets Manager for sensitive data
3. **SSL Certificates**: Always use HTTPS in production
4. **Backup Strategy**: Set up automated RDS backups
5. **Monitoring**: Set up CloudWatch alarms
6. **Scaling**: Configure auto-scaling for traffic spikes

## 🔄 **Deployment Checklist**

- [ ] Set up AWS RDS MySQL database
- [ ] Configure environment variables
- [ ] Set up domain and SSL certificate
- [ ] Deploy application to AWS
- [ ] Test all functionality
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline (optional)

## 📞 **Need Help?**

If you encounter any issues during deployment, check:
1. AWS CloudWatch logs
2. Application health checks
3. Database connectivity
4. Environment variable configuration
5. Security group settings

Good luck with your deployment! 🚀

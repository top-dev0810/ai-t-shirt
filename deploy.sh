#!/bin/bash

# AWS Deployment Script for AI T-Shirt App
# Make sure to set your AWS credentials and region before running

set -e

echo "🚀 Starting AWS deployment for AI T-Shirt App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    if ! command -v eb &> /dev/null; then
        echo -e "${RED}❌ EB CLI is not installed. Please install it first.${NC}"
        echo "Install with: pip install awsebcli"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠️  Docker is not installed. Containerized deployment will not be available.${NC}"
    fi
    
    echo -e "${GREEN}✅ Requirements check passed${NC}"
}

# Build the application
build_app() {
    echo "🔨 Building the application..."
    
    # Install dependencies
    npm ci
    
    # Build the application
    npm run build
    
    echo -e "${GREEN}✅ Application built successfully${NC}"
}

# Deploy to Elastic Beanstalk
deploy_eb() {
    echo "🚀 Deploying to Elastic Beanstalk..."
    
    # Check if EB is initialized
    if [ ! -f ".elasticbeanstalk/config.yml" ]; then
        echo "Initializing Elastic Beanstalk..."
        eb init
    fi
    
    # Create environment if it doesn't exist
    if ! eb list | grep -q "production"; then
        echo "Creating production environment..."
        eb create production
    fi
    
    # Deploy
    eb deploy production
    
    echo -e "${GREEN}✅ Deployed to Elastic Beanstalk successfully${NC}"
    echo "Your app is available at: $(eb status | grep 'CNAME' | awk '{print $2}')"
}

# Deploy with Docker to ECS
deploy_docker() {
    echo "🐳 Building and deploying Docker container..."
    
    # Get AWS account ID and region
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=$(aws configure get region)
    
    if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
        echo -e "${RED}❌ AWS credentials not configured properly${NC}"
        exit 1
    fi
    
    # Create ECR repository if it doesn't exist
    REPO_NAME="ai-tshirt-app"
    ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}"
    
    echo "Creating ECR repository..."
    aws ecr create-repository --repository-name $REPO_NAME --region $AWS_REGION 2>/dev/null || true
    
    # Login to ECR
    echo "Logging in to ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI
    
    # Build and push image
    echo "Building Docker image..."
    docker build -t $REPO_NAME .
    docker tag $REPO_NAME:latest $ECR_URI:latest
    
    echo "Pushing to ECR..."
    docker push $ECR_URI:latest
    
    echo -e "${GREEN}✅ Docker image pushed to ECR successfully${NC}"
    echo "Image URI: $ECR_URI:latest"
}

# Set up RDS database
setup_rds() {
    echo "🗄️  Setting up RDS database..."
    
    # This is a placeholder - you'll need to set up RDS manually or use AWS CLI
    echo "Please set up your RDS MySQL database manually:"
    echo "1. Go to AWS RDS Console"
    echo "2. Create MySQL 8.0 database"
    echo "3. Note down the endpoint URL"
    echo "4. Update your environment variables"
    
    echo -e "${YELLOW}⚠️  Remember to update your environment variables with RDS details${NC}"
}

# Main deployment function
main() {
    echo -e "${GREEN}🎯 AI T-Shirt App AWS Deployment${NC}"
    echo "=================================="
    
    # Check requirements
    check_requirements
    
    # Build application
    build_app
    
    # Ask user for deployment method
    echo ""
    echo "Choose deployment method:"
    echo "1) Elastic Beanstalk (Recommended for beginners)"
    echo "2) Docker to ECS (Advanced)"
    echo "3) Setup RDS only"
    echo "4) Exit"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_eb
            ;;
        2)
            deploy_docker
            ;;
        3)
            setup_rds
            ;;
        4)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set up your RDS MySQL database"
    echo "2. Configure environment variables"
    echo "3. Set up your domain and SSL certificate"
    echo "4. Test your application"
    echo ""
    echo "For detailed instructions, see AWS_DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@"

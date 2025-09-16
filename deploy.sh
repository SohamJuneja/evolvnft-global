#!/bin/bash

echo "🚀 EvolvNFT Deployment Script"
echo "=============================="

# Check if required tools are installed
echo "📋 Checking prerequisites..."

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

# Check for git
if ! command -v git &> /dev/null; then
    echo "❌ git is not installed"
    exit 1
fi

echo "✅ Prerequisites met"

# Frontend deployment
echo ""
echo "🌐 Preparing Frontend for Deployment..."
cd living-art-forge

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build the project
echo "🔨 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo ""
    echo "🚀 Vercel CLI found. Ready to deploy!"
    echo "Run 'vercel --prod' to deploy to production"
    echo "Or 'vercel' for a preview deployment"
else
    echo ""
    echo "📝 To deploy to Vercel:"
    echo "1. Install Vercel CLI: npm i -g vercel"
    echo "2. Login to Vercel: vercel login"
    echo "3. Deploy: vercel --prod"
fi

cd ..

# Oracle service preparation
echo ""
echo "⚡ Preparing Oracle Service..."

# Install dependencies
echo "📦 Installing oracle dependencies..."
npm install

# Compile contracts
echo "🔨 Compiling smart contracts..."
npx hardhat compile

if [ $? -eq 0 ]; then
    echo "✅ Oracle service prepared!"
else
    echo "❌ Oracle compilation failed!"
    exit 1
fi

# Relayer service preparation
echo ""
echo "🔧 Preparing Relayer Service..."
cd evolvnft-relayer

# Install dependencies
echo "📦 Installing relayer dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Relayer service prepared!"
else
    echo "❌ Relayer preparation failed!"
    exit 1
fi

cd ..

echo ""
echo "🎉 All services prepared for deployment!"
echo ""
echo "📝 Next Steps:"
echo "1. Deploy Frontend to Vercel: cd living-art-forge && vercel --prod"
echo "2. Deploy Oracle to Railway: railway up"
echo "3. Deploy Relayer to Render: Connect GitHub repo to Render"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"

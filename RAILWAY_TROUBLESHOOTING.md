# 🔧 Railway Deployment Troubleshooting Guide

## 🚨 Common Railway Deployment Issues & Solutions

### ❌ **Issue 1: "typechain-types not found" Error**

**Error Message:**
```
ERROR: failed to build: failed to solve: failed to compute cache key: 
"/typechain-types": not found
```

**✅ Solutions (Try in order):**

#### **Solution A: Use Non-Docker Deployment (Recommended)**
1. Rename configuration file:
   ```bash
   mv railway.toml railway-docker.toml
   mv railway-nixpacks.toml railway.toml
   ```

2. Redeploy on Railway - it will use Nixpacks instead of Docker

#### **Solution B: Use Fixed Docker Configuration**
1. Use the Railway-specific Dockerfile:
   ```bash
   # Railway will automatically use Dockerfile.oracle.railway
   railway up
   ```

#### **Solution C: Manual Build Approach**
1. Delete the railway.toml file temporarily
2. Let Railway auto-detect as Node.js project
3. Set start command in Railway dashboard: `npm run oracle:prod`

### ❌ **Issue 2: Oracle Fails to Start**

**✅ Solutions:**

1. **Check Environment Variables** in Railway dashboard:
   ```
   NODE_ENV=production
   PRIVATE_KEY=your_private_key_without_0x_prefix
   SOMNIA_RPC_URL=https://50312.rpc.thirdweb.com
   EVOLUTION_INTERVAL_MINUTES=5
   ```

2. **Verify Start Command** is correct:
   ```
   npm run oracle:prod
   ```

### ❌ **Issue 3: Dependencies Installation Fails**

**✅ Solutions:**

1. **Clear Railway cache:**
   - Go to Railway project settings
   - Click "Clear Build Cache" 
   - Redeploy

2. **Check package.json** has all required dependencies

### 🔄 **Railway Deployment Methods (Try These In Order)**

## **Method 1: Simple Node.js Deployment (Recommended)**

1. **Remove Docker configuration:**
   ```bash
   rm railway.toml  # This forces Railway to use Nixpacks
   ```

2. **Deploy via CLI:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set environment variables** in Railway dashboard

4. **Check logs:**
   ```bash
   railway logs
   ```

## **Method 2: GitHub Integration (Easiest)**

1. **Push your latest changes to GitHub:**
   ```bash
   git add -A
   git commit -m "Fixed Railway deployment configuration"
   git push origin main
   ```

2. **Connect Railway to GitHub:**
   - Go to https://railway.app
   - New Project → Deploy from GitHub
   - Select your repository
   - Railway will auto-detect Node.js

3. **Configure in Railway Dashboard:**
   - Build Command: `npm install && npx hardhat compile`
   - Start Command: `npm run oracle:prod`
   - Add environment variables

## **Method 3: Docker Deployment (Advanced)**

Only use if Methods 1 & 2 don't work:

1. **Use the fixed Dockerfile:**
   ```bash
   # Rename files to use the Railway-specific Docker config
   mv Dockerfile.oracle.railway Dockerfile
   ```

2. **Deploy with Railway CLI:**
   ```bash
   railway up
   ```

## **🔍 Debugging Commands**

### **Check Railway Logs:**
```bash
railway logs --tail
```

### **Test Locally Before Deploying:**
```bash
# Test oracle compilation
npx hardhat compile

# Test oracle run (single execution)
SINGLE_RUN=true npm run oracle

# Check if all dependencies are installed
npm ls
```

### **Verify Smart Contract Connection:**
```bash
# Test contract interaction
npx hardhat run scripts/mint.ts --network somniaTestnet
```

## **📋 Pre-Deployment Checklist**

Before deploying to Railway, ensure:

- [ ] `npx hardhat compile` works locally
- [ ] `npm run oracle` starts without errors locally  
- [ ] Environment variables are ready (PRIVATE_KEY, etc.)
- [ ] Smart contract is deployed and verified
- [ ] Git repository is up to date

## **🎯 Quick Fix Commands**

### **Reset Railway Deployment:**
```bash
railway login
railway delete  # Delete current deployment
railway init    # Start fresh
railway up      # Deploy again
```

### **Force Clean Build:**
```bash
# In Railway dashboard:
# Settings → Clear Build Cache → Redeploy
```

### **Switch to Manual Configuration:**
```bash
# Remove all Railway config files
rm railway*.toml

# Let Railway auto-detect
railway up
```

## **✅ Success Indicators**

Your deployment is working when you see:

1. **Railway Build Logs:**
   ```
   ✅ Build completed successfully
   ✅ Service started
   ```

2. **Oracle Logs:**
   ```
   🌍 Enhanced Oracle starting...
   📍 Contract Address: 0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
   🔍 Scanning for active tokens...
   ```

3. **No Error Messages** in Railway logs for 5+ minutes

## **📞 Need Help?**

If issues persist:

1. **Check Railway Status:** https://status.railway.app
2. **Railway Documentation:** https://docs.railway.app
3. **Community Support:** Railway Discord

## **💡 Alternative Deployment Platforms**

If Railway continues to have issues:

### **Render (Similar to Railway):**
- Create Web Service
- Connect GitHub repo  
- Build: `npm install && npx hardhat compile`
- Start: `npm run oracle:prod`

### **Heroku (More expensive but reliable):**
- Connect GitHub repo
- Add Node.js buildpack
- Set start command: `npm run oracle:prod`

### **DigitalOcean App Platform:**
- Connect GitHub repo
- Detected as Node.js app
- Auto-deployment enabled

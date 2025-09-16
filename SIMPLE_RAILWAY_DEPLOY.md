# Simple Railway Deployment Instructions

## 🚀 Simplest Railway Deployment (No Config Files)

### Step 1: Remove all Railway config files temporarily
```bash
cd e:\blockchain\EvolvNFT
mv railway.toml railway-backup.toml
```

### Step 2: Deploy with Railway CLI
```bash
railway up
```

### Step 3: Configure in Railway Dashboard

1. Go to your Railway project dashboard
2. Click on "Settings"
3. Under "Build & Deploy":
   - **Build Command**: `npm install && npx hardhat compile`
   - **Start Command**: `npm run oracle:prod`
4. Under "Environment Variables", add:
   ```
   NODE_ENV=production
   PRIVATE_KEY=your_private_key_without_0x
   EVOLUTION_INTERVAL_MINUTES=5
   MAX_TOKENS_PER_RUN=10
   ```

### Step 4: Force Redeploy
Click "Deploy" button in Railway dashboard

## Expected Success Logs:
```
✅ Build completed
🌍 Enhanced Oracle starting...
📍 Contract Address: 0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
🔍 Scanning for active tokens...
```

## If this doesn't work, try Render instead:
1. Go to https://render.com
2. New → Background Worker
3. Connect GitHub repo
4. Build Command: `npm install && npx hardhat compile`
5. Start Command: `npm run oracle:prod`
6. Add same environment variables

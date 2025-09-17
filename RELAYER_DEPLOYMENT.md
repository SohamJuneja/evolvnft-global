# 🚀 Relayer Deployment Guide - Render

## What is the Relayer?

The relayer service enables **gasless minting** - users can mint NFTs without paying gas fees. Your relayer wallet pays the gas fees on their behalf.

## 📋 Pre-Deployment Setup

### 1. Create a Relayer Wallet

You need a separate wallet for the relayer service:

```bash
# Generate a new wallet (or use an existing one)
# Fund it with some STT for gas fees (~0.1-1 STT should be enough)
```

### 2. Prepare Environment Variables

You'll need these values for Render:

```
CONTRACT_ADDRESS=0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
SOMNIA_RPC_URL=https://rpc.ankr.com/somnia_testnet/6d98f304a89a1bae8c99518de1733780853d152e34f4f110555e94c4514d47c8
RELAYER_PRIVATE_KEY=your_relayer_wallet_private_key
OWNER_PRIVATE_KEY=your_contract_owner_private_key
NODE_ENV=production
```

## 🌐 Deploy to Render

### Step 1: Go to Render

1. Visit [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click **"New +"** → **"Web Service"**

### Step 2: Connect Repository

1. Select **"Build and deploy from a Git repository"**
2. Connect your GitHub account
3. Select repository: `evolvnft-global`
4. Click **"Connect"**

### Step 3: Configure Service

```
Name: evolvnft-relayer
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: evolvnft-relayer
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### Step 4: Set Environment Variables

In the Render dashboard, add these environment variables:

```
CONTRACT_ADDRESS=0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
SOMNIA_RPC_URL=https://rpc.ankr.com/somnia_testnet/6d98f304a89a1bae8c99518de1733780853d152e34f4f110555e94c4514d47c8
RELAYER_PRIVATE_KEY=your_relayer_private_key_here
OWNER_PRIVATE_KEY=your_owner_private_key_here  
NODE_ENV=production
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (usually 2-5 minutes)
3. Your relayer will be available at: `https://your-app-name.onrender.com`

## 🧪 Testing Your Relayer

Once deployed, test these endpoints:

### Health Check
```bash
curl https://your-relayer.onrender.com/
# Should return: "EvolvNFT Relayer is running!"
```

### Relay Mint Test
```bash
curl -X POST https://your-relayer.onrender.com/relay-mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x5AFc621Dec744bbddB5C101C2113F1B41DB839aE",
    "nonce": 123,
    "signature": "0x..."
  }'
```

## 🔧 Configuration Options

### Free Tier Limits
- **750 hours/month** (sufficient for 24/7 uptime)
- **512MB RAM**
- **0.1 CPU**
- **Perfect for relayer service**

### Auto-Deploy
- Render auto-deploys on git pushes
- Zero-downtime deployments
- Built-in SSL certificates

## 🛡️ Security Best Practices

### Wallet Management
- Use a **dedicated relayer wallet** (not your main wallet)
- Fund with minimal STT (~0.1-1 STT)
- Monitor balance and refill as needed

### Private Keys
- Never commit private keys to git
- Use environment variables only
- Consider key rotation for production

## 📊 Monitoring

### Health Checks
```bash
# Service status
curl https://your-relayer.onrender.com/

# Check wallet balance
# Use block explorer: https://shannon-explorer.somnia.network/address/YOUR_RELAYER_ADDRESS
```

### Logs
- Access logs in Render dashboard
- Monitor for errors and gas issues
- Set up alerts for low balance

## 🚨 Troubleshooting

### Common Issues

**Build Failed:**
- Check `package.json` is correct
- Ensure all dependencies are listed
- Verify Node version compatibility

**Environment Variables:**
- Don't include `0x` prefix in private keys
- Double-check all addresses
- Ensure RPC URL is accessible

**Gas Issues:**
- Fund relayer wallet with STT
- Check gas prices aren't too low
- Monitor wallet balance

### Debug Commands

```bash
# Check service logs
# (Available in Render dashboard)

# Test RPC connection
curl -X POST https://rpc.ankr.com/somnia_testnet/YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Verify contract address
https://shannon-explorer.somnia.network/address/0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
```

## 🎯 Expected Results

After successful deployment, your relayer logs should show:

```
🚀 Relayer Service Starting...
👤 Relayer Wallet Address: 0x...
🔗 Connected to Contract: 0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
✅ Contract's relayer address has been set to this server's wallet.
✅ Relayer server listening on http://localhost:3001
```

## 💰 Cost Estimate

**Render Pricing:**
- **Free Tier**: $0/month (750 hours - perfect for testing)
- **Starter**: $7/month (unlimited uptime)
- **Gas Costs**: ~$1-5/month (depends on minting volume)

**Total: $0-12/month**

## 🔄 Integration

Once deployed, update your frontend to use the relayer:

```javascript
// In your React app
const RELAYER_URL = 'https://your-relayer.onrender.com';

async function gaslesseMint(to, locationId) {
  const response = await fetch(`${RELAYER_URL}/relay-mint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      nonce: Date.now(),
      signature: await signMessage(...)
    })
  });
  return response.json();
}
```

## 🎊 Success!

Your EvolvNFT system will now support:
- ✅ Regular minting (user pays gas)
- ✅ Gasless minting (relayer pays gas)
- ✅ Automatic evolution (oracle)
- ✅ Multi-city weather integration

**Complete ecosystem deployed!** 🌟

# 🔗 RPC Provider Setup Guide

## ✅ **SOLVED: Ankr RPC Integration**

Great news! You now have a **dedicated Ankr RPC endpoint** that will eliminate the rate limiting issues:

```
https://rpc.ankr.com/somnia_testnet/6d98f304a89a1bae8c99518de1733780853d152e34f4f110555e94c4514d47c8
```

**✅ Tested & Verified:** Chain ID 50312 ✓ | Connection Working ✓

## 🎯 **Ankr Benefits**

- **High Rate Limits**: 500 requests/second (vs 1-2 for public RPCs)
- **99.9% Uptime**: Enterprise-grade reliability
- **Global Edge Network**: Fast responses worldwide
- **Dedicated Endpoint**: No sharing with other users
- **Free Tier**: Generous limits for your use case

## 🚨 **Critical: Fix Rate Limiting Issues**

The "Too Many Requests" error happens because public RPC endpoints have strict rate limits. You need a **dedicated RPC provider**.

## 🎯 **Recommended Providers**

### **Option 1: Alchemy (Most Popular)**

1. **Sign Up**: Go to [alchemy.com](https://www.alchemy.com/)
2. **Create App**:
   - App Name: `EvolvNFT Oracle`
   - Description: `Weather-based NFT evolution`
   - Chain: `Ethereum` → Then add custom network
3. **Add Somnia Testnet**:
   - Network Name: `Somnia Testnet`
   - Chain ID: `50312`
   - RPC URL: `https://50312.rpc.thirdweb.com`
   - Currency: `STT`
4. **Get Your URL**: `https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

### **Option 2: Infura (Enterprise Grade)**

1. **Sign Up**: Go to [infura.io](https://infura.io/)
2. **Create Project**: 
   - Project Name: `EvolvNFT`
   - Product: `Web3 API`
3. **Add Network**: Somnia Testnet
4. **Get Your URL**: `https://somnia-testnet.infura.io/v3/YOUR_PROJECT_ID`

### **Option 3: QuickNode (Fast & Reliable)**

1. **Sign Up**: Go to [quicknode.com](https://www.quicknode.com/)
2. **Create Endpoint**: 
   - Chain: Custom → Somnia Testnet
   - Plan: Free tier (up to 200k requests/month)
3. **Get Your URL**: `https://your-endpoint.somnia.quiknode.pro/YOUR_KEY/`

## 🔧 **Implementation Steps**

### **Step 1: Get Your RPC URL**

Choose any provider above and get your dedicated URL. It will look like:
- Alchemy: `https://somnia-testnet.g.alchemy.com/v2/abc123def456`
- Infura: `https://somnia-testnet.infura.io/v3/abc123def456`
- QuickNode: `https://your-name.somnia.quiknode.pro/abc123def456/`

### **Step 2: Update Railway Variables**

1. **Go to Railway Dashboard**
2. **Click your project** → **Variables tab**
3. **Add/Update these variables**:

```bash
SOMNIA_RPC_URL=your_dedicated_rpc_url_here
EVOLUTION_INTERVAL_MINUTES=10
MAX_TOKENS_PER_RUN=3
```

### **Step 3: Redeploy**

Railway will automatically redeploy when you update variables.

## 📊 **Rate Limits Comparison**

| Provider | Free Tier | Requests/Month | Requests/Second |
|----------|-----------|----------------|-----------------|
| **ThirdWeb** (Public) | ❌ | ~100/day | 1-2 req/sec |
| **Alchemy** | ✅ | 300M | 330 req/sec |
| **Infura** | ✅ | 100k | 10 req/sec |
| **QuickNode** | ✅ | 200k | 25 req/sec |

## ✅ **Expected Results After Fix**

Your Railway logs should show:
```
🌍 Enhanced Oracle starting...
📍 Contract Address: 0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
🔍 Scanning for active tokens...
   ✅ Token #0 - Owner: 0x5AFc621D...
🎯 Evolving NFT #0:
   🌍 Location: Tokyo, Japan (ID: 3)
   🌡️ Weather in Tokyo, Japan: 22°C, clear sky
   ✅ NFT #0 evolved with Tokyo, Japan weather! (Block: 12345)
```

## 🚀 **Advanced: Multiple RPC Fallbacks**

For maximum reliability, you can add multiple RPC URLs:

```typescript
// In hardhat.config.ts
const RPC_URLS = [
  process.env.SOMNIA_RPC_URL,
  "https://somnia-testnet.blockscout.com/api/eth-rpc",
  "https://rpc.somnia.network",
  "https://50312.rpc.thirdweb.com"
].filter(Boolean);

networks: {
  somniaTestnet: {
    url: RPC_URLS[0] || RPC_URLS[1],
    // ... other config
  }
}
```

## 💰 **Cost Analysis**

All major providers offer generous free tiers:

- **Alchemy**: 300M requests/month FREE
- **Infura**: 100k requests/month FREE  
- **QuickNode**: 200k requests/month FREE

Your oracle makes ~1 request per NFT per 10 minutes:
- 3 NFTs × 6 requests/hour × 24 hours × 30 days = ~13k requests/month

**You'll stay well within all free limits!** 🎉

## 🛠️ **Troubleshooting**

### **Still Getting Rate Limits?**
1. Increase `EVOLUTION_INTERVAL_MINUTES` to 15 or 20
2. Decrease `MAX_TOKENS_PER_RUN` to 1 or 2
3. Add more delay between requests in oracle code

### **RPC Connection Issues?**
1. Check your API key is correct
2. Verify the network configuration
3. Try a different RPC provider

### **Oracle Not Starting?**
1. Check `PRIVATE_KEY` is set (without 0x prefix)
2. Verify wallet has some STT for gas fees
3. Check Railway logs for specific error messages

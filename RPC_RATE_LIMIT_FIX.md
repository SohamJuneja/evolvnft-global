# 🔧 QUICK FIX FOR RAILWAY RPC RATE LIMITING

## Step 1: Update Railway Environment Variables

Go to your Railway dashboard → Variables tab and add/update:

```
SOMNIA_RPC_URL=https://somnia-testnet.blockscout.com/api/eth-rpc
EVOLUTION_INTERVAL_MINUTES=10
MAX_TOKENS_PER_RUN=5
```

## Step 2: Alternative RPC Endpoints (Try in order)

If the first RPC still has issues, try these:

```
# Option 1 (Recommended):
SOMNIA_RPC_URL=https://somnia-testnet.blockscout.com/api/eth-rpc

# Option 2:
SOMNIA_RPC_URL=https://rpc.somnia.network

# Option 3:
SOMNIA_RPC_URL=https://testnet.somnia.network

# Option 4 (Fallback):
SOMNIA_RPC_URL=https://50312.rpc.thirdweb.com
```

## Step 3: Restart Railway Deployment

After adding variables, click "Deploy" in Railway dashboard.

## Expected Success Output:

```
🌍 Enhanced Oracle starting...
📍 Contract Address: 0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
🎯 Evolving NFT #0:
   🌍 Location: Tokyo, Japan (ID: 3)
   📊 Current - Power: 42, Level: 4, Brightness: 73
   🌡️  Weather in Tokyo, Japan: 23°C, clear sky
   📊 New      - Power: 45, Brightness: 76, Starlight: 12
   ✅ NFT #0 evolved with Tokyo, Japan weather! (Block: 123456)
   ⏳ Waiting 10 seconds before next NFT...

🎯 Evolving NFT #1:
   🌍 Location: Delhi, India (ID: 5)
   ✅ NFT #1 evolved with Delhi, India weather! (Block: 123457)
```

## If Still Having Issues:

1. **Check Railway Logs** for any remaining errors
2. **Increase delays** further (set EVOLUTION_INTERVAL_MINUTES=15)
3. **Reduce batch size** (set MAX_TOKENS_PER_RUN=3)

Your oracle is working perfectly - just needs the right RPC configuration! 🚀

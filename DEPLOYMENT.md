# 🚀 EvolvNFT Complete Deployment Guide

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Oracle        │    │   Relayer       │
│   (Vercel)      │    │   (Railway)     │    │   (Render)      │
│   React/Vite    │    │   Node.js       │    │   Express API   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Smart Contract  │
                    │ (Somnia Testnet)│
                    │ 0xED32eAE05...  │
                    └─────────────────┘
```

## 🎯 Deployment Checklist

### ✅ Prerequisites
- [x] Smart Contract deployed on Somnia: `0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9`
- [ ] Vercel account
- [ ] Railway account
- [ ] Render account (optional, for relayer)
- [ ] Domain name (optional)

## 1. 🌐 Frontend Deployment (Vercel)

### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/SohamJuneja/evolvnft-global)

### Option B: Manual Deploy
```bash
# 1. Go to living-art-forge directory
cd living-art-forge

# 2. Install Vercel CLI
npm i -g vercel

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel --prod

# 5. Set environment variables in Vercel dashboard:
# VITE_CONTRACT_ADDRESS: 0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
# VITE_CHAIN_ID: 50312
# VITE_NETWORK_NAME: Somnia Testnet
```

**Vercel Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Root Directory: `living-art-forge`

## 2. ⚡ Oracle Deployment (Railway - Recommended)

Railway is perfect for long-running processes like your oracle.

### Deploy to Railway:
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
railway init

# 4. Deploy
railway up
```

### Railway Environment Variables:
```
NODE_ENV=production
EVOLUTION_INTERVAL_MINUTES=5
MAX_TOKENS_PER_RUN=10
SINGLE_RUN=false
PRIVATE_KEY=your_wallet_private_key
SOMNIA_RPC_URL=https://50312.rpc.thirdweb.com
```

### Alternative: Render (Also Great for Oracle)
```bash
# Connect your GitHub repo to Render
# Service Type: Background Worker
# Build Command: npm install && npx hardhat compile
# Start Command: npx hardhat run scripts/oracle.ts --network somniaTestnet
```

## 3. 🔧 Relayer Deployment (Render/Railway)

### Deploy to Render:
```bash
# Service Type: Web Service
# Build Command: cd evolvnft-relayer && npm install
# Start Command: cd evolvnft-relayer && npm start
# Port: 3001
```

### Environment Variables for Relayer:
```
NODE_ENV=production
PORT=3001
PRIVATE_KEY=your_relayer_private_key
CONTRACT_ADDRESS=0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
SOMNIA_RPC_URL=https://50312.rpc.thirdweb.com
```

## 4. 🔒 Security Setup

### Environment Variables Management:
1. **Never commit private keys**
2. **Use different wallets for different services**
3. **Set up monitoring and alerts**

### Recommended Wallet Setup:
```
Oracle Wallet: Funds for gas fees (0.1-1 ETH)
Relayer Wallet: Minimal funds for gasless transactions
Contract Owner: Secure cold wallet
```

## 5. 📊 Monitoring & Maintenance

### Health Checks:
- Frontend: Check if dApp loads and connects to wallet
- Oracle: Monitor evolution transactions
- Relayer: API endpoint health checks

### Monitoring Commands:
```bash
# Check oracle status
curl https://your-oracle.railway.app/health

# Check relayer status  
curl https://your-relayer.onrender.com/health

# Check contract on block explorer
https://somnia-testnet.blockscout.com/address/0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
```

## 6. 🌍 Domain Setup (Optional)

### Custom Domain for Frontend:
1. Go to Vercel dashboard
2. Add domain in Project Settings
3. Update DNS records as instructed

### Subdomain Structure:
```
https://evolvnft.yourdomain.com         # Frontend
https://oracle.evolvnft.yourdomain.com  # Oracle (Railway custom domain)
https://api.evolvnft.yourdomain.com     # Relayer API
```

## 7. 🚀 Go Live Checklist

- [ ] Frontend deployed and accessible
- [ ] Oracle running and processing evolution
- [ ] Relayer API responding to requests
- [ ] Smart contract verified on block explorer
- [ ] All environment variables set securely
- [ ] Monitoring and alerts configured
- [ ] Domain configured (if applicable)
- [ ] Documentation updated

## 📈 Scaling Considerations

### When to Scale:
- Oracle processing >100 NFTs
- High frontend traffic
- Multiple simultaneous users minting

### Scaling Options:
- **Railway**: Auto-scaling for oracle
- **Vercel**: Built-in CDN and edge functions
- **Database**: Consider adding for caching weather data
- **Load Balancer**: For multiple oracle instances

## 🎯 Production Tips

1. **Monitor Gas Fees**: Set reasonable gas limits
2. **Error Handling**: Implement retry logic in oracle
3. **Rate Limiting**: Add limits to prevent spam
4. **Backup**: Multiple oracle instances for reliability
5. **Analytics**: Add monitoring for user interactions

## 🆘 Troubleshooting

### Common Issues:
- **Oracle stops**: Check Railway logs, restart if needed
- **Frontend errors**: Check environment variables
- **Wallet connection**: Ensure network configuration is correct
- **Evolution not working**: Check oracle wallet funds

### Debug Commands:
```bash
# Check oracle logs
railway logs

# Test contract interaction
npx hardhat run scripts/mint.ts --network somniaTestnet

# Verify frontend build
cd living-art-forge && npm run build
```

## 🎉 Success Metrics

Your deployment is successful when:
- ✅ Users can mint NFTs from the frontend
- ✅ Oracle automatically evolves NFTs every 5 minutes
- ✅ Location-specific weather affects evolution
- ✅ All 6 cities work correctly
- ✅ NFT metadata shows location information

## 💰 Cost Estimation

### Monthly Costs:
- **Vercel**: Free tier (sufficient for most dApps)
- **Railway**: ~$5-20/month (Oracle service)
- **Render**: ~$7/month (Relayer service)
- **Domain**: ~$10-15/year (optional)
- **Gas Fees**: Variable (depends on evolution frequency)

**Total: ~$12-27/month + gas fees**

---

## 🎊 Ready to Deploy!

Your EvolvNFT system is production-ready. The multi-city weather evolution system will provide users with a unique, living NFT experience that changes based on real-world conditions from around the globe!

**Next Steps:**
1. Deploy frontend to Vercel
2. Deploy oracle to Railway 
3. Deploy relayer to Render
4. Test end-to-end functionality
5. Launch and share with the world! 🌍

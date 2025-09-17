# Environment Variables for Vercel Deployment

## ✅ CURRENT VERCEL VARIABLES (Keep These):
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_RELAYER_URL=your_render_relayer_url

## ❌ DELETE THESE FROM VERCEL:
# NEXT_PUBLIC_CONTRACT_ADDRESS (wrong prefix for Vite)
# NEXT_PUBLIC_RPC_URL (wrong prefix for Vite)
# NEXT_PUBLIC_CHAIN_ID (wrong prefix for Vite)

## ✅ ADD THESE TO VERCEL:
VITE_CONTRACT_ADDRESS=0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
VITE_CHAIN_ID=50312
VITE_NETWORK_NAME=Somnia Testnet

## 📝 NOTES:
# - Vite apps use VITE_ prefix, not NEXT_PUBLIC_
# - After Render deployment, update VITE_RELAYER_URL
# - Environment variables require new deployment to take effect

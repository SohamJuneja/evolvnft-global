# 🧪 Test Your Relayer After Deployment

## Once your relayer is deployed on Render, test these endpoints:

### 1. Health Check
```bash
curl https://your-relayer-name.onrender.com/health
```
**Expected Response:**
```json
{
  "status": "healthy", 
  "timestamp": "2025-09-16T...",
  "uptime": 123.45
}
```

### 2. Service Info
```bash
curl https://your-relayer-name.onrender.com/
```
**Expected Response:**
```json
{
  "service": "EvolvNFT Relayer",
  "status": "running",
  "version": "1.0.0",
  "contract": "0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9",
  "relayer": "0x...",
  "timestamp": "2025-09-16T..."
}
```

### 3. Test Relay Mint (Optional)
```bash
curl -X POST https://your-relayer-name.onrender.com/relay-mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x5AFc621Dec744bbddB5C101C2113F1B41DB839aE",
    "nonce": 12345,
    "signature": "0x1234..."
  }'
```

## Expected Deployment Logs

Your Render logs should show:
```
🚀 Relayer Service Starting...
👤 Relayer Wallet Address: 0x...
🔗 Connected to Contract: 0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9
✅ Contract's relayer address has been set to this server's wallet.
✅ Relayer server listening on http://localhost:10000
```

## Troubleshooting

### Build Fails:
- Check environment variables are set
- Verify private keys don't have 0x prefix
- Ensure relayer wallet has STT funds

### Service Won't Start:
- Check Render logs for errors
- Verify RPC URL is accessible
- Confirm contract address is correct

### Ready to Use!
Once both endpoints return success, your relayer is ready to handle gasless mints! 🎉

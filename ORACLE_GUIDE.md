# EvolvNFT Oracle Usage Guide

The oracle script connects to real-world data and evolves your NFTs automatically. Here are the available options:

## Quick Commands

### Development & Demo (Fast Evolution)
```bash
# Run oracle with 1-minute intervals (perfect for demos)
npm run oracle:fast

# Evolve NFTs once and exit (quick test)
npm run oracle:single

# Evolve only a specific NFT (replace 0 with your token ID)
TARGET_TOKEN_ID=0 npm run oracle:target
```

### Production (Regular Evolution)
```bash
# Standard continuous oracle (5-minute intervals)
npm run oracle

# Production mode with logging
npm run oracle:prod
```

### Testing
```bash
# Single evolution run with debug info
npm run oracle:test

# Development mode (1-minute intervals, debug enabled)
npm run oracle:dev
```

## Environment Variables

You can customize oracle behavior using these environment variables:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `EVOLUTION_INTERVAL_MINUTES` | Minutes between evolution cycles | 5 (prod), 1 (dev) | `EVOLUTION_INTERVAL_MINUTES=2` |
| `SINGLE_RUN` | Run once and exit | `false` | `SINGLE_RUN=true` |
| `TARGET_TOKEN_ID` | Only evolve specific token | All tokens | `TARGET_TOKEN_ID=0` |
| `MAX_TOKENS_PER_RUN` | Limit tokens per cycle | All tokens | `MAX_TOKENS_PER_RUN=3` |
| `NODE_ENV` | Environment mode | - | `NODE_ENV=development` |
| `OPENWEATHER_API_KEY` | Weather API key | - | Get from openweathermap.org |

## Examples

### Demo Setup (Recommended)
```bash
# For showing the project to someone - evolves every 1 minute
npm run oracle:fast
```

### Quick Test
```bash
# Evolve all NFTs once and see results immediately
npm run oracle:single
```

### Target Specific NFT
```bash
# Only evolve NFT #0 (useful for testing)
TARGET_TOKEN_ID=0 SINGLE_RUN=true npm run oracle:target
```

### Rotate Through NFTs
```bash
# Only evolve 2 NFTs per cycle, rotating through all
MAX_TOKENS_PER_RUN=2 npm run oracle:fast
```

### Custom Timing
```bash
# Evolve every 30 seconds (very fast for testing)
EVOLUTION_INTERVAL_MINUTES=0.5 SINGLE_RUN=false npm run oracle
```

## What the Oracle Does

1. **Scans for NFTs**: Finds all minted NFTs in the contract
2. **Fetches Real Data**: Gets weather data from Kalka, Himachal Pradesh
3. **Calculates Changes**: Maps weather conditions to NFT traits:
   - 🌡️ **Temperature** → Power levels
   - ☁️ **Weather conditions** → Brightness
   - 🌙 **Time of day** → Starlight
   - 💧 **Humidity** → Humidity trait
   - 💨 **Wind speed** → Wind speed trait
   - 🍂 **Season** → Seasonal background
   - 🌙 **Moon phase** → Lunar effects

4. **Evolves NFTs**: Updates traits on-chain
5. **Repeats**: Continues monitoring (unless single run)

## Troubleshooting

### No NFTs Found
- Make sure you've minted at least one NFT
- Check contract address matches your frontend
- Verify you're on the correct network

### Gas Issues
- Oracle auto-adjusts gas prices
- Ensure wallet has sufficient funds
- Try running with `npm run oracle:test` first

### API Issues
- Oracle works without API keys (uses simulated data)
- For real weather, get free API key from openweathermap.org
- Add key to your environment: `OPENWEATHER_API_KEY=your_key`

### Too Slow for Demo
- Use `npm run oracle:fast` for 1-minute intervals
- Use `npm run oracle:single` for immediate single evolution
- Perfect for showing the dynamic behavior quickly

### Want to See Evolution History
- Use the frontend's Evolution Gallery after running oracle
- History is tracked automatically on each evolution
- Check Collection page → click 📊 on any NFT card

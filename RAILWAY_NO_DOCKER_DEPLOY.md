# EASIEST RAILWAY DEPLOYMENT - NO DOCKER
# This approach avoids all Docker permission issues

# Step 1: Delete railway.toml temporarily
# Step 2: Run: railway up
# Step 3: Configure in Railway dashboard

# Railway will auto-detect Node.js and use these settings:

# BUILD COMMAND (set in Railway dashboard):
npm install && npx hardhat compile

# START COMMAND (set in Railway dashboard):  
npm run oracle:prod

# ENVIRONMENT VARIABLES (set in Railway dashboard):
NODE_ENV=production
EVOLUTION_INTERVAL_MINUTES=5
MAX_TOKENS_PER_RUN=10
SINGLE_RUN=false
PRIVATE_KEY=your_private_key_without_0x_prefix

# This method is more reliable than Docker for this use case!

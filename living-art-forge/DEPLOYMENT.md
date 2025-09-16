# EvolvNFT Frontend - Deployment Guide

## Deploy to Vercel (Recommended)

### Quick Deploy Button
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/SohamJuneja/evolvnft-global)

### Manual Deployment Steps:

1. **Fork/Clone the repository**
   ```bash
   git clone https://github.com/SohamJuneja/evolvnft-global.git
   cd evolvnft-global/living-art-forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

### Environment Variables for Vercel:
- `VITE_CONTRACT_ADDRESS`: `0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9`
- `VITE_CHAIN_ID`: `50312`
- `VITE_NETWORK_NAME`: `Somnia Testnet`

### Alternative Frontend Deployment Options:
- **Netlify**: Similar to Vercel, great for static sites
- **AWS S3 + CloudFront**: More control, higher cost
- **GitHub Pages**: Free, but limited features

## Local Development
```bash
npm run dev
```

## Production Build Test
```bash
npm run build
npm run preview
```

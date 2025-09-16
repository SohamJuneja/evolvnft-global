import { ethers } from "hardhat";
import axios from "axios";
import http from "http";

// Create a simple health check server for monitoring
const healthServer = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            service: 'EvolvNFT Oracle',
            version: '1.0.0'
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 8080;
healthServer.listen(PORT, () => {
    console.log(`🏥 Health check server running on port ${PORT}`);
});

// Main oracle function (same as before)
async function main() {
    // CRITICAL: Make sure this matches your Collection.tsx contract address exactly
    const contractAddress = "0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9"; // Updated with location metadata
    
    // Use the compiled contract ABI instead of manual definitions
    const contractArtifact = require('../artifacts/contracts/EvolvNFT.sol/EvolvNFT.json');
    const contractABI = contractArtifact.abi;

    // Connect to contract
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log("🌍 Enhanced Oracle starting...");
    console.log("📍 Contract Address:", contractAddress);
    console.log("📍 Signer Address:", await signer.getAddress());
    console.log("📍 Monitoring real-world conditions globally across multiple cities");
    console.log("🌍 Supporting locations: San Francisco, New York, London, Tokyo, Bengaluru, Delhi");
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
    
    // Include all the existing oracle logic here...
    // For now, let's import the main oracle script
    try {
        const oracleModule = await import('./oracle');
        // The oracle script will run its main function
    } catch (error) {
        console.error("❌ Failed to start oracle:", error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Oracle shutdown requested...');
    healthServer.close(() => {
        console.log('🏥 Health server stopped');
        console.log('💫 Thank you for running the Enhanced Oracle!');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Oracle terminated...');
    healthServer.close(() => {
        process.exit(0);
    });
});

// Start the oracle
main().catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("💥 Oracle failed:", errorMessage);
    process.exitCode = 1;
});

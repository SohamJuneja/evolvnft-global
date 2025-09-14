import express from 'express';
import { ethers } from 'ethers';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// --- Configuration ---
const PORT = process.env.PORT || 3001;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const SOMNIA_RPC_URL = process.env.SOMNIA_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RELAYER_PRIVATE_KEY || !SOMNIA_RPC_URL || !CONTRACT_ADDRESS) {
    throw new Error("Missing critical environment variables. Check your .env file.");
}

// --- Contract ABI (Only the function we need) ---
const contractABI = [
    "function mintFor(address to, uint256 nonce, bytes calldata signature)",
    "function setRelayerAddress(address _relayerAddress)" // For setup
];

// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Relayer Wallet and Contract Setup ---
const provider = new ethers.JsonRpcProvider(SOMNIA_RPC_URL);
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, relayerWallet);

console.log("🚀 Relayer Service Starting...");
console.log(`👤 Relayer Wallet Address: ${relayerWallet.address}`);
console.log(`🔗 Connected to Contract: ${CONTRACT_ADDRESS}`);


// --- API Endpoints ---
app.get('/', (req, res) => {
    res.send('EvolvNFT Relayer is running!');
});

app.post('/relay-mint', async (req, res) => {
    const { to, nonce, signature } = req.body;

    if (!to || nonce === undefined || !signature) {
        return res.status(400).json({ success: false, error: "Missing required parameters: to, nonce, signature." });
    }

    console.log(`\nReceived mint request for user: ${to}`);

    try {
        // Estimate gas to ensure the transaction is valid before sending
        const gasEstimate = await contract.mintFor.estimateGas(to, nonce, signature);
        console.log(`✅ Gas estimated: ${gasEstimate.toString()}`);

        const tx = await contract.mintFor(to, nonce, signature, {
            gasLimit: gasEstimate + BigInt(20000) // Add a buffer
        });
        
        console.log(`Submitting transaction... Hash: ${tx.hash}`);
        
        // We don't wait for it to be mined to give a faster response to the user
        // The frontend will handle waiting for the receipt
        res.status(200).json({ success: true, txHash: tx.hash });
        console.log(`✅ Request for ${to} relayed successfully.`);

    } catch (error: any) {
        console.error("❌ Error relaying transaction:", error.reason || error.message);
        res.status(500).json({ success: false, error: "Failed to relay transaction.", details: error.reason || error.message });
    }
});


// --- Start Server ---
app.listen(PORT, async () => {
    // IMPORTANT: Ensure the contract knows about this relayer address
    try {
        const owner = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY!, provider);
        const ownerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, owner);
        console.log("\nVerifying and setting relayer address on the contract...");
        await (await ownerContract.setRelayerAddress(relayerWallet.address)).wait();
        console.log("✅ Contract's relayer address has been set to this server's wallet.");
    } catch (e) {
        console.error("Could not set relayer address. Make sure OWNER_PRIVATE_KEY is correct and has funds.", e)
    }

    console.log(`\n✅ Relayer server listening on http://localhost:${PORT}`);
});

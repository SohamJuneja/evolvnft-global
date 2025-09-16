import { ethers } from "hardhat";

// A simple utility to decode base64 data, as `atob` is not available in Node.js
const atob = (b64: string) => Buffer.from(b64, 'base64').toString('binary');

async function main() {
  console.log("🎨 Minting Enhanced EvolvNFT...");

  // !!! IMPORTANT: UPDATE THIS WITH YOUR LATEST DEPLOYED CONTRACT ADDRESS !!!
  const contractAddress = "0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9";

  const contractABI = [
    "function mint(address to) public",
    "function mintWithLocation(address to, uint256 locationId) public", 
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function balanceOf(address owner) public view returns (uint256)",
    "function getTokenData(uint256 tokenId) public view returns (tuple(uint256 power, uint256 brightness, uint256 level, uint256 starlight, uint256 humidity, uint256 windSpeed, uint256 season, uint256 moonPhase, uint256 locationId))",
    "function getTokenLocation(uint256 tokenId) public view returns (string)"
  ];

  try {
    const [signer] = await ethers.getSigners();
    console.log("🔑 Minting with account:", signer.address);

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const balanceBeforeBigInt = await contract.balanceOf(signer.address);
    const balanceBefore = Number(balanceBeforeBigInt);
    console.log("📊 Current NFT balance:", balanceBefore);

    console.log("⏳ Minting NFT with location...");
    // Mint with Delhi (locationId: 5) for testing  
    const locationId = 5; // Delhi, India
    const tx = await contract.mintWithLocation(signer.address, locationId);
    console.log("📝 Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ NFT minted successfully!");
    
    const balanceAfterBigInt = await contract.balanceOf(signer.address);
    const balanceAfter = Number(balanceAfterBigInt);
    console.log("📊 New NFT balance:", balanceAfter);

    // This logic assumes the new token ID is the new balance, which is only true for the first few mints.
    // A more robust way is to parse the Transfer event from the receipt logs.
    const newTokenId = balanceAfter - 1; 
    console.log("🎯 New Token ID:", newTokenId);

    try {
      console.log("\n🔍 Fetching NFT data...");
      const tokenURI = await contract.tokenURI(newTokenId);
      const tokenLocation = await contract.getTokenLocation(newTokenId);
      console.log("🌍 Location:", tokenLocation);
      
      if (tokenURI.startsWith('data:application/json;base64,')) {
        const base64Data = tokenURI.split(',')[1];
        const jsonString = atob(base64Data);
        const metadata = JSON.parse(jsonString);
        
        console.log("📋 NFT Metadata:");
        console.log("🏷️  Name:", metadata.name);
        console.log("📝 Description:", metadata.description);
        
        console.log("\n🎯 Initial Traits:");
        if (metadata.attributes) {
          metadata.attributes.forEach((attr: any) => {
            const icon = getTraitIcon(attr.trait_type);
            console.log(`${icon} ${attr.trait_type}: ${attr.value}`);
          });
        }
      }
    } catch (metadataError: any) { // Explicitly type the error
      console.log("⚠️  Could not fetch metadata:", metadataError.message);
    }

    console.log("\n🎉 Success! Your NFT is ready to evolve!");
    console.log("🔄 Run the oracle to start evolution:");
    console.log("   npm run oracle");

  } catch (error: any) { // Explicitly type the error to access .message
    console.error("❌ Minting failed:", error.message);
    if (error.message.includes("insufficient funds")) {
      console.log("💰 You need more ETH in your wallet for gas fees.");
    }
    process.exitCode = 1;
  }
}

// Helper functions
function getTraitIcon(traitType: string): string {
  const iconMap: { [key: string]: string } = {
    "Level": "📊", "Power": "⚡", "Brightness": "✨", "Starlight": "🌟",
    "Humidity": "💧", "Wind Speed": "💨", "Season": "🍂", "Moon Phase": "🌙"
  };
  return iconMap[traitType] || "🔹";
}

main().catch((error) => {
  console.error("💥 Critical error:", error);
  process.exitCode = 1;
});

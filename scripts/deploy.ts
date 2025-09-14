// scripts/deploy.ts - Enhanced deployment script

import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Enhanced EvolvNFT...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  Warning: Low balance. You may need more ETH for deployment.");
  }

  try {
    // Deploy the contract
    console.log("\n📦 Deploying EvolvNFT contract...");
    const EvolvNFT = await ethers.getContractFactory("EvolvNFT");
    const evolvNFT = await EvolvNFT.deploy();

    console.log("⏳ Waiting for deployment confirmation...");
    await evolvNFT.waitForDeployment();

    const contractAddress = await evolvNFT.getAddress();
    console.log("✅ EvolvNFT deployed successfully!");
    console.log("📍 Contract address:", contractAddress);

    // Verify contract ownership
    const owner = await evolvNFT.owner();
    const oracleAddress = await evolvNFT.oracleAddress();
    
    console.log("\n🔍 Contract Information:");
    console.log("👑 Owner:", owner);
    console.log("🔮 Oracle Address:", oracleAddress);

    // Display network information
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name);
    console.log("🆔 Chain ID:", network.chainId.toString());

    console.log("\n🎯 Next Steps:");
    console.log("1. Update CONTRACT_ADDRESS in your frontend lib/blockchain.ts:");
    console.log(`   export const CONTRACT_ADDRESS = '${contractAddress}';`);
    console.log("\n2. Update contract address in scripts/oracle.ts:");
    console.log(`   const contractAddress = '${contractAddress}';`);
    console.log("\n3. Run the oracle to evolve your NFTs:");
    console.log("   npm run oracle");
    console.log("\n4. Mint your first NFT:");
    console.log("   npm run mint");

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      deployer: deployer.address,
      network: network.name,
      chainId: network.chainId.toString(),
      deployedAt: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
    };

    console.log("\n💾 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("💥 Critical error:", error);
  process.exitCode = 1;
});
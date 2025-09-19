import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify"; // ** Import the verification plugin
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
require('dotenv').config();

// --- Securely get the private key from the .env file ---
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    somniaTestnet: {
      url: process.env.SOMNIA_RPC_URL || "https://rpc.ankr.com/somnia_testnet/",
      chainId: 50312,
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    },
  },
  // ** Add the verification configuration block **
  etherscan: {
    apiKey: {
      // The key MUST match the network name in the 'networks' object
      somniaTestnet: "NO_API_KEY", // Blockscout explorers usually don't need a key
    },
    customChains: [
      {
        network: "somniaTestnet", // Must match the network name above
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
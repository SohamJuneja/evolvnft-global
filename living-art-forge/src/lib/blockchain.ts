// Updated lib/blockchain.ts - Enhanced with real-world factors

import { ethers } from 'ethers';

// Somnia Testnet Configuration
export const SOMNIA_TESTNET = {
  chainId: 50312,
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: ['https://50312.rpc.thirdweb.com'],
  blockExplorerUrls: ['https://somnia-testnet.blockscout.com'],
};

// Contract Configuration - UPDATE THIS WITH YOUR NEW CONTRACT ADDRESS
export const CONTRACT_ADDRESS = '0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9';

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "locationId",
        "type": "uint256"
      }
    ],
    "name": "mintWithLocation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getTokenData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "power",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "brightness",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "level",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "starlight",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "humidity",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "windSpeed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "season",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "moonPhase",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "locationId",
            "type": "uint256"
          }
        ],
        "internalType": "struct EvolvNFT.DynamicTraits",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getTokenLocation",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Enhanced NFT interface with all new traits
export interface EvolvNFT {
  tokenId: number;
  name: string;
  image: string;
  level: number;
  power: number;
  brightness: number;
  starlight?: number;
  humidity?: number;
  windSpeed?: number;
  season?: number;
  moonPhase?: number;
  owner: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Trait type definitions
export type TraitType = 
  | "Level"
  | "Power" 
  | "Brightness"
  | "Starlight"
  | "Humidity"
  | "Wind Speed"
  | "Season"
  | "Moon Phase";

// Enhanced trait interface
export interface EnhancedTrait {
  trait_type: TraitType;
  value: string | number;
  description?: string;
  icon?: string;
  category?: "Environmental" | "Astronomical" | "Core";
}

// Utility functions for trait display
export function getTraitIcon(traitType: TraitType): string {
  const iconMap: Record<TraitType, string> = {
    "Level": "📊",
    "Power": "⚡",
    "Brightness": "✨",
    "Starlight": "🌟",
    "Humidity": "💧",
    "Wind Speed": "💨",
    "Season": "🍂",
    "Moon Phase": "🌙"
  };
  return iconMap[traitType] || "🔹";
}

export function getTraitCategory(traitType: TraitType): "Environmental" | "Astronomical" | "Core" {
  const categoryMap: Record<TraitType, "Environmental" | "Astronomical" | "Core"> = {
    "Level": "Core",
    "Power": "Core", 
    "Brightness": "Core",
    "Starlight": "Astronomical",
    "Humidity": "Environmental",
    "Wind Speed": "Environmental",
    "Season": "Astronomical",
    "Moon Phase": "Astronomical"
  };
  return categoryMap[traitType] || "Core";
}

export function getTraitDescription(traitType: TraitType): string {
  const descriptionMap: Record<TraitType, string> = {
    "Level": "Evolution level - increases with each update",
    "Power": "Energy level influenced by temperature",
    "Brightness": "Visual brightness affected by weather conditions",
    "Starlight": "Celestial glow visible during night hours",
    "Humidity": "Atmospheric moisture creating particle effects",
    "Wind Speed": "Environmental energy causing rotation effects",
    "Season": "Current season affecting background aesthetics", 
    "Moon Phase": "Lunar cycle influencing mystical properties"
  };
  return descriptionMap[traitType] || "Dynamic trait";
}

export function getSeasonName(season: number): string {
  const seasons = ["Spring", "Summer", "Autumn", "Winter"];
  return seasons[season] || "Unknown";
}

export function getMoonPhaseName(phase: number): string {
  const phases = [
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
  ];
  return phases[phase] || "Unknown";
}

// Wallet connection utilities
export const connectWallet = async (): Promise<ethers.BrowserProvider | null> => {
  if (!window.ethereum) {
    alert('Please install MetaMask to use this dApp');
    return null;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (parseInt(chainId, 16) !== SOMNIA_TESTNET.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${SOMNIA_TESTNET.chainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${SOMNIA_TESTNET.chainId.toString(16)}`,
                chainName: SOMNIA_TESTNET.chainName,
                nativeCurrency: SOMNIA_TESTNET.nativeCurrency,
                rpcUrls: SOMNIA_TESTNET.rpcUrls,
                blockExplorerUrls: SOMNIA_TESTNET.blockExplorerUrls,
              },
            ],
          });
        }
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
};

// Contract interaction utilities
export const getContract = async (provider: ethers.BrowserProvider) => {
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// Enhanced function to get NFT data from both contract and metadata
export const getTokenDataFromContract = async (
  tokenId: number, 
  provider: ethers.BrowserProvider
): Promise<EvolvNFT | null> => {
  try {
    const contract = await getContract(provider);
    
    // Get token data directly from contract
    const tokenData = await contract.getTokenData(tokenId);
    const tokenURI = await contract.tokenURI(tokenId);
    const owner = await contract.ownerOf(tokenId);
    
    // Parse metadata for name and image
    let metadata = null;
    try {
      if (tokenURI.startsWith('data:application/json;base64,')) {
        const base64Data = tokenURI.split(',')[1];
        const jsonString = atob(base64Data);
        metadata = JSON.parse(jsonString);
      } else if (tokenURI.startsWith('http')) {
          // Fetch HTTP metadata with cache-busting to avoid stale cached responses
          const url = new URL(tokenURI);
          url.searchParams.set('_ts', String(Date.now()));
          const response = await fetch(url.toString(), { cache: 'no-store' });
          if (response.ok) {
            metadata = await response.json();
          }
        }
    } catch (metadataError) {
      console.warn('Could not parse metadata, using contract data only:', metadataError);
    }
    
    // Combine contract data with metadata
    const result: EvolvNFT = {
      tokenId: tokenId,
      name: metadata?.name || `EvolvNFT #${tokenId}`,
      image: metadata?.image || '',
      level: Number(tokenData.level) || 1,
      power: Number(tokenData.power) || 0,
      brightness: Number(tokenData.brightness) || 0,
      starlight: Number(tokenData.starlight) || 0,
      humidity: Number(tokenData.humidity) || 0,
      windSpeed: Number(tokenData.windSpeed) || 0,
      season: Number(tokenData.season) || 0,
      moonPhase: Number(tokenData.moonPhase) || 0,
      owner: owner || '',
      attributes: metadata?.attributes || [],
    };
    
    console.log('Token data from contract:', tokenData);
    console.log('Combined NFT result:', result);
    
    return result;
  } catch (error) {
    console.error('Error getting token data from contract:', error);
    return null;
  }
};

// Enhanced NFT parsing with new traits - FIXED VERSION (Fallback for when contract data isn't available)
export const parseTokenURI = async (tokenURI: string): Promise<EvolvNFT | null> => {
  try {
    let metadata;
    
    // Handle data URI
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64Data = tokenURI.split(',')[1];
      const jsonString = atob(base64Data);
      metadata = JSON.parse(jsonString);
    }
    // Handle HTTP URLs
    else if (tokenURI.startsWith('http')) {
      const response = await fetch(tokenURI);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      metadata = await response.json();
    }
    else {
      console.warn('Unsupported tokenURI format:', tokenURI);
      return null;
    }

    // Validate metadata structure
    if (!metadata || typeof metadata !== 'object') {
      console.error('Invalid metadata structure:', metadata);
      return null;
    }

    // Enhanced helper function to find attribute value with better error handling
    const getAttributeValue = (traitType: string | string[], fallbackValue: number = 0): number => {
      try {
        if (!metadata.attributes || !Array.isArray(metadata.attributes)) {
          console.warn('No attributes array found in metadata');
          return fallbackValue;
        }
    
        const traitTypes = Array.isArray(traitType) ? traitType : [traitType];
    
        // Try each traitType in order until one matches
        for (const t of traitTypes) {
          let attr = metadata.attributes.find((attr: any) => 
            attr && attr.trait_type === t
          );
    
          if (!attr) {
            attr = metadata.attributes.find((attr: any) => 
              attr && attr.trait_type && attr.trait_type.toLowerCase() === t.toLowerCase()
            );
          }
    
          if (attr) {
            let value = attr.value;
    
            if (value === null || value === undefined) {
              return fallbackValue;
            }
    
            if (typeof value === 'string') {
              if (value.trim() === '') {
                return fallbackValue;
              }
    
              const numValue = parseInt(value.trim(), 10);
              if (isNaN(numValue)) {
                console.warn(`Invalid numeric value for ${t}: "${value}"`);
                return fallbackValue;
              }
              return numValue;
            }
    
            if (typeof value === 'number') {
              return isNaN(value) ? fallbackValue : Math.floor(value);
            }
    
            if (typeof value === 'boolean') {
              return value ? 1 : 0;
            }
    
            console.warn(`Unexpected value type for ${t}:`, typeof value, value);
            return fallbackValue;
          }
        }
    
        console.warn(`Attribute '${traitTypes.join(', ')}' not found in metadata`);
        return fallbackValue;
      } catch (error) {
        console.error(`Error getting attribute value for ${traitType}:`, error);
        return fallbackValue;
      }
    };
    
    // Debug logging to help troubleshoot
    console.log('Parsing metadata:', {
      name: metadata.name,
      tokenId: metadata.tokenId,
      attributesCount: metadata.attributes?.length || 0,
      attributes: metadata.attributes?.map((attr: any) => ({
        trait_type: attr.trait_type,
        value: attr.value,
        valueType: typeof attr.value
      }))
    });
    
    const result: EvolvNFT = {
      tokenId: metadata.tokenId || 0,
      name: metadata.name || 'EvolvNFT',
      image: metadata.image || '',
      level: getAttributeValue('Level', 1),
      power: getAttributeValue('Power', 0),
      brightness: getAttributeValue('Brightness', 0),
      starlight: getAttributeValue(['Starlight', 'Star Light', 'starlight'], 0),
      humidity: getAttributeValue(['Humidity', 'humidity'], 0),
      windSpeed: getAttributeValue(['Wind Speed', 'WindSpeed', 'wind_speed', 'windSpeed'], 0),
      season: getAttributeValue(['Season', 'season'], 0),
      moonPhase: getAttributeValue(['Moon Phase', 'MoonPhase', 'moon_phase', 'moonPhase'], 0),
      owner: '',
      attributes: metadata.attributes || [],
    };
    

    console.log('Parsed NFT result:', result);
    return result;
    
  } catch (error) {
    console.error('Error parsing token URI:', error);
    console.error('Token URI that failed:', tokenURI);
    return null;
  }
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}
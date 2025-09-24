import { useState } from 'react';
import { ethers } from 'ethers';
import Header from '@/components/Header';
import LocationSelector from '@/components/LocationSelector';
import { connectWallet, getContract } from '@/lib/blockchain';
import { Sparkles, Zap, ArrowRight, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-bg.jpg';

// Configuration - Regular minting only for demo
const RELAYER_URL = null; // Disabled for demo
const NEW_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9";

// Relayer disabled for clean demo
const isRelayerAvailable = false;

const contractABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPower","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newBrightness","type":"uint256"}],"name":"Evolved","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"newPower","type":"uint256"},{"internalType":"uint256","name":"newBrightness","type":"uint256"}],"name":"evolve","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"mintFor","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"locationId","type":"uint256"}],"name":"mintWithLocation","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"mintFor","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"oracleAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"relayerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_oracleAddress","type":"address"}],"name":"setOracleAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_relayerAddress","type":"address"}],"name":"setRelayerAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

type MintStatus = 'idle' | 'connecting' | 'signing' | 'relaying' | 'success' | 'error';

// Custom notification component
interface NotificationProps {
  type: 'info' | 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}

const Notification = ({ type, title, message, onClose }: NotificationProps) => {
  const bgColor = type === 'error' ? 'bg-red-500/10' : type === 'success' ? 'bg-green-500/10' : 'bg-blue-500/10';
  const borderColor = type === 'error' ? 'border-red-500/20' : type === 'success' ? 'border-green-500/20' : 'border-blue-500/20';
  const iconColor = type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-400' : 'text-blue-400';
  const textColor = type === 'error' ? 'text-red-200' : type === 'success' ? 'text-green-200' : 'text-blue-200';

  const Icon = type === 'error' ? AlertCircle : type === 'success' ? Check : Sparkles;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg border ${bgColor} ${borderColor} backdrop-blur-sm animate-slide-in`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 ${iconColor}`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${textColor}`}>{title}</h4>
          <p className={`text-sm mt-1 ${textColor}/80`}>{message}</p>
        </div>
        <button onClick={onClose} className={`${textColor}/60 hover:${textColor} transition-colors`}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Forge = () => {
  const [mintStatus, setMintStatus] = useState<MintStatus>('idle');
  const [selectedLocation, setSelectedLocation] = useState<number>(3); // Default to Tokyo
  const [txHash, setTxHash] = useState<string>('');
  const [notification, setNotification] = useState<{
    type: 'info' | 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);
  const { toast } = useToast();

  const showNotification = (type: 'info' | 'success' | 'error', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000); // Auto-close after 5 seconds
  };

  const handleRegularMint = async () => {
    try {
      setMintStatus('connecting');
      showNotification('info', 'Connecting Wallet', 'Please connect your wallet to continue...');

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask and try again.');
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      // Small delay before next operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMintStatus('signing');
      showNotification('info', 'Confirm Transaction', 'Please confirm the transaction in your wallet...');
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, contractABI, signer);
      
      // Call mintWithLocation function with selected location
      const estimatedGas = await contract.mintWithLocation.estimateGas(address, selectedLocation);
      const tx = await contract.mintWithLocation(address, selectedLocation, {
        gasLimit: estimatedGas + 20000n // Add buffer
      });
      setTxHash(tx.hash);
      
      setMintStatus('relaying');
      showNotification('info', 'Transaction Submitted', 'Your mint transaction is being processed...');
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setMintStatus('success');
        showNotification('success', 'NFT Minted Successfully!', `Your living NFT has been created! It will begin evolving in 30 seconds.`);
      } else {
        throw new Error('Transaction failed during execution.');
      }
      
    } catch (error: any) {
      console.error('Regular mint error:', error);
      let errorMessage = "An unexpected error occurred during minting.";
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = "Transaction was cancelled. Please try again when you're ready to mint.";
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = "Insufficient funds to pay for gas. Please add some ETH to your wallet.";
      } else if (error.message.includes('rate limit') || error.code === -32005) {
        errorMessage = "Rate limit reached. Please wait a moment and try again.";
      } else if (error.message.includes('MetaMask')) {
        errorMessage = error.message;
      }
      
      setMintStatus('idle');
      showNotification('error', 'Minting Failed', errorMessage);
    }
  };

  const handleGaslessMint = async () => {
    try {
      // Check if relayer is available in production
      if (import.meta.env.PROD && !import.meta.env.VITE_RELAYER_URL) {
        showNotification('error', 'Gasless Minting Unavailable', 'Gasless minting is temporarily unavailable. Please use regular minting with MetaMask.');
        return;
      }

      setMintStatus('connecting');
      showNotification('info', 'Connecting Wallet', 'Please connect your wallet to continue...');

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask and try again.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      setMintStatus('signing');
      showNotification('info', 'Please Sign Message', 'Sign the message in your wallet to prove your intent to mint. This is completely free!');
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, contractABI, provider);
      const nonce = await contract.nonces(address);

      console.log('Debug Info:', {
        userAddress: address,
        contractAddress: NEW_CONTRACT_ADDRESS,
        nonce: nonce.toString(),
        chainId: (await provider.getNetwork()).chainId
      });

      const domain = {
        name: 'EvolvNFT',
        version: '1',
        chainId: (await provider.getNetwork()).chainId,
        verifyingContract: NEW_CONTRACT_ADDRESS
      };

      const types = {
        Mint: [
          { name: 'to', type: 'address' },
          { name: 'nonce', type: 'uint256' }
        ]
      };

      const value = { to: address, nonce: nonce };
      const signature = await signer.signTypedData(domain, types, value);

      console.log('Signature created:', signature);

      setMintStatus('relaying');
      showNotification('success', 'Signature Received!', 'Relaying your mint transaction to the network...');
      
      const relayPayload = {
        to: address,
        nonce: nonce.toString(),
        signature: signature,
        chainId: (await provider.getNetwork()).chainId.toString()
      };

      console.log('Sending to relayer:', relayPayload);
      console.log('Relayer URL:', RELAYER_URL);
      
      // Add timeout and better error handling for relayer request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      let response;
      try {
        response = await fetch(RELAYER_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(relayPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Relayer request timed out. The service may be unavailable.');
        } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('CONNECTION_REFUSED')) {
          throw new Error('Relayer service is unavailable. Please try regular minting with MetaMask.');
        }
        throw fetchError;
      }
      
      console.log('Relayer response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Relayer error response:', errorText);
        throw new Error(`Relayer server error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Relayer response data:', data);

      if (data.success) {
        setMintStatus('success');
        setTxHash(data.txHash);
        showNotification('success', 'NFT Forged Successfully!', 'Your living NFT has been created and is now evolving on-chain.');
        toast({
          title: "NFT Forged Successfully!",
          description: "Your living NFT has been created and is now evolving.",
        });
      } else {
        throw new Error(data.details || data.error || 'Relayer failed to process the transaction.');
      }

    } catch (error: any) {
      console.error('Gasless minting error:', error);
      setMintStatus('error');
      
      let errorMessage = "Failed to forge NFT. Please try again.";
      
      if (error.code === 'ACTION_REJECTED' || error.message.includes('User rejected') || error.message.includes('user rejected')) {
        errorMessage = "Signature request was rejected. Please try again and approve the signature.";
      } else if (error.message.includes('MetaMask')) {
        errorMessage = error.message;
      } else if (error.message.includes('account does not exist')) {
        errorMessage = "Account configuration issue. Please check if the relayer account is properly funded and configured.";
      } else if (error.message.includes('Relayer server error')) {
        errorMessage = `Server error: ${error.message}. Please check if the relayer service is running.`;
      } else if (error.message.includes('Relayer service is unavailable')) {
        errorMessage = "Gasless minting is temporarily unavailable. Please use regular minting with MetaMask.";
      } else if (error.code === -32603) {
        errorMessage = "Network error occurred. Please check your connection and try again.";
      }
      
      showNotification('error', 'Forging Failed', errorMessage);
      toast({
        title: "Forging Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetMint = () => {
    setMintStatus('idle');
    setTxHash('');
    setNotification(null);
  };

  const getMintButtonContent = () => {
    switch (mintStatus) {
      case 'connecting':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting Wallet...</span>
          </>
        );
      case 'signing':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Check Wallet to Sign</span>
          </>
        );
      case 'relaying':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Relaying Transaction...</span>
          </>
        );
      case 'success':
        return (
          <>
            <Check className="w-5 h-5" />
            <span>Forged Successfully!</span>
          </>
        );
      case 'error':
        return (
          <>
            <Zap className="w-5 h-5" />
            <span>Try Again</span>
          </>
        );
      default:
        return (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Forge Your Living NFT (Gasless)</span>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Cyber Foundry Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            {/* Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="p-4 rounded-full bg-primary/20 animate-cyber-glow">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Assets That
              <span className="block text-primary animate-living-pulse">Live</span>
              <span className="block">Art That Evolves</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Welcome to the Cyber Foundry, where your NFTs are born with life itself. 
              Each asset evolves in real-time, powered by on-chain generation and oracle data.
              <span className="block mt-2 text-lg text-secondary font-semibold">Mint your living NFT on Somnia's ultra-fast blockchain!</span>
            </p>
            
            {/* CTA Button */}
            <div className="space-y-8">
              {/* Location Selector */}
              <div className="max-w-lg mx-auto">
                <LocationSelector
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                  disabled={['connecting', 'signing', 'relaying'].includes(mintStatus)}
                />
              </div>

              {/* Mint Button */}
              <button
                onClick={mintStatus === 'success' ? resetMint : handleRegularMint}
                disabled={['connecting', 'signing', 'relaying'].includes(mintStatus)}
                className="forge-btn flex items-center space-x-3 mx-auto min-w-[320px] justify-center"
              >
                {getMintButtonContent()}
              </button>
              
              {txHash && (
                <p className="text-sm text-muted-foreground">
                  Transaction:{' '}
                  <a
                    href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How The Forge Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to create your living digital artifact
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="glass-card p-8 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:animate-living-pulse">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Forge Your NFT</h3>
              <p className="text-muted-foreground">
                Mint your NFT with unique DNA generated 100% on-chain. No IPFS, no external storage. Small gas fee on Somnia's efficient network.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="glass-card p-8 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6 group-hover:secondary-glow">
                <Zap className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Evolve</h3>
              <p className="text-muted-foreground">
                Watch your NFT evolve in real-time as oracle data updates its power and brightness.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="glass-card p-8 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:animate-cyber-glow">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Collect</h3>
              <p className="text-muted-foreground">
                Build your collection of living assets that continue evolving even as you sleep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Truly Living NFTs
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Unlike static JPEGs, your EvolvNFTs are dynamic entities that change based on real-world data.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">100% On-Chain Generation</h3>
                    <p className="text-muted-foreground">SVG artwork and metadata generated entirely on the blockchain</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Oracle-Driven Evolution</h3>
                    <p className="text-muted-foreground">Real-time data feeds continuously update your NFT's attributes</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Gasless Minting</h3>
                    <p className="text-muted-foreground">Your first living NFT is completely free - no gas fees required</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Permanent & Decentralized</h3>
                    <p className="text-muted-foreground">No external dependencies - your NFT lives forever on-chain</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-card p-8 animate-living-pulse">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-24 h-24 text-primary animate-cyber-glow" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Level</span>
                    <span className="text-foreground font-semibold">∞</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Power</span>
                    <span className="text-secondary font-semibold">Evolving...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Brightness</span>
                    <span className="text-primary font-semibold">Real-time</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="text-green-400 font-semibold">FREE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Forge;
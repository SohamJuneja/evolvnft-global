import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LocationSelector from '@/components/LocationSelector';

// --- Configuration ---
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9";
const correctChainId = "50312";
const blockExplorerUrl = "https://shannon-explorer.somnia.network";

// Smart contract ABI
const abi = [
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
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

type MintStatus = 'idle' | 'connecting' | 'confirming' | 'minting' | 'success' | 'error';

const Index = () => {
  const [mintStatus, setMintStatus] = useState<MintStatus>('idle');
  const [selectedLocation, setSelectedLocation] = useState<number>(0); // Default to San Francisco
  const [txHash, setTxHash] = useState<string>('');
  const [newTokenId, setNewTokenId] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [account, setAccount] = useState<string | null>(null);

  // Effect to check for connected account on load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.log('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

  }, []);

  const handleMint = async () => {
    try {
      setMintStatus('connecting');
      if (!window.ethereum) {
        toast({ title: "Wallet not found", description: "Please install MetaMask.", variant: "destructive"});
        setMintStatus('error');
        return;
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const network = await provider.getNetwork();
      if(network.chainId.toString() !== correctChainId) {
        toast({ title: "Wrong Network", description: `Please switch to Somnia Testnet (Chain ID: ${correctChainId})`, variant: "destructive"});
        setMintStatus('error');
        return;
      }

      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setMintStatus('confirming');
      
      const contract = new ethers.Contract(contractAddress, abi, signer);

      setMintStatus('minting');
      const tx = await contract.mintWithLocation(address, selectedLocation);
      setTxHash(tx.hash);

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setMintStatus('success');
        let newTokenId = null;
        if (receipt.logs) {
          const iface = new ethers.Interface(abi);
          for (const log of receipt.logs) {
            try {
              const decodedLog = iface.parseLog(log);
              if (decodedLog && decodedLog.name === "Transfer" && decodedLog.args.to.toLowerCase() === address.toLowerCase()) {
                newTokenId = decodedLog.args.tokenId.toString();
                setNewTokenId(newTokenId);
                break; 
              }
            } catch (e) { /* ignore other logs */ }
          }
        }

        toast({
          title: "🎉 NFT Forged Successfully!",
          description: newTokenId ? `Your living NFT #${newTokenId} has been created and will start evolving based on real weather!` : "Your NFT has been created and will start evolving!",
        });

        // Auto-navigate to collection after a delay
        setTimeout(() => {
          navigate('/collection');
        }, 3000);
      } else {
        throw new Error("Transaction failed");
      }

    } catch (error: unknown) {
      console.error('Minting error:', error);
      setMintStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('user rejected')) {
        toast({ title: "Transaction Cancelled", description: "You cancelled the transaction.", variant: "destructive" });
      } else if (errorMessage.includes('insufficient funds')) {
        toast({ title: "Insufficient Funds", description: "Not enough ETH for gas fees.", variant: "destructive" });
      } else {
        toast({ title: "Minting Failed", description: errorMessage, variant: "destructive" });
      }
    }
  };

  const resetMint = () => {
    setMintStatus('idle');
    setTxHash('');
    setNewTokenId('');
  };

  const getMintButtonContent = () => {
    switch (mintStatus) {
      case 'connecting':
        return <><Loader2 className="w-5 h-5 animate-spin" /><span>Connecting Wallet...</span></>;
      case 'confirming':
        return <><Loader2 className="w-5 h-5 animate-spin" /><span>Please Confirm...</span></>;
      case 'minting':
        return <><Loader2 className="w-5 h-5 animate-spin" /><span>Forging Your NFT...</span></>;
      case 'success':
        return <><Check className="w-5 h-5" /><span>Success! View Collection</span></>;
      case 'error':
        return <><Zap className="w-5 h-5" /><span>Try Again</span></>;
      default:
        return <><Sparkles className="w-5 h-5" /><span>Forge Your Living NFT</span></>;
    }
  };

  const SimpleHeader = () => (
    <header className="py-4 px-8 flex justify-between items-center border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-primary">EvolvNFT Forge</h1>
      <nav className="flex items-center space-x-6">
        <a href="/collection" className="text-muted-foreground hover:text-primary transition-colors">My Collection</a>
        {account ? (
          <div className="glass-card text-sm px-4 py-2">
            {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
          </div>
        ) : (
          <button onClick={handleMint} className="connect-btn">
            Connect Wallet
          </button>
        )}
      </nav>
    </header>
  );

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background/80 to-black opacity-80"></div>
        <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: 'url(/hero-bg.jpg)', backgroundSize: 'cover'}}></div>

        <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <div className="flex space-x-1">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Assets That
              <span className="block text-primary animate-living-pulse">Live</span>
              <span className="block">Art That Evolves</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Welcome to the Cyber Foundry, where your NFTs are born with life itself. 
              Each asset evolves in real-time, powered by on-chain generation and oracle data.
            </p>
            
            {/* Location Selection */}
            <div className="mb-8 max-w-2xl mx-auto">
              <LocationSelector 
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
                disabled={['connecting', 'confirming', 'minting'].includes(mintStatus)}
              />
            </div>
            
            <div className="space-y-4">
              <button
                onClick={mintStatus === 'success' || mintStatus === 'error' ? resetMint : handleMint}
                disabled={['connecting', 'confirming', 'minting'].includes(mintStatus)}
                className="forge-btn flex items-center space-x-3 mx-auto min-w-[280px] justify-center"
              >
                {getMintButtonContent()}
              </button>
              
              {txHash && (
                <p className="text-sm text-muted-foreground">
                  Transaction:{' '}
                  <a
                    href={`${blockExplorerUrl}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </a>
                </p>
              )}

              {mintStatus === 'success' && newTokenId && (
                <div className="text-center mt-6 p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">🎉 Your NFT is Alive!</h3>
                  <p className="text-muted-foreground mb-4">
                    NFT #{newTokenId} has been forged and will start evolving based on real weather data from your chosen city!
                  </p>
                  <button 
                    onClick={() => navigate('/collection')}
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <span>View Your Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
            Why Your NFT Will Be <span className="text-primary">Legendary</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">🌍 Global Weather Integration</h3>
              <p className="text-muted-foreground">
                Choose from 6 world cities! Your NFT evolves based on real weather from San Francisco, New York, London, Tokyo, Bengaluru, or Delhi.
              </p>
            </div>

            <div className="glass-card p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">⚡ Real-Time Evolution</h3>
              <p className="text-muted-foreground">
                Watch your NFT transform every minute based on temperature, weather conditions, time of day, and astronomical events.
              </p>
            </div>

            <div className="glass-card p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">🎨 100% On-Chain Art</h3>
              <p className="text-muted-foreground">
                Fully decentralized SVG generation with dynamic traits. No IPFS dependencies - your art lives forever on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

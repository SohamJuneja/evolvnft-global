// Updated Collection.tsx - Enhanced with real-world factors display

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from '@/components/Header';
import { getTokenDataFromContract } from '../lib/blockchain';
import NFTCard from '@/components/NFTCard';
import { 
  getContract, 
  parseTokenURI, 
  EvolvNFT, 
  TraitType, 
  EnhancedTrait,
  getTraitIcon, 
  getTraitCategory, 
  getTraitDescription,
  getSeasonName,
  getMoonPhaseName,
  connectWallet
} from '@/lib/blockchain';
import { Sparkles, RefreshCw, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { weatherService, WeatherData } from '@/lib/weather';
import { evolutionService } from '@/lib/evolution';
import EvolutionGallery from '@/components/EvolutionGallery';
import EvolutionPredictor from '@/components/EvolutionPredictor';

const Collection = () => {
  const [nfts, setNfts] = useState<EvolvNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<number | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<EvolvNFT | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showEvolutionGallery, setShowEvolutionGallery] = useState<EvolvNFT | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCollection();
    fetchCurrentWeather();
    // Setup contract event listener for Evolved events so UI updates automatically
    let provider: any = null;
    let contract: any = null;

    (async () => {
      try {
        provider = await connectWallet();
        if (!provider) return;
        contract = await getContract(provider);

        // Listen for Evolved(tokenId, newPower, newBrightness, ...)
        contract.on && contract.on('Evolved', (tokenId: any) => {
          try {
            const id = Number(tokenId.toString());
            // If we already have this token in the UI, refresh it
            if (nfts.find(n => n.tokenId === id)) {
              handleRefreshNFT(id);
            }
          } catch (err) {
            console.error('Error handling Evolved event:', err);
          }
        });
      } catch (err) {
        // Ignore provider errors during initial load
      }
    })();

    // Cleanup on unmount
    return () => {
      try {
        if (contract && contract.off) {
          contract.off('Evolved');
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const fetchCurrentWeather = async () => {
    try {
      const weather = await weatherService.getCurrentWeather();
      setWeatherData(weather);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      // Fallback to mock data if API fails
      setWeatherData({
        temperature: 25,
        humidity: 65,
        windSpeed: 12,
        description: "partly cloudy",
        visibility: 10,
        pressure: 1013,
        timezone: "Asia/Kolkata",
        sunrise: Date.now() / 1000 - 3600, // 1 hour ago
        sunset: Date.now() / 1000 + 7200   // 2 hours from now
      });
    }
  };

  const loadCollection = async () => {
    setLoading(true);
    try {
      const provider = await connectWallet();
      if (!provider) {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask to view your collection.",
          variant: "destructive",
        });
        return;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      const contract = await getContract(provider);
      
      const currentBlockNumber = await provider.getBlockNumber();
      console.log(`Fetching data from block #${currentBlockNumber}`);
      
      const balance = await contract.balanceOf(address, { blockTag: "latest" });
      const tokenCount = Number(balance);

      if (tokenCount === 0) {
        setNfts([]);
        return;
      }

      const ownedNFTs: EvolvNFT[] = [];
      
      // Check tokens up to a reasonable limit
      for (let i = 0; i <= Math.min(50, tokenCount * 3); i++) {
        try {
          const owner = await contract.ownerOf(i, { blockTag: "latest" });
          if (owner.toLowerCase() === address.toLowerCase()) {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log(`Fetching data for NFT #${i}`);
            
            // Use the new function to get complete data from contract
            const nftData = await getTokenDataFromContract(i, provider);
            
            if (nftData) {
              nftData.tokenId = i;
              nftData.owner = address;
              ownedNFTs.push(nftData);
              console.log(`Successfully loaded NFT #${i}:`, nftData);
            }
          }
        } catch (error) {
          // Token doesn't exist or we don't own it, continue
          continue;
        }
      }

      setNfts(ownedNFTs);
      
      if (ownedNFTs.length > 0) {
        toast({
          title: "Collection loaded",
          description: `Found ${ownedNFTs.length} living NFT${ownedNFTs.length === 1 ? '' : 's'} in your collection.`,
        });
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      toast({
        title: "Error loading collection",
        description: "Failed to load your NFTs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshNFT = async (tokenId: number) => {
    setRefreshing(tokenId);
    try {
      const provider = await connectWallet();
      if (!provider) return;

      console.log(`Refreshing NFT #${tokenId}`);
      
      // Get old NFT data for comparison
      const oldNFT = nfts.find(nft => nft.tokenId === tokenId);
      
      // Get updated data directly from contract
      const updatedNFT = await getTokenDataFromContract(tokenId, provider);
      
      if (updatedNFT) {
        updatedNFT.tokenId = tokenId;
        
        // If traits changed and we have weather data, record evolution
        if (oldNFT && weatherData && (
          oldNFT.power !== updatedNFT.power || 
          oldNFT.brightness !== updatedNFT.brightness ||
          oldNFT.level !== updatedNFT.level
        )) {
          evolutionService.addEvolutionToHistory(
            tokenId,
            oldNFT,
            updatedNFT,
            weatherData
          );
        }
        
        setNfts(prev => prev.map(nft => 
          nft.tokenId === tokenId ? { ...updatedNFT, owner: nft.owner } : nft
        ));
        
        // Update the selected NFT if it's the one being refreshed
        if (selectedNFT && selectedNFT.tokenId === tokenId) {
          setSelectedNFT({ ...updatedNFT, owner: selectedNFT.owner });
        }
        
        console.log(`NFT #${tokenId} refreshed:`, updatedNFT);
        
        toast({
          title: `NFT #${tokenId} Updated!`,
          description: `Power: ${updatedNFT.power} | Level: ${updatedNFT.level} | Humidity: ${updatedNFT.humidity}`,
        });
      } else {
        throw new Error("Failed to get updated NFT data from contract.");
      }
    } catch (error) {
      console.error('Error refreshing NFT:', error);
      toast({
        title: "Refresh failed",
        description: "Failed to refresh NFT data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(null);
    }
  };

  const groupTraitsByCategory = (nft: EvolvNFT) => {
    const grouped: Record<string, EnhancedTrait[]> = {
      'Core': [],
      'Environmental': [],
      'Astronomical': []
    };

    // Create enhanced traits from NFT data
    const traits: EnhancedTrait[] = [
      { trait_type: "Level", value: nft.level },
      { trait_type: "Power", value: nft.power },
      { trait_type: "Brightness", value: nft.brightness },
      { trait_type: "Starlight", value: nft.starlight || 0 },
      { trait_type: "Humidity", value: nft.humidity || 0 },
      { trait_type: "Wind Speed", value: nft.windSpeed || 0 },
      { trait_type: "Season", value: getSeasonName(nft.season || 0) },
      { trait_type: "Moon Phase", value: getMoonPhaseName(nft.moonPhase || 0) }
    ];

    traits.forEach(trait => {
      const category = getTraitCategory(trait.trait_type as TraitType);
      const enhancedTrait: EnhancedTrait = {
        ...trait,
        icon: getTraitIcon(trait.trait_type as TraitType),
        description: getTraitDescription(trait.trait_type as TraitType),
        category
      };
      grouped[category].push(enhancedTrait);
    });

    return grouped;
  };

  const renderTraitGroup = (title: string, traits: EnhancedTrait[], colorClass: string) => (
    <div className={`bg-gradient-to-r ${colorClass} rounded-lg p-4 mb-4`}>
      <h4 className="font-semibold text-white mb-3 flex items-center">
        {title === 'Core' && '⭐'} 
        {title === 'Environmental' && '🌍'} 
        {title === 'Astronomical' && '🌙'} 
        {title} Traits
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {traits.map((trait, index) => (
          <div key={index} className="bg-white/20 backdrop-blur-sm rounded-md p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white flex items-center">
                {trait.icon} {trait.trait_type}
              </span>
              <span className="text-white font-bold">{trait.value}</span>
            </div>
            {trait.description && (
              <p className="text-xs text-white/80">{trait.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderEnhancedNFTCard = (nft: EvolvNFT) => {
    const groupedTraits = groupTraitsByCategory(nft);
    
    return (
      <div 
        key={nft.tokenId} 
        className="glass-card hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
      >
        {/* NFT Image */}
        <div className="relative">
          <img 
            src={nft.image} 
            alt={nft.name} 
            className="w-full h-64 object-cover rounded-t-xl"
          />
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            #{nft.tokenId}
          </div>
          {weatherData && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs">
              🌡️ {weatherData.temperature}°C
            </div>
          )}
          
          {/* View Details Button */}
          <button
            onClick={() => setSelectedNFT(nft)}
            className="absolute bottom-4 right-4 bg-primary/90 hover:bg-primary text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Evolution Gallery Button */}
          <button
            onClick={() => setShowEvolutionGallery(nft)}
            className="absolute bottom-4 left-4 bg-purple-500/90 hover:bg-purple-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            📊
          </button>
        </div>

        {/* NFT Info */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-2">{nft.name}</h3>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center bg-muted/20 rounded-lg p-2">
              <div className="text-lg">📊</div>
              <div className="text-xs text-muted-foreground">Level</div>
              <div className="font-bold text-foreground">{nft.level}</div>
            </div>
            <div className="text-center bg-muted/20 rounded-lg p-2">
              <div className="text-lg">⚡</div>
              <div className="text-xs text-muted-foreground">Power</div>
              <div className="font-bold text-foreground">{nft.power}</div>
            </div>
            <div className="text-center bg-muted/20 rounded-lg p-2">
              <div className="text-lg">✨</div>
              <div className="text-xs text-muted-foreground">Brightness</div>
              <div className="font-bold text-foreground">{nft.brightness}</div>
            </div>
          </div>

          {/* Environment Indicators */}
          <div className="flex justify-between items-center text-xs mb-4">
            <div className="flex items-center space-x-2">
              {groupedTraits.Environmental.slice(0, 2).map((trait, index) => (
                <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded">
                  {trait.icon} {trait.value}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              {groupedTraits.Astronomical.slice(0, 2).map((trait, index) => (
                <span key={index} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-2 py-1 rounded">
                  {trait.icon} {trait.value}
                </span>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Living NFT • Evolving with real-world data
            </div>
            <button
              onClick={() => handleRefreshNFT(nft.tokenId)}
              disabled={refreshing === nft.tokenId}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing === nft.tokenId ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!selectedNFT) return null;
    
    const groupedTraits = groupTraitsByCategory(selectedNFT);

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-background border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <button
              onClick={() => setSelectedNFT(null)}
              className="absolute top-4 right-4 z-10 bg-background/90 hover:bg-muted text-foreground rounded-full p-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Left: Image & Basic Info */}
              <div>
                <img 
                  src={selectedNFT.image} 
                  alt={selectedNFT.name}
                  className="w-full rounded-xl shadow-lg mb-4"
                />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {selectedNFT.name}
                </h2>
                <p className="text-muted-foreground mb-4">
                  A dynamic, living asset evolving with real-world conditions on the Somnia Network.
                </p>
                
                {weatherData && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                      🌍 Current Weather Conditions
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <div>🌡️ Temperature: {weatherData.temperature}°C</div>
                      <div>💧 Humidity: {weatherData.humidity}%</div>
                      <div>💨 Wind: {weatherData.windSpeed} m/s</div>
                      <div>☁️ Weather: {weatherData.description}</div>
                    </div>
                  </div>
                )}
                
                {/* Refresh button in modal */}
                <button
                  onClick={() => handleRefreshNFT(selectedNFT.tokenId)}
                  disabled={refreshing === selectedNFT.tokenId}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors mb-4"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing === selectedNFT.tokenId ? 'animate-spin' : ''}`} />
                  <span>{refreshing === selectedNFT.tokenId ? 'Updating...' : 'Refresh Data'}</span>
                </button>

                {/* Evolution Predictor */}
                <EvolutionPredictor nft={selectedNFT} className="mb-4" />

                {/* Evolution Gallery Button */}
                <button
                  onClick={() => setShowEvolutionGallery(selectedNFT)}
                  className="w-full bg-purple-500 text-white hover:bg-purple-600 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  📊 <span>View Evolution History</span>
                </button>
              </div>

              {/* Right: Detailed Traits */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  🎯 Living Traits
                </h3>
                
                {renderTraitGroup(
                  "Core", 
                  groupedTraits.Core, 
                  "from-blue-500 to-blue-600"
                )}
                
                {renderTraitGroup(
                  "Environmental", 
                  groupedTraits.Environmental, 
                  "from-green-500 to-green-600"
                )}
                
                {renderTraitGroup(
                  "Astronomical", 
                  groupedTraits.Astronomical, 
                  "from-purple-500 to-purple-600"
                )}

                <div className="mt-6 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">
                    🔄 Evolution Status
                  </h4>
                  <p className="text-white/90 text-sm">
                    This NFT evolves in real-time based on weather conditions, 
                    time of day, and astronomical events from around the world.
                  </p>
                  <div className="mt-2 text-xs text-white/80">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Sparkles className="w-8 h-8 text-primary animate-cyber-glow" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              🌍 My Living Collection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Your evolving digital artifacts, powered by real-world data from global locations.
            </p>
            
            {weatherData && (
              <div className="mb-6 inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-4 py-2 rounded-full text-sm">
                🌡️ Current: {weatherData.temperature}°C | 
                💧 {weatherData.humidity}% | 
                💨 {weatherData.windSpeed} m/s | 
                ☁️ {weatherData.description}
              </div>
            )}
            
            <button
              onClick={loadCollection}
              disabled={loading}
              className="connect-btn flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Collection</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-living-pulse w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Scanning the blockchain for your living NFTs...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && nfts.length === 0 && (
            <div className="text-center py-12">
              <div className="glass-card p-12 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">No Living NFTs Found</h3>
                <p className="text-muted-foreground mb-6">
                  Your collection is waiting to be born. Head to the Forge to mint your first living NFT.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="forge-btn"
                >
                  Visit The Forge
                </button>
              </div>
            </div>
          )}

          {/* Enhanced NFT Grid */}
          {!loading && nfts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map(renderEnhancedNFTCard)}
            </div>
          )}

          {/* Detail Modal */}
          {renderDetailModal()}

          {/* Evolution Gallery Modal */}
          {showEvolutionGallery && (
            <EvolutionGallery 
              nft={showEvolutionGallery} 
              onClose={() => setShowEvolutionGallery(null)} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Collection;
// Enhanced components/NFTCard.tsx with real-world factors

import { useState } from 'react';
import { RefreshCw, Eye, Activity, Zap, Sparkles } from 'lucide-react';
import { EvolvNFT, getSeasonName, getMoonPhaseName } from '@/lib/blockchain';

interface NFTCardProps {
  nft: EvolvNFT;
  onRefresh: (tokenId: number) => void;
  isRefreshing: boolean;
}

const NFTCard = ({ nft, onRefresh, isRefreshing }: NFTCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const getEvolutionStatus = () => {
    const level = nft.level;
    if (level >= 20) return { status: 'Legendary', color: 'text-yellow-500', icon: '👑' };
    if (level >= 15) return { status: 'Epic', color: 'text-purple-500', icon: '💎' };
    if (level >= 10) return { status: 'Rare', color: 'text-blue-500', icon: '⭐' };
    if (level >= 5) return { status: 'Uncommon', color: 'text-green-500', icon: '🌟' };
    return { status: 'Common', color: 'text-gray-500', icon: '✨' };
  };

  const getPowerLevel = () => {
    const power = nft.power;
    if (power >= 800) return { level: 'Maximum', color: 'bg-red-500' };
    if (power >= 600) return { level: 'High', color: 'bg-orange-500' };
    if (power >= 400) return { level: 'Medium', color: 'bg-yellow-500' };
    if (power >= 200) return { level: 'Low', color: 'bg-blue-500' };
    return { level: 'Minimal', color: 'bg-gray-500' };
  };

  const evolution = getEvolutionStatus();
  const powerLevel = getPowerLevel();

  return (
    <div className="glass-card group hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      {/* Header with Status */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
            <span>{evolution.icon}</span>
            <span className={evolution.color}>{evolution.status}</span>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
            #{nft.tokenId}
          </div>
        </div>

        {/* Power Level Indicator */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className={`${powerLevel.color} text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1`}>
            <Zap className="w-3 h-3" />
            <span>{powerLevel.level}</span>
          </div>
        </div>
      </div>

      {/* NFT Image */}
      <div className="relative overflow-hidden rounded-t-xl">
        {!imageLoaded && (
          <div className="w-full h-64 bg-muted/20 flex items-center justify-center">
            <div className="animate-living-pulse">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        )}
        <img
          src={nft.image}
          alt={nft.name}
          className={`w-full h-64 object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-center">
            <Eye className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">View Details</p>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-3">{nft.name}</h3>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center bg-muted/10 rounded-lg p-3 border border-muted/20">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xs text-muted-foreground mb-1">Level</div>
            <div className="font-bold text-foreground text-lg">{nft.level}</div>
          </div>
          
          <div className="text-center bg-muted/10 rounded-lg p-3 border border-muted/20">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs text-muted-foreground mb-1">Power</div>
            <div className="font-bold text-foreground text-lg">{nft.power}</div>
          </div>
          
          <div className="text-center bg-muted/10 rounded-lg p-3 border border-muted/20">
            <div className="text-2xl mb-1">✨</div>
            <div className="text-xs text-muted-foreground mb-1">Brightness</div>
            <div className="font-bold text-foreground text-lg">{nft.brightness}</div>
          </div>
        </div>

        {/* Enhanced Stats */}
        {(nft.starlight !== undefined || nft.humidity !== undefined || nft.windSpeed !== undefined) && (
          <div className="mb-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">🌍 Environmental Data</div>
            <div className="grid grid-cols-2 gap-2">
              {nft.starlight !== undefined && (
                <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
                  <span className="text-xs flex items-center">🌟 Starlight</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-400">{nft.starlight}</span>
                </div>
              )}
              
              {nft.humidity !== undefined && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                  <span className="text-xs flex items-center">💧 Humidity</span>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">{nft.humidity}%</span>
                </div>
              )}
              
              {nft.windSpeed !== undefined && (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                  <span className="text-xs flex items-center">💨 Wind</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">{nft.windSpeed}</span>
                </div>
              )}
              
              {nft.season !== undefined && (
                <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                  <span className="text-xs flex items-center">🍂 Season</span>
                  <span className="font-semibold text-orange-700 dark:text-orange-400">{getSeasonName(nft.season)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Moon Phase Display */}
        {nft.moonPhase !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🌙</span>
                <span className="text-sm font-medium text-indigo-800 dark:text-indigo-400">
                  {getMoonPhaseName(nft.moonPhase)}
                </span>
              </div>
              <div className="text-right">
                <div className="w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-700 relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-indigo-600 dark:bg-indigo-300"
                    style={{
                      clipPath: nft.moonPhase <= 4 
                        ? `circle(${(nft.moonPhase / 4) * 50}% at 50% 50%)`
                        : `circle(${((8 - nft.moonPhase) / 4) * 50}% at 50% 50%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-muted/20">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Activity className="w-3 h-3" />
            <span>Living NFT</span>
          </div>
          
          <button
            onClick={() => onRefresh(nft.tokenId)}
            disabled={isRefreshing}
            className="p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            title="Refresh NFT data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Evolution Progress */}
        <div className="mt-4 pt-4 border-t border-muted/20">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Evolution Progress</span>
            <span className="font-medium text-foreground">{nft.level}/∞</span>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 rounded-full h-2 transition-all duration-300"
              style={{ width: `${Math.min((nft.level / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
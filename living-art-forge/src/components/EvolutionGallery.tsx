import React, { useState, useEffect } from 'react';
import { EvolvNFT } from '@/lib/blockchain';
import { evolutionService, EvolutionHistoryEntry, EvolutionStats } from '@/lib/evolution';
import { Clock, TrendingUp, Activity, Zap, Eye, Calendar, ThermometerSun } from 'lucide-react';

interface EvolutionGalleryProps {
  nft: EvolvNFT;
  onClose: () => void;
}

const EvolutionGallery: React.FC<EvolutionGalleryProps> = ({ nft, onClose }) => {
  const [history, setHistory] = useState<EvolutionHistoryEntry[]>([]);
  const [stats, setStats] = useState<EvolutionStats | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<EvolutionHistoryEntry | null>(null);

  useEffect(() => {
    const historyData = evolutionService.getEvolutionHistory(nft.tokenId);
    const statsData = evolutionService.getEvolutionStats(nft.tokenId);
    
    setHistory(historyData);
    setStats(statsData);
  }, [nft.tokenId]);

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTraitChange = (oldValue: number = 0, newValue: number = 0) => {
    const change = newValue - oldValue;
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    return {
      change,
      isPositive,
      isNeutral,
      displayValue: isNeutral ? '=' : (isPositive ? `+${change}` : `${change}`),
      colorClass: isNeutral ? 'text-muted-foreground' : (isPositive ? 'text-green-500' : 'text-red-500')
    };
  };

  const renderTimelineEntry = (entry: EvolutionHistoryEntry, index: number) => {
    const levelChange = getTraitChange(entry.oldTraits.level, entry.newTraits.level);
    const powerChange = getTraitChange(entry.oldTraits.power, entry.newTraits.power);
    const brightnessChange = getTraitChange(entry.oldTraits.brightness, entry.newTraits.brightness);

    return (
      <div
        key={index}
        className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setSelectedEntry(entry)}
      >
        {/* Timeline dot */}
        <div className="flex-shrink-0 w-3 h-3 rounded-full bg-primary mt-2"></div>
        
        {/* Content */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Evolution #{history.length - index}
            </span>
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeAgo(entry.timestamp)}
            </span>
          </div>
          
          {/* Trait changes summary */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Level:</span>
              <span className={levelChange.colorClass}>{levelChange.displayValue}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Power:</span>
              <span className={powerChange.colorClass}>{powerChange.displayValue}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Brightness:</span>
              <span className={brightnessChange.colorClass}>{brightnessChange.displayValue}</span>
            </div>
          </div>
          
          {/* Weather and trigger */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <ThermometerSun className="w-3 h-3 mr-1" />
              {entry.weatherConditions.temperature}°C, {entry.weatherConditions.description}
            </div>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
              {entry.trigger}
            </span>
          </div>
        </div>
        
        {/* View details button */}
        <button className="p-1 text-muted-foreground hover:text-primary">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!selectedEntry) return null;

    const traitChanges = [
      { name: 'Level', old: selectedEntry.oldTraits.level, new: selectedEntry.newTraits.level, icon: '📊' },
      { name: 'Power', old: selectedEntry.oldTraits.power, new: selectedEntry.newTraits.power, icon: '⚡' },
      { name: 'Brightness', old: selectedEntry.oldTraits.brightness, new: selectedEntry.newTraits.brightness, icon: '✨' },
      { name: 'Starlight', old: selectedEntry.oldTraits.starlight, new: selectedEntry.newTraits.starlight, icon: '🌟' },
      { name: 'Humidity', old: selectedEntry.oldTraits.humidity, new: selectedEntry.newTraits.humidity, icon: '💧' },
      { name: 'Wind Speed', old: selectedEntry.oldTraits.windSpeed, new: selectedEntry.newTraits.windSpeed, icon: '💨' },
    ];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-background border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Evolution Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Evolution info */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/20 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                  <div className="font-medium">
                    {new Date(selectedEntry.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Triggered By</div>
                  <div className="font-medium">{selectedEntry.trigger}</div>
                </div>
              </div>

              {/* Weather conditions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                  🌍 Weather Conditions
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <div>🌡️ Temperature: {selectedEntry.weatherConditions.temperature}°C</div>
                  <div>💧 Humidity: {selectedEntry.weatherConditions.humidity}%</div>
                  <div>💨 Wind Speed: {selectedEntry.weatherConditions.windSpeed} m/s</div>
                  <div>☁️ Conditions: {selectedEntry.weatherConditions.description}</div>
                </div>
              </div>
            </div>

            {/* Trait changes */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Trait Changes</h4>
              <div className="space-y-2">
                {traitChanges.map((trait) => {
                  const change = getTraitChange(trait.old, trait.new);
                  return (
                    <div key={trait.name} className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded">
                      <div className="flex items-center space-x-2">
                        <span>{trait.icon}</span>
                        <span className="font-medium">{trait.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-muted-foreground">{trait.old || 0}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{trait.new || 0}</span>
                        <span className={`font-bold ${change.colorClass}`}>
                          {change.displayValue}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-background border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                🔄 Evolution Gallery
              </h2>
              <p className="text-muted-foreground">
                {nft.name} • #{nft.tokenId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-hidden flex">
          {/* Stats sidebar */}
          {stats && (
            <div className="w-80 border-r p-6 overflow-y-auto">
              <h3 className="font-semibold text-foreground mb-4">📊 Evolution Stats</h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5" />
                    <span className="font-semibold">Total Evolutions</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.totalEvolutions}</div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">Power Growth</span>
                  </div>
                  <div className="text-lg font-bold">
                    {stats.powerGrowthRate > 0 ? '+' : ''}{stats.powerGrowthRate.toFixed(1)} per evolution
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Avg Evolution Time</span>
                  </div>
                  <div className="text-lg font-bold">
                    {stats.averageEvolutionTime > 0 ? `${Math.round(stats.averageEvolutionTime)}m` : 'N/A'}
                  </div>
                </div>

                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Most Active Time</div>
                  <div className="font-semibold">{stats.mostActiveTime}</div>
                </div>

                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Favorite Weather</div>
                  <div className="font-semibold capitalize">{stats.favoriteWeather}</div>
                </div>

                {stats.levelProgression.length > 0 && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-2">Level Progression</div>
                    <div className="text-xs space-x-1">
                      {stats.levelProgression.slice(-10).map((level, i) => (
                        <span key={i} className="inline-block bg-primary/20 text-primary px-1 py-0.5 rounded">
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="flex-grow p-6 overflow-y-auto">
            <h3 className="font-semibold text-foreground mb-4">🕒 Evolution Timeline</h3>
            
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">No Evolution History</h4>
                <p className="text-muted-foreground">
                  This NFT hasn't evolved yet. Evolution history will appear here once changes occur.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...history].reverse().map(renderTimelineEntry)}
              </div>
            )}
          </div>
        </div>

        {/* Detail modal */}
        {renderDetailModal()}
      </div>
    </div>
  );
};

export default EvolutionGallery;

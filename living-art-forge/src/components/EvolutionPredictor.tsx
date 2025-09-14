import React, { useState, useEffect } from 'react';
import { EvolvNFT } from '@/lib/blockchain';
import { evolutionService, EvolutionPrediction } from '@/lib/evolution';
import { weatherService } from '@/lib/weather';
import { Clock, TrendingUp, Zap, Eye, RefreshCw, ThermometerSun, CloudRain } from 'lucide-react';

interface EvolutionPredictorProps {
  nft: EvolvNFT;
  className?: string;
}

const EvolutionPredictor: React.FC<EvolutionPredictorProps> = ({ nft, className = '' }) => {
  const [prediction, setPrediction] = useState<EvolutionPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    loadPrediction();
    // Refresh prediction every 2 minutes
    const interval = setInterval(loadPrediction, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [nft.tokenId]);

  // Update countdown every second
  useEffect(() => {
    if (!prediction) return;
    
    const interval = setInterval(() => {
      const targetTime = Date.now() + (prediction.estimatedTime * 60 * 1000);
      const timeLeft = Math.max(0, targetTime - Date.now());
      
      if (timeLeft === 0) {
        setCountdown('Evolution expected now!');
        return;
      }
      
      const minutes = Math.floor(timeLeft / (60 * 1000));
      const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
      
      if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [prediction]);

  const loadPrediction = async () => {
    setLoading(true);
    try {
      const newPrediction = await evolutionService.predictNextEvolution(nft);
      setPrediction(newPrediction);
    } catch (error) {
      console.error('Error loading prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  const getTriggerIcon = (trigger: EvolutionPrediction['triggeredBy']) => {
    switch (trigger) {
      case 'temperature': return '🌡️';
      case 'weather': return '🌤️';
      case 'time': return '🕐';
      case 'multiple': return '🔄';
      default: return '❓';
    }
  };

  const renderTraitPrediction = (
    name: string, 
    icon: string, 
    current: number, 
    predicted: number
  ) => {
    const change = predicted - current;
    const isPositive = change > 0;
    const isSignificant = Math.abs(change) > 10;
    
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg ${
        isSignificant ? 'bg-primary/10 border border-primary/20' : 'bg-muted/20'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-foreground">{name}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">{current}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-bold text-foreground">{predicted}</span>
          <span className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            ({isPositive ? '+' : ''}{change})
          </span>
        </div>
      </div>
    );
  };

  if (!prediction) {
    return (
      <div className={`bg-muted/10 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
            <span className="text-muted-foreground">Loading evolution prediction...</span>
          </div>
          <button
            onClick={loadPrediction}
            disabled={loading}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Next Evolution Prediction</h3>
            <p className="text-xs text-muted-foreground">AI-powered forecast</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={loadPrediction}
            disabled={loading}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main prediction info */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Time estimate */}
        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">ETA</span>
          </div>
          <div className="font-bold text-foreground">{countdown || `${prediction.estimatedTime}m`}</div>
        </div>

        {/* Confidence */}
        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-center">
          <div className="text-sm font-medium text-muted-foreground mb-1">Confidence</div>
          <div className={`font-bold ${getConfidenceColor(prediction.confidence)}`}>
            {prediction.confidence}% ({getConfidenceLabel(prediction.confidence)})
          </div>
        </div>

        {/* Trigger */}
        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-center">
          <div className="text-sm font-medium text-muted-foreground mb-1">Trigger</div>
          <div className="font-bold text-foreground flex items-center justify-center space-x-1">
            <span>{getTriggerIcon(prediction.triggeredBy)}</span>
            <span className="capitalize">{prediction.triggeredBy}</span>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="bg-white/30 dark:bg-black/10 rounded-lg p-3 mb-4">
        <div className="text-sm font-medium text-muted-foreground mb-1">Why this prediction?</div>
        <p className="text-sm text-foreground">{prediction.reasoning}</p>
      </div>

      {/* Predicted trait changes - collapsible */}
      {showDetails && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground mb-2">Expected Trait Changes</h4>
          {renderTraitPrediction('Power', '⚡', nft.power, prediction.predictedTraits.power)}
          {renderTraitPrediction('Brightness', '✨', nft.brightness, prediction.predictedTraits.brightness)}
          {renderTraitPrediction('Starlight', '🌟', nft.starlight || 0, prediction.predictedTraits.starlight)}
          {renderTraitPrediction('Humidity', '💧', nft.humidity || 0, prediction.predictedTraits.humidity)}
          {renderTraitPrediction('Wind Speed', '💨', nft.windSpeed || 0, prediction.predictedTraits.windSpeed)}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-200 dark:border-purple-800">
        <div className="text-xs text-muted-foreground">
          Powered by real weather data from global locations
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
    </div>
  );
};

export default EvolutionPredictor;

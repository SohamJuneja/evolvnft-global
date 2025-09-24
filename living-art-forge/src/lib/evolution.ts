// Evolution service for NFT prediction and history tracking

import { EvolvNFT } from './blockchain';
import { WeatherData, WeatherForecast, weatherService } from './weather';

export interface EvolutionPrediction {
  estimatedTime: number; // Minutes until next significant change
  confidence: number; // 0-100% confidence level
  predictedTraits: {
    power: number;
    brightness: number;
    starlight: number;
    humidity: number;
    windSpeed: number;
  };
  reasoning: string;
  triggeredBy: 'temperature' | 'weather' | 'time' | 'multiple';
}

export interface EvolutionHistoryEntry {
  timestamp: number;
  blockNumber?: number;
  oldTraits: Partial<EvolvNFT>;
  newTraits: Partial<EvolvNFT>;
  weatherConditions: WeatherData;
  trigger: string;
}

export interface EvolutionStats {
  totalEvolutions: number;
  averageEvolutionTime: number; // minutes between evolutions
  mostActiveTime: string; // time of day with most evolutions
  favoriteWeather: string;
  powerGrowthRate: number;
  levelProgression: number[];
}

class EvolutionService {
  private historyStorage = new Map<number, EvolutionHistoryEntry[]>();
  
  // Predict next evolution based on current weather and forecasts
  async predictNextEvolution(nft: EvolvNFT): Promise<EvolutionPrediction> {
    try {
      const currentWeather = await weatherService.getCurrentWeather();
      const forecast = await weatherService.getWeatherForecast(undefined, 6); // Next 6 hours
      
      const currentTraits = weatherService.mapWeatherToTraits(currentWeather);
      
      // Find the most significant upcoming change
      let maxChange = 0;
      let maxChangeTime = 60; // Default to 1 hour if no significant change
      let trigger: EvolutionPrediction['triggeredBy'] = 'time';
      let reasoning = 'Regular time-based evolution expected';
      
      for (const forecastItem of forecast) {
        const forecastWeather: WeatherData = {
          ...currentWeather,
          temperature: forecastItem.temperature,
          humidity: forecastItem.humidity,
          windSpeed: forecastItem.windSpeed,
          description: forecastItem.description
        };
        
        const forecastTraits = weatherService.mapWeatherToTraits(forecastWeather);
        
        // Calculate total trait change magnitude
        const traitChanges = {
          power: Math.abs(forecastTraits.power - currentTraits.power),
          brightness: Math.abs(forecastTraits.brightness - currentTraits.brightness),
          starlight: Math.abs(forecastTraits.starlight - currentTraits.starlight),
          humidity: Math.abs(forecastTraits.humidity - currentTraits.humidity),
          windSpeed: Math.abs(forecastTraits.windSpeed - currentTraits.windSpeed)
        };
        
        const totalChange = Object.values(traitChanges).reduce((sum, change) => sum + change, 0);
        
        if (totalChange > maxChange) {
          maxChange = totalChange;
          maxChangeTime = Math.max(1, Math.round((forecastItem.timestamp - Date.now()) / (1000 * 60)));
          
          // Determine primary trigger
          if (traitChanges.power > 50) {
            trigger = 'temperature';
            reasoning = `Temperature change from ${currentWeather.temperature}°C to ${forecastItem.temperature}°C will significantly affect power levels`;
          } else if (traitChanges.starlight > 20 || traitChanges.brightness > 20) {
            trigger = 'time';
            reasoning = 'Day/night transition will affect brightness and starlight';
          } else if (traitChanges.humidity > 20 || traitChanges.windSpeed > 10) {
            trigger = 'weather';
            reasoning = `Weather changing to ${forecastItem.description} will impact environmental traits`;
          } else {
            trigger = 'multiple';
            reasoning = 'Multiple environmental factors are changing gradually';
          }
        }
      }
      
      // Calculate confidence based on forecast reliability and change magnitude
      const confidence = Math.min(95, 60 + (maxChange / 10)); // Higher confidence for bigger changes
      
      // Get predicted traits from the most significant forecast point
      const significantForecast = forecast.find(f => 
        Math.round((f.timestamp - Date.now()) / (1000 * 60)) === maxChangeTime
      ) || forecast[0];
      
      const predictedWeather: WeatherData = {
        ...currentWeather,
        temperature: significantForecast.temperature,
        humidity: significantForecast.humidity,
        windSpeed: significantForecast.windSpeed,
        description: significantForecast.description
      };
      
      return {
        estimatedTime: maxChangeTime,
        confidence,
        predictedTraits: weatherService.mapWeatherToTraits(predictedWeather),
        reasoning,
        triggeredBy: trigger
      };
      
    } catch (error) {
      console.error('Error predicting evolution:', error);
      // Fallback prediction
      return {
        estimatedTime: 30,
        confidence: 30,
        predictedTraits: {
          power: nft.power + 10,
          brightness: nft.brightness + 5,
          starlight: nft.starlight || 0,
          humidity: nft.humidity || 50,
          windSpeed: nft.windSpeed || 5
        },
        reasoning: 'Prediction based on historical patterns (weather data unavailable)',
        triggeredBy: 'time'
      };
    }
  }
  
  // Add evolution to history
  addEvolutionToHistory(
    tokenId: number, 
    oldNft: EvolvNFT, 
    newNft: EvolvNFT, 
    weatherConditions: WeatherData,
    blockNumber?: number
  ) {
    const entry: EvolutionHistoryEntry = {
      timestamp: Date.now(),
      blockNumber,
      oldTraits: {
        level: oldNft.level,
        power: oldNft.power,
        brightness: oldNft.brightness,
        starlight: oldNft.starlight,
        humidity: oldNft.humidity,
        windSpeed: oldNft.windSpeed
      },
      newTraits: {
        level: newNft.level,
        power: newNft.power,
        brightness: newNft.brightness,
        starlight: newNft.starlight,
        humidity: newNft.humidity,
        windSpeed: newNft.windSpeed
      },
      weatherConditions,
      trigger: this.determineTrigger(oldNft, newNft, weatherConditions)
    };
    
    if (!this.historyStorage.has(tokenId)) {
      this.historyStorage.set(tokenId, []);
    }
    
    const history = this.historyStorage.get(tokenId)!;
    history.push(entry);
    
    // Keep only last 100 evolutions to prevent memory issues
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`evolution_history_${tokenId}`, JSON.stringify(history));
    } catch (error) {
      console.warn('Could not save evolution history to localStorage:', error);
    }
  }
  
  // Get evolution history for a token
  getEvolutionHistory(tokenId: number): EvolutionHistoryEntry[] {
    if (!this.historyStorage.has(tokenId)) {
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem(`evolution_history_${tokenId}`);
        if (stored) {
          const history = JSON.parse(stored);
          this.historyStorage.set(tokenId, history);
          return history;
        }
      } catch (error) {
        console.warn('Could not load evolution history from localStorage:', error);
      }
      
      // Generate demo evolution history if none exists (for demo purposes)
      this.generateDemoHistory(tokenId);
      return this.historyStorage.get(tokenId) || [];
    }
    
    return this.historyStorage.get(tokenId) || [];
  }
  
  // Generate demo evolution history for newly minted NFTs
  private generateDemoHistory(tokenId: number) {
    const now = Date.now();
    const demoEntries: EvolutionHistoryEntry[] = [];
    
    // Create 3-5 demo evolution entries spanning the last few hours
    const numEntries = Math.floor(Math.random() * 3) + 3; // 3-5 entries
    
    for (let i = 0; i < numEntries; i++) {
      const timeAgo = (numEntries - i) * 45 * 60 * 1000; // 45 minutes between each
      const timestamp = now - timeAgo;
      
      // Generate realistic trait progression
      const baseLevel = i + 1;
      const basePower = 100 + (i * 25) + Math.floor(Math.random() * 20);
      const baseBrightness = 50 + (i * 15) + Math.floor(Math.random() * 15);
      
      const oldTraits = {
        level: i === 0 ? 1 : baseLevel - 1,
        power: i === 0 ? 75 : basePower - 25,
        brightness: i === 0 ? 35 : baseBrightness - 15,
        starlight: 20 + Math.floor(Math.random() * 30),
        humidity: 40 + Math.floor(Math.random() * 30),
        windSpeed: 5 + Math.floor(Math.random() * 15)
      };
      
      const newTraits = {
        level: baseLevel,
        power: basePower,
        brightness: baseBrightness,
        starlight: 25 + Math.floor(Math.random() * 30),
        humidity: 45 + Math.floor(Math.random() * 25),
        windSpeed: 8 + Math.floor(Math.random() * 12)
      };
      
      // Generate realistic weather conditions
      const temperatures = [18, 22, 26, 20, 24];
      const conditions = ['clear', 'partly cloudy', 'cloudy', 'light rain', 'sunny'];
      const weatherConditions: WeatherData = {
        temperature: temperatures[i % temperatures.length],
        humidity: newTraits.humidity,
        windSpeed: newTraits.windSpeed,
        description: conditions[i % conditions.length],
        visibility: 10,
        pressure: 1013,
        timezone: "Asia/Tokyo",
        sunrise: timestamp - (6 * 60 * 60 * 1000),
        sunset: timestamp + (6 * 60 * 60 * 1000)
      };
      
      demoEntries.push({
        timestamp,
        oldTraits,
        newTraits,
        weatherConditions,
        trigger: i === 0 ? 'Initial mint' : this.determineTrigger(
          oldTraits as EvolvNFT, 
          newTraits as EvolvNFT, 
          weatherConditions
        )
      });
    }
    
    this.historyStorage.set(tokenId, demoEntries);
    
    // Store demo history in localStorage
    try {
      localStorage.setItem(`evolution_history_${tokenId}`, JSON.stringify(demoEntries));
      localStorage.setItem(`demo_history_${tokenId}`, 'true'); // Mark as demo data
    } catch (error) {
      console.warn('Could not save demo evolution history:', error);
    }
  }
  
  // Check if history is demo data
  isDemoHistory(tokenId: number): boolean {
    try {
      return localStorage.getItem(`demo_history_${tokenId}`) === 'true';
    } catch {
      return false;
    }
  }
  
  // Calculate evolution statistics
  getEvolutionStats(tokenId: number): EvolutionStats {
    const history = this.getEvolutionHistory(tokenId);
    
    if (history.length === 0) {
      return {
        totalEvolutions: 0,
        averageEvolutionTime: 0,
        mostActiveTime: 'N/A',
        favoriteWeather: 'N/A',
        powerGrowthRate: 0,
        levelProgression: []
      };
    }
    
    // Calculate average time between evolutions
    const timeDiffs = [];
    for (let i = 1; i < history.length; i++) {
      timeDiffs.push((history[i].timestamp - history[i-1].timestamp) / (1000 * 60)); // in minutes
    }
    const averageEvolutionTime = timeDiffs.length > 0 
      ? timeDiffs.reduce((sum, time) => sum + time, 0) / timeDiffs.length 
      : 0;
    
    // Find most active time of day
    const hourCounts = new Array(24).fill(0);
    history.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      hourCounts[hour]++;
    });
    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));
    const mostActiveTime = `${mostActiveHour}:00 - ${mostActiveHour + 1}:00`;
    
    // Find favorite weather
    const weatherCounts: Record<string, number> = {};
    history.forEach(entry => {
      const weather = entry.weatherConditions.description;
      weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
    });
    const favoriteWeather = Object.keys(weatherCounts).reduce((a, b) => 
      weatherCounts[a] > weatherCounts[b] ? a : b, 'clear'
    );
    
    // Calculate power growth rate (power gained per evolution)
    const powerGrowthRate = history.length > 1
      ? ((history[history.length - 1].newTraits.power || 0) - (history[0].oldTraits.power || 0)) / history.length
      : 0;
    
    // Level progression
    const levelProgression = history.map(entry => entry.newTraits.level || 1);
    
    return {
      totalEvolutions: history.length,
      averageEvolutionTime,
      mostActiveTime,
      favoriteWeather,
      powerGrowthRate,
      levelProgression
    };
  }
  
  // Determine what triggered an evolution
  private determineTrigger(oldNft: EvolvNFT, newNft: EvolvNFT, weather: WeatherData): string {
    const powerChange = Math.abs((newNft.power || 0) - (oldNft.power || 0));
    const brightnessChange = Math.abs((newNft.brightness || 0) - (oldNft.brightness || 0));
    const starlightChange = Math.abs((newNft.starlight || 0) - (oldNft.starlight || 0));
    
    if (powerChange > 50) return `Temperature (${weather.temperature}°C)`;
    if (starlightChange > 20) return `Day/Night cycle`;
    if (brightnessChange > 20) return `Weather (${weather.description})`;
    return 'Scheduled evolution';
  }
  
  // Clear history for a token (useful for testing)
  clearHistory(tokenId: number) {
    this.historyStorage.delete(tokenId);
    localStorage.removeItem(`evolution_history_${tokenId}`);
  }
}

export const evolutionService = new EvolutionService();
export default EvolutionService;

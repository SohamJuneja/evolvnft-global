// Weather service using OpenWeatherMap API
// Get your free API key from: https://openweathermap.org/api

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  visibility: number;
  pressure: number;
  uvIndex?: number;
  timezone: string;
  sunrise: number;
  sunset: number;
}

interface WeatherForecast {
  timestamp: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

interface LocationCoords {
  lat: number;
  lon: number;
  name: string;
}

// OpenWeatherMap API response types
interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    main: string;
  }>;
  wind?: {
    speed: number;
  };
  visibility?: number;
  timezone: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
    }>;
    wind?: {
      speed: number;
    };
  }>;
}

interface OpenWeatherUVResponse {
  value: number;
}

// Default coordinates (can be overridden per NFT)
const DEFAULT_COORDS: LocationCoords = {
  lat: 37.7749,
  lon: -122.4194,
  name: 'San Francisco, CA'
};

// Popular hackathon locations that might be impressive
const HACKATHON_LOCATIONS = {
  'silicon-valley': { lat: 37.4419, lon: -122.1430, name: 'Silicon Valley, CA' },
  'bengaluru': { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, India' },
  'new-york': { lat: 40.7128, lon: -74.0060, name: 'New York, USA' },
  'london': { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
  'tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
  'default': DEFAULT_COORDS
};

class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchWithCache<T>(
    url: string, 
    cacheKey: string, 
    ttlSeconds: number = 60
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < (cached.ttl * 1000)) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: now, ttl: ttlSeconds });
      return data;
    } catch (error) {
      // If API fails and we have cached data, use it even if expired
      if (cached) {
        console.warn('Weather API failed, using cached data:', error);
        return cached.data;
      }
      throw error;
    }
  }

  async getCurrentWeather(coords: LocationCoords = DEFAULT_COORDS): Promise<WeatherData> {
    const url = `${this.baseUrl}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric`;
    const cacheKey = `current_${coords.lat}_${coords.lon}`;
    
    const data = await this.fetchWithCache<OpenWeatherResponse>(url, cacheKey, 30); // 30 second cache

    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed || 0),
      description: data.weather[0]?.description || 'clear',
      visibility: data.visibility ? Math.round(data.visibility / 1000) : 10, // Convert to km
      pressure: data.main.pressure,
      timezone: String(data.timezone),
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    };
  }

  async getWeatherForecast(coords: LocationCoords = DEFAULT_COORDS, hours: number = 24): Promise<WeatherForecast[]> {
    const url = `${this.baseUrl}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric`;
    const cacheKey = `forecast_${coords.lat}_${coords.lon}`;
    
    const data = await this.fetchWithCache<OpenWeatherForecastResponse>(url, cacheKey, 300); // 5 minute cache for forecast

    return data.list.slice(0, Math.ceil(hours / 3)).map((item) => ({
      timestamp: item.dt * 1000,
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind?.speed || 0),
      description: item.weather[0]?.description || 'clear'
    }));
  }

  async getUVIndex(coords: LocationCoords = DEFAULT_COORDS): Promise<number> {
    // Note: UV Index API requires a separate call and may need different subscription
    try {
      const url = `${this.baseUrl}/uvi?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}`;
      const cacheKey = `uv_${coords.lat}_${coords.lon}`;
      
      const data = await this.fetchWithCache<OpenWeatherUVResponse>(url, cacheKey, 300);
      return data.value || 0;
    } catch (error) {
      console.warn('UV Index not available:', error);
      return 0;
    }
  }

  // Helper to determine if it's day or night
  isNightTime(weatherData: WeatherData): boolean {
    const now = Date.now() / 1000;
    return now < weatherData.sunrise || now > weatherData.sunset;
  }

  // Helper to map weather conditions to NFT traits
  mapWeatherToTraits(weather: WeatherData): {
    power: number;
    brightness: number;
    starlight: number;
    humidity: number;
    windSpeed: number;
  } {
    const isNight = this.isNightTime(weather);
    
    return {
      power: Math.min(Math.max(weather.temperature * 10 + 100, 10), 1000),
      brightness: isNight ? Math.max(30 - weather.temperature, 10) : Math.min(weather.temperature * 2 + 50, 100),
      starlight: isNight && weather.description.includes('clear') ? 
        Math.min(100 - weather.humidity + weather.visibility * 10, 100) : 0,
      humidity: weather.humidity,
      windSpeed: Math.min(weather.windSpeed, 50)
    };
  }
}

// Create weather service instance
// Note: You'll need to add your OpenWeatherMap API key
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

if (!API_KEY) {
  console.warn('OpenWeatherMap API key not found. Add VITE_OPENWEATHER_API_KEY to your .env file');
}

export const weatherService = new WeatherService(API_KEY);
export default WeatherService;
export type { WeatherData, WeatherForecast, LocationCoords };
export { DEFAULT_COORDS, HACKATHON_LOCATIONS };

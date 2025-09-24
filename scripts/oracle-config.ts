// oracle-config.ts - Configuration file for the Enhanced Oracle

export interface OracleConfig {
    // Contract settings
    contractAddress: string;
    networkName: string;
    
    // Oracle behavior
    evolutionInterval: number; // in milliseconds
    retryDelay: number; // in milliseconds
    maxRetries: number;
    transactionDelay: number; // delay between NFT evolutions
    
    // API settings
    weatherApiKey?: string;
    useRealWeatherData: boolean;
    apiTimeout: number;
    
    // NFT scanning
    maxTokensToScan: number;
    scanBatchSize: number;
    
    // Development settings
    isDevelopment: boolean;
    debugMode: boolean;
    singleRun: boolean; // For testing - run once and exit
}

// Default configuration
export const defaultConfig: OracleConfig = {
    // Contract settings - Use the same contract as frontend
    contractAddress: "0xED32eAE05bdcB1fDabB02b0E0fb4148eFDa486c9", // Same as frontend
    networkName: "somniaTestnet",
    
    // Oracle behavior - evolution every 30 seconds for demo
    evolutionInterval: 30 * 1000, // 30 seconds for video demo
    retryDelay: 30 * 1000, // 30 seconds
    maxRetries: 3,
    transactionDelay: 2000, // 2 seconds between transactions
    
    // API settings
    weatherApiKey: process.env.OPENWEATHER_API_KEY,
    useRealWeatherData: !!process.env.OPENWEATHER_API_KEY,
    apiTimeout: 10000, // 10 seconds
    
    // NFT scanning
    maxTokensToScan: 1000,
    scanBatchSize: 10,
    
    // Development settings
    isDevelopment: process.env.NODE_ENV === 'development',
    debugMode: process.env.DEBUG === 'true',
    singleRun: process.env.SINGLE_RUN === 'true'
};

// Development configuration (faster iterations for testing)
export const developmentConfig: OracleConfig = {
    ...defaultConfig,
    evolutionInterval: 30 * 1000, // 30 seconds for testing
    retryDelay: 10 * 1000, // 10 seconds
    transactionDelay: 1000, // 1 second
    maxTokensToScan: 10,
    debugMode: true
};

// Production configuration (more conservative)
export const productionConfig: OracleConfig = {
    ...defaultConfig,
    evolutionInterval: 15 * 60 * 1000, // 15 minutes
    retryDelay: 60 * 1000, // 1 minute
    maxRetries: 5,
    transactionDelay: 5000, // 5 seconds between transactions
    debugMode: false
};

// Get configuration based on environment
export function getConfig(): OracleConfig {
    const env = process.env.NODE_ENV || 'development';
    const mode = process.env.ORACLE_MODE || env;
    
    switch (mode) {
        case 'production':
            return productionConfig;
        case 'development':
        case 'dev':
            return developmentConfig;
        default:
            return defaultConfig;
    }
}

// Validate configuration
export function validateConfig(config: OracleConfig): void {
    if (!config.contractAddress || config.contractAddress === "0xf75F1Ab3b191CCC5e0A485E4C791243A5A3ec799") {
        console.warn("⚠️  Warning: Update contractAddress in oracle-config.ts with your deployed contract address");
    }
    
    if (!config.weatherApiKey && config.useRealWeatherData) {
        console.warn("⚠️  Warning: No OpenWeather API key provided. Set OPENWEATHER_API_KEY environment variable for real weather data");
        console.warn("      Get a free API key at: https://openweathermap.org/api");
    }
    
    if (config.evolutionInterval < 10000) {
        console.warn("⚠️  Warning: Evolution interval is very short. This may cause rate limiting issues.");
    }
}
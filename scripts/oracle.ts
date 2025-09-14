import { ethers } from "hardhat";
import axios from "axios";

// Fixed Oracle that ensures contract address consistency
async function main() {
    // CRITICAL: Make sure this matches your Collection.tsx contract address exactly
    const contractAddress = "0xf75F1Ab3b191CCC5e0A485E4C791243A5A3ec799"; // Updated to match Collection.tsx
    
    const contractABI = [
        "function evolve(uint256 tokenId, uint256 newPower, uint256 newBrightness, uint256 newStarlight, uint256 newHumidity, uint256 newWindSpeed, uint256 newSeason, uint256 newMoonPhase) external",
        "function getTokenData(uint256 tokenId) public view returns (tuple(uint256 power, uint256 brightness, uint256 level, uint256 starlight, uint256 humidity, uint256 windSpeed, uint256 season, uint256 moonPhase, uint256 locationId))",
        "function getTokenLocation(uint256 tokenId) public view returns (string)",
        "function ownerOf(uint256 tokenId) public view returns (address)",
        "function totalSupply() public view returns (uint256)",
        "function tokenURI(uint256 tokenId) public view returns (string)",
        "function balanceOf(address owner) public view returns (uint256)"
    ];

    // Connect to contract
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log("🌍 Enhanced Oracle starting...");
    console.log("📍 Contract Address:", contractAddress);
    console.log("📍 Signer Address:", await signer.getAddress());
    console.log("📍 Monitoring real-world conditions globally across multiple cities");
    console.log("🌍 Supporting locations: San Francisco, New York, London, Tokyo, Bengaluru, Delhi");
    
    // Configurable timing based on environment variables or defaults
    const evolutionInterval = process.env.EVOLUTION_INTERVAL_MINUTES 
        ? parseInt(process.env.EVOLUTION_INTERVAL_MINUTES) 
        : 1; // Default to 1 minute for better demo experience
    
    const singleRun = process.env.SINGLE_RUN === 'true';
    const targetTokenId = process.env.TARGET_TOKEN_ID ? parseInt(process.env.TARGET_TOKEN_ID) : null;
    const maxTokensPerRun = process.env.MAX_TOKENS_PER_RUN ? parseInt(process.env.MAX_TOKENS_PER_RUN) : null;
    
    console.log(`⏰ Evolution interval: ${evolutionInterval} minute${evolutionInterval === 1 ? '' : 's'}`);
    console.log(`🔄 Mode: ${singleRun ? 'Single run' : 'Continuous'}`);
    if (targetTokenId) console.log(`🎯 Target token: #${targetTokenId}`);
    if (maxTokensPerRun) console.log(`📊 Max tokens per run: ${maxTokensPerRun}`);
    console.log("🛑 Press Ctrl+C to stop the oracle\n");

    let iterationCount = 0;
    let lastKnownTokens: number[] = [];

    // Continuous loop
    do {
        try {
            iterationCount++;
            console.log(`\n🔄 === Oracle Iteration #${iterationCount} ===`);
            console.log(`⏰ ${new Date().toLocaleString()}`);

            // Get list of all minted NFTs with enhanced detection
            let activeTokenIds = await getActiveTokenIdsEnhanced(contract);
            
            // Apply token selection strategy
            if (targetTokenId !== null) {
                // Only evolve specific token
                activeTokenIds = activeTokenIds.filter(id => id === targetTokenId);
                console.log(`🎯 Filtering to target token #${targetTokenId}`);
            } else if (maxTokensPerRun !== null && activeTokenIds.length > maxTokensPerRun) {
                // Limit number of tokens per run (rotate through them)
                const startIndex = (iterationCount - 1) % activeTokenIds.length;
                activeTokenIds = activeTokenIds.slice(startIndex, startIndex + maxTokensPerRun);
                if (activeTokenIds.length < maxTokensPerRun && startIndex > 0) {
                    // Wrap around if needed
                    const remaining = maxTokensPerRun - activeTokenIds.length;
                    const wrapped = await getActiveTokenIdsEnhanced(contract);
                    activeTokenIds = [...activeTokenIds, ...wrapped.slice(0, remaining)];
                }
                console.log(`📊 Limited to ${maxTokensPerRun} tokens this run: [${activeTokenIds.join(', ')}]`);
            }
            
            // Update our tracking of known tokens
            if (activeTokenIds.length > 0) {
                const newTokens = activeTokenIds.filter(id => !lastKnownTokens.includes(id));
                if (newTokens.length > 0) {
                    console.log(`🆕 New tokens discovered: [${newTokens.join(', ')}]`);
                }
                lastKnownTokens = activeTokenIds;
            }
            
            if (activeTokenIds.length === 0) {
                console.log("❌ No NFTs found to evolve. Waiting for minting...");
                console.log("💡 Tip: Make sure you've minted an NFT and the contract address matches your frontend");
            } else {
                console.log(`🎯 Found ${activeTokenIds.length} NFTs to evolve: [${activeTokenIds.join(', ')}]`);

                // Evolve each NFT with location-specific weather data
                for (const tokenId of activeTokenIds) {
                    try {
                        await evolveNFTWithLocationWeather(contract, tokenId);
                        // Add delay between transactions to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        console.error(`❌ Failed to evolve NFT #${tokenId}:`, errorMessage);
                        
                        // If it's a revert, show the reason
                        if (errorMessage.includes('revert')) {
                            console.log(`   💡 This might be a smart contract requirement issue`);
                        }
                    }
                }
            }

            // Wait for next iteration or exit if single run
            if (singleRun) {
                console.log("✅ Single run completed. Exiting...");
                break;
            } else {
                console.log(`\n⏳ Waiting ${evolutionInterval} minute${evolutionInterval === 1 ? '' : 's'} for next evolution cycle...`);
                await new Promise(resolve => setTimeout(resolve, evolutionInterval * 60 * 1000));
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("❌ Oracle iteration error:", errorMessage);
            console.log("⏳ Retrying in 30 seconds...");
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds before retry
        }
    } while (!singleRun); // Continue loop unless single run mode
}

// Location configurations for different cities
const LOCATIONS = [
    { name: "San Francisco, CA", query: "San Francisco,US", timezone: "America/Los_Angeles" },
    { name: "New York, NY", query: "New York,US", timezone: "America/New_York" },
    { name: "London, UK", query: "London,GB", timezone: "Europe/London" },
    { name: "Tokyo, Japan", query: "Tokyo,JP", timezone: "Asia/Tokyo" },
    { name: "Bengaluru, India", query: "Bengaluru,IN", timezone: "Asia/Kolkata" },
    { name: "Delhi, India", query: "Delhi,IN", timezone: "Asia/Kolkata" }
];

// Enhanced token detection with multiple strategies
async function getActiveTokenIdsEnhanced(contract: any): Promise<number[]> {
    try {
        const activeTokens: number[] = [];
        const maxCheck = 50; // Check more tokens
        
        console.log(`🔍 Scanning for active tokens (checking 1-${maxCheck})...`);
        
        // Strategy 1: Try totalSupply first
        try {
            const totalSupply = await contract.totalSupply();
            const supply = Number(totalSupply);
            console.log(`📊 Total Supply reported: ${supply}`);
            
            if (supply > 0) {
                for (let i = 0; i <= Math.min(supply, maxCheck); i++) {
                    try {
                        const owner = await contract.ownerOf(i);
                        if (owner !== ethers.ZeroAddress) {
                            activeTokens.push(i);
                            console.log(`   ✅ Token #${i} - Owner: ${owner.slice(0, 10)}...${owner.slice(-8)}`);
                        }
                    } catch (error) {
                        // Token might not exist at this ID, continue
                        continue;
                    }
                }
            }
        } catch (error) {
            console.log("📊 No totalSupply function, scanning manually...");
            
            // Strategy 2: Manual scan
            for (let i = 1; i <= maxCheck; i++) {
                try {
                    const owner = await contract.ownerOf(i);
                    if (owner !== ethers.ZeroAddress) {
                        activeTokens.push(i);
                        console.log(`   ✅ Token #${i} - Owner: ${owner.slice(0, 10)}...${owner.slice(-8)}`);
                        
                        // Also check if we can get token data and location
                        try {
                            const tokenData = await contract.getTokenData(i);
                            const tokenLocation = await contract.getTokenLocation(i);
                            console.log(`      📊 Current: Power ${tokenData.power}, Brightness ${tokenData.brightness}, Level ${tokenData.level}`);
                            console.log(`      🌍 Location: ${tokenLocation} (ID: ${tokenData.locationId})`);
                        } catch (dataError) {
                            console.log(`      ⚠️ Token data not accessible`);
                        }
                    }
                } catch (error) {
                    // Token doesn't exist, continue scanning
                    continue;
                }
            }
        }
        
        if (activeTokens.length === 0) {
            console.log("🔍 No tokens found. Possible reasons:");
            console.log("   1. No NFTs have been minted yet");
            console.log("   2. Contract address mismatch with frontend");
            console.log("   3. Network connection issues");
            console.log("   4. Contract not properly deployed");
        }
        
        return activeTokens;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ Error getting active tokens:", errorMessage);
        return [];
    }
}

// Get dynamic gas pricing based on network conditions
async function getDynamicGasSettings(provider: any) {
    try {
        // Get current gas price from the network
        const feeData = await provider.getFeeData();
        
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            // EIP-1559 network (modern gas pricing)
            const maxFeePerGas = feeData.maxFeePerGas + (feeData.maxFeePerGas / BigInt(4)); // Add 25% buffer
            const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas + (feeData.maxPriorityFeePerGas / BigInt(10)); // Add 10% buffer
            
            console.log(`   ⛽ Using EIP-1559 gas: maxFee=${ethers.formatUnits(maxFeePerGas, "gwei")} gwei, priority=${ethers.formatUnits(maxPriorityFeePerGas, "gwei")} gwei`);
            
            return {
                maxFeePerGas,
                maxPriorityFeePerGas,
                type: 2 // EIP-1559 transaction
            };
        } else if (feeData.gasPrice) {
            // Legacy gas pricing
            const gasPrice = feeData.gasPrice + (feeData.gasPrice / BigInt(4)); // Add 25% buffer
            
            console.log(`   ⛽ Using legacy gas: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);
            
            return {
                gasPrice,
                type: 0 // Legacy transaction
            };
        } else {
            throw new Error("Unable to get fee data from network");
        }
    } catch (error) {
        console.log(`   ⚠️ Failed to get dynamic gas pricing, using fallback: ${(error as Error).message}`);
        
        // Fallback to higher fixed gas price for testnet
        return {
            gasPrice: ethers.parseUnits("10", "gwei"), // Higher fallback price
            type: 0
        };
    }
}

// New function to evolve NFT with location-specific weather
async function evolveNFTWithLocationWeather(contract: any, tokenId: number) {
    try {
        console.log(`\n🎯 Evolving NFT #${tokenId}:`);
        
        // Get current token data including location
        const currentData = await contract.getTokenData(tokenId);
        const tokenLocation = await contract.getTokenLocation(tokenId);
        const locationId = Number(currentData.locationId);
        
        console.log(`   🌍 Location: ${tokenLocation} (ID: ${locationId})`);
        console.log(`   📊 Current - Power: ${currentData.power}, Level: ${currentData.level}, Brightness: ${currentData.brightness}`);
        
        // Fetch weather data for this specific location
        const locationConfig = LOCATIONS[locationId] || LOCATIONS[0]; // Fallback to SF
        const weatherData = await fetchWeatherForLocation(locationConfig);
        const timeData = await fetchTimeDataForLocation(locationConfig);
        const astronomicalData = await fetchAstronomicalData();
        
        console.log(`   🌡️  Weather in ${locationConfig.name}: ${weatherData.temperature}°C, ${weatherData.description}`);
        console.log(`   🕐 Local time: ${timeData.localTime}`);
        
        // Calculate new traits with location-specific data
        const newTraits = calculateProgressiveTraits(
            {
                power: Number(currentData.power),
                brightness: Number(currentData.brightness),
                level: Number(currentData.level),
                starlight: Number(currentData.starlight),
                humidity: Number(currentData.humidity),
                windSpeed: Number(currentData.windSpeed),
                season: Number(currentData.season),
                moonPhase: Number(currentData.moonPhase),
                locationId: locationId
            },
            weatherData,
            timeData,
            astronomicalData
        );

        console.log(`   📊 New      - Power: ${newTraits.power}, Brightness: ${newTraits.brightness}, Starlight: ${newTraits.starlight}`);
        console.log(`   🌍 Environmental - Humidity: ${newTraits.humidity}, Wind: ${newTraits.windSpeed}`);
        console.log(`   🌙 Astronomical - Season: ${newTraits.season} (${getSeasonName(newTraits.season)}), Moon: ${newTraits.moonPhase} (${getMoonPhaseName(newTraits.moonPhase)})`);

        // Execute evolution with dynamic gas
        const gasSettings = await getDynamicGasSettings(contract.provider);
        const gasEstimate = await contract.evolve.estimateGas(
            tokenId, newTraits.power, newTraits.brightness, newTraits.starlight,
            newTraits.humidity, newTraits.windSpeed, newTraits.season, newTraits.moonPhase
        );
        
        const txOptions: any = { gasLimit: gasEstimate + BigInt(20000) };
        if (gasSettings.type === 2) {
            txOptions.maxFeePerGas = gasSettings.maxFeePerGas;
            txOptions.maxPriorityFeePerGas = gasSettings.maxPriorityFeePerGas;
        } else {
            txOptions.gasPrice = gasSettings.gasPrice;
        }

        const tx = await contract.evolve(
            tokenId, newTraits.power, newTraits.brightness, newTraits.starlight,
            newTraits.humidity, newTraits.windSpeed, newTraits.season, newTraits.moonPhase,
            txOptions
        );

        console.log(`   ⏳ Transaction: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`   ✅ NFT #${tokenId} evolved with ${locationConfig.name} weather! (Block: ${receipt.blockNumber})`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Location-based evolution failed for NFT #${tokenId}: ${errorMessage}`);
    }
}

// Safer evolution with pre-checks and validation
async function evolveNFTSafely(
    contract: any, 
    tokenId: number, 
    weatherData: any, 
    timeData: any, 
    astronomicalData: any
) {
    try {
        console.log(`\n🎯 Evolving NFT #${tokenId}:`);
        
        // Pre-check 1: Verify token still exists and get current data
        let currentData;
        try {
            currentData = await contract.getTokenData(tokenId);
            console.log(`   📊 Current - Power: ${currentData.power}, Level: ${currentData.level}, Brightness: ${currentData.brightness}`);
        } catch (error) {
            throw new Error(`Token #${tokenId} data not accessible: ${(error as Error).message}`);
        }
        
        // Pre-check 2: Verify ownership (optional, but good to know)
        try {
            const owner = await contract.ownerOf(tokenId);
            console.log(`   👤 Owner: ${owner.slice(0, 10)}...${owner.slice(-8)}`);
        } catch (error) {
            console.log(`   ⚠️ Owner check failed, but continuing...`);
        }

        // Calculate new traits with progressive enhancement
        const newTraits = calculateProgressiveTraits(
            {
                power: Number(currentData.power),
                brightness: Number(currentData.brightness),
                level: Number(currentData.level),
                starlight: Number(currentData.starlight),
                humidity: Number(currentData.humidity),
                windSpeed: Number(currentData.windSpeed),
                season: Number(currentData.season),
                moonPhase: Number(currentData.moonPhase)
            },
            weatherData,
            timeData,
            astronomicalData
        );

        // Validate new traits are reasonable
        if (newTraits.power < 0 || newTraits.brightness < 0) {
            throw new Error(`Invalid trait values calculated`);
        }

        console.log(`   📊 New      - Power: ${newTraits.power}, Brightness: ${newTraits.brightness}, Starlight: ${newTraits.starlight}`);
        console.log(`   🌍 Environmental - Humidity: ${newTraits.humidity}, Wind: ${newTraits.windSpeed}`);
        console.log(`   🌙 Astronomical - Season: ${newTraits.season} (${getSeasonName(newTraits.season)}), Moon: ${newTraits.moonPhase} (${getMoonPhaseName(newTraits.moonPhase)})`);

        // Get dynamic gas settings
        const gasSettings = await getDynamicGasSettings(contract.provider);
        
        // Pre-check 3: Estimate gas to catch issues early
        let gasEstimate;
        try {
            gasEstimate = await contract.evolve.estimateGas(
                tokenId,
                newTraits.power,
                newTraits.brightness,
                newTraits.starlight,
                newTraits.humidity,
                newTraits.windSpeed,
                newTraits.season,
                newTraits.moonPhase
            );
            console.log(`   ⛽ Gas estimate: ${gasEstimate}`);
        } catch (error) {
            throw new Error(`Gas estimation failed: ${(error as Error).message}`);
        }

        // Prepare transaction options
        const txOptions: any = {
            gasLimit: gasEstimate + BigInt(20000) // Add buffer
        };

        // Add gas pricing based on network support
        if (gasSettings.type === 2) {
            // EIP-1559
            txOptions.maxFeePerGas = gasSettings.maxFeePerGas;
            txOptions.maxPriorityFeePerGas = gasSettings.maxPriorityFeePerGas;
        } else {
            // Legacy
            txOptions.gasPrice = gasSettings.gasPrice;
        }

        // Execute evolution transaction with dynamic gas settings
        const tx = await contract.evolve(
            tokenId,
            newTraits.power,
            newTraits.brightness,
            newTraits.starlight,
            newTraits.humidity,
            newTraits.windSpeed,
            newTraits.season,
            newTraits.moonPhase,
            txOptions
        );

        console.log(`   ⏳ Transaction: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`   ✅ NFT #${tokenId} evolved successfully! (Block: ${receipt.blockNumber})`);

        // Post-check: Verify the evolution worked
        try {
            const updatedData = await contract.getTokenData(tokenId);
            console.log(`   ✔️  Verified - Power: ${updatedData.power}, Brightness: ${updatedData.brightness}, Level: ${updatedData.level}`);
            
            // Check if values actually changed
            if (Number(updatedData.power) === Number(currentData.power) && 
                Number(updatedData.brightness) === Number(currentData.brightness) &&
                Number(updatedData.starlight) === Number(currentData.starlight)) {
                console.log(`   ⚠️ Warning: Values appear unchanged after evolution`);
            }
        } catch (error) {
            console.log(`   ⚠️ Could not verify evolution: ${(error as Error).message}`);
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Evolution failed for NFT #${tokenId}: ${errorMessage}`);
    }
}

// Same calculation function but with more validation and location awareness
function calculateProgressiveTraits(
    currentData: any,
    weather: any, 
    time: any, 
    astro: any
) {
    // Ensure we have valid current data
    const safeCurrentData = {
        power: Math.max(0, currentData.power || 0),
        brightness: Math.max(0, currentData.brightness || 50),
        level: Math.max(1, currentData.level || 1),
        starlight: Math.max(0, currentData.starlight || 0),
        humidity: Math.max(0, currentData.humidity || 50),
        windSpeed: Math.max(0, currentData.windSpeed || 0),
        season: Math.max(0, Math.min(3, currentData.season || 0)),
        moonPhase: Math.max(0, Math.min(7, currentData.moonPhase || 0)),
        locationId: Math.max(0, Math.min(5, currentData.locationId || 0))
    };

    // Location-based power bonuses (different climates affect power differently)
    const locationBonusMultiplier = [1.0, 1.2, 0.8, 1.1, 1.3, 1.4][safeCurrentData.locationId]; // SF, NYC, London, Tokyo, Bengaluru, Delhi
    const tempBonus = Math.max(0, (weather.temperature - 15) * 0.5 * locationBonusMultiplier);
    const newPower = Math.min(1000, safeCurrentData.power + tempBonus);
    
    // Dynamic brightness based on weather and time (location affects visibility)
    let brightnessModifier = 0;
    if (weather.description.includes('clear')) brightnessModifier += 2;
    if (weather.description.includes('cloud')) brightnessModifier -= 1;
    if (weather.description.includes('rain')) brightnessModifier -= 2;
    if (time.hour < 6 || time.hour > 18) brightnessModifier -= 3;
    
    // Location-specific brightness adjustments
    if (safeCurrentData.locationId === 2) brightnessModifier -= 1; // London is often cloudy
    if (safeCurrentData.locationId === 4 || safeCurrentData.locationId === 5) brightnessModifier += 1; // India has more sunshine
    
    const newBrightness = Math.max(20, Math.min(150, safeCurrentData.brightness + brightnessModifier));
    
    // Starlight calculation with location pollution factors
    const isNight = time.hour < 6 || time.hour > 19;
    const isClear = weather.description.includes('clear');
    let starlight = safeCurrentData.starlight;
    
    // Light pollution factors by location (lower = more pollution)
    const lightPollutionFactor = [0.7, 0.5, 0.6, 0.4, 0.8, 0.3][safeCurrentData.locationId]; // SF, NYC, London, Tokyo, Bengaluru, Delhi
    
    if (isNight && isClear) starlight += 3 * lightPollutionFactor;
    else if (isNight) starlight += 1 * lightPollutionFactor;
    else if (isClear) starlight += 1 * lightPollutionFactor;
    else starlight = Math.max(0, starlight - 0.5);
    
    starlight = Math.max(0, Math.min(100, starlight));
    
    // Environmental factors (direct from weather)
    const humidity = Math.max(0, Math.min(100, weather.humidity));
    const windSpeed = Math.max(0, Math.min(50, weather.windSpeed * 2));
    
    // Astronomical factors
    const season = astro.season;
    const moonPhase = astro.moonPhase;
    
    return {
        power: Math.floor(newPower),
        brightness: Math.floor(newBrightness),
        starlight: Math.floor(starlight),
        humidity: Math.floor(humidity),
        windSpeed: Math.floor(windSpeed),
        season: season,
        moonPhase: moonPhase
    };
}

// Enhanced weather data with location support
async function fetchWeatherForLocation(locationConfig: any) {
    try {
        const API_KEY = process.env.OPENWEATHER_API_KEY;
        
        if (!API_KEY || API_KEY === "YOUR_OPENWEATHER_API_KEY") {
            console.log(`⚠️  OpenWeather API key not set, using simulated data for ${locationConfig.name}`);
            return generateRealisticSimulatedWeatherForLocation(locationConfig);
        }
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${locationConfig.query}&appid=${API_KEY}&units=metric`,
            { timeout: 15000 }
        );

        console.log(`✅ Real weather data fetched for ${locationConfig.name}`);
        return {
            temperature: Math.round(response.data.main.temp),
            humidity: response.data.main.humidity,
            windSpeed: Math.round(response.data.wind?.speed || 0),
            description: response.data.weather[0].description,
            pressure: response.data.main.pressure,
            location: locationConfig.name
        };
    } catch (error) {
        console.log(`⚠️  Weather API failed for ${locationConfig.name}, using simulated data`);
        return generateRealisticSimulatedWeatherForLocation(locationConfig);
    }
}

// Fetch time data for specific timezone
async function fetchTimeDataForLocation(locationConfig: any) {
    try {
        const response = await axios.get(
            `http://worldtimeapi.org/api/timezone/${locationConfig.timezone}`,
            { timeout: 10000 }
        );
        
        const datetime = new Date(response.data.datetime);
        console.log(`✅ Real time data fetched for ${locationConfig.name}`);
        return {
            localTime: datetime.toLocaleString(),
            hour: datetime.getHours(),
            dayOfYear: Math.floor((datetime.getTime() - new Date(datetime.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)),
            timezone: locationConfig.timezone
        };
    } catch (error) {
        console.log(`⚠️  Time API failed for ${locationConfig.name}, using UTC time`);
        const now = new Date();
        return {
            localTime: now.toLocaleString(),
            hour: now.getHours(),
            dayOfYear: Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)),
            timezone: 'UTC'
        };
    }
}

// Generate location-specific simulated weather
function generateRealisticSimulatedWeatherForLocation(locationConfig: any) {
    const now = new Date();
    const hour = now.getHours();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Base temperatures by city (realistic averages)
    const cityBaseTemps: { [key: string]: number } = {
        "San Francisco,US": 15,
        "New York,US": 12,
        "London,GB": 10,
        "Tokyo,JP": 14,
        "Bengaluru,IN": 22,
        "Delhi,IN": 20
    };
    
    let baseTemp = cityBaseTemps[locationConfig.query] || 15;
    
    // Seasonal variation (different for each location)
    if (locationConfig.query.includes('IN')) {
        // India - hot summers, mild winters
        if (dayOfYear < 80 || dayOfYear > 355) baseTemp += 5; // Winter
        else if (dayOfYear < 172) baseTemp += 15; // Spring  
        else if (dayOfYear < 266) baseTemp += 25; // Summer
        else baseTemp += 10; // Autumn
    } else if (locationConfig.query.includes('GB')) {
        // UK - mild climate
        if (dayOfYear < 80 || dayOfYear > 355) baseTemp -= 5; // Winter
        else if (dayOfYear < 172) baseTemp += 5; // Spring
        else if (dayOfYear < 266) baseTemp += 10; // Summer  
        else baseTemp += 2; // Autumn
    } else {
        // US/Japan - moderate variation
        if (dayOfYear < 80 || dayOfYear > 355) baseTemp -= 3; // Winter
        else if (dayOfYear < 172) baseTemp += 8; // Spring
        else if (dayOfYear < 266) baseTemp += 15; // Summer
        else baseTemp += 5; // Autumn
    }
    
    // Daily temperature cycle
    const dailyCycle = Math.sin((hour - 6) * Math.PI / 12) * 8;
    const finalTemp = Math.floor(baseTemp + dailyCycle + (Math.random() * 4 - 2));
    
    const weatherConditions = ["clear sky", "few clouds", "scattered clouds", "overcast clouds", "light rain"];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1];
    
    let selectedWeather = weatherConditions[0];
    const rand = Math.random();
    let cumWeight = 0;
    for (let i = 0; i < weatherConditions.length; i++) {
        cumWeight += weights[i];
        if (rand <= cumWeight) {
            selectedWeather = weatherConditions[i];
            break;
        }
    }
    
    return {
        temperature: Math.max(-10, Math.min(45, finalTemp)),
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 12) + 1,
        description: selectedWeather,
        pressure: 1013 + Math.floor(Math.random() * 20) - 10,
        location: locationConfig.name
    };
}

// Enhanced weather data with better error handling
async function fetchWeatherData() {
    try {
        const API_KEY = process.env.OPENWEATHER_API_KEY;
        
        if (!API_KEY || API_KEY === "YOUR_OPENWEATHER_API_KEY") {
            console.log("⚠️  OpenWeather API key not set, using simulated data");
            return generateRealisticSimulatedWeather();
        }
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=San Francisco,US&appid=${API_KEY}&units=metric`,
            { timeout: 15000 }
        );

        console.log("✅ Real weather data fetched from OpenWeather API");
        return {
            temperature: Math.round(response.data.main.temp),
            humidity: response.data.main.humidity,
            windSpeed: Math.round(response.data.wind.speed || 0),
            description: response.data.weather[0].description,
            pressure: response.data.main.pressure
        };
    } catch (error) {
        console.log("⚠️  Weather API failed, using simulated data:", (error as Error).message.slice(0, 50));
        return generateRealisticSimulatedWeather();
    }
}

// Generate more realistic simulated weather data
function generateRealisticSimulatedWeather() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Base temperature varies by time of day and season (San Francisco climate)
    let baseTemp = 15; // Base temperature for San Francisco
    
    // Seasonal variation (moderate climate)
    if (dayOfYear < 80 || dayOfYear > 355) baseTemp += 2; // Winter (mild)
    else if (dayOfYear < 172) baseTemp += 5; // Spring 
    else if (dayOfYear < 266) baseTemp += 8; // Summer (not too hot)
    else baseTemp += 3; // Autumn
    
    // Daily temperature cycle
    const dailyCycle = Math.sin((hour - 6) * Math.PI / 12) * 8;
    const finalTemp = Math.floor(baseTemp + dailyCycle + (Math.random() * 4 - 2));
    
    const weatherConditions = ["clear sky", "few clouds", "scattered clouds", "overcast clouds", "light rain"];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Clear weather more likely
    
    let selectedWeather = weatherConditions[0];
    const rand = Math.random();
    let cumWeight = 0;
    for (let i = 0; i < weatherConditions.length; i++) {
        cumWeight += weights[i];
        if (rand <= cumWeight) {
            selectedWeather = weatherConditions[i];
            break;
        }
    }
    
    return {
        temperature: Math.max(5, Math.min(40, finalTemp)),
        humidity: Math.floor(Math.random() * 40) + 40,    // 40-80%
        windSpeed: Math.floor(Math.random() * 12) + 1,    // 1-12 m/s
        description: selectedWeather,
        pressure: 1013 + Math.floor(Math.random() * 20) - 10
    };
}

// Fetch current time data for Pacific timezone (San Francisco)
async function fetchTimeData() {
    try {
        const response = await axios.get(
            'http://worldtimeapi.org/api/timezone/America/Los_Angeles',
            { timeout: 10000 }
        );
        
        const datetime = new Date(response.data.datetime);
        console.log("✅ Real time data fetched from WorldTimeAPI");
        return {
            localTime: datetime.toLocaleString(),
            hour: datetime.getHours(),
            dayOfYear: Math.floor((datetime.getTime() - new Date(datetime.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
        };
    } catch (error) {
        console.log("⚠️  Time API failed, using local time");
        const now = new Date();
        return {
            localTime: now.toLocaleString(),
            hour: now.getHours(),
            dayOfYear: Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
        };
    }
}

// Calculate astronomical data (moon phase, season)
async function fetchAstronomicalData() {
    const now = new Date();
    
    // Calculate moon phase (simplified calculation)
    const moonPhase = calculateMoonPhase(now);
    
    // Calculate season based on day of year
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const season = calculateSeason(dayOfYear);
    
    return {
        moonPhase,
        season
    };
}

// Calculate moon phase (0-7 scale)
function calculateMoonPhase(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified moon phase calculation (approximate)
    const c = Math.floor(year / 100);
    const e = 2 * (year - c * 100);
    const jd = Math.floor(365.25 * year) + Math.floor(30.6001 * (month + 1)) + day - 723244;
    const n = Math.floor((jd - 2451550.1) / 29.530588853);
    const phase = ((jd - 2451550.1) - n * 29.530588853) / 29.530588853;
    
    return Math.floor(phase * 8) % 8;
}

// Calculate season based on day of year (0-3 scale)
function calculateSeason(dayOfYear: number): number {
    // Northern Hemisphere seasons (India)
    if (dayOfYear < 80 || dayOfYear > 355) return 3; // Winter (Dec-Feb)
    if (dayOfYear < 172) return 0; // Spring (Mar-May)
    if (dayOfYear < 266) return 1; // Summer (Jun-Aug) 
    return 2; // Autumn (Sep-Nov)
}

// Helper functions for display
function getSeasonName(season: number): string {
    const seasons = ["Spring", "Summer", "Autumn", "Winter"];
    return seasons[season] || "Unknown";
}

function getMoonPhaseName(phase: number): string {
    const phases = [
        "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
        "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
    ];
    return phases[phase] || "Unknown";
}

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('\n🛑 Oracle shutdown requested...');
    console.log('💫 Thank you for running the Enhanced Oracle!');
    console.log('📊 Final summary: Processed multiple evolution cycles');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Oracle terminated...');
    process.exit(0);
});

// Enhanced error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    console.log('🔄 Oracle will continue running...');
});

// Run the oracle
main()
    .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("💥 Oracle failed:", errorMessage);
        console.log("\n🔧 Troubleshooting tips:");
        console.log("1. Check contract address matches your frontend");
        console.log("2. Ensure you have NFTs minted");
        console.log("3. Verify network connection and gas settings");
        console.log("4. Check wallet has sufficient funds");
        process.exitCode = 1;
    });
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title EvolvNFT (V3 with Enhanced Real-World Simulation)
 * @notice This version includes multiple real-world factors affecting NFT evolution
 */
contract EvolvNFT is ERC721, Ownable, EIP712 {
    uint256 private _tokenIdCounter;
    address public oracleAddress;
    address public relayerAddress;

    // Mapping to prevent replay attacks
    mapping(address => uint256) private _nonces;

    struct DynamicTraits {
        uint256 power;        // Influenced by temperature
        uint256 brightness;   // Influenced by weather conditions
        uint256 level;        // Increases with each evolution
        uint256 starlight;    // Influenced by time of day
        uint256 humidity;     // New trait for atmospheric conditions
        uint256 windSpeed;    // New trait for environmental energy
        uint256 season;       // New trait for seasonal changes (0-3: Spring, Summer, Autumn, Winter)
        uint256 moonPhase;    // New trait for lunar influence (0-7: New to Full Moon)
        uint256 locationId;   // Location index for weather data (0-5: SF, NYC, London, Tokyo, Bengaluru, Delhi)
    }

    // Location names for display purposes
    string[6] public locationNames = [
        "San Francisco, CA",
        "New York, NY", 
        "London, UK",
        "Tokyo, Japan",
        "Bengaluru, India",
        "Delhi, India"
    ];

    mapping(uint256 => DynamicTraits) private _tokenData;
    
    event Evolved(
        uint256 indexed tokenId, 
        uint256 newPower, 
        uint256 newBrightness, 
        uint256 newStarlight,
        uint256 newHumidity,
        uint256 newWindSpeed,
        uint256 newSeason,
        uint256 newMoonPhase
    );

    // --- EIP712 Setup ---
    bytes32 private constant MINT_TYPEHASH = keccak256("Mint(address to,uint256 nonce)");

    constructor()
        ERC721("EvolvNFT", "EVO")
        Ownable(msg.sender)
        EIP712("EvolvNFT", "1")
    {
        oracleAddress = msg.sender;
        relayerAddress = msg.sender;
    }

    // --- Helper function to check if token exists ---
    function _tokenExists(uint256 tokenId) internal view returns (bool) {
        return tokenId < _tokenIdCounter;
    }

    // --- Owner Functions ---
    function setOracleAddress(address _oracleAddress) public onlyOwner {
        oracleAddress = _oracleAddress;
    }

    function setRelayerAddress(address _relayerAddress) public onlyOwner {
        relayerAddress = _relayerAddress;
    }

    // --- Core Functions ---
    function mint(address to) public {
        _mintNFT(to, 0); // Default to San Francisco
    }
    
    function mintWithLocation(address to, uint256 locationId) public {
        require(locationId < locationNames.length, "EvolvNFT: Invalid location ID");
        _mintNFT(to, locationId);
    }
    
    function mintFor(address to, uint256 nonce, bytes calldata signature) external {
        require(msg.sender == relayerAddress, "EvolvNFT: Caller is not the authorized relayer");
        require(nonce == _nonces[to], "EvolvNFT: Invalid nonce");

        bytes32 structHash = keccak256(abi.encode(MINT_TYPEHASH, to, nonce));
        bytes32 digest = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(digest, signature);
        require(signer == to, "EvolvNFT: Invalid signature");

        _nonces[to]++;
        _mintNFT(to, 0); // Default location for gasless minting
    }
    
    function _mintNFT(address to, uint256 locationId) internal {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
        _tokenData[tokenId] = DynamicTraits({
            power: 10,
            brightness: 50,
            level: 1,
            starlight: 0,
            humidity: 50,
            windSpeed: 5,
            season: 1, // Default to Spring
            moonPhase: 0, // Default to New Moon
            locationId: locationId
        });
    }

    function evolve(
        uint256 tokenId, 
        uint256 newPower, 
        uint256 newBrightness, 
        uint256 newStarlight,
        uint256 newHumidity,
        uint256 newWindSpeed,
        uint256 newSeason,
        uint256 newMoonPhase
    ) external {
        require(msg.sender == oracleAddress, "EvolvNFT: Caller is not the oracle");
        require(_tokenExists(tokenId), "EvolvNFT: Evolution query for nonexistent token");
        
        DynamicTraits storage data = _tokenData[tokenId];
        data.power = newPower;
        data.brightness = newBrightness;
        data.starlight = newStarlight;
        data.humidity = newHumidity;
        data.windSpeed = newWindSpeed;
        data.season = newSeason;
        data.moonPhase = newMoonPhase;
        data.level++;

        emit Evolved(tokenId, newPower, newBrightness, newStarlight, newHumidity, newWindSpeed, newSeason, newMoonPhase);
    }

    function nonces(address owner) public view returns (uint256) {
        return _nonces[owner];
    }

    function getTokenData(uint256 tokenId) public view returns (DynamicTraits memory) {
        require(_tokenExists(tokenId), "EvolvNFT: Query for nonexistent token");
        return _tokenData[tokenId];
    }

    function getTokenLocation(uint256 tokenId) public view returns (string memory) {
        require(_tokenExists(tokenId), "EvolvNFT: Query for nonexistent token");
        uint256 locationId = _tokenData[tokenId].locationId;
        return locationNames[locationId];
    }
    
    // --- Enhanced On-Chain SVG and Metadata ---
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_tokenExists(tokenId), "EvolvNFT: URI query for nonexistent token");
        DynamicTraits memory data = _tokenData[tokenId];

        string memory image = Base64.encode(bytes(_generateSVG(data)));
        string memory json = Base64.encode(
            bytes(
                string.concat(
                    '{"name": "EvolvNFT #', Strings.toString(tokenId), '",',
                    '"description": "A dynamic, living asset evolving with real-world conditions on the Somnia Network.",',
                    '"attributes": [',
                        '{"trait_type": "Level", "value": ', Strings.toString(data.level), '},',
                        '{"trait_type": "Power", "value": ', Strings.toString(data.power), '},',
                        '{"trait_type": "Brightness", "value": ', Strings.toString(data.brightness), '},',
                        '{"trait_type": "Starlight", "value": ', Strings.toString(data.starlight), '},',
                        '{"trait_type": "Humidity", "value": ', Strings.toString(data.humidity), '},',
                        '{"trait_type": "Wind Speed", "value": ', Strings.toString(data.windSpeed), '},',
                        '{"trait_type": "Season", "value": "', _getSeasonName(data.season), '"},',
                        '{"trait_type": "Moon Phase", "value": "', _getMoonPhaseName(data.moonPhase), '"},',
                        '{"trait_type": "Location", "value": "', locationNames[data.locationId], '"}',
                    '],',
                    '"image": "data:image/svg+xml;base64,', image, '"}'
                )
            )
        );
        return string.concat("data:application/json;base64,", json);
    }

    // Split the SVG generation into smaller functions to avoid stack too deep
    function _generateSVG(DynamicTraits memory data) internal pure returns (string memory) {
        return string.concat(
            _getSVGHeader(data),
            _getSVGMainContent(data),
            _getSVGEffects(data),
            _getSVGFooter(data)
        );
    }

    function _getSVGHeader(DynamicTraits memory data) internal pure returns (string memory) {
        string memory bgColor = data.season == 0 ? "#228B22" : // Spring - Green
                               data.season == 1 ? "#FFD700" : // Summer - Gold
                               data.season == 2 ? "#FF8C00" : // Autumn - Orange
                               "#87CEEB";                      // Winter - Sky Blue

        return string.concat(
            '<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">',
                '<defs>',
                    '<radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">',
                        '<stop offset="0%" style="stop-color:', bgColor, ';stop-opacity:0.3" />',
                        '<stop offset="100%" style="stop-color:#111111;stop-opacity:1" />',
                    '</radialGradient>',
                '</defs>',
                '<rect width="100%" height="100%" fill="url(#bgGrad)" />'
        );
    }

    function _getSVGMainContent(DynamicTraits memory data) internal pure returns (string memory) {
        string memory powerColor = data.power > 500 ? "#FF4136" : 
                                  data.power > 250 ? "#FF851B" : "#0074D9";
        
        string memory brightnessFilter = string.concat(
            ' style="filter: brightness(', 
            Strings.toString(data.brightness), 
            '%) saturate(', 
            Strings.toString(100 + data.humidity), 
            '%);"'
        );

        string memory windRotation = string.concat(
            '<animateTransform attributeName="transform" type="rotate" values="0 150 150;',
            Strings.toString(data.windSpeed * 5),
            ' 150 150;0 150 150" dur="',
            Strings.toString(10 - (data.windSpeed / 10)),
            's" repeatCount="indefinite"/>'
        );

        return string.concat(
            '<g>',
                windRotation,
                '<circle cx="150" cy="150" r="', 
                Strings.toString(30 + data.level * 3 + data.windSpeed), 
                '" fill="', powerColor, '"', brightnessFilter, '/>',
            '</g>'
        );
    }

    function _getSVGEffects(DynamicTraits memory data) internal pure returns (string memory) {
        string memory starlightEffect = data.starlight > 50 ? string.concat(
            '<circle cx="100" cy="100" r="3" fill="white" opacity="0.8">',
                '<animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>',
            '</circle>',
            '<circle cx="200" cy="80" r="2" fill="white" opacity="0.6">',
                '<animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/>',
            '</circle>',
            '<circle cx="250" cy="120" r="2" fill="white" opacity="0.7">',
                '<animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite"/>',
            '</circle>'
        ) : "";

        string memory moonPhase = data.moonPhase > 0 ? string.concat(
            '<circle cx="250" cy="50" r="15" fill="#F5F5DC" opacity="',
            Strings.toString(20 + (data.moonPhase * 10)),
            '%">',
                '<animate attributeName="opacity" values="',
                Strings.toString(20 + (data.moonPhase * 10)),
                '%;',
                Strings.toString(10 + (data.moonPhase * 5)),
                '%;',
                Strings.toString(20 + (data.moonPhase * 10)),
                '%" dur="4s" repeatCount="indefinite"/>',
            '</circle>'
        ) : "";

        string memory humidityEffect = data.humidity > 70 ? 
            '<circle cx="120" cy="200" r="1" fill="#ADD8E6" opacity="0.5">'
            '<animateMotion path="M0,0 Q10,-10 20,0 Q30,10 40,0" dur="3s" repeatCount="indefinite"/>'
            '</circle>'
            '<circle cx="180" cy="220" r="1" fill="#ADD8E6" opacity="0.4">'
            '<animateMotion path="M0,0 Q-10,-15 -20,0 Q-30,15 -40,0" dur="4s" repeatCount="indefinite"/>'
            '</circle>' : "";

        return string.concat(starlightEffect, moonPhase, humidityEffect);
    }

    function _getSVGFooter(DynamicTraits memory data) internal pure returns (string memory) {
        return string.concat(
            '<text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="white">',
                'Level: ', Strings.toString(data.level), ' | Power: ', Strings.toString(data.power),
            '</text>',
            '<text x="50%" y="92%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="white">',
                _getSeasonName(data.season), ' | ', _getMoonPhaseName(data.moonPhase),
            '</text>',
            '</svg>'
        );
    }

    function _getSeasonName(uint256 season) internal pure returns (string memory) {
        if (season == 0) return "Spring";
        if (season == 1) return "Summer";
        if (season == 2) return "Autumn";
        return "Winter";
    }

    function _getMoonPhaseName(uint256 moonPhase) internal pure returns (string memory) {
        if (moonPhase == 0) return "New Moon";
        if (moonPhase == 1) return "Waxing Crescent";
        if (moonPhase == 2) return "First Quarter";
        if (moonPhase == 3) return "Waxing Gibbous";
        if (moonPhase == 4) return "Full Moon";
        if (moonPhase == 5) return "Waning Gibbous";
        if (moonPhase == 6) return "Last Quarter";
        return "Waning Crescent";
    }
}
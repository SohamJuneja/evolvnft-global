import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Location {
  id: number;
  name: string;
  emoji: string;
  description: string;
  timezone: string;
}

const LOCATIONS: Location[] = [
  { id: 0, name: "San Francisco, CA", emoji: "🌉", description: "Golden Gate fog and tech innovation", timezone: "Pacific" },
  { id: 1, name: "New York, NY", emoji: "🗽", description: "The city that never sleeps", timezone: "Eastern" },
  { id: 2, name: "London, UK", emoji: "🎡", description: "Cloudy skies and historic charm", timezone: "GMT" },
  { id: 3, name: "Tokyo, Japan", emoji: "🗼", description: "Neon lights and urban energy", timezone: "JST" },
  { id: 4, name: "Bengaluru, India", emoji: "🌸", description: "Garden city with tropical climate", timezone: "IST" },
  { id: 5, name: "Delhi, India", emoji: "🕌", description: "Ancient heritage meets modern energy", timezone: "IST" }
];

interface LocationSelectorProps {
  selectedLocation: number;
  onLocationChange: (locationId: number) => void;
  disabled?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  selectedLocation, 
  onLocationChange, 
  disabled = false 
}) => {
  const selectedLocationData = LOCATIONS.find(loc => loc.id === selectedLocation) || LOCATIONS[0];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">🌍 Choose Your NFT's Location</h3>
        <div className="text-sm text-muted-foreground">
          (Weather affects evolution)
        </div>
      </div>
      
      <Select 
        disabled={disabled}
        value={selectedLocation.toString()} 
        onValueChange={(value) => onLocationChange(parseInt(value))}
      >
        <SelectTrigger className="w-full h-16 bg-card border-2 hover:border-primary/50 transition-colors">
          <SelectValue>
            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">{selectedLocationData.emoji}</div>
              <div>
                <div className="font-semibold text-foreground">{selectedLocationData.name}</div>
                <div className="text-sm text-muted-foreground">{selectedLocationData.description}</div>
              </div>
            </div>
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="max-h-80">
          {LOCATIONS.map((location) => (
            <SelectItem key={location.id} value={location.id.toString()} className="h-16">
              <div className="flex items-center gap-3 w-full">
                <div className="text-2xl">{location.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold">{location.name}</div>
                  <div className="text-sm text-muted-foreground">{location.description}</div>
                  <div className="text-xs text-primary">{location.timezone} timezone</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Weather Preview */}
      <div className="bg-muted/20 rounded-lg p-4 border border-muted">
        <div className="text-sm text-muted-foreground mb-2">Your NFT will evolve based on:</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>🌡️ Real temperature in {selectedLocationData.name}</div>
          <div>☁️ Live weather conditions</div>
          <div>🌙 Local moon phases</div>
          <div>🌅 Day/night cycles in {selectedLocationData.timezone}</div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
export { LOCATIONS };
export type { Location };

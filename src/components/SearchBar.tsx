import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Star, X } from "lucide-react";
import { SavedLocation } from "../types/weather";

interface SearchBarProps {
  onLocationSelect: (location: string) => void;
  onCurrentLocation: () => void;
  savedLocations: SavedLocation[];
  onToggleFavorite: (location: SavedLocation) => void;
  onRemoveLocation: (locationId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onLocationSelect,
  onCurrentLocation,
  savedLocations,
  onToggleFavorite,
  onRemoveLocation,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onLocationSelect(query.trim());
      setQuery("");
      setIsOpen(false);
    }
  };

  const handleLocationClick = (location: SavedLocation) => {
    onLocationSelect(`${location.lat},${location.lon}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto" ref={inputRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for a city..."
            className="w-full pl-12 pr-12 py-3 bg-sky-100 rounded-2xl border border-sky-200 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <button
            type="button"
            onClick={onCurrentLocation}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 hover:text-blue-600 transition-colors"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </form>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-sky-100 rounded-2xl border border-sky-200 shadow-2xl z-50 max-h-80 overflow-y-auto">
          {savedLocations.length > 0 && (
            <div className="p-4">
              <h3 className="text-blue-800 font-medium mb-3">
                Saved Locations
              </h3>
              <div className="space-y-2">
                {savedLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors"
                  >
                    <div
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                      onClick={() => handleLocationClick(location)}
                    >
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-blue-900 font-medium">
                          {location.name}
                        </p>
                        <p className="text-blue-600 text-sm">
                          {location.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleFavorite(location)}
                        className="text-blue-400 hover:text-yellow-400 transition-colors"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            location.isFavorite
                              ? "fill-yellow-400 text-yellow-400"
                              : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => onRemoveLocation(location.id)}
                        className="text-blue-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

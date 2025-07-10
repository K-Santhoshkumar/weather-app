import React, { useState, useEffect } from "react";
import { Sun, Moon, Settings, Thermometer } from "lucide-react";
import { useWeather } from "./hooks/useWeather";
import { useGeolocation } from "./hooks/useGeolocation";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { WeatherCard } from "./components/WeatherCard";
import { ForecastCard } from "./components/ForecastCard";
import { HourlyForecast } from "./components/HourlyForecast";
import { AirQualityCard } from "./components/AirQualityCard";
import { SearchBar } from "./components/SearchBar";
import { WeatherAlerts } from "./components/WeatherAlerts";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SavedLocation } from "./types/weather";

const WEATHER_BACKGROUNDS = {
  clear: "bg-gradient-to-br from-white via-sky-200 to-sky-400",
  cloudy: "bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300",
  rainy: "bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400",
  snowy: "bg-gradient-to-br from-white via-sky-100 to-sky-200",
  default: "bg-gradient-to-br from-white via-sky-200 to-sky-400",
};

function App() {
  const [currentLocation, setCurrentLocation] = useState("New York");
  const [unit, setUnit] = useLocalStorage<"celsius" | "fahrenheit">(
    "temperatureUnit",
    "celsius"
  );
  const [savedLocations, setSavedLocations] = useLocalStorage<SavedLocation[]>(
    "savedLocations",
    []
  );
  const [activeTab, setActiveTab] = useState<
    "current" | "forecast" | "hourly" | "air" | "alerts"
  >("current");
  const [isDarkMode, setIsDarkMode] = useLocalStorage("darkMode", false);

  const { weatherData, airQuality, alerts, loading, error } =
    useWeather(currentLocation);
  const { location: geoLocation, getCurrentLocation } = useGeolocation();

  // Update location when geolocation is available
  useEffect(() => {
    if (geoLocation) {
      setCurrentLocation(`${geoLocation.latitude},${geoLocation.longitude}`);
    }
  }, [geoLocation]);

  const getBackgroundClass = () => {
    if (!weatherData) return WEATHER_BACKGROUNDS.default;

    const condition = weatherData.current.condition.text.toLowerCase();
    if (condition.includes("clear") || condition.includes("sunny")) {
      return WEATHER_BACKGROUNDS.clear;
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      return WEATHER_BACKGROUNDS.rainy;
    } else if (condition.includes("snow")) {
      return WEATHER_BACKGROUNDS.snowy;
    } else if (condition.includes("cloud")) {
      return WEATHER_BACKGROUNDS.cloudy;
    }
    return WEATHER_BACKGROUNDS.default;
  };

  const handleLocationSelect = (location: string) => {
    setCurrentLocation(location);

    // Save location to history (if it's not coordinates)
    if (!location.includes(",") && weatherData) {
      const newLocation: SavedLocation = {
        id: Date.now().toString(),
        name: weatherData.location.name,
        country: weatherData.location.country,
        region: weatherData.location.region,
        lat: weatherData.location.lat,
        lon: weatherData.location.lon,
        isFavorite: false,
      };

      setSavedLocations((prev) => {
        const exists = prev.some((loc) => loc.name === newLocation.name);
        if (!exists) {
          return [...prev, newLocation];
        }
        return prev;
      });
    }
  };

  const handleToggleFavorite = (location: SavedLocation) => {
    setSavedLocations((prev) =>
      prev.map((loc) =>
        loc.id === location.id ? { ...loc, isFavorite: !loc.isFavorite } : loc
      )
    );
  };

  const handleRemoveLocation = (locationId: string) => {
    setSavedLocations((prev) => prev.filter((loc) => loc.id !== locationId));
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${getBackgroundClass()} flex items-center justify-center`}
      >
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Weather data unavailable
          </h2>
          <p className="text-white/80 mb-6">
            To get real weather data, please add your WeatherAPI key to the
            useWeather hook.
          </p>
          <p className="text-white/70 text-sm">
            Showing demo data for now. Get your free API key at{" "}
            <a
              href="https://weatherapi.com"
              className="text-blue-300 hover:text-blue-200"
            >
              weatherapi.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div
      className={`min-h-screen ${getBackgroundClass()} transition-all duration-1000`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Sun className="w-8 h-8 text-sky-500" />
            <h1 className="text-3xl font-bold text-blue-900">Weather Pro</h1>
          </div>

          <div className="flex items-center space-x-4">
            <SearchBar
              onLocationSelect={handleLocationSelect}
              onCurrentLocation={getCurrentLocation}
              savedLocations={savedLocations}
              onToggleFavorite={handleToggleFavorite}
              onRemoveLocation={handleRemoveLocation}
            />
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 mb-8 bg-sky-100 rounded-2xl p-1 border border-sky-200">
          {[
            { id: "current", label: "Current" },
            { id: "forecast", label: "Forecast" },
            { id: "hourly", label: "Hourly" },
            { id: "air", label: "Air Quality" },
            {
              id: "alerts",
              label: `Alerts ${alerts.length > 0 ? `(${alerts.length})` : ""}`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-sky-200 text-blue-900 shadow-lg"
                  : "text-blue-700 hover:text-blue-900 hover:bg-sky-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="space-y-8">
          {alerts.length > 0 && activeTab !== "alerts" && (
            <div className="bg-sky-100 rounded-2xl p-4 border border-sky-300">
              <p className="text-blue-800 font-medium">
                ⚠️ {alerts.length} weather alert{alerts.length > 1 ? "s" : ""}{" "}
                active
              </p>
            </div>
          )}

          {activeTab === "current" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <WeatherCard weather={weatherData} unit={unit} />
              </div>
              <div>
                <ForecastCard
                  forecast={weatherData.forecast.forecastday}
                  unit={unit}
                />
              </div>
            </div>
          )}

          {activeTab === "forecast" && (
            <ForecastCard
              forecast={weatherData.forecast.forecastday}
              unit={unit}
            />
          )}

          {activeTab === "hourly" && (
            <HourlyForecast
              hourlyData={weatherData.forecast.forecastday[0].hour}
              unit={unit}
            />
          )}

          {activeTab === "air" && airQuality && (
            <AirQualityCard airQuality={airQuality} />
          )}

          {activeTab === "alerts" && <WeatherAlerts alerts={alerts} />}
        </main>
      </div>
    </div>
  );
}

export default App;

import React from "react";
import { Cloud, Thermometer, Droplets, Wind, Eye, Sun } from "lucide-react";
import { WeatherData } from "../types/weather";

interface WeatherCardProps {
  weather: WeatherData;
  unit: "celsius" | "fahrenheit";
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, unit }) => {
  const temp =
    unit === "celsius" ? weather.current.temp_c : weather.current.temp_f;
  const feelsLike =
    unit === "celsius"
      ? weather.current.feelslike_c
      : weather.current.feelslike_f;
  const tempUnit = unit === "celsius" ? "°C" : "°F";

  return (
    <div className="bg-sky-50 rounded-3xl p-8 shadow-2xl border border-sky-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            {weather.location.name}
          </h1>
          <p className="text-blue-700">{weather.location.country}</p>
          <p className="text-blue-600 text-sm">
            {new Date(weather.location.localtime).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-light text-blue-800">
            {Math.round(temp)}
            {tempUnit}
          </div>
          <p className="text-blue-700">
            Feels like {Math.round(feelsLike)}
            {tempUnit}
          </p>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <img
          src={weather.current.condition.icon}
          alt={weather.current.condition.text}
          className="w-16 h-16 mr-4"
        />
        <div>
          <p className="text-xl text-blue-800 font-medium">
            {weather.current.condition.text}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center text-blue-600">
              <Sun className="w-4 h-4 mr-1 text-blue-400" />
              <span className="text-sm">UV {weather.current.uv}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Wind className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">Wind</span>
          </div>
          <p className="text-blue-800 font-semibold">
            {weather.current.wind_kph} km/h
          </p>
          <p className="text-blue-600 text-xs">{weather.current.wind_dir}</p>
        </div>

        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Droplets className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">Humidity</span>
          </div>
          <p className="text-blue-800 font-semibold">
            {weather.current.humidity}%
          </p>
        </div>

        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Thermometer className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">Pressure</span>
          </div>
          <p className="text-blue-800 font-semibold">
            {weather.current.pressure_mb} mb
          </p>
        </div>

        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Eye className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">Visibility</span>
          </div>
          <p className="text-blue-800 font-semibold">
            {weather.current.vis_km} km
          </p>
        </div>
      </div>
    </div>
  );
};

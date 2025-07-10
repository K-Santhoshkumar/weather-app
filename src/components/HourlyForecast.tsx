import React from "react";
import { HourlyForecast as HourlyForecastType } from "../types/weather";

interface HourlyForecastProps {
  hourlyData: HourlyForecastType[];
  unit: "celsius" | "fahrenheit";
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourlyData,
  unit,
}) => {
  const getTemperature = (hour: HourlyForecastType) => {
    const temp = unit === "celsius" ? hour.temp_c : hour.temp_f;
    const tempUnit = unit === "celsius" ? "°C" : "°F";
    return `${Math.round(temp)}${tempUnit}`;
  };

  const getHourFormat = (time: string) => {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    });
  };

  // Show next 24 hours
  const next24Hours = hourlyData.slice(0, 24);

  return (
    <div className="bg-sky-50 rounded-3xl p-6 shadow-2xl border border-sky-200">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Hourly Forecast</h2>
      <div className="overflow-x-auto">
        <div className="flex space-x-4 pb-4">
          {next24Hours.map((hour, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-sky-100 rounded-2xl p-4 min-w-[120px] text-center hover:bg-sky-200 transition-colors"
            >
              <p className="text-blue-600 text-sm mb-2">
                {getHourFormat(hour.time)}
              </p>
              <img
                src={hour.condition.icon}
                alt={hour.condition.text}
                className="w-8 h-8 mx-auto mb-2"
              />
              <p className="text-blue-800 font-bold mb-1">
                {getTemperature(hour)}
              </p>
              <div className="text-xs text-blue-500">
                <p>💧 {hour.humidity}%</p>
                <p>🌪️ {hour.wind_kph} km/h</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

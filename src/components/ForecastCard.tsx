import React from "react";
import { ForecastDay } from "../types/weather";

interface ForecastCardProps {
  forecast: ForecastDay[];
  unit: "celsius" | "fahrenheit";
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  unit,
}) => {
  const getTemperature = (day: ForecastDay) => {
    if (unit === "celsius") {
      return {
        max: Math.round(day.day.maxtemp_c),
        min: Math.round(day.day.mintemp_c),
        unit: "°C",
      };
    }
    return {
      max: Math.round(day.day.maxtemp_f),
      min: Math.round(day.day.mintemp_f),
      unit: "°F",
    };
  };

  const getDayName = (date: string) => {
    const today = new Date();
    const forecastDate = new Date(date);
    const diffTime = forecastDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return forecastDate.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <div className="bg-sky-50 rounded-3xl p-6 shadow-2xl border border-sky-200">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">5-Day Forecast</h2>
      <div className="space-y-4">
        {forecast.map((day, index) => {
          const temp = getTemperature(day);
          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-sky-100 rounded-2xl hover:bg-sky-200 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 text-blue-800 font-medium">
                  {getDayName(day.date)}
                </div>
                <img
                  src={day.day.condition.icon}
                  alt={day.day.condition.text}
                  className="w-10 h-10"
                />
                <div>
                  <p className="text-blue-800 font-medium">
                    {day.day.condition.text}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-blue-600">
                    <span>💧 {day.day.avghumidity}%</span>
                    <span>🌪️ {day.day.maxwind_kph} km/h</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-900 font-bold">
                  {temp.max}
                  {temp.unit}
                </div>
                <div className="text-blue-700">
                  {temp.min}
                  {temp.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

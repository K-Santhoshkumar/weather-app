import React from "react";
import { Wind, AlertTriangle, CheckCircle } from "lucide-react";
import { AirQualityData } from "../types/weather";

interface AirQualityCardProps {
  airQuality: AirQualityData;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({
  airQuality,
}) => {
  const getAQIStatus = (index: number) => {
    if (index <= 50)
      return { text: "Good", color: "text-green-400", icon: CheckCircle };
    if (index <= 100)
      return {
        text: "Moderate",
        color: "text-yellow-400",
        icon: AlertTriangle,
      };
    if (index <= 150)
      return {
        text: "Unhealthy for Sensitive Groups",
        color: "text-orange-400",
        icon: AlertTriangle,
      };
    if (index <= 200)
      return { text: "Unhealthy", color: "text-red-400", icon: AlertTriangle };
    if (index <= 300)
      return {
        text: "Very Unhealthy",
        color: "text-purple-400",
        icon: AlertTriangle,
      };
    return { text: "Hazardous", color: "text-red-600", icon: AlertTriangle };
  };

  const aqiStatus = getAQIStatus(airQuality.us_epa_index * 50); // Convert to standard scale
  const StatusIcon = aqiStatus.icon;

  return (
    <div className="bg-sky-50 rounded-3xl p-6 shadow-2xl border border-sky-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Air Quality</h2>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-6 h-6 ${aqiStatus.color}`} />
          <span className={`font-medium ${aqiStatus.color}`}>
            {aqiStatus.text}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Wind className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">PM2.5</span>
          </div>
          <p className="text-blue-800 font-semibold">
            {airQuality.pm2_5} μg/m³
          </p>
        </div>

        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Wind className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">PM10</span>
          </div>
          <p className="text-blue-800 font-semibold">{airQuality.pm10} μg/m³</p>
        </div>

        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Wind className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">CO</span>
          </div>
          <p className="text-blue-800 font-semibold">{airQuality.co} μg/m³</p>
        </div>

        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Wind className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">NO2</span>
          </div>
          <p className="text-blue-800 font-semibold">{airQuality.no2} μg/m³</p>
        </div>

        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Wind className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">O3</span>
          </div>
          <p className="text-blue-800 font-semibold">{airQuality.o3} μg/m³</p>
        </div>

        <div className="bg-sky-100 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <Wind className="w-5 h-5 text-sky-400 mr-2" />
            <span className="text-blue-600 text-sm">SO2</span>
          </div>
          <p className="text-blue-800 font-semibold">{airQuality.so2} μg/m³</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-sky-100 rounded-2xl">
        <h3 className="text-blue-800 font-medium mb-2">
          Health Recommendations
        </h3>
        <p className="text-blue-600 text-sm">
          {airQuality.us_epa_index <= 2
            ? "Air quality is good. Great day for outdoor activities!"
            : airQuality.us_epa_index <= 4
            ? "Air quality is moderate. Consider limiting prolonged outdoor activities."
            : "Air quality is poor. Avoid outdoor activities and keep windows closed."}
        </p>
      </div>
    </div>
  );
};

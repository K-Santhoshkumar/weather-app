import React from "react";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { WeatherAlert } from "../types/weather";

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-sky-50 rounded-3xl p-8 shadow-2xl border border-sky-200 text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          Weather Alerts
        </h2>
        <p className="text-blue-700">No weather alerts at this time.</p>
      </div>
    );
  }

  const getAlertIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "severe":
        return AlertTriangle;
      case "moderate":
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "severe":
        return "border-red-500 bg-red-500/20";
      case "moderate":
        return "border-yellow-500 bg-yellow-500/20";
      default:
        return "border-sky-400 bg-sky-100";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-900">Weather Alerts</h2>
      {alerts.map((alert, index) => {
        const AlertIcon = getAlertIcon(alert.severity);
        const alertColor = getAlertColor(alert.severity);

        return (
          <div
            key={index}
            className={`bg-sky-50 rounded-3xl p-6 shadow-2xl border ${alertColor}`}
          >
            <div className="flex items-start space-x-4">
              <AlertIcon className="w-6 h-6 text-blue-400 mt-1" />
              <div className="flex-1">
                <h3 className="text-blue-900 font-bold text-lg mb-2">
                  {alert.headline}
                </h3>
                <div className="flex items-center space-x-4 mb-3 text-sm text-blue-600">
                  <span>Category: {alert.category}</span>
                  <span>Severity: {alert.severity}</span>
                  <span>Urgency: {alert.urgency}</span>
                </div>
                <p className="text-blue-800 mb-4">{alert.desc}</p>
                {alert.instruction && (
                  <div className="bg-sky-100 rounded-2xl p-4">
                    <h4 className="text-blue-800 font-medium mb-2">
                      Instructions:
                    </h4>
                    <p className="text-blue-700 text-sm">{alert.instruction}</p>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4 text-sm text-blue-600">
                  <span>
                    Effective: {new Date(alert.effective).toLocaleString()}
                  </span>
                  <span>
                    Expires: {new Date(alert.expires).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

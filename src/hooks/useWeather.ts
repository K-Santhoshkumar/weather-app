import { useState, useEffect } from 'react';
import { WeatherData, AirQualityData, WeatherAlert } from '../types/weather';

const API_KEY = '1ed67ceb0873b99bfc670e83b383d516';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export const useWeather = (location: string) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCoordinates = async (query: string) => {
    // If query contains coordinates (lat,lon), parse them directly
    if (query.includes(',')) {
      const [lat, lon] = query.split(',').map(coord => parseFloat(coord.trim()));
      return { lat, lon };
    }

    // Otherwise, geocode the location name
    const response = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Location not found');
    }
    
    const data = await response.json();
    if (data.length === 0) {
      throw new Error('Location not found');
    }
    
    return { lat: data[0].lat, lon: data[0].lon };
  };

  const fetchWeatherData = async (query: string) => {
    if (!query) return;
    
    setLoading(true);
    setError(null);

    try {
      const { lat, lon } = await getCoordinates(query);

      // Fetch current weather
      const currentResponse = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      if (!currentResponse.ok) {
        throw new Error('Weather data not found');
      }

      const currentData = await currentResponse.json();

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error('Forecast data not found');
      }

      const forecastData = await forecastResponse.json();

      // Fetch air quality
      try {
        const airQualityResponse = await fetch(
          `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        
        if (airQualityResponse.ok) {
          const airData = await airQualityResponse.json();
          setAirQuality(transformAirQualityData(airData));
        }
      } catch (airError) {
        console.warn('Air quality data not available');
      }

      // Transform OpenWeatherMap data to our format
      const transformedData = transformWeatherData(currentData, forecastData);
      setWeatherData(transformedData);
      setAlerts([]); // OpenWeatherMap doesn't provide alerts in free tier
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeatherData(location);
    }
  }, [location]);

  return {
    weatherData,
    airQuality,
    alerts,
    loading,
    error,
    refetch: () => fetchWeatherData(location),
  };
};

const transformWeatherData = (current: any, forecast: any): WeatherData => {
  // Group forecast data by day
  const dailyForecasts = forecast.list.reduce((acc: any, item: any) => {
    const date = item.dt_txt.split(' ')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  // Transform daily forecasts
  const forecastDays = Object.keys(dailyForecasts).slice(0, 5).map((date) => {
    const dayData = dailyForecasts[date];
    const temps = dayData.map((item: any) => item.main.temp);
    const conditions = dayData.map((item: any) => item.weather[0]);
    
    // Find most common condition
    const conditionCounts = conditions.reduce((acc: any, condition: any) => {
      acc[condition.main] = (acc[condition.main] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => 
      conditionCounts[a] > conditionCounts[b] ? a : b
    );
    
    const conditionData = conditions.find((c: any) => c.main === mostCommonCondition);

    return {
      date,
      day: {
        maxtemp_c: Math.max(...temps),
        maxtemp_f: Math.max(...temps) * 9/5 + 32,
        mintemp_c: Math.min(...temps),
        mintemp_f: Math.min(...temps) * 9/5 + 32,
        avgtemp_c: temps.reduce((a: number, b: number) => a + b, 0) / temps.length,
        avgtemp_f: (temps.reduce((a: number, b: number) => a + b, 0) / temps.length) * 9/5 + 32,
        maxwind_mph: Math.max(...dayData.map((item: any) => item.wind?.speed || 0)) * 2.237,
        maxwind_kph: Math.max(...dayData.map((item: any) => item.wind?.speed || 0)) * 3.6,
        totalprecip_mm: dayData.reduce((acc: number, item: any) => acc + (item.rain?.['3h'] || 0), 0),
        avgvis_km: 10, // OpenWeatherMap doesn't provide visibility in forecast
        avghumidity: dayData.reduce((acc: number, item: any) => acc + item.main.humidity, 0) / dayData.length,
        condition: {
          text: conditionData.description,
          icon: `https://openweathermap.org/img/wn/${conditionData.icon}@2x.png`,
          code: conditionData.id,
        },
        uv: 5, // OpenWeatherMap doesn't provide UV in free tier
      },
      astro: {
        sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        moonrise: '09:15 PM',
        moonset: '06:45 AM',
        moon_phase: 'Waxing Gibbous',
      },
      hour: dayData.map((item: any) => ({
        time: item.dt_txt,
        temp_c: item.main.temp,
        temp_f: item.main.temp * 9/5 + 32,
        condition: {
          text: item.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          code: item.weather[0].id,
        },
        wind_mph: (item.wind?.speed || 0) * 2.237,
        wind_kph: (item.wind?.speed || 0) * 3.6,
        wind_dir: getWindDirection(item.wind?.deg || 0),
        pressure_mb: item.main.pressure,
        precip_mm: item.rain?.['3h'] || item.snow?.['3h'] || 0,
        humidity: item.main.humidity,
        cloud: item.clouds.all,
        feelslike_c: item.main.feels_like,
        feelslike_f: item.main.feels_like * 9/5 + 32,
        windchill_c: item.main.feels_like,
        windchill_f: item.main.feels_like * 9/5 + 32,
        heatindex_c: item.main.feels_like,
        heatindex_f: item.main.feels_like * 9/5 + 32,
        dewpoint_c: item.main.temp - ((100 - item.main.humidity) / 5),
        dewpoint_f: (item.main.temp - ((100 - item.main.humidity) / 5)) * 9/5 + 32,
        vis_km: 10,
        gust_mph: (item.wind?.gust || item.wind?.speed || 0) * 2.237,
        gust_kph: (item.wind?.gust || item.wind?.speed || 0) * 3.6,
        uv: 0,
      })),
    };
  });

  return {
    location: {
      name: current.name,
      country: current.sys.country,
      region: current.sys.country,
      lat: current.coord.lat,
      lon: current.coord.lon,
      localtime: new Date().toISOString(),
    },
    current: {
      temp_c: current.main.temp,
      temp_f: current.main.temp * 9/5 + 32,
      condition: {
        text: current.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
        code: current.weather[0].id,
      },
      wind_mph: (current.wind?.speed || 0) * 2.237,
      wind_kph: (current.wind?.speed || 0) * 3.6,
      wind_dir: getWindDirection(current.wind?.deg || 0),
      pressure_mb: current.main.pressure,
      pressure_in: current.main.pressure * 0.02953,
      precip_mm: current.rain?.['1h'] || current.snow?.['1h'] || 0,
      humidity: current.main.humidity,
      cloud: current.clouds.all,
      feelslike_c: current.main.feels_like,
      feelslike_f: current.main.feels_like * 9/5 + 32,
      vis_km: (current.visibility || 10000) / 1000,
      uv: 5, // OpenWeatherMap doesn't provide UV in free tier
    },
    forecast: {
      forecastday: forecastDays,
    },
  };
};

const transformAirQualityData = (airData: any): AirQualityData => {
  const components = airData.list[0].components;
  return {
    co: components.co,
    no2: components.no2,
    o3: components.o3,
    so2: components.so2,
    pm2_5: components.pm2_5,
    pm10: components.pm10,
    us_epa_index: airData.list[0].main.aqi,
    gb_defra_index: airData.list[0].main.aqi,
  };
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};
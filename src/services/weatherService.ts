/**
 * Weather Service
 * Fetches real weather data from wttr.in (no API key required)
 */

import type { WeatherCondition } from '../utils/getAtmosphereMode';

export interface WeatherData {
    condition: WeatherCondition;
    city: string;
    temperature: number;
    description: string;
    icon: string;
}

// Map wttr.in weather codes to our conditions
const WEATHER_CODE_MAP: Record<string, WeatherCondition> = {
    // Clear/Sunny
    '113': 'CLEAR',
    // Partly cloudy
    '116': 'CLOUDS',
    // Cloudy
    '119': 'CLOUDS',
    '122': 'CLOUDS',
    // Mist/Fog
    '143': 'MIST',
    '248': 'MIST',
    '260': 'MIST',
    // Light rain/drizzle
    '176': 'RAIN',
    '263': 'RAIN',
    '266': 'RAIN',
    '293': 'RAIN',
    '296': 'RAIN',
    '299': 'RAIN',
    '302': 'RAIN',
    '305': 'RAIN',
    '308': 'RAIN',
    '353': 'RAIN',
    '356': 'RAIN',
    '359': 'RAIN',
    // Snow
    '179': 'SNOW',
    '182': 'SNOW',
    '185': 'SNOW',
    '227': 'SNOW',
    '230': 'SNOW',
    '317': 'SNOW',
    '320': 'SNOW',
    '323': 'SNOW',
    '326': 'SNOW',
    '329': 'SNOW',
    '332': 'SNOW',
    '335': 'SNOW',
    '338': 'SNOW',
    '350': 'SNOW',
    '368': 'SNOW',
    '371': 'SNOW',
    '374': 'SNOW',
    '377': 'SNOW',
    // Thunderstorm
    '200': 'THUNDERSTORM',
    '386': 'THUNDERSTORM',
    '389': 'THUNDERSTORM',
    '392': 'THUNDERSTORM',
    '395': 'THUNDERSTORM',
};

const WEATHER_ICONS: Record<WeatherCondition, string> = {
    CLEAR: '☀️',
    CLOUDS: '☁️',
    RAIN: '🌧️',
    SNOW: '❄️',
    THUNDERSTORM: '⛈️',
    MIST: '🌫️',
};

const WEATHER_DESCRIPTIONS: Record<WeatherCondition, string> = {
    CLEAR: 'Ensoleillé',
    CLOUDS: 'Nuageux',
    RAIN: 'Pluvieux',
    SNOW: 'Neigeux',
    THUNDERSTORM: 'Orageux',
    MIST: 'Brumeux',
};

/**
 * Get user's location using browser geolocation
 */
export async function getUserLocation(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            () => {
                // User denied or error
                resolve(null);
            },
            { timeout: 5000 }
        );
    });
}

/**
 * Fetch weather from wttr.in
 * Uses IP-based location if coordinates not provided
 */
export async function getWeatherData(coords?: { lat: number; lon: number }): Promise<WeatherData | null> {
    try {
        // wttr.in accepts coordinates or auto-detects from IP
        const location = coords ? `${coords.lat},${coords.lon}` : '';
        const url = `https://wttr.in/${location}?format=j1`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Weather API failed');
        }

        const data = await response.json();

        // Extract current condition
        const current = data.current_condition?.[0];
        const area = data.nearest_area?.[0];

        if (!current) {
            return null;
        }

        const weatherCode = current.weatherCode;
        const condition = WEATHER_CODE_MAP[weatherCode] || 'CLEAR';

        return {
            condition,
            city: area?.areaName?.[0]?.value || 'Unknown',
            temperature: parseInt(current.temp_C, 10),
            description: WEATHER_DESCRIPTIONS[condition],
            icon: WEATHER_ICONS[condition],
        };
    } catch (error) {
        console.warn('Weather fetch failed, using fallback:', error);
        return null;
    }
}

/**
 * Cached weather fetch with 30 min TTL
 */
let cachedWeather: { data: WeatherData | null; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function getCachedWeather(): Promise<WeatherData | null> {
    const now = Date.now();

    if (cachedWeather && (now - cachedWeather.timestamp) < CACHE_TTL) {
        return cachedWeather.data;
    }

    // Try to get location first
    const coords = await getUserLocation();
    const data = await getWeatherData(coords || undefined);

    cachedWeather = { data, timestamp: now };
    return data;
}

/**
 * Atmosphere Mode Detection
 * Determines the visual atmosphere based on date, time, and events
 */

export type AtmosphereMode =
    | 'WINTER'   // December - snow and cold
    | 'SPOOKY'   // October 31 - Halloween
    | 'SUMMER'   // July/August - warm sunset
    | 'NIGHT'    // 19h-7h - starry sky
    | 'DAY';     // 7h-19h - aurora/light

export type WeatherCondition =
    | 'RAIN'
    | 'SNOW'
    | 'CLOUDS'
    | 'CLEAR'
    | 'THUNDERSTORM'
    | 'MIST';

export interface AtmosphereConfig {
    mode: AtmosphereMode;
    gradient: string;
    particleType: 'snow' | 'rain' | 'stars' | 'orbs' | 'none';
    particleDensity: number; // 0-1
    overlayOpacity: number;  // 0-1
}

const GRADIENTS = {
    WINTER: 'linear-gradient(180deg, #1a1f35 0%, #2d3a5f 30%, #4a5d8a 60%, #8ba4c7 100%)',
    SPOOKY: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b47 40%, #4a2c6b 70%, #6b3d8f 100%)',
    SUMMER: 'linear-gradient(180deg, #1e3a5f 0%, #4a6fa5 20%, #ff9966 60%, #ff6b6b 100%)',
    NIGHT: 'linear-gradient(180deg, #0a0a1a 0%, #0f1628 30%, #182540 60%, #1e3a5f 100%)',
    DAY: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 30%, #3b5998 50%, #4a90b8 80%, #87ceeb 100%)',
};

/**
 * Get the current atmosphere mode based on date and time
 */
export function getAtmosphereMode(date: Date = new Date()): AtmosphereConfig {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    const hour = date.getHours();

    // Priority 1: Special Events

    // December = Winter mode
    if (month === 12) {
        return {
            mode: 'WINTER',
            gradient: GRADIENTS.WINTER,
            particleType: 'snow',
            particleDensity: 0.6,
            overlayOpacity: 0,
        };
    }

    // October 31 = Halloween
    if (month === 10 && day === 31) {
        return {
            mode: 'SPOOKY',
            gradient: GRADIENTS.SPOOKY,
            particleType: 'orbs',
            particleDensity: 0.3,
            overlayOpacity: 0,
        };
    }

    // July or August = Summer
    if (month === 7 || month === 8) {
        return {
            mode: 'SUMMER',
            gradient: GRADIENTS.SUMMER,
            particleType: 'none',
            particleDensity: 0,
            overlayOpacity: 0,
        };
    }

    // Priority 2: Day/Night cycle

    // Night: 19h - 7h
    if (hour >= 19 || hour < 7) {
        return {
            mode: 'NIGHT',
            gradient: GRADIENTS.NIGHT,
            particleType: 'stars',
            particleDensity: 0.8,
            overlayOpacity: 0,
        };
    }

    // Day: 7h - 19h
    return {
        mode: 'DAY',
        gradient: GRADIENTS.DAY,
        particleType: 'none',
        particleDensity: 0,
        overlayOpacity: 0,
    };
}

/**
 * Merge weather conditions with base atmosphere
 */
export function applyWeatherOverlay(
    base: AtmosphereConfig,
    weather: WeatherCondition | null
): AtmosphereConfig {
    if (!weather) return base;

    switch (weather) {
        case 'RAIN':
        case 'THUNDERSTORM':
            return {
                ...base,
                particleType: 'rain',
                particleDensity: weather === 'THUNDERSTORM' ? 0.9 : 0.7,
                overlayOpacity: 0.2,
            };

        case 'SNOW':
            return {
                ...base,
                particleType: 'snow',
                particleDensity: 0.7,
                overlayOpacity: 0.1,
            };

        case 'CLOUDS':
        case 'MIST':
            return {
                ...base,
                overlayOpacity: 0.15,
            };

        case 'CLEAR':
            // Intensify current mode
            return {
                ...base,
                particleDensity: Math.min(1, base.particleDensity * 1.3),
            };

        default:
            return base;
    }
}

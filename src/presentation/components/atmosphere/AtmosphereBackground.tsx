/**
 * AtmosphereBackground - Dynamic Background Engine
 * 
 * Changes background based on:
 * 1. Events (Winter, Halloween, Summer)
 * 2. Time of day (Day/Night)
 * 3. Real weather (via wttr.in API)
 */

import React, { useState, useEffect, useRef } from 'react';
import { getAtmosphereMode, applyWeatherOverlay } from '../../../utils/getAtmosphereMode';
import type { AtmosphereConfig } from '../../../utils/getAtmosphereMode';
import { getCachedWeather } from '../../../services/weatherService';
import type { WeatherData } from '../../../services/weatherService';
import { ParticleCanvas } from './ParticleCanvas';
import { WeatherWidget } from './WeatherWidget';

interface AtmosphereBackgroundProps {
    showWidget?: boolean;
    className?: string;
}

export const AtmosphereBackground: React.FC<AtmosphereBackgroundProps> = ({
    showWidget = true,
    className = '',
}) => {
    const [config, setConfig] = useState<AtmosphereConfig>(() => getAtmosphereMode());
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevGradientRef = useRef<string>(config.gradient);

    // Fetch weather on mount
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await getCachedWeather();
                setWeather(data);

                if (data) {
                    const baseConfig = getAtmosphereMode();
                    const newConfig = applyWeatherOverlay(baseConfig, data.condition);

                    // Smooth transition
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setConfig(newConfig);
                        prevGradientRef.current = newConfig.gradient;
                        setIsTransitioning(false);
                    }, 500);
                }
            } catch (error) {
                console.warn('Weather fetch failed, using time-based mode');
            }
        };

        fetchWeather();

        // Refresh weather every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Update mode every hour
    useEffect(() => {
        const updateMode = () => {
            const baseConfig = getAtmosphereMode();
            const newConfig = weather
                ? applyWeatherOverlay(baseConfig, weather.condition)
                : baseConfig;

            if (newConfig.gradient !== config.gradient) {
                setIsTransitioning(true);
                setTimeout(() => {
                    setConfig(newConfig);
                    prevGradientRef.current = newConfig.gradient;
                    setIsTransitioning(false);
                }, 500);
            }
        };

        // Check every 5 minutes for hour changes
        const interval = setInterval(updateMode, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [weather, config.gradient]);

    return (
        <>
            {/* Gradient Background Layer */}
            <div
                className={`fixed inset-0 transition-all duration-1000 ease-in-out ${className}`}
                style={{
                    background: config.gradient,
                    zIndex: -2,
                    opacity: isTransitioning ? 0.7 : 1,
                }}
            />

            {/* Weather Overlay (darker for rain/clouds) */}
            {config.overlayOpacity > 0 && (
                <div
                    className="fixed inset-0 transition-opacity duration-1000"
                    style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        opacity: config.overlayOpacity,
                        zIndex: -1,
                    }}
                />
            )}

            {/* Particle System */}
            <ParticleCanvas
                type={config.particleType}
                density={config.particleDensity}
            />

            {/* Weather Widget */}
            {showWidget && weather && (
                <WeatherWidget
                    city={weather.city}
                    icon={weather.icon}
                    description={weather.description}
                    temperature={weather.temperature}
                />
            )}
        </>
    );
};

export default AtmosphereBackground;

/**
 * WeatherWidget - Small corner display showing current weather
 * Format: "📍 Paris - 🌧️ Pluvieux"
 */

import React from 'react';
import { MapPin } from 'lucide-react';

interface WeatherWidgetProps {
    city: string;
    icon: string;
    description: string;
    temperature?: number;
    className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
    city,
    icon,
    description,
    temperature,
    className = '',
}) => {
    return (
        <div
            className={`
        fixed top-2.5 right-40 z-40
        flex items-center gap-2 px-3 py-1.5
        bg-black/30 backdrop-blur-md
        border border-white/10 rounded-full
        text-white/80 text-xs
        transition-opacity duration-500
        hover:bg-black/40
        ${className}
      `}
        >
            <MapPin size={12} className="text-white/60" />
            <span className="font-medium">{city}</span>
            <span className="text-white/40">•</span>
            <span>{icon}</span>
            <span className="text-white/70">{description}</span>
            {temperature !== undefined && (
                <>
                    <span className="text-white/40">•</span>
                    <span className="font-mono">{temperature}°C</span>
                </>
            )}
        </div>
    );
};

export default WeatherWidget;

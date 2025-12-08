/**
 * Region Selector Component
 * 
 * UI for manually selecting CV target region.
 * Shows auto-detected region with option to override.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check, RefreshCw } from 'lucide-react';
import { useRegionContext } from '../../contexts/RegionContext';
import { getAllRegions } from '../../../domain/region';
import type { RegionId } from '../../../domain/region/types';

interface RegionSelectorProps {
    variant?: 'dropdown' | 'inline' | 'modal';
    className?: string;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
    variant = 'dropdown',
    className = ''
}) => {
    const { profile, regionId, setRegion, resetToAutoDetect, isAutoDetected } = useRegionContext();
    const [isOpen, setIsOpen] = useState(false);

    const allRegions = getAllRegions();

    // Group regions by category
    const regionGroups = {
        'Amérique': allRegions.filter(r => ['usa'].includes(r.id)),
        'Europe': allRegions.filter(r => ['uk', 'dach', 'france', 'benelux', 'nordics', 'spain', 'italy'].includes(r.id)),
        'Asie-Pacifique': allRegions.filter(r => ['japan', 'india'].includes(r.id)),
        'Moyen-Orient': allRegions.filter(r => ['middle-east'].includes(r.id)),
        'International': allRegions.filter(r => ['global'].includes(r.id))
    };

    const handleSelect = (id: RegionId) => {
        setRegion(id);
        setIsOpen(false);
    };

    if (variant === 'inline') {
        return (
            <div className={`region-selector-inline ${className}`}>
                <p className="text-sm text-gray-500 mb-2">
                    Région cible du CV :
                </p>
                <div className="flex flex-wrap gap-2">
                    {allRegions.slice(0, 6).map(region => (
                        <button
                            key={region.id}
                            onClick={() => handleSelect(region.id)}
                            className={`
                px-3 py-1.5 text-sm rounded-full transition-all
                ${regionId === region.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }
              `}
                        >
                            {region.flag} {region.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Dropdown variant
    return (
        <div className={`region-selector-dropdown relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
          flex items-center gap-2 px-4 py-2
          bg-white border border-gray-200 rounded-lg
          hover:border-blue-400 hover:shadow-sm
          transition-all
        "
            >
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">
                    {profile.flag} {profile.name}
                </span>
                {isAutoDetected && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        Auto
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="
              absolute top-full left-0 mt-2 z-50
              w-72 max-h-96 overflow-y-auto
              bg-white rounded-xl shadow-xl border border-gray-100
            "
                    >
                        {/* Auto-detect option */}
                        <button
                            onClick={() => {
                                resetToAutoDetect();
                                setIsOpen(false);
                            }}
                            className="
                w-full flex items-center gap-3 px-4 py-3
                border-b border-gray-100
                hover:bg-gray-50 transition-colors
              "
                        >
                            <RefreshCw className="w-4 h-4 text-blue-500" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium">Détection automatique</p>
                                <p className="text-xs text-gray-500">Basée sur votre navigateur</p>
                            </div>
                            {isAutoDetected && <Check className="w-4 h-4 text-green-500" />}
                        </button>

                        {/* Region groups */}
                        {Object.entries(regionGroups).map(([group, regions]) => (
                            <div key={group}>
                                <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-50">
                                    {group}
                                </p>
                                {regions.map(region => (
                                    <button
                                        key={region.id}
                                        onClick={() => handleSelect(region.id)}
                                        className={`
                      w-full flex items-center gap-3 px-4 py-3
                      hover:bg-blue-50 transition-colors
                      ${regionId === region.id && !isAutoDetected ? 'bg-blue-50' : ''}
                    `}
                                    >
                                        <span className="text-xl">{region.flag}</span>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium">{region.name}</p>
                                            <p className="text-xs text-gray-500">
                                                ATS: {region.atsScore}% • {region.recommendedLength}
                                            </p>
                                        </div>
                                        {regionId === region.id && !isAutoDetected && (
                                            <Check className="w-4 h-4 text-blue-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RegionSelector;

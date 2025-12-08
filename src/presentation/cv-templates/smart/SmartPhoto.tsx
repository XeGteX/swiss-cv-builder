/**
 * SmartPhoto - Region-aware photo component
 * 
 * Automatically shows/hides photo based on region norms:
 * - USA/UK: Never show (EEOC compliance)
 * - DACH/Japan/Middle East: Always show (expected)
 * - France/EU: Show if provided
 */

import React from 'react';
import { useShouldShowPhoto, usePhotoPosition } from '../../hooks/useRegion';

interface SmartPhotoProps {
    src?: string | null;
    alt: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
};

export const SmartPhoto: React.FC<SmartPhotoProps> = ({
    src,
    alt,
    className = '',
    size = 'md'
}) => {
    const shouldShow = useShouldShowPhoto();
    const position = usePhotoPosition();

    // Region says no photo? Return nothing
    if (!shouldShow || !src) {
        return null;
    }

    // If position is 'none', also return nothing
    if (position === 'none') {
        return null;
    }

    const sizeClass = SIZE_CLASSES[size];

    return (
        <div
            className={`
        smart-photo 
        ${sizeClass} 
        rounded-lg overflow-hidden
        border-2 border-gray-200
        shadow-sm
        flex-shrink-0
        ${className}
      `}
            data-position={position}
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
};

export default SmartPhoto;

/**
 * SmartSignature - DACH-specific signature block
 * 
 * Required in German-speaking countries:
 * "Ort, Datum" + Signature line
 */

import React from 'react';
import { useShouldShowSignature, useDateFormatter, useRegion } from '../../hooks/useRegion';

interface SmartSignatureProps {
    name: string;
    city?: string;
    date?: Date | string;
    className?: string;
}

export const SmartSignature: React.FC<SmartSignatureProps> = ({
    name,
    city,
    date,
    className = ''
}) => {
    const shouldShow = useShouldShowSignature();
    const formatDate = useDateFormatter();
    const profile = useRegion();

    // Only show for regions that require signature (DACH)
    if (!shouldShow) {
        return null;
    }

    const formattedDate = date ? formatDate(date) : formatDate(new Date());
    const locationDate = city ? `${city}, ${formattedDate}` : formattedDate;

    // Get localized labels
    const labels: Record<string, { location: string; signature: string }> = {
        'de': { location: 'Ort, Datum', signature: 'Unterschrift' },
        'fr': { location: 'Lieu, Date', signature: 'Signature' },
        'en': { location: 'Place, Date', signature: 'Signature' }
    };

    const lang = profile.languages[0]?.split('-')[0] || 'en';
    const label = labels[lang] || labels['en'];

    return (
        <div className={`smart-signature mt-12 pt-8 border-t border-gray-200 ${className}`}>
            <div className="flex justify-between items-end">
                {/* Location & Date */}
                <div className="text-sm">
                    <p className="text-gray-500 text-xs mb-1">{label.location}</p>
                    <p className="text-gray-700">{locationDate}</p>
                </div>

                {/* Signature line */}
                <div className="text-right">
                    <div className="w-48 border-b border-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">{label.signature}</p>
                    <p className="text-sm text-gray-700 mt-1">{name}</p>
                </div>
            </div>
        </div>
    );
};

export default SmartSignature;

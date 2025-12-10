/**
 * Template Carousel 3D - Minimal Stub (After Tabula Rasa)
 * 
 * TODO: Rebuild with React-PDF based previews
 */

import React from 'react';

interface TemplateCarousel3DProps {
    onSelectTemplate?: (templateId: string) => void;
    onShowGrid?: () => void;
}

export const TemplateCarousel3D: React.FC<TemplateCarousel3DProps> = () => {
    return (
        <div className="flex items-center justify-center p-8 text-slate-400">
            <p>Template Carousel - En reconstruction</p>
        </div>
    );
};

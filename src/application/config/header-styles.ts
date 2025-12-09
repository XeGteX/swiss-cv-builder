/**
 * NEXAL Studio - Header Styles Registry
 * 
 * 12 Next-Gen Header Styles for CV customization.
 * Each style defines layout, visual treatment, and CSS properties.
 */

// ============================================================================
// TYPES
// ============================================================================

export type HeaderStyleId =
    | 'modern'
    | 'classic'
    | 'minimal'
    | 'creative-asymmetric'
    | 'tech-minimal'
    | 'executive-luxe'
    | 'startup-bold'
    | 'photo-accent'
    | 'sidebar-split'
    | 'two-column'
    | 'full-width'
    | 'compact';

export interface HeaderStyleConfig {
    id: HeaderStyleId;
    name: string;
    description: string;
    category: 'classic' | 'modern' | 'creative' | 'professional';
    preview: HeaderPreview;
    css: HeaderCSS;
}

export interface HeaderPreview {
    layout: 'centered' | 'left' | 'right' | 'split' | 'asymmetric';
    hasPhoto: boolean;
    photoPosition: 'left' | 'right' | 'center' | 'background' | 'none';
    dividerStyle: 'none' | 'line' | 'gradient' | 'wave' | 'dots';
}

export interface HeaderCSS {
    containerClass: string;
    nameClass: string;
    titleClass: string;
    contactClass: string;
    photoClass: string;
    accentPosition: 'top' | 'left' | 'bottom' | 'none' | 'background';
}

// ============================================================================
// HEADER STYLES REGISTRY (12 Styles)
// ============================================================================

export const HEADER_STYLES_REGISTRY: HeaderStyleConfig[] = [
    // ===== CLASSIC FAMILY =====
    {
        id: 'classic',
        name: 'Classic',
        description: 'Traditionnel & professionnel',
        category: 'classic',
        preview: {
            layout: 'centered',
            hasPhoto: true,
            photoPosition: 'left',
            dividerStyle: 'line'
        },
        css: {
            containerClass: 'flex items-center gap-6 pb-4 border-b-2',
            nameClass: 'text-2xl font-bold',
            titleClass: 'text-lg text-gray-600',
            contactClass: 'flex gap-4 text-sm text-gray-500 mt-2',
            photoClass: 'w-24 h-24 rounded-lg object-cover',
            accentPosition: 'bottom'
        }
    },
    {
        id: 'executive-luxe',
        name: 'Executive Luxe',
        description: 'C-Level & Direction',
        category: 'classic',
        preview: {
            layout: 'centered',
            hasPhoto: true,
            photoPosition: 'center',
            dividerStyle: 'gradient'
        },
        css: {
            containerClass: 'text-center py-6 border-b-4',
            nameClass: 'text-3xl font-light tracking-widest uppercase',
            titleClass: 'text-xl text-gray-600 font-light mt-2',
            contactClass: 'flex justify-center gap-6 text-sm text-gray-500 mt-4',
            photoClass: 'w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4',
            accentPosition: 'bottom'
        }
    },

    // ===== MODERN FAMILY =====
    {
        id: 'modern',
        name: 'Modern',
        description: 'Clean & contemporain',
        category: 'modern',
        preview: {
            layout: 'left',
            hasPhoto: true,
            photoPosition: 'right',
            dividerStyle: 'none'
        },
        css: {
            containerClass: 'flex justify-between items-center py-4',
            nameClass: 'text-2xl font-bold',
            titleClass: 'text-lg',
            contactClass: 'flex flex-col gap-1 text-sm text-gray-500',
            photoClass: 'w-20 h-20 rounded-xl object-cover',
            accentPosition: 'left'
        }
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Épuré & essentiel',
        category: 'modern',
        preview: {
            layout: 'left',
            hasPhoto: false,
            photoPosition: 'none',
            dividerStyle: 'none'
        },
        css: {
            containerClass: 'py-4',
            nameClass: 'text-2xl font-medium',
            titleClass: 'text-lg text-gray-600',
            contactClass: 'flex gap-4 text-sm text-gray-500 mt-2',
            photoClass: 'hidden',
            accentPosition: 'none'
        }
    },
    {
        id: 'tech-minimal',
        name: 'Tech Minimal',
        description: 'Style développeur',
        category: 'modern',
        preview: {
            layout: 'left',
            hasPhoto: false,
            photoPosition: 'none',
            dividerStyle: 'dots'
        },
        css: {
            containerClass: 'py-4 font-mono',
            nameClass: 'text-xl font-bold',
            titleClass: 'text-base text-gray-600',
            contactClass: 'flex gap-4 text-xs text-gray-500 mt-2 font-mono',
            photoClass: 'hidden',
            accentPosition: 'left'
        }
    },
    {
        id: 'compact',
        name: 'Compact',
        description: 'Économie d\'espace',
        category: 'modern',
        preview: {
            layout: 'left',
            hasPhoto: true,
            photoPosition: 'left',
            dividerStyle: 'line'
        },
        css: {
            containerClass: 'flex items-center gap-4 py-2 border-b',
            nameClass: 'text-lg font-bold',
            titleClass: 'text-sm text-gray-600',
            contactClass: 'flex gap-3 text-xs text-gray-500',
            photoClass: 'w-12 h-12 rounded-lg object-cover',
            accentPosition: 'bottom'
        }
    },

    // ===== CREATIVE FAMILY =====
    {
        id: 'creative-asymmetric',
        name: 'Creative Asymétrique',
        description: 'Design audacieux',
        category: 'creative',
        preview: {
            layout: 'asymmetric',
            hasPhoto: true,
            photoPosition: 'right',
            dividerStyle: 'wave'
        },
        css: {
            containerClass: 'relative py-6 overflow-hidden',
            nameClass: 'text-3xl font-black',
            titleClass: 'text-xl font-light',
            contactClass: 'flex gap-4 text-sm mt-3',
            photoClass: 'absolute right-0 top-0 w-32 h-32 rounded-full object-cover -mr-8',
            accentPosition: 'background'
        }
    },
    {
        id: 'startup-bold',
        name: 'Start-up Bold',
        description: 'Dynamique & moderne',
        category: 'creative',
        preview: {
            layout: 'left',
            hasPhoto: true,
            photoPosition: 'left',
            dividerStyle: 'gradient'
        },
        css: {
            containerClass: 'flex items-center gap-6 py-6 rounded-xl px-6',
            nameClass: 'text-2xl font-black uppercase tracking-tight',
            titleClass: 'text-lg font-bold',
            contactClass: 'flex gap-4 text-sm mt-2',
            photoClass: 'w-24 h-24 rounded-2xl object-cover',
            accentPosition: 'background'
        }
    },
    {
        id: 'photo-accent',
        name: 'Photo Accent',
        description: 'Photo mise en valeur',
        category: 'creative',
        preview: {
            layout: 'split',
            hasPhoto: true,
            photoPosition: 'background',
            dividerStyle: 'none'
        },
        css: {
            containerClass: 'relative py-8 text-center',
            nameClass: 'text-3xl font-bold text-white drop-shadow-lg',
            titleClass: 'text-xl text-white/90',
            contactClass: 'flex justify-center gap-4 text-sm text-white/80 mt-4',
            photoClass: 'absolute inset-0 w-full h-full object-cover opacity-30',
            accentPosition: 'background'
        }
    },

    // ===== PROFESSIONAL FAMILY =====
    {
        id: 'sidebar-split',
        name: 'Sidebar Split',
        description: 'Layout moderne',
        category: 'professional',
        preview: {
            layout: 'split',
            hasPhoto: true,
            photoPosition: 'left',
            dividerStyle: 'line'
        },
        css: {
            containerClass: 'flex',
            nameClass: 'text-xl font-bold',
            titleClass: 'text-base',
            contactClass: 'flex flex-col gap-1 text-sm text-gray-500',
            photoClass: 'w-full aspect-square object-cover',
            accentPosition: 'left'
        }
    },
    {
        id: 'two-column',
        name: 'Two Column',
        description: 'Info sur deux colonnes',
        category: 'professional',
        preview: {
            layout: 'split',
            hasPhoto: true,
            photoPosition: 'left',
            dividerStyle: 'line'
        },
        css: {
            containerClass: 'grid grid-cols-2 gap-6 py-4 border-b-2',
            nameClass: 'text-2xl font-bold',
            titleClass: 'text-lg',
            contactClass: 'flex flex-col gap-1 text-sm text-gray-500',
            photoClass: 'w-20 h-20 rounded-lg object-cover',
            accentPosition: 'bottom'
        }
    },
    {
        id: 'full-width',
        name: 'Full Width Banner',
        description: 'Bannière immersive',
        category: 'professional',
        preview: {
            layout: 'centered',
            hasPhoto: true,
            photoPosition: 'center',
            dividerStyle: 'gradient'
        },
        css: {
            containerClass: 'text-center py-8 -mx-4 px-4',
            nameClass: 'text-3xl font-bold',
            titleClass: 'text-xl mt-1',
            contactClass: 'flex justify-center gap-6 text-sm mt-4',
            photoClass: 'w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-xl',
            accentPosition: 'background'
        }
    }
];

// ============================================================================
// HELPERS
// ============================================================================

export function getHeaderStyleById(id: HeaderStyleId): HeaderStyleConfig | undefined {
    return HEADER_STYLES_REGISTRY.find(style => style.id === id);
}

export function getHeaderStylesByCategory(category: HeaderStyleConfig['category']): HeaderStyleConfig[] {
    return HEADER_STYLES_REGISTRY.filter(style => style.category === category);
}

/** Get legacy HeaderStyle format for backward compatibility */
export function getLegacyHeaderStyle(id: HeaderStyleId): 'modern' | 'classic' | 'minimal' {
    const style = getHeaderStyleById(id);
    if (!style) return 'modern';

    // Map to legacy 3-style system
    if (['classic', 'executive-luxe', 'two-column'].includes(id)) return 'classic';
    if (['minimal', 'tech-minimal', 'compact'].includes(id)) return 'minimal';
    return 'modern';
}

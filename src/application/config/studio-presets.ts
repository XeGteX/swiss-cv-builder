/**
 * NEXAL Studio - Magic Presets Library
 * 
 * 20+ One-Click Magic Presets for instant CV transformation.
 * Each preset applies color, typography, and header style simultaneously.
 */

import type { HeaderStyle, FontPairing } from '../store/v2/cv-store-v2.types';

// ============================================================================
// TYPES
// ============================================================================

export interface MagicPreset {
    id: string;
    name: string;
    emoji: string;
    category: PresetCategory;
    description: string;
    config: {
        accentColor: string;
        secondaryColor?: string;
        fontPairing: FontPairing;
        headerStyle: HeaderStyle;
        fontWeight?: 'light' | 'normal' | 'bold';
        titleCase?: 'normal' | 'uppercase' | 'capitalize';
    };
}

export type PresetCategory = 'luxe' | 'tech' | 'creative' | 'corporate' | 'minimal' | 'bold';

// ============================================================================
// PRESET CATEGORIES
// ============================================================================

export const PRESET_CATEGORIES: { id: PresetCategory; name: string; emoji: string }[] = [
    { id: 'luxe', name: 'Luxe', emoji: '✨' },
    { id: 'tech', name: 'Tech', emoji: '⚡' },
    { id: 'creative', name: 'Créatif', emoji: '🎨' },
    { id: 'corporate', name: 'Corporate', emoji: '👔' },
    { id: 'minimal', name: 'Minimal', emoji: '🔲' },
    { id: 'bold', name: 'Bold', emoji: '🔥' },
];

// ============================================================================
// MAGIC PRESETS LIBRARY (20+)
// ============================================================================

export const MAGIC_PRESETS: MagicPreset[] = [
    // ===== LUXE =====
    {
        id: 'noir-or',
        name: 'Noir & Or',
        emoji: '🖤',
        category: 'luxe',
        description: 'Élégance suprême',
        config: {
            accentColor: '#D4AF37',
            fontPairing: 'serif',
            headerStyle: 'classic',
            fontWeight: 'light',
            titleCase: 'uppercase'
        }
    },
    {
        id: 'champagne',
        name: 'Champagne',
        emoji: '🥂',
        category: 'luxe',
        description: 'Raffinement français',
        config: {
            accentColor: '#C9A961',
            fontPairing: 'serif',
            headerStyle: 'classic',
            fontWeight: 'normal'
        }
    },
    {
        id: 'emeraude',
        name: 'Émeraude',
        emoji: '💎',
        category: 'luxe',
        description: 'Prestige discret',
        config: {
            accentColor: '#046307',
            fontPairing: 'serif',
            headerStyle: 'modern',
            fontWeight: 'normal'
        }
    },

    // ===== TECH =====
    {
        id: 'ide-dark',
        name: 'IDE Dark',
        emoji: '🌙',
        category: 'tech',
        description: 'Mode développeur',
        config: {
            accentColor: '#61DAFB',
            fontPairing: 'mono',
            headerStyle: 'minimal',
            fontWeight: 'normal'
        }
    },
    {
        id: 'terminal',
        name: 'Terminal',
        emoji: '💻',
        category: 'tech',
        description: 'Hacker style',
        config: {
            accentColor: '#00FF41',
            fontPairing: 'mono',
            headerStyle: 'minimal'
        }
    },
    {
        id: 'silicon',
        name: 'Silicon Valley',
        emoji: '🚀',
        category: 'tech',
        description: 'Start-up vibe',
        config: {
            accentColor: '#000000',
            fontPairing: 'sans',
            headerStyle: 'modern'
        }
    },
    {
        id: 'github',
        name: 'GitHub',
        emoji: '🐙',
        category: 'tech',
        description: 'Open source',
        config: {
            accentColor: '#6e5494',
            fontPairing: 'mono',
            headerStyle: 'minimal'
        }
    },

    // ===== CREATIVE =====
    {
        id: 'pop-art',
        name: 'Pop Art',
        emoji: '🎨',
        category: 'creative',
        description: 'Couleurs vives',
        config: {
            accentColor: '#FF3366',
            fontPairing: 'sans',
            headerStyle: 'modern',
            fontWeight: 'bold'
        }
    },
    {
        id: 'gradient-wave',
        name: 'Gradient Wave',
        emoji: '🌊',
        category: 'creative',
        description: 'Dégradé moderne',
        config: {
            accentColor: '#667eea',
            fontPairing: 'sans',
            headerStyle: 'modern'
        }
    },
    {
        id: 'neon',
        name: 'Neon Nights',
        emoji: '💜',
        category: 'creative',
        description: 'Cyber punk',
        config: {
            accentColor: '#FF00FF',
            fontPairing: 'sans',
            headerStyle: 'modern',
            fontWeight: 'bold'
        }
    },
    {
        id: 'pastel',
        name: 'Pastel Dream',
        emoji: '🌸',
        category: 'creative',
        description: 'Doux et moderne',
        config: {
            accentColor: '#FFB6C1',
            fontPairing: 'sans',
            headerStyle: 'minimal'
        }
    },

    // ===== CORPORATE =====
    {
        id: 'bank-blue',
        name: 'Bank Blue',
        emoji: '🏦',
        category: 'corporate',
        description: 'Finance & Banking',
        config: {
            accentColor: '#003366',
            fontPairing: 'serif',
            headerStyle: 'classic'
        }
    },
    {
        id: 'consulting',
        name: 'Consulting',
        emoji: '📊',
        category: 'corporate',
        description: 'McKinsey style',
        config: {
            accentColor: '#1e3a5f',
            fontPairing: 'sans',
            headerStyle: 'classic',
            titleCase: 'uppercase'
        }
    },
    {
        id: 'executive',
        name: 'Executive',
        emoji: '👔',
        category: 'corporate',
        description: 'C-Level pro',
        config: {
            accentColor: '#2c3e50',
            fontPairing: 'serif',
            headerStyle: 'classic',
            fontWeight: 'light'
        }
    },
    {
        id: 'lawyer',
        name: 'Avocat',
        emoji: '⚖️',
        category: 'corporate',
        description: 'Juridique',
        config: {
            accentColor: '#1a1a2e',
            fontPairing: 'serif',
            headerStyle: 'classic'
        }
    },

    // ===== MINIMAL =====
    {
        id: 'swiss-clean',
        name: 'Swiss Clean',
        emoji: '🇨🇭',
        category: 'minimal',
        description: 'Design suisse',
        config: {
            accentColor: '#E30613',
            fontPairing: 'sans',
            headerStyle: 'minimal'
        }
    },
    {
        id: 'japanese',
        name: 'Japanese',
        emoji: '🎌',
        category: 'minimal',
        description: 'Zen minimal',
        config: {
            accentColor: '#BC002D',
            fontPairing: 'sans',
            headerStyle: 'minimal',
            fontWeight: 'light'
        }
    },
    {
        id: 'nordic',
        name: 'Nordic',
        emoji: '❄️',
        category: 'minimal',
        description: 'Scandinave',
        config: {
            accentColor: '#5B7A85',
            fontPairing: 'sans',
            headerStyle: 'minimal'
        }
    },
    {
        id: 'bauhaus',
        name: 'Bauhaus',
        emoji: '🔺',
        category: 'minimal',
        description: 'German design',
        config: {
            accentColor: '#000000',
            fontPairing: 'sans',
            headerStyle: 'minimal',
            fontWeight: 'bold'
        }
    },

    // ===== BOLD =====
    {
        id: 'startup',
        name: 'Start-up',
        emoji: '🦄',
        category: 'bold',
        description: 'Unicorn energy',
        config: {
            accentColor: '#8B5CF6',
            fontPairing: 'sans',
            headerStyle: 'modern',
            fontWeight: 'bold'
        }
    },
    {
        id: 'impact',
        name: 'Impact',
        emoji: '💥',
        category: 'bold',
        description: 'Maximum impact',
        config: {
            accentColor: '#FF4500',
            fontPairing: 'sans',
            headerStyle: 'modern',
            fontWeight: 'bold',
            titleCase: 'uppercase'
        }
    },
    {
        id: 'vibrant',
        name: 'Vibrant',
        emoji: '🌈',
        category: 'bold',
        description: 'Énergie pure',
        config: {
            accentColor: '#F59E0B',
            fontPairing: 'sans',
            headerStyle: 'modern',
            fontWeight: 'bold'
        }
    },
    {
        id: 'electric',
        name: 'Electric',
        emoji: '⚡',
        category: 'bold',
        description: 'High voltage',
        config: {
            accentColor: '#3B82F6',
            fontPairing: 'sans',
            headerStyle: 'modern',
            fontWeight: 'bold'
        }
    },
];

// ============================================================================
// HELPERS
// ============================================================================

export function getPresetsByCategory(category: PresetCategory): MagicPreset[] {
    return MAGIC_PRESETS.filter(p => p.category === category);
}

export function getPresetById(id: string): MagicPreset | undefined {
    return MAGIC_PRESETS.find(p => p.id === id);
}

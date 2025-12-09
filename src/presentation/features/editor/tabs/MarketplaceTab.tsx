/**
 * Template Marketplace - Browse and install CV templates
 * 
 * Features:
 * - Template gallery with previews
 * - Categories (Professional, Creative, Tech, etc.)
 * - Rating and downloads
 * - One-click install
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    Download,
    Star,
    Eye,
    Search,
    Filter,
    Check,
    Crown,
    Zap,
    Briefcase,
    Palette,
    Code2
} from 'lucide-react';
import { useUpdateField } from '../../../../application/store/v2';

// ============================================================================
// TYPES
// ============================================================================

interface Template {
    id: string;
    name: string;
    description: string;
    preview: string;
    category: 'professional' | 'creative' | 'tech' | 'minimal' | 'executive';
    isPremium: boolean;
    rating: number;
    downloads: number;
    author: string;
    colors: string[];
    isInstalled?: boolean;
}

// ============================================================================
// MOCK TEMPLATES
// ============================================================================

const TEMPLATES: Template[] = [
    {
        id: 'chameleon',
        name: 'Chameleon (Universal)',
        description: 'Le seul template dont vous avez besoin.',
        preview: '🦎',
        category: 'professional',
        isPremium: false,
        rating: 5.0,
        downloads: 1,
        author: 'NEXAL Studio',
        colors: ['#3b82f6', '#10b981', '#f59e0b'],
        isInstalled: true
    },
    {
        id: 'executive-pro',
        name: 'Executive Pro',
        description: 'Design élégant pour cadres supérieurs',
        preview: '🏛️',
        category: 'executive',
        isPremium: true,
        rating: 4.9,
        downloads: 12500,
        author: 'NEXAL Studio',
        colors: ['#1a365d', '#2c5282', '#63b3ed']
    },
    {
        id: 'tech-stack',
        name: 'Tech Stack',
        description: 'Parfait pour les développeurs',
        preview: '💻',
        category: 'tech',
        isPremium: false,
        rating: 4.8,
        downloads: 8300,
        author: 'DevTemplates',
        colors: ['#0f172a', '#22d3ee', '#a78bfa']
    },
    {
        id: 'creative-flow',
        name: 'Creative Flow',
        description: 'Pour les designers et créatifs',
        preview: '🎨',
        category: 'creative',
        isPremium: false,
        rating: 4.7,
        downloads: 6800,
        author: 'DesignCrew',
        colors: ['#ec4899', '#f97316', '#fbbf24']
    },
    {
        id: 'minimal-clean',
        name: 'Minimal Clean',
        description: 'Simplicité et élégance',
        preview: '⚪',
        category: 'minimal',
        isPremium: false,
        rating: 4.6,
        downloads: 9200,
        author: 'Minimalists',
        colors: ['#f8fafc', '#64748b', '#0f172a']
    },
    {
        id: 'professional-plus',
        name: 'Professional Plus',
        description: 'CV classique optimisé ATS',
        preview: '📋',
        category: 'professional',
        isPremium: false,
        rating: 4.8,
        downloads: 15000,
        author: 'NEXAL Studio',
        colors: ['#1e3a5f', '#3b82f6', '#60a5fa'],
        isInstalled: true
    },
    {
        id: 'startup-vibe',
        name: 'Startup Vibe',
        description: 'Moderne et dynamique',
        preview: '🚀',
        category: 'tech',
        isPremium: true,
        rating: 4.9,
        downloads: 4500,
        author: 'StartupKit',
        colors: ['#7c3aed', '#06b6d4', '#10b981']
    }
];

const CATEGORIES = [
    { id: 'all', label: 'Tous', icon: Store },
    { id: 'professional', label: 'Pro', icon: Briefcase },
    { id: 'creative', label: 'Créatif', icon: Palette },
    { id: 'tech', label: 'Tech', icon: Code2 },
    { id: 'minimal', label: 'Minimal', icon: Zap }
];

// ============================================================================
// TEMPLATE CARD COMPONENT
// ============================================================================

interface TemplateCardProps {
    template: Template;
    onInstall: (id: string) => void;
    onPreview: (id: string) => void;
}

function TemplateCard({ template, onInstall, onPreview }: TemplateCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
        >
            {/* Premium Badge */}
            {template.isPremium && (
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    PRO
                </div>
            )}

            {/* Installed Badge */}
            {template.isInstalled && (
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Installé
                </div>
            )}

            {/* Preview Area */}
            <div className="h-32 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0 text-4xl">
                {template.preview}
            </div>

            {/* Color Palette */}
            <div className="flex gap-1 px-3 -mt-3 relative z-10">
                {template.colors.map((color, i) => (
                    <div
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="text-sm font-bold text-white">{template.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{template.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400" />
                        {template.rating}
                    </span>
                    <span className="flex items-center gap-0.5">
                        <Download className="w-3 h-3" />
                        {(template.downloads / 1000).toFixed(1)}k
                    </span>
                    <span className="text-slate-600">par {template.author}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPreview(template.id)}
                        className="flex-1 py-1.5 text-xs rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center gap-1"
                    >
                        <Eye className="w-3 h-3" />
                        Aperçu
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onInstall(template.id)}
                        disabled={template.isInstalled}
                        className={`flex-1 py-1.5 text-xs rounded-lg flex items-center justify-center gap-1 ${template.isInstalled
                            ? 'bg-green-500/20 text-green-300'
                            : template.isPremium
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            }`}
                    >
                        {template.isInstalled ? (
                            <>
                                <Check className="w-3 h-3" />
                                Installé
                            </>
                        ) : (
                            <>
                                <Download className="w-3 h-3" />
                                {template.isPremium ? 'Débloquer' : 'Installer'}
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================================
// MARKETPLACE TAB
// ============================================================================

export function MarketplaceTab() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [templates, setTemplates] = useState(TEMPLATES);
    const updateField = useUpdateField();

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'all' || t.category === category;
        return matchesSearch && matchesCategory;
    });

    const handleInstall = (id: string) => {
        setTemplates(prev => prev.map(t =>
            t.id === id ? { ...t, isInstalled: true, downloads: t.downloads + 1 } : t
        ));
        // Auto-select on install
        updateField('metadata.templateId', id);
        console.log(`[Marketplace] Installed and selected template: ${id}`);
    };

    const handlePreview = (id: string) => {
        console.log('Preview template:', id);
        updateField('metadata.templateId', id);
        console.log(`[Marketplace] Selected template for preview: ${id}`);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Store className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-200">Marketplace</h2>
                    <p className="text-xs text-slate-400">{templates.length} templates disponibles</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un template..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            {/* Categories */}
            <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isActive = category === cat.id;
                    return (
                        <motion.button
                            key={cat.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCategory(cat.id)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${isActive
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                        >
                            <Icon className="w-3 h-3" />
                            {cat.label}
                        </motion.button>
                    );
                })}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence mode="popLayout">
                    {filteredTemplates.map(template => (
                        <motion.div
                            key={template.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <TemplateCard
                                template={template}
                                onInstall={handleInstall}
                                onPreview={handlePreview}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun template trouvé</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MarketplaceTab;

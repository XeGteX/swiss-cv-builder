/**
 * SMART SIDEBAR - Ultra-Modern Collapsible Navigation
 * 
 * Premium sidebar with glass morphism, smooth animations, and mode-aware routing.
 * 
 * Features:
 * - Mobile: Hidden by default, hamburger menu toggle, overlay drawer
 * - Desktop Collapsed: 80px width (icons only)
 * - Desktop Expanded: 280px width (icons + labels)
 * - Spring-based animations (framer-motion)
 * - Glass morphism backdrop
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Edit3,
    Box,
    Palette,
    Sparkles,
    Settings,
    Wand2,
    Menu,
    X
} from 'lucide-react';
import { useMode, useSetMode } from '../../../application/store/v2';
import type { CVMode } from '../../../application/store/v2';
import { GlassStyles } from '../../design-system/tokens';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    path?: string;
    mode?: CVMode;
    action?: string;
    gradient: string;
    description: string;
    section: 'pages' | 'tools' | 'quickaccess';
}

const NAV_ITEMS: NavItem[] = [
    // ═══════ QUICK ACCESS (Most Important) ═══════
    {
        id: 'wizard',
        label: 'Wizard',
        icon: Wand2,
        path: '/wizard',
        gradient: 'from-indigo-500 to-blue-500',
        description: 'Assistant guidé - Le plus facile',
        section: 'quickaccess'
    },

    // ═══════ PAGES ═══════
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/',
        gradient: 'from-blue-500 to-cyan-500',
        description: 'Vue d\'ensemble',
        section: 'pages'
    },
    {
        id: 'templates',
        label: 'Templates',
        icon: Palette,
        path: '/templates',
        gradient: 'from-purple-500 to-pink-500',
        description: 'Galerie de modèles',
        section: 'pages'
    },
    {
        id: 'settings',
        label: 'Paramètres',
        icon: Settings,
        action: 'openSettings',
        gradient: 'from-slate-500 to-gray-500',
        description: 'Configuration',
        section: 'pages'
    },

    {
        id: 'editor',
        label: 'Éditeur',
        icon: Edit3,
        mode: 'edition',
        gradient: 'from-green-500 to-emerald-500',
        description: 'Mode édition',
        section: 'tools'
    },
    {
        id: 'structure',
        label: 'Structure',
        icon: Box,
        mode: 'structure',
        gradient: 'from-violet-500 to-purple-500',
        description: 'Réorganiser les sections',
        section: 'tools'
    },
    {
        id: 'ai',
        label: 'IA',
        icon: Sparkles,
        mode: 'ai',
        gradient: 'from-amber-500 to-orange-500',
        description: 'Optimisation intelligente',
        section: 'tools'
    }
];

export const SmartSidebar: React.FC = () => {
    const isMobile = useIsMobile();
    const [isExpanded, setExpanded] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const currentMode = useMode();
    const setMode = useSetMode();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const handleItemClick = (item: NavItem) => {
        if (item.action === 'openSettings') {
            window.dispatchEvent(new CustomEvent('OPEN_SETTINGS_MODAL'));
        } else if (item.path) {
            navigate(item.path);
        } else if (item.mode) {
            setMode(item.mode);
        }
        // Close mobile menu after clicking
        if (isMobile) setMobileMenuOpen(false);
    };

    const isActive = (item: NavItem): boolean => {
        if (item.path) {
            return location.pathname === item.path;
        }
        if (item.mode) {
            return currentMode === item.mode;
        }
        return false;
    };

    const isOnTemplatesPage = location.pathname === '/templates';

    // ═══════════════════════════════════════════════════════════════════
    // MOBILE: Hamburger Menu + Overlay Drawer
    // ═══════════════════════════════════════════════════════════════════
    if (isMobile) {
        return (
            <>
                {/* Hamburger Button - Fixed top-left */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="fixed top-4 left-4 z-50 p-3 bg-slate-900/80 backdrop-blur-lg rounded-xl border border-white/10 text-white shadow-xl"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>

                {/* Overlay backdrop */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col pt-6 pb-6 ${GlassStyles.panel}`}
                        >
                            {/* Header with Close Button */}
                            <div className="px-6 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                        CV
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                            Nexal
                                        </span>
                                        <span className="text-xs text-slate-400">AI-Powered</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Navigation Items */}
                            <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
                                {NAV_ITEMS.map((item, index) => {
                                    const Icon = item.icon;
                                    const active = isActive(item);
                                    const prevItem = index > 0 ? NAV_ITEMS[index - 1] : null;
                                    const showSeparator = prevItem && prevItem.section !== item.section;

                                    if (isOnTemplatesPage && item.section === 'tools') return null;

                                    return (
                                        <React.Fragment key={item.id}>
                                            {showSeparator && (
                                                <div className="py-3">
                                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
                                                    <div className="mt-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase px-4">
                                                        {item.section === 'tools' ? 'Outils CV' : ''}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => handleItemClick(item)}
                                                className={`
                                                    w-full flex items-center gap-4 px-4 py-3.5 rounded-xl
                                                    transition-all duration-200
                                                    ${active
                                                        ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                                                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                                    }
                                                `}
                                            >
                                                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                                                <div className="flex-1 text-left">
                                                    <div className="font-semibold text-sm">{item.label}</div>
                                                    <div className={`text-xs ${active ? 'text-white/80' : 'text-slate-400'}`}>
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </button>
                                        </React.Fragment>
                                    );
                                })}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // DESKTOP: Normal Sidebar with Hover Expand
    // ═══════════════════════════════════════════════════════════════════
    return (
        <motion.div
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            initial={{ width: 80 }}
            animate={{ width: isExpanded ? 280 : 80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`h-screen flex flex-col pt-10 pb-6 sticky top-0 left-0 z-50 ${GlassStyles.panel}`}
        >
            {/* Logo */}
            <div className="px-6 mb-8">
                <AnimatePresence mode="wait">
                    {isExpanded ? (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                CV
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Nexal
                                </span>
                                <span className="text-xs text-slate-400">AI-Powered</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto"
                        >
                            CV
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Items */}
            <nav className="relative mt-4 px-3 space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent">
                {NAV_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    const prevItem = index > 0 ? NAV_ITEMS[index - 1] : null;
                    const showSeparator = prevItem && prevItem.section !== item.section;

                    return (
                        <React.Fragment key={item.id}>
                            {showSeparator && (
                                <div className="py-3">
                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                                    <motion.div
                                        className="mt-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: isExpanded ? 1 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {item.section === 'tools' ? 'Outils CV' : ''}
                                    </motion.div>
                                </div>
                            )}

                            {isOnTemplatesPage && item.section === 'tools' ? null : (
                                <motion.button
                                    onClick={() => handleItemClick(item)}
                                    onMouseEnter={() => setHoveredItem(item.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`
                                    relative w-full flex items-center gap-4 px-4 py-3 rounded-xl
                                    transition-all duration-200 group
                                    ${active
                                            ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                                            : 'text-slate-400 hover:bg-white/10 hover:text-white'
                                        }
                                `}
                                    whileHover={{ scale: 1.02, x: 2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <motion.div
                                        className="flex-shrink-0"
                                        animate={{
                                            rotate: hoveredItem === item.id ? [0, -10, 10, 0] : 0
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                                    </motion.div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                className="flex-1 text-left"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2, delay: 0.05 }}
                                            >
                                                <div className={`font-semibold text-sm ${active ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                                    {item.label}
                                                </div>
                                                <div className={`text-xs ${active ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                                    {item.description}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {active && (
                                        <motion.div
                                            className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"
                                            layoutId="activeIndicator"
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}

                                    {!isExpanded && hoveredItem === item.id && (
                                        <motion.div
                                            className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                        >
                                            {item.label}
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>
        </motion.div>
    );
};


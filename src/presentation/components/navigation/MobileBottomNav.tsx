/**
 * MOBILE BOTTOM NAV - Premium App-Style Navigation
 * 
 * Replaces sidebar on mobile with a fixed bottom navigation bar.
 * Features glassmorphism design, 3 priority actions + menu drawer.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Pencil,
    Palette,
    Sparkles,
    Menu,
    Settings,
    User,
    FileText,
    Star,
    Download,
    ChevronUp
} from 'lucide-react';
import { useMode, useSetMode } from '../../../application/store/v2';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    action: () => void;
    isActive?: boolean;
}

export const MobileBottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = useMode();
    const setMode = useSetMode();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isEditor = location.pathname.includes('/editor') || location.pathname === '/';

    const mainActions: NavItem[] = [
        {
            id: 'editor',
            label: 'Éditeur',
            icon: Pencil,
            action: () => { setMode('edition'); navigate('/'); },
            isActive: mode === 'edition' && isEditor
        },
        {
            id: 'templates',
            label: 'Modèles',
            icon: Palette, // Changed from Layout to differentiate from Structure
            action: () => navigate('/templates'),
            isActive: location.pathname.includes('/templates')
        },
        {
            id: 'ai',
            label: 'IA',
            icon: Sparkles,
            action: () => {
                // Dispatch AI modal open event
                window.dispatchEvent(new CustomEvent('open-ai-modal'));
            },
            isActive: mode === 'ai'
        }
    ];

    const drawerItems = [
        { id: 'download', label: 'Télécharger PDF', icon: Download, action: () => window.dispatchEvent(new CustomEvent('download-pdf')) },
        { id: 'settings', label: 'Paramètres', icon: Settings, action: () => window.dispatchEvent(new CustomEvent('OPEN_SETTINGS_MODAL')) },
        { id: 'account', label: 'Mon Compte', icon: User, action: () => { navigate('/'); /* TODO: Add account page */ } },
        { id: 'review', label: 'Revue du CV', icon: Star, action: () => { setMode('structure'); navigate('/'); } },
        { id: 'letter', label: 'Lettre de motivation', icon: FileText, action: () => { navigate('/'); /* TODO: Add cover letter page */ } },
    ];

    return (
        <>
            {/* Bottom Navigation Bar */}
            <motion.nav
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="md:hidden fixed bottom-0 left-0 right-0 z-50"
            >
                {/* Glassmorphism background */}
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10" />

                {/* Safe area padding for notched devices */}
                <div className="relative flex items-center justify-around h-20 px-2 pb-safe">
                    {/* Main 3 Actions */}
                    {mainActions.map((item) => (
                        <motion.button
                            key={item.id}
                            onClick={item.action}
                            whileTap={{ scale: 0.9 }}
                            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${item.isActive
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <item.icon size={24} className={item.isActive ? 'text-purple-400' : ''} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {item.isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute bottom-2 w-1 h-1 bg-purple-500 rounded-full"
                                />
                            )}
                        </motion.button>
                    ))}

                    {/* Menu Button */}
                    <motion.button
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        whileTap={{ scale: 0.9 }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${drawerOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <motion.div
                            animate={{ rotate: drawerOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {drawerOpen ? <ChevronUp size={24} /> : <Menu size={24} />}
                        </motion.div>
                        <span className="text-[10px] font-medium">Menu</span>
                    </motion.button>
                </div>
            </motion.nav>

            {/* Drawer Overlay */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="md:hidden fixed bottom-20 left-4 right-4 z-50"
                        >
                            <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 shadow-2xl">
                                {/* Drawer Handle */}
                                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

                                {/* Drawer Items */}
                                <div className="space-y-1">
                                    {drawerItems.map((item) => (
                                        <motion.button
                                            key={item.id}
                                            onClick={() => {
                                                item.action();
                                                setDrawerOpen(false);
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                                <item.icon size={20} />
                                            </div>
                                            <span className="text-white font-medium">{item.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

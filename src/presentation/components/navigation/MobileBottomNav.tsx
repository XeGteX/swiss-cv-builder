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
        { id: 'account', label: 'Mon Compte', icon: User, action: () => window.dispatchEvent(new CustomEvent('OPEN_AUTH_MODAL')) },
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
                {/* Glassmorphism background - matches top bar */}
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10" />

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
                            className="md:hidden fixed inset-0 bg-[#0a0a0f]/95 backdrop-blur-md z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 400,
                                opacity: { duration: 0.15 }
                            }}
                            className="md:hidden fixed bottom-20 left-0 right-0 z-50 px-4"
                        >
                            <div className="bg-[#0f0a1f] rounded-3xl border border-purple-500/20 p-5 shadow-2xl mx-auto max-w-md">
                                {/* Drawer Handle */}
                                <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-5" />

                                {/* Drawer Items - Centered */}
                                <div className="space-y-2">
                                    {drawerItems.map((item, index) => (
                                        <motion.button
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => {
                                                item.action();
                                                setDrawerOpen(false);
                                            }}
                                            whileTap={{ scale: 0.97, x: 5 }}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left hover:bg-white/5 active:bg-purple-500/10 transition-colors group"
                                        >
                                            <motion.div
                                                className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center text-purple-400 group-hover:from-purple-500/30 group-hover:to-violet-500/30 transition-all"
                                                whileHover={{ rotate: 5, scale: 1.05 }}
                                            >
                                                <item.icon size={22} />
                                            </motion.div>
                                            <span className="text-white font-medium text-base">{item.label}</span>
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

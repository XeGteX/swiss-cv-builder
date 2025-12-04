/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *   USER DROPDOWN - ÉDITION NEXAL PREMIUM
 *   Menu utilisateur authentifié avec animations fluides
 * 
 *   "Les dieux ont leur propre menu."
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Crown, ChevronDown, Sparkles, HardDrive, Cloud } from 'lucide-react';
import { useAuthStore } from '../../../application/store/auth-store';
import { useSettingsStore } from '../../../application/store/settings-store';

interface UserDropdownProps {
    onOpenSettings: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ onOpenSettings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout, isAuthenticated } = useAuthStore();
    const { storageMode, setStorageMode } = useSettingsStore();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get initials from email
    const getInitials = (email: string) => {
        const parts = email.split('@')[0].split('.');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return email.substring(0, 2).toUpperCase();
    };

    // Check if user is Pro
    const isPro = user?.subscriptionStatus === 'pro' || user?.subscriptionStatus === 'premium';

    const handleLogout = async () => {
        await logout();
        setStorageMode('local');
        setIsOpen(false);
    };

    const handleSettingsClick = () => {
        setIsOpen(false);
        onOpenSettings();
    };

    if (!isAuthenticated || !user) return null;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${isOpen
                    ? 'bg-white/15 border-white/20'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                    } border`}
            >
                {/* Avatar */}
                <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/20">
                        {getInitials(user.email)}
                    </div>
                    {/* Pro badge */}
                    {isPro && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <Crown size={10} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Name & Status */}
                <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-white truncate max-w-[100px]">
                        {user.email.split('@')[0]}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                        {isPro ? (
                            <>
                                <Sparkles size={10} className="text-amber-400" />
                                <span className="text-amber-400">Pro</span>
                            </>
                        ) : (
                            <span>Free</span>
                        )}
                    </div>
                </div>

                <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </motion.button>

            {/* Dropdown menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2 w-64 origin-top-right z-[100]"
                    >
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 rounded-2xl blur-lg opacity-50" />

                        <div className="relative bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-purple-500/20">
                                        {getInitials(user.email)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {user.email}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isPro ? (
                                                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-xs font-medium text-amber-400 flex items-center gap-1">
                                                    <Crown size={10} />
                                                    Pro
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-slate-700/50 rounded-full text-xs font-medium text-slate-400">
                                                    Free
                                                </span>
                                            )}
                                            {storageMode === 'cloud' ? (
                                                <span className="flex items-center gap-1 text-xs text-cyan-400">
                                                    <Cloud size={10} />
                                                    Cloud
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <HardDrive size={10} />
                                                    Local
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu items */}
                            <div className="p-2">
                                <MenuItem
                                    icon={<User size={16} />}
                                    label="Mon Profil"
                                    onClick={() => setIsOpen(false)}
                                    disabled
                                    hint="Bientôt"
                                />
                                <MenuItem
                                    icon={<Settings size={16} />}
                                    label="Paramètres"
                                    onClick={handleSettingsClick}
                                />

                                <div className="my-2 border-t border-white/5" />

                                <MenuItem
                                    icon={<LogOut size={16} />}
                                    label="Déconnexion"
                                    onClick={handleLogout}
                                    variant="danger"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Menu item component
interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
    hint?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, variant = 'default', disabled, hint }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${disabled
                ? 'opacity-50 cursor-not-allowed'
                : variant === 'danger'
                    ? 'hover:bg-red-500/10 text-slate-300 hover:text-red-400'
                    : 'hover:bg-white/5 text-slate-300 hover:text-white'
                }`}
        >
            <span className={`${variant === 'danger'
                ? 'text-slate-400 group-hover:text-red-400'
                : 'text-slate-400 group-hover:text-white'
                } transition-colors`}>
                {icon}
            </span>
            <span className="flex-1 text-sm font-medium text-left">{label}</span>
            {hint && (
                <span className="text-xs text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded-full">
                    {hint}
                </span>
            )}
        </button>
    );
};

export default UserDropdown;

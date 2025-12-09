/**
 * ThemeToggle - Beautiful animated theme switcher
 * 
 * Cycles through: Dark → Light → System
 * With smooth icon transitions and tooltips.
 */

import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '../../application/store/theme-store';

// ============================================================================
// ICON CONFIG
// ============================================================================

const THEME_CONFIG: Record<ThemeMode, { icon: typeof Sun; label: string; color: string }> = {
    dark: { icon: Moon, label: 'Mode sombre', color: 'from-indigo-500 to-purple-600' },
    light: { icon: Sun, label: 'Mode clair', color: 'from-amber-400 to-orange-500' },
    system: { icon: Monitor, label: 'Système', color: 'from-slate-400 to-slate-600' }
};

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================

export function ThemeToggle() {
    const { mode, toggleTheme, isTransitioning } = useThemeStore();
    const config = THEME_CONFIG[mode];
    const Icon = config.icon;

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            disabled={isTransitioning}
            className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50`}
            title={config.label}
        >
            <motion.div
                key={mode}
                initial={{ opacity: 0, rotate: -180, scale: 0 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 180, scale: 0 }}
                transition={{ duration: 0.3, type: 'spring' }}
            >
                <Icon className="w-5 h-5" />
            </motion.div>

            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-50 blur-xl transition-opacity`} />
        </motion.button>
    );
}

// ============================================================================
// THEME TOGGLE BAR - Full control
// ============================================================================

export function ThemeToggleBar() {
    const { mode, setMode, resolvedTheme } = useThemeStore();

    return (
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
            {(['dark', 'light', 'system'] as ThemeMode[]).map((themeMode) => {
                const config = THEME_CONFIG[themeMode];
                const Icon = config.icon;
                const isActive = mode === themeMode;

                return (
                    <motion.button
                        key={themeMode}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMode(themeMode)}
                        className={`relative px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${isActive
                                ? `bg-gradient-to-r ${config.color} text-white`
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{config.label}</span>

                        {themeMode === 'system' && (
                            <span className="text-[10px] opacity-60">
                                ({resolvedTheme === 'dark' ? '🌙' : '☀️'})
                            </span>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

export default ThemeToggle;

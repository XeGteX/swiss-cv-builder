/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *   AUTH MODAL - ÉDITION NEXAL PREMIUM
 *   Interface d'authentification Next-Gen avec glassmorphism
 * 
 *   "Le portail vers l'Olympe s'ouvre à ceux qui sont dignes."
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Zap, Shield, User } from 'lucide-react';
import { useAuthStore } from '../../../application/store/auth-store';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; username?: string; password?: string; confirm?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, register, isLoading, error, clearError } = useAuthStore();

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            setErrors({});
            clearError();
        }
    }, [isOpen, clearError]);

    // Validate email
    const validateEmail = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return 'Email requis';
        if (!emailRegex.test(value)) return 'Email invalide';
        return undefined;
    };

    // Validate password
    const validatePassword = (value: string) => {
        if (!value) return 'Mot de passe requis';
        if (value.length < 6) return 'Minimum 6 caractères';
        return undefined;
    };

    // Validate username
    const validateUsername = (value: string) => {
        if (!value && mode === 'register') return 'Pseudo requis';
        if (value.length < 3 && mode === 'register') return 'Minimum 3 caractères';
        if (value.length > 20) return 'Maximum 20 caractères';
        return undefined;
    };

    // Real-time validation
    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: validateEmail(value) }));
        }
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: validatePassword(value) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const emailError = validateEmail(email);
        const usernameError = mode === 'register' ? validateUsername(username) : undefined;
        const passwordError = validatePassword(password);
        const confirmError = mode === 'register' && password !== confirmPassword
            ? 'Les mots de passe ne correspondent pas'
            : undefined;

        if (emailError || usernameError || passwordError || confirmError) {
            setErrors({ email: emailError, username: usernameError, password: passwordError, confirm: confirmError });
            return;
        }

        setIsSubmitting(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(email, password);
            }

            // Check if successful
            if (useAuthStore.getState().isAuthenticated) {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOfflineMode = () => {
        onClose();
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setErrors({});
        clearError();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal - Centered with bottom space for mobile nav */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24 md:pb-4 pointer-events-none"
                    >
                        <div
                            className="relative w-full max-w-md pointer-events-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Glow effect - hidden on mobile for performance */}
                            <div className="hidden md:block absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 rounded-3xl blur-xl opacity-40 animate-pulse" />

                            {/* Main container - scrollable with smaller max height on mobile */}
                            <div className="relative bg-[#0f0a1f] border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] md:max-h-[80vh] overflow-y-auto">
                                {/* Decorative header gradient */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 z-10"
                                >
                                    <X size={20} />
                                </button>

                                {/* Content - Compact on mobile */}
                                <div className="p-5 md:p-8">
                                    {/* Header - Smaller on mobile */}
                                    <div className="text-center mb-4 md:mb-6">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                            className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl md:rounded-2xl shadow-lg shadow-purple-500/30 mb-3"
                                        >
                                            <Shield className="text-white" size={24} />
                                        </motion.div>

                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={mode}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                                                    {mode === 'login' ? 'Connexion' : 'Inscription'}
                                                </h2>
                                                <p className="text-slate-400 text-sm">
                                                    {mode === 'login'
                                                        ? 'Accédez à votre espace personnel'
                                                        : 'Rejoignez la communauté Nexal'
                                                    }
                                                </p>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Error message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                                            >
                                                <p className="text-red-400 text-sm text-center">{error}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Email field */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => handleEmailChange(e.target.value)}
                                                    onBlur={() => setErrors(prev => ({ ...prev, email: validateEmail(email) }))}
                                                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'
                                                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200`}
                                                    placeholder="vous@exemple.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-400 text-xs mt-1"
                                                >
                                                    {errors.email}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Username field (register only) */}
                                        <AnimatePresence>
                                            {mode === 'register' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                                        Pseudo
                                                    </label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                        <input
                                                            type="text"
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            onBlur={() => setErrors(prev => ({ ...prev, username: validateUsername(username) }))}
                                                            className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.username ? 'border-red-500/50' : 'border-white/10'
                                                                } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200`}
                                                            placeholder="VotrePseudo"
                                                            maxLength={20}
                                                        />
                                                    </div>
                                                    {errors.username && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-red-400 text-xs mt-1"
                                                        >
                                                            {errors.username}
                                                        </motion.p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Password field */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Mot de passe
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                                    onBlur={() => setErrors(prev => ({ ...prev, password: validatePassword(password) }))}
                                                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'
                                                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200`}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-400 text-xs mt-1"
                                                >
                                                    {errors.password}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Confirm password (register only) */}
                                        <AnimatePresence>
                                            {mode === 'register' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                                        Confirmer le mot de passe
                                                    </label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.confirm ? 'border-red-500/50' : 'border-white/10'
                                                                } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200`}
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                    {errors.confirm && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-red-400 text-xs mt-1"
                                                        >
                                                            {errors.confirm}
                                                        </motion.p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Submit button */}
                                        <motion.button
                                            type="submit"
                                            disabled={isLoading || isSubmitting}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading || isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {mode === 'login' ? 'Se connecter' : "S'inscrire"}
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </motion.button>
                                    </form>

                                    {/* Divider */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-3 bg-[#0f0a1f] text-slate-500 text-xs">ou</span>
                                        </div>
                                    </div>

                                    {/* Offline mode */}
                                    <button
                                        onClick={handleOfflineMode}
                                        className="w-full py-2.5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                                    >
                                        <Zap size={16} />
                                        Continuer en mode hors-ligne
                                    </button>

                                    {/* Switch mode */}
                                    <div className="mt-6 text-center">
                                        <p className="text-slate-500 text-sm">
                                            {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                                            <button
                                                type="button"
                                                onClick={switchMode}
                                                className="ml-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                                            >
                                                {mode === 'login' ? "S'inscrire" : 'Se connecter'}
                                            </button>
                                        </p>
                                    </div>

                                    {/* Features (register mode) */}
                                    <AnimatePresence>
                                        {mode === 'register' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-6 pt-6 border-t border-white/5"
                                            >
                                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                                    <Sparkles size={16} className="text-purple-400" />
                                                    <span>Synchronisation cloud incluse</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;

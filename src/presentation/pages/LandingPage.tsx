/**
 * LANDING PAGE - Clicknland Conversion Framework
 * 
 * Structure:
 * 1. Hero (Promise + CTA)
 * 2. Social Proof (Trust Logos)
 * 3. Problem (Pain Agitation)
 * 4. Process (3 Simple Steps)
 * 5. Scrollytelling (The Wow Demo)
 * 6. Pricing (The Offer)
 * 7. FAQ & Footer (Objection Handling)
 * 
 * Design: Nexal Dark Mode + Violet Accents
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Upload, Brain, Rocket, Shield, Palette,
    ArrowRight, Check, ChevronDown, ChevronUp, Sparkles, Zap,
    ArrowUp
} from 'lucide-react';
import { useSoundEffects } from '../../utils/soundEffects';
import { useLocalizedPrices } from '../../utils/priceLocalization';

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }
};

// ============================================================================
// FLOATING NAVIGATION BAR (Mobile Responsive)
// ============================================================================

const FloatingNav: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // Removed sound from nav - only used in scrollytelling

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 100);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (href: string) => {
        setMobileMenuOpen(false);
        if (href.startsWith('#')) {
            const el = document.querySelector(href);
            el?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate(href);
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-white/5' : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <a href="/landing" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img src="/nexal-logo.png" alt="Nexal" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold text-white">Nexal</span>
                    </a>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                        <button onClick={() => handleNavClick('#features')} className="hover:text-white transition-colors">Fonctionnalités</button>
                        <button onClick={() => handleNavClick('#pricing')} className="hover:text-white transition-colors">Tarifs</button>
                        <button onClick={() => handleNavClick('#faq')} className="hover:text-white transition-colors">FAQ</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            onClick={() => navigate('/wizard')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="hidden sm:block px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                            Créer mon CV
                        </motion.button>

                        {/* Animated Hamburger Menu Button */}
                        <motion.button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden relative w-10 h-10 flex items-center justify-center"
                            aria-label="Menu"
                            animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <div className="relative w-6 h-5 flex flex-col justify-between">
                                {/* Top bar */}
                                <motion.span
                                    className="absolute w-6 h-0.5 bg-white rounded-full origin-center"
                                    animate={mobileMenuOpen
                                        ? { rotate: 45, y: 9, width: 24 }
                                        : { rotate: 0, y: 0, width: 24 }
                                    }
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                />
                                {/* Middle bar */}
                                <motion.span
                                    className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-white rounded-full"
                                    animate={mobileMenuOpen
                                        ? { opacity: 0, width: 0, x: 20 }
                                        : { opacity: 1, width: 16, x: 0 }
                                    }
                                    transition={{ duration: 0.2 }}
                                />
                                {/* Bottom bar */}
                                <motion.span
                                    className="absolute bottom-0 w-6 h-0.5 bg-white rounded-full origin-center"
                                    animate={mobileMenuOpen
                                        ? { rotate: -45, y: -9, width: 24 }
                                        : { rotate: 0, y: 0, width: 20 }
                                    }
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile menu overlay - Glassmorphism Style */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-40 md:hidden bg-slate-950/95"
                        style={{ touchAction: 'none' }}
                        onTouchMove={(e) => e.preventDefault()}
                    >

                        {/* Menu content */}
                        <div className="relative h-full pt-24 px-6 flex flex-col">
                            {/* Glassmorphism card */}
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleNavClick('#features')}
                                        className="text-lg text-white/90 hover:text-white hover:bg-white/10 py-4 px-4 rounded-2xl text-left transition-all flex items-center gap-3"
                                    >
                                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                                        Fonctionnalités
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('#pricing')}
                                        className="text-lg text-white/90 hover:text-white hover:bg-white/10 py-4 px-4 rounded-2xl text-left transition-all flex items-center gap-3"
                                    >
                                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                                        Tarifs
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('#faq')}
                                        className="text-lg text-white/90 hover:text-white hover:bg-white/10 py-4 px-4 rounded-2xl text-left transition-all flex items-center gap-3"
                                    >
                                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                                        FAQ
                                    </button>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <motion.button
                                onClick={() => { setMobileMenuOpen(false); navigate('/wizard'); }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-6 w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-2xl text-white font-semibold text-lg shadow-lg shadow-purple-500/25"
                            >
                                Créer mon CV
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ============================================================================
// SCROLL INDICATOR (Hero bottom)
// ============================================================================

const ScrollIndicator: React.FC = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
    >
        <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
        <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            <ChevronDown className="w-5 h-5 text-purple-400" />
        </motion.div>
    </motion.div>
);

// ============================================================================
// GLOBAL PROGRESS BAR
// ============================================================================

const GlobalProgress: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <motion.div
            className="fixed top-16 left-0 right-0 h-0.5 bg-gray-800 z-40"
        >
            <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-500 origin-left"
                style={{ scaleX }}
            />
        </motion.div>
    );
};

// ============================================================================
// BACK TO TOP BUTTON
// ============================================================================

const BackToTop: React.FC = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY > 500);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ArrowUp className="w-5 h-5 text-white" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

// ============================================================================
// STAGE INDICATOR (Scrollytelling Navigation Dots)
// ============================================================================

interface StageIndicatorProps {
    currentStage: number;
    totalStages: number;
    stageNames: string[];
}

const StageIndicator: React.FC<StageIndicatorProps> = ({ currentStage, totalStages, stageNames }) => (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-4">
        {Array.from({ length: totalStages }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3">
                <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{
                        opacity: currentStage === idx ? 1 : 0,
                        x: currentStage === idx ? 0 : 10
                    }}
                    className="text-xs text-purple-400 font-medium whitespace-nowrap"
                >
                    {stageNames[idx]}
                </motion.span>
                <motion.div
                    animate={{
                        scale: currentStage === idx ? 1.3 : 1,
                        backgroundColor: currentStage === idx ? '#8b5cf6' : '#374151'
                    }}
                    className="w-2.5 h-2.5 rounded-full transition-colors"
                />
            </div>
        ))}
    </div>
);

// ============================================================================
// 1. HERO SECTION
// ============================================================================

const HeroSection: React.FC = () => {
    const navigate = useNavigate();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const { playClick } = useSoundEffects();

    return (
        <section ref={ref} className="min-h-screen flex items-center pt-16 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f14] via-[#0a0a0f] to-[#0f0f14]" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-purple-600/10 rounded-full blur-[100px] sm:blur-[150px]" />

            <div className="max-w-7xl mx-auto relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Left: Copy */}
                    <motion.div
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={staggerContainer}
                    >
                        {/* Badge */}
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mt-4 mb-4 sm:mt-0 sm:mb-6">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                            <span className="text-xs sm:text-sm text-purple-300">+2,500 CV créés cette semaine</span>
                        </motion.div>

                        {/* H1 */}
                        <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
                            Ne cherchez plus<br />
                            un travail.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">
                                Attirez-le.
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p variants={fadeInUp} className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-lg leading-relaxed">
                            L'IA qui transforme votre parcours en une <span className="text-white">expérience interactive</span>.
                            Accédez à notre collection exclusive de <span className="text-purple-400 font-semibold">50 Designs d'Élite</span>.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                            <motion.button
                                onClick={() => { playClick(); navigate('/wizard'); }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                Créer mon CV
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                            <motion.button
                                onClick={() => { playClick(); navigate('/templates'); }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 sm:px-8 py-3 sm:py-4 border border-gray-700 hover:border-purple-500/50 rounded-xl text-white font-medium text-base sm:text-lg transition-colors"
                            >
                                Voir les modèles
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Right: Floating Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        {/* Glow */}
                        <div className="absolute inset-0 bg-purple-500/20 rounded-3xl blur-3xl transform rotate-6" />

                        {/* CV Card with Float Animation */}
                        <motion.div
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative bg-white rounded-2xl shadow-2xl p-8 transform -rotate-3"
                        >
                            {/* Mini CV */}
                            <div className="flex items-start gap-4 border-b border-gray-100 pb-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                                    JD
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Jean Dupont</h3>
                                    <p className="text-purple-600 font-medium text-sm">Architecte Logiciel Senior</p>
                                    <p className="text-xs text-gray-400 mt-1">Zurich, Suisse</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['React', 'TypeScript', 'Node.js', 'AWS'].map((skill) => (
                                    <span key={skill} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {[90, 70, 85].map((w, i) => (
                                    <div key={i} className="h-2 bg-gray-100 rounded" style={{ width: `${w}%` }} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Orbiting Badges */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0"
                            style={{ transformOrigin: 'center center' }}
                        >
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute -top-4 right-1/4 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1"
                            >
                                <Shield className="w-3 h-3" /> ATS Compatible
                            </motion.div>
                        </motion.div>
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                                className="absolute -bottom-2 left-4 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1"
                            >
                                <Sparkles className="w-3 h-3" /> IA Optimisé
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <ScrollIndicator />
        </section>
    );
};

// ============================================================================
// 2. SOCIAL PROOF (Trust Logos) - Neon Flicker Effect with Sound
// ============================================================================

const SocialProof: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    // Removed playCrackle sound per user request

    const logos = [
        { name: 'Google', color: '#4285F4' },
        { name: 'Microsoft', color: '#00A4EF' },
        { name: 'Apple', color: '#A2AAAD' },
        { name: 'Meta', color: '#0668E1' },
        { name: 'Amazon', color: '#FF9900' },
    ];

    return (
        <section ref={ref} className="py-8 sm:py-12 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d14]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <p className="text-center text-xs text-gray-500 mb-6 sm:mb-8 uppercase tracking-[0.2em]">
                    La technologie derrière les recrutements chez :
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-16">
                    {logos.map((logo, idx) => (
                        <motion.span
                            key={logo.name}
                            className="text-base sm:text-lg md:text-xl font-bold text-gray-600 tracking-tight cursor-default"
                            initial={{ opacity: 0 }}
                            animate={isInView ? {
                                opacity: [0, 0.8, 0.4, 1, 0.7, 1],
                                color: ['#4B5563', logo.color, '#4B5563', logo.color],
                                textShadow: [
                                    'none',
                                    `0 0 10px ${logo.color}60`,
                                    'none',
                                    `0 0 20px ${logo.color}40`
                                ]
                            } : {}}
                            transition={{
                                delay: 0.1 + idx * 0.15,
                                duration: 0.8,
                                times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                            }}
                            whileHover={{
                                scale: 1.1,
                                textShadow: `0 0 30px ${logo.color}60`,
                                color: logo.color
                            }}
                        >
                            {logo.name}
                        </motion.span>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ============================================================================
// 3. PROBLEM SECTION - Glassmorphism Cards
// ============================================================================

const ProblemSection: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const pains = [
        {
            icon: Shield,
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-400',
            title: 'Ignoré par les ATS',
            description: '75% des CV sont rejetés avant lecture humaine.',
            highlight: '75%'
        },
        {
            icon: Palette,
            iconBg: 'bg-orange-500/20',
            iconColor: 'text-orange-400',
            title: 'Design Amateur',
            description: 'Word et Canva créent des designs non-standards.',
            highlight: 'Canva'
        },
        {
            icon: Brain,
            iconBg: 'bg-yellow-500/20',
            iconColor: 'text-yellow-400',
            title: 'Page Blanche',
            description: 'Des heures perdues à chercher les mots.',
            highlight: 'Heures'
        }
    ];

    return (
        <section ref={ref} id="features" className="py-24 px-6 bg-gradient-to-b from-[#0d0d14] to-[#0a0a0f]">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Pourquoi votre CV actuel finit <span className="text-red-400">à la poubelle</span>.
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-gray-400 max-w-xl mx-auto">
                        Ces erreurs silencieuses détruisent vos chances avant même l'entretien.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="grid md:grid-cols-3 gap-6"
                >
                    {pains.map((pain, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="relative p-6 rounded-2xl overflow-hidden group"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                            }}
                        >
                            {/* Glassmorphism shine effect on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </div>

                            <div className={`w-14 h-14 ${pain.iconBg} rounded-xl flex items-center justify-center mb-5`}>
                                <pain.icon className={`w-7 h-7 ${pain.iconColor}`} />
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-3">{pain.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{pain.description}</p>

                            {/* Subtle bottom accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// ============================================================================
// 4. PROCESS SECTION - Scroll-Animated Timeline with Zap Sound
// ============================================================================

const ProcessSection: React.FC = () => {
    const containerRef = useRef<HTMLElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: '-100px' });
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });
    // Removed playZap sound per user request

    // Scroll-based animation progress for the timeline - trigger a bit later
    const lineProgress = useTransform(scrollYProgress, [0.25, 0.65], [0, 1]);
    const dotPosition = useTransform(scrollYProgress, [0.25, 0.65], ["0%", "100%"]);

    const steps = [
        {
            icon: Upload,
            title: 'Importez',
            subtitle: '(PDF/LinkedIn) ou Remplissez',
            description: 'Uploadez votre CV ou partez de zéro.',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: Zap,
            title: "L'IA Optimise",
            subtitle: 'Réécriture automatique',
            description: 'NanoBrain reformule votre contenu.',
            color: 'from-purple-500 to-violet-600'
        },
        {
            icon: Rocket,
            title: 'Exportez',
            subtitle: '& Postulez (PDF HD)',
            description: 'Téléchargez ou partagez en ligne.',
            color: 'from-green-500 to-emerald-500'
        }
    ];

    return (
        <section ref={containerRef} className="py-16 sm:py-28 px-4 sm:px-6 relative overflow-hidden bg-[#0a0a0f]">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[700px] h-[250px] sm:h-[400px] bg-purple-600/5 rounded-full blur-[100px] sm:blur-[120px]" />

            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="text-center mb-12 sm:mb-20"
                >
                    <motion.h2
                        variants={fadeInUp}
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center flex-wrap gap-2"
                    >
                        Votre nouveau CV en
                        <motion.span
                            className="text-purple-400 inline-flex items-center gap-1"
                            animate={isInView ? {
                                textShadow: ["0 0 0px #a855f7", "0 0 20px #a855f7", "0 0 0px #a855f7"]
                            } : {}}
                            transition={{ duration: 0.5, repeat: 2 }}
                        >
                            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                            15 minutes
                        </motion.span>
                        chrono.
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-sm sm:text-base text-gray-400">
                        Simple comme 1-2-3. Aucune compétence design requise.
                    </motion.p>
                </motion.div>

                <div className="relative">
                    {/* === DESKTOP: Horizontal Lightning (behind icons) === */}
                    <div
                        className="hidden md:block absolute top-16 left-[16%] right-[16%] h-4 pointer-events-none z-0"
                        style={{
                            willChange: 'transform',
                            transform: 'translateZ(0)',
                            backfaceVisibility: 'hidden'
                        }}
                    >
                        <svg className="w-full h-full" viewBox="0 0 100 8" preserveAspectRatio="none" style={{ willChange: 'contents' }}>
                            {/* Subtle electric arc */}
                            <motion.path
                                d="M0,4 L10,2 L18,6 L26,3 L35,5 L45,2 L55,5 L65,3 L75,6 L85,3 L100,4"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                                strokeLinecap="round"
                                style={{
                                    pathLength: lineProgress,
                                    filter: 'drop-shadow(0 0 6px #a855f7) drop-shadow(0 0 12px #7c3aed)',
                                    willChange: 'stroke-dashoffset'
                                }}
                            />
                            {/* Bright core */}
                            <motion.path
                                d="M0,4 L10,2 L18,6 L26,3 L35,5 L45,2 L55,5 L65,3 L75,6 L85,3 L100,4"
                                fill="none"
                                stroke="#e9d5ff"
                                strokeWidth="1"
                                strokeLinecap="round"
                                style={{
                                    pathLength: lineProgress,
                                    willChange: 'stroke-dashoffset'
                                }}
                            />
                        </svg>

                        {/* Small Zap head */}
                        <motion.div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                            style={{
                                left: dotPosition,
                                willChange: 'left',
                                transform: 'translateZ(0)'
                            }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.3, repeat: Infinity }}
                            >
                                <Zap className="w-5 h-5 text-yellow-400" style={{ filter: 'drop-shadow(0 0 8px #facc15)' }} />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* === MOBILE: Vertical Side Lightning === */}
                    <div className="md:hidden absolute inset-0 pointer-events-none z-10 overflow-hidden">
                        {/* Left side lightning */}
                        <svg className="absolute left-2 top-0 h-full w-4" viewBox="0 0 8 100" preserveAspectRatio="none">
                            <motion.path
                                d="M4,0 L2,10 L6,18 L3,28 L5,40 L2,52 L6,64 L3,76 L5,88 L4,100"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                                strokeLinecap="round"
                                style={{
                                    pathLength: lineProgress,
                                    filter: 'drop-shadow(0 0 6px #a855f7)'
                                }}
                            />
                        </svg>
                        {/* Right side lightning */}
                        <svg className="absolute right-2 top-0 h-full w-4" viewBox="0 0 8 100" preserveAspectRatio="none">
                            <motion.path
                                d="M4,0 L6,10 L2,18 L5,28 L3,40 L6,52 L2,64 L5,76 L3,88 L4,100"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                                strokeLinecap="round"
                                style={{
                                    pathLength: lineProgress,
                                    filter: 'drop-shadow(0 0 6px #a855f7)'
                                }}
                            />
                        </svg>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={staggerContainer}
                        className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 sm:gap-12 md:gap-8"
                    >
                        {steps.map((step, i) => {
                            // Icon flash thresholds aligned with line progress [0.25, 0.65]
                            // Icon 0 flashes at 0.30 (start), Icon 1 at 0.45 (middle), Icon 2 at 0.60 (end)
                            const iconThreshold = i === 0 ? 0.30 : i === 1 ? 0.45 : 0.60;

                            return (
                                <motion.div
                                    key={i}
                                    variants={fadeInUp}
                                    className="flex-1 text-center relative max-w-xs"
                                >
                                    {/* Step icon container with lightning strike effect */}
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={`relative z-10 w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl overflow-hidden`}
                                        style={{
                                            boxShadow: useTransform(
                                                scrollYProgress,
                                                [iconThreshold - 0.05, iconThreshold, iconThreshold + 0.05],
                                                [
                                                    '0 20px 40px -10px rgba(139, 92, 246, 0.3)',
                                                    '0 0 60px 20px rgba(250, 204, 21, 0.6), 0 0 100px 40px rgba(139, 92, 246, 0.4)',
                                                    '0 20px 40px -10px rgba(139, 92, 246, 0.3)'
                                                ]
                                            )
                                        }}
                                    >
                                        {/* Electric flash overlay - brighter */}
                                        <motion.div
                                            className="absolute inset-0 bg-white"
                                            style={{
                                                opacity: useTransform(
                                                    scrollYProgress,
                                                    [iconThreshold - 0.02, iconThreshold, iconThreshold + 0.02],
                                                    [0, 0.8, 0]
                                                )
                                            }}
                                        />
                                        <step.icon className="w-8 h-8 sm:w-12 sm:h-12 text-white relative z-10" />
                                    </motion.div>

                                    {/* Step number badge */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-6 h-6 sm:w-8 sm:h-8 bg-[#0a0a0f] border-2 border-purple-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-purple-400 shadow-lg">
                                        {i + 1}
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{step.title}</h3>
                                    <p className="text-xs sm:text-sm text-purple-300 mb-2">{step.subtitle}</p>
                                    <p className="text-gray-400 text-xs sm:text-sm">{step.description}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ============================================================================
// 5. SCROLLYTELLING - Cinema Level (Apple/Tesla Style)
// ============================================================================

const ScrollytellingSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

    // 800vh = ~8 full screens of scroll for slow, cinematic appreciation
    // 5 Distinct Acts with generous transition zones:
    // Act 1: 0-20%   - "The Problem" (Old CV)
    // Act 2: 20-40%  - "The Discovery" (AI Scan)  
    // Act 3: 40-60%  - "The Revelation" (Stats)
    // Act 4: 60-80%  - "The Choice" (Templates)
    // Act 5: 80-100% - "The Triumph" (Final CV + CTA)

    // Smooth opacity transitions with generous overlap
    const act1 = useTransform(scrollYProgress, [0, 0.15, 0.20], [1, 1, 0]);
    const act2 = useTransform(scrollYProgress, [0.15, 0.20, 0.35, 0.40], [0, 1, 1, 0]);
    const act3 = useTransform(scrollYProgress, [0.35, 0.40, 0.55, 0.60], [0, 1, 1, 0]);
    const act4 = useTransform(scrollYProgress, [0.55, 0.60, 0.75, 0.80], [0, 1, 1, 0]);
    const act5 = useTransform(scrollYProgress, [0.75, 0.80, 1], [0, 1, 1]);

    // Cinematic transforms
    const scanLine = useTransform(scrollYProgress, [0.20, 0.35], ['0%', '100%']);
    const cvScale = useTransform(scrollYProgress, [0.80, 0.90], [0.9, 1]);
    const cvY = useTransform(scrollYProgress, [0.80, 0.90], [30, 0]);
    const glowIntensity = useTransform(scrollYProgress, [0.80, 1], [0.3, 0.8]);

    // Background evolution
    const bgColor = useTransform(
        scrollYProgress,
        [0, 0.25, 0.5, 0.75, 1],
        [
            '#0a0a0f',
            '#0d0a14',
            '#100a18',
            '#0d0a14',
            '#0a0a0f'
        ]
    );

    // Calculate current stage for StageIndicator with sounds
    const [currentStage, setCurrentStage] = useState(0);
    const stageNames = ['Le problème', 'La découverte', 'La révélation', 'Le choix', 'Le triomphe'];
    const lastStageRef = useRef(0);
    const { playTransition, playTriumph } = useSoundEffects();

    useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (v) => {
            let newStage = 0;
            if (v < 0.2) newStage = 0;
            else if (v < 0.4) newStage = 1;
            else if (v < 0.6) newStage = 2;
            else if (v < 0.8) newStage = 3;
            else newStage = 4;

            if (newStage !== lastStageRef.current) {
                lastStageRef.current = newStage;
                setCurrentStage(newStage);
                // Play emotional sound on stage change
                if (newStage === 4) {
                    playTriumph(); // Celebration for final stage
                } else {
                    playTransition(newStage);
                }
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, playTransition, playTriumph]);

    return (
        <div ref={containerRef} className="h-[800vh] relative">
            {/* Stage Indicator (right side dots) */}
            <StageIndicator currentStage={currentStage} totalStages={5} stageNames={stageNames} />

            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                {/* Dynamic background */}
                <motion.div
                    className="absolute inset-0"
                    style={{ backgroundColor: bgColor }}
                />

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}
                />

                {/* Central glow */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]"
                    style={{
                        background: useTransform(
                            scrollYProgress,
                            [0, 0.5, 1],
                            ['rgba(139,92,246,0.05)', 'rgba(139,92,246,0.15)', 'rgba(139,92,246,0.1)']
                        )
                    }}
                />

                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8">

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* ACT 1: THE PROBLEM */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <motion.div
                        style={{ opacity: act1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-4"
                    >
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-500 mb-4 sm:mb-8"
                        >
                            Le problème
                        </motion.p>

                        <div className="relative mb-6 sm:mb-12">
                            {/* The "bad" CV - responsive sizing */}
                            <motion.div
                                animate={{
                                    rotate: [-1, 1, -1],
                                    y: [0, -3, 0]
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative"
                            >
                                <div className="w-48 sm:w-64 md:w-80 bg-gray-200 rounded-lg p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-300">
                                    <div className="h-4 sm:h-6 bg-gray-400 rounded w-2/3 mb-2 sm:mb-3" />
                                    <div className="h-3 sm:h-4 bg-gray-350 rounded w-1/2 mb-4 sm:mb-6" />
                                    <div className="space-y-2 sm:space-y-3">
                                        {[80, 65, 90, 55, 75].map((w, idx) => (
                                            <div key={idx} className="h-1.5 sm:h-2.5 bg-gray-400/70 rounded" style={{ width: `${w}%` }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Rejection stamp */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: -15 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                    className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-red-500/90 text-white px-2 sm:px-4 py-1 sm:py-2 rounded font-bold text-xs sm:text-sm shadow-lg"
                                    style={{ transform: 'rotate(-15deg)' }}
                                >
                                    REJETÉ
                                </motion.div>
                            </motion.div>
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-3 sm:mb-4 leading-tight">
                            75% des CV sont rejetés<br />
                            <span className="text-gray-500">avant toute lecture humaine.</span>
                        </h2>

                        <p className="text-gray-500 text-sm sm:text-base md:text-lg text-center">
                            Continuez à scroller pour découvrir la solution...
                        </p>
                    </motion.div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* ACT 2: THE DISCOVERY */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <motion.div
                        style={{ opacity: act2 }}
                        className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                        <motion.p
                            className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-8"
                        >
                            La découverte
                        </motion.p>

                        <div className="relative mb-12">
                            <div className="w-80 bg-white/5 backdrop-blur rounded-2xl p-8 border border-purple-500/20 overflow-hidden">
                                {/* Scanning beam */}
                                <motion.div
                                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                                    style={{
                                        top: scanLine,
                                        boxShadow: '0 0 30px 10px rgba(139,92,246,0.5)'
                                    }}
                                />

                                {/* Document lines being scanned */}
                                <div className="space-y-4 opacity-60">
                                    {[...Array(6)].map((_, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="h-3 bg-gradient-to-r from-purple-500/30 to-transparent rounded"
                                            style={{ width: `${60 + idx * 7}%` }}
                                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: idx * 0.2
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* AI Badge */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    boxShadow: [
                                        '0 0 20px rgba(139,92,246,0.3)',
                                        '0 0 40px rgba(139,92,246,0.5)',
                                        '0 0 20px rgba(139,92,246,0.3)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2"
                            >
                                <Brain className="w-5 h-5" />
                                NanoBrain analyse...
                            </motion.div>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 mt-8">
                            L'IA qui <span className="text-purple-400">comprend</span><br />
                            votre potentiel.
                        </h2>
                    </motion.div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* ACT 3: THE REVELATION - Mobile Responsive */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <motion.div
                        style={{ opacity: act3 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-4"
                    >
                        <motion.p
                            className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-green-400 mb-6 sm:mb-12"
                        >
                            La révélation
                        </motion.p>

                        <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-12 mb-6 sm:mb-12 w-full max-w-md sm:max-w-lg">
                            {[
                                { label: 'Score ATS', before: '23%', after: '97%', color: 'text-green-400' },
                                { label: 'Mots-clés', before: '4', after: '18', color: 'text-purple-400' },
                                { label: 'Impact', before: '2/10', after: '9/10', color: 'text-cyan-400' },
                            ].map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.15 }}
                                    className="text-center"
                                >
                                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 mb-1 sm:mb-3">
                                        {stat.label}
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4">
                                        <span className="text-sm sm:text-xl md:text-2xl text-gray-600 line-through">
                                            {stat.before}
                                        </span>
                                        <motion.span
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                                            className={`text-2xl sm:text-4xl md:text-5xl font-bold ${stat.color}`}
                                        >
                                            {stat.after}
                                        </motion.span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
                            Résultats <span className="text-green-400">instantanés</span>.
                        </h2>
                    </motion.div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* ACT 4: THE CHOICE - Mobile Responsive */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <motion.div
                        style={{ opacity: act4 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-4"
                    >
                        <motion.p
                            className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-400 mb-4 sm:mb-8"
                        >
                            Le choix
                        </motion.p>

                        <div className="flex items-end gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-12" style={{ perspective: '1000px' }}>
                            {[
                                { name: 'Tech', accent: 'bg-cyan-500', z: 1 },
                                { name: 'Minimal', accent: 'bg-gray-800', z: 2, selected: true },
                                { name: 'Creative', accent: 'bg-gradient-to-r from-pink-500 to-purple-500', z: 1 },
                            ].map((tpl, idx) => (
                                <motion.div
                                    key={tpl.name}
                                    initial={{ opacity: 0, y: 50, rotateY: -10 }}
                                    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    className={`relative bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-5 shadow-2xl cursor-pointer transition-all duration-300 ${tpl.selected
                                        ? 'w-24 sm:w-28 md:w-36 ring-2 sm:ring-4 ring-purple-500 shadow-purple-500/20 z-20'
                                        : 'w-16 sm:w-20 md:w-28 opacity-60 hover:opacity-90'
                                        }`}
                                    style={{ zIndex: tpl.z }}
                                >
                                    {tpl.selected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 w-5 h-5 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <Check className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                                        </motion.div>
                                    )}
                                    <div className={`h-2 sm:h-3 rounded w-2/3 mb-2 sm:mb-3 ${tpl.accent}`} />
                                    <div className="space-y-1 sm:space-y-1.5">
                                        {[70, 85, 60, 90].map((w, j) => (
                                            <div key={j} className="h-1 sm:h-1.5 bg-gray-200 rounded" style={{ width: `${w}%` }} />
                                        ))}
                                    </div>
                                    <div className="mt-2 sm:mt-4 text-[10px] sm:text-xs text-center text-gray-600 font-medium">
                                        {tpl.name}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-2 sm:mb-4">
                            <span className="text-purple-400">50</span> designs d'élite.
                        </h2>
                        <p className="text-gray-500 text-sm sm:text-base md:text-lg text-center">
                            Choisissez celui qui vous ressemble.
                        </p>
                    </motion.div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* ACT 5: THE TRIUMPH - Mobile Responsive */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <motion.div
                        style={{ opacity: act5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-4"
                    >
                        <motion.div
                            style={{ scale: cvScale, y: cvY }}
                            className="relative mb-6 sm:mb-10">
                            {/* Glowing halo */}
                            <motion.div
                                className="absolute -inset-4 sm:-inset-8 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl"
                                style={{
                                    background: `rgba(139,92,246,${glowIntensity.get()})`,
                                }}
                                animate={{
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />

                            {/* The premium CV - responsive sizing */}
                            <motion.div
                                className="relative w-64 sm:w-80 md:w-96 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 shadow-2xl"
                                animate={{
                                    boxShadow: [
                                        '0 25px 60px -12px rgba(139,92,246,0.25)',
                                        '0 25px 80px -12px rgba(139,92,246,0.4)',
                                        '0 25px 60px -12px rgba(139,92,246,0.25)'
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <div className="flex items-center gap-3 sm:gap-5 border-b border-gray-100 pb-3 sm:pb-6 mb-3 sm:mb-6">
                                    <motion.div
                                        animate={{ scale: [1, 1.03, 1] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl md:text-2xl shadow-lg"
                                    >
                                        JD
                                    </motion.div>
                                    <div>
                                        <div className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">Jean Dupont</div>
                                        <div className="text-purple-600 font-medium text-sm sm:text-base md:text-lg">Architecte Logiciel Senior</div>
                                        <div className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Zurich, Suisse</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-6">
                                    {['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'].map((skill, idx) => (
                                        <motion.span
                                            key={skill}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 + idx * 0.1 }}
                                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium"
                                        >
                                            {skill}
                                        </motion.span>
                                    ))}
                                </div>

                                <div className="space-y-2 sm:space-y-3">
                                    {[95, 88, 92].map((w, idx) => (
                                        <div key={idx} className="h-1.5 sm:h-2.5 bg-purple-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${w}%` }}
                                                transition={{ duration: 1, delay: 0.5 + idx * 0.2 }}
                                                className="h-full bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Floating badges */}
                            <motion.div
                                animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-5 -right-5 px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full shadow-xl flex items-center gap-1.5"
                            >
                                <Shield className="w-4 h-4" />
                                ATS Optimisé
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 8, 0], rotate: [0, -2, 0] }}
                                transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
                                className="absolute -bottom-5 -left-5 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-full shadow-xl flex items-center gap-1.5"
                            >
                                <Sparkles className="w-4 h-4" />
                                Premium
                            </motion.div>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold text-white text-center mb-6"
                        >
                            Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400">impressionner</span>.
                        </motion.h2>

                        <motion.button
                            onClick={() => navigate('/wizard')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-2xl text-white font-semibold text-xl flex items-center gap-3 shadow-2xl shadow-purple-500/30"
                        >
                            <Sparkles className="w-6 h-6" />
                            Créer mon CV maintenant
                            <ArrowRight className="w-6 h-6" />
                        </motion.button>
                    </motion.div>
                </div>
            </div >
        </div >
    );
};

// ============================================================================
// 6. PRICING SECTION
// ============================================================================

const PricingSection: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const navigate = useNavigate();
    const { prices, formatPrice } = useLocalizedPrices();

    const plans = [
        {
            name: 'Sprint',
            price: prices.free,
            period: '',
            description: 'Pour tester rapidement',
            features: ['1 CV', '3 templates', 'Export PDF', 'Pas de filigrane'],
            cta: 'Commencer gratuit',
            popular: false
        },
        {
            name: 'Campagne',
            price: formatPrice(prices.monthly),
            period: prices.period,
            description: 'Pour une recherche active',
            features: ['CV illimités', '50 templates', 'Lien web public', 'IA NanoBrain', 'Support prioritaire'],
            cta: 'Choisir Campagne',
            popular: true
        },
        {
            name: 'Pro',
            price: formatPrice(prices.monthlyPro),
            period: prices.period,
            description: 'Pour les recruteurs',
            features: ['Tout Campagne +', 'API access', 'White-label', 'Analytics avancés', 'Support dédié'],
            cta: 'Contacter',
            popular: false
        }
    ];

    return (
        <section ref={ref} id="pricing" className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Tarifs <span className="text-purple-400">simples</span>
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-gray-400">
                        Commencez gratuitement. Évoluez selon vos besoins.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="grid md:grid-cols-3 gap-6"
                >
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.name}
                            variants={fadeInUp}
                            className={`relative p-8 rounded-2xl ${plan.popular
                                ? 'bg-gradient-to-b from-purple-900/40 to-purple-950/40 border-2 border-purple-500 shadow-[0_0_40px_rgba(139,92,246,0.2)]'
                                : 'bg-gray-900/50 border border-gray-800'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-white text-xs font-bold uppercase tracking-wide">
                                    Populaire
                                </div>
                            )}

                            <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                {plan.period && <span className="text-gray-400">{plan.period}</span>}
                            </div>
                            <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-center gap-3 text-gray-300 text-sm">
                                        <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-purple-400' : 'text-green-400'}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => navigate('/wizard')}
                                className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.popular
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// ============================================================================
// 7. FAQ SECTION
// ============================================================================

const FAQSection: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: 'Est-ce compatible avec les systèmes ATS ?',
            answer: 'Oui, 100%. Nos modèles sont conçus pour être parfaitement lisibles par les logiciels de recrutement (ATS). Votre CV ne sera jamais rejeté automatiquement.'
        },
        {
            question: 'Puis-je annuler mon abonnement ?',
            answer: 'Absolument. Vous pouvez annuler à tout moment depuis votre tableau de bord. Aucun engagement, aucune question posée.'
        },
        {
            question: 'Mes données sont-elles sécurisées ?',
            answer: 'Vos données sont cryptées et hébergées en Suisse. Nous ne les partageons jamais avec des tiers. Vous restez propriétaire de votre contenu.'
        },
        {
            question: 'Comment fonctionne l\'IA NanoBrain ?',
            answer: 'NanoBrain analyse votre parcours et suggère des formulations professionnelles. Elle optimise la structure et le vocabulaire pour maximiser l\'impact de votre CV.'
        },
        {
            question: 'Puis-je créer plusieurs versions de mon CV ?',
            answer: 'Avec les plans Campagne et Pro, vous pouvez créer un nombre illimité de CV pour différents postes ou secteurs.'
        }
    ];

    return (
        <section ref={ref} id="faq" className="py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="text-center mb-12"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Questions fréquentes
                    </motion.h2>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="space-y-3"
                >
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="border border-gray-800 rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-900/50 transition-colors"
                            >
                                <span className="font-medium text-white">{faq.question}</span>
                                {openIndex === i ? (
                                    <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                )}
                            </button>
                            {openIndex === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-4 text-gray-400 text-sm"
                                >
                                    {faq.answer}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// ============================================================================
// 8. FINAL CTA
// ============================================================================

const FinalCTA: React.FC = () => {
    const navigate = useNavigate();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <section ref={ref} className="py-24 px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                className="max-w-3xl mx-auto text-center"
            >
                <div className="p-12 rounded-3xl bg-gradient-to-b from-purple-900/30 to-purple-950/30 border border-purple-500/30">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Prêt à vous <span className="text-purple-400">démarquer</span> ?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Rejoignez les milliers de professionnels qui ont transformé leur carrière.
                    </p>
                    <motion.button
                        onClick={() => navigate('/wizard')}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold text-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                        <Sparkles className="w-5 h-5" />
                        Créer mon CV gratuitement
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// 9. FOOTER
// ============================================================================

const Footer: React.FC = () => {
    const navigate = useNavigate();

    return (
        <footer className="border-t border-gray-800 py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div>
                        <a href="/landing" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                            <img src="/nexal-logo.png" alt="Nexal" className="w-10 h-10 rounded-xl" />
                            <span className="text-white font-bold text-lg">Nexal</span>
                        </a>
                        <p className="text-gray-500 text-sm">
                            L'outil de création de CV propulsé par l'IA. Made with 💜 in Switzerland.
                        </p>
                    </div>

                    {/* Produit Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Produit</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><button onClick={() => navigate('/templates')} className="hover:text-purple-400 transition-colors">Templates</button></li>
                            <li><a href="#pricing" className="hover:text-purple-400 transition-colors">Tarifs</a></li>
                            <li><button onClick={() => navigate('/exemples')} className="hover:text-purple-400 transition-colors">Exemples</button></li>
                        </ul>
                    </div>

                    {/* Ressources Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Ressources</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><button onClick={() => navigate('/blog')} className="hover:text-purple-400 transition-colors">Blog</button></li>
                            <li><button onClick={() => navigate('/guide-cv')} className="hover:text-purple-400 transition-colors">Guide CV</button></li>
                            <li><a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Légal</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><button onClick={() => navigate('/confidentialite')} className="hover:text-purple-400 transition-colors">Confidentialité</button></li>
                            <li><button onClick={() => navigate('/cgu')} className="hover:text-purple-400 transition-colors">CGU</button></li>
                            <li><button onClick={() => navigate('/contact')} className="hover:text-purple-400 transition-colors">Contact</button></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Nexal. Tous droits réservés.
                </div>
            </div>
        </footer>
    );
};

// ============================================================================
// MAIN LANDING PAGE
// ============================================================================

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Fixed UI Elements */}
            <FloatingNav />
            <GlobalProgress />
            <BackToTop />

            {/* Page Content */}
            <HeroSection />
            <SocialProof />
            <ProblemSection />
            <ProcessSection />
            <ScrollytellingSection />
            <PricingSection />
            <FAQSection />
            <FinalCTA />
            <Footer />
        </div>
    );
};

export default LandingPage;

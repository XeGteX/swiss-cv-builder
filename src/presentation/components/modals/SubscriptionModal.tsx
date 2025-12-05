import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Crown, Rocket, Check, Zap, Shield, Clock } from 'lucide-react';
import { useUpsellModalStore, PLAN_PRICING } from '../../../application/hooks/useGate';
import type { GateTriggerSource, SubscriptionPlan } from '../../../application/hooks/useGate';
import { cn } from '../../design-system/atoms/Button';

// Dynamic text based on trigger source
const TRIGGER_CONTENT: Record<GateTriggerSource, { title: string; subtitle: string; icon: React.ReactNode }> = {
    ai_generation: {
        title: "Débloquez l'IA ✨",
        subtitle: "Générez des CV parfaits avec notre intelligence artificielle",
        icon: <Sparkles className="text-purple-400" size={32} />
    },
    ai_trial_expired: {
        title: "Votre essai IA est terminé",
        subtitle: "Continuez à utiliser l'IA sans limites",
        icon: <Zap className="text-amber-400" size={32} />
    },
    premium_template: {
        title: "Débloquez le Design Premium 🎨",
        subtitle: "Accédez aux templates professionnels qui font la différence",
        icon: <Crown className="text-amber-400" size={32} />
    },
    publish_link: {
        title: "Lien Public Permanent 🔗",
        subtitle: "Partagez votre CV avec un lien qui ne expire jamais",
        icon: <Shield className="text-emerald-400" size={32} />
    },
    download_limit: {
        title: "Plus de téléchargements 📥",
        subtitle: "Continuez à télécharger vos CV en PDF",
        icon: <Rocket className="text-blue-400" size={32} />
    }
};

// Plan card component
interface PlanCardProps {
    name: string;
    plan: 'sprint' | 'campagne' | 'pro';
    price: number;
    period: string;
    features: readonly string[];
    isPopular?: boolean;
    onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ name, plan, price, period, features, isPopular, onSelect }) => {
    const colorSchemes = {
        sprint: {
            gradient: 'from-slate-600 to-slate-700',
            border: 'border-slate-500/30',
            button: 'bg-slate-600 hover:bg-slate-500',
            badge: 'bg-slate-500'
        },
        campagne: {
            gradient: 'from-purple-600 to-indigo-600',
            border: 'border-purple-400/50',
            button: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500',
            badge: 'bg-purple-500'
        },
        pro: {
            gradient: 'from-amber-500 to-orange-500',
            border: 'border-amber-400/50',
            button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400',
            badge: 'bg-amber-500'
        }
    };

    const scheme = colorSchemes[plan];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: plan === 'sprint' ? 0.1 : plan === 'campagne' ? 0.2 : 0.3 }}
            className={cn(
                "relative flex flex-col p-5 rounded-2xl border-2 backdrop-blur-xl",
                "bg-slate-800/60",
                scheme.border,
                isPopular && "ring-2 ring-purple-500/50 scale-105 z-10"
            )}
        >
            {/* Popular badge */}
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white", scheme.badge)}>
                        Le plus populaire
                    </span>
                </div>
            )}

            {/* Plan name */}
            <h3 className={cn(
                "text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r",
                scheme.gradient
            )}>
                {name}
            </h3>

            {/* Price */}
            <div className="mt-3 mb-4">
                <span className="text-3xl font-black text-white">{price}€</span>
                <span className="text-slate-400 text-sm ml-1">/ {period}</span>
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-2.5 mb-5">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check size={16} className={cn(
                            plan === 'sprint' ? 'text-slate-400' :
                                plan === 'campagne' ? 'text-purple-400' : 'text-amber-400'
                        )} />
                        {feature}
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSelect}
                className={cn(
                    "w-full py-3 px-4 rounded-xl font-semibold text-white transition-all shadow-lg",
                    scheme.button
                )}
            >
                {plan === 'pro' ? '👑 Devenir Pro' : plan === 'campagne' ? '🚀 Commencer' : 'Essayer'}
            </motion.button>
        </motion.div>
    );
};

export const SubscriptionModal: React.FC = () => {
    const { isOpen, triggerSource, closeModal } = useUpsellModalStore();

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, closeModal]);

    const handleSelectPlan = (plan: SubscriptionPlan) => {
        // TODO: Integrate with payment provider (Stripe/Paddle)
        console.log(`Selected plan: ${plan}`);
        // For demo, simulate subscription
        const days = plan === 'sprint' ? 7 : 30;
        localStorage.setItem('nexal_subscription_plan', plan);
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);
        localStorage.setItem('nexal_subscription_expiry', expiry.toISOString());
        closeModal();
        window.location.reload(); // Refresh to apply subscription
    };

    const content = triggerSource ? TRIGGER_CONTENT[triggerSource] : TRIGGER_CONTENT.ai_generation;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative w-full max-w-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Decorative gradient orbs */}
                        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />

                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="relative z-10 p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.1 }}
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 mb-4"
                                >
                                    {content.icon}
                                </motion.div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {content.title}
                                </h2>
                                <p className="text-slate-400">
                                    {content.subtitle}
                                </p>
                            </div>

                            {/* Plans grid */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <PlanCard
                                    name="Sprint"
                                    plan="sprint"
                                    price={PLAN_PRICING.sprint.price}
                                    period={PLAN_PRICING.sprint.period}
                                    features={PLAN_PRICING.sprint.features}
                                    onSelect={() => handleSelectPlan('sprint')}
                                />
                                <PlanCard
                                    name="Campagne"
                                    plan="campagne"
                                    price={PLAN_PRICING.campagne.price}
                                    period={PLAN_PRICING.campagne.period}
                                    features={PLAN_PRICING.campagne.features}
                                    isPopular
                                    onSelect={() => handleSelectPlan('campagne')}
                                />
                                <PlanCard
                                    name="Pro"
                                    plan="pro"
                                    price={PLAN_PRICING.pro.price}
                                    period={PLAN_PRICING.pro.period}
                                    features={PLAN_PRICING.pro.features}
                                    onSelect={() => handleSelectPlan('pro')}
                                />
                            </div>

                            {/* Trust indicators */}
                            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <Shield size={14} />
                                    <span>Paiement sécurisé</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    <span>Annulation à tout moment</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SubscriptionModal;

/**
 * Contact Page - Formulaire de contact professionnel
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Send, MessageSquare, Clock, HelpCircle, ExternalLink } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const ContactPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
    };

    const quickAnswers = [
        {
            question: "Comment annuler mon abonnement ?",
            answer: "Rendez-vous dans Paramètres > Abonnement > Annuler. Votre accès reste actif jusqu'à la fin de la période payée."
        },
        {
            question: "Puis-je être remboursé ?",
            answer: "Oui, vous disposez de 14 jours après souscription pour demander un remboursement intégral, sans justification."
        },
        {
            question: "Mes données sont-elles sécurisées ?",
            answer: "Absolument. Chiffrement SSL/TLS, bases de données AES-256, serveurs en Europe. Voir notre Politique de Confidentialité."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/landing')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                        {t('common.back')}
                    </button>
                    <a href="/landing" className="flex items-center gap-2">
                        <img src="/nexal-logo.png" alt="Nexal" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold">Nexal</span>
                    </a>
                    <div className="w-20" />
                </div>
            </header>

            {/* Content */}
            <main className="pt-28 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                            <span className="text-purple-400">Contactez</span>-nous
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Une question ? Un problème technique ? Une suggestion ? Notre équipe est à votre écoute.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

                            {/* Contact Cards */}
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Email</h3>
                                        <a href="mailto:contact@nexal.io" className="text-purple-400 hover:underline">contact@nexal.io</a>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Pour toute question générale, demande de partenariat ou presse.
                                </p>
                            </div>

                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Support Technique</h3>
                                        <a href="mailto:support@nexal.io" className="text-blue-400 hover:underline">support@nexal.io</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>Réponse sous 24h ouvrées</span>
                                </div>
                            </div>

                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Informations légales</h3>
                                        <p className="text-gray-400 text-sm">Micro-entreprise France</p>
                                    </div>
                                </div>
                                <div className="text-gray-400 text-sm space-y-1">
                                    <p><strong className="text-white">Éditeur :</strong> [VOTRE NOM PRÉNOM]</p>
                                    <p><strong className="text-white">Statut :</strong> Micro-entrepreneur</p>
                                    <p><strong className="text-white">SIRET :</strong> [VOTRE NUMÉRO SIRET]</p>
                                </div>
                            </div>

                            {/* Quick Answers */}
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <HelpCircle className="w-5 h-5 text-yellow-400" />
                                    <h3 className="font-semibold">Questions fréquentes</h3>
                                </div>
                                <div className="space-y-4">
                                    {quickAnswers.map((qa, idx) => (
                                        <div key={idx} className="border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                                            <p className="text-white text-sm font-medium mb-1">{qa.question}</p>
                                            <p className="text-gray-400 text-sm">{qa.answer}</p>
                                        </div>
                                    ))}
                                </div>
                                <a href="/faq" className="flex items-center gap-1 text-purple-400 text-sm mt-4 hover:underline">
                                    Voir toutes les FAQ <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            {submitted ? (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Message envoyé !</h3>
                                    <p className="text-gray-400 mb-6">Nous vous répondrons dans les plus brefs délais.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-purple-400 hover:underline text-sm"
                                    >
                                        Envoyer un autre message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Nom complet <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                                            placeholder="Jean Dupont"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email <span className="text-red-400">*</span></label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                                            placeholder="jean@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Sujet <span className="text-red-400">*</span></label>
                                        <select
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                                        >
                                            <option value="">Choisissez un sujet</option>
                                            <option value="support">🔧 Support technique</option>
                                            <option value="billing">💳 Facturation / Paiement</option>
                                            <option value="account">👤 Mon compte</option>
                                            <option value="feedback">💡 Suggestion / Feedback</option>
                                            <option value="bug">🐛 Signaler un bug</option>
                                            <option value="partnership">🤝 Partenariat</option>
                                            <option value="press">📰 Presse / Média</option>
                                            <option value="gdpr">🔒 RGPD / Données personnelles</option>
                                            <option value="other">❓ Autre</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Message <span className="text-red-400">*</span></label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none resize-none transition-colors"
                                            placeholder="Décrivez votre demande en détail..."
                                        />
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        En soumettant ce formulaire, vous acceptez notre{' '}
                                        <a href="/confidentialite" className="text-purple-400 hover:underline">Politique de Confidentialité</a>.
                                    </div>

                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                        Envoyer le message
                                    </motion.button>
                                </form>
                            )}
                        </motion.div>
                    </div>

                    {/* Legal Links */}
                    <div className="mt-16 text-center">
                        <p className="text-gray-500 text-sm">
                            Consultez également nos{' '}
                            <a href="/cgu" className="text-purple-400 hover:underline">Conditions Générales</a>
                            {' '}et notre{' '}
                            <a href="/confidentialite" className="text-purple-400 hover:underline">Politique de Confidentialité</a>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;


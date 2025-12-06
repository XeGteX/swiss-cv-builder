/**
 * Confidentialité Page - Politique de confidentialité
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const ConfidentialitePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/landing')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                        Retour
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
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Shield className="w-7 h-7 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
                                <p className="text-gray-400">Dernière mise à jour: 5 décembre 2024</p>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-purple max-w-none space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-white">1. Collecte des Données</h2>
                                <p className="text-gray-400">
                                    Nexal collecte uniquement les données nécessaires à la création de votre CV.
                                    Cela inclut vos informations professionnelles, votre parcours et vos compétences.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">2. Utilisation des Données</h2>
                                <p className="text-gray-400">
                                    Vos données sont utilisées exclusivement pour générer votre CV et améliorer nos services.
                                    Nous ne vendons jamais vos informations à des tiers.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">3. Stockage et Sécurité</h2>
                                <p className="text-gray-400">
                                    Toutes les données sont cryptées et stockées sur des serveurs sécurisés en Suisse.
                                    Nous appliquons les standards de sécurité les plus stricts.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">4. Vos Droits</h2>
                                <p className="text-gray-400">
                                    Vous pouvez à tout moment accéder à vos données, les modifier ou les supprimer.
                                    Contactez-nous à privacy@nexal.ch pour toute demande.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">5. Cookies</h2>
                                <p className="text-gray-400">
                                    Nous utilisons des cookies essentiels pour le fonctionnement du site et
                                    des cookies analytiques pour améliorer votre expérience.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">6. Contact</h2>
                                <p className="text-gray-400">
                                    Pour toute question relative à cette politique, contactez-nous:<br />
                                    Email: privacy@nexal.ch<br />
                                    Adresse: Nexal SA, Rue du Rhône 8, 1204 Genève, Suisse
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ConfidentialitePage;

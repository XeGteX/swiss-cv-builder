/**
 * CGU Page - Conditions Générales d'Utilisation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const CGUPage: React.FC = () => {
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
                            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-7 h-7 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Conditions Générales d'Utilisation</h1>
                                <p className="text-gray-400">Dernière mise à jour: 5 décembre 2024</p>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-blue max-w-none space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-white">1. Acceptation des Conditions</h2>
                                <p className="text-gray-400">
                                    En utilisant Nexal, vous acceptez ces conditions générales d'utilisation.
                                    Si vous n'êtes pas d'accord, veuillez ne pas utiliser nos services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">2. Description du Service</h2>
                                <p className="text-gray-400">
                                    Nexal est un service de création de CV assisté par intelligence artificielle.
                                    Nous fournissons des outils pour créer, éditer et exporter des CV professionnels.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">3. Propriété Intellectuelle</h2>
                                <p className="text-gray-400">
                                    Vous conservez la propriété de vos contenus. Nexal détient les droits sur ses
                                    templates, designs et technologies. L'utilisation commerciale de nos designs
                                    nécessite un abonnement actif.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">4. Abonnements et Paiements</h2>
                                <p className="text-gray-400">
                                    Les abonnements sont facturés mensuellement ou annuellement.
                                    Vous pouvez annuler à tout moment. Le remboursement est possible
                                    dans les 14 jours suivant l'achat.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">5. Limitations de Responsabilité</h2>
                                <p className="text-gray-400">
                                    Nexal ne garantit pas le succès de vos candidatures. Nous fournissons
                                    des outils pour optimiser votre CV, mais les résultats dépendent de
                                    nombreux facteurs indépendants de notre volonté.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">6. Droit Applicable</h2>
                                <p className="text-gray-400">
                                    Ces conditions sont régies par le droit suisse. Tout litige sera
                                    soumis aux tribunaux compétents du Canton de Genève.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-white">7. Contact</h2>
                                <p className="text-gray-400">
                                    Pour toute question relative à ces CGU:<br />
                                    Email: legal@nexal.ch<br />
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

export default CGUPage;

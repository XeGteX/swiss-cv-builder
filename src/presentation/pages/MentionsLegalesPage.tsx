/**
 * Mentions Légales Page - Document légal obligatoire pour site français
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale, Building, Server, User } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const MentionsLegalesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

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
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                <Scale className="w-7 h-7 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Mentions Légales</h1>
                                <p className="text-gray-400">Conformément à l'article 6 de la loi n° 2004-575</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-8">

                            {/* Éditeur */}
                            <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <User className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">1. Éditeur du site</h2>
                                </div>
                                <div className="space-y-3 text-gray-300">
                                    <p>
                                        Le site <strong className="text-white">nexal.io</strong> est édité par :
                                    </p>
                                    <div className="grid gap-2 text-sm mt-4">
                                        <div className="flex">
                                            <span className="text-gray-500 w-40">Nom :</span>
                                            <span className="text-white font-medium">BLOT Tanguy</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-gray-500 w-40">Statut :</span>
                                            <span>Micro-entrepreneur</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-gray-500 w-40">SIRET :</span>
                                            <span className="text-amber-400">En cours d'immatriculation</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-gray-500 w-40">Siège social :</span>
                                            <span>36 Place des Platanes, 69620 Saint Vérand, France</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-gray-500 w-40">Email :</span>
                                            <a href="mailto:contact@nexal.io" className="text-purple-400 hover:underline">contact@nexal.io</a>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Directeur de publication */}
                            <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <Building className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">2. Directeur de la publication</h2>
                                </div>
                                <p className="text-gray-300">
                                    Le directeur de la publication est <strong className="text-white">BLOT Tanguy</strong>,
                                    en qualité de représentant légal de l'entreprise.
                                </p>
                            </section>

                            {/* Hébergeur */}
                            <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <Server className="w-5 h-5 text-green-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">3. Hébergeur</h2>
                                </div>
                                <div className="space-y-2 text-gray-300">
                                    <p>Le site est hébergé par :</p>
                                    <div className="grid gap-2 text-sm mt-4">
                                        <div className="flex">
                                            <span className="text-gray-500 w-40">Raison sociale :</span>
                                            <span className="text-white font-medium">Vercel Inc.</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-gray-500 w-40">Adresse :</span>
                                            <span>340 S Lemon Ave #4133, Walnut, CA 91789, USA</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-gray-500 w-40">Site web :</span>
                                            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                                                vercel.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Propriété intellectuelle */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2 mb-4">
                                    4. Propriété intellectuelle
                                </h2>
                                <p className="text-gray-400">
                                    L'ensemble des contenus présents sur le site Nexal (textes, images, logos, graphismes,
                                    icônes, sons, logiciels, bases de données, etc.) est protégé par les lois françaises
                                    et internationales relatives à la propriété intellectuelle.
                                </p>
                                <p className="text-gray-400 mt-4">
                                    Toute reproduction, représentation, modification, publication, adaptation de tout ou
                                    partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite,
                                    sauf autorisation écrite préalable de BLOT Tanguy.
                                </p>
                            </section>

                            {/* Données personnelles */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2 mb-4">
                                    5. Protection des données personnelles
                                </h2>
                                <p className="text-gray-400">
                                    Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
                                    Informatique et Libertés du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès,
                                    de rectification, de suppression et d'opposition concernant vos données personnelles.
                                </p>
                                <p className="text-gray-400 mt-4">
                                    Pour plus d'informations sur la manière dont nous traitons vos données, veuillez consulter notre{' '}
                                    <a href="/confidentialite" className="text-purple-400 hover:underline">Politique de Confidentialité</a>.
                                </p>
                            </section>

                            {/* Cookies */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2 mb-4">
                                    6. Cookies
                                </h2>
                                <p className="text-gray-400">
                                    Le site Nexal utilise des cookies pour améliorer l'expérience utilisateur et
                                    analyser le trafic. Vous pouvez configurer votre navigateur pour refuser les cookies.
                                </p>
                            </section>

                            {/* Limitation de responsabilité */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2 mb-4">
                                    7. Limitation de responsabilité
                                </h2>
                                <p className="text-gray-400">
                                    L'éditeur s'efforce de fournir des informations aussi précises que possible.
                                    Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes
                                    et des carences dans la mise à jour, qu'elles soient de son fait ou du fait
                                    des tiers partenaires qui lui fournissent ces informations.
                                </p>
                            </section>

                            {/* Droit applicable */}
                            <section className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    8. Droit applicable et juridiction compétente
                                </h2>
                                <p className="text-gray-300">
                                    Les présentes mentions légales sont régies par le <strong className="text-white">droit français</strong>.
                                    En cas de litige, les tribunaux français seront seuls compétents.
                                </p>
                            </section>

                            {/* Date */}
                            <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800">
                                <p>Dernière mise à jour : 7 décembre 2024</p>
                            </div>

                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default MentionsLegalesPage;

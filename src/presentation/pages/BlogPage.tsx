/**
 * Blog Page - Articles et conseils carrière
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User } from 'lucide-react';

const articles = [
    { id: 1, title: '10 Erreurs Fatales à Éviter sur Votre CV', excerpt: 'Découvrez les pièges classiques qui font échouer les candidatures...', date: '5 Dec 2024', author: 'Marie L.', readTime: '5 min', category: 'CV Tips' },
    { id: 2, title: 'Comment l\'IA Révolutionne la Recherche d\'Emploi', excerpt: 'L\'intelligence artificielle transforme la façon dont nous cherchons du travail...', date: '3 Dec 2024', author: 'Thomas M.', readTime: '7 min', category: 'Tech' },
    { id: 3, title: 'Les Mots-Clés Qui Font la Différence', excerpt: 'Optimisez votre CV pour les systèmes ATS avec ces techniques...', date: '1 Dec 2024', author: 'Sophie D.', readTime: '4 min', category: 'ATS' },
    { id: 4, title: 'Lettre de Motivation: Le Guide Ultime', excerpt: 'Comment rédiger une lettre qui captive les recruteurs dès la première ligne...', date: '28 Nov 2024', author: 'Pierre B.', readTime: '8 min', category: 'Lettres' },
    { id: 5, title: 'LinkedIn: Votre CV Public', excerpt: 'Optimiser votre profil LinkedIn pour maximiser votre visibilité...', date: '25 Nov 2024', author: 'Julie R.', readTime: '6 min', category: 'LinkedIn' },
    { id: 6, title: 'Négocier Son Salaire: Stratégies Gagnantes', excerpt: 'Les techniques pour obtenir la rémunération que vous méritez...', date: '22 Nov 2024', author: 'Lucas P.', readTime: '9 min', category: 'Négociation' },
];

const BlogPage: React.FC = () => {
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
                    <motion.button onClick={() => navigate('/wizard')} whileHover={{ scale: 1.05 }} className="px-5 py-2 bg-purple-600 rounded-lg text-sm font-medium">
                        Créer mon CV
                    </motion.button>
                </div>
            </header>

            {/* Content */}
            <main className="pt-28 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                            Le <span className="text-purple-400">Blog</span> Nexal
                        </h1>
                        <p className="text-gray-400">Conseils, astuces et actualités pour booster votre carrière.</p>
                    </motion.div>

                    <div className="space-y-6">
                        {articles.map((article, idx) => (
                            <motion.article
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">{article.category}</span>
                                        <h2 className="text-xl font-semibold mt-3 mb-2 group-hover:text-purple-400 transition-colors">{article.title}</h2>
                                        <p className="text-gray-400 text-sm mb-4">{article.excerpt}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.author}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                                            <span>{article.date}</span>
                                        </div>
                                    </div>
                                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-violet-600/20 rounded-xl flex-shrink-0" />
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BlogPage;

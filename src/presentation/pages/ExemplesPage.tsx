/**
 * Exemples Page - Showcase de CV réels créés avec Nexal
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const exemples = [
    { id: 1, name: 'Marie Dupont', role: 'Product Manager', company: 'Ex-Google', score: 97 },
    { id: 2, name: 'Thomas Martin', role: 'Développeur Full Stack', company: 'Startup Tech', score: 94 },
    { id: 3, name: 'Sophie Laurent', role: 'Designer UX/UI', company: 'Agence Créative', score: 96 },
    { id: 4, name: 'Pierre Bernard', role: 'Directeur Commercial', company: 'PME Suisse', score: 92 },
    { id: 5, name: 'Julie Moreau', role: 'Data Scientist', company: 'FinTech', score: 98 },
    { id: 6, name: 'Lucas Petit', role: 'Chef de Projet', company: 'Conseil', score: 95 },
];

const ExemplesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/landing')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                        {t('exemples.back')}
                    </button>
                    <a href="/landing" className="flex items-center gap-2">
                        <img src="/nexal-logo.png" alt="Nexal" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold">Nexal</span>
                    </a>
                    <motion.button onClick={() => navigate('/wizard')} whileHover={{ scale: 1.05 }} className="px-5 py-2 bg-purple-600 rounded-lg text-sm font-medium">
                        {t('exemples.cta')}
                    </motion.button>
                </div>
            </header>

            {/* Content */}
            <main className="pt-28 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                            {t('exemples.title')} <span className="text-purple-400">{t('exemples.titleHighlight')}</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {t('exemples.subtitle')}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exemples.map((exemple, idx) => (
                            <motion.div
                                key={exemple.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
                            >
                                {/* CV Preview placeholder */}
                                <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-4 flex items-center justify-center">
                                    <div className="w-3/4 space-y-2 p-4">
                                        <div className="h-5 bg-purple-500/30 rounded w-1/2" />
                                        <div className="h-3 bg-gray-700 rounded w-full" />
                                        <div className="h-3 bg-gray-700 rounded w-3/4" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold">{exemple.name}</h3>
                                        <p className="text-sm text-gray-400">{exemple.role}</p>
                                        <p className="text-xs text-purple-400">{exemple.company}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-400">{exemple.score}%</div>
                                        <div className="text-xs text-gray-500">{t('exemples.atsScore')}</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center justify-center gap-2">
                                        <Eye className="w-4 h-4" /> {t('exemples.view')}
                                    </button>
                                    <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" /> {t('exemples.download')}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ExemplesPage;

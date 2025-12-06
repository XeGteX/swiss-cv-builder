/**
 * Guide CV Page - Guide complet pour créer un CV parfait
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

const sections = [
    {
        title: 'Structure du CV',
        icon: BookOpen,
        color: 'bg-blue-500/20 text-blue-400',
        tips: [
            'Limitez votre CV à 1-2 pages maximum',
            'Utilisez des sections clairement définies',
            'Placez les informations les plus importantes en haut',
            'Assurez-vous d\'une mise en page aérée et lisible'
        ]
    },
    {
        title: 'Ce qu\'il faut inclure',
        icon: CheckCircle,
        color: 'bg-green-500/20 text-green-400',
        tips: [
            'Coordonnées complètes et à jour',
            'Résumé professionnel percutant (2-3 lignes)',
            'Expériences professionnelles avec résultats chiffrés',
            'Formation et certifications pertinentes',
            'Compétences techniques et soft skills'
        ]
    },
    {
        title: 'Ce qu\'il faut éviter',
        icon: AlertTriangle,
        color: 'bg-red-500/20 text-red-400',
        tips: [
            'Photos non professionnelles',
            'Adresses email inappropriées',
            'Fautes d\'orthographe et de grammaire',
            'Informations obsolètes ou non pertinentes',
            'Mensonges ou exagérations'
        ]
    },
    {
        title: 'Optimisation ATS',
        icon: Lightbulb,
        color: 'bg-purple-500/20 text-purple-400',
        tips: [
            'Utilisez des mots-clés de l\'offre d\'emploi',
            'Évitez les tableaux et colonnes complexes',
            'Utilisez des polices standard (Arial, Calibri)',
            'Enregistrez en format PDF ou Word',
            'Nommez votre fichier de manière professionnelle'
        ]
    }
];

const GuideCVPage: React.FC = () => {
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
                            Guide <span className="text-purple-400">CV Parfait</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Tout ce que vous devez savoir pour créer un CV qui se démarque et passe les filtres ATS.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center`}>
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{section.title}</h2>
                                </div>

                                <ul className="space-y-3">
                                    {section.tips.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-gray-300">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-center"
                    >
                        <p className="text-gray-400 mb-4">Prêt à créer votre CV parfait ?</p>
                        <motion.button
                            onClick={() => navigate('/wizard')}
                            whileHover={{ scale: 1.05 }}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-lg"
                        >
                            Commencer maintenant
                        </motion.button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default GuideCVPage;

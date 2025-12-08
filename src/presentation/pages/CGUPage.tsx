/**
 * CGU Page - Conditions Générales d'Utilisation (Terms of Service)
 * Document légal complet pour SaaS
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const CGUPage: React.FC = () => {
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
                            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-7 h-7 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Conditions Générales d'Utilisation</h1>
                                <p className="text-gray-400">Dernière mise à jour : 7 décembre 2024</p>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-blue max-w-none space-y-8 text-gray-300">

                            {/* Introduction */}
                            <section>
                                <p className="text-gray-400 leading-relaxed">
                                    Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation du service <strong className="text-white">Nexal</strong>
                                    (ci-après "le Service"), édité par <strong className="text-white">[VOTRE NOM PRÉNOM]</strong>, Micro-entrepreneur immatriculé en France.
                                </p>
                                <p className="text-gray-400 leading-relaxed mt-4">
                                    En accédant au Service ou en créant un compte, vous acceptez d'être lié par ces CGU.
                                    Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le Service.
                                </p>
                            </section>

                            {/* 1. Description du Service */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">1. Description du Service</h2>
                                <p className="text-gray-400 mt-4">
                                    Nexal est une plateforme SaaS (Software as a Service) de création de CV assistée par intelligence artificielle. Le Service propose :
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                                    <li>Un éditeur de CV en ligne avec multiple templates professionnels</li>
                                    <li>Une assistance IA pour optimiser le contenu et la rédaction</li>
                                    <li>Une analyse de compatibilité ATS (Applicant Tracking System)</li>
                                    <li>L'export en formats PDF et autres formats standards</li>
                                    <li>Un hébergement optionnel de CV en ligne (URL personnalisée)</li>
                                </ul>
                            </section>

                            {/* 2. Création de compte */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">2. Création de Compte</h2>
                                <h3 className="text-lg font-medium text-blue-400 mt-6">2.1 Éligibilité</h3>
                                <p className="text-gray-400 mt-2">
                                    Vous devez être âgé d'au moins 16 ans pour utiliser le Service. En créant un compte, vous déclarez avoir la capacité juridique
                                    pour conclure un contrat.
                                </p>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">2.2 Informations exactes</h3>
                                <p className="text-gray-400 mt-2">
                                    Vous vous engagez à fournir des informations exactes et à les maintenir à jour.
                                    Les informations figurant sur votre CV sont de votre entière responsabilité.
                                </p>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">2.3 Sécurité du compte</h3>
                                <p className="text-gray-400 mt-2">
                                    Vous êtes responsable de la confidentialité de vos identifiants de connexion.
                                    Toute activité effectuée depuis votre compte est réputée avoir été effectuée par vous.
                                </p>
                            </section>

                            {/* 3. Abonnements et Paiements */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">3. Abonnements et Paiements</h2>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">3.1 Offres disponibles</h3>
                                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-4">
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Offre Gratuite (Sprint)</strong> : Accès limité aux fonctionnalités de base.</li>
                                        <li><strong className="text-white">Offre Premium (Campagne)</strong> : Abonnement mensuel avec accès complet.</li>
                                        <li><strong className="text-white">Offre Pro</strong> : Abonnement mensuel avec fonctionnalités avancées et support prioritaire.</li>
                                    </ul>
                                </div>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">3.2 Facturation</h3>
                                <p className="text-gray-400 mt-2">
                                    Les abonnements sont facturés par avance, mensuellement ou annuellement selon l'offre choisie.
                                    Les paiements sont traités par <strong className="text-white">Stripe</strong>, notre prestataire de paiement sécurisé.
                                </p>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">3.3 Renouvellement automatique</h3>
                                <p className="text-gray-400 mt-2">
                                    Les abonnements sont renouvelés automatiquement à la fin de chaque période.
                                    Vous pouvez annuler à tout moment depuis les paramètres de votre compte.
                                </p>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">3.4 Droit de rétractation</h3>
                                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mt-4">
                                    <p className="text-green-300 font-medium">✓ Garantie satisfait ou remboursé</p>
                                    <p className="text-gray-400 mt-2">
                                        Conformément au droit européen, vous disposez d'un délai de <strong className="text-white">14 jours</strong> à compter de la souscription
                                        pour demander un remboursement intégral, sans justification.
                                    </p>
                                </div>
                            </section>

                            {/* 4. Propriété Intellectuelle */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">4. Propriété Intellectuelle</h2>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">4.1 Vos contenus</h3>
                                <p className="text-gray-400 mt-2">
                                    Vous conservez l'intégralité des droits de propriété intellectuelle sur le contenu de votre CV
                                    (textes, descriptions, expériences). Nous ne revendiquons aucun droit sur vos données personnelles ou professionnelles.
                                </p>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">4.2 Notre propriété</h3>
                                <p className="text-gray-400 mt-2">
                                    Nexal conserve tous les droits sur :
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
                                    <li>Les templates et designs de CV</li>
                                    <li>Le code source, l'interface et l'expérience utilisateur</li>
                                    <li>Les algorithmes d'optimisation et d'analyse ATS</li>
                                    <li>La marque Nexal, logos et éléments graphiques</li>
                                </ul>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">4.3 Licence d'utilisation</h3>
                                <p className="text-gray-400 mt-2">
                                    Nous vous accordons une licence personnelle, non-exclusive et révocable pour utiliser les templates
                                    dans le cadre de la création de vos CV. Cette licence cesse en cas de résiliation de votre abonnement.
                                </p>
                            </section>

                            {/* 5. Utilisation de l'IA */}
                            <section className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <span className="text-2xl">🤖</span> 5. Utilisation de l'Intelligence Artificielle
                                </h2>
                                <p className="text-gray-300 mt-4">
                                    En utilisant les fonctionnalités d'IA de Nexal, vous acceptez que :
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-400 mt-4">
                                    <li>Le contenu de votre CV soit traité par des modèles de langage (LLM) tiers pour générer des suggestions.</li>
                                    <li>Les suggestions générées par l'IA sont des <strong className="text-white">propositions</strong> que vous êtes libre d'accepter, modifier ou rejeter.</li>
                                    <li>Vous restez <strong className="text-purple-400">seul responsable</strong> du contenu final de votre CV.</li>
                                    <li>L'IA peut parfois produire des résultats inexacts ou inappropriés - vérifiez toujours le contenu généré.</li>
                                </ul>
                            </section>

                            {/* 6. Comportement de l'utilisateur */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">6. Règles d'Utilisation</h2>
                                <p className="text-gray-400 mt-4">En utilisant le Service, vous vous engagez à ne pas :</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                                    <li>Fournir de fausses informations ou usurper l'identité d'autrui</li>
                                    <li>Utiliser le Service à des fins frauduleuses ou illégales</li>
                                    <li>Tenter d'accéder à des fonctionnalités ou données non autorisées</li>
                                    <li>Partager vos identifiants ou revendre l'accès au Service</li>
                                    <li>Extraire massivement des données (scraping) ou surcharger nos serveurs</li>
                                    <li>Publier du contenu diffamatoire, discriminatoire ou offensant via les profils publics</li>
                                </ul>
                                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mt-4">
                                    <p className="text-red-300 font-medium">⚠️ Violation des règles</p>
                                    <p className="text-gray-400 mt-2">
                                        Tout manquement à ces règles peut entraîner la suspension ou suppression de votre compte sans préavis ni remboursement.
                                    </p>
                                </div>
                            </section>

                            {/* 7. Limitation de responsabilité */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">7. Limitation de Responsabilité</h2>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">7.1 Aucune garantie de résultat</h3>
                                <p className="text-gray-400 mt-2">
                                    Nexal est un outil d'aide à la création de CV. <strong className="text-white">Nous ne garantissons pas</strong> que l'utilisation
                                    de notre Service vous permettra d'obtenir un emploi, un entretien ou tout autre résultat professionnel.
                                </p>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">7.2 Disponibilité du Service</h3>
                                <p className="text-gray-400 mt-2">
                                    Nous nous efforçons d'assurer une disponibilité maximale, mais ne pouvons garantir un accès ininterrompu.
                                    Des maintenances ou incidents techniques peuvent survenir.
                                </p>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">7.3 Plafond de responsabilité</h3>
                                <p className="text-gray-400 mt-2">
                                    En cas de litige, notre responsabilité est limitée au montant des sommes effectivement versées par vous
                                    au cours des 12 derniers mois.
                                </p>
                            </section>

                            {/* 8. Résiliation */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">8. Résiliation</h2>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">8.1 Par l'utilisateur</h3>
                                <p className="text-gray-400 mt-2">
                                    Vous pouvez supprimer votre compte à tout moment depuis les paramètres. La suppression entraîne
                                    la destruction de toutes vos données dans un délai de 30 jours.
                                </p>

                                <h3 className="text-lg font-medium text-blue-400 mt-6">8.2 Par Nexal</h3>
                                <p className="text-gray-400 mt-2">
                                    Nous pouvons suspendre ou résilier votre accès en cas de violation des présentes CGU,
                                    de non-paiement, ou si cela s'avère nécessaire pour des raisons légales ou de sécurité.
                                </p>
                            </section>

                            {/* 9. Modifications des CGU */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">9. Modifications des CGU</h2>
                                <p className="text-gray-400 mt-4">
                                    Nous nous réservons le droit de modifier ces CGU à tout moment. En cas de modification substantielle,
                                    vous serez notifié par email ou via l'application au moins 30 jours avant l'entrée en vigueur des nouvelles conditions.
                                </p>
                                <p className="text-gray-400 mt-4">
                                    La poursuite de l'utilisation du Service après cette date vaut acceptation des nouvelles CGU.
                                </p>
                            </section>

                            {/* 10. Droit applicable */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">10. Droit Applicable et Litiges</h2>
                                <p className="text-gray-400 mt-4">
                                    Les présentes CGU sont régies par le <strong className="text-white">droit français</strong>.
                                </p>
                                <p className="text-gray-400 mt-4">
                                    En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut,
                                    les tribunaux français seront seuls compétents.
                                </p>
                                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-4">
                                    <p className="text-gray-400 text-sm">
                                        <strong className="text-white">Médiation consommateur :</strong> Conformément aux articles L.616-1 et R.616-1 du Code de la consommation,
                                        vous pouvez recourir gratuitement au service de médiation FEVAD (Fédération du e-commerce et de la vente à distance) :
                                        <a href="https://www.mediateurfevad.fr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">www.mediateurfevad.fr</a>
                                    </p>
                                </div>
                            </section>

                            {/* 11. Contact */}
                            <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white">11. Contact</h2>
                                <p className="text-gray-400 mt-4">
                                    Pour toute question relative aux présentes CGU :
                                </p>
                                <div className="mt-4 space-y-2 text-gray-300">
                                    <p><strong>Email :</strong> <a href="mailto:contact@nexal.io" className="text-blue-400 hover:underline">contact@nexal.io</a></p>
                                    <p><strong>Éditeur :</strong> [VOTRE NOM PRÉNOM]</p>
                                    <p><strong>Statut :</strong> Micro-entrepreneur immatriculé en France</p>
                                    <p><strong>SIRET :</strong> [VOTRE NUMÉRO SIRET]</p>
                                </div>
                            </section>

                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default CGUPage;


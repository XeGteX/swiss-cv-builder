/**
 * Politique de Confidentialité - Document légal complet RGPD/CCPA
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const ConfidentialitePage: React.FC = () => {
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
                            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Shield className="w-7 h-7 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
                                <p className="text-gray-400">Dernière mise à jour : 7 décembre 2024</p>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-purple max-w-none space-y-8 text-gray-300">

                            {/* Introduction */}
                            <section>
                                <p className="text-gray-400 leading-relaxed">
                                    La présente Politique de Confidentialité décrit la manière dont <strong className="text-white">Nexal</strong> (ci-après "nous", "notre" ou "le Service"),
                                    opéré par <strong className="text-white">BLOT Tanguy</strong>, Micro-entrepreneur immatriculé en France,
                                    collecte, utilise, partage et protège vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD - UE 2016/679)
                                    et au California Consumer Privacy Act (CCPA).
                                </p>
                                <p className="text-gray-400 leading-relaxed mt-4">
                                    En utilisant Nexal, vous acceptez les pratiques décrites dans cette politique. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser notre Service.
                                </p>
                            </section>

                            {/* 1. Collecte des données */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">1. Données Collectées</h2>

                                <h3 className="text-lg font-medium text-purple-400 mt-6">1.1 Données d'identité</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-400">
                                    <li>Nom et prénom</li>
                                    <li>Adresse email</li>
                                    <li>Numéro de téléphone (optionnel)</li>
                                    <li>Photographie de profil (optionnelle)</li>
                                </ul>

                                <h3 className="text-lg font-medium text-purple-400 mt-6">1.2 Données professionnelles</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-400">
                                    <li>Expériences professionnelles (postes, entreprises, dates, descriptions)</li>
                                    <li>Formation et diplômes</li>
                                    <li>Compétences techniques et personnelles</li>
                                    <li>Langues parlées</li>
                                    <li>Certifications et récompenses</li>
                                </ul>

                                <h3 className="text-lg font-medium text-purple-400 mt-6">1.3 Données techniques</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-400">
                                    <li>Adresse IP</li>
                                    <li>Logs de connexion et d'activité</li>
                                    <li>Cookies de session et préférences</li>
                                    <li>Type de navigateur et système d'exploitation</li>
                                </ul>
                            </section>

                            {/* 2. Utilisation des données */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">2. Utilisation des Données</h2>
                                <p className="text-gray-400 mt-4">Vos données sont utilisées exclusivement pour :</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                                    <li><strong className="text-white">Fourniture du Service</strong> : Création, édition et génération de votre CV.</li>
                                    <li><strong className="text-white">Amélioration par IA</strong> : Traitement de votre contenu par des modèles d'intelligence artificielle pour optimiser la rédaction (voir section 5).</li>
                                    <li><strong className="text-white">Hébergement de profil</strong> : Si activé, publication de votre CV sur une URL personnalisée.</li>
                                    <li><strong className="text-white">Communication</strong> : Notifications liées à votre compte, mises à jour du service, support client.</li>
                                    <li><strong className="text-white">Analyse et amélioration</strong> : Statistiques d'utilisation anonymisées pour améliorer le Service.</li>
                                </ul>
                            </section>

                            {/* 3. Partage des données */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">3. Partage et Sous-Traitants</h2>
                                <p className="text-gray-400 mt-4">
                                    Nous ne vendons jamais vos données personnelles. Cependant, pour opérer le Service, nous faisons appel aux sous-traitants suivants :
                                </p>

                                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-4">
                                    <h4 className="font-semibold text-white">Hébergement & Infrastructure</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2 text-sm">
                                        <li><strong>Vercel Inc.</strong> (USA/Global) - Hébergement de l'application web</li>
                                        <li><strong>Supabase Inc.</strong> (AWS, Europe/USA) - Base de données et authentification</li>
                                    </ul>
                                </div>

                                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-4">
                                    <h4 className="font-semibold text-white">Paiement</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2 text-sm">
                                        <li><strong>Stripe Inc.</strong> - Traitement des paiements. <em>Nous ne stockons aucune donnée bancaire ou de carte de crédit.</em></li>
                                    </ul>
                                </div>

                                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-4">
                                    <h4 className="font-semibold text-white">Intelligence Artificielle</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2 text-sm">
                                        <li><strong>OpenAI</strong>, <strong>Anthropic</strong>, <strong>Google</strong> - Traitement du contenu pour amélioration (voir section 5)</li>
                                    </ul>
                                </div>
                            </section>

                            {/* 4. Transferts internationaux */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">4. Transferts Internationaux</h2>
                                <p className="text-gray-400 mt-4">
                                    Certains de nos sous-traitants opèrent aux États-Unis. Ces transferts sont encadrés par les mécanismes légaux appropriés
                                    (Clauses Contractuelles Types de la Commission Européenne, certification DPF pour les entreprises américaines concernées).
                                </p>
                            </section>

                            {/* 5. Utilisation de l'IA */}
                            <section className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <span className="text-2xl">🤖</span> 5. Utilisation de l'Intelligence Artificielle
                                </h2>
                                <p className="text-gray-300 mt-4">
                                    Nexal utilise des modèles de langage (LLM) pour vous aider à améliorer le contenu de votre CV. Voici comment cela fonctionne :
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-400 mt-4">
                                    <li><strong className="text-white">Traitement</strong> : Le texte de vos expériences et compétences est envoyé à des API tierces (OpenAI, Anthropic, Google) pour générer des suggestions d'amélioration.</li>
                                    <li><strong className="text-white">Pas d'entraînement</strong> : Vos données ne sont <strong className="text-purple-400">jamais utilisées pour entraîner</strong> les modèles d'IA. Nous utilisons des endpoints API avec politique "Zero Data Retention" lorsque disponible.</li>
                                    <li><strong className="text-white">Contrôle</strong> : Vous décidez toujours d'accepter ou de rejeter les suggestions générées par l'IA.</li>
                                </ul>
                            </section>

                            {/* 6. Profil Public */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">6. Profil Public et Partage</h2>
                                <p className="text-gray-400 mt-4">
                                    Nexal vous permet de partager votre CV via une URL personnalisée (ex: nexal.io/cv/votre-nom).
                                </p>
                                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mt-4">
                                    <p className="text-yellow-300 font-medium">⚠️ Important</p>
                                    <p className="text-gray-400 mt-2">
                                        En activant le partage public, vous reconnaissez que les informations contenues dans votre CV deviennent
                                        <strong className="text-white"> accessibles à toute personne disposant du lien</strong>.
                                        Vous pouvez désactiver le partage à tout moment depuis vos paramètres.
                                    </p>
                                </div>
                            </section>

                            {/* 7. Sécurité */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">7. Sécurité des Données</h2>
                                <p className="text-gray-400 mt-4">Nous mettons en œuvre des mesures de sécurité robustes pour protéger vos données :</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                                    <li><strong className="text-white">Chiffrement en transit</strong> : Toutes les communications sont protégées par SSL/TLS (HTTPS).</li>
                                    <li><strong className="text-white">Chiffrement au repos</strong> : Les bases de données sont chiffrées (AES-256).</li>
                                    <li><strong className="text-white">Authentification sécurisée</strong> : Mots de passe hachés (bcrypt), option 2FA disponible.</li>
                                    <li><strong className="text-white">Accès limités</strong> : Seul le personnel autorisé a accès aux systèmes de production.</li>
                                </ul>
                            </section>

                            {/* 8. Conservation */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">8. Durée de Conservation</h2>
                                <ul className="list-disc list-inside space-y-2 text-gray-400 mt-4">
                                    <li><strong className="text-white">Données de compte</strong> : Conservées tant que votre compte est actif, puis supprimées dans les 30 jours suivant la clôture.</li>
                                    <li><strong className="text-white">Logs techniques</strong> : Conservés 12 mois maximum à des fins de sécurité et de débogage.</li>
                                    <li><strong className="text-white">Données de paiement</strong> : Conservées par Stripe selon leur propre politique (obligations légales fiscales).</li>
                                </ul>
                            </section>

                            {/* 9. Droits des utilisateurs */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">9. Vos Droits (RGPD & CCPA)</h2>
                                <p className="text-gray-400 mt-4">Conformément à la réglementation applicable, vous disposez des droits suivants :</p>

                                <div className="grid gap-4 mt-4">
                                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                                        <h4 className="font-semibold text-green-400">✓ Droit d'accès</h4>
                                        <p className="text-gray-400 text-sm mt-1">Obtenir une copie de toutes les données que nous détenons sur vous.</p>
                                    </div>
                                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-400">✓ Droit de rectification</h4>
                                        <p className="text-gray-400 text-sm mt-1">Corriger les données inexactes ou incomplètes directement depuis votre compte.</p>
                                    </div>
                                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                                        <h4 className="font-semibold text-red-400">✓ Droit à l'effacement ("Droit à l'oubli")</h4>
                                        <p className="text-gray-400 text-sm mt-1">Demander la suppression complète de votre compte et de toutes les données associées.</p>
                                    </div>
                                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                                        <h4 className="font-semibold text-purple-400">✓ Droit à la portabilité</h4>
                                        <p className="text-gray-400 text-sm mt-1">Exporter vos données dans un format structuré (PDF, JSON) depuis l'application.</p>
                                    </div>
                                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                                        <h4 className="font-semibold text-yellow-400">✓ Droit d'opposition</h4>
                                        <p className="text-gray-400 text-sm mt-1">Vous opposer à certains traitements (marketing, profilage).</p>
                                    </div>
                                </div>

                                <p className="text-gray-400 mt-6">
                                    Pour exercer ces droits, contactez-nous à <a href="mailto:contact@nexal.io" className="text-purple-400 hover:underline">contact@nexal.io</a>.
                                    Nous répondrons dans un délai de 30 jours.
                                </p>
                            </section>

                            {/* 10. Cookies */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">10. Cookies</h2>
                                <p className="text-gray-400 mt-4">Nous utilisons les cookies suivants :</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                                    <li><strong className="text-white">Cookies essentiels</strong> : Session utilisateur, authentification (obligatoires).</li>
                                    <li><strong className="text-white">Cookies de préférences</strong> : Langue, thème, paramètres d'affichage.</li>
                                    <li><strong className="text-white">Cookies analytiques</strong> : Statistiques d'utilisation anonymisées (si consentement donné).</li>
                                </ul>
                                <p className="text-gray-400 mt-4">
                                    Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur.
                                </p>
                            </section>

                            {/* 11. Modifications */}
                            <section>
                                <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">11. Modifications de cette Politique</h2>
                                <p className="text-gray-400 mt-4">
                                    Nous pouvons mettre à jour cette politique pour refléter des changements dans nos pratiques ou pour des raisons légales.
                                    En cas de modification substantielle, nous vous en informerons par email ou via une notification dans l'application.
                                </p>
                            </section>

                            {/* 12. Contact */}
                            <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white">12. Contact</h2>
                                <p className="text-gray-400 mt-4">
                                    Pour toute question concernant cette politique ou vos données personnelles, contactez notre Délégué à la Protection des Données :
                                </p>
                                <div className="mt-4 space-y-2 text-gray-300">
                                    <p><strong>Email :</strong> <a href="mailto:contact@nexal.io" className="text-purple-400 hover:underline">contact@nexal.io</a></p>
                                    <p><strong>Responsable :</strong> BLOT Tanguy</p>
                                    <p><strong>Statut :</strong> Micro-entrepreneur immatriculé en France</p>
                                </div>
                                <p className="text-gray-400 mt-4 text-sm">
                                    Vous avez également le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés)
                                    si vous estimez que vos droits ne sont pas respectés.
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


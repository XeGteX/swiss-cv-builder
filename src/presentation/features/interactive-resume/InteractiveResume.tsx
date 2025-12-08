/**
 * SCV .NEX VIEWER - The Future of Career Presentation
 * 
 * "Le PDF affirme, le SCV prouve."
 * 
 * This is the official viewer for the .nex format - a revolutionary
 * Smart CV that transforms static resumes into living Career Dashboards.
 * 
 * Features:
 * - .nex Certification Badge
 * - Avatar Video Circle
 * - Deep Dive with Proof Hub
 * - Recruiter Bridge Dock
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useCVStore } from '../../../application/store/cv-store';
import { useToastStore } from '../../../application/store/toast-store';
import { uploadMedia, validateFile } from '../../../application/services/MediaService';
import {
    ArrowLeft, Shield, Calendar, Link2, ChevronDown, TrendingUp,
    Code2, Image, CheckCircle, Download, Video, Volume2, VolumeX,
    MapPin, Mail, Linkedin, Loader2, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useMediaQuery';

// ===================== TYPES =====================
interface ProofItem {
    type: 'image' | 'metric' | 'link';
    label: string;
    value: string;
    icon?: React.ReactNode;
}

// ===================== HERO AURORA BACKGROUND =====================
const AuroraBackground: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e]" />

        {/* Aurora layers */}
        <motion.div
            animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-gradient-to-br from-violet-600/30 via-purple-500/20 to-transparent rounded-full blur-[120px]"
        />
        <motion.div
            animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.15, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-blue-500/15 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
            animate={{
                opacity: [0.15, 0.35, 0.15],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-gradient-to-r from-fuchsia-500/10 via-violet-500/20 to-purple-500/10 rounded-full blur-[150px]"
        />

        {/* Grid overlay */}
        <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
            }}
        />
    </div>
);

// ===================== NEX BADGE =====================
const NexBadge: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
    >
        <motion.div
            animate={{
                boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.5)',
                    '0 0 20px rgba(139, 92, 246, 0.3)'
                ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/40 rounded-full"
        >
            <Shield size={14} className="text-violet-400" />
            <span className="text-xs font-bold text-violet-300">.nex certifié</span>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        </motion.div>
    </motion.div>
);

// ===================== AVATAR VIDEO CIRCLE =====================
interface AvatarVideoCircleProps {
    photoUrl?: string;
    onAvatarChange?: (url: string) => void;
}

const AvatarVideoCircle: React.FC<AvatarVideoCircleProps> = ({ photoUrl, onAvatarChange }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToastStore();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate before upload
        const validation = validateFile(file);
        if (!validation.valid) {
            addToast(validation.error || 'Fichier invalide', 'error');
            return;
        }

        setIsUploading(true);

        try {
            const result = await uploadMedia(file, 'avatars');

            if (result.success && result.url) {
                addToast('Avatar mis à jour avec succès !', 'success');
                onAvatarChange?.(result.url);
            } else {
                addToast(result.error || 'Erreur lors de l\'upload', 'error');
            }
        } catch (err) {
            addToast('Erreur réseau. Réessayez.', 'error');
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <motion.div
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleClick}
            className="relative cursor-pointer group"
        >
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,video/mp4,video/quicktime"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Glow ring */}
            <motion.div
                animate={{
                    scale: isHovered ? 1.1 : 1,
                    opacity: isHovered ? 0.8 : 0.4,
                }}
                className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full blur-md"
            />

            {/* Avatar container */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-violet-400/50">
                {photoUrl ? (
                    <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                        <Video size={24} className="text-white/60" />
                    </div>
                )}

                {/* Upload spinner overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 size={24} className="text-violet-400 animate-spin" />
                    </div>
                )}

                {/* Hover overlay (only when not uploading) */}
                <AnimatePresence>
                    {isHovered && !isUploading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1"
                        >
                            <Upload size={18} className="text-white" />
                            <span className="text-[8px] text-white/80 font-medium">UPLOAD</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sound toggle */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 border border-white/20 rounded-full hover:bg-slate-800 transition-colors"
            >
                {isMuted ? <VolumeX size={10} className="text-slate-400" /> : <Volume2 size={10} className="text-violet-400" />}
            </button>

            {/* Live indicator */}
            <div className="absolute -top-1 -right-1 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500 rounded-full">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-white">LIVE</span>
            </div>
        </motion.div>
    );
};

// ===================== PROOF HUB (Deep Dive) =====================
interface ProofHubProps {
    experience: {
        role?: string;
        company?: string;
        dates?: string;
        tasks?: string[];
    };
    isOpen: boolean;
}

const ProofHub: React.FC<ProofHubProps> = ({ experience, isOpen }) => {
    // SMART EXTRACTION: Derive tech stack from tasks/description
    const extractTechStack = (tasks: string[] = []): string[] => {
        const techKeywords = [
            'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java',
            'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP',
            'Docker', 'Kubernetes', 'GraphQL', 'REST', 'API', 'Next.js', 'Vue',
            'Angular', 'Express', 'Django', 'Flask', 'Spring', 'C#', '.NET',
            'Git', 'CI/CD', 'Jest', 'Cypress', 'Tailwind', 'CSS', 'HTML',
            'Figma', 'Stripe', 'PayPal', 'Agile', 'Scrum', 'TDD', 'AI', 'ML'
        ];

        const foundTech = new Set<string>();
        const allText = tasks.join(' ').toLowerCase();

        techKeywords.forEach(tech => {
            if (allText.includes(tech.toLowerCase())) {
                foundTech.add(tech);
            }
        });

        // Return found techs or default fallback
        return foundTech.size > 0 ? Array.from(foundTech).slice(0, 6) : ['Tech', 'Stack', 'TBD'];
    };

    // Generate pseudo-metrics from experience data
    const taskCount = experience.tasks?.length || 0;
    const mockProofs: ProofItem[] = [
        { type: 'metric', label: 'Impact', value: taskCount > 3 ? '+45%' : '+' + (15 + taskCount * 8) + '%', icon: <TrendingUp size={14} /> },
        { type: 'metric', label: 'Réalisations', value: String(Math.max(taskCount, 3)), icon: <CheckCircle size={14} /> },
        { type: 'metric', label: 'Technologies', value: String(extractTechStack(experience.tasks).length), icon: <Code2 size={14} /> },
    ];

    const techStack = extractTechStack(experience.tasks);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    <div className="pt-4 mt-4 border-t border-white/10">
                        {/* Proof Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-violet-500/20 rounded-lg">
                                <Shield size={14} className="text-violet-400" />
                            </div>
                            <span className="text-xs font-semibold text-violet-400">PROOF OF WORK</span>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {mockProofs.map((proof, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-3 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 text-center"
                                >
                                    <div className="flex justify-center mb-2 text-emerald-400">
                                        {proof.icon}
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0.5 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: idx * 0.1 + 0.2 }}
                                        className="text-lg font-bold text-white"
                                    >
                                        {proof.value}
                                    </motion.div>
                                    <div className="text-[10px] text-slate-500">{proof.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Tech Stack */}
                        <div className="mb-4">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Stack Technique</div>
                            <div className="flex flex-wrap gap-2">
                                {techStack.map((tech, idx) => (
                                    <motion.span
                                        key={tech}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-xs text-cyan-400"
                                    >
                                        {tech}
                                    </motion.span>
                                ))}
                            </div>
                        </div>

                        {/* Project Gallery Placeholder */}
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="aspect-video bg-gradient-to-br from-white/5 to-white/[0.02] rounded-lg border border-white/10 flex items-center justify-center cursor-pointer hover:border-violet-500/50 transition-colors"
                                >
                                    <Image size={16} className="text-slate-600" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ===================== RECRUITER BRIDGE DOCK =====================
const RecruiterBridgeDock: React.FC = () => {
    const isMobile = useIsMobile();

    const actions = [
        { icon: <Download size={isMobile ? 14 : 18} />, label: 'PDF', sublabel: 'ATS', color: 'from-blue-500 to-cyan-500' },
        { icon: <Calendar size={isMobile ? 14 : 18} />, label: 'RDV', sublabel: 'Entretien', color: 'from-emerald-500 to-teal-500' },
        { icon: <Link2 size={isMobile ? 14 : 18} />, label: 'Certif', sublabel: 'Vérifié ✓', color: 'from-violet-500 to-purple-500' },
        { icon: <Linkedin size={isMobile ? 14 : 18} />, label: 'LinkedIn', sublabel: 'Profil', color: 'from-blue-600 to-blue-500' },
    ];

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className={`fixed ${isMobile ? 'bottom-4 left-2 right-2' : 'bottom-6 left-1/2 -translate-x-1/2'} z-50`}
        >
            {/* Glassmorphism container */}
            <div className={`flex items-center justify-center gap-1 md:gap-2 ${isMobile ? 'p-1.5' : 'p-2'} bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50`}>
                {actions.map((action, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={isMobile ? {} : { scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className={`group relative flex flex-col items-center ${isMobile ? 'p-2' : 'p-3'} rounded-xl hover:bg-white/5 transition-colors flex-1`}
                    >
                        <div className={`${isMobile ? 'p-1.5' : 'p-2.5'} bg-gradient-to-br ${action.color} rounded-xl mb-1 group-hover:shadow-lg transition-shadow`}>
                            {action.icon}
                        </div>
                        <span className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} font-medium text-white`}>{action.label}</span>
                        {!isMobile && <span className="text-[8px] text-slate-500">{action.sublabel}</span>}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

// ===================== MAIN COMPONENT =====================
export const InteractiveResume: React.FC = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const { profile, updatePersonal } = useCVStore();
    const [expandedExp, setExpandedExp] = useState<number | null>(null);
    const isMobile = useIsMobile();

    // Parallax
    const { scrollYProgress } = useScroll({ container: containerRef });
    const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);

    const toggleExperience = (idx: number) => {
        setExpandedExp(expandedExp === idx ? null : idx);
    };

    // Save avatar URL to store
    const handleAvatarChange = (url: string) => {
        updatePersonal({ photoUrl: url });
    };

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <AuroraBackground />

            {/* ===== IDENTITY HEADER ===== */}
            <motion.header
                style={{ opacity: headerOpacity }}
                className={`relative z-20 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm ${isMobile ? 'flex-wrap gap-2' : ''}`}
            >
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={isMobile ? 18 : 20} />
                    </button>
                    <NexBadge />
                    {!isMobile && (
                        <>
                            <div className="h-4 w-px bg-white/20" />
                            <span className="text-xs text-slate-500 font-mono">SCV Protocol v1.0</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-2 md:px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-[10px] md:text-xs font-semibold text-white transition-colors ${isMobile ? 'hidden' : ''}`}
                    >
                        Ouvrir .nex
                    </motion.button>
                </div>
            </motion.header>

            {/* ===== MAIN CANVAS ===== */}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-y-auto custom-scrollbar z-10"
            >
                <div className={`max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6 ${isMobile ? 'pb-40' : 'pb-32'}`}>

                    {/* ===== HERO SECTION ===== */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'} gap-6 md:gap-8 mb-12 md:mb-16`}
                    >
                        <AvatarVideoCircle
                            photoUrl={profile.personal?.photoUrl}
                            onAvatarChange={handleAvatarChange}
                        />

                        <div className={`${isMobile ? '' : 'flex-1'}`}>
                            <motion.h1
                                className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black text-white mb-2`}
                                animate={{
                                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    background: 'linear-gradient(90deg, white, #a78bfa, white)',
                                    backgroundSize: '200% 100%',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {profile.personal?.firstName} {profile.personal?.lastName}
                            </motion.h1>
                            <p className="text-lg text-violet-300 mb-3">
                                {profile.personal?.title || 'Professional Title'}
                            </p>

                            {/* Contact Row */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                {profile.personal?.contact?.address && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} /> {profile.personal.contact.address}
                                    </span>
                                )}
                                {profile.personal?.contact?.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail size={12} /> {profile.personal.contact.email}
                                    </span>
                                )}
                            </div>

                            {/* Status Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full"
                            >
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-xs text-emerald-400 font-medium">Open to opportunities</span>
                            </motion.div>
                        </div>
                    </motion.section>

                    {/* ===== SUMMARY ===== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm">
                            <h2 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-3">Executive Summary</h2>
                            <p className="text-slate-300 leading-relaxed">
                                {profile.summary || 'Votre résumé professionnel apparaîtra ici. Ceci est une démonstration du format SCV .nex - le futur de la présentation de carrière.'}
                            </p>
                        </div>
                    </motion.section>

                    {/* ===== DEEP DIVE TIMELINE ===== */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-white">Deep Dive</h2>
                            <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] font-bold rounded-full">
                                PROOF OF WORK
                            </span>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-8">
                            {/* Vertical Line */}
                            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-violet-500/50 to-transparent" />

                            <div className="space-y-6">
                                {(profile.experiences || []).map((exp, idx) => (
                                    <motion.div
                                        key={exp.id || idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        {/* Timeline dot */}
                                        <div className="absolute left-1 w-5 h-5 bg-violet-600 rounded-full border-4 border-slate-900 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>

                                        {/* Experience Card */}
                                        <motion.div
                                            whileHover={{ x: 5 }}
                                            onClick={() => toggleExperience(idx)}
                                            className={`p-5 rounded-xl border cursor-pointer transition-all ${expandedExp === idx
                                                ? 'bg-violet-500/10 border-violet-500/40'
                                                : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-white text-lg">{exp.role || 'Position'}</h3>
                                                    <p className="text-violet-400">{exp.company || 'Company'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-500">{exp.dates || 'Dates'}</span>
                                                    <motion.div
                                                        animate={{ rotate: expandedExp === idx ? 180 : 0 }}
                                                        className="text-slate-400"
                                                    >
                                                        <ChevronDown size={18} />
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Tasks preview */}
                                            {exp.tasks && exp.tasks.length > 0 && !expandedExp && (
                                                <p className="text-sm text-slate-500 line-clamp-2">
                                                    {exp.tasks[0]}
                                                </p>
                                            )}

                                            {/* Click to expand hint */}
                                            {expandedExp !== idx && (
                                                <div className="flex items-center gap-2 mt-3 text-xs text-violet-400">
                                                    <Shield size={12} />
                                                    <span>Cliquez pour voir les preuves</span>
                                                </div>
                                            )}

                                            {/* Proof Hub */}
                                            <ProofHub experience={exp} isOpen={expandedExp === idx} />
                                        </motion.div>
                                    </motion.div>
                                ))}

                                {(!profile.experiences || profile.experiences.length === 0) && (
                                    <div className="p-8 border-2 border-dashed border-white/10 rounded-xl text-center">
                                        <p className="text-slate-500">Aucune expérience ajoutée</p>
                                        <p className="text-slate-600 text-sm mt-1">Ajoutez des expériences dans l'éditeur principal</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.section>

                    {/* ===== SKILLS MATRIX ===== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Skills Matrix</h2>
                        <div className="flex flex-wrap gap-3">
                            {(profile.skills || ['React', 'TypeScript', 'Node.js', 'Design', 'AI/ML']).map((skill, idx) => (
                                <motion.span
                                    key={idx}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{
                                        scale: 1.1,
                                        y: -5,
                                        boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-full text-sm font-medium text-white cursor-default"
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </div>

            {/* ===== RECRUITER BRIDGE DOCK ===== */}
            <RecruiterBridgeDock />
        </div>
    );
};

export default InteractiveResume;

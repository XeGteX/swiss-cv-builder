/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *   TABLEAU DE BORD ADMIN - ÉDITION DEEP SPACE (LIEN NEURONAL)
 *   Interface Stratégique pour la Surveillance du PANTHÉON
 * 
 *   "Connecté au Panthéon. Nous voyons ce que les dieux voient."
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sun, Network, Clock, Database, Terminal, Activity, AlertTriangle } from 'lucide-react';
import { QuarantineModal } from './QuarantineModal';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type AgentStatus = 'IDLE' | 'WORKING' | 'ERROR' | 'OFFLINE' | 'ACTIVE' | 'AWAKENING' | 'DORMANT' | 'COMPROMISED' | 'DECEASED';

interface Agent {
    id: string;
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    glowColor: string;
    status: AgentStatus;
    lastAction: string;
    capacity?: number;
}

interface LogEntry {
    id: string;
    timestamp: Date;
    agent: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

interface KairosReport {
    scanDate: Date;
    filesScanned: number;
    orphansFound: number;
    deadFiles: any[];
    totalWasteBytes: number;
}

interface SystemPulse {
    olympus: {
        status: string;
        uptime: string;
        consciousness: boolean;
    };
    agents: Array<{
        id: string;
        name: string;
        status: AgentStatus;
        lastAction: string;
        capacity: number;
        lastHeartbeat: Date;
    }>;
    logs: LogEntry[];
    kairosReport: KairosReport | null;
}

// ═════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

const useSystemPulse = () => {
    const [pulse, setPulse] = useState<SystemPulse | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPulse = async () => {
        try {
            const response = await fetch('/api/system/pulse');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (data.success) {
                setPulse(data.data);
                setIsConnected(true);
                setError(null);
            } else {
                throw new Error(data.error || 'Erreur inconnue');
            }
        } catch (err: any) {
            console.error('[LIEN NEURONAL] Connexion échouée:', err);
            setError(err.message);
            setIsConnected(false);
        }
    };

    useEffect(() => {
        fetchPulse();
        const interval = setInterval(fetchPulse, 2000);
        return () => clearInterval(interval);
    }, []);

    return { pulse, isConnected, error, refetch: fetchPulse };
};

// ═══════════════════════════════════════════════════════════════════════════
// MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const agentIconMap: Record<string, {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    glowColor: string;
}> = {
    'aegis': { icon: Shield, color: 'text-purple-400', glowColor: 'shadow-purple-500/50' },
    'helios': { icon: Sun, color: 'text-amber-400', glowColor: 'shadow-amber-500/50' },
    'nexus': { icon: Network, color: 'text-cyan-400', glowColor: 'shadow-cyan-500/50' },
    'kairos': { icon: Clock, color: 'text-emerald-400', glowColor: 'shadow-emerald-500/50' },
    'atlas': { icon: Database, color: 'text-blue-400', glowColor: 'shadow-blue-500/50' }
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    'IDLE': { label: 'En veille', color: 'text-green-400', bg: 'bg-green-500/20' },
    'ACTIVE': { label: 'Actif', color: 'text-green-400', bg: 'bg-green-500/20' },
    'WORKING': { label: 'En cours', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    'AWAKENING': { label: 'Éveil', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    'ERROR': { label: 'Erreur', color: 'text-red-400', bg: 'bg-red-500/20' },
    'COMPROMISED': { label: 'Compromis', color: 'text-red-400', bg: 'bg-red-500/20' },
    'OFFLINE': { label: 'Hors ligne', color: 'text-gray-400', bg: 'bg-gray-500/20' },
    'DORMANT': { label: 'Dormant', color: 'text-gray-400', bg: 'bg-gray-500/20' },
    'DECEASED': { label: 'Décédé', color: 'text-red-600', bg: 'bg-red-600/20' }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANTS
// ═══════════════════════════════════════════════════════════════════════════

const AgentCard: React.FC<{ agent: Agent; onShowReport?: () => void; hasAlert?: boolean }> = ({ agent, onShowReport, hasAlert }) => {
    const Icon = agent.icon;
    const config = statusConfig[agent.status] || statusConfig.IDLE;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group">
            <div className={`bg-white/5 border ${hasAlert ? 'border-orange-500/50' : 'border-white/10'} backdrop-blur-md rounded-2xl p-6 hover:bg-white/10 transition-all duration-300`}>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${agent.glowColor} blur-xl`} />

                <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl bg-white/5 ${agent.color}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                                <p className="text-xs text-slate-400">Gardien Neural</p>
                            </div>
                        </div>

                        <motion.div
                            animate={agent.status === 'WORKING' ? { scale: [1, 1.1, 1], transition: { duration: 1.5, repeat: Infinity } } : {}}
                            className={`px-3 py-1 rounded-full ${config.bg} ${config.color} text-xs font-semibold flex items-center gap-2`}
                        >
                            <div className={`w-2 h-2 rounded-full ${config.color.replace('text', 'bg')} ${agent.status === 'WORKING' ? 'animate-pulse' : ''}`} />
                            {config.label}
                        </motion.div>
                    </div>

                    <div className="mt-4">
                        <p className="text-xs text-slate-500 mb-1">État Mental</p>
                        <p className="text-sm text-slate-300 font-mono">{agent.lastAction}</p>
                    </div>

                    {agent.capacity !== undefined && (
                        <div className="mt-4">
                            <p className="text-xs text-slate-500 mb-2">Capacité Opérationnelle</p>
                            <div className="w-full bg-white/5 rounded-full h-2">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${agent.capacity}%` }}
                                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full" />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{agent.capacity}%</p>
                        </div>
                    )}

                    {/* KAIROS Alert Button */}
                    {agent.id === 'kairos' && hasAlert && onShowReport && (
                        <div className="mt-4">
                            <button
                                onClick={onShowReport}
                                className="w-full px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-orange-400 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                <AlertTriangle size={16} />
                                Voir le Rapport
                            </button>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Activity size={12} className={agent.status === 'WORKING' ? 'animate-pulse' : ''} />
                            <span>Lien neural : {agent.status === 'OFFLINE' || agent.status === 'DORMANT' ? 'Déconnecté' : 'Actif'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const NeuralFeed: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            default: return 'text-cyan-400';
        }
    };

    const getLogEmoji = (type: LogEntry['type']) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden">
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center gap-3">
                <Terminal size={20} className="text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Flux Neuronal</h3>
                <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-slate-400">En direct</span>
                </div>
            </div>

            <div ref={terminalRef} className="h-96 overflow-y-auto font-mono text-sm p-4 space-y-1" style={{ scrollbarWidth: 'thin' }}>
                {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-600">
                        En attente d'activité neuronale...
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {logs.map((log) => (
                            <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                className="flex items-start gap-3 hover:bg-white/5 px-2 py-1 rounded transition-colors">
                                <span className="text-slate-600 text-xs shrink-0 mt-0.5">
                                    {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour12: false })}
                                </span>
                                <span className="text-purple-400 font-bold shrink-0 min-w-[80px]">[{log.agent}]</span>
                                <span className="shrink-0">{getLogEmoji(log.type)}</span>
                                <span className={`${getLogColor(log.type)} flex-1 break-words`}>{log.message}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const AdminDashboard: React.FC = () => {
    const { pulse, isConnected, error, refetch } = useSystemPulse();
    const [showQuarantine, setShowQuarantine] = useState(false);

    const agents: Agent[] = pulse?.agents.map(agent => ({
        ...agent,
        icon: agentIconMap[agent.id]?.icon || Shield,
        color: agentIconMap[agent.id]?.color || 'text-white',
        glowColor: agentIconMap[agent.id]?.glowColor || 'shadow-white/50'
    })) || [];

    const logs: LogEntry[] = pulse?.logs || [];
    const kairosReport = pulse?.kairosReport;
    const hasKairosAlert = kairosReport && kairosReport.orphansFound > 0;

    const handlePurge = async (files?: string[]) => {
        try {
            const response = await fetch('/api/system/kairos/purge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files })
            });
            const data = await response.json();
            if (data.success) {
                alert(`✅ ${data.data.purged} fichiers purgés avec succès !`);
                refetch();
            }
        } catch (err) {
            alert('❌ Erreur lors de la purge');
        }
    };

    const handleRescan = async () => {
        try {
            const response = await fetch('/api/system/kairos/rescan', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                alert('✅ Re-scan terminé !');
                refetch();
            }
        } catch (err) {
            alert('❌ Erreur lors du re-scan');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                        <Activity className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white">Centre de Contrôle PANTHÉON</h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            {isConnected ? 'Lien Neural : ACTIF' : 'Lien Neural : DÉCONNECTÉ'}
                            {error && <span className="text-red-400 text-xs ml-2">({error})</span>}
                        </p>
                    </div>
                </div>
            </motion.div>

            {error && !isConnected && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">⚠️ Impossible de se connecter au Noyau OLYMPUS. Vérifiez le serveur backend.</p>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-purple-400" />
                        L'Escouade
                        {pulse && (
                            <span className="text-xs text-slate-500 ml-auto">
                                Olympus : {pulse.olympus.status} • Temps de veille : {pulse.olympus.uptime}
                            </span>
                        )}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {agents.length > 0 ? (
                            agents.map((agent) => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onShowReport={agent.id === 'kairos' ? () => setShowQuarantine(true) : undefined}
                                    hasAlert={agent.id === 'kairos' && (hasKairosAlert ?? false)}
                                />
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-12 text-slate-600">En attente des données d'agents...</div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Terminal size={20} className="text-cyan-400" />
                        Activité Neuronale
                        <span className="text-xs text-slate-500 ml-auto">{logs.length} messages</span>
                    </h2>
                    <NeuralFeed logs={logs} />
                </div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
                <p className="text-xs text-slate-600">
                    🌌 {pulse?.olympus.consciousness ? 'OLYMPUS CONSCIENT' : 'OLYMPUS DORMANT'} • Noyau Neural : {isConnected ? 'SYNCHRONISÉ' : 'DÉSYNCHRONISÉ'}
                </p>
            </motion.div>

            {/* Quarantine Modal */}
            <QuarantineModal
                isOpen={showQuarantine}
                onClose={() => setShowQuarantine(false)}
                report={kairosReport ?? null}
                onPurge={handlePurge}
                onRescan={handleRescan}
            />
        </div>
    );
};

export default AdminDashboard;

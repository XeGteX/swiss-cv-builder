/**
 * Admin Dashboard - Stats, users, and system metrics
 * 
 * Features:
 * - User analytics
 * - System metrics
 * - Export stats
 * - AI usage tracking
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Users,
    FileText,
    Download,
    Cpu,
    Zap,
    TrendingUp,
    Clock,
    Database,
    Activity
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SystemMetrics {
    totalUsers: number;
    activeCVs: number;
    totalExports: number;
    aiRequests: number;
    storageUsed: string;
    uptime: string;
    lastBackup: Date;
}

interface ActivityLog {
    id: string;
    action: string;
    timestamp: Date;
    details?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_METRICS: SystemMetrics = {
    totalUsers: 1247,
    activeCVs: 3891,
    totalExports: 8234,
    aiRequests: 45672,
    storageUsed: '2.4 GB',
    uptime: '99.9%',
    lastBackup: new Date(Date.now() - 3600000)
};

const MOCK_ACTIVITY: ActivityLog[] = [
    { id: '1', action: 'CV créé', timestamp: new Date(Date.now() - 60000), details: 'John Doe' },
    { id: '2', action: 'Export PDF', timestamp: new Date(Date.now() - 120000) },
    { id: '3', action: 'Analyse IA', timestamp: new Date(Date.now() - 300000) },
    { id: '4', action: 'Nouveau template', timestamp: new Date(Date.now() - 600000) },
    { id: '5', action: 'Coach utilisé', timestamp: new Date(Date.now() - 900000) }
];

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: number;
    color: string;
}

function StatCard({ icon, label, value, trend, color }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="text-xs text-slate-400">{label}</div>
                    <div className="text-lg font-bold text-white">{value}</div>
                </div>
                {trend !== undefined && (
                    <div className={`text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ============================================================================
// MINI CHART
// ============================================================================

function MiniSparkline({ data }: { data: number[] }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((v - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
                points={points}
                fill="none"
                stroke="url(#sparkline-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ============================================================================
// ADMIN DASHBOARD TAB
// ============================================================================

export function AdminDashboardTab() {
    const [metrics, setMetrics] = useState<SystemMetrics>(MOCK_METRICS);
    const [activity, setActivity] = useState<ActivityLog[]>(MOCK_ACTIVITY);
    const [chartData] = useState([35, 45, 38, 52, 48, 60, 55, 70, 65, 80, 75, 90]);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                aiRequests: prev.aiRequests + Math.floor(Math.random() * 5)
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        const diff = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diff < 1) return 'À l\'instant';
        if (diff < 60) return `Il y a ${diff}min`;
        return `Il y a ${Math.floor(diff / 60)}h`;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-200">Admin Dashboard</h2>
                    <p className="text-xs text-slate-400">Métriques système</p>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-2">
                <StatCard
                    icon={<Users className="w-5 h-5 text-white" />}
                    label="Utilisateurs"
                    value={metrics.totalUsers.toLocaleString()}
                    trend={12}
                    color="bg-gradient-to-br from-blue-500 to-cyan-500"
                />
                <StatCard
                    icon={<FileText className="w-5 h-5 text-white" />}
                    label="CVs actifs"
                    value={metrics.activeCVs.toLocaleString()}
                    trend={8}
                    color="bg-gradient-to-br from-green-500 to-emerald-500"
                />
                <StatCard
                    icon={<Download className="w-5 h-5 text-white" />}
                    label="Exports"
                    value={metrics.totalExports.toLocaleString()}
                    trend={15}
                    color="bg-gradient-to-br from-orange-500 to-amber-500"
                />
                <StatCard
                    icon={<Cpu className="w-5 h-5 text-white" />}
                    label="Requêtes IA"
                    value={metrics.aiRequests.toLocaleString()}
                    trend={25}
                    color="bg-gradient-to-br from-purple-500 to-pink-500"
                />
            </div>

            {/* Activity Chart */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">Activité (7j)</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-xs">
                        <Zap className="w-3 h-3" />
                        +23%
                    </div>
                </div>
                <MiniSparkline data={chartData} />
            </div>

            {/* System Status */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Statut Système</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Uptime</span>
                        <span className="text-green-400 font-medium">{metrics.uptime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Stockage</span>
                        <span className="text-white">{metrics.storageUsed}</span>
                    </div>
                    <div className="flex items-center justify-between col-span-2">
                        <span className="text-slate-400 flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            Dernier backup
                        </span>
                        <span className="text-white">{formatTime(metrics.lastBackup)}</span>
                    </div>
                </div>
            </div>

            {/* Activity Log */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-white">Activité récente</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {activity.map(log => (
                        <div key={log.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">{log.action}</span>
                            <span className="text-slate-500">{formatTime(log.timestamp)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardTab;

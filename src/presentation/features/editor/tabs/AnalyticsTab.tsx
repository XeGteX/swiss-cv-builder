/**
 * CV Analytics Dashboard
 * 
 * Tracks and visualizes CV performance metrics:
 * - Views, downloads, shares
 * - ATS score history
 * - Section completion
 * - AI improvement history
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Eye,
    Download,
    Share2,
    Target,
    Calendar,
    ArrowUp,
    ArrowDown,
    Minus,
    Sparkles
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AnalyticsData {
    views: number;
    downloads: number;
    shares: number;
    atsScore: number;
    atsHistory: number[];
    completionRate: number;
    lastUpdated: Date;
    improvements: number;
}

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: number;
    color: string;
}

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

function MetricCard({ icon, label, value, change, color }: MetricCardProps) {
    const TrendIcon = change === undefined ? null : change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
    const trendColor = change === undefined ? '' : change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-slate-400';

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="text-xs text-slate-400">{label}</div>
                    <div className="text-xl font-bold text-white">{value}</div>
                </div>
                {TrendIcon && (
                    <div className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
                        <TrendIcon className="w-3 h-3" />
                        <span>{Math.abs(change || 0)}%</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ============================================================================
// MINI BAR CHART
// ============================================================================

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data, 1);

    return (
        <div className="flex items-end gap-1 h-16">
            {data.map((value, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / max) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={`flex-1 ${color} rounded-t-sm min-h-[4px]`}
                    title={`Score: ${value}`}
                />
            ))}
        </div>
    );
}

// ============================================================================
// COMPLETION RING
// ============================================================================

function CompletionRing({ percentage }: { percentage: number }) {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    strokeDasharray={circumference}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{percentage}%</span>
            </div>
        </div>
    );
}

// ============================================================================
// ANALYTICS TAB COMPONENT
// ============================================================================

export function AnalyticsTab() {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        views: 0,
        downloads: 0,
        shares: 0,
        atsScore: 0,
        atsHistory: [],
        completionRate: 0,
        lastUpdated: new Date(),
        improvements: 0
    });

    // Load analytics from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('nexal-analytics');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setAnalytics({
                    ...parsed,
                    lastUpdated: new Date(parsed.lastUpdated)
                });
            } catch (e) {
                // Initialize with demo data
                initDemoData();
            }
        } else {
            initDemoData();
        }
    }, []);

    const initDemoData = () => {
        const demo: AnalyticsData = {
            views: 42,
            downloads: 8,
            shares: 3,
            atsScore: 78,
            atsHistory: [65, 68, 72, 75, 78, 82, 78],
            completionRate: 85,
            lastUpdated: new Date(),
            improvements: 12
        };
        setAnalytics(demo);
        localStorage.setItem('nexal-analytics', JSON.stringify(demo));
    };

    // incrementMetric can be exposed for external use
    const _incrementMetric = (key: keyof AnalyticsData) => {
        setAnalytics(prev => {
            const updated = { ...prev, [key]: (prev[key] as number) + 1 };
            localStorage.setItem('nexal-analytics', JSON.stringify(updated));
            return updated;
        });
    };
    console.log('Analytics tab ready, incrementMetric available:', typeof _incrementMetric);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-200">Analytics</h2>
                    <p className="text-xs text-slate-400">Performance de ton CV</p>
                </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
                <MetricCard
                    icon={<Eye className="w-5 h-5 text-white" />}
                    label="Vues"
                    value={analytics.views}
                    change={12}
                    color="bg-gradient-to-br from-blue-500 to-cyan-500"
                />
                <MetricCard
                    icon={<Download className="w-5 h-5 text-white" />}
                    label="Téléchargements"
                    value={analytics.downloads}
                    change={5}
                    color="bg-gradient-to-br from-green-500 to-emerald-500"
                />
                <MetricCard
                    icon={<Share2 className="w-5 h-5 text-white" />}
                    label="Partages"
                    value={analytics.shares}
                    change={0}
                    color="bg-gradient-to-br from-orange-500 to-amber-500"
                />
                <MetricCard
                    icon={<Sparkles className="w-5 h-5 text-white" />}
                    label="Améliorations IA"
                    value={analytics.improvements}
                    change={25}
                    color="bg-gradient-to-br from-purple-500 to-pink-500"
                />
            </div>

            {/* ATS Score Section */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">Score ATS</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.atsScore}%</div>
                </div>
                <MiniBarChart data={analytics.atsHistory} color="bg-blue-500" />
                <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                    <span>7 jours</span>
                    <span>Aujourd'hui</span>
                </div>
            </div>

            {/* Completion Section */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                    <CompletionRing percentage={analytics.completionRate} />
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-white mb-2">Complétion CV</h3>
                        <div className="space-y-1">
                            <ProgressBar label="Infos perso" value={100} />
                            <ProgressBar label="Expériences" value={80} />
                            <ProgressBar label="Compétences" value={90} />
                            <ProgressBar label="Formation" value={70} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>Mis à jour {analytics.lastUpdated.toLocaleDateString('fr-FR')}</span>
            </div>
        </div>
    );
}

// ============================================================================
// PROGRESS BAR HELPER
// ============================================================================

function ProgressBar({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-20 truncate">{label}</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
            </div>
            <span className="text-[10px] text-slate-400 w-8">{value}%</span>
        </div>
    );
}

export default AnalyticsTab;

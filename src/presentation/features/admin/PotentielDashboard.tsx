/**
 * PotentielDashboard - Analytics & Growth Tracking
 * 
 * Admin panel showing:
 * - Traffic evolution
 * - Milestones & Quotas
 * - User growth metrics
 * - Goals to beat
 * 
 * Route: /admin/potentiel
 */

import React, { useState } from 'react';
import {
    TrendingUp,
    Users,
    Target,
    Trophy,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Zap
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Metric {
    label: string;
    value: string;
    change: number;
    changeLabel: string;
}

interface Milestone {
    id: string;
    label: string;
    current: number;
    target: number;
    unit: string;
    deadline?: string;
}

// ============================================================================
// MOCK DATA (Replace with real API)
// ============================================================================

const MOCK_METRICS: Metric[] = [
    { label: 'Utilisateurs Total', value: '1,247', change: 12.5, changeLabel: 'vs mois dernier' },
    { label: 'CVs Créés', value: '3,892', change: 23.1, changeLabel: 'vs mois dernier' },
    { label: 'PDFs Générés', value: '2,156', change: 18.7, changeLabel: 'vs mois dernier' },
    { label: 'Taux de Conversion', value: '34.2%', change: -2.1, changeLabel: 'vs mois dernier' },
];

const MOCK_MILESTONES: Milestone[] = [
    { id: '1', label: '🎯 Premier1K Users', current: 1247, target: 1000, unit: 'users' },
    { id: '2', label: '🚀 10K CVs', current: 3892, target: 10000, unit: 'CVs' },
    { id: '3', label: '💎 Revenue 1K€', current: 342, target: 1000, unit: '€', deadline: '2024-03-01' },
    { id: '4', label: '⭐ 100 Reviews', current: 23, target: 100, unit: 'reviews' },
];

// ============================================================================
// COMPONENTS
// ============================================================================

const MetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
    const isPositive = metric.change >= 0;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
            <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="font-medium">{Math.abs(metric.change)}%</span>
                <span className="text-gray-500">{metric.changeLabel}</span>
            </div>
        </div>
    );
};

const MilestoneCard: React.FC<{ milestone: Milestone }> = ({ milestone }) => {
    const progress = Math.min((milestone.current / milestone.target) * 100, 100);
    const isComplete = milestone.current >= milestone.target;

    return (
        <div className={`bg-white rounded-xl p-5 shadow-sm border ${isComplete ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{milestone.label}</h3>
                {isComplete ? (
                    <Trophy className="w-5 h-5 text-yellow-500" />
                ) : milestone.deadline ? (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {milestone.deadline}
                    </div>
                ) : null}
            </div>

            <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                        {milestone.current.toLocaleString()} / {milestone.target.toLocaleString()} {milestone.unit}
                    </span>
                    <span className="text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PotentielDashboard: React.FC = () => {
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Potentiel Dashboard</h1>
                </div>
                <p className="text-gray-600">Suivi de croissance et objectifs à atteindre</p>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 mb-6">
                {(['7d', '30d', '90d'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
                    </button>
                ))}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {MOCK_METRICS.map((metric, idx) => (
                    <MetricCard key={idx} metric={metric} />
                ))}
            </div>

            {/* Milestones Section */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Paliers & Objectifs</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_MILESTONES.map((milestone) => (
                        <MilestoneCard key={milestone.id} milestone={milestone} />
                    ))}
                </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Évolution du Trafic</h2>
                </div>
                <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Graphique de croissance</p>
                        <p className="text-sm">(Intégrer Recharts ou Chart.js)</p>
                    </div>
                </div>
            </div>

            {/* Users Section */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Derniers Utilisateurs</h2>
                </div>
                <div className="text-center text-gray-500 py-8">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Liste des utilisateurs récents</p>
                    <p className="text-sm">(Connecter à l'API)</p>
                </div>
            </div>
        </div>
    );
};

export default PotentielDashboard;

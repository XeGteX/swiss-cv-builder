/**
 * HealthPanel - Agent Monitoring Dashboard
 * 
 * Grid of agent cards with real-time status updates.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { AgentCard } from './AgentCard';
import type { AgentState } from '../../../../server/agents/base-agent';

interface HealthPanelProps {
    agents: AgentState[];
    onTriggerAgent: (agentId: string) => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

export const HealthPanel: React.FC<HealthPanelProps> = ({
    agents,
    onTriggerAgent,
    onRefresh,
    isLoading = false
}) => {
    // Summary statistics
    const summary = {
        total: agents.length,
        idle: agents.filter(a => a.status === 'IDLE').length,
        working: agents.filter(a => a.status === 'WORKING').length,
        error: agents.filter(a => a.status === 'ERROR').length,
        offline: agents.filter(a => a.status === 'OFFLINE').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Agent Health Panel</h2>
                    <p className="text-gray-600 mt-1">
                        Real-time monitoring of all AEGIS agents
                    </p>
                </div>

                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all"
                >
                    <RefreshCw
                        size={16}
                        className={isLoading ? 'animate-spin' : ''}
                    />
                    Refresh
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                    <div className="text-sm text-gray-600">Total Agents</div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{summary.idle}</div>
                    <div className="text-sm text-gray-600">Idle</div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{summary.working}</div>
                    <div className="text-sm text-gray-600">Working</div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{summary.error}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-gray-300">
                    <div className="text-2xl font-bold text-gray-600">{summary.offline}</div>
                    <div className="text-sm text-gray-600">Offline</div>
                </div>
            </div>

            {/* Agent Cards Grid */}
            {agents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
                    <div className="text-gray-400 text-lg">No agents registered</div>
                    <p className="text-gray-500 text-sm mt-2">
                        Agents will appear here once they are initialized
                    </p>
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    layout
                >
                    {agents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onTrigger={onTriggerAgent}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
};

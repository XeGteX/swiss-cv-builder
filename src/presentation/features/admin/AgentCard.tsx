/**
 * AgentCard - Individual Agent Status Card
 * 
 * Displays status, task, and controls for a single agent.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle, Circle, Play } from 'lucide-react';
import type { AgentState } from '../../../../server/agents/base-agent';

interface AgentCardProps {
    agent: AgentState;
    onTrigger?: (agentId: string) => void;
}

// Status color mapping
const statusColors = {
    IDLE: 'bg-green-500',
    WORKING: 'bg-blue-500',
    ERROR: 'bg-red-500',
    OFFLINE: 'bg-gray-500'
};

const statusIcons = {
    IDLE: CheckCircle,
    WORKING: Activity,
    ERROR: AlertCircle,
    OFFLINE: Circle
};

const statusText = {
    IDLE: 'Idle',
    WORKING: 'Working',
    ERROR: 'Error',
    OFFLINE: 'Offline'
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onTrigger }) => {
    const StatusIcon = statusIcons[agent.status];
    const statusColor = statusColors[agent.status];

    // Calculate time since last heartbeat
    const getTimeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-purple-300 transition-all"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{agent.role}</p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={agent.status === 'WORKING' ? {
                            rotate: 360,
                            transition: { duration: 2, repeat: Infinity, ease: 'linear' }
                        } : agent.status === 'IDLE' ? {
                            scale: [1, 1.2, 1],
                            transition: { duration: 2, repeat: Infinity }
                        } : {}}
                        className={`w-3 h-3 rounded-full ${statusColor}`}
                    />
                    <span className="text-xs font-medium text-gray-600">
                        {statusText[agent.status]}
                    </span>
                </div>
            </div>

            {/* Current Task */}
            <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Current Task
                </div>
                <div className="text-sm text-gray-700 flex items-start gap-2">
                    <StatusIcon size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-2">{agent.currentTask}</span>
                </div>
            </div>

            {/* Last Seen */}
            <div className="text-xs text-gray-500 mb-4">
                Last seen: {getTimeSince(agent.lastHeartbeat)}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onTrigger?.(agent.id)}
                    disabled={agent.status === 'WORKING'}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                    <Play size={14} />
                    Trigger
                </button>
            </div>

            {/* Recent Logs Count */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    {agent.logs.length} log entries
                </div>
            </div>
        </motion.div>
    );
};

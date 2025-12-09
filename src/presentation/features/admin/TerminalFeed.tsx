/**
 * TerminalFeed - Live Agent Log Feed
 * 
 * Real-time terminal displaying aggregated logs from all agents.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Download } from 'lucide-react';
import type { LogType } from '../../../../server/agents/base-agent';

interface LogEntry {
    agentId: string;
    agentName: string;
    message: string;
    timestamp: Date;
    type: LogType;
}

interface TerminalFeedProps {
    logs: LogEntry[];
    onClear?: () => void;
}

const logTypeColors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
};

const logTypeEmoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
};

export const TerminalFeed: React.FC<TerminalFeedProps> = ({ logs, onClear }) => {
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const exportLogs = () => {
        const text = logs.map(log =>
            `[${formatTime(log.timestamp)}] [${log.agentName}] ${log.message}`
        ).join('\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aegis-logs-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <Terminal size={20} className="text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Live Agent Feed</h3>
                    <span className="text-xs text-gray-400">
                        ({logs.length} entries)
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={exportLogs}
                        className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all text-sm flex items-center gap-2"
                    >
                        <Download size={14} />
                        Export
                    </button>
                    <button
                        onClick={onClear}
                        className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all text-sm"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Terminal Content */}
            <div
                ref={terminalRef}
                className="h-96 overflow-y-auto font-mono text-sm p-4 space-y-1 bg-gray-900"
                style={{ scrollbarWidth: 'thin' }}
            >
                {logs.length === 0 ? (
                    <div className="text-gray-500 text-center py-12">
                        No logs yet. Agents will report here in real-time.
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {logs.map((log, index) => (
                            <motion.div
                                key={`${log.timestamp}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-start gap-3 py-1 hover:bg-gray-800/50 px-2 rounded transition-colors"
                            >
                                {/* Timestamp */}
                                <span className="text-gray-500 shrink-0">
                                    {formatTime(log.timestamp)}
                                </span>

                                {/* Agent Name */}
                                <span className="text-purple-400 font-semibold shrink-0 min-w-[120px]">
                                    [{log.agentName}]
                                </span>

                                {/* Emoji */}
                                <span className="shrink-0">
                                    {logTypeEmoji[log.type]}
                                </span>

                                {/* Message */}
                                <span className={`${logTypeColors[log.type]} flex-1`}>
                                    {log.message}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-800 px-6 py-2 border-t border-gray-700">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live feed active
                </div>
            </div>
        </div>
    );
};

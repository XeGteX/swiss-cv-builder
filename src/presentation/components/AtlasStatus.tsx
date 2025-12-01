/**
 * ATLAS Status Indicator
 * 
 * Google Docs-style sync status indicator
 * Shows real-time cloud sync state
 */

import React from 'react';
import { Cloud, CloudOff, Check, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtlasStatus } from '../../application/store/v2/cv-store-v2';

export const AtlasStatus: React.FC = () => {
    const atlas = useAtlasStatus();

    // Don't show anything in idle state
    if (atlas.syncStatus === 'idle') {
        return null;
    }

    const getStatusConfig = () => {
        switch (atlas.syncStatus) {
            case 'saving':
                return {
                    icon: Loader,
                    text: 'Sauvegarde...',
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    animate: true
                };
            case 'synced':
                return {
                    icon: Check,
                    text: 'Enregistré',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    animate: false
                };
            case 'error':
                return {
                    icon: CloudOff,
                    text: atlas.syncError || 'Hors ligne',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    animate: false
                };
            default:
                return null;
        }
    };

    const config = getStatusConfig();
    if (!config) return null;

    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                    fixed top-4 right-4 z-50
                    flex items-center gap-2 px-3 py-2 rounded-lg
                    border ${config.borderColor} ${config.bgColor}
                    shadow-sm
                `}
            >
                <Icon
                    size={14}
                    className={`${config.color} ${config.animate ? 'animate-spin' : ''}`}
                />
                <span className={`text-xs font-medium ${config.color}`}>
                    {config.text}
                </span>

                {/* Last sync time (for synced state) */}
                {atlas.syncStatus === 'synced' && atlas.lastSyncTime && (
                    <span className="text-[10px] text-gray-500 ml-1">
                        {new Date(atlas.lastSyncTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

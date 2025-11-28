import React, { useEffect, useState } from 'react';
import { insightsLog } from '../../../domain/services/system/insights-log';
import type { SystemInsight } from '../../../domain/services/system/insights-log';
import { SelfRefiner } from '../../../domain/services/system/self-refiner';
import { Activity, CheckCircle, Info, Zap } from 'lucide-react';
import { useSettingsStore } from '../../../application/store/settings-store';
import { t } from '../../../data/translations';

export const SystemInsightsTab: React.FC = () => {
    const [insights, setInsights] = useState<SystemInsight[]>([]);
    const { language } = useSettingsStore();
    const txt = t[language].system;

    useEffect(() => {
        // Start monitoring when tab is active (or globally, but here for demo)
        SelfRefiner.startMonitoring();
        const unsubscribe = insightsLog.subscribe(setInsights);
        setInsights(insightsLog.getAll());

        return () => {
            unsubscribe();
            SelfRefiner.stopMonitoring();
        };
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'performance': return <Zap size={16} className="text-amber-500" />;
            case 'stability': return <Activity size={16} className="text-red-500" />;
            case 'ux': return <CheckCircle size={16} className="text-blue-500" />;
            default: return <Info size={16} className="text-slate-500" />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-200 bg-white">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Activity className="text-indigo-600" size={18} />
                    {txt.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                    {txt.desc}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {insights.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                        <p>{txt.healthy}</p>
                    </div>
                ) : (
                    insights.map(insight => (
                        <div key={insight.id} className={`p-4 rounded-lg border shadow-sm bg-white ${insight.severity === 'critical' ? 'border-red-200 bg-red-50' :
                            insight.severity === 'warning' ? 'border-amber-200 bg-amber-50' :
                                'border-slate-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getIcon(insight.type)}</div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900">{insight.message}</h4>
                                    <p className="text-xs text-slate-600 mt-1">{insight.recommendation}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${insight.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                            insight.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {insight.severity}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(insight.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

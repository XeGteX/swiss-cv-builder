
import React from 'react';
import { AVAILABLE_FEATURES, useFeatureStore } from '../../domain/experiments/feature-registry';
import { FlaskConical, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card } from '../design-system/atoms/Card';

export const LabsDashboard: React.FC = () => {
    const { isFeatureEnabled, toggleFeature } = useFeatureStore();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                    <FlaskConical size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Laboratoire Expérimental</h1>
                    <p className="text-slate-500">Testez les fonctionnalités du futur avant tout le monde.</p>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                <AlertTriangle className="text-amber-600 mt-1 shrink-0" size={20} />
                <p className="text-sm text-amber-800">
                    <strong>Attention :</strong> Ces fonctionnalités sont en cours de développement (Alpha/Bêta).
                    Elles peuvent être instables ou changer à tout moment. Utilisez-les à vos risques et périls.
                </p>
            </div>

            <div className="grid gap-4 mb-12">
                {AVAILABLE_FEATURES.map((feature) => {
                    const isEnabled = isFeatureEnabled(feature.id);
                    return (
                        <Card key={feature.id} className="flex items-center justify-between p-4 border-l-4 border-l-purple-500">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{feature.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${feature.status === 'alpha' ? 'bg-red-100 text-red-700' :
                                        feature.status === 'beta' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {feature.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm">{feature.description}</p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isEnabled}
                                    onChange={() => toggleFeature(feature.id)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </Card>
                    );
                })}
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                        <TrendingUp size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Business Intelligence (Simulated)</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 border-t-4 border-t-emerald-500">
                        <h3 className="font-semibold text-slate-700 mb-2">Pricing Advisor</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Current PRO Price:</span>
                                <span className="font-mono font-bold">$9.99</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Suggested Price:</span>
                                <span className="font-mono font-bold text-emerald-600">$12.99</span>
                            </div>
                            <div className="mt-2 text-xs bg-slate-100 p-2 rounded text-slate-600 italic">
                                "Low margin detected. Increase price to sustain growth." (Confidence: 85%)
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-t-4 border-t-blue-500">
                        <h3 className="font-semibold text-slate-700 mb-2">Revenue Projection (MRR)</h3>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-slate-900">$1,240</span>
                            <span className="text-sm text-emerald-600 font-medium mb-1.5 flex items-center">
                                <TrendingUp size={14} className="mr-0.5" /> +12%
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">Projected based on current growth rate.</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

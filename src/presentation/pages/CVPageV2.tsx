/**
 * CVPageV2 - V2 Architecture Demo Page
 * 
 * Demonstrates the ATOMIC EDITOR pattern with EditableField components.
 * Uses V2 store (useCVStoreV2) for state management.
 * 
 * Features:
 * - ATLAS Protocol Permanence (auto-save)
 * - Inline editing with AI enhancement
 * - Type-safe path updates
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ModernTemplateV2 } from '../layouts/templates/v2/ModernTemplate.v2';
import { CVPresentationLayer } from '../features/preview/CVPresentationLayer';
import { AtlasStatus } from '../components/AtlasStatus';
import { useCVStoreV2 } from '../../application/store/v2';

export const CVPageV2: React.FC = () => {
    const reset = useCVStoreV2((state) => state.reset);

    return (
        <div className="min-h-screen bg-slate-100 relative">
            {/* ATLAS Status Indicator */}
            <AtlasStatus />

            {/* Demo Reset Button */}
            <button
                onClick={reset}
                className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                title="Recharger les données de démo"
            >
                <RefreshCw size={16} />
                <span className="text-sm font-semibold">🔄 Charger Démo</span>
            </button>

            {/* PROJET GALERIE - 3D Presentation */}
            <CVPresentationLayer>
                <ModernTemplateV2 language="fr" />
            </CVPresentationLayer>

            {/* Instructions */}
            <div className="mt-8 max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4">🎯 How to Test</h3>
                <ol className="space-y-3 text-sm text-slate-700">
                    <li><strong>1. Double-click</strong> any text on the CV (name, title, email, etc.)</li>
                    <li><strong>2. Edit</strong> in the purple floating overlay</li>
                    <li><strong>3. Save</strong> with <kbd className="px-2 py-1 bg-slate-100 rounded">Enter</kbd> or cancel with <kbd className="px-2 py-1 bg-slate-100 rounded">Esc</kbd></li>
                    <li><strong>4. Notice</strong> the ATLAS auto-save indicator (top-right)</li>
                    <li><strong>5. Check</strong> the browser console - zero RegExp errors!</li>
                </ol>

                <div className="mt-6 border-t pt-4">
                    <h4 className="font-semibold mb-2">⚡ What's New in V2?</h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                        <li>✅ <strong>ATLAS</strong> auto-save (Google Docs style)</li>
                        <li>✅ <strong>NO</strong> <code className="bg-slate-100 px-1 rounded">data-inline-edit</code> attributes</li>
                        <li>✅ <strong>Type-safe</strong> paths with autocomplete</li>
                        <li>✅ <strong>Validation</strong> built-in (email, phone, required)</li>
                        <li>✅ <strong>Lodash</strong> instead of fragile RegExp</li>
                        <li>✅ <strong>AI Enhancement</strong> with NanoBrain (Prometheus)</li>
                    </ul>
                </div>
            </div>
        </div>
        </div >
    );
};

export default CVPageV2;

/**
 * Template Gallery - Minimal Stub (After Tabula Rasa)
 * 
 * TODO: Rebuild with React-PDF based previews
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const TemplateGallery: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Template Gallery</h1>
            <p className="text-slate-400 mb-8">En cours de reconstruction...</p>
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
                <ArrowLeft size={20} />
                Retour à l'éditeur
            </button>
        </div>
    );
};

/**
 * CoachTab - AI Assistant inside EditorSidebar
 * 
 * Connected to Gemini 2.0 Flash for real AI responses.
 * Features: Natural language commands, design changes, CV suggestions.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Send,
    Sparkles,
    Lightbulb,
    Target,
    MessageSquare,
    Mic,
    MicOff
} from 'lucide-react';

import { useCVStoreV2, useProfile } from '../../../../application/store/v2';
import { useVoiceRecognition } from '../../../hooks/useVoiceRecognition';

// ============================================================================
// QUICK ACTIONS
// ============================================================================

interface QuickAction {
    id: string;
    icon: React.ReactNode;
    label: string;
    prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'improve',
        icon: <Sparkles className="w-4 h-4" />,
        label: 'Améliorer',
        prompt: 'Analyse mon CV et propose des améliorations concrètes'
    },
    {
        id: 'ats',
        icon: <Target className="w-4 h-4" />,
        label: 'ATS',
        prompt: 'Optimise mon CV pour passer les filtres ATS'
    },
    {
        id: 'tips',
        icon: <Lightbulb className="w-4 h-4" />,
        label: 'Conseils',
        prompt: 'Donne-moi 3 conseils pour rendre mon CV plus impactant'
    }
];

// ============================================================================
// GEMINI INTEGRATION
// ============================================================================

async function callGemini(prompt: string, context: string): Promise<string> {
    // @ts-ignore - import.meta.env is Vite-specific
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        return "⚠️ Clé API Gemini manquante. Ajoute VITE_GEMINI_API_KEY dans ton fichier .env pour activer l'IA.";
    }

    const systemPrompt = `Tu es NEXAL Coach, un assistant IA expert en création de CV. Tu es amical, direct, et tu donnes des conseils actionnables.

CONTEXTE DU CV ACTUEL:
${context}

RÈGLES:
- Réponds en français
- Sois concis (max 100 mots)
- Si l'utilisateur demande un changement de design (couleur, style, pop, pro, tech), indique-le en terminant par [ACTION:nom_action]
- Actions disponibles: [ACTION:pop], [ACTION:pro], [ACTION:tech]

STYLE: Utilise des emojis, sois enthousiaste et encourageant.`;

    try {
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=' + apiKey,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: systemPrompt }] },
                        { role: 'model', parts: [{ text: 'Compris! Je suis NEXAL Coach, prêt à t\'aider. 🚀' }] },
                        { role: 'user', parts: [{ text: prompt }] }
                    ],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 300,
                        topP: 0.8
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "🤔 Hmm, je n'ai pas compris. Réessaie !";
    } catch (error) {
        console.error('[Coach] Gemini error:', error);
        return "❌ Erreur de connexion à l'IA. Vérifie ta clé API et réessaie.";
    }
}

// ============================================================================
// MESSAGE COMPONENT
// ============================================================================

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

function ChatMessage({ message }: { message: Message }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-slate-200 border border-white/10'
                    }`}
            >
                {message.content}
            </div>
        </motion.div>
    );
}

// ============================================================================
// MAIN EXPORT: COACH TAB
// ============================================================================

export function CoachTab() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "👋 Hey ! Je suis ton coach CV propulsé par Gemini 3 Pro 🚀 Pose-moi une question, clique sur une action rapide, ou utilise le micro !",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    // Get profile for context
    const profile = useProfile();

    // Get store actions for design commands
    const setAccentColor = useCVStoreV2(state => state.setAccentColor);
    const setHeaderStyle = useCVStoreV2(state => state.setHeaderStyle);
    const setFontPairing = useCVStoreV2(state => state.setFontPairing);

    // Voice recognition - will trigger via effect
    const [pendingVoice, setPendingVoice] = useState<string | null>(null);

    const {
        isListening: isVoiceListening,
        isSupported: isVoiceSupported,
        transcript: voiceTranscript,
        toggleListening: toggleVoice
    } = useVoiceRecognition({
        language: 'fr-FR',
        onResult: (transcript) => {
            setInput(transcript);
            setPendingVoice(transcript);
        }
    });

    // Build CV context for Gemini
    const buildContext = useCallback(() => {
        const p = profile;
        return `
Nom: ${p?.personal?.firstName || ''} ${p?.personal?.lastName || ''}
Titre: ${p?.personal?.title || 'Non défini'}
Email: ${p?.personal?.contact?.email || 'Non défini'}
Expériences: ${p?.experiences?.length || 0}
Compétences: ${p?.skills?.length || 0}
Résumé: ${p?.summary || 'Pas de résumé'}
        `.trim();
    }, [profile]);

    // Execute design actions from AI response
    const executeAction = useCallback((action: string) => {
        switch (action) {
            case 'pop':
                setAccentColor('#FF3366');
                setHeaderStyle('modern');
                setFontPairing('sans');
                break;
            case 'pro':
                setAccentColor('#1e3a8a');
                setHeaderStyle('classic');
                setFontPairing('serif');
                break;
            case 'tech':
                setAccentColor('#000000');
                setHeaderStyle('minimal');
                setFontPairing('mono');
                break;
        }
    }, [setAccentColor, setHeaderStyle, setFontPairing]);

    const handleSend = useCallback(async (text: string) => {
        if (!text.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsThinking(true);

        // Call Gemini
        const context = buildContext();
        let response = await callGemini(text, context);

        // Check for actions in response
        const actionMatch = response.match(/\[ACTION:(\w+)\]/);
        if (actionMatch) {
            executeAction(actionMatch[1]);
            response = response.replace(/\[ACTION:\w+\]/g, '').trim();
            response += ' ✨ Design appliqué !';
        }

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsThinking(false);
    }, [buildContext, executeAction]);

    // Auto-send voice input after recognition completes
    useEffect(() => {
        if (pendingVoice && pendingVoice.trim() && !isThinking) {
            handleSend(pendingVoice);
            setPendingVoice(null);
        }
    }, [pendingVoice, isThinking, handleSend]);

    const handleQuickAction = (action: QuickAction) => {
        handleSend(action.prompt);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-xl"
                >
                    🚀
                </motion.div>
                <div>
                    <h2 className="text-sm font-bold text-slate-200">NEXAL COACH</h2>
                    <p className="text-xs text-slate-400">Propulsé par Gemini 2.0 ⚡</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {QUICK_ACTIONS.map((action) => (
                    <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickAction(action)}
                        disabled={isThinking}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
                    >
                        {action.icon}
                        <span className="text-xs text-slate-300">{action.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px] max-h-[400px] custom-scrollbar">
                {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                            <motion.div
                                className="flex gap-1 items-center"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span className="text-xs text-slate-400">Gemini réfléchit...</span>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                {/* Voice Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleVoice}
                    disabled={isThinking}
                    className={`p-2.5 rounded-xl border transition-all ${isVoiceListening
                        ? 'bg-red-500 border-red-400 text-white animate-pulse'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        } disabled:opacity-50`}
                    title={isVoiceSupported ? 'Parler au coach' : 'Micro non supporté'}
                >
                    {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </motion.button>

                <div className="flex-1 relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={isVoiceListening ? voiceTranscript || input : input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={isVoiceListening ? '🎤 Écoute...' : 'Demande quelque chose...'}
                        disabled={isThinking}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${isVoiceListening ? 'border-red-500/50' : 'border-white/10'
                            }`}
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || isThinking}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                    <Send className="w-4 h-4" />
                </motion.button>
            </div>
        </div>
    );
}

export default CoachTab;

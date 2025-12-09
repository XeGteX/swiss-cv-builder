/**
 * CoachChat - Conversational Coach Interface
 * 
 * A friendly chat interface for the Ange Gardien coach.
 * Integrates into SmartAIHub or can be used standalone.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, RefreshCw, Lightbulb, ChevronRight } from 'lucide-react';
import { getCoachService, type ChatMessage } from '../../../application/services/ai/CoachService';
import { useProfile } from '../../../application/store/v2';
import { useRegion } from '../../hooks/useRegion';

// ============================================================================
// TYPES
// ============================================================================

interface CoachChatProps {
    onCVUpdate?: (path: string, value: any) => void;
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CoachChat: React.FC<CoachChatProps> = ({
    onCVUpdate,
    className = ''
}) => {
    const profile = useProfile();
    const regionSettings = useRegion();
    const coachService = getCoachService();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize coach with profile and region
    useEffect(() => {
        if (profile) {
            coachService.setProfile(profile);
        }
        coachService.setRegion(regionSettings.id);

        // Add initial greeting
        if (messages.length === 0) {
            const greeting = coachService.getGreeting();
            setMessages([{
                id: 'greeting',
                role: 'assistant',
                content: greeting,
                timestamp: new Date()
            }]);
            setSuggestions(coachService.getProactiveSuggestions().slice(0, 3));
        }
    }, [profile, regionSettings.id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending a message
    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        const newUserMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newUserMsg]);

        // Show typing indicator
        setIsTyping(true);

        try {
            const response = await coachService.chat(userMessage);

            // Add assistant response
            const assistantMsg: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: response.message,
                timestamp: new Date(),
                metadata: {
                    suggestions: response.suggestions
                }
            };
            setMessages(prev => [...prev, assistantMsg]);

            // Update suggestions
            if (response.suggestions) {
                setSuggestions(response.suggestions);
            }

            // Apply CV updates if any
            if (response.cvUpdates && onCVUpdate) {
                for (const update of response.cvUpdates) {
                    onCVUpdate(update.path, update.value);
                }
            }
        } catch (error) {
            console.error('[CoachChat] Error:', error);
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Oops, j\'ai eu un petit bug ! Peux-tu réessayer ? 🙈',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Reset conversation
    const handleReset = () => {
        coachService.clearHistory();
        setMessages([{
            id: 'greeting-new',
            role: 'assistant',
            content: coachService.getGreeting(),
            timestamp: new Date()
        }]);
        setSuggestions(coachService.getProactiveSuggestions().slice(0, 3));
    };

    return (
        <div className={`flex flex-col h-full bg-slate-900/50 rounded-xl border border-white/10 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="font-medium text-white">Ange Gardien</span>
                </div>
                <button
                    onClick={handleReset}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Nouvelle conversation"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800/80 text-gray-100 border border-white/5'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-slate-800/80 text-gray-400 rounded-2xl px-4 py-2.5 border border-white/5">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="px-4 pb-2">
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                        <Lightbulb size={12} />
                        <span>Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.slice(0, 3).map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs px-3 py-1.5 bg-slate-800/60 text-slate-300 rounded-full 
                                           hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors
                                           flex items-center gap-1 border border-white/5"
                            >
                                <ChevronRight size={10} />
                                <span className="truncate max-w-[200px]">{suggestion}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Pose-moi une question..."
                        className="flex-1 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 
                                   text-sm text-white placeholder-slate-500 
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 
                                   text-white rounded-xl font-medium text-sm
                                   hover:from-indigo-600 hover:to-purple-600
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   transition-all flex items-center gap-2"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoachChat;

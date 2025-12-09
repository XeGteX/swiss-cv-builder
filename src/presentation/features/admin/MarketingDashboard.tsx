/**
 * MarketingDashboard - Growth Amplifier
 * 
 * Admin panel for marketing automation:
 * - 👂 Social Listener (detect leads)
 * - ✍️ Content Drafter (AI responses)
 * - 🏭 Viral Generator (LinkedIn posts)
 * 
 * Route: /admin/marketing
 */

import React, { useState } from 'react';
import {
    Megaphone,
    Ear,
    Pencil,
    Factory,
    Copy,
    Check,
    ExternalLink,
    RefreshCw,
    Sparkles,
    MessageSquare,
    Linkedin,
    Twitter
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Lead {
    id: string;
    platform: 'reddit' | 'linkedin' | 'twitter';
    title: string;
    snippet: string;
    url: string;
    timestamp: string;
    relevance: 'high' | 'medium' | 'low';
}

interface _DraftResponse {
    id: string;
    leadId: string;
    content: string;
    status: 'draft' | 'approved' | 'posted';
}

interface ViralIdea {
    id: string;
    hook: string;
    content: string;
    hashtags: string[];
    estimatedReach: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_LEADS: Lead[] = [
    {
        id: '1',
        platform: 'reddit',
        title: 'Looking for CV builder recommendations',
        snippet: "I need a CV builder that works for Swiss job market. Photo required, professional format...",
        url: 'https://reddit.com/r/switzerland/...',
        timestamp: '2h',
        relevance: 'high'
    },
    {
        id: '2',
        platform: 'linkedin',
        title: 'Best tools for job hunting in 2024?',
        snippet: "What are your favorite tools for creating a professional CV? I'm targeting German companies...",
        url: 'https://linkedin.com/posts/...',
        timestamp: '5h',
        relevance: 'high'
    },
    {
        id: '3',
        platform: 'twitter',
        title: 'CV Builder recs?',
        snippet: "Anyone know a good CV builder that adapts to different countries?",
        url: 'https://twitter.com/...',
        timestamp: '1d',
        relevance: 'medium'
    },
];

const MOCK_VIRAL_IDEAS: ViralIdea[] = [
    {
        id: '1',
        hook: "🇨🇭 Did you know Swiss CVs are COMPLETELY different from American ones?",
        content: "In Switzerland, you MUST include:\n• Professional photo (mandatory)\n• Date of birth\n• Nationality\n• Signature\n\nMeanwhile in the US, ALL of these are illegal to require! 🤯\n\nThis is why we built NexalCV - one tool that knows every country's rules.",
        hashtags: ['#CareerTips', '#SwissJobs', '#CVBuilder'],
        estimatedReach: '5K-15K'
    },
    {
        id: '2',
        hook: "I reviewed 500 CVs this month. Here's the #1 mistake everyone makes:",
        content: "They use the SAME CV for every country.\n\nA CV that gets you hired in London will get you rejected in Zurich.\n\nHere's what changes per country:\n\n🇺🇸 USA: No photo, 1 page max\n🇩🇪 Germany: Photo required, 2-3 pages\n🇯🇵 Japan: Specific format, name order reversed\n\nStop sending the same CV everywhere.",
        hashtags: ['#JobSearch', '#CareerAdvice', '#HiringTips'],
        estimatedReach: '10K-30K'
    },
    {
        id: '3',
        hook: "The AI that knows your country's CV rules better than you 👇",
        content: "We trained our AI on CV standards from 50+ countries.\n\nNow it:\n• Auto-selects the right format\n• Hides photo for US/UK jobs\n• Adds signature block for Swiss/German\n• Adjusts section order per country\n\nAnd it's free to try.",
        hashtags: ['#AI', '#TechTools', '#JobHunt'],
        estimatedReach: '3K-8K'
    },
];

// ============================================================================
// COMPONENTS
// ============================================================================

const PlatformIcon: React.FC<{ platform: Lead['platform'] }> = ({ platform }) => {
    const icons = {
        reddit: <MessageSquare className="w-4 h-4" />,
        linkedin: <Linkedin className="w-4 h-4" />,
        twitter: <Twitter className="w-4 h-4" />,
    };
    const colors = {
        reddit: 'bg-orange-100 text-orange-600',
        linkedin: 'bg-blue-100 text-blue-600',
        twitter: 'bg-sky-100 text-sky-600',
    };

    return (
        <div className={`p-2 rounded-lg ${colors[platform]}`}>
            {icons[platform]}
        </div>
    );
};

const LeadCard: React.FC<{ lead: Lead; onRespond: (id: string) => void }> = ({ lead, onRespond }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
            <PlatformIcon platform={lead.platform} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{lead.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${lead.relevance === 'high' ? 'bg-green-100 text-green-700' :
                        lead.relevance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {lead.relevance}
                    </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{lead.snippet}</p>
                <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">{lead.timestamp}</span>
                    <a href={lead.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                        Voir <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                        onClick={() => onRespond(lead.id)}
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                        <Pencil className="w-3 h-3" /> Répondre
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const ViralCard: React.FC<{ idea: ViralIdea }> = ({ idea }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`${idea.hook}\n\n${idea.content}\n\n${idea.hashtags.join(' ')}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {idea.estimatedReach} reach
                </span>
                <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
            </div>
            <p className="font-semibold text-gray-900 mb-2">{idea.hook}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line mb-3">{idea.content}</p>
            <div className="flex flex-wrap gap-1">
                {idea.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-xs text-indigo-600">{tag}</span>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MarketingDashboard: React.FC = () => {
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [draftContent, setDraftContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleRespond = (leadId: string) => {
        setSelectedLeadId(leadId);
        // Simulate AI generating response
        setIsGenerating(true);
        setTimeout(() => {
            setDraftContent(`Hey! I saw your question about CV builders for the Swiss market.\n\nI've been working on a tool called NexalCV that automatically adapts to different countries' requirements. For Switzerland, it includes photo support, signature blocks, and the proper format.\n\nWould love your feedback if you want to try it out: [link]\n\nHappy to answer any questions!`);
            setIsGenerating(false);
        }, 1500);
    };

    const handleCopyDraft = () => {
        navigator.clipboard.writeText(draftContent);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                        <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>
                </div>
                <p className="text-gray-600">Growth Amplifier - Social Listener & Content Generator</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Social Listener */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Ear className="w-5 h-5 text-purple-600" />
                                <h2 className="font-semibold text-gray-900">Social Listener</h2>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <RefreshCw className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {MOCK_LEADS.map((lead) => (
                                <LeadCard key={lead.id} lead={lead} onRespond={handleRespond} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Drafter */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Pencil className="w-5 h-5 text-indigo-600" />
                            <h2 className="font-semibold text-gray-900">Content Drafter</h2>
                        </div>

                        {selectedLeadId ? (
                            <div className="space-y-4">
                                <div className="text-sm text-gray-500">
                                    Réponse suggérée pour: <span className="text-gray-700 font-medium">
                                        {MOCK_LEADS.find(l => l.id === selectedLeadId)?.title}
                                    </span>
                                </div>

                                {isGenerating ? (
                                    <div className="flex items-center gap-2 text-indigo-600">
                                        <Sparkles className="w-4 h-4 animate-pulse" />
                                        <span className="text-sm">Génération en cours...</span>
                                    </div>
                                ) : (
                                    <>
                                        <textarea
                                            value={draftContent}
                                            onChange={(e) => setDraftContent(e.target.value)}
                                            className="w-full h-64 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCopyDraft}
                                                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copier
                                            </button>
                                            <button className="py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                Régénérer
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Pencil className="w-12 h-12 mb-2 opacity-50" />
                                <p className="text-sm">Sélectionne un lead pour rédiger</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Viral Generator */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Factory className="w-5 h-5 text-rose-600" />
                                <h2 className="font-semibold text-gray-900">Viral Generator</h2>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1 text-sm text-indigo-600">
                                <Sparkles className="w-4 h-4" />
                                Nouvelles idées
                            </button>
                        </div>
                        <div className="space-y-4">
                            {MOCK_VIRAL_IDEAS.map((idea) => (
                                <ViralCard key={idea.id} idea={idea} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketingDashboard;

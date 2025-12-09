/**
 * CoachService - Ange Gardien Conversational AI
 * 
 * Provides friendly, conversational CV coaching using Gemini.
 * Like having a super nice friend who wants to help you create the best CV.
 * 
 * Features:
 * - Conversational chat interface
 * - CV analysis and suggestions
 * - Proactive questions to improve content
 * - Region-aware advice
 */

import { GUARDIAN_SYSTEM_PROMPT, EXTRACTION_QUESTIONS, REGION_ADVICE } from './CoachPrompts';
import type { CVProfile } from '../../../domain/cv/v2/types';
import type { RegionId } from '../../../domain/region/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        cvUpdate?: { path: string; value: any };
        suggestions?: string[];
    };
}

export interface CoachContext {
    profile: CVProfile | null;
    regionId: RegionId;
    currentSection?: string;
    conversationHistory: ChatMessage[];
}

export interface CoachResponse {
    message: string;
    suggestions?: string[];
    cvUpdates?: Array<{ path: string; value: any }>;
    nextQuestion?: string;
}

// ============================================================================
// COACH SERVICE
// ============================================================================

export class CoachService {
    private apiKey: string | null = null;
    private context: CoachContext;

    constructor() {
        this.context = {
            profile: null,
            regionId: 'global',
            conversationHistory: []
        };

        // Get API key from environment
        this.apiKey = this.getApiKey();
    }

    private getApiKey(): string | null {
        // Try multiple sources
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
            return import.meta.env.VITE_GEMINI_API_KEY;
        }
        return null;
    }

    /**
     * Set the current profile for context
     */
    public setProfile(profile: CVProfile): void {
        this.context.profile = profile;
    }

    /**
     * Set the target region
     */
    public setRegion(regionId: RegionId): void {
        this.context.regionId = regionId;
    }

    /**
     * Get a greeting based on profile state
     */
    public getGreeting(): string {
        if (!this.context.profile) {
            return `Salut ! 👋 Je suis ton Ange Gardien CV. 
            
Je suis là pour t'aider à créer un CV qui déchire ! 

Tu peux :
• 📎 Uploader ton CV existant (PDF ou image)
• ✍️ Commencer de zéro - je te guide !

Par quoi veux-tu commencer ?`;
        }

        const firstName = this.context.profile.personal?.firstName || 'champion';
        const hasExperiences = (this.context.profile.experiences?.length || 0) > 0;
        const hasSkills = (this.context.profile.skills?.length || 0) > 0;

        if (!hasExperiences && !hasSkills) {
            return `Hey ${firstName} ! 👋 
            
Je vois que tu commences ton CV. Super, on va le rendre incroyable ensemble !

Dis-moi, c'est quoi ton parcours ? Tu as déjà de l'expérience pro ou tu es plutôt jeune diplômé ?`;
        }

        return `Re-salut ${firstName} ! 🎯

Je vois que tu as déjà commencé. Cool !

Je peux t'aider à :
• Améliorer tes expériences avec des chiffres percutants
• Optimiser ton CV pour ${this.context.regionId.toUpperCase()}
• Trouver les bons mots-clés

Qu'est-ce qui t'intéresse ?`;
    }

    /**
     * Generate proactive suggestions based on CV state
     */
    public getProactiveSuggestions(): string[] {
        const suggestions: string[] = [];
        const profile = this.context.profile;

        if (!profile) return [];

        // Check for missing elements
        if (!profile.summary || profile.summary.length < 50) {
            suggestions.push("Ajoute un résumé percutant qui te présente en 3 lignes");
        }

        if (profile.experiences.length === 0) {
            suggestions.push("Commence par ajouter ta première expérience");
        } else {
            // Check for quantified achievements
            const hasNumbers = profile.experiences.some(exp =>
                exp.tasks?.some(t => /\d/.test(t))
            );
            if (!hasNumbers) {
                suggestions.push("Ajoute des chiffres à tes réalisations (%, €, équipes)");
            }
        }

        if (profile.skills.length < 5) {
            suggestions.push("Enrichis ta liste de compétences (5-10 recommandées)");
        }

        if (profile.languages.length === 0) {
            suggestions.push("N'oublie pas d'ajouter tes langues et niveaux");
        }

        // Region-specific
        const regionAdvice = REGION_ADVICE[this.context.regionId as keyof typeof REGION_ADVICE];
        if (regionAdvice) {
            suggestions.push(regionAdvice);
        }

        return suggestions;
    }

    /**
     * Get a coaching question for a specific section
     */
    public getCoachingQuestion(section: string): string {
        const questions = EXTRACTION_QUESTIONS[section as keyof typeof EXTRACTION_QUESTIONS];
        if (questions && questions.length > 0) {
            // Pick a random question
            return questions[Math.floor(Math.random() * questions.length)];
        }
        return "Parle-moi de cette section, qu'est-ce qui te rend unique ?";
    }

    /**
     * Chat with the coach (calls Gemini API)
     */
    public async chat(userMessage: string): Promise<CoachResponse> {
        // Add user message to history
        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };
        this.context.conversationHistory.push(userMsg);

        // If no API key, return simulated response
        if (!this.apiKey) {
            return this.getSimulatedResponse(userMessage);
        }

        try {
            const response = await this.callGemini(userMessage);

            // Add assistant response to history
            const assistantMsg: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: response.message,
                timestamp: new Date(),
                metadata: {
                    cvUpdate: response.cvUpdates?.[0],
                    suggestions: response.suggestions
                }
            };
            this.context.conversationHistory.push(assistantMsg);

            return response;
        } catch (error) {
            console.error('[CoachService] Gemini call failed:', error);
            return this.getSimulatedResponse(userMessage);
        }
    }

    /**
     * Call Gemini API with coach context
     */
    private async callGemini(userMessage: string): Promise<CoachResponse> {
        const systemPrompt = this.buildSystemPrompt();

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: `${systemPrompt}\n\n---\n\nUtilisateur: ${userMessage}` }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 1024
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse response for CV updates
        const cvUpdates = this.extractCVUpdates(content);

        // Clean the message (remove CV_UPDATE tags)
        const cleanMessage = content.replace(/<CV_UPDATE>[\s\S]*?<\/CV_UPDATE>/g, '').trim();

        return {
            message: cleanMessage,
            cvUpdates,
            suggestions: this.getProactiveSuggestions().slice(0, 2),
            nextQuestion: this.getCoachingQuestion(this.context.currentSection || 'experience')
        };
    }

    /**
     * Build system prompt with context
     */
    private buildSystemPrompt(): string {
        const profile = this.context.profile;
        const profileSummary = profile ? `
CV ACTUEL:
- Nom: ${profile.personal?.firstName} ${profile.personal?.lastName}
- Titre: ${profile.personal?.title || 'Non défini'}
- Expériences: ${profile.experiences.length}
- Compétences: ${profile.skills.length}
- Région cible: ${this.context.regionId}
` : 'Aucun CV chargé';

        return `${GUARDIAN_SYSTEM_PROMPT}

${profileSummary}

HISTORIQUE CONVERSATION:
${this.context.conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}
`;
    }

    /**
     * Extract CV update commands from response
     */
    private extractCVUpdates(content: string): Array<{ path: string; value: any }> {
        const updates: Array<{ path: string; value: any }> = [];
        const regex = /<CV_UPDATE>([\s\S]*?)<\/CV_UPDATE>/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            try {
                const updateJson = JSON.parse(match[1]);
                if (updateJson.path && updateJson.value !== undefined) {
                    updates.push(updateJson);
                }
            } catch (e) {
                console.warn('[CoachService] Failed to parse CV update:', match[1]);
            }
        }

        return updates;
    }

    /**
     * Simulated response when no API key
     */
    private getSimulatedResponse(userMessage: string): CoachResponse {
        const lowerMsg = userMessage.toLowerCase();

        // Simple pattern matching for demo
        if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('hello')) {
            return {
                message: `Hey ! Ravi de te rencontrer ! 😊 Je suis ton coach CV personnel. Comment puis-je t'aider aujourd'hui ?`,
                suggestions: this.getProactiveSuggestions().slice(0, 2)
            };
        }

        if (lowerMsg.includes('expérience') || lowerMsg.includes('experience')) {
            return {
                message: `Super sujet ! Les expériences, c'est le cœur de ton CV. 💪

Pour vraiment te démarquer, essaie de quantifier tes réalisations :
- "Augmenté les ventes de X%"
- "Géré une équipe de X personnes"
- "Réduit les coûts de X€"

Quelle expérience veux-tu travailler en premier ?`,
                suggestions: ['Ajoute des chiffres à tes réalisations'],
                nextQuestion: this.getCoachingQuestion('experience')
            };
        }

        if (lowerMsg.includes('aide') || lowerMsg.includes('help')) {
            return {
                message: `Je suis là pour toi ! 🙌

Voici ce que je peux faire :
• 📊 Analyser ton CV et détecter les points faibles
• ✍️ T'aider à reformuler tes expériences
• 🎯 Adapter ton CV à la région cible
• 💡 Te poser des questions pour creuser ton parcours

Dis-moi juste ce dont tu as besoin !`,
                suggestions: this.getProactiveSuggestions()
            };
        }

        // Default helpful response
        return {
            message: `Intéressant ! 🤔 J'ai noté ça.

Pour vraiment t'aider, peux-tu me dire :
${this.getCoachingQuestion('experience')}

N'hésite pas à être précis, les détails font la différence !`,
            suggestions: this.getProactiveSuggestions().slice(0, 2),
            nextQuestion: this.getCoachingQuestion('summary')
        };
    }

    /**
     * Clear conversation history
     */
    public clearHistory(): void {
        this.context.conversationHistory = [];
    }
}

// Singleton instance
let coachServiceInstance: CoachService | null = null;

export function getCoachService(): CoachService {
    if (!coachServiceInstance) {
        coachServiceInstance = new CoachService();
    }
    return coachServiceInstance;
}

export default CoachService;

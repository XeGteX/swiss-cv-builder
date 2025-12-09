/**
 * Gemini 3 Pro Service - CV Expert & Vision
 * 
 * Using Gemini 3 Pro Preview - Google's most powerful AI (Nov 2025)
 * - gemini-3-pro-preview: Text analysis
 * - gemini-3-pro-image-preview: OCR & Photo analysis
 */

import type { CVProfile } from '../../../domain/entities/cv';
import type { CountryCode } from '../../../domain/config/countryRules';
import { getCountryRules } from '../../../domain/config/countryRules';
import type { NanoBrainAudit } from './NanoBrainService';

// ============================================================================
// TYPES
// ============================================================================

export interface GeminiSuggestion {
    field: string;
    currentValue: string | null;
    suggestedValue: string;
    reason: string;
    confidence: number;
}

export interface GeminiAnalysis {
    suggestions: GeminiSuggestion[];
    improvedSummary: string | null;
    powerVerbs: string[];
    missingInfo: string[];
    culturalTips: string[];
    keywordsToAdd: string[];
}

export interface PhotoAnalysis {
    isValid: boolean;
    quality: 'poor' | 'acceptable' | 'good' | 'excellent';
    issues: string[];
    suggestions: string[];
    professionalScore: number; // 0-100
}

export interface OCRResult {
    extractedText: string;
    confidence: number;
    sections: { type: string; content: string }[];
}

// ============================================================================
// GEMINI 3 PRO SERVICE
// ============================================================================

export class GeminiService {
    private static API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    // Gemini 3 Pro models (November 2025)
    private static TEXT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';
    private static IMAGE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

    // ========================================================================
    // CV ANALYSIS (Text-based)
    // ========================================================================

    static async analyzeAndImprove(
        profile: CVProfile,
        audit: NanoBrainAudit,
        targetCountry: CountryCode,
        ragContext: string = ''  // Optional RAG context from OMNISCIENT
    ): Promise<GeminiAnalysis> {
        if (!this.API_KEY) {
            console.warn('[Gemini] No API key, using mock');
            return this.getMockAnalysis(profile, targetCountry);
        }

        const rules = getCountryRules(targetCountry);
        const prompt = this.buildPrompt(profile, audit, rules, ragContext);

        try {
            const response = await fetch(`${this.TEXT_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                })
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Empty response');
            return this.parseResponse(text, profile, targetCountry);
        } catch (error) {
            console.error('[Gemini] Error:', error);
            return this.getMockAnalysis(profile, targetCountry);
        }
    }

    // ========================================================================
    // PHOTO ANALYSIS (Vision-based)
    // ========================================================================

    static async analyzePhoto(photoBase64: string, targetCountry: CountryCode): Promise<PhotoAnalysis> {
        if (!this.API_KEY) {
            return this.getMockPhotoAnalysis();
        }

        const rules = getCountryRules(targetCountry);
        const prompt = `Tu es expert en photos professionnelles pour CV. Analyse cette photo pour ${rules.name}.

Critères:
1. Qualité technique (résolution, éclairage, netteté)
2. Cadrage (portrait centré, espace au-dessus de la tête)
3. Fond (uni, professionnel)
4. Expression (sourire léger, regard confiant)
5. Tenue (professionnelle)
6. Format (portrait, pas de selfie)

Réponds en JSON:
{
  "isValid": true/false,
  "quality": "poor|acceptable|good|excellent",
  "issues": ["problème 1", "..."],
  "suggestions": ["conseil 1", "..."],
  "professionalScore": 0-100
}`;

        try {
            const response = await fetch(`${this.IMAGE_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType: 'image/jpeg', data: photoBase64 } }
                        ]
                    }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
                })
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            const json = text?.match(/\{[\s\S]*\}/)?.[0];
            if (json) return JSON.parse(json);
            return this.getMockPhotoAnalysis();
        } catch (error) {
            console.error('[Gemini Vision] Error:', error);
            return this.getMockPhotoAnalysis();
        }
    }

    // ========================================================================
    // OCR - Extract text from CV image/PDF
    // ========================================================================

    static async extractTextFromImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<OCRResult> {
        if (!this.API_KEY) {
            return { extractedText: '', confidence: 0, sections: [] };
        }

        const prompt = `Extrais tout le texte de ce CV. Identifie les sections:
- PERSONAL: nom, email, téléphone, adresse
- SUMMARY: résumé professionnel
- EXPERIENCE: expériences (titre, entreprise, dates, description)
- EDUCATION: formations (diplôme, école, année)
- SKILLS: compétences
- LANGUAGES: langues

Réponds en JSON:
{
  "extractedText": "tout le texte brut",
  "confidence": 0.0-1.0,
  "sections": [{"type": "PERSONAL", "content": "..."}, ...]
}`;

        try {
            const response = await fetch(`${this.IMAGE_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType, data: imageBase64 } }
                        ]
                    }],
                    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
                })
            });

            if (!response.ok) throw new Error(`API error`);
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            const json = text?.match(/\{[\s\S]*\}/)?.[0];
            if (json) return JSON.parse(json);
            return { extractedText: text || '', confidence: 0.5, sections: [] };
        } catch (error) {
            console.error('[Gemini OCR] Error:', error);
            return { extractedText: '', confidence: 0, sections: [] };
        }
    }

    // ========================================================================
    // SUMMARY GENERATION
    // ========================================================================

    static async generateSummary(profile: CVProfile, country: CountryCode): Promise<string> {
        if (!this.API_KEY) return this.getMockSummary(profile);

        const rules = getCountryRules(country);
        const lastExp = profile.experiences?.[0];
        const prompt = `Expert CV pour ${rules.name}. Génère un résumé pro de 3 phrases pour:
- ${profile.personal?.firstName} ${profile.personal?.lastName}
- Titre: ${profile.personal?.title}
- Dernière exp: ${lastExp?.role || 'N/A'} @ ${lastExp?.company || 'N/A'}
Style: ${rules.languageStyle.formality}. Commence directement.`;

        try {
            const resp = await fetch(`${this.TEXT_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.8, maxOutputTokens: 200 }
                })
            });
            const data = await resp.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || this.getMockSummary(profile);
        } catch {
            return this.getMockSummary(profile);
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    static detectMissingInfo(profile: CVProfile, country: CountryCode): string[] {
        const missing: string[] = [];
        const rules = getCountryRules(country);

        if (!profile.personal?.contact?.email) missing.push('Email');
        if (!profile.personal?.contact?.phone) missing.push('Téléphone');
        if (!profile.personal?.title) missing.push('Titre professionnel');
        if (!profile.summary) missing.push('Résumé');
        if (!profile.experiences?.length) missing.push('Expériences');
        if ((profile.skills?.length || 0) < 5) missing.push('Compétences (min 5)');
        if (rules.photo.required && !profile.personal?.photoUrl) missing.push('Photo');

        return missing;
    }

    private static buildPrompt(
        profile: CVProfile,
        audit: NanoBrainAudit,
        rules: ReturnType<typeof getCountryRules>,
        ragContext: string = ''
    ): string {
        const expCount = profile.experiences?.length || 0;

        // Base prompt
        let prompt = `Tu es un expert CV pour le marché ${rules.name}.

${ragContext ? `${ragContext}\n\n` : ''}Score actuel: ${audit.score}/100. Erreurs critiques: ${audit.criticalErrors.length}.
Profil: ${profile.personal?.firstName} ${profile.personal?.lastName}, ${profile.personal?.title}. ${expCount} expériences.
Règles pays: Photo=${rules.photo.required ? 'OBLIGATOIRE' : rules.photo.allowed ? 'OPTIONNELLE' : 'INTERDITE'}, Style=${rules.languageStyle.formality}

Analyse ce CV et propose des améliorations. Réponds en JSON:
{"suggestions":[{"field":"...","suggestedValue":"...","reason":"...","confidence":0.9}],"improvedSummary":"...","powerVerbs":["..."],"missingInfo":["..."],"culturalTips":["..."],"keywordsToAdd":["..."]}`;

        return prompt;
    }

    private static parseResponse(text: string, profile: CVProfile, country: CountryCode): GeminiAnalysis {
        try {
            const json = text.match(/\{[\s\S]*\}/)?.[0];
            if (!json) throw new Error('No JSON');
            const parsed = JSON.parse(json);
            return {
                suggestions: parsed.suggestions || [],
                improvedSummary: parsed.improvedSummary,
                powerVerbs: parsed.powerVerbs || [],
                missingInfo: parsed.missingInfo || [],
                culturalTips: parsed.culturalTips || [],
                keywordsToAdd: parsed.keywordsToAdd || []
            };
        } catch {
            return this.getMockAnalysis(profile, country);
        }
    }

    private static getMockAnalysis(profile: CVProfile, country: CountryCode): GeminiAnalysis {
        const rules = getCountryRules(country);
        const expCount = profile.experiences?.length || 5;
        return {
            suggestions: [{ field: 'summary', currentValue: null, suggestedValue: 'Professionnel expérimenté...', reason: 'Résumé à améliorer', confidence: 0.9 }],
            improvedSummary: `${profile.personal?.title || 'Professionnel'} avec ${expCount} ans d'expérience.`,
            powerVerbs: rules.languageStyle.useActionVerbs ? ['Dirigé', 'Optimisé', 'Développé', 'Lancé'] : ['Contribué', 'Collaboré'],
            missingInfo: this.detectMissingInfo(profile, country),
            culturalTips: [`Adaptez au marché ${rules.name}`],
            keywordsToAdd: ['Leadership', 'Gestion de projet', 'KPI', 'Agilité']
        };
    }

    private static getMockSummary(profile: CVProfile): string {
        const expCount = profile.experiences?.length || 5;
        return `${profile.personal?.title || 'Professionnel'} expérimenté avec ${expCount} années d'expertise.`;
    }

    private static getMockPhotoAnalysis(): PhotoAnalysis {
        return {
            isValid: true,
            quality: 'acceptable',
            issues: ['Analyse photo non disponible sans API'],
            suggestions: ['Utilisez un fond uni', 'Éclairage naturel recommandé'],
            professionalScore: 70
        };
    }
}

export default GeminiService;

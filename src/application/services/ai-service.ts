
import type { AIClient } from '../../domain/services/ai-client.interface';
import { DataSanitizer } from '../../shared/sanitizer';
import { CVProfileSchema, type CVProfile } from '../../domain/entities/cv';

export class AIService {
  private client: AIClient;

  constructor(client: AIClient) {
    this.client = client;
  }

  async analyzeCV(text: string, market: string): Promise<Partial<CVProfile> | null> {
    const prompt = `
      You are an expert Swiss recruiter. Analyze this CV for the ${market} market.
      Extract structured data in strict JSON format matching this schema:
      {
        "personal": { "firstName": "...", "lastName": "...", "title": "...", "email": "...", "phone": "...", "address": "...", "mobility": "...", "birthDate": "...", "nationality": "...", "permit": "..." },
        "summary": "...",
        "skills": ["..."],
        "languages": [{ "name": "...", "level": "..." }],
        "strengths": ["..."],
        "experiences": [{ "id": "1", "role": "...", "company": "...", "location": "...", "dates": "...", "tasks": ["..."] }],
        "educations": [{ "id": "1", "degree": "...", "school": "...", "year": "...", "description": "..." }],
        "metadata": { "suggestedColor": "#...", "sector": "..." }
      }
      CV Text:
      ${text}
    `;

    const rawResponse = await this.client.generateContent(prompt);

    // We use a partial schema for parsing because the AI might not return everything
    // and we want to merge it with existing state later.
    const PartialSchema = CVProfileSchema.partial();

    return DataSanitizer.safeParse(rawResponse, PartialSchema);
  }

  async improveSummary(experiences: any[], language: string): Promise<string> {
    const prompt = `
      Act as a career consultant. Write a professional summary for a Swiss CV based on these experiences:
      ${JSON.stringify(experiences)}
      
      Requirements:
      - Language: ${language}
      - Max 3-4 lines
      - Result-oriented
      - No "I" if possible, use action verbs
      
      Return ONLY the text.
    `;

    const text = await this.client.generateContent(prompt);
    return DataSanitizer.cleanText(text);
  }

  /**
   * Improve any text with AI enhancement
   * Used for inline editing improvements
   */
  async improveText(text: string, context?: string): Promise<string> {
    const prompt = `
      You are a professional Swiss CV writer. Improve this text to make it more professional, concise, and impactful.
      
      ${context ? `Context: ${context}` : ''}
      
      Original text:
      ${text}
      
      Requirements:
      - Keep the same language as the original
      - Maintain factual accuracy
      - Use action verbs and results-oriented language
      - Keep it concise (max 20% longer than original)
      - Return ONLY the improved text, no explanations
    `;

    const improved = await this.client.generateContent(prompt);
    return DataSanitizer.cleanText(improved);
  }

  async writeCoverLetter(profile: CVProfile, language: string): Promise<string> {
    const prompt = `
      Write a Swiss-style cover letter for this profile:
      ${JSON.stringify(profile)}
      
      Requirements:
      - Language: ${language}
      - Formal and polite
      - Highlight reliability and skills
      - Return ONLY the body text
    `;

    const text = await this.client.generateContent(prompt);
    return DataSanitizer.cleanText(text);
  }
}

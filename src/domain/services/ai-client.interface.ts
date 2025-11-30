
export interface AIClient {
    generateContent(prompt: string): Promise<string>;
}

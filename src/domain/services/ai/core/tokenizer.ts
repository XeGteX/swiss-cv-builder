/**
 * Lightweight Tokenizer with stemming support.
 */
export class Tokenizer {
    private static stopWords = new Set([
        'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
        'can', 'could', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it',
        'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
        'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc',
        'est', 'sont', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'
    ]);

    /**
     * Tokenizes text into a clean array of stems.
     */
    static tokenize(text: string): string[] {
        if (!text) return [];

        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, ' ') // Keep alphanumeric and hyphens
            .split(/\s+/)
            .filter(token => token.length > 2) // Filter short noise
            .filter(token => !this.stopWords.has(token))
            .map(token => this.stem(token));
    }

    /**
     * A very simplified stemmer (suffix stripping).
     * For a production app, we might use a full Porter Stemmer,
     * but this covers 80% of cases with 1% of the code.
     */
    private static stem(word: string): string {
        if (word.endsWith('ing')) return word.slice(0, -3);
        if (word.endsWith('ed')) return word.slice(0, -2);
        if (word.endsWith('es')) return word.slice(0, -2);
        if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
        if (word.endsWith('ment')) return word.slice(0, -4);
        if (word.endsWith('tion')) return word.slice(0, -4);
        return word;
    }

    /**
     * Generates n-grams from tokens.
     * e.g. ["front", "end", "dev"] -> ["front end", "end dev"]
     */
    static generateNGrams(tokens: string[], n: number = 2): string[] {
        if (tokens.length < n) return [];
        const ngrams: string[] = [];
        for (let i = 0; i <= tokens.length - n; i++) {
            ngrams.push(tokens.slice(i, i + n).join(' '));
        }
        return ngrams;
    }
}

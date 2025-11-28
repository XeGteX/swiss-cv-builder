import { v4 as uuidv4 } from 'uuid';

export class NanoBrainService {
    private worker: Worker | null = null;
    private pendingRequests: Map<string, (response: any) => void> = new Map();

    constructor() {
        if (typeof window !== 'undefined') {
            this.worker = new Worker(new URL('../../../worker/ai.worker.ts', import.meta.url), {
                type: 'module'
            });

            this.worker.onmessage = (e) => {
                const { id, payload, type } = e.data;
                const resolver = this.pendingRequests.get(id);
                if (resolver) {
                    if (type === 'error') {
                        console.error('NanoBrain Error:', payload);
                    }
                    resolver(payload);
                    this.pendingRequests.delete(id);
                }
            };
        }
    }

    private request<T>(type: string, payload: any): Promise<T> {
        if (!this.worker) return Promise.resolve({} as T);

        return new Promise((resolve) => {
            const id = uuidv4();
            this.pendingRequests.set(id, resolve);
            this.worker!.postMessage({ type, id, payload });

            // Timeout safety
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    resolve({} as T); // Resolve empty on timeout
                }
            }, 5000);
        });
    }

    async analyzeRelevance(cvText: string, jobText: string): Promise<{ similarity: number }> {
        return this.request('analyze_relevance', { cvText, jobText });
    }

    async suggestKeywords(text: string): Promise<{ keywords: string[], match: string }> {
        return this.request('suggest_keywords', { text });
    }

    async analyzeComplexity(text: string): Promise<{ score: number, level: 'compact' | 'comfortable' | 'spacious' }> {
        return this.request('analyze_complexity', { text });
    }

    terminate() {
        this.worker?.terminate();
        this.worker = null;
    }
}

export const nanoBrain = new NanoBrainService();

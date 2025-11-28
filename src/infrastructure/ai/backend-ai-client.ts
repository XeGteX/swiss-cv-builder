import type { AIClient } from '../../domain/services/ai-client.interface';

export class BackendAIClient implements AIClient {
    async generateContent(prompt: string): Promise<string> {
        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (response.status === 403) {
            const data = await response.json();
            if (data.code === 'QUOTA_EXCEEDED') {
                throw new Error(`Quota exceeded (${data.usage}/${data.limit}). Upgrade to Pro for unlimited usage.`);
            }
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to generate content via backend');
        }

        const data = await response.json();
        return data.text;
    }
}

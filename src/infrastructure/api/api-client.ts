
export class ApiClient {
    private static baseUrl = '/api';

    private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, { ...options, headers });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'API Request Failed');
        }

        return data as T;
    }

    static async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    static async post<T>(endpoint: string, body: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    static async put<T>(endpoint: string, body: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    static async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

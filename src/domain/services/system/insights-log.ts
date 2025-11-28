import { v4 as uuidv4 } from 'uuid';

export interface SystemInsight {
    id: string;
    timestamp: number;
    type: 'performance' | 'stability' | 'localization' | 'ux';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    recommendation: string;
    metricValue?: number;
}

class InsightsLogService {
    private insights: SystemInsight[] = [];
    private listeners: ((insights: SystemInsight[]) => void)[] = [];

    add(insight: Omit<SystemInsight, 'id' | 'timestamp'>) {
        const newInsight: SystemInsight = {
            id: uuidv4(),
            timestamp: Date.now(),
            ...insight
        };
        this.insights.unshift(newInsight);
        this.notify();
    }

    getAll(): SystemInsight[] {
        return this.insights;
    }

    subscribe(listener: (insights: SystemInsight[]) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l(this.insights));
    }
}

export const insightsLog = new InsightsLogService();


import { LayoutSolver } from '../domain/services/layout-solver';
import type { CVProfile } from '../domain/entities/cv';

self.onmessage = (e: MessageEvent) => {
    const { profile, constraints } = e.data as { profile: CVProfile, constraints: any };

    try {
        const solution = LayoutSolver.solve(profile, constraints);
        self.postMessage({ type: 'SUCCESS', solution });
    } catch (error: any) {
        self.postMessage({ type: 'ERROR', message: error.message });
    }
};

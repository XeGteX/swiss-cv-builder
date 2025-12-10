
import React from 'react';
import { useCVStoreV2 as useCVStore } from '@/application/store/v2/cv-store-v2';
import { useSettingsStore } from '../../application/store/settings-store';
import { layoutRegistry } from './registry';
import { AutoScaler } from '../../domain/services/auto-scaler';
import { monitor } from '../../infrastructure/monitoring/system-monitor';

export const DynamicRenderer: React.FC = React.memo(() => {
    const profile = useCVStore((state) => state.profile);
    const { language } = useSettingsStore();
    const templateId = profile.metadata.templateId;

    const template = layoutRegistry.get(templateId);

    const [layoutSolution, setLayoutSolution] = React.useState<{ fontSize: number; lineHeight: number; margin: number } | null>(null);

    const workerRef = React.useRef<Worker | null>(null);

    React.useEffect(() => {
        // Initialize worker once
        workerRef.current = new Worker(new URL('../../worker/layout.worker.ts', import.meta.url), { type: 'module' });
        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    React.useEffect(() => {
        if (!workerRef.current) return;

        const worker = workerRef.current;

        worker.onmessage = (e) => {
            if (e.data.type === 'SUCCESS') {
                setLayoutSolution(e.data.solution);
                monitor.recordMetric('layout_worker_success', 1);
            } else {
                console.error('Layout Worker Error:', e.data.message);
                monitor.recordMetric('layout_worker_error', 1);
            }
        };

        // Send data to worker
        worker.postMessage({
            profile,
            constraints: {
                minFontSize: 10.5,
                maxFontSize: 13,
                targetHeight: 1123
            }
        });
    }, [profile]);

    if (!template) {
        return <div className="p-10 text-red-500">Template not found: {templateId}</div>;
    }

    // Fallback to AutoScaler while worker is calculating
    const density = AutoScaler.calculateDensity(profile, templateId);
    let styles = AutoScaler.getStyles(density);

    // Override with worker solution if available
    if (layoutSolution) {
        styles = {
            ...styles,
            textBase: `${layoutSolution.fontSize}px`,
            lineHeight: layoutSolution.lineHeight.toString(),
            sectionGap: `${layoutSolution.margin}px`,
            itemGap: `${layoutSolution.margin / 2}px`,
        };
    }

    const TemplateComponent = template.component;

    return (
        <TemplateComponent
            data={profile}
            densityStyles={styles}
            accentColor={profile.metadata.accentColor}
            fontFamily={profile.metadata.fontFamily}
            language={language}
        />
    );
});

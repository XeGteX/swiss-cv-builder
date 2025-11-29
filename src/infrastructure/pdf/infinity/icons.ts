import type { ScvIconShape } from '../../../domain/scv/types';

export const PDF_ICONS: Record<string, ScvIconShape[]> = {
    mapPin: [
        { type: 'path', d: "M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0Z", stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' },
        { type: 'circle', cx: 12, cy: 10, r: 3, stroke: 'currentColor', strokeWidth: 2, fill: 'none' }
    ],
    globe: [
        { type: 'circle', cx: 12, cy: 12, r: 10, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
        { type: 'path', d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z", stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
        { type: 'path', d: "M2 12h20", stroke: 'currentColor', strokeWidth: 2, fill: 'none' }
    ],
    phone: [
        { type: 'path', d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z", stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
    ],
    mail: [
        { type: 'rect', width: 20, height: 16, x: 2, y: 4, rx: 2, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
        { type: 'path', d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
    ],
    briefcase: [
        { type: 'rect', width: 20, height: 14, x: 2, y: 7, rx: 2, ry: 2, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
        { type: 'path', d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
    ],
    award: [
        { type: 'circle', cx: 12, cy: 8, r: 6, stroke: 'currentColor', strokeWidth: 2, fill: 'none' },
        { type: 'path', d: "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11", stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
    ],
    graduationCap: [
        { type: 'path', d: "M22 10v6M2 10l10-5 10 5-10 5z", stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' },
        { type: 'path', d: "M6 12v5c3.33333 2 6.66667 2 10 0v-5", stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
    ]
};

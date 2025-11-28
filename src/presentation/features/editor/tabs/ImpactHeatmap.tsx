import React from 'react';

interface ImpactHeatmapProps {
    segments: {
        segment: string;
        score: number; // 0-100
    }[];
}

export const ImpactHeatmap: React.FC<ImpactHeatmapProps> = ({ segments }) => {
    if (!segments || segments.length === 0) return null;

    return (
        <div className="flex gap-1 h-8 w-full rounded-md overflow-hidden">
            {segments.map((seg, idx) => (
                <div
                    key={idx}
                    className="flex-1 relative group"
                    style={{
                        backgroundColor: `hsl(${seg.score * 1.2}, 70%, 50%)`,
                        opacity: 0.8
                    }}
                >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {seg.segment}: {seg.score}
                    </div>
                </div>
            ))}
        </div>
    );
};

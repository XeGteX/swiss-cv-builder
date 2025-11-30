import { useState, useCallback, useRef, useEffect } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
}

const MAX_PARTICLES = 50;
const SPAWN_INTERVAL = 80; // ms between particle spawns

export const useParticleTrail = (color: string = '#6366f1') => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const particleIdRef = useRef(0);
    const lastSpawnRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const now = Date.now();

        // Throttle particle spawning
        if (now - lastSpawnRef.current < SPAWN_INTERVAL) {
            return;
        }

        lastSpawnRef.current = now;

        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Add small random offset for natural look
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;

        const newParticle: Particle = {
            id: particleIdRef.current++,
            x: x + offsetX,
            y: y + offsetY,
            color
        };

        setParticles(prev => {
            // Limit max particles for performance
            if (prev.length >= MAX_PARTICLES) {
                return [...prev.slice(1), newParticle];
            }
            return [...prev, newParticle];
        });
    }, [color]);

    const removeParticle = useCallback((id: number) => {
        setParticles(prev => prev.filter(p => p.id !== id));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setParticles([]);
        };
    }, []);

    return {
        particles,
        removeParticle,
        handleMouseMove,
        containerRef
    };
};

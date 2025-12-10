/**
 * ParticleCanvas - Lightweight Canvas-based Particle System
 * Renders snow, rain, stars, or floating orbs
 */

import React, { useRef, useEffect, useCallback } from 'react';

export type ParticleType = 'snow' | 'rain' | 'stars' | 'orbs' | 'none';

interface ParticleCanvasProps {
    type: ParticleType;
    density?: number; // 0-1
    className?: string;
}

interface Particle {
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    drift?: number;
    twinkle?: number;
}

const PARTICLE_CONFIGS = {
    snow: { count: 100, minSize: 2, maxSize: 5, minSpeed: 0.5, maxSpeed: 1.5 },
    rain: { count: 150, minSize: 1, maxSize: 2, minSpeed: 8, maxSpeed: 12 },
    stars: { count: 80, minSize: 1, maxSize: 3, minSpeed: 0, maxSpeed: 0 },
    orbs: { count: 30, minSize: 3, maxSize: 8, minSpeed: 0.2, maxSpeed: 0.5 },
};

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
    type,
    density = 1,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number | undefined>(undefined);

    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
        if (type === 'none') {
            particlesRef.current = [];
            return;
        }

        const config = PARTICLE_CONFIGS[type];
        const count = Math.floor(config.count * density);
        const particles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: config.minSize + Math.random() * (config.maxSize - config.minSize),
                speed: config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed),
                opacity: 0.3 + Math.random() * 0.7,
                drift: type === 'snow' ? (Math.random() - 0.5) * 0.5 : 0,
                twinkle: type === 'stars' ? Math.random() * Math.PI * 2 : 0,
            });
        }

        particlesRef.current = particles;
    }, [type, density]);

    // Update particle positions
    const updateParticles = useCallback((width: number, height: number) => {
        particlesRef.current.forEach((p) => {
            switch (type) {
                case 'snow':
                    p.y += p.speed;
                    p.x += p.drift || 0;
                    if (p.y > height) {
                        p.y = -p.size;
                        p.x = Math.random() * width;
                    }
                    if (p.x < 0) p.x = width;
                    if (p.x > width) p.x = 0;
                    break;

                case 'rain':
                    p.y += p.speed;
                    if (p.y > height) {
                        p.y = -10;
                        p.x = Math.random() * width;
                    }
                    break;

                case 'stars':
                    // Twinkle effect
                    p.twinkle = (p.twinkle || 0) + 0.02;
                    p.opacity = 0.3 + Math.abs(Math.sin(p.twinkle)) * 0.7;
                    break;

                case 'orbs':
                    // Slow floating
                    p.y += Math.sin(Date.now() * 0.001 + p.x) * 0.3;
                    p.x += Math.cos(Date.now() * 0.001 + p.y) * 0.2;
                    // Wrap around
                    if (p.x < 0) p.x = width;
                    if (p.x > width) p.x = 0;
                    if (p.y < 0) p.y = height;
                    if (p.y > height) p.y = 0;
                    break;
            }
        });
    }, [type]);

    // Render particles
    const render = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);

        particlesRef.current.forEach((p) => {
            ctx.beginPath();

            switch (type) {
                case 'snow':
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'rain':
                    ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity * 0.6})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, p.y + p.size * 5);
                    ctx.stroke();
                    break;

                case 'stars':
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    // Add glow
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    break;

                case 'orbs':
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    gradient.addColorStop(0, `rgba(139, 92, 246, ${p.opacity * 0.8})`);
                    gradient.addColorStop(0.5, `rgba(139, 92, 246, ${p.opacity * 0.3})`);
                    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
                    ctx.fillStyle = gradient;
                    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        });
    }, [type]);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || type === 'none') return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(canvas.width, canvas.height);
        };

        resize();
        window.addEventListener('resize', resize);

        const animate = () => {
            updateParticles(canvas.width, canvas.height);
            render(ctx, canvas.width, canvas.height);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [type, density, initParticles, updateParticles, render]);

    if (type === 'none') return null;

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none ${className}`}
            style={{ zIndex: 0 }}
        />
    );
};

export default ParticleCanvas;

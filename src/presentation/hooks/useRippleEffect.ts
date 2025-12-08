import { useState, useCallback } from 'react';

export const useRippleEffect = () => {
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    let rippleId = 0;

    // Trigger ripple at specific position relative to container
    const triggerRippleAt = useCallback((x: number, y: number) => {
        const newRipple = {
            id: rippleId++,
            x,
            y
        };

        setRipples(prev => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 1000);
    }, []);

    // Legacy: get center of element and trigger there (for non-scaled contexts)
    const triggerRipple = useCallback((element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        triggerRippleAt(x, y);
    }, [triggerRippleAt]);

    const removeRipple = useCallback((id: number) => {
        setRipples(prev => prev.filter(r => r.id !== id));
    }, []);

    return {
        ripples,
        triggerRipple,
        triggerRippleAt,
        removeRipple
    };
};

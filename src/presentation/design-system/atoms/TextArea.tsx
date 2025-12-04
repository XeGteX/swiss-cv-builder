
import React, { useState, useEffect, useRef } from 'react';
import { cn } from './Button';

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    label?: string;
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    debounceTime?: number;
    maxLength?: number;
    enableAI?: boolean;
    onAiImprove?: (newValue: string) => void;
    variant?: 'default' | 'glass';
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, label, error, id, value, onChange, debounceTime = 300, maxLength, enableAI = false, onAiImprove, variant = 'default', ...props }, ref) => {
        const inputId = id || React.useId();
        const [localValue, setLocalValue] = useState<string | number | readonly string[] | undefined>(value);
        const [isImproving, setIsImproving] = useState(false);
        const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        // Sync local value when prop value changes
        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            setLocalValue(newValue);

            if (debounceTime > 0) {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                    if (onChange) onChange(e);
                }, debounceTime);
            } else {
                if (onChange) onChange(e);
            }
        };

        const handleAiImprove = async () => {
            if (!localValue || typeof localValue !== 'string') return;

            setIsImproving(true);
            try {
                // Dynamic import to avoid circular dependencies or server-side issues
                const { geminiService } = await import('../../../application/services/ai/GeminiService');
                const improvedText = await geminiService.improveText(localValue, label || 'CV Section');

                setLocalValue(improvedText);

                // Trigger onChange with new value
                if (onChange) {
                    const event = {
                        target: { value: improvedText },
                        currentTarget: { value: improvedText }
                    } as React.ChangeEvent<HTMLTextAreaElement>;
                    onChange(event);
                }
            } catch (err) {
                console.error('AI Improvement failed', err);
                // Optional: Add toast notification here
            } finally {
                setIsImproving(false);
            }
        };

        const currentLength = typeof localValue === 'string' ? localValue.length : 0;
        const isNearLimit = maxLength && currentLength > maxLength * 0.9;

        const baseStyles = 'flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50';

        const variants = {
            default: 'border-surface-300 bg-white placeholder:text-surface-400 focus-visible:ring-brand-500 text-surface-900',
            glass: 'glass-input',
        };

        return (
            <div className="w-full space-y-1.5">
                <div className="flex justify-between items-baseline">
                    {label && (
                        <label htmlFor={inputId} className={cn("block text-xs font-semibold", variant === 'glass' ? "text-slate-200" : "text-slate-600")}>
                            {label}
                        </label>
                    )}
                    <div className="flex items-center gap-2">
                        {enableAI && (
                            <button
                                type="button"
                                onClick={handleAiImprove}
                                disabled={isImproving || !localValue}
                                className={cn(
                                    "text-[10px] font-medium flex items-center gap-1 transition-colors disabled:opacity-50",
                                    variant === 'glass' ? "text-indigo-300 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-700"
                                )}
                            >
                                {isImproving ? (
                                    <>
                                        <span className="animate-spin">✨</span> Improving...
                                    </>
                                ) : (
                                    <>
                                        <span>✨</span> Improve with AI
                                    </>
                                )}
                            </button>
                        )}
                        {maxLength && (
                            <span className={cn("text-[10px] font-medium", isNearLimit ? "text-amber-600" : (variant === 'glass' ? "text-slate-400" : "text-slate-400"))}>
                                {currentLength}/{maxLength}
                            </span>
                        )}
                    </div>
                </div>
                <textarea
                    id={inputId}
                    ref={ref}
                    value={localValue}
                    onChange={handleChange}
                    maxLength={maxLength}
                    className={cn(
                        baseStyles,
                        variants[variant],
                        error && 'border-red-500 focus-visible:ring-red-500',
                        isImproving && 'animate-pulse bg-indigo-50',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';

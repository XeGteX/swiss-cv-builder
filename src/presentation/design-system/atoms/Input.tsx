import React, { useState, useEffect, useRef } from 'react';
import { cn } from './Button'; // Reusing cn utility

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    debounceTime?: number;
    maxLength?: number;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, value, onChange, debounceTime = 300, maxLength, ...props }, ref) => {
        const inputId = id || React.useId();
        const [localValue, setLocalValue] = useState<string | number | readonly string[] | undefined>(value);
        const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        // Sync local value when prop value changes (e.g. from store updates or initial load)
        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const currentLength = typeof localValue === 'string' ? localValue.length : 0;
        const isNearLimit = maxLength && currentLength > maxLength * 0.9;

        return (
            <div className="w-full space-y-1.5">
                <div className="flex justify-between items-baseline">
                    {label && (
                        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-600">
                            {label}
                        </label>
                    )}
                    {maxLength && (
                        <span className={cn("text-[10px] font-medium", isNearLimit ? "text-amber-600" : "text-slate-400")}>
                            {currentLength}/{maxLength}
                        </span>
                    )}
                </div>
                <input
                    id={inputId}
                    ref={ref}
                    value={localValue}
                    onChange={handleChange}
                    maxLength={maxLength}
                    className={cn(
                        'flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-red-500 focus-visible:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

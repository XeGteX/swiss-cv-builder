import React, { useState, useEffect, useRef } from 'react';
import { cn } from './Button';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    debounceTime?: number;
    maxLength?: number;
    variant?: 'default' | 'glass';
    required?: boolean;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, value, onChange, debounceTime = 300, maxLength, variant = 'default', required, icon, ...props }, ref) => {
        const inputId = id || React.useId();
        const [localValue, setLocalValue] = useState<string | number | readonly string[] | undefined>(value);
        const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        const variants = {
            default: "bg-white border-surface-300 text-surface-900 focus:border-brand-500 focus:ring-brand-500",
            glass: "glass-input"
        };

        return (
            <div className="w-full space-y-1.5">
                <div className="flex justify-between items-baseline">
                    {label && (
                        <label htmlFor={inputId} className={cn(
                            "block text-xs font-semibold ml-1",
                            variant === 'glass' ? "text-slate-300" : "text-surface-700"
                        )}>
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    {maxLength && (
                        <span className={cn("text-[10px] font-medium", isNearLimit ? "text-amber-600" : (variant === 'glass' ? "text-surface-400" : "text-surface-400"))}>
                            {currentLength}/{maxLength}
                        </span>
                    )}
                </div>
                <div className="relative">
                    {icon && (
                        <div className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2",
                            variant === 'glass' ? "text-surface-400" : "text-surface-400"
                        )}>
                            {icon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        value={localValue}
                        onChange={handleChange}
                        maxLength={maxLength}
                        className={cn(
                            "w-full rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200",
                            icon ? "pl-10" : "",
                            variants[variant],
                            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

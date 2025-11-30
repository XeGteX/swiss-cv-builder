
import React from 'react';
import { cn } from './Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline' | 'ghost';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const variants = {
            default: 'bg-white shadow-sm border border-slate-200',
            outline: 'bg-transparent border border-slate-200',
            ghost: 'bg-slate-50 border-none',
        };

        const paddings = {
            none: 'p-0',
            sm: 'p-3',
            md: 'p-5',
            lg: 'p-6',
        };

        return (
            <div
                ref={ref}
                className={cn('rounded-xl overflow-hidden', variants[variant], paddings[padding], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';


import React from 'react';
import { cn } from '../atoms/Button';

interface SectionHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    description,
    action,
    icon,
    className,
}) => {
    return (
        <div className={cn('flex items-start justify-between mb-4', className)}>
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    {icon && <span className="text-indigo-600">{icon}</span>}
                    {title}
                </h3>
                {description && <p className="text-xs text-slate-500">{description}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

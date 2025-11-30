import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface WizardProgressProps {
    steps: {
        id: string;
        label: string;
        completed: boolean;
    }[];
    className?: string;
}

/**
 * Desktop wizard progress bar with animated checkmarks
 * Shows completion status for CV building steps
 */
export const WizardProgress: React.FC<WizardProgressProps> = ({ steps, className = '' }) => {
    return (
        <div className={`flex items-center justify-center gap-4 px-6 py-4 ${className}`}>
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-2">
                        {/* Circle with checkmark */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center
                                ${step.completed
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                                }
                                transition-all duration-300
                            `}
                        >
                            {step.completed ? (
                                <Check size={20} strokeWidth={3} />
                            ) : (
                                <span className="text-sm font-semibold">{index + 1}</span>
                            )}
                        </motion.div>

                        {/* Label */}
                        <span className={`
                            text-xs font-medium
                            ${step.completed ? 'text-emerald-600' : 'text-gray-500'}
                        `}>
                            {step.label}
                        </span>
                    </div>

                    {/* Connector line */}
                    {index < steps.length - 1 && (
                        <div className="flex-1 h-[2px] bg-gray-200 rounded-full overflow-hidden min-w-[40px] max-w-[80px]">
                            <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: step.completed ? '100%' : '0%' }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

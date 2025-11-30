
import React from 'react';
import { motion } from 'framer-motion';

interface LiquidTabProps {
    children: React.ReactNode;
    className?: string;
    id: string; // Unique key for AnimatePresence
}

const variants = {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.98 }
};

const transition: any = {
    type: "spring",
    stiffness: 300,
    damping: 30
};

export const LiquidTab: React.FC<LiquidTabProps> = ({ children, className, id }) => {
    return (
        <motion.div
            key={id}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
            className={`h-full w-full ${className || ''}`}
        >
            {children}
        </motion.div>
    );
};

import React, { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageStackProps {
    children: ReactNode;
    pageCount: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export const PageStack: React.FC<PageStackProps> = ({
    children,
    pageCount,
    currentPage,
    onPageChange
}) => {
    return (
        <div className="relative w-full">
            {/* 3D Stack Container */}
            <div className="relative" style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}>
                {/* Render all pages with 3D card stack effect */}
                <AnimatePresence mode="sync">
                    {Array.from({ length: pageCount }).map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === currentPage;
                        const isBehind = pageNumber < currentPage;

                        // Calculate offset and rotation for stack effect
                        const offset = isCurrentPage ? 0 : isBehind ? -20 : 20;
                        const scale = isCurrentPage ? 1 : 0.95;
                        const rotateY = isCurrentPage ? 0 : isBehind ? -5 : 5;
                        const zIndex = isCurrentPage ? 50 : isBehind ? pageNumber : (pageCount - pageNumber + 10);

                        return (
                            <motion.div
                                key={pageNumber}
                                className="absolute top-0 left-0 w-full"
                                initial={false}
                                animate={{
                                    y: offset,
                                    scale,
                                    rotateY,
                                    zIndex,
                                    opacity: isCurrentPage ? 1 : 0.7,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 30,
                                    mass: 0.8
                                }}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transformOrigin: 'center center',
                                    pointerEvents: isCurrentPage ? 'auto' : 'none',
                                }}
                            >
                                {/* Page Shadow */}
                                <div
                                    className="absolute inset-0 rounded-lg transition-opacity"
                                    style={{
                                        boxShadow: isCurrentPage
                                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 100px rgba(99, 102, 241, 0.1)'
                                            : '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
                                        opacity: isCurrentPage ? 1 : 0.5
                                    }}
                                />

                                {/* Page Content Container */}
                                <div
                                    className="relative bg-white rounded-lg overflow-hidden"
                                    style={{
                                        clipPath: `inset(${(pageNumber - 1) * 1123}px 0px ${Math.max(0, (pageCount - pageNumber) * 1123)}px 0px)`,
                                    }}
                                >
                                    {children}
                                </div>

                                {/* Glassmorphism Glow for current page */}
                                {isCurrentPage && (
                                    <motion.div
                                        className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-xl"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.5 }}
                                        style={{ zIndex: -1 }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Spacer to maintain height */}
                <div style={{ height: '1123px' }} />
            </div>

            {/* Page Navigation Buttons */}
            {pageCount > 1 && (
                <motion.div
                    className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {Array.from({ length: pageCount }).map((_, index) => {
                        const pageNumber = index + 1;
                        const isActive = pageNumber === currentPage;

                        return (
                            <motion.button
                                key={pageNumber}
                                onClick={() => onPageChange(pageNumber)}
                                className={`
                                    relative px-4 py-2 rounded-lg font-medium text-sm transition-all
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }
                                `}
                                style={{
                                    background: isActive
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: isActive
                                        ? '0 8px 32px rgba(99, 102, 241, 0.3)'
                                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)'
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Glassmorphism border */}
                                <div
                                    className="absolute inset-0 rounded-lg"
                                    style={{
                                        border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.5)',
                                        pointerEvents: 'none'
                                    }}
                                />

                                {pageNumber}

                                {/* Active indicator glow */}
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 rounded-lg bg-white"
                                        style={{ opacity: 0.2 }}
                                        animate={{
                                            opacity: [0.2, 0.4, 0.2],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut'
                                        }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
};

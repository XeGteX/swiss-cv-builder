/**
 * InlineSkillsEditor - Inline editing for skills section
 * 
 * Features:
 * - Click skill to select for deletion
 * - X button to remove selected skill
 * - Add new skill inline
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Sparkles } from 'lucide-react';
import { useCVStoreV2 } from '../../../application/store/v2';

interface InlineSkillsEditorProps {
    skills: string[];
    accentColor: string;
    onClose?: () => void;
}

export const InlineSkillsEditor: React.FC<InlineSkillsEditorProps> = ({
    skills,
    accentColor,
    onClose
}) => {
    const removeSkill = useCVStoreV2((state) => state.removeSkill);
    const addSkill = useCVStoreV2((state) => state.addSkill);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [isAdding, setIsAdding] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                if (!isAdding) {
                    onClose?.();
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, isAdding]);

    const handleRemoveSkill = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        removeSkill(index);
    };

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            addSkill(newSkill.trim());
            setNewSkill('');
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewSkill('');
        }
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
        >
            {/* Skills Grid */}
            <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                    {skills.map((skill, index) => (
                        <motion.div
                            key={`${skill}-${index}`}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group"
                            onMouseEnter={() => setHoveredSkill(index)}
                            onMouseLeave={() => setHoveredSkill(null)}
                        >
                            <div
                                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                                style={{
                                    backgroundColor: `${accentColor}15`,
                                    color: accentColor,
                                    border: `1px solid ${accentColor}30`,
                                }}
                            >
                                <span>{skill}</span>
                            </div>

                            {/* Delete button - overlay in top-right corner */}
                            <AnimatePresence>
                                {hoveredSkill === index && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        onClick={(e) => handleRemoveSkill(index, e)}
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                                        style={{
                                            backgroundColor: '#ef4444',
                                            color: 'white'
                                        }}
                                    >
                                        <X size={12} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add Skill Button or Input */}
                {isAdding ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nouvelle compétence..."
                            autoFocus
                            className="px-3 py-1.5 rounded-full text-sm bg-white/5 text-gray-800 border border-gray-300 focus:border-purple-500 outline-none w-40"
                            style={{
                                backgroundColor: 'white',
                            }}
                        />
                        <button
                            onClick={handleAddSkill}
                            disabled={!newSkill.trim()}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                            style={{
                                backgroundColor: accentColor,
                                color: 'white'
                            }}
                        >
                            <Check size={14} />
                        </button>
                        <button
                            onClick={() => {
                                setIsAdding(false);
                                setNewSkill('');
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setIsAdding(true);
                            setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed flex items-center gap-1.5 transition-all hover:border-solid"
                        style={{
                            borderColor: `${accentColor}50`,
                            color: accentColor,
                            backgroundColor: `${accentColor}05`
                        }}
                    >
                        <Plus size={14} />
                        <span>Ajouter</span>
                    </motion.button>
                )}
            </div>

            {/* Helper text */}
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Sparkles size={12} />
                Survolez une compétence pour la supprimer
            </p>
        </motion.div>
    );
};

export default InlineSkillsEditor;

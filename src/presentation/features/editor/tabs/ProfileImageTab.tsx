/**
 * ProfileImageTab - AI-powered profile image editor
 * 
 * Features:
 * - Style presets
 * - Background removal
 * - Image enhancement
 * - Upload or generate
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Camera,
    Upload,
    Sparkles,
    Wand2,
    Eraser,
    Sun,
    ImagePlus,
    Check,
    Loader2
} from 'lucide-react';

import { useProfileImageGenerator, type ImageStyle } from '../../../hooks/useProfileImageGenerator';
import { useCVStoreV2 } from '../../../../application/store/v2';

// ============================================================================
// STYLE PRESETS
// ============================================================================

const STYLE_PRESETS: { id: ImageStyle; label: string; emoji: string; color: string }[] = [
    { id: 'corporate', label: 'Corporate', emoji: '💼', color: 'from-blue-600 to-slate-600' },
    { id: 'creative', label: 'Créatif', emoji: '🎨', color: 'from-pink-500 to-orange-500' },
    { id: 'tech', label: 'Tech', emoji: '💻', color: 'from-cyan-500 to-purple-600' },
    { id: 'friendly', label: 'Friendly', emoji: '😊', color: 'from-green-500 to-teal-500' },
    { id: 'minimal', label: 'Minimal', emoji: '⚪', color: 'from-slate-400 to-gray-500' }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProfileImageTab() {
    const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('corporate');
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        isGenerating,
        generateImage,
        removeBackground,
        enhanceImage
    } = useProfileImageGenerator();

    const updateField = useCVStoreV2(state => state.updateField);

    // Handle image upload
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setCurrentImage(dataUrl);
            updateField('personal.photo', dataUrl);
            showSuccess();
        };
        reader.readAsDataURL(file);
    };

    // Generate AI image
    const handleGenerate = async () => {
        const imageUrl = await generateImage(selectedStyle);
        if (imageUrl) {
            setCurrentImage(imageUrl);
            updateField('personal.photo', imageUrl);
            showSuccess();
        }
    };

    // Remove background
    const handleRemoveBackground = async () => {
        if (!currentImage) return;
        const result = await removeBackground(currentImage);
        if (result) {
            setCurrentImage(result);
            updateField('personal.photo', result);
            showSuccess();
        }
    };

    // Enhance image
    const handleEnhance = async () => {
        if (!currentImage) return;
        const result = await enhanceImage(currentImage);
        if (result) {
            setCurrentImage(result);
            updateField('personal.photo', result);
            showSuccess();
        }
    };

    const showSuccess = () => {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-200">Photo de profil</h2>
                    <p className="text-xs text-slate-400">IA & Retouche automatique</p>
                </div>
            </div>

            {/* Current Image Preview */}
            <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden bg-white/5 border-2 border-white/20">
                {currentImage ? (
                    <img
                        src={currentImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Camera className="w-8 h-8" />
                    </div>
                )}

                {/* Success Overlay */}
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-green-500/50 flex items-center justify-center"
                    >
                        <Check className="w-8 h-8 text-white" />
                    </motion.div>
                )}

                {/* Loading Overlay */}
                {isGenerating && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Upload Button */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
            />
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 flex items-center justify-center gap-2"
            >
                <Upload className="w-4 h-4" />
                Importer une photo
            </motion.button>

            {/* Style Presets */}
            <div>
                <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Style IA
                </div>
                <div className="grid grid-cols-5 gap-1">
                    {STYLE_PRESETS.map(style => (
                        <motion.button
                            key={style.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedStyle(style.id)}
                            className={`py-2 rounded-lg text-center transition-all ${selectedStyle === style.id
                                    ? `bg-gradient-to-br ${style.color} text-white`
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                        >
                            <div className="text-lg">{style.emoji}</div>
                            <div className="text-[9px] mt-0.5">{style.label}</div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Génération en cours...
                    </>
                ) : (
                    <>
                        <ImagePlus className="w-4 h-4" />
                        Générer avec l'IA
                    </>
                )}
            </motion.button>

            {/* Enhancement Tools */}
            {currentImage && (
                <div className="grid grid-cols-2 gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRemoveBackground}
                        disabled={isGenerating}
                        className="py-2 rounded-lg bg-white/5 text-sm text-slate-300 hover:bg-white/10 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Eraser className="w-4 h-4" />
                        Suppr. fond
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleEnhance}
                        disabled={isGenerating}
                        className="py-2 rounded-lg bg-white/5 text-sm text-slate-300 hover:bg-white/10 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Sun className="w-4 h-4" />
                        Améliorer
                    </motion.button>
                </div>
            )}

            {/* Pro Tip */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 text-xs text-purple-300">
                    <Wand2 className="w-4 h-4" />
                    <span>Conseil : Une photo pro augmente vos chances de 40% !</span>
                </div>
            </div>
        </div>
    );
}

export default ProfileImageTab;

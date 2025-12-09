/**
 * AI Profile Image Generator
 * 
 * Generate professional profile images using AI:
 * - Style presets (Corporate, Creative, Tech)
 * - Background removal
 * - Enhancement filters
 */

import { useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ImageStyle = 'corporate' | 'creative' | 'tech' | 'friendly' | 'minimal';

export interface GeneratedImage {
    id: string;
    url: string;
    style: ImageStyle;
    prompt: string;
    createdAt: Date;
}

export interface UseProfileImageReturn {
    isGenerating: boolean;
    generatedImages: GeneratedImage[];
    generateImage: (style: ImageStyle, description?: string) => Promise<string | null>;
    removeBackground: (imageUrl: string) => Promise<string | null>;
    enhanceImage: (imageUrl: string) => Promise<string | null>;
}

// ============================================================================
// STYLE PROMPTS
// ============================================================================

const STYLE_PROMPTS: Record<ImageStyle, string> = {
    corporate: 'Professional headshot, business attire, neutral background, studio lighting, corporate style, high resolution',
    creative: 'Creative professional portrait, artistic lighting, colorful background, modern style, trendy',
    tech: 'Tech professional portrait, minimal background, casual-professional, startup vibe, confident',
    friendly: 'Friendly approachable portrait, warm lighting, soft background, genuine smile, welcoming',
    minimal: 'Clean minimal portrait, white background, simple lighting, modern, professional'
};

// ============================================================================
// HOOK
// ============================================================================

export function useProfileImageGenerator(): UseProfileImageReturn {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

    const generateImage = useCallback(async (
        style: ImageStyle,
        description?: string
    ): Promise<string | null> => {
        setIsGenerating(true);

        try {
            // @ts-ignore - import.meta.env is Vite-specific
            const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                console.error('[ProfileImage] No API key');
                return null;
            }

            // Build prompt
            const basePrompt = STYLE_PROMPTS[style];
            const fullPrompt = description
                ? `${basePrompt}, ${description}`
                : basePrompt;

            // Use Gemini's Imagen or similar
            // For now, we'll use a placeholder approach
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Create a detailed description for a professional ${style} profile photo. The description should be: ${fullPrompt}. Respond with just a vivid visual description.`
                            }]
                        }]
                    })
                }
            );

            const data = await response.json();
            const imageDescription = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // For actual image generation, you would call an image API here
            // This is a placeholder that returns the description
            const generatedImage: GeneratedImage = {
                id: Date.now().toString(),
                url: `data:text/plain;base64,${btoa(imageDescription)}`,
                style,
                prompt: fullPrompt,
                createdAt: new Date()
            };

            setGeneratedImages(prev => [generatedImage, ...prev]);

            // Return placeholder image URL
            // In production, this would be the actual generated image
            return `/profile-placeholder-${style}.png`;

        } catch (error) {
            console.error('[ProfileImage] Generation failed:', error);
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const removeBackground = useCallback(async (imageUrl: string): Promise<string | null> => {
        setIsGenerating(true);

        try {
            // Use Canvas API for basic background removal
            // In production, use a proper API like remove.bg
            const img = new Image();
            img.crossOrigin = 'anonymous';

            return new Promise((resolve) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        resolve(null);
                        return;
                    }

                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Basic background removal (would need proper ML in production)
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Simple white background removal
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];

                        // If close to white, make transparent
                        if (r > 240 && g > 240 && b > 240) {
                            data[i + 3] = 0; // Alpha
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };

                img.onerror = () => resolve(null);
                img.src = imageUrl;
            });

        } catch (error) {
            console.error('[ProfileImage] Background removal failed:', error);
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const enhanceImage = useCallback(async (imageUrl: string): Promise<string | null> => {
        setIsGenerating(true);

        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            return new Promise((resolve) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        resolve(null);
                        return;
                    }

                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Apply enhancements
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Increase contrast and saturation
                    const contrast = 1.1;
                    const saturation = 1.15;

                    for (let i = 0; i < data.length; i += 4) {
                        // Contrast
                        data[i] = ((data[i] / 255 - 0.5) * contrast + 0.5) * 255;
                        data[i + 1] = ((data[i + 1] / 255 - 0.5) * contrast + 0.5) * 255;
                        data[i + 2] = ((data[i + 2] / 255 - 0.5) * contrast + 0.5) * 255;

                        // Saturation
                        const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                        data[i] = gray + (data[i] - gray) * saturation;
                        data[i + 1] = gray + (data[i + 1] - gray) * saturation;
                        data[i + 2] = gray + (data[i + 2] - gray) * saturation;

                        // Clamp values
                        data[i] = Math.max(0, Math.min(255, data[i]));
                        data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
                        data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
                    }

                    ctx.putImageData(imageData, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                };

                img.onerror = () => resolve(null);
                img.src = imageUrl;
            });

        } catch (error) {
            console.error('[ProfileImage] Enhancement failed:', error);
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return {
        isGenerating,
        generatedImages,
        generateImage,
        removeBackground,
        enhanceImage
    };
}

export default useProfileImageGenerator;

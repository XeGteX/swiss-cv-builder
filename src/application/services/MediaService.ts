/**
 * MEDIA SERVICE - Secure Upload to Supabase Storage
 * 
 * SECURITY FEATURES:
 * - Max file size: 20MB (protects free tier quota)
 * - Allowed types: JPEG, PNG, MP4, MOV only
 * - Unique naming: timestamp + random to prevent overwrites
 * - Error handling with explicit messages
 * 
 * Bucket: scv-media (Public)
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

// ===================== CONSTANTS =====================
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const MAX_FILE_SIZE_MB = 20;
const BUCKET_NAME = 'scv-media';

const ALLOWED_TYPES: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
};

// ===================== TYPES =====================
export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export interface UploadProgressCallback {
    (progress: number): void;
}

// ===================== VALIDATION =====================
export const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check size
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum autorisé: ${MAX_FILE_SIZE_MB}MB`,
        };
    }

    // Check type
    if (!ALLOWED_TYPES[file.type]) {
        const allowedList = Object.keys(ALLOWED_TYPES)
            .map(t => t.split('/')[1].toUpperCase())
            .join(', ');
        return {
            valid: false,
            error: `Type de fichier non autorisé. Formats acceptés: ${allowedList}`,
        };
    }

    return { valid: true };
};

// ===================== UNIQUE FILENAME GENERATOR =====================
const generateUniqueFilename = (originalName: string, folder: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'bin';
    return `${folder}/${timestamp}-${random}.${extension}`;
};

// ===================== MAIN UPLOAD FUNCTION =====================
/**
 * Upload media file to Supabase Storage with strict validation
 * 
 * @param file - The file to upload
 * @param folder - Subfolder within the bucket (e.g., 'avatars', 'projects')
 * @returns UploadResult with success status, URL or error message
 */
export const uploadMedia = async (
    file: File,
    folder: string = 'general'
): Promise<UploadResult> => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
        return {
            success: false,
            error: 'Supabase non configuré. Vérifiez les variables d\'environnement.',
        };
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
        };
    }

    // Generate unique filename
    const filePath = generateUniqueFilename(file.name, folder);

    try {
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false, // Prevent accidental overwrites
            });

        if (error) {
            console.error('❌ Supabase upload error:', error);
            return {
                success: false,
                error: `Erreur d'upload: ${error.message}`,
            };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        console.log('✅ Upload successful:', urlData.publicUrl);

        return {
            success: true,
            url: urlData.publicUrl,
        };
    } catch (err) {
        console.error('❌ Upload exception:', err);
        return {
            success: false,
            error: 'Erreur réseau lors de l\'upload. Réessayez.',
        };
    }
};

// ===================== DELETE FUNCTION =====================
export const deleteMedia = async (fileUrl: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    try {
        // Extract path from URL
        const url = new URL(fileUrl);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/scv-media\/(.+)/);
        if (!pathMatch) return false;

        const filePath = pathMatch[1];

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        return !error;
    } catch {
        return false;
    }
};

// ===================== HELPER: Check if file is image =====================
export const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
};

// ===================== HELPER: Check if file is video =====================
export const isVideoFile = (file: File): boolean => {
    return file.type.startsWith('video/');
};

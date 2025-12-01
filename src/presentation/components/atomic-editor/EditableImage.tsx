/**
 * EditableImage - Image Upload Component (Projet Narcisse)
 * 
 * Features:
 * - Displays current image (circular avatar)
 * - Hover overlay with upload icon
 * - Double-click or click overlay to upload
 * - Converts to Base64 for instant preview
 * - Updates store via callback
 */

import React, { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

interface EditableImageProps {
    src?: string;
    alt?: string;
    className?: string;
    onImageChange: (imageData: string) => void;
}

export const EditableImage: React.FC<EditableImageProps> = ({
    src,
    alt = 'Profile Photo',
    className = '',
    onImageChange
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            // Convert to Base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                onImageChange(base64);
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert('Error reading file');
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
            setIsUploading(false);
        }
    };

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={handleClick}
        >
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Image container */}
            <div className="w-36 h-36 bg-white rounded-full overflow-hidden border-4 border-white/30 shadow-lg relative z-10 shrink-0 aspect-square cursor-pointer">
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full block object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                        <Camera size={40} />
                    </div>
                )}

                {/* Hover overlay */}
                {(isHovered || !src) && !isUploading && (
                    <div
                        className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 transition-opacity duration-200"
                        onClick={handleClick}
                    >
                        <Upload size={24} className="text-white" />
                        <span className="text-white text-xs font-semibold">
                            {src ? 'Changer' : 'Ajouter'}
                        </span>
                    </div>
                )}

                {/* Uploading indicator */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-white text-xs font-semibold">
                            Upload...
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions hint */}
            {isHovered && !isUploading && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs whitespace-nowrap">
                    Double-clic pour changer
                </div>
            )}
        </div>
    );
};

export default EditableImage;

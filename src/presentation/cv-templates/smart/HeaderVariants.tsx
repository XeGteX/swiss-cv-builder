/**
 * NEXAL STUDIO - Header Style Variants
 * 
 * Three distinct header designs:
 * - ModernHeader: Current glassmorphism style with rounded photo
 * - ClassicHeader: Centered, serif, horizontal lines
 * - MinimalHeader: Ultra-clean, large name left, contact right
 */

import React from 'react';
import { usePhoneFormatter } from '../../hooks/useRegion';
import { SmartPhoto } from './SmartPhoto';
import { EditableField } from '../../components/atomic-editor';

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    title?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    photoUrl?: string | null;
    birthDate?: string;
    nationality?: string;
    driverLicense?: string;
    linkedIn?: string;
    website?: string;
    contact?: {
        email?: string;
        phone?: string;
        address?: string;
    };
}

export interface HeaderVariantProps {
    personal: PersonalInfo;
    accentColor: string;
    showPhoto?: boolean;
    className?: string;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const EditableName: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
    className = '',
    style
}) => (
    <h1 className={className} style={style}>
        <EditableField path="personal.firstName" label="Prénom">
            {(firstName) => (
                <EditableField path="personal.lastName" label="Nom">
                    {(lastName) => <>{firstName} {lastName}</>}
                </EditableField>
            )}
        </EditableField>
    </h1>
);

const EditableTitle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
    className = '',
    style
}) => (
    <EditableField path="personal.title" label="Titre professionnel" className={className}>
        {(value) => value ? <p style={style}>{value}</p> : null}
    </EditableField>
);

const EditableContact: React.FC<{
    path: string;
    label: string;
    className?: string;
    style?: React.CSSProperties;
}> = ({ path, label, className = '', style }) => (
    <EditableField path={path} label={label} className={className}>
        {(value) => value ? <span style={style}>{value}</span> : null}
    </EditableField>
);

// ============================================================================
// MODERN HEADER (Current Style - Glassmorphism)
// ============================================================================

export const ModernHeader: React.FC<HeaderVariantProps> = ({
    personal,
    accentColor,
    showPhoto = true,
    className = ''
}) => {
    const formatPhone = usePhoneFormatter();

    return (
        <header
            className={`modern-header ${className}`}
            style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                borderRadius: '0 0 24px 24px'
            }}
        >
            <div className="p-6 flex gap-6">
                {/* Photo */}
                {showPhoto && personal.photoUrl && (
                    <SmartPhoto
                        src={personal.photoUrl}
                        alt={`${personal.firstName} ${personal.lastName}`}
                        size="lg"
                        className="rounded-full border-4 border-white/30 shadow-lg"
                    />
                )}

                {/* Content */}
                <div className="flex-1 text-white">
                    <EditableName className="text-2xl font-bold tracking-tight" />
                    <EditableTitle
                        className="text-lg opacity-90 mt-1"
                        style={{ fontWeight: 500 }}
                    />

                    {/* Contact Row */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-85">
                        <EditableContact
                            path="personal.contact.email"
                            label="Email"
                            className="flex items-center gap-1"
                        />
                        <EditableField path="personal.contact.phone" label="Téléphone">
                            {(value) => value ? (
                                <span className="flex items-center gap-1">
                                    {formatPhone(value)}
                                </span>
                            ) : null}
                        </EditableField>
                        <EditableContact
                            path="personal.contact.address"
                            label="Ville"
                            className="flex items-center gap-1"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

// ============================================================================
// CLASSIC HEADER (Harvard Style - Centered, Serif, Elegant Lines)
// ============================================================================

export const ClassicHeader: React.FC<HeaderVariantProps> = ({
    personal,
    accentColor,
    showPhoto = true,
    className = ''
}) => {
    const formatPhone = usePhoneFormatter();

    return (
        <header className={`classic-header text-center ${className}`}>
            <div className="py-6 px-8">
                {/* Photo - Centered (if shown) */}
                {showPhoto && personal.photoUrl && (
                    <div className="mb-4 flex justify-center">
                        <SmartPhoto
                            src={personal.photoUrl}
                            alt={`${personal.firstName} ${personal.lastName}`}
                            size="md"
                            className="border-2"
                        />
                    </div>
                )}

                {/* Name - Serif, Uppercase tracking */}
                <EditableName
                    className="text-3xl font-bold tracking-widest uppercase"
                    style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        color: accentColor,
                        letterSpacing: '0.15em'
                    }}
                />

                {/* Elegant separator line */}
                <div
                    className="w-24 h-0.5 mx-auto my-3"
                    style={{ backgroundColor: accentColor }}
                />

                {/* Title */}
                <EditableTitle
                    className="text-lg text-gray-600 italic"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                />

                {/* Contact - Single line, separated by dots */}
                <div className="flex justify-center items-center gap-3 mt-4 text-sm text-gray-600">
                    <EditableContact path="personal.contact.email" label="Email" />
                    <span className="text-gray-400">•</span>
                    <EditableField path="personal.contact.phone" label="Téléphone">
                        {(value) => value ? <span>{formatPhone(value)}</span> : null}
                    </EditableField>
                    <span className="text-gray-400">•</span>
                    <EditableContact path="personal.contact.address" label="Ville" />
                </div>

                {/* Bottom separator */}
                <div
                    className="w-full h-px mt-6"
                    style={{ backgroundColor: `${accentColor}40` }}
                />
            </div>
        </header>
    );
};

// ============================================================================
// MINIMAL HEADER (Startup Style - Bold Name Left, Contact Right)
// ============================================================================

export const MinimalHeader: React.FC<HeaderVariantProps> = ({
    personal,
    accentColor,
    className = ''
}) => {
    const formatPhone = usePhoneFormatter();

    return (
        <header className={`minimal-header ${className}`}>
            <div className="py-8 px-6 flex justify-between items-start">
                {/* Left: Big Name */}
                <div>
                    <EditableName
                        className="text-5xl font-black tracking-tight leading-none"
                        style={{ color: accentColor }}
                    />
                    <EditableTitle
                        className="text-lg text-gray-500 mt-2 font-light"
                    />
                </div>

                {/* Right: Contact stacked */}
                <div className="text-right text-sm text-gray-600 space-y-1">
                    <EditableContact
                        path="personal.contact.email"
                        label="Email"
                        className="block"
                    />
                    <EditableField path="personal.contact.phone" label="Téléphone">
                        {(value) => value ? (
                            <span className="block">{formatPhone(value)}</span>
                        ) : null}
                    </EditableField>
                    <EditableContact
                        path="personal.contact.address"
                        label="Ville"
                        className="block"
                    />
                    <EditableContact
                        path="personal.linkedIn"
                        label="LinkedIn"
                        className="block"
                        style={{ color: accentColor }}
                    />
                </div>
            </div>
        </header>
    );
};

export default { ModernHeader, ClassicHeader, MinimalHeader };

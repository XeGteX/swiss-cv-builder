/**
 * SmartHeader - Region-aware CV header with Style Variants
 * 
 * NEXAL STUDIO Integration:
 * - headerStyle: 'modern' | 'classic' | 'minimal' (from design config)
 * 
 * Falls back to region-based layouts when no style is set:
 * - compact: USA/UK (no photo, minimal personal data)
 * - full-personal: DACH (all personal data)
 * - photo-right: France/EU
 * - photo-left: Alternative
 */

import React from 'react';
import { useHeaderLayout, useRegionalDisplay, usePhoneFormatter } from '../../hooks/useRegion';
import { SmartPhoto } from './SmartPhoto';
import { EditableField } from '../../components/atomic-editor';
import { ModernHeader, ClassicHeader, MinimalHeader, type HeaderVariantProps } from './HeaderVariants';

// ============================================================================
// TYPES
// ============================================================================

interface PersonalInfo {
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

type HeaderStyle = 'modern' | 'classic' | 'minimal';

interface SmartHeaderProps {
    personal: PersonalInfo;
    accentColor?: string;
    headerStyle?: HeaderStyle;
    showPhoto?: boolean;
    className?: string;
}

// ============================================================================
// HELPER COMPONENTS (for legacy layouts)
// ============================================================================

const EditableName: React.FC<{ className?: string }> = ({ className = '' }) => (
    <h1 className={className}>
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
    prefix?: string;
    formatter?: (val: string) => string;
    className?: string;
}> = ({ path, label, prefix, formatter, className }) => (
    <EditableField path={path} label={label} className={className}>
        {(value) => value ? (
            <span>
                {prefix && <span className="text-gray-500">{prefix}</span>}
                {formatter ? formatter(value) : value}
            </span>
        ) : null}
    </EditableField>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SmartHeader: React.FC<SmartHeaderProps> = ({
    personal,
    accentColor = '#3b82f6',
    headerStyle,
    showPhoto = true,
    className = ''
}) => {
    const headerLayout = useHeaderLayout();
    const display = useRegionalDisplay();
    const formatPhone = usePhoneFormatter();

    // ========================================================================
    // NEXAL STUDIO: Header Style Variants
    // Priority: explicit headerStyle prop > region-based layout
    // ========================================================================

    if (headerStyle) {
        const variantProps: HeaderVariantProps = {
            personal,
            accentColor,
            showPhoto,
            className
        };

        switch (headerStyle) {
            case 'modern':
                return <ModernHeader {...variantProps} />;
            case 'classic':
                return <ClassicHeader {...variantProps} />;
            case 'minimal':
                return <MinimalHeader {...variantProps} />;
        }
    }

    // ========================================================================
    // LEGACY: Region-based layouts (backward compatibility)
    // ========================================================================

    // Compact header (USA/UK)
    if (headerLayout === 'compact') {
        return (
            <header
                className={`smart-header compact ${className}`}
                style={{ backgroundColor: accentColor }}
            >
                <div className="p-6 text-white">
                    <EditableName className="text-2xl font-bold" />
                    <EditableTitle className="text-lg opacity-90 mt-1" />

                    <div className="flex flex-wrap gap-4 mt-3 text-sm opacity-80">
                        <EditableContact path="personal.contact.email" label="Email" />
                        <EditableContact
                            path="personal.contact.phone"
                            label="Téléphone"
                            formatter={formatPhone}
                        />
                        {display.showAddress !== 'none' && (
                            <EditableContact path="personal.contact.address" label="Ville" />
                        )}
                        <EditableContact path="personal.linkedIn" label="LinkedIn" />
                    </div>
                </div>
            </header>
        );
    }

    // Full personal data (DACH)
    if (headerLayout === 'full-personal') {
        return (
            <header className={`smart-header full-personal ${className}`}>
                <div className="flex gap-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <div className="flex-1">
                        <EditableName className="text-2xl font-bold text-gray-900" />
                        <EditableTitle className="text-lg text-gray-600 mt-1" />

                        <div className="mt-4 space-y-1 text-sm text-gray-700">
                            <EditableContact
                                path="personal.contact.email"
                                label="Email"
                                prefix="Email: "
                            />
                            <EditableContact
                                path="personal.contact.phone"
                                label="Téléphone"
                                prefix="Tel: "
                                formatter={formatPhone}
                            />
                            {display.showAddress === 'full' && (
                                <EditableContact
                                    path="personal.contact.address"
                                    label="Adresse"
                                    prefix="Adresse: "
                                />
                            )}
                        </div>
                    </div>

                    <SmartPhoto
                        src={personal.photoUrl}
                        alt={`${personal.firstName} ${personal.lastName}`}
                        size="lg"
                    />
                </div>
            </header>
        );
    }

    // Photo right (France, EU default)
    if (headerLayout === 'photo-right') {
        return (
            <header
                className={`smart-header photo-right ${className}`}
                style={{ borderColor: accentColor }}
            >
                <div className="flex gap-6 p-6 border-b-4">
                    <div className="flex-1">
                        <EditableName className="text-2xl font-bold text-gray-900" />
                        <EditableTitle style={{ color: accentColor }} className="text-lg" />

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
                            <EditableContact path="personal.contact.email" label="Email" />
                            <EditableContact
                                path="personal.contact.phone"
                                label="Téléphone"
                                formatter={formatPhone}
                            />
                            <EditableContact path="personal.contact.address" label="Ville" />
                        </div>
                    </div>

                    <SmartPhoto
                        src={personal.photoUrl}
                        alt={`${personal.firstName} ${personal.lastName}`}
                        size="md"
                    />
                </div>
            </header>
        );
    }

    // Default/centered - Uses Modern style as default
    return (
        <ModernHeader
            personal={personal}
            accentColor={accentColor}
            showPhoto={showPhoto}
            className={className}
        />
    );
};

export default SmartHeader;


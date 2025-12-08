/**
 * SmartHeader - Region-aware CV header with Inline Editing
 * 
 * Adapts layout based on region:
 * - compact: USA/UK (no photo, minimal personal data)
 * - full-personal: DACH (all personal data)
 * - photo-right: France/EU
 * - photo-left: Alternative
 */

import React from 'react';
import { useHeaderLayout, useRegionalDisplay, useNameFormatter, usePhoneFormatter } from '../../hooks/useRegion';
import { SmartPhoto } from './SmartPhoto';
import { EditableField } from '../../components/atomic-editor';

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
}

interface SmartHeaderProps {
    personal: PersonalInfo;
    accentColor?: string;
    className?: string;
}

// Reusable editable name component
const EditableName: React.FC<{ firstName: string; lastName: string; className?: string }> = ({
    className = ''
}) => {
    const formatName = useNameFormatter();

    return (
        <h1 className={className}>
            <EditableField path="personal.firstName" label="Prénom">
                {(firstName) => (
                    <EditableField path="personal.lastName" label="Nom">
                        {(lastName) => <>{formatName(firstName, lastName)}</>}
                    </EditableField>
                )}
            </EditableField>
        </h1>
    );
};

// Reusable editable title
const EditableTitle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
    className = '',
    style
}) => (
    <EditableField path="personal.title" label="Titre professionnel" className={className}>
        {(value) => value ? <p style={style}>{value}</p> : null}
    </EditableField>
);

// Reusable editable contact item
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

export const SmartHeader: React.FC<SmartHeaderProps> = ({
    personal,
    accentColor = '#3b82f6',
    className = ''
}) => {
    const headerLayout = useHeaderLayout();
    const display = useRegionalDisplay();
    const formatPhone = usePhoneFormatter();

    // Compact header (USA/UK)
    if (headerLayout === 'compact') {
        return (
            <header
                className={`smart-header compact ${className}`}
                style={{ backgroundColor: accentColor }}
            >
                <div className="p-6 text-white">
                    <EditableName
                        firstName={personal.firstName}
                        lastName={personal.lastName}
                        className="text-2xl font-bold"
                    />
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
                    {/* Personal data column */}
                    <div className="flex-1">
                        <EditableName
                            firstName={personal.firstName}
                            lastName={personal.lastName}
                            className="text-2xl font-bold text-gray-900"
                        />
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
                            {display.showDateOfBirth && (
                                <EditableField path="personal.birthDate" label="Date de naissance">
                                    {(value) => value ? (
                                        <p><span className="text-gray-500">Geburtsdatum:</span> {value}</p>
                                    ) : null}
                                </EditableField>
                            )}
                            {display.showNationality && (
                                <EditableField path="personal.nationality" label="Nationalité">
                                    {(value) => value ? (
                                        <p><span className="text-gray-500">Nationalität:</span> {value}</p>
                                    ) : null}
                                </EditableField>
                            )}
                            {display.showDriverLicense && (
                                <EditableField path="personal.driverLicense" label="Permis">
                                    {(value) => value ? (
                                        <p><span className="text-gray-500">Führerschein:</span> {value}</p>
                                    ) : null}
                                </EditableField>
                            )}
                        </div>
                    </div>

                    {/* Photo on right */}
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
                        <EditableName
                            firstName={personal.firstName}
                            lastName={personal.lastName}
                            className="text-2xl font-bold text-gray-900"
                        />
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

    // Default/centered
    return (
        <header
            className={`smart-header centered text-center ${className}`}
            style={{ backgroundColor: accentColor }}
        >
            <div className="p-6 text-white">
                <SmartPhoto
                    src={personal.photoUrl}
                    alt={`${personal.firstName} ${personal.lastName}`}
                    size="lg"
                    className="mx-auto mb-4"
                />
                <EditableName
                    firstName={personal.firstName}
                    lastName={personal.lastName}
                    className="text-2xl font-bold"
                />
                <EditableTitle className="text-lg opacity-90 mt-1" />

                <div className="flex justify-center gap-4 mt-3 text-sm opacity-80">
                    <EditableContact path="personal.contact.email" label="Email" />
                    <EditableContact
                        path="personal.contact.phone"
                        label="Téléphone"
                        formatter={formatPhone}
                    />
                </div>
            </div>
        </header>
    );
};

export default SmartHeader;

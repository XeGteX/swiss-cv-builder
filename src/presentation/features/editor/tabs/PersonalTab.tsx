
import React from 'react';
import { useCVStore } from '../../../../application/store/cv-store';
import { Input } from '../../../design-system/atoms/Input';
import { TextArea } from '../../../design-system/atoms/TextArea';
import { SectionHeader } from '../../../design-system/molecules/SectionHeader';
import { User, Palette } from 'lucide-react';
import { Card } from '../../../design-system/atoms/Card';
import { useTranslation } from '../../../hooks/useTranslation';

export const PersonalTab: React.FC = () => {
    const { profile, updatePersonal, updateMetadata } = useCVStore();
    const { personal, metadata } = profile;
    const { t } = useTranslation();

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 1. Check Size (Max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image trop lourde. Maximum 2MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;

                // 2. Check Dimensions (Max 2048x2048)
                const img = new Image();
                img.onload = () => {
                    if (img.width > 2048 || img.height > 2048) {
                        alert('Image trop grande. Maximum 2048x2048 pixels.');
                        return;
                    }
                    updatePersonal({ photoUrl: result });
                };
                img.src = result;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Theme Config */}
            <Card className="bg-slate-50 border-slate-200">
                <SectionHeader
                    title={t('personal.title')} // Using title from personal section as proxy for "Apparence" or add new key
                    icon={<Palette size={16} />}
                    className="mb-3"
                />
                <div className="flex gap-2 flex-wrap">
                    {['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#0f172a'].map((color) => (
                        <button
                            key={color}
                            onClick={() => updateMetadata({ accentColor: color })}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${metadata.accentColor === color ? 'border-slate-600 scale-110' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </Card>

            {/* Personal Info */}
            <div>
                <SectionHeader title={t('personal.title')} icon={<User size={16} />} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                        label={t('personal.firstName')}
                        value={personal.firstName}
                        onChange={(e) => updatePersonal({ firstName: e.target.value })}
                        maxLength={50}
                        debounceTime={300}
                    />
                    <Input
                        label={t('personal.lastName')}
                        value={personal.lastName}
                        onChange={(e) => updatePersonal({ lastName: e.target.value })}
                        maxLength={50}
                        debounceTime={300}
                    />
                </div>
                <Input
                    label={t('personal.role')}
                    value={personal.title}
                    onChange={(e) => updatePersonal({ title: e.target.value })}
                    className="mb-4 font-bold"
                    maxLength={100}
                    debounceTime={300}
                />

                <div className="space-y-4">
                    <Input
                        label="Photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    />

                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-3">
                        <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                            🇨🇭 Champs Requis (Suisse)
                        </p>
                        <Input
                            label={t('personal.birthDate')}
                            value={personal.birthDate || ''}
                            onChange={(e) => updatePersonal({ birthDate: e.target.value })}
                            className="bg-white"
                        />
                        <Input
                            label={t('personal.nationality')}
                            value={personal.nationality || ''}
                            onChange={(e) => updatePersonal({ nationality: e.target.value })}
                            className="bg-white"
                        />
                        <Input
                            label={t('personal.permit')}
                            value={personal.permit || ''}
                            onChange={(e) => updatePersonal({ permit: e.target.value })}
                            className="bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label={t('personal.email')}
                            value={personal.contact.email || ''}
                            onChange={(e) => updatePersonal({ contact: { ...personal.contact, email: e.target.value } })}
                        />
                        <Input
                            label={t('personal.phone')}
                            value={personal.contact.phone || ''}
                            onChange={(e) => updatePersonal({ contact: { ...personal.contact, phone: e.target.value } })}
                        />
                        <Input
                            label={t('personal.address')}
                            value={personal.contact.address || ''}
                            onChange={(e) => updatePersonal({ contact: { ...personal.contact, address: e.target.value } })}
                        />
                        <Input
                            label={t('personal.mobility')}
                            value={personal.mobility || ''}
                            onChange={(e) => updatePersonal({ mobility: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div>
                <SectionHeader title={t('sections.summary')} />
                <TextArea
                    value={profile.summary}
                    onChange={(e) => useCVStore.getState().updateSummary(e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Décrivez votre profil en quelques lignes..."
                    debounceTime={300}
                />
            </div>
        </div>
    );
};

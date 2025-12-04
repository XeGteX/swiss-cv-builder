
import React from 'react';
import { useCVStoreV2 } from '../../../../application/store/v2';
import { Input } from '../../../design-system/atoms/Input';
import { TextArea } from '../../../design-system/atoms/TextArea';
import { SectionHeader } from '../../../design-system/molecules/SectionHeader';
import { User, Palette } from 'lucide-react';
import { Card } from '../../../design-system/atoms/Card';
import { useTranslation } from '../../../hooks/useTranslation';

export const PersonalTab: React.FC = () => {
    const profile = useCVStoreV2((state) => state.profile);
    const updateField = useCVStoreV2((state) => state.updateField);
    const { t } = useTranslation();

    if (!profile || !profile.personal || !profile.metadata) {
        return <div className="p-4 text-slate-400">Chargement du profil...</div>;
    }

    const { personal, metadata } = profile;

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
                    updateField('personal.photoUrl', result);
                };
                img.src = result;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Theme Config */}
            <Card variant="glass" className="border-white/10">
                <SectionHeader
                    title="Couleur du CV"
                    icon={<Palette size={16} className="text-white" />}
                    className="mb-3 text-white"
                />
                <div className="flex gap-2 flex-wrap">
                    {['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#0f172a'].map((color) => (
                        <button
                            key={color}
                            onClick={() => updateField('metadata.accentColor', color)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${metadata.accentColor === color ? 'border-white scale-110' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </Card>

            {/* Personal Info */}
            <div>
                <SectionHeader title={t('personal.title')} icon={<User size={16} className="text-white" />} className="text-white" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                        variant="glass"
                        label={t('personal.firstName')}
                        value={personal.firstName}
                        onChange={(e) => updateField('personal.firstName', e.target.value)}
                        maxLength={50}
                        debounceTime={300}
                    />
                    <Input
                        variant="glass"
                        label={t('personal.lastName')}
                        value={personal.lastName}
                        onChange={(e) => updateField('personal.lastName', e.target.value)}
                        maxLength={50}
                        debounceTime={300}
                    />
                </div>
                <Input
                    variant="glass"
                    label={t('personal.role')}
                    value={personal.title}
                    onChange={(e) => updateField('personal.title', e.target.value)}
                    className="mb-4 font-bold"
                    maxLength={100}
                    debounceTime={300}
                />

                <div className="space-y-4">
                    <Input
                        variant="glass"
                        label="Photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="file:text-white file:bg-white/10 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 hover:file:bg-white/20"
                    />

                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                        <p className="text-xs text-white font-bold flex items-center gap-1">
                            🇨🇭 Informations Complémentaires (Suisse)
                        </p>
                        <Input
                            variant="glass"
                            label={t('personal.birthDate')}
                            value={personal.birthDate || ''}
                            onChange={(e) => updateField('personal.birthDate', e.target.value)}
                            placeholder="ex: 15 mars 1990"
                        />
                        <Input
                            variant="glass"
                            label={t('personal.nationality')}
                            value={personal.nationality || ''}
                            onChange={(e) => updateField('personal.nationality', e.target.value)}
                            placeholder="ex: Suisse, Français"
                        />
                        <div>
                            <label className="block text-xs font-semibold text-white mb-1">{t('personal.permit')}</label>
                            <select
                                className="glass-input w-full p-2 rounded text-sm outline-none bg-slate-900/50 text-slate-200 border border-white/10 focus:border-brand-500"
                                value={personal.permit || ''}
                                onChange={(e) => updateField('personal.permit', e.target.value)}
                            >
                                <option value="" className="bg-slate-900">Sélectionner...</option>
                                <option value="Permis B" className="bg-slate-900">Permis B (Séjour)</option>
                                <option value="Permis C" className="bg-slate-900">Permis C (Établissement)</option>
                                <option value="Permis G" className="bg-slate-900">Permis G (Frontalier)</option>
                                <option value="Permis L" className="bg-slate-900">Permis L (Courte durée)</option>
                                <option value="Suisse" className="bg-slate-900">Nationalité Suisse</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            variant="glass"
                            label={t('personal.email')}
                            value={personal.contact.email || ''}
                            onChange={(e) => updateField('personal.contact.email', e.target.value)}
                        />
                        <Input
                            variant="glass"
                            label={t('personal.phone')}
                            value={personal.contact.phone || ''}
                            onChange={(e) => updateField('personal.contact.phone', e.target.value)}
                        />
                        <Input
                            variant="glass"
                            label={t('personal.address')}
                            value={personal.contact.address || ''}
                            onChange={(e) => updateField('personal.contact.address', e.target.value)}
                        />
                        <Input
                            variant="glass"
                            label={t('personal.mobility')}
                            value={personal.mobility || ''}
                            onChange={(e) => updateField('personal.mobility', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div>
                <SectionHeader title={t('sections.summary')} className="text-white" />
                <TextArea
                    variant="glass"
                    value={profile.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Décrivez votre profil en quelques lignes..."
                    debounceTime={300}
                    enableAI={true}
                />
            </div>
        </div>
    );
};

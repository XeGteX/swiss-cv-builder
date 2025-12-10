import React, { useRef, useState, useMemo } from 'react';
import { useCVStoreV2 } from '../../../../application/store/v2';
import { Input } from '../../../design-system/atoms/Input';
import { TextArea } from '../../../design-system/atoms/TextArea';
import { SectionHeader } from '../../../design-system/molecules/SectionHeader';
import { User, Palette, Sparkles, Plus, Camera, X, Calendar, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Card } from '../../../design-system/atoms/Card';
import { useToastStore } from '../../../../application/store/toast-store';
import { useTranslation } from '../../../hooks/useTranslation';

// Extended nationality list - Alphabetical, major countries first
const NATIONALITIES = [
    // Major / Common first
    'Française', 'Suisse', 'Allemande', 'Britannique', 'Américaine', 'Canadienne',
    'Belge', 'Italienne', 'Espagnole', 'Portugaise', 'Néerlandaise',
    // Europe
    'Autrichienne', 'Polonaise', 'Roumaine', 'Grecque', 'Suédoise', 'Norvégienne',
    'Danoise', 'Finlandaise', 'Irlandaise', 'Tchèque', 'Hongroise', 'Bulgare',
    'Croate', 'Slovaque', 'Slovène', 'Lituanienne', 'Lettone', 'Estonienne',
    'Ukrainienne', 'Russe', 'Serbe', 'Albanaise', 'Macédonienne', 'Monténégrine',
    // Middle East & North Africa  
    'Marocaine', 'Algérienne', 'Tunisienne', 'Égyptienne', 'Libanaise', 'Syrienne',
    'Turque', 'Iranienne', 'Israélienne', 'Saoudienne', 'Émiratie', 'Qatarie',
    // Asia
    'Chinoise', 'Japonaise', 'Coréenne', 'Indienne', 'Pakistanaise', 'Bangladaise',
    'Indonésienne', 'Malaisienne', 'Singapourienne', 'Thaïlandaise', 'Vietnamienne',
    'Philippine', 'Taïwanaise',
    // Americas
    'Mexicaine', 'Brésilienne', 'Argentine', 'Chilienne', 'Colombienne', 'Péruvienne',
    'Vénézuélienne', 'Cubaine', 'Dominicaine', 'Portoricaine',
    // Africa
    'Sud-Africaine', 'Nigériane', 'Kényane', 'Ghanéenne', 'Sénégalaise', 'Ivoirienne',
    'Camerounaise', 'Congolaise', 'Éthiopienne',
    // Oceania
    'Australienne', 'Néo-Zélandaise'
];

// Target countries for work authorization logic
const TARGET_COUNTRIES = [
    { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
    { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: 'OTHER', name: 'Autre', flag: '🌍' },
];

// Validation helpers
const isValidEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === '' || re.test(email);
};

// Universal phone validation (basic international format)
const isValidPhone = (phone: string): boolean => {
    if (!phone) return true;
    // Accept: +XX XXX..., 0X XXX..., or just digits with spaces/dashes
    const cleaned = phone.replace(/[\s.-]/g, '');
    return /^\+?[0-9]{8,15}$/.test(cleaned);
};

export const PersonalTab: React.FC = () => {
    const profile = useCVStoreV2((state) => state.profile);
    const updateField = useCVStoreV2((state) => state.updateField);
    const { ts } = useTranslation();
    const { addToast } = useToastStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for nationality autocomplete
    const [nationalityInput, setNationalityInput] = useState('');
    const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);

    // Filtered nationalities based on input
    const filteredNationalities = useMemo(() => {
        if (!nationalityInput) return NATIONALITIES.slice(0, 8);
        const lower = nationalityInput.toLowerCase();
        return NATIONALITIES.filter(n => n.toLowerCase().includes(lower)).slice(0, 8);
    }, [nationalityInput]);

    if (!profile || !profile.personal || !profile.metadata) {
        return <div className="p-4 text-slate-400">{ts('common.loading')}</div>;
    }

    const { personal, metadata } = profile;

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 1. Check Size (Max 5MB) - Studio photos can be large
            if (file.size > 5 * 1024 * 1024) {
                alert('Image trop lourde. Maximum 5MB.');
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
            {/* Personal Info */}
            <div>
                <SectionHeader title={ts('personal.title')} icon={<User size={16} className="text-white" />} className="text-white" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                        variant="glass"
                        label={ts('personal.firstName')}
                        value={personal.firstName}
                        onChange={(e) => updateField('personal.firstName', e.target.value)}
                        maxLength={35}
                        debounceTime={300}
                    />
                    <Input
                        variant="glass"
                        label={ts('personal.lastName')}
                        value={personal.lastName}
                        onChange={(e) => updateField('personal.lastName', e.target.value)}
                        maxLength={35}
                        debounceTime={300}
                    />
                </div>

                {/* Titre du poste - with soft/hard limit feedback */}
                <div className="mb-4">
                    <Input
                        variant="glass"
                        label={ts('personal.role')}
                        value={personal.title}
                        onChange={(e) => updateField('personal.title', e.target.value)}
                        className={`font-bold ${(personal.title?.length || 0) > 80 ? 'border-red-500/50' :
                            (personal.title?.length || 0) > 60 ? 'border-amber-500/50' : ''
                            }`}
                        maxLength={100}
                        debounceTime={300}
                    />
                    <div className="flex justify-between items-start mt-1">
                        {/* Pro tip message */}
                        <div className="flex-1">
                            {(personal.title?.length || 0) > 60 && (
                                <p className="text-xs text-amber-400 flex items-center gap-1">
                                    <Sparkles size={12} />
                                    Conseil Pro : Un titre court (max 60 car.) a plus d'impact.
                                </p>
                            )}
                        </div>
                        {/* Character counter with color coding */}
                        <span className={`text-xs font-medium ${(personal.title?.length || 0) > 80 ? 'text-red-400' :
                            (personal.title?.length || 0) > 60 ? 'text-amber-400' :
                                'text-slate-400'
                            }`}>
                            {personal.title?.length || 0}/100
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* 📸 PHOTO UPLOAD - PROMINENT DESIGN */}
                    <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />

                        {personal.photoUrl ? (
                            /* Photo exists - Show Avatar with Edit/Delete */
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-purple-500/30 shadow-lg shadow-purple-500/20">
                                    <img
                                        src={personal.photoUrl}
                                        alt="Photo CV"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                        title="Modifier"
                                    >
                                        <Camera size={16} className="text-white" />
                                    </button>
                                    <button
                                        onClick={() => updateField('personal.photoUrl', '')}
                                        className="p-2 rounded-full bg-red-500/40 hover:bg-red-500/60 transition-colors"
                                        title="Supprimer"
                                    >
                                        <X size={16} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* No photo - Show Add Photo Box */
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 rounded-xl border-2 border-dashed border-purple-500/50 hover:border-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-all flex flex-col items-center justify-center gap-2 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-purple-500/30 group-hover:bg-purple-500/50 flex items-center justify-center transition-colors">
                                    <Plus size={24} className="text-purple-300 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-xs text-purple-300 group-hover:text-white transition-colors">Photo</span>
                            </button>
                        )}

                        <p className="text-xs text-slate-400 text-center">
                            {personal.photoUrl ? 'Survolez pour modifier' : 'JPG, PNG • Max 5MB'}
                        </p>

                        {/* Upscale Photo Button */}
                        {personal.photoUrl && (
                            <button
                                onClick={() => addToast('🚀 Upscale IA - Coming Soon!', 'info')}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
                            >
                                <Sparkles size={12} />
                                {ts('personal.enhancePhoto')}
                            </button>
                        )}
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                        <p className="text-xs text-white font-bold flex items-center gap-1">
                            🌍 Autorisations & Statut
                        </p>

                        {/* Date de naissance - Native Date Picker */}
                        <div>
                            <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-2">
                                <Calendar size={12} />
                                {ts('personal.birthDate')}
                            </label>
                            <input
                                type="date"
                                className="glass-input w-full p-2 rounded text-sm outline-none bg-white text-slate-900 border border-white/20 focus:border-brand-500"
                                style={{ colorScheme: 'light' }}
                                value={personal.birthDate || ''}
                                onChange={(e) => updateField('personal.birthDate', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                min="1940-01-01"
                            />
                        </div>

                        {/* Nationalité - Autocomplete Dropdown */}
                        <div className="relative">
                            <label className="block text-xs font-semibold text-white mb-1">
                                {ts('personal.nationality')}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="glass-input w-full p-2 rounded text-sm outline-none bg-slate-900/50 text-slate-200 border border-white/10 focus:border-brand-500 pr-8"
                                    value={personal.nationality || nationalityInput}
                                    onChange={(e) => {
                                        setNationalityInput(e.target.value);
                                        setShowNationalityDropdown(true);
                                        if (!e.target.value) updateField('personal.nationality', '');
                                    }}
                                    onFocus={() => setShowNationalityDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowNationalityDropdown(false), 200)}
                                    placeholder="Commencez à taper..."
                                    maxLength={30}
                                />
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                            {showNationalityDropdown && filteredNationalities.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-white/20 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {filteredNationalities.map((nat) => (
                                        <button
                                            key={nat}
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10 flex items-center gap-2"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                updateField('personal.nationality', nat);
                                                setNationalityInput('');
                                                setShowNationalityDropdown(false);
                                            }}
                                        >
                                            {personal.nationality === nat && <Check size={14} className="text-green-400" />}
                                            {nat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Target Country - Determines permit/visa logic */}
                        <div>
                            <label className="block text-xs font-semibold text-white mb-1">🎯 Marché Cible</label>
                            <select
                                className="glass-input w-full p-2 rounded text-sm outline-none bg-slate-900/50 text-slate-200 border border-white/10 focus:border-brand-500"
                                value={(metadata as any).targetCountry || ''}
                                onChange={(e) => updateField('metadata.targetCountry', e.target.value)}
                            >
                                <option value="" className="bg-slate-900">Sélectionner un pays</option>
                                {TARGET_COUNTRIES.map(c => (
                                    <option key={c.code} value={c.code} className="bg-slate-900">
                                        {c.flag} {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Conditional: Swiss Permits */}
                        {(metadata as any).targetCountry === 'CH' && (
                            <div>
                                <label className="block text-xs font-semibold text-white mb-1">{ts('personal.permit')}</label>
                                <select
                                    className="glass-input w-full p-2 rounded text-sm outline-none bg-slate-900/50 text-slate-200 border border-white/10 focus:border-brand-500"
                                    value={personal.permit || ''}
                                    onChange={(e) => updateField('personal.permit', e.target.value)}
                                >
                                    <option value="" className="bg-slate-900">{ts('personal.select')}</option>
                                    <option value="Permis B" className="bg-slate-900">{ts('personal.permits.b')}</option>
                                    <option value="Permis C" className="bg-slate-900">{ts('personal.permits.c')}</option>
                                    <option value="Permis G" className="bg-slate-900">{ts('personal.permits.g')}</option>
                                    <option value="Permis L" className="bg-slate-900">{ts('personal.permits.l')}</option>
                                    <option value="Suisse" className="bg-slate-900">{ts('personal.permits.swiss')}</option>
                                </select>
                            </div>
                        )}

                        {/* Conditional: Generic Visa/Work Auth for non-Swiss */}
                        {(metadata as any).targetCountry && (metadata as any).targetCountry !== 'CH' && (
                            <div>
                                <Input
                                    variant="glass"
                                    label="Visa / Autorisation de travail"
                                    value={personal.permit || ''}
                                    onChange={(e) => updateField('personal.permit', e.target.value)}
                                    placeholder="ex: Visa H1B, Carte de résident..."
                                    maxLength={50}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Email - avec validation */}
                        <div>
                            <Input
                                variant="glass"
                                label={ts('personal.email')}
                                value={personal.contact.email || ''}
                                onChange={(e) => updateField('personal.contact.email', e.target.value)}
                                type="email"
                                maxLength={50}
                            />
                            {personal.contact.email && !isValidEmail(personal.contact.email) && (
                                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> Format email invalide
                                </p>
                            )}
                        </div>

                        {/* Téléphone - validation universelle */}
                        <div>
                            <Input
                                variant="glass"
                                label={ts('personal.phone')}
                                value={personal.contact.phone || ''}
                                onChange={(e) => updateField('personal.contact.phone', e.target.value)}
                                placeholder="+33 6 12 34 56 78"
                                maxLength={30}
                            />
                            {personal.contact.phone && !isValidPhone(personal.contact.phone) && (
                                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> Format téléphone invalide
                                </p>
                            )}
                        </div>

                        <Input
                            variant="glass"
                            label={ts('personal.address')}
                            value={personal.contact.address || ''}
                            onChange={(e) => updateField('personal.contact.address', e.target.value)}
                            maxLength={150}
                            placeholder="123 Rue Example, 75001 Paris"
                        />
                        <Input
                            variant="glass"
                            label={ts('personal.mobility')}
                            value={personal.mobility || ''}
                            onChange={(e) => updateField('personal.mobility', e.target.value)}
                            maxLength={50}
                            placeholder="ex: Canton de Vaud, Suisse romande"
                        />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div>
                <SectionHeader title={ts('sections.summary')} className="text-white" />
                <TextArea
                    variant="glass"
                    value={profile.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Décrivez votre profil en quelques lignes..."
                    debounceTime={300}
                    enableAI={true}
                    maxLength={200}
                />
                <div className="flex justify-end mt-1">
                    <span className={`text-xs ${(profile.summary?.length || 0) > 200 ? 'text-red-400' : (profile.summary?.length || 0) > 150 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {profile.summary?.length || 0}/200
                    </span>
                </div>
            </div>
        </div>
    );
};

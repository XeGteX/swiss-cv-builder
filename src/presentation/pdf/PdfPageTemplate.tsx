import React from 'react';
import type { PageDefinition, SectionBlock } from '../../domain/pdf/types';
import { PDF_CONFIG } from '../../domain/pdf/template-config';
import { MapPin, Phone, Mail, Globe, Camera, Briefcase, Award, GraduationCap } from 'lucide-react';

interface PdfPageTemplateProps {
    page: PageDefinition;
    scale?: number;
}

export const PdfPageTemplate: React.FC<PdfPageTemplateProps> = ({ page, scale = 1 }) => {
    const config = PDF_CONFIG[page.header.variant];
    const { width, height } = config.page;
    const isFirstPage = page.index === 0;
    const isVisual = page.header.variant === 'visual';

    const style: React.CSSProperties = {
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'white',
        position: 'relative',
        overflow: 'hidden',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
        fontFamily: config.typography.fontFamily,
        fontSize: `${config.typography.fontSize.base}px`,
        lineHeight: config.typography.lineHeight,
        color: config.colors.text,
    };

    // Extract profile data from the first section if it exists (usually 'profile' type)
    // In a real scenario, we might want to pass profile data separately to the page
    const profileSection = page.sections.find(s => s.type === 'profile');
    // We need to cast items to any because SectionBlock items are generic
    const personalInfo = profileSection?.items[0] as any;

    return (
        <div id={page.id} style={style} className="pdf-page">
            {/* Modern Header (Visual Variant - Page 1 Only) */}
            {isVisual && isFirstPage && personalInfo ? (
                <ModernHeader personal={personalInfo} config={config} accentColor={page.accentColor} />
            ) : (
                /* Standard / Secondary Page Header */
                <div style={{ height: page.marginTop, padding: `0 ${config.page.marginLeft}px`, display: 'flex', alignItems: 'center' }}>
                    {!isFirstPage && (
                        <div className="text-gray-400 text-sm w-full border-b border-gray-200 pb-2 flex justify-between">
                            <span className="uppercase font-bold text-xs tracking-wider">{personalInfo?.lastName || 'CV'}</span>
                            <span>Page {page.header.pageNumber}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Content Area */}
            <div style={{
                paddingLeft: config.page.marginLeft,
                paddingRight: config.page.marginRight,
                // Adjust height calculation if header is present
                height: 'auto', // Let content flow, overflow is handled by pagination logic (mostly)
                paddingTop: (isVisual && isFirstPage) ? 20 : 0
            }}>
                {page.sections.map(section => {
                    // Skip profile section in body if it's already rendered in header
                    if (isVisual && isFirstPage && section.type === 'profile') return null;
                    return <SectionRenderer key={section.id} section={section} config={config} accentColor={page.accentColor} />;
                })}
            </div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: page.marginBottom,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#94a3b8'
            }}>
                <span>{page.header.pageNumber}</span>
            </div>
            <Camera size={40} />
        </div>
    );
};

// --- Modern Header Component ---

const ModernHeader: React.FC<{ personal: any, config: any, accentColor?: string }> = ({ personal, config, accentColor }) => {
    const primaryColor = accentColor || config.colors.primary;

    return (
        <div className="text-white grid grid-cols-12 gap-6 px-10 py-10" style={{ background: `linear-gradient(135deg, ${primaryColor}, #1e293b)` }}>
            <div className="col-span-3 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full overflow-hidden border-4 border-white/30 shadow-lg relative z-10 shrink-0">
                    {personal.photoUrl ? (
                        <img src={personal.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                            <Camera size={40} />
                        </div>
                    )}
                </div>
            </div>
            <div className="col-span-9 flex flex-col justify-center pl-2">
                <h1 className="text-4xl font-bold tracking-tight uppercase mb-2 leading-none">
                    {personal.firstName} <span className="opacity-90">{personal.lastName}</span>
                </h1>
                <h2 className="text-xl font-medium text-white/90 tracking-wide mb-4">
                    {personal.title}
                </h2>

                {/* Contact Info Grid */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/80">
                    {personal.contact?.address && (
                        <div className="flex items-center gap-1.5">
                            <MapPin size={12} /> <span>{personal.contact.address}</span>
                        </div>
                    )}
                    {personal.contact?.phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone size={12} /> <span>{personal.contact.phone}</span>
                        </div>
                    )}
                    {personal.contact?.email && (
                        <div className="flex items-center gap-1.5">
                            <Mail size={12} /> <span>{personal.contact.email}</span>
                        </div>
                    )}
                    {personal.mobility && (
                        <div className="flex items-center gap-1.5">
                            <Globe size={12} /> <span>{personal.mobility}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Section Renderer ---

const SectionRenderer: React.FC<{ section: SectionBlock, config: any, accentColor?: string }> = ({ section, config, accentColor }) => {
    const Icon = getSectionIcon(section.type);
    const primaryColor = accentColor || config.colors.primary;

    return (
        <div className="mb-6 break-inside-avoid">
            {section.title && (
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-100 rounded text-slate-600">
                        <Icon size={16} style={{ color: primaryColor }} />
                    </div>
                    {section.title}
                </h3>
            )}

            <div className="space-y-4">
                {section.items.map((item: any, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-slate-100">
                        {/* Dot for timeline */}
                        {(section.type === 'experience' || section.type === 'education') && (
                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-white border-2" style={{ borderColor: primaryColor }} />
                        )}

                        <div className="flex justify-between items-baseline mb-1">
                            {(item.role || item.degree) && (
                                <div className="font-bold text-slate-800">{item.role || item.degree}</div>
                            )}
                            {(item.date || item.dates || item.year) && (
                                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                    {item.date || item.dates || item.year}
                                </span>
                            )}
                        </div>

                        {(item.company || item.school) && (
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                                {item.company || item.school}
                            </div>
                        )}

                        {(item.summary || item.description) && (
                            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {item.summary || item.description}
                            </p>
                        )}

                        {/* Tasks list for experience */}
                        {item.tasks && Array.isArray(item.tasks) && (
                            <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-sm text-slate-600">
                                {item.tasks.map((task: string, i: number) => (
                                    <li key={i}>{task}</li>
                                ))}
                            </ul>
                        )}

                        {/* Simple string items (Skills) */}
                        {typeof item === 'string' && (
                            <span className="inline-block bg-slate-100 rounded px-2 py-1 text-xs font-medium text-slate-700 mr-2 mb-2">
                                {item}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

function getSectionIcon(type: string) {
    switch (type) {
        case 'experience': return Award;
        case 'education': return GraduationCap;
        case 'skills': return Award; // Or a different icon
        default: return Briefcase;
    }
}

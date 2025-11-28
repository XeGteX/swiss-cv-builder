import React, { useMemo } from 'react';
import {
    Camera, Mail, Phone, MapPin, Briefcase, GraduationCap, Globe, Award
} from 'lucide-react';
import type { TemplateProps } from '../registry';
import { t } from '../../../data/translations';
import { TemplateEngine, DEFAULT_THEME } from '../../../domain/templates/TemplateEngine';
import type { TemplateConfig } from '../../../domain/templates/TemplateEngine';

interface ExtendedTemplateProps extends TemplateProps {
    config?: TemplateConfig;
}

const ModernTemplate: React.FC<ExtendedTemplateProps> = ({ data, densityStyles, accentColor, fontFamily, language, config = DEFAULT_THEME }) => {

    // Override config colors with props if provided (legacy support)
    const effectiveConfig = useMemo(() => ({
        ...config,
        colors: {
            ...config.colors,
            primary: accentColor || config.colors.primary,
        },
        typography: {
            ...config.typography,
            bodyFont: fontFamily || config.typography.bodyFont,
        }
    }), [config, accentColor, fontFamily]);

    const cssVars = TemplateEngine.generateStyles(effectiveConfig);

    const adjustColor = (color: string, amount: number) => {
        return '#' + color.replace(/^#/, '').replace(/../g, c =>
            ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).slice(-2)
        );
    };

    const headerStyle = {
        background: `linear-gradient(135deg, ${effectiveConfig.colors.primary}, ${adjustColor(effectiveConfig.colors.primary, -60)})`,
    };

    const styles = densityStyles;
    const txt = t[language];

    return (
        <div
            id="cv-template"
            className={`bg-white shadow-2xl text-slate-800 font-${fontFamily} ${styles.textBase} print:shadow-none print:m-0 print:h-full print:w-full overflow-hidden relative mx-auto box-border break-words overflow-wrap-anywhere`}
            style={{
                width: '210mm',
                minHeight: '297mm',
                ...cssVars
            }}
        >

            {/* HEADER */}
            <div className={`text-white ${styles.headerPad} grid grid-cols-12 gap-8 relative px-10 py-10 print:py-10`} style={headerStyle}>
                <div className="col-span-3 flex items-center justify-center">
                    <div className="w-36 h-36 bg-white rounded-full overflow-hidden border-4 border-white/30 shadow-lg relative z-10 shrink-0 aspect-square">
                        {data.personal.photoUrl ? (
                            <img
                                src={data.personal.photoUrl}
                                alt="Profile"
                                className="w-full h-full block"
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    width: '100%',
                                    height: '100%'
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                <Camera size={40} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-span-9 flex flex-col justify-center pl-2">
                    <h1 className="text-5xl font-bold tracking-tight uppercase mb-2 leading-[0.9] break-words">
                        {data.personal.firstName} <span style={{ color: 'rgba(255,255,255,0.85)' }}>{data.personal.lastName}</span>
                    </h1>
                    <h2 className="text-2xl font-medium text-white/90 tracking-wide mb-4 break-words">
                        {data.personal.title}
                    </h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/80 items-center">
                        {data.personal.birthDate && <span>{data.personal.birthDate}</span>}
                        {data.personal.nationality && <span>{data.personal.nationality}</span>}
                        {data.personal.permit && <span className="text-white bg-white/20 px-2 py-0.5 rounded text-xs leading-none">{data.personal.permit}</span>}
                    </div>
                </div>
            </div>

            {/* CONTACT */}
            <div className="bg-slate-50 border-b border-slate-200 px-10 py-6 flex flex-wrap gap-y-3 gap-x-8 text-xs text-slate-600 font-semibold print:py-6 items-center">
                <div className="flex items-center gap-2.5 min-w-[30%] break-words">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 p-0.5">
                        <MapPin size={14} style={{ color: effectiveConfig.colors.primary }} />
                    </div>
                    <span className="mt-0.5 leading-tight">{data.personal.contact.address}</span>
                </div>
                {data.personal.mobility && (
                    <div className="flex items-center gap-2.5 text-slate-800">
                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 p-0.5">
                            <Globe size={14} style={{ color: effectiveConfig.colors.primary }} />
                        </div>
                        <span className="mt-0.5 leading-tight">{data.personal.mobility}</span>
                    </div>
                )}
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 p-0.5">
                        <Phone size={14} style={{ color: effectiveConfig.colors.primary }} />
                    </div>
                    <span className="mt-0.5 leading-tight">{data.personal.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 break-words">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 p-0.5">
                        <Mail size={14} style={{ color: effectiveConfig.colors.primary }} />
                    </div>
                    <span className="mt-0.5 leading-tight">{data.personal.contact.email}</span>
                </div>
            </div>

            {/* CONTENT */}
            <div className={`${styles.containerPad} grid grid-cols-12 gap-12 px-10 py-10 print:py-10`}>
                <div className={`col-span-8 flex flex-col gap-10`}>
                    {/* Summary */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2.5">
                            <div className="p-1.5 bg-slate-100 rounded text-slate-600">
                                <Briefcase size={16} style={{ color: effectiveConfig.colors.primary }} />
                            </div>
                            {txt.summary}
                        </h3>
                        <p className="text-slate-600 text-justify whitespace-pre-line break-words leading-relaxed text-sm">
                            {data.summary}
                        </p>
                    </section>

                    {/* Experience */}
                    {data.experiences.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-3 mb-6 flex items-center gap-2.5">
                                <div className="p-1.5 bg-slate-100 rounded text-slate-600">
                                    <Award size={16} style={{ color: effectiveConfig.colors.primary }} />
                                </div>
                                {txt.experience}
                            </h3>
                            <div className="flex flex-col gap-8">
                                {data.experiences.map((exp) => (
                                    <div key={exp.id} className="relative pl-6 border-l-2 border-slate-100 break-inside-avoid">
                                        <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: effectiveConfig.colors.primary }} />
                                        <div className="flex justify-between items-baseline mb-1.5">
                                            <h4 className="font-bold text-slate-800 text-base break-words leading-tight">{exp.role}</h4>
                                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap leading-none">
                                                {exp.dates}
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-3 break-words tracking-wide flex items-center gap-2 leading-tight">
                                            {exp.company}
                                            {exp.location && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    {exp.location}
                                                </>
                                            )}
                                        </div>
                                        <ul className={`list-disc list-outside ml-4 space-y-1.5 text-slate-600 marker:text-slate-300 text-sm`}>
                                            {exp.tasks.map((task, i) => (
                                                <li key={i} className="pl-1 leading-relaxed whitespace-pre-line break-words">
                                                    {task}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {data.educations.length > 0 && (
                        <section className="break-inside-avoid">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-3 mb-6 flex items-center gap-2.5">
                                <div className="p-1.5 bg-slate-100 rounded text-slate-600">
                                    <GraduationCap size={16} style={{ color: effectiveConfig.colors.primary }} />
                                </div>
                                {txt.education}
                            </h3>
                            <div className="space-y-6">
                                {data.educations.map((edu) => (
                                    <div key={edu.id} className="flex justify-between items-start group">
                                        <div className="pr-4">
                                            <div className="font-bold text-slate-800 text-sm break-words group-hover:text-indigo-600 transition-colors leading-tight">{edu.degree}</div>
                                            <div className="text-slate-500 text-xs mt-1 break-words font-medium leading-tight">
                                                {edu.school} {edu.description && `— ${edu.description}`}
                                            </div>
                                        </div>
                                        <div className="font-bold text-slate-400 text-xs whitespace-nowrap pt-0.5 bg-slate-50 px-2 py-1 rounded leading-none">
                                            {edu.year}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* SIDEBAR */}
                <div className={`col-span-4 flex flex-col gap-10`}>
                    {/* Skills */}
                    {data.skills.length > 0 && (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 break-inside-avoid shadow-sm">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-5 border-b border-slate-200 pb-2">
                                {txt.skillsTitle}
                            </h3>
                            <ul className="space-y-3">
                                {data.skills.map((skill, i) => (
                                    <li key={i} className="text-slate-700 flex items-start gap-2.5 text-xs break-words font-semibold">
                                        <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: effectiveConfig.colors.primary }} />
                                        <span className="leading-snug">{skill}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Languages */}
                    {data.languages.length > 0 && (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 break-inside-avoid shadow-sm">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-5 border-b border-slate-200 pb-2">
                                {txt.langTitle}
                            </h3>
                            <div className="space-y-5">
                                {data.languages.map((lang, i) => (
                                    <div key={i}>
                                        <div className="flex flex-col mb-1.5">
                                            <span className="font-bold text-slate-700 break-words leading-tight">{lang.name}</span>
                                            <span className="text-slate-500 break-words text-[10px] font-medium uppercase tracking-wide leading-none mt-0.5">{lang.level}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full transition-all duration-500 rounded-full" style={{ width: i === 0 ? '100%' : '65%', backgroundColor: effectiveConfig.colors.primary }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModernTemplate;

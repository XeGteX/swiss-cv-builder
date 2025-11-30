
import React from 'react';
import type { TemplateProps } from '../registry';

const ATSTemplate: React.FC<TemplateProps> = ({ data, densityStyles }) => {
    const styles = densityStyles;

    return (
        <div className={`bg-white text-black max-w-[210mm] min-h-[296mm] font-sans box-border ${styles.textBase} ${styles.containerPad} ${styles.lineHeight}`}>
            {/* HEADER */}
            <div className="text-center border-b-2 border-black pb-4 mb-4">
                <h1 className="text-3xl font-bold uppercase mb-1 break-words">
                    {data.personal.firstName} {data.personal.lastName}
                </h1>
                <h2 className="text-xl font-semibold mb-1 break-words">{data.personal.title}</h2>
                <div className="text-[11px] space-y-1">
                    <p className="break-words">
                        {data.personal.contact.address && `${data.personal.contact.address} | `}
                        {data.personal.contact.phone} | {data.personal.contact.email}
                    </p>
                    <p>
                        {[data.personal.nationality, data.personal.permit, data.personal.birthDate].filter(Boolean).join(' | ')}
                    </p>
                    {data.personal.mobility && <p className="italic break-words">{data.personal.mobility}</p>}
                </div>
            </div>

            <div className="space-y-4">
                {/* SUMMARY */}
                <section>
                    <h3 className="font-bold uppercase border-b border-black mb-1 text-[11px]">Profil</h3>
                    <p className="whitespace-pre-line break-words">{data.summary}</p>
                </section>

                {/* SKILLS */}
                {data.skills.length > 0 && (
                    <section>
                        <h3 className="font-bold uppercase border-b border-black mb-2 text-[11px]">Compétences</h3>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 list-disc pl-5">
                            {data.skills.map((skill, i) => (
                                <li key={i} className="break-words">{skill}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* EXPERIENCE */}
                {data.experiences.length > 0 && (
                    <section>
                        <h3 className="font-bold uppercase border-b border-black mb-2 text-[11px]">Expérience Professionnelle</h3>
                        <div className="space-y-3">
                            {data.experiences.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid">
                                    <div className="flex justify-between font-bold">
                                        <span className="break-words">{exp.role}</span>
                                        <span className="text-[10px]">{exp.dates}</span>
                                    </div>
                                    <div className="italic mb-0.5 break-words">
                                        {[exp.company, exp.location].filter(Boolean).join(', ')}
                                    </div>
                                    <ul className="list-disc pl-5 space-y-0.5">
                                        {exp.tasks.map((task, i) => (
                                            <li key={i} className="whitespace-pre-line break-words">{task}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* EDUCATION */}
                {data.educations.length > 0 && (
                    <section className="break-inside-avoid">
                        <h3 className="font-bold uppercase border-b border-black mb-2 text-[11px]">Formation</h3>
                        {data.educations.map((edu) => (
                            <div key={edu.id} className="mb-1.5 text-[11px]">
                                <div className="flex justify-between font-bold">
                                    <span className="break-words">{edu.degree}</span>
                                    <span>{edu.year}</span>
                                </div>
                                <div className="break-words">
                                    {edu.school} {edu.description && `- ${edu.description}`}
                                </div>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
};

export default ATSTemplate;

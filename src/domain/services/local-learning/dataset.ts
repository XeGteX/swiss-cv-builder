
import type { LetterSection } from '../../motivation-letter/letter-types';

export const INITIAL_SECTIONS: LetterSection[] = [
    // --- INTRO (EN) ---
    {
        id: 'intro_en_1',
        type: 'intro',
        content: "I am writing to express my strong interest in the {{role}} position at {{company}}. With my background in {{skills}}, I am confident in my ability to contribute effectively to your team.",
        tags: ['general', 'professional'],
        weight: 1.0,
        language: 'en'
    },
    {
        id: 'intro_en_2',
        type: 'intro',
        content: "It is with great enthusiasm that I apply for the {{role}} opportunity at {{company}}. As a passionate professional with expertise in {{skills}}, I have long admired {{company}}'s work.",
        tags: ['enthusiastic'],
        weight: 1.0,
        language: 'en'
    },
    // --- BODY (EN) ---
    {
        id: 'body_en_1',
        type: 'body',
        content: "Throughout my career, I have honed my skills in {{skills}}. My experience aligns perfectly with the requirements of this role, particularly my ability to deliver results in challenging environments.",
        tags: ['general'],
        weight: 1.0,
        language: 'en'
    },
    {
        id: 'body_en_2',
        type: 'body',
        content: "I have a proven track record of success in using {{skills}} to drive innovation. I am particularly excited about the possibility of bringing this experience to {{company}} and helping achieve your strategic goals.",
        tags: ['confident'],
        weight: 1.0,
        language: 'en'
    },
    // --- CONCLUSION (EN) ---
    {
        id: 'concl_en_1',
        type: 'conclusion',
        content: "Thank you for considering my application. I look forward to the possibility of discussing how my skills and experience align with the needs of {{company}}.",
        tags: ['professional'],
        weight: 1.0,
        language: 'en'
    },

    // --- INTRO (FR) ---
    {
        id: 'intro_fr_1',
        type: 'intro',
        content: "Je vous écris pour exprimer mon vif intérêt pour le poste de {{role}} chez {{company}}. Fort de mon expérience en {{skills}}, je suis convaincu de pouvoir contribuer efficacement à votre équipe.",
        tags: ['general', 'professional'],
        weight: 1.0,
        language: 'fr'
    },
    {
        id: 'intro_fr_2',
        type: 'intro',
        content: "C'est avec grand enthousiasme que je postule pour l'opportunité de {{role}} au sein de {{company}}. En tant que professionnel passionné par {{skills}}, j'admire depuis longtemps le travail de {{company}}.",
        tags: ['enthusiastic'],
        weight: 1.0,
        language: 'fr'
    },
    // --- BODY (FR) ---
    {
        id: 'body_fr_1',
        type: 'body',
        content: "Au cours de ma carrière, j'ai perfectionné mes compétences en {{skills}}. Mon expérience correspond parfaitement aux exigences de ce poste, notamment ma capacité à obtenir des résultats dans des environnements exigeants.",
        tags: ['general'],
        weight: 1.0,
        language: 'fr'
    },
    // --- CONCLUSION (FR) ---
    {
        id: 'concl_fr_1',
        type: 'conclusion',
        content: "Je vous remercie de l'attention que vous porterez à ma candidature. Je me réjouis de la possibilité de discuter de la manière dont mes compétences et mon expérience correspondent aux besoins de {{company}}.",
        tags: ['professional'],
        weight: 1.0,
        language: 'fr'
    }
];

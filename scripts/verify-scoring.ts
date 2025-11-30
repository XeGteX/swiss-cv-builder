
import { SemanticAnalyzer } from '../src/domain/services/semantic-analyzer';
import { CVProfile } from '../src/domain/entities/cv';

const mockProfileFR: CVProfile = {
    id: '1',
    lastUpdated: Date.now(),
    personal: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.com',
        phone: '123',
        location: 'Paris',
        contact: { email: 'jean@test.com', phone: '123', location: 'Paris' } // Legacy structure support
    },
    summary: 'J\'ai géré une équipe de 10 personnes et développé une application React. J\'ai optimisé les performances de 50%.',
    experiences: [
        {
            id: 'e1',
            role: 'Développeur',
            company: 'TechCorp',
            startDate: '2020',
            endDate: 'Present',
            description: 'J\'ai créé des APIs.',
            tasks: ['J\'ai architecturé la solution.']
        }
    ],
    educations: [{ id: 'ed1', school: 'Polytechnique', degree: 'Master', startDate: '2015', endDate: '2020' }],
    skills: ['React', 'TypeScript'],
    languages: [],
    interests: [],
    projects: [],
    letters: []
};

const mockProfileEN: CVProfile = {
    ...mockProfileFR,
    summary: 'I managed a team of 10 people and developed a React application. I optimized performance by 50%.',
    experiences: [
        {
            id: 'e1',
            role: 'Developer',
            company: 'TechCorp',
            startDate: '2020',
            endDate: 'Present',
            description: 'I created APIs.',
            tasks: ['I architected the solution.']
        }
    ]
};

console.log('--- VERIFICATION START ---');

// Test 1: French Profile
console.log('\nTesting French Profile (Language: FR)...');
const resultFR = SemanticAnalyzer.analyze(mockProfileFR, 'fr');
console.log('Score:', resultFR.score);
console.log('Impact Segments:', JSON.stringify(resultFR.impactSegments, null, 2));
console.log('Suggestions:', JSON.stringify(resultFR.suggestions, null, 2));

// Check for French verb recognition
const verbsScoreFR = resultFR.impactSegments.find(s => s.segment === 'Action Verbs')?.score || 0;
if (verbsScoreFR > 50) {
    console.log('✅ French verbs recognized correctly.');
} else {
    console.error('❌ French verbs NOT recognized.');
}

// Test 2: English Profile
console.log('\nTesting English Profile (Language: EN)...');
const resultEN = SemanticAnalyzer.analyze(mockProfileEN, 'en');
console.log('Score:', resultEN.score);

const verbsScoreEN = resultEN.impactSegments.find(s => s.segment === 'Action Verbs')?.score || 0;
if (verbsScoreEN > 50) {
    console.log('✅ English verbs recognized correctly.');
} else {
    console.error('❌ English verbs NOT recognized.');
}

// Test 3: Missing Email (Error Check)
console.log('\nTesting Missing Email (Language: FR)...');
const profileNoEmail = { ...mockProfileFR, personal: { ...mockProfileFR.personal, contact: { ...mockProfileFR.personal.contact, email: '' } } };
const resultError = SemanticAnalyzer.analyze(profileNoEmail, 'fr');
const hasEmailError = resultError.suggestions.some(s => s.message === 'Email manquant');

if (hasEmailError) {
    console.log('✅ Missing email detected correctly.');
} else {
    console.error('❌ Missing email NOT detected.');
}

console.log('\n--- VERIFICATION END ---');

/**
 * useOmegaAgent - God Tier Agent Powers
 * 
 * The OMEGA Agent can directly modify the CV, judge weak words,
 * and intervene physically in the DOM.
 * 
 * "One Punch Man" philosophy: Looks innocent, infinite power hidden.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useCVStoreV2 } from '../../application/store/v2';
import { useOmegaStore } from '../store/useOmegaStore';

// ============================================================================
// TYPES
// ============================================================================

export type OmegaAction =
    | 'idle'
    | 'flying'
    | 'working'
    | 'complete'
    | 'judging'
    | 'serious';

export interface OmegaState {
    action: OmegaAction;
    targetId: string | null;
    isWorking: boolean;
    workProgress: number;
    completionMessage: string | null;
    isWinking: boolean;
    seriousMode: boolean;
    judgingWord: string | null;
    // Judgment mode cursor tracking
    judgmentPosition: { x: number; y: number } | null;
    isJudging: boolean;
    // DOM Hijacking - Element grab
    grabbedElementId: string | null;
    isGrabbing: boolean;
    grabPosition: { x: number; y: number } | null;
    protectedSections: string[];  // Sections that cannot be deleted
}

export interface AutoFixResult {
    success: boolean;
    message: string;
    itemsAdded: number;
}

// ============================================================================
// DEFAULT DATA FOR AUTO-FIX
// ============================================================================

const DEFAULT_SKILLS = [
    'React',
    'TypeScript',
    'Node.js',
    'AI Architecture',
    'Problem Solving'
];

const DEFAULT_EXPERIENCE = {
    id: `exp-${Date.now()}`,
    role: 'Senior Developer',
    company: 'Tech Innovators',
    startDate: '2022-01',
    endDate: '',
    current: true,
    tasks: [
        'Led development of key features',
        'Mentored junior developers',
        'Optimized performance by 40%'
    ]
};

const DEFAULT_EDUCATION = {
    id: `edu-${Date.now()}`,
    degree: 'Master in Computer Science',
    school: 'Tech University',
    year: '2022',
    description: 'Specialized in AI and Machine Learning'
};

const DEFAULT_LANGUAGE = {
    name: 'English',
    level: 'Fluent'
};

const DEFAULT_SUMMARY = `Passionate software engineer with expertise in modern web technologies. 
Proven track record of delivering high-quality solutions that drive business value. 
Strong problem-solving skills and a commitment to clean, maintainable code.`;

// ============================================================================
// WEAK WORDS DETECTION
// ============================================================================

const WEAK_WORDS = [
    'motivé',
    'dynamique',
    'rigoureux',
    'polyvalent',
    'passionné',
    'team player',
    'hard worker',
    'detail-oriented',
    'proactif',
    'autonome'
];

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useOmegaAgent() {
    const updateField = useCVStoreV2(state => state.updateField);
    const profile = useCVStoreV2(state => state.profile);

    const [state, setState] = useState<OmegaState>({
        action: 'idle',
        targetId: null,
        isWorking: false,
        workProgress: 0,
        completionMessage: null,
        isWinking: false,
        seriousMode: false,
        judgingWord: null,
        judgmentPosition: null,
        isJudging: false,
        // DOM Hijacking state
        grabbedElementId: null,
        isGrabbing: false,
        grabPosition: null,
        protectedSections: ['section-experience', 'section-skills'] // Default protected sections
    });

    const workIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const konamiSequence = useRef<string[]>([]);
    const observerRef = useRef<MutationObserver | null>(null);
    const lastInputRef = useRef<HTMLElement | null>(null);

    // ========================================================================
    // AUTO-FIX FUNCTIONS
    // ========================================================================

    const autoFixSkills = useCallback((): AutoFixResult => {
        const currentSkills = profile?.skills || [];
        const newSkills = DEFAULT_SKILLS.filter(s => !currentSkills.includes(s));

        if (newSkills.length === 0) {
            return { success: false, message: 'Skills déjà optimisés !', itemsAdded: 0 };
        }

        updateField('skills', [...currentSkills, ...newSkills]);
        return {
            success: true,
            message: `${newSkills.length} super-pouvoirs ajoutés !`,
            itemsAdded: newSkills.length
        };
    }, [profile, updateField]);

    const autoFixExperience = useCallback((): AutoFixResult => {
        const currentExp = profile?.experiences || [];

        if (currentExp.length > 0) {
            return { success: false, message: 'Expérience déjà présente !', itemsAdded: 0 };
        }

        updateField('experiences', [DEFAULT_EXPERIENCE]);
        return {
            success: true,
            message: 'Expérience de rêve ajoutée !',
            itemsAdded: 1
        };
    }, [profile, updateField]);

    const autoFixEducation = useCallback((): AutoFixResult => {
        const currentEdu = profile?.educations || [];

        if (currentEdu.length > 0) {
            return { success: false, message: 'Formation déjà présente !', itemsAdded: 0 };
        }

        updateField('educations', [DEFAULT_EDUCATION]);
        return {
            success: true,
            message: 'Diplôme de prestige ajouté !',
            itemsAdded: 1
        };
    }, [profile, updateField]);

    const autoFixLanguages = useCallback((): AutoFixResult => {
        const currentLang = profile?.languages || [];

        if (currentLang.some(l => l.name === 'English')) {
            return { success: false, message: 'Langues OK !', itemsAdded: 0 };
        }

        updateField('languages', [...currentLang, DEFAULT_LANGUAGE]);
        return {
            success: true,
            message: 'English added! 🌍',
            itemsAdded: 1
        };
    }, [profile, updateField]);

    const autoFixSummary = useCallback((): AutoFixResult => {
        const currentSummary = profile?.summary || '';

        if (currentSummary.length > 50) {
            return { success: false, message: 'Résumé déjà solide !', itemsAdded: 0 };
        }

        updateField('summary', DEFAULT_SUMMARY);
        return {
            success: true,
            message: 'Résumé de CEO ajouté !',
            itemsAdded: 1
        };
    }, [profile, updateField]);

    // ========================================================================
    // PERFORM ACTION (Main entry point)
    // ========================================================================

    const performAction = useCallback(async (sectionId: string): Promise<AutoFixResult> => {
        // Start flying animation
        setState(prev => ({
            ...prev,
            action: 'flying',
            targetId: sectionId,
            isWorking: false,
            workProgress: 0,
            completionMessage: null,
            isWinking: false
        }));

        // Wait for fly animation
        await new Promise(resolve => setTimeout(resolve, 800));

        // Start working animation
        setState(prev => ({
            ...prev,
            action: 'working',
            isWorking: true
        }));

        // Simulate work progress
        let progress = 0;
        await new Promise<void>(resolve => {
            workIntervalRef.current = setInterval(() => {
                progress += 20;
                setState(prev => ({ ...prev, workProgress: progress }));
                if (progress >= 100) {
                    if (workIntervalRef.current) clearInterval(workIntervalRef.current);
                    resolve();
                }
            }, 150);
        });

        // Perform actual fix based on section
        let result: AutoFixResult;
        switch (sectionId) {
            case 'section-skills':
                result = autoFixSkills();
                break;
            case 'section-experience':
                result = autoFixExperience();
                break;
            case 'section-education':
                result = autoFixEducation();
                break;
            case 'section-languages':
                result = autoFixLanguages();
                break;
            case 'section-summary':
                result = autoFixSummary();
                break;
            default:
                result = { success: false, message: 'Section inconnue', itemsAdded: 0 };
        }

        // Complete animation with wink
        setState(prev => ({
            ...prev,
            action: 'complete',
            isWorking: false,
            workProgress: 100,
            completionMessage: result.message,
            isWinking: true
        }));

        // Reset wink after delay
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                isWinking: false,
                action: 'idle'
            }));
        }, 2000);

        return result;
    }, [autoFixSkills, autoFixExperience, autoFixEducation, autoFixLanguages, autoFixSummary]);

    // ========================================================================
    // WEAK WORD DETECTION
    // ========================================================================

    const checkWeakWord = useCallback((text: string): string | null => {
        const lowerText = text.toLowerCase();
        for (const word of WEAK_WORDS) {
            if (lowerText.includes(word.toLowerCase())) {
                return word;
            }
        }
        return null;
    }, []);

    /**
     * Teleport to an element and start judging
     */
    const teleportToElement = useCallback((element: HTMLElement, word: string) => {
        const rect = element.getBoundingClientRect();
        const position = {
            x: rect.right + 15,
            y: rect.top + rect.height / 2 - 40
        };

        // Store reference for continuous watching
        lastInputRef.current = element;

        setState(prev => ({
            ...prev,
            action: 'judging',
            judgingWord: word,
            judgmentPosition: position,
            isJudging: true
        }));

        // Stop judging after a moment
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                action: 'idle',
                judgingWord: null,
                judgmentPosition: null,
                isJudging: false
            }));
            lastInputRef.current = null;
        }, 4000);
    }, []);

    const startJudging = useCallback((word: string, element?: HTMLElement) => {
        if (element) {
            teleportToElement(element, word);
        } else {
            setState(prev => ({
                ...prev,
                action: 'judging',
                judgingWord: word,
                isJudging: true
            }));

            // Stop judging after a moment
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    action: 'idle',
                    judgingWord: null,
                    isJudging: false
                }));
            }, 3000);
        }
    }, [teleportToElement]);

    // ========================================================================
    // KONAMI CODE DETECTION
    // ========================================================================

    const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            konamiSequence.current.push(e.key);
            konamiSequence.current = konamiSequence.current.slice(-10);

            if (JSON.stringify(konamiSequence.current) === JSON.stringify(KONAMI_CODE)) {
                activateSeriousMode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const activateSeriousMode = useCallback(() => {
        setState(prev => ({
            ...prev,
            action: 'serious',
            seriousMode: true
        }));

        // Add dramatic effect to document
        document.body.classList.add('omega-serious-mode');

        // Trigger shockwave after a moment
        setTimeout(() => {
            triggerShockwaveRewrite();
        }, 1500);

        // Deactivate after some time
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                seriousMode: false,
                action: 'idle'
            }));
            document.body.classList.remove('omega-serious-mode');
        }, 10000);
    }, []);

    /**
     * Trigger a shockwave visual effect that rewrites CV content
     */
    const triggerShockwaveRewrite = useCallback(() => {
        // Create shockwave ring element
        const ring = document.createElement('div');
        ring.className = 'omega-shockwave-ring';
        ring.style.left = '50%';
        ring.style.top = '50%';
        ring.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(ring);

        // Remove after animation
        setTimeout(() => {
            ring.remove();
        }, 1000);

        // Apply god-mode text rewrite if in serious mode
        if (state.seriousMode) {
            const cvSections = document.querySelectorAll('[id^="section-"]');
            cvSections.forEach((section, index) => {
                setTimeout(() => {
                    section.classList.add('omega-text-rewrite');
                    setTimeout(() => {
                        section.classList.remove('omega-text-rewrite');
                    }, 500);
                }, index * 200);
            });
        }
    }, [state.seriousMode]);

    // Triple click counter
    const clickCountRef = useRef(0);
    const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTripleClick = useCallback(() => {
        clickCountRef.current++;

        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

        clickTimerRef.current = setTimeout(() => {
            if (clickCountRef.current >= 3) {
                activateSeriousMode();
            }
            clickCountRef.current = 0;
        }, 500);
    }, [activateSeriousMode]);

    // ========================================================================
    // INPUT WATCHER (Weak Word Detection via Event Listener)
    // ========================================================================

    useEffect(() => {
        // Watch for input events across the document
        const handleInput = (e: Event) => {
            const target = e.target as HTMLElement;

            // Only watch text inputs within the CV area
            if (!(target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target.isContentEditable)) {
                return;
            }

            // Don't judge if already judging
            if (state.isJudging) return;

            const text = target.textContent || (target as HTMLInputElement).value || '';
            const weakWord = checkWeakWord(text);

            if (weakWord) {
                // Found a weak word! Teleport and judge.
                teleportToElement(target, weakWord);
            }
        };

        // Debounced input handler
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        const debouncedHandler = (e: Event) => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => handleInput(e), 500);
        };

        document.addEventListener('input', debouncedHandler, true);

        // Store observer ref for cleanup
        observerRef.current = null; // We use event listener instead of MutationObserver

        return () => {
            document.removeEventListener('input', debouncedHandler, true);
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, [checkWeakWord, state.isJudging, teleportToElement]);

    // ========================================================================
    // DOM HIJACKING - GRAB & DROP
    // ========================================================================

    /**
     * Grab an element from the CV - makes it float under the rocket
     */
    const grabElement = useCallback((elementId: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        const rect = element.getBoundingClientRect();

        // Clone the element's HTML for visual representation
        const clonedHtml = element.outerHTML;

        // Add visual grab effect to the element
        element.classList.add('omega-grabbed');

        // Store in global state for the floating clone
        useOmegaStore.getState().setGrabbedElement({
            id: elementId,
            html: clonedHtml,
            rect: rect,
            originalPosition: { x: rect.left, y: rect.top }
        });

        setState(prev => ({
            ...prev,
            grabbedElementId: elementId,
            isGrabbing: true,
            grabPosition: {
                x: rect.left + rect.width / 2,
                y: rect.top
            }
        }));

        // Play grab sound effect
        try {
            const grabSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==');
            grabSound.volume = 0.3;
            grabSound.play().catch(() => { });
        } catch (e) {
            // Audio not supported
        }
    }, []);

    /**
     * Drop the grabbed element at a new position
     */
    const dropElement = useCallback((_targetPosition?: { x: number; y: number }) => {
        if (!state.grabbedElementId) return;

        const element = document.getElementById(state.grabbedElementId);
        if (element) {
            // Remove grab effect
            element.classList.remove('omega-grabbed');

            // Add drop animation effect
            element.classList.add('omega-dropped');
            setTimeout(() => {
                element.classList.remove('omega-dropped');
            }, 600);
        }

        // Clear global store
        useOmegaStore.getState().setGrabbedElement(null);

        setState(prev => ({
            ...prev,
            grabbedElementId: null,
            isGrabbing: false,
            grabPosition: null
        }));

        // Play drop sound effect
        try {
            const dropSound = new Audio('data:audio/wav;base64,UklGRl9vT19teleWWWFm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==');
            dropSound.volume = 0.25;
            dropSound.play().catch(() => { });
        } catch (e) {
            // Audio not supported
        }
    }, [state.grabbedElementId]);

    /**
     * Protect a section from deletion
     */
    const protectSection = useCallback((sectionId: string) => {
        setState(prev => {
            if (prev.protectedSections.includes(sectionId)) return prev;
            return {
                ...prev,
                protectedSections: [...prev.protectedSections, sectionId]
            };
        });
    }, []);

    /**
     * Unprotect a section (allow deletion)
     */
    const unprotectSection = useCallback((sectionId: string) => {
        setState(prev => ({
            ...prev,
            protectedSections: prev.protectedSections.filter(id => id !== sectionId)
        }));
    }, []);

    /**
     * Intercept a delete action on a protected section
     * Returns true if the action was blocked
     */
    const interceptDelete = useCallback((sectionId: string): boolean => {
        if (!state.protectedSections.includes(sectionId)) {
            return false; // Allow deletion
        }

        // Block the deletion and show warning
        const element = document.getElementById(sectionId);
        if (element) {
            // Visual warning effect
            element.classList.add('omega-protected-warning');
            setTimeout(() => {
                element.classList.remove('omega-protected-warning');
            }, 1000);
        }

        // Teleport to the protected section with a warning
        if (element) {
            teleportToElement(element, 'PROTECTED!');
        }

        return true; // Deletion was blocked
    }, [state.protectedSections, teleportToElement]);

    // ========================================================================
    // EVENT INTERCEPTION - Global listener for delete actions
    // ========================================================================

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Intercept Delete/Backspace on protected sections
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const activeElement = document.activeElement;
                if (activeElement) {
                    // Check if we're in a protected section
                    const section = activeElement.closest('[id^="section-"]');
                    if (section && state.protectedSections.includes(section.id)) {
                        // Only block if trying to delete the entire section
                        // (not just editing text within it)
                        const isEditingText = activeElement.tagName === 'INPUT' ||
                            activeElement.tagName === 'TEXTAREA' ||
                            (activeElement as HTMLElement).isContentEditable;

                        if (!isEditingText) {
                            e.preventDefault();
                            e.stopPropagation();
                            interceptDelete(section.id);
                        }
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [state.protectedSections, interceptDelete]);

    // ========================================================================
    // CLEANUP
    // ========================================================================

    useEffect(() => {
        return () => {
            if (workIntervalRef.current) clearInterval(workIntervalRef.current);
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        };
    }, []);

    return {
        state,
        performAction,
        checkWeakWord,
        startJudging,
        handleTripleClick,
        activateSeriousMode,
        // DOM Hijacking
        grabElement,
        dropElement,
        protectSection,
        unprotectSection,
        interceptDelete
    };
}

export default useOmegaAgent;

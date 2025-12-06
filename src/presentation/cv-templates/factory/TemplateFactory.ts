/**
 * CURATED TEMPLATES - 50 Clean & Balanced Designs
 * 
 * Distribution:
 * - 10 ATS-First (priority for job applications)
 * - 10 Modern/Tech
 * - 10 Business/Corporate
 * - 10 Creative/Marketing
 * - 5 Sidebar Layouts
 * - 5 Specialized (Healthcare, Academic)
 */

// ============================================================================
// TYPES
// ============================================================================

export type TagCategory = 'ats' | 'style' | 'industry' | 'experience' | 'feature' | 'region';

export interface TemplateTag {
    id: string;
    label: string;
    color: string;
    category: TagCategory;
}

// Gene types for template configuration
export type HeaderGene = 'minimal-left' | 'minimal-center' | 'minimal-right' | 'bold-gradient' | 'bold-solid' |
    'classic-underline' | 'classic-border' | 'split-twocolor' | 'sidebar-left' | 'sidebar-right' |
    'banner-full' | 'banner-accent' | 'code-terminal' | 'executive-serif' | 'creative-diagonal' |
    'modern-geometric' | 'elegant-line' | 'swiss-clean' | 'corporate-boxed' | 'startup-bold';

export type ColorSchemeGene = 'mono-black' | 'mono-gray' | 'mono-navy' | 'accent-blue' | 'accent-teal' |
    'accent-green' | 'accent-purple' | 'accent-red' | 'accent-orange' | 'accent-gold' |
    'gradient-blue-cyan' | 'gradient-purple-pink' | 'gradient-green-teal' | 'gradient-orange-red' |
    'dark-mode' | 'warm-earth' | 'cool-ocean' | 'swiss-red' | 'corporate-navy' | 'vibrant-creative';

export type TypographyGene = 'classic-times' | 'classic-georgia' | 'modern-inter' | 'modern-roboto' |
    'elegant-playfair' | 'tech-jetbrains' | 'bold-poppins' | 'clean-opensans' | 'swiss-helvetica' | 'creative-montserrat';

export type LayoutGene = 'single-column' | 'two-column-30-70' | 'two-column-40-60' | 'two-column-50-50' |
    'sidebar-left-25' | 'sidebar-right-25';

export type SectionStyleGene = 'underline-accent' | 'minimal-line' | 'bold-caps' | 'icon-prefix' | 'boxed-header';

export type DensityGene = 'spacious' | 'comfortable' | 'compact' | 'dense';

export interface TemplateGenes {
    header: HeaderGene;
    colorScheme: ColorSchemeGene;
    typography: TypographyGene;
    layout: LayoutGene;
    sectionStyle: SectionStyleGene;
    density: DensityGene;
}

export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    genes: TemplateGenes;
    tags: TemplateTag[];
    attributes: {
        atsScore: number;
        creativityScore: number;
        formalityScore: number;
        isNew: boolean;
        isPremium: boolean;
    };
}

// ============================================================================
// TAG COLORS BY CATEGORY
// ============================================================================

export const TAG_COLORS: Record<TagCategory, string> = {
    ats: '#22c55e',
    style: '#8b5cf6',
    industry: '#3b82f6',
    experience: '#f59e0b',
    feature: '#ef4444',
    region: '#06b6d4'
};

// ============================================================================
// PREDEFINED TAGS
// ============================================================================

export const TAGS = {
    // ATS
    ats: { id: 'ats', label: 'ATS', color: '#22c55e', category: 'ats' as TagCategory },
    atsFriendly: { id: 'ats-friendly', label: 'ATS-Friendly', color: '#22c55e', category: 'ats' as TagCategory },
    atsSafe: { id: 'ats-safe', label: 'ATS-Safe', color: '#22c55e', category: 'ats' as TagCategory },

    // Style
    minimal: { id: 'minimal', label: 'Minimal', color: '#8b5cf6', category: 'style' as TagCategory },
    modern: { id: 'modern', label: 'Modern', color: '#8b5cf6', category: 'style' as TagCategory },
    classic: { id: 'classic', label: 'Classic', color: '#8b5cf6', category: 'style' as TagCategory },
    creative: { id: 'creative', label: 'Creative', color: '#8b5cf6', category: 'style' as TagCategory },
    bold: { id: 'bold', label: 'Bold', color: '#8b5cf6', category: 'style' as TagCategory },
    elegant: { id: 'elegant', label: 'Elegant', color: '#8b5cf6', category: 'style' as TagCategory },
    pro: { id: 'pro', label: 'Pro', color: '#8b5cf6', category: 'style' as TagCategory },

    // Industry
    tech: { id: 'tech', label: 'Tech', color: '#3b82f6', category: 'industry' as TagCategory },
    finance: { id: 'finance', label: 'Finance', color: '#3b82f6', category: 'industry' as TagCategory },
    healthcare: { id: 'healthcare', label: 'Santé', color: '#3b82f6', category: 'industry' as TagCategory },
    legal: { id: 'legal', label: 'Juridique', color: '#3b82f6', category: 'industry' as TagCategory },
    creativeInd: { id: 'creative-ind', label: 'Créatif', color: '#3b82f6', category: 'industry' as TagCategory },
    consulting: { id: 'consulting', label: 'Conseil', color: '#3b82f6', category: 'industry' as TagCategory },
    academic: { id: 'academic', label: 'Académique', color: '#3b82f6', category: 'industry' as TagCategory },
    marketing: { id: 'marketing', label: 'Marketing', color: '#3b82f6', category: 'industry' as TagCategory },
    engineering: { id: 'engineering', label: 'Ingénierie', color: '#3b82f6', category: 'industry' as TagCategory },
    startup: { id: 'startup', label: 'Startup', color: '#3b82f6', category: 'industry' as TagCategory },

    // Experience
    junior: { id: 'junior', label: 'Junior', color: '#f59e0b', category: 'experience' as TagCategory },
    confirmed: { id: 'confirmed', label: 'Confirmé', color: '#f59e0b', category: 'experience' as TagCategory },
    senior: { id: 'senior', label: 'Senior', color: '#f59e0b', category: 'experience' as TagCategory },
    executive: { id: 'executive', label: 'Executive', color: '#f59e0b', category: 'experience' as TagCategory },

    // Features
    noPhoto: { id: 'no-photo', label: 'Sans Photo', color: '#ef4444', category: 'feature' as TagCategory },
    photo: { id: 'photo', label: 'Photo', color: '#ef4444', category: 'feature' as TagCategory },
    icons: { id: 'icons', label: 'Icônes', color: '#ef4444', category: 'feature' as TagCategory },
    sidebar: { id: 'sidebar', label: 'Sidebar', color: '#ef4444', category: 'feature' as TagCategory },

    // Region
    swiss: { id: 'swiss', label: 'Swiss', color: '#06b6d4', category: 'region' as TagCategory },
    eu: { id: 'eu', label: 'EU', color: '#06b6d4', category: 'region' as TagCategory },
    international: { id: 'international', label: 'International', color: '#06b6d4', category: 'region' as TagCategory }
};

export const PREDEFINED_TAGS = Object.values(TAGS);

// ============================================================================
// 50 CURATED TEMPLATES
// ============================================================================

export const CURATED_TEMPLATES: TemplateConfig[] = [
    // ===== 1-10: ATS-FIRST TEMPLATES (Highest Priority) =====
    {
        id: 'ats-classic-black',
        name: 'ATS Classic',
        description: 'Times New Roman noir, 100% compatible ATS',
        genes: { header: 'minimal-left', colorScheme: 'mono-black', typography: 'classic-times', layout: 'single-column', sectionStyle: 'underline-accent', density: 'comfortable' },
        tags: [TAGS.ats, TAGS.classic, TAGS.noPhoto, TAGS.international],
        attributes: { atsScore: 100, creativityScore: 10, formalityScore: 95, isNew: false, isPremium: false }
    },
    {
        id: 'ats-navy-clean',
        name: 'ATS Navy',
        description: 'Bleu marine professionnel, ATS optimisé',
        genes: { header: 'classic-underline', colorScheme: 'mono-navy', typography: 'classic-georgia', layout: 'single-column', sectionStyle: 'underline-accent', density: 'comfortable' },
        tags: [TAGS.ats, TAGS.classic, TAGS.elegant, TAGS.senior, TAGS.eu],
        attributes: { atsScore: 98, creativityScore: 15, formalityScore: 90, isNew: false, isPremium: false }
    },
    {
        id: 'ats-gray-minimal',
        name: 'ATS Minimal',
        description: 'Ultra-minimaliste gris pour ATS',
        genes: { header: 'minimal-left', colorScheme: 'mono-gray', typography: 'swiss-helvetica', layout: 'single-column', sectionStyle: 'minimal-line', density: 'compact' },
        tags: [TAGS.ats, TAGS.minimal, TAGS.noPhoto, TAGS.swiss],
        attributes: { atsScore: 100, creativityScore: 10, formalityScore: 85, isNew: false, isPremium: false }
    },
    {
        id: 'ats-executive',
        name: 'ATS Executive',
        description: 'Style executive compatible ATS',
        genes: { header: 'executive-serif', colorScheme: 'mono-navy', typography: 'elegant-playfair', layout: 'single-column', sectionStyle: 'bold-caps', density: 'spacious' },
        tags: [TAGS.atsFriendly, TAGS.elegant, TAGS.executive, TAGS.finance],
        attributes: { atsScore: 90, creativityScore: 25, formalityScore: 95, isNew: true, isPremium: true }
    },
    {
        id: 'ats-swiss',
        name: 'ATS Swiss',
        description: 'Design suisse Helvetica, ATS safe',
        genes: { header: 'swiss-clean', colorScheme: 'accent-red', typography: 'swiss-helvetica', layout: 'single-column', sectionStyle: 'minimal-line', density: 'comfortable' },
        tags: [TAGS.atsSafe, TAGS.minimal, TAGS.modern, TAGS.swiss],
        attributes: { atsScore: 92, creativityScore: 30, formalityScore: 80, isNew: true, isPremium: false }
    },
    {
        id: 'ats-blue-modern',
        name: 'ATS Modern Blue',
        description: 'Bleu moderne compatible ATS',
        genes: { header: 'banner-accent', colorScheme: 'accent-blue', typography: 'modern-inter', layout: 'single-column', sectionStyle: 'underline-accent', density: 'comfortable' },
        tags: [TAGS.atsFriendly, TAGS.modern, TAGS.tech, TAGS.confirmed],
        attributes: { atsScore: 85, creativityScore: 40, formalityScore: 70, isNew: false, isPremium: false }
    },
    {
        id: 'ats-corporate',
        name: 'ATS Corporate',
        description: 'Style corporate classique',
        genes: { header: 'corporate-boxed', colorScheme: 'corporate-navy', typography: 'clean-opensans', layout: 'single-column', sectionStyle: 'boxed-header', density: 'comfortable' },
        tags: [TAGS.atsSafe, TAGS.pro, TAGS.consulting, TAGS.senior],
        attributes: { atsScore: 88, creativityScore: 35, formalityScore: 85, isNew: false, isPremium: false }
    },
    {
        id: 'ats-teal-clean',
        name: 'ATS Teal',
        description: 'Accent teal professionnel',
        genes: { header: 'minimal-center', colorScheme: 'accent-teal', typography: 'modern-roboto', layout: 'single-column', sectionStyle: 'minimal-line', density: 'comfortable' },
        tags: [TAGS.atsSafe, TAGS.modern, TAGS.healthcare, TAGS.confirmed],
        attributes: { atsScore: 88, creativityScore: 35, formalityScore: 75, isNew: false, isPremium: false }
    },
    {
        id: 'ats-finance',
        name: 'ATS Finance',
        description: 'Sobre et formel pour banque',
        genes: { header: 'classic-border', colorScheme: 'accent-gold', typography: 'classic-times', layout: 'single-column', sectionStyle: 'bold-caps', density: 'spacious' },
        tags: [TAGS.atsFriendly, TAGS.elegant, TAGS.finance, TAGS.executive],
        attributes: { atsScore: 90, creativityScore: 25, formalityScore: 95, isNew: false, isPremium: true }
    },
    {
        id: 'ats-legal',
        name: 'ATS Legal',
        description: 'Ultra-formel pour avocats',
        genes: { header: 'classic-underline', colorScheme: 'accent-red', typography: 'classic-times', layout: 'single-column', sectionStyle: 'underline-accent', density: 'spacious' },
        tags: [TAGS.atsFriendly, TAGS.classic, TAGS.legal, TAGS.senior],
        attributes: { atsScore: 92, creativityScore: 15, formalityScore: 98, isNew: false, isPremium: false }
    },

    // ===== 11-20: MODERN/TECH TEMPLATES =====
    {
        id: 'tech-terminal',
        name: 'Terminal',
        description: 'Style développeur terminal',
        genes: { header: 'code-terminal', colorScheme: 'dark-mode', typography: 'tech-jetbrains', layout: 'single-column', sectionStyle: 'minimal-line', density: 'compact' },
        tags: [TAGS.creative, TAGS.tech, TAGS.confirmed, TAGS.icons],
        attributes: { atsScore: 60, creativityScore: 95, formalityScore: 30, isNew: true, isPremium: true }
    },
    {
        id: 'tech-startup',
        name: 'Startup Bold',
        description: 'Gradient coloré pour startups',
        genes: { header: 'startup-bold', colorScheme: 'gradient-purple-pink', typography: 'bold-poppins', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.creative, TAGS.bold, TAGS.startup, TAGS.junior, TAGS.icons],
        attributes: { atsScore: 50, creativityScore: 90, formalityScore: 25, isNew: true, isPremium: false }
    },
    {
        id: 'tech-modern-blue',
        name: 'Modern Blue',
        description: 'Bleu tech moderne',
        genes: { header: 'modern-geometric', colorScheme: 'accent-blue', typography: 'modern-inter', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.tech, TAGS.confirmed, TAGS.icons],
        attributes: { atsScore: 75, creativityScore: 60, formalityScore: 60, isNew: false, isPremium: false }
    },
    {
        id: 'tech-developer',
        name: 'Developer Dark',
        description: 'Mode sombre pour devs',
        genes: { header: 'bold-solid', colorScheme: 'dark-mode', typography: 'tech-jetbrains', layout: 'single-column', sectionStyle: 'boxed-header', density: 'compact' },
        tags: [TAGS.creative, TAGS.tech, TAGS.confirmed, TAGS.icons],
        attributes: { atsScore: 55, creativityScore: 85, formalityScore: 35, isNew: true, isPremium: true }
    },
    {
        id: 'tech-teal',
        name: 'Tech Teal',
        description: 'Accent teal pour ingénieurs',
        genes: { header: 'elegant-line', colorScheme: 'accent-teal', typography: 'modern-roboto', layout: 'single-column', sectionStyle: 'minimal-line', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.tech, TAGS.engineering, TAGS.senior],
        attributes: { atsScore: 80, creativityScore: 50, formalityScore: 65, isNew: false, isPremium: false }
    },
    {
        id: 'tech-gradient-cyan',
        name: 'Gradient Cyan',
        description: 'Gradient bleu-cyan vibrant',
        genes: { header: 'bold-gradient', colorScheme: 'gradient-blue-cyan', typography: 'modern-inter', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.creative, TAGS.modern, TAGS.startup, TAGS.icons],
        attributes: { atsScore: 55, creativityScore: 85, formalityScore: 40, isNew: true, isPremium: false }
    },
    {
        id: 'tech-clean',
        name: 'Tech Clean',
        description: 'Minimaliste propre tech',
        genes: { header: 'minimal-center', colorScheme: 'mono-black', typography: 'modern-inter', layout: 'single-column', sectionStyle: 'minimal-line', density: 'compact' },
        tags: [TAGS.minimal, TAGS.modern, TAGS.tech, TAGS.noPhoto],
        attributes: { atsScore: 90, creativityScore: 35, formalityScore: 70, isNew: false, isPremium: false }
    },
    {
        id: 'tech-green',
        name: 'Tech Green',
        description: 'Vert énergie renouvelable',
        genes: { header: 'banner-accent', colorScheme: 'accent-green', typography: 'modern-roboto', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.tech, TAGS.engineering, TAGS.icons],
        attributes: { atsScore: 78, creativityScore: 55, formalityScore: 60, isNew: true, isPremium: false }
    },
    {
        id: 'tech-purple',
        name: 'Tech Purple',
        description: 'Violet créatif tech',
        genes: { header: 'modern-geometric', colorScheme: 'accent-purple', typography: 'creative-montserrat', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.creative, TAGS.modern, TAGS.tech, TAGS.confirmed],
        attributes: { atsScore: 70, creativityScore: 70, formalityScore: 50, isNew: false, isPremium: false }
    },
    {
        id: 'tech-roboto',
        name: 'Tech Minimal',
        description: 'Roboto ultra-clean',
        genes: { header: 'swiss-clean', colorScheme: 'mono-gray', typography: 'modern-roboto', layout: 'single-column', sectionStyle: 'minimal-line', density: 'compact' },
        tags: [TAGS.minimal, TAGS.modern, TAGS.tech, TAGS.noPhoto],
        attributes: { atsScore: 92, creativityScore: 30, formalityScore: 75, isNew: false, isPremium: false }
    },

    // ===== 21-30: BUSINESS/CORPORATE TEMPLATES =====
    {
        id: 'business-banker',
        name: 'Private Banker',
        description: 'Navy-or pour banque privée',
        genes: { header: 'corporate-boxed', colorScheme: 'accent-gold', typography: 'classic-times', layout: 'single-column', sectionStyle: 'bold-caps', density: 'spacious' },
        tags: [TAGS.elegant, TAGS.pro, TAGS.finance, TAGS.executive, TAGS.swiss],
        attributes: { atsScore: 85, creativityScore: 30, formalityScore: 95, isNew: false, isPremium: true }
    },
    {
        id: 'business-consultant',
        name: 'Consultant Pro',
        description: 'Structure McKinsey style',
        genes: { header: 'corporate-boxed', colorScheme: 'accent-blue', typography: 'swiss-helvetica', layout: 'single-column', sectionStyle: 'boxed-header', density: 'comfortable' },
        tags: [TAGS.pro, TAGS.consulting, TAGS.senior, TAGS.icons],
        attributes: { atsScore: 85, creativityScore: 40, formalityScore: 85, isNew: false, isPremium: false }
    },
    {
        id: 'business-executive',
        name: 'Executive Elite',
        description: 'C-Level élégant',
        genes: { header: 'executive-serif', colorScheme: 'mono-navy', typography: 'elegant-playfair', layout: 'single-column', sectionStyle: 'bold-caps', density: 'spacious' },
        tags: [TAGS.elegant, TAGS.pro, TAGS.executive, TAGS.finance],
        attributes: { atsScore: 82, creativityScore: 35, formalityScore: 95, isNew: true, isPremium: true }
    },
    {
        id: 'business-strategy',
        name: 'Strategy Clean',
        description: 'Épuré stratégie conseil',
        genes: { header: 'minimal-center', colorScheme: 'mono-black', typography: 'modern-inter', layout: 'single-column', sectionStyle: 'minimal-line', density: 'compact' },
        tags: [TAGS.minimal, TAGS.pro, TAGS.consulting, TAGS.confirmed],
        attributes: { atsScore: 95, creativityScore: 25, formalityScore: 80, isNew: false, isPremium: false }
    },
    {
        id: 'business-investor',
        name: 'Investment Pro',
        description: 'Style investissement corporate',
        genes: { header: 'classic-border', colorScheme: 'corporate-navy', typography: 'classic-georgia', layout: 'single-column', sectionStyle: 'underline-accent', density: 'comfortable' },
        tags: [TAGS.classic, TAGS.elegant, TAGS.finance, TAGS.senior],
        attributes: { atsScore: 90, creativityScore: 25, formalityScore: 90, isNew: false, isPremium: false }
    },
    {
        id: 'business-manager',
        name: 'Manager Sharp',
        description: 'Style manager moderne',
        genes: { header: 'banner-accent', colorScheme: 'mono-navy', typography: 'swiss-helvetica', layout: 'single-column', sectionStyle: 'underline-accent', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.pro, TAGS.consulting, TAGS.senior],
        attributes: { atsScore: 88, creativityScore: 35, formalityScore: 82, isNew: false, isPremium: false }
    },
    {
        id: 'business-law',
        name: 'Legal Partner',
        description: 'Style partner cabinet',
        genes: { header: 'executive-serif', colorScheme: 'mono-navy', typography: 'elegant-playfair', layout: 'single-column', sectionStyle: 'bold-caps', density: 'spacious' },
        tags: [TAGS.elegant, TAGS.pro, TAGS.legal, TAGS.executive],
        attributes: { atsScore: 85, creativityScore: 25, formalityScore: 98, isNew: false, isPremium: true }
    },
    {
        id: 'business-notary',
        name: 'Notary Classic',
        description: 'Traditionnel notarial',
        genes: { header: 'classic-border', colorScheme: 'mono-navy', typography: 'classic-georgia', layout: 'single-column', sectionStyle: 'underline-accent', density: 'spacious' },
        tags: [TAGS.classic, TAGS.elegant, TAGS.legal, TAGS.swiss],
        attributes: { atsScore: 90, creativityScore: 15, formalityScore: 98, isNew: false, isPremium: false }
    },
    {
        id: 'business-audit',
        name: 'Audit Pro',
        description: 'Style Big Four audit',
        genes: { header: 'minimal-left', colorScheme: 'corporate-navy', typography: 'modern-roboto', layout: 'single-column', sectionStyle: 'underline-accent', density: 'compact' },
        tags: [TAGS.pro, TAGS.finance, TAGS.consulting, TAGS.confirmed],
        attributes: { atsScore: 92, creativityScore: 20, formalityScore: 88, isNew: false, isPremium: false }
    },
    {
        id: 'business-earth',
        name: 'Earth Warm',
        description: 'Tons terre naturels',
        genes: { header: 'swiss-clean', colorScheme: 'warm-earth', typography: 'classic-georgia', layout: 'single-column', sectionStyle: 'underline-accent', density: 'comfortable' },
        tags: [TAGS.classic, TAGS.elegant, TAGS.consulting, TAGS.senior],
        attributes: { atsScore: 85, creativityScore: 40, formalityScore: 80, isNew: true, isPremium: false }
    },

    // ===== 31-40: CREATIVE/MARKETING TEMPLATES =====
    {
        id: 'creative-diagonal',
        name: 'Diagonal Bold',
        description: 'Header diagonal audacieux',
        genes: { header: 'creative-diagonal', colorScheme: 'vibrant-creative', typography: 'creative-montserrat', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.creative, TAGS.bold, TAGS.creativeInd, TAGS.photo, TAGS.icons],
        attributes: { atsScore: 40, creativityScore: 98, formalityScore: 20, isNew: true, isPremium: true }
    },
    {
        id: 'creative-pink',
        name: 'Portfolio Pink',
        description: 'Rose vif créatif',
        genes: { header: 'bold-gradient', colorScheme: 'gradient-purple-pink', typography: 'bold-poppins', layout: 'single-column', sectionStyle: 'boxed-header', density: 'spacious' },
        tags: [TAGS.creative, TAGS.bold, TAGS.creativeInd, TAGS.photo, TAGS.icons],
        attributes: { atsScore: 35, creativityScore: 95, formalityScore: 15, isNew: true, isPremium: false }
    },
    {
        id: 'creative-geometric',
        name: 'Geometric Design',
        description: 'Formes géométriques modernes',
        genes: { header: 'modern-geometric', colorScheme: 'accent-purple', typography: 'creative-montserrat', layout: 'single-column', sectionStyle: 'minimal-line', density: 'comfortable' },
        tags: [TAGS.creative, TAGS.modern, TAGS.creativeInd, TAGS.photo],
        attributes: { atsScore: 50, creativityScore: 90, formalityScore: 30, isNew: true, isPremium: true }
    },
    {
        id: 'creative-orange',
        name: 'Artist Orange',
        description: 'Orange dynamique artiste',
        genes: { header: 'banner-full', colorScheme: 'gradient-orange-red', typography: 'bold-poppins', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.creative, TAGS.bold, TAGS.creativeInd, TAGS.photo, TAGS.icons],
        attributes: { atsScore: 35, creativityScore: 92, formalityScore: 20, isNew: false, isPremium: false }
    },
    {
        id: 'creative-ux',
        name: 'UX Designer',
        description: 'Clean moderne UX/UI',
        genes: { header: 'elegant-line', colorScheme: 'accent-blue', typography: 'clean-opensans', layout: 'single-column', sectionStyle: 'minimal-line', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.tech, TAGS.creativeInd, TAGS.icons],
        attributes: { atsScore: 75, creativityScore: 70, formalityScore: 50, isNew: true, isPremium: false }
    },
    {
        id: 'creative-marketing',
        name: 'Marketing Vibrant',
        description: 'Couleurs vives marketing',
        genes: { header: 'startup-bold', colorScheme: 'gradient-blue-cyan', typography: 'bold-poppins', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.creative, TAGS.bold, TAGS.marketing, TAGS.icons],
        attributes: { atsScore: 55, creativityScore: 85, formalityScore: 40, isNew: true, isPremium: false }
    },
    {
        id: 'creative-sales',
        name: 'Sales Dynamic',
        description: 'Orange commercial dynamique',
        genes: { header: 'banner-full', colorScheme: 'accent-orange', typography: 'modern-roboto', layout: 'single-column', sectionStyle: 'boxed-header', density: 'comfortable' },
        tags: [TAGS.bold, TAGS.modern, TAGS.marketing, TAGS.icons],
        attributes: { atsScore: 70, creativityScore: 65, formalityScore: 55, isNew: false, isPremium: false }
    },
    {
        id: 'creative-brand',
        name: 'Brand Manager',
        description: 'Élégant brand managers',
        genes: { header: 'elegant-line', colorScheme: 'accent-purple', typography: 'creative-montserrat', layout: 'single-column', sectionStyle: 'minimal-line', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.elegant, TAGS.marketing, TAGS.photo],
        attributes: { atsScore: 65, creativityScore: 75, formalityScore: 55, isNew: true, isPremium: true }
    },
    {
        id: 'creative-growth',
        name: 'Growth Hacker',
        description: 'Audacieux growth hackers',
        genes: { header: 'creative-diagonal', colorScheme: 'gradient-green-teal', typography: 'bold-poppins', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'compact' },
        tags: [TAGS.creative, TAGS.bold, TAGS.startup, TAGS.marketing, TAGS.icons],
        attributes: { atsScore: 50, creativityScore: 90, formalityScore: 30, isNew: true, isPremium: false }
    },
    {
        id: 'creative-twocolor',
        name: 'Two Color Split',
        description: 'Header bicolore audacieux',
        genes: { header: 'split-twocolor', colorScheme: 'gradient-purple-pink', typography: 'bold-poppins', layout: 'single-column', sectionStyle: 'boxed-header', density: 'comfortable' },
        tags: [TAGS.creative, TAGS.bold, TAGS.creativeInd, TAGS.photo, TAGS.icons],
        attributes: { atsScore: 40, creativityScore: 95, formalityScore: 25, isNew: true, isPremium: true }
    },

    // ===== 41-45: SIDEBAR LAYOUTS =====
    {
        id: 'sidebar-navy',
        name: 'Sidebar Navy',
        description: 'Sidebar bleu marine élégant',
        genes: { header: 'sidebar-left', colorScheme: 'mono-navy', typography: 'modern-inter', layout: 'sidebar-left-25', sectionStyle: 'minimal-line', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.elegant, TAGS.sidebar, TAGS.photo],
        attributes: { atsScore: 55, creativityScore: 70, formalityScore: 75, isNew: true, isPremium: true }
    },
    {
        id: 'sidebar-dark',
        name: 'Sidebar Dark',
        description: 'Sidebar mode sombre',
        genes: { header: 'sidebar-left', colorScheme: 'dark-mode', typography: 'tech-jetbrains', layout: 'sidebar-left-25', sectionStyle: 'boxed-header', density: 'compact' },
        tags: [TAGS.creative, TAGS.sidebar, TAGS.tech, TAGS.photo],
        attributes: { atsScore: 45, creativityScore: 85, formalityScore: 40, isNew: true, isPremium: true }
    },
    {
        id: 'sidebar-teal',
        name: 'Sidebar Teal',
        description: 'Sidebar teal moderne',
        genes: { header: 'sidebar-left', colorScheme: 'accent-teal', typography: 'clean-opensans', layout: 'sidebar-left-25', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.sidebar, TAGS.healthcare, TAGS.photo],
        attributes: { atsScore: 55, creativityScore: 65, formalityScore: 60, isNew: false, isPremium: false }
    },
    {
        id: 'sidebar-purple',
        name: 'Sidebar Purple',
        description: 'Sidebar violet créatif',
        genes: { header: 'sidebar-left', colorScheme: 'accent-purple', typography: 'creative-montserrat', layout: 'sidebar-left-25', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.creative, TAGS.sidebar, TAGS.creativeInd, TAGS.photo],
        attributes: { atsScore: 50, creativityScore: 80, formalityScore: 45, isNew: true, isPremium: false }
    },
    {
        id: 'sidebar-gold',
        name: 'Sidebar Executive',
        description: 'Sidebar droite doré executive',
        genes: { header: 'sidebar-right', colorScheme: 'accent-gold', typography: 'elegant-playfair', layout: 'sidebar-right-25', sectionStyle: 'bold-caps', density: 'spacious' },
        tags: [TAGS.elegant, TAGS.sidebar, TAGS.finance, TAGS.executive, TAGS.photo],
        attributes: { atsScore: 55, creativityScore: 60, formalityScore: 85, isNew: true, isPremium: true }
    },

    // ===== 46-50: SPECIALIZED TEMPLATES =====
    {
        id: 'health-doctor',
        name: 'Doctor Teal',
        description: 'Teal médical pour médecins',
        genes: { header: 'minimal-left', colorScheme: 'accent-teal', typography: 'clean-opensans', layout: 'single-column', sectionStyle: 'underline-accent', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.pro, TAGS.healthcare, TAGS.senior],
        attributes: { atsScore: 88, creativityScore: 30, formalityScore: 85, isNew: false, isPremium: false }
    },
    {
        id: 'health-nurse',
        name: 'Nurse Green',
        description: 'Vert apaisant soignants',
        genes: { header: 'banner-accent', colorScheme: 'accent-green', typography: 'clean-opensans', layout: 'single-column', sectionStyle: 'icon-prefix', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.healthcare, TAGS.confirmed, TAGS.icons],
        attributes: { atsScore: 80, creativityScore: 40, formalityScore: 70, isNew: false, isPremium: false }
    },
    {
        id: 'academic-professor',
        name: 'Professor Classic',
        description: 'Classique académique',
        genes: { header: 'classic-border', colorScheme: 'mono-navy', typography: 'classic-times', layout: 'single-column', sectionStyle: 'underline-accent', density: 'spacious' },
        tags: [TAGS.classic, TAGS.elegant, TAGS.academic, TAGS.noPhoto],
        attributes: { atsScore: 95, creativityScore: 15, formalityScore: 95, isNew: false, isPremium: false }
    },
    {
        id: 'academic-researcher',
        name: 'Researcher Modern',
        description: 'Moderne pour chercheurs',
        genes: { header: 'swiss-clean', colorScheme: 'accent-blue', typography: 'modern-inter', layout: 'single-column', sectionStyle: 'underline-accent', density: 'comfortable' },
        tags: [TAGS.modern, TAGS.minimal, TAGS.academic, TAGS.noPhoto],
        attributes: { atsScore: 90, creativityScore: 30, formalityScore: 80, isNew: true, isPremium: false }
    },
    {
        id: 'international-ocean',
        name: 'Ocean Calm',
        description: 'Tons océan apaisants',
        genes: { header: 'elegant-line', colorScheme: 'cool-ocean', typography: 'clean-opensans', layout: 'single-column', sectionStyle: 'minimal-line', density: 'spacious' },
        tags: [TAGS.minimal, TAGS.elegant, TAGS.consulting, TAGS.international],
        attributes: { atsScore: 82, creativityScore: 45, formalityScore: 75, isNew: true, isPremium: false }
    }
];

// ============================================================================
// EXPORTS
// ============================================================================

export const GENERATED_TEMPLATES = CURATED_TEMPLATES;

export const TEMPLATE_BY_ID = new Map(
    CURATED_TEMPLATES.map(t => [t.id, t])
);

export function getTemplatesByTag(tagId: string): TemplateConfig[] {
    return CURATED_TEMPLATES.filter(t => t.tags.some(tag => tag.id === tagId));
}

export function filterTemplates(criteria: {
    search?: string;
    atsMin?: number;
    tags?: string[];
}): TemplateConfig[] {
    let results = [...CURATED_TEMPLATES];

    if (criteria.search) {
        const searchLower = criteria.search.toLowerCase();
        results = results.filter(t =>
            t.name.toLowerCase().includes(searchLower) ||
            t.description.toLowerCase().includes(searchLower) ||
            t.tags.some(tag => tag.label.toLowerCase().includes(searchLower))
        );
    }

    if (criteria.atsMin !== undefined && criteria.atsMin > 0) {
        results = results.filter(t => t.attributes.atsScore >= criteria.atsMin!);
    }

    if (criteria.tags && criteria.tags.length > 0) {
        results = results.filter(t =>
            criteria.tags!.some(tagId => t.tags.some(tag => tag.id === tagId))
        );
    }

    return results;
}

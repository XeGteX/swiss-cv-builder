export interface TemplateConfig {
    id: string;
    layout: 'classic' | 'modern' | 'sidebar-left' | 'sidebar-right';
    colors: {
        primary: string;
        secondary: string;
        text: string;
        background: string;
    };
    typography: {
        headingFont: string;
        bodyFont: string;
        scale: number;
    };
    spacing: {
        margin: number;
        gap: number;
    };
}

export const DEFAULT_THEME: TemplateConfig = {
    id: 'default',
    layout: 'modern',
    colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        text: '#0f172a',
        background: '#ffffff',
    },
    typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        scale: 1,
    },
    spacing: {
        margin: 24,
        gap: 16,
    }
};

export class TemplateEngine {
    static generateStyles(config: TemplateConfig): React.CSSProperties {
        return {
            '--primary-color': config.colors.primary,
            '--secondary-color': config.colors.secondary,
            '--text-color': config.colors.text,
            '--bg-color': config.colors.background,
            '--heading-font': config.typography.headingFont,
            '--body-font': config.typography.bodyFont,
            '--scale': config.typography.scale,
            '--margin': `${config.spacing.margin}px`,
            '--gap': `${config.spacing.gap}px`,
        } as React.CSSProperties;
    }

    static getLayoutClasses(layout: TemplateConfig['layout']): string {
        switch (layout) {
            case 'sidebar-left':
                return 'grid grid-cols-[300px_1fr] gap-[var(--gap)]';
            case 'sidebar-right':
                return 'grid grid-cols-[1fr_300px] gap-[var(--gap)]';
            case 'modern':
                return 'flex flex-col gap-[var(--gap)]';
            default:
                return 'block space-y-[var(--gap)]';
        }
    }
}

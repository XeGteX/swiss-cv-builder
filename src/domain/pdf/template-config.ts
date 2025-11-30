
import type { PDFVariant } from './types';

export interface TemplateConfig {
    variant: PDFVariant;
    page: {
        width: number; // px at 96 DPI (794 for A4)
        height: number; // px at 96 DPI (1123 for A4)
        marginTop: number;
        marginBottom: number;
        marginLeft: number;
        marginRight: number;
    };
    typography: {
        fontFamily: string;
        fontSize: {
            base: number;
            h1: number;
            h2: number;
            small: number;
        };
        lineHeight: number;
    };
    colors: {
        primary: string;
        text: string;
        background: string;
        secondary: string;
    };
    rules: {
        allowColumns: boolean;
        showIcons: boolean;
        showPhoto: boolean;
    };
}

export const PDF_CONFIG: Record<PDFVariant, TemplateConfig> = {
    visual: {
        variant: 'visual',
        page: {
            width: 794,
            height: 1123,
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20,
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
            fontSize: { base: 14, h1: 24, h2: 18, small: 12 },
            lineHeight: 1.5,
        },
        colors: {
            primary: '#4F46E5', // Indigo 600
            text: '#1E293B', // Slate 800
            background: '#FFFFFF',
            secondary: '#64748B', // Slate 500
        },
        rules: {
            allowColumns: true,
            showIcons: true,
            showPhoto: true,
        }
    },
    ats: {
        variant: 'ats',
        page: {
            width: 794,
            height: 1123,
            marginTop: 50,
            marginBottom: 50,
            marginLeft: 50,
            marginRight: 50,
        },
        typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: { base: 12, h1: 16, h2: 14, small: 11 },
            lineHeight: 1.4,
        },
        colors: {
            primary: '#000000',
            text: '#000000',
            background: '#FFFFFF',
            secondary: '#333333',
        },
        rules: {
            allowColumns: false,
            showIcons: false,
            showPhoto: false, // Often removed for ATS
        }
    },
    swiss: {
        variant: 'swiss',
        page: {
            width: 794,
            height: 1123,
            marginTop: 60, // More generous margins
            marginBottom: 60,
            marginLeft: 60,
            marginRight: 60,
        },
        typography: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: { base: 12, h1: 20, h2: 16, small: 10 },
            lineHeight: 1.6,
        },
        colors: {
            primary: '#2C3E50', // Dark Blue/Grey
            text: '#2C3E50',
            background: '#FFFFFF',
            secondary: '#7F8C8D',
        },
        rules: {
            allowColumns: false, // Strict vertical flow
            showIcons: false,
            showPhoto: true,
        }
    }
};

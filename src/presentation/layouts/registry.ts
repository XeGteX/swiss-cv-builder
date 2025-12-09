
import React from 'react';
import type { CVProfile } from '../../domain/entities/cv';

export interface TemplateProps {
    data: CVProfile;
    densityStyles: any; // We can make this stricter later
    accentColor: string;
    fontFamily: string;
    language: 'fr' | 'en';
}

export interface TemplateDefinition {
    id: string;
    name: string;
    thumbnail?: string;
    component: React.ComponentType<any>; // Flexible type for diverse template props
    isATS: boolean;
}

class LayoutRegistry {
    private templates: Map<string, TemplateDefinition> = new Map();

    register(template: TemplateDefinition) {
        this.templates.set(template.id, template);
    }

    get(id: string): TemplateDefinition | undefined {
        return this.templates.get(id);
    }

    getAll(): TemplateDefinition[] {
        return Array.from(this.templates.values());
    }
}

export const layoutRegistry = new LayoutRegistry();

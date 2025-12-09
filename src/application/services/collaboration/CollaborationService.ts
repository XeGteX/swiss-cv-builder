/**
 * Collaboration Service
 * 
 * Real-time collaboration features:
 * - Share CV for review
 * - Live comments and annotations
 * - Permission management
 * - Version history
 */

import type { CVProfile } from '../../../domain/entities/cv';

// ============================================================================
// TYPES
// ============================================================================

export interface Collaborator {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'editor' | 'viewer' | 'commenter';
    joinedAt: Date;
    lastActive?: Date;
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    targetSection?: string;
    targetField?: string;
    createdAt: Date;
    resolved: boolean;
    replies: Comment[];
}

export interface ShareLink {
    id: string;
    url: string;
    permission: 'view' | 'comment' | 'edit';
    expiresAt?: Date;
    password?: string;
    maxViews?: number;
    viewCount: number;
    createdAt: Date;
}

export interface CVVersion {
    id: string;
    name: string;
    snapshot: CVProfile;
    createdAt: Date;
    createdBy: string;
    description?: string;
}

export interface CollaborationState {
    cvId: string;
    owner: Collaborator;
    collaborators: Collaborator[];
    comments: Comment[];
    shareLinks: ShareLink[];
    versions: CVVersion[];
    isLive: boolean;
}

// ============================================================================
// COLLABORATION SERVICE
// ============================================================================

export class CollaborationService {
    private static STORAGE_KEY = 'nexal-collab';

    // ========================================================================
    // SHARE LINK MANAGEMENT
    // ========================================================================

    static createShareLink(
        cvId: string,
        permission: ShareLink['permission'] = 'view',
        options?: { expiresIn?: number; password?: string; maxViews?: number }
    ): ShareLink {
        const link: ShareLink = {
            id: this.generateId(),
            url: `${window.location.origin}/shared/${cvId}/${this.generateId()}`,
            permission,
            expiresAt: options?.expiresIn
                ? new Date(Date.now() + options.expiresIn * 1000)
                : undefined,
            password: options?.password,
            maxViews: options?.maxViews,
            viewCount: 0,
            createdAt: new Date()
        };

        this.saveShareLink(cvId, link);
        return link;
    }

    static getShareLinks(cvId: string): ShareLink[] {
        const state = this.getState(cvId);
        return state?.shareLinks || [];
    }

    static deleteShareLink(cvId: string, linkId: string): void {
        const state = this.getState(cvId);
        if (state) {
            state.shareLinks = state.shareLinks.filter(l => l.id !== linkId);
            this.saveState(cvId, state);
        }
    }

    private static saveShareLink(cvId: string, link: ShareLink): void {
        const state = this.getState(cvId) || this.createInitialState(cvId);
        state.shareLinks.push(link);
        this.saveState(cvId, state);
    }

    // ========================================================================
    // COMMENTS
    // ========================================================================

    static addComment(
        cvId: string,
        authorId: string,
        authorName: string,
        content: string,
        targetSection?: string,
        targetField?: string
    ): Comment {
        const comment: Comment = {
            id: this.generateId(),
            authorId,
            authorName,
            content,
            targetSection,
            targetField,
            createdAt: new Date(),
            resolved: false,
            replies: []
        };

        const state = this.getState(cvId) || this.createInitialState(cvId);
        state.comments.push(comment);
        this.saveState(cvId, state);

        return comment;
    }

    static getComments(cvId: string): Comment[] {
        const state = this.getState(cvId);
        return state?.comments || [];
    }

    static resolveComment(cvId: string, commentId: string): void {
        const state = this.getState(cvId);
        if (state) {
            const comment = state.comments.find(c => c.id === commentId);
            if (comment) {
                comment.resolved = true;
                this.saveState(cvId, state);
            }
        }
    }

    static replyToComment(cvId: string, commentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'resolved' | 'replies'>): void {
        const state = this.getState(cvId);
        if (state) {
            const comment = state.comments.find(c => c.id === commentId);
            if (comment) {
                comment.replies.push({
                    ...reply,
                    id: this.generateId(),
                    createdAt: new Date(),
                    resolved: false,
                    replies: []
                });
                this.saveState(cvId, state);
            }
        }
    }

    // ========================================================================
    // VERSION HISTORY
    // ========================================================================

    static saveVersion(
        cvId: string,
        profile: CVProfile,
        name: string,
        createdBy: string,
        description?: string
    ): CVVersion {
        const version: CVVersion = {
            id: this.generateId(),
            name,
            snapshot: JSON.parse(JSON.stringify(profile)), // Deep clone
            createdAt: new Date(),
            createdBy,
            description
        };

        const state = this.getState(cvId) || this.createInitialState(cvId);
        state.versions.unshift(version); // Most recent first

        // Keep only last 20 versions
        if (state.versions.length > 20) {
            state.versions = state.versions.slice(0, 20);
        }

        this.saveState(cvId, state);
        return version;
    }

    static getVersions(cvId: string): CVVersion[] {
        const state = this.getState(cvId);
        return state?.versions || [];
    }

    static restoreVersion(cvId: string, versionId: string): CVProfile | null {
        const state = this.getState(cvId);
        const version = state?.versions.find(v => v.id === versionId);
        return version?.snapshot || null;
    }

    // ========================================================================
    // COLLABORATORS
    // ========================================================================

    static addCollaborator(cvId: string, email: string, role: Collaborator['role']): Collaborator {
        const collaborator: Collaborator = {
            id: this.generateId(),
            name: email.split('@')[0],
            email,
            role,
            joinedAt: new Date()
        };

        const state = this.getState(cvId) || this.createInitialState(cvId);
        state.collaborators.push(collaborator);
        this.saveState(cvId, state);

        return collaborator;
    }

    static removeCollaborator(cvId: string, collaboratorId: string): void {
        const state = this.getState(cvId);
        if (state) {
            state.collaborators = state.collaborators.filter(c => c.id !== collaboratorId);
            this.saveState(cvId, state);
        }
    }

    static updateCollaboratorRole(cvId: string, collaboratorId: string, role: Collaborator['role']): void {
        const state = this.getState(cvId);
        if (state) {
            const collab = state.collaborators.find(c => c.id === collaboratorId);
            if (collab) {
                collab.role = role;
                this.saveState(cvId, state);
            }
        }
    }

    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================

    private static getState(cvId: string): CollaborationState | null {
        try {
            const stored = localStorage.getItem(`${this.STORAGE_KEY}-${cvId}`);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }

    private static saveState(cvId: string, state: CollaborationState): void {
        localStorage.setItem(`${this.STORAGE_KEY}-${cvId}`, JSON.stringify(state));
    }

    private static createInitialState(cvId: string): CollaborationState {
        return {
            cvId,
            owner: {
                id: 'owner',
                name: 'Moi',
                email: 'owner@local',
                role: 'owner',
                joinedAt: new Date()
            },
            collaborators: [],
            comments: [],
            shareLinks: [],
            versions: [],
            isLive: false
        };
    }

    private static generateId(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    // ========================================================================
    // EXPORT FOR NOTION/OBSIDIAN
    // ========================================================================

    static exportToMarkdown(profile: CVProfile): string {
        const lines: string[] = [];
        const name = `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim();

        lines.push(`# ${name || 'CV'}`);
        lines.push('');

        if (profile.personal?.title) {
            lines.push(`**${profile.personal.title}**`);
            lines.push('');
        }

        // Contact
        if (profile.personal?.contact) {
            lines.push('## 📧 Contact');
            if (profile.personal.contact.email) lines.push(`- Email: ${profile.personal.contact.email}`);
            if (profile.personal.contact.phone) lines.push(`- Tél: ${profile.personal.contact.phone}`);
            if (profile.personal.contact.linkedin) lines.push(`- LinkedIn: ${profile.personal.contact.linkedin}`);
            lines.push('');
        }

        // Summary
        if (profile.summary) {
            lines.push('## 📝 Résumé');
            lines.push(profile.summary);
            lines.push('');
        }

        // Experience
        if (profile.experiences?.length) {
            lines.push('## 💼 Expérience');
            profile.experiences.forEach(exp => {
                lines.push(`### ${exp.role} @ ${exp.company}`);
                lines.push(`*${exp.dates || ''}*`);
                if (exp.tasks?.length) {
                    exp.tasks.forEach(task => lines.push(`- ${task}`));
                }
                lines.push('');
            });
        }

        // Education
        if (profile.educations?.length) {
            lines.push('## 🎓 Formation');
            profile.educations.forEach(edu => {
                lines.push(`- **${edu.degree}** - ${edu.school} (${edu.year || ''})`);
            });
            lines.push('');
        }

        // Skills
        if (profile.skills?.length) {
            lines.push('## 💡 Compétences');
            const skillNames = (profile.skills as any[]).map(s => typeof s === 'string' ? s : s.name);
            lines.push(skillNames.map(s => `\`${s}\``).join(' '));
            lines.push('');
        }

        // Languages
        if (profile.languages?.length) {
            lines.push('## 🌍 Langues');
            profile.languages.forEach(lang => {
                lines.push(`- ${lang.name}: ${lang.level}`);
            });
            lines.push('');
        }

        lines.push('---');
        lines.push(`*Généré par NEXAL - ${new Date().toLocaleDateString('fr-FR')}*`);

        return lines.join('\n');
    }

    static exportToObsidian(profile: CVProfile): string {
        // Obsidian format with frontmatter
        const name = `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim();

        const frontmatter = [
            '---',
            `title: "CV - ${name}"`,
            `date: ${new Date().toISOString().split('T')[0]}`,
            'tags: [cv, professional]',
            `role: "${profile.personal?.title || ''}"`,
            '---',
            ''
        ].join('\n');

        return frontmatter + this.exportToMarkdown(profile);
    }

    static exportToNotion(profile: CVProfile): string {
        // Notion-friendly markdown with callouts
        const lines: string[] = [];
        const name = `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim();

        lines.push(`# ${name || 'CV'}`);
        lines.push('');

        if (profile.personal?.title) {
            lines.push(`> 🎯 **${profile.personal.title}**`);
            lines.push('');
        }

        // Add Notion-style callout for contact
        if (profile.personal?.contact) {
            lines.push('> [!info] Contact');
            if (profile.personal.contact.email) lines.push(`> 📧 ${profile.personal.contact.email}`);
            if (profile.personal.contact.phone) lines.push(`> 📱 ${profile.personal.contact.phone}`);
            lines.push('');
        }

        // Rest is similar to markdown
        lines.push(this.exportToMarkdown(profile).split('## 📧 Contact')[1] || '');

        return lines.join('\n');
    }
}

export default CollaborationService;

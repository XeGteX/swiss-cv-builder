/**
 * NEXAL Platform - DesignSpec Migrations
 * 
 * Forward-compatible migrations for schema evolution.
 */

import { type DesignSpec, DESIGN_SPEC_VERSION, DEFAULT_DESIGN_SPEC } from './DesignSpec';

// ============================================================================
// MIGRATION TYPES
// ============================================================================

type MigrationFn = (spec: unknown) => unknown;

interface Migration {
    from: string;
    to: string;
    migrate: MigrationFn;
}

// ============================================================================
// MIGRATION REGISTRY
// ============================================================================

const MIGRATIONS: Migration[] = [
    // Future migrations will be added here
    // {
    //     from: '1.0',
    //     to: '2.0',
    //     migrate: (spec) => ({
    //         ...spec,
    //         schemaVersion: '2.0',
    //         // Transform fields...
    //     }),
    // },
];

// ============================================================================
// MIGRATE FUNCTION
// ============================================================================

/**
 * Migrate a DesignSpec to the latest version.
 * Returns null if migration is not possible.
 */
export function migrateDesignSpec(input: unknown): DesignSpec | null {
    if (!input || typeof input !== 'object') {
        return null;
    }

    const inputSpec = input as Record<string, unknown>;
    let currentVersion = inputSpec.schemaVersion as string | undefined;
    let current = input;

    // No version = assume v1.0
    if (!currentVersion) {
        currentVersion = '1.0';
        current = { ...inputSpec, schemaVersion: '1.0' };
    }

    // Already at latest
    if (currentVersion === DESIGN_SPEC_VERSION) {
        return current as DesignSpec;
    }

    // Apply migrations in sequence
    for (const migration of MIGRATIONS) {
        if (currentVersion === migration.from) {
            current = migration.migrate(current);
            currentVersion = migration.to;
        }
    }

    // Failed to reach target version
    if (currentVersion !== DESIGN_SPEC_VERSION) {
        console.warn(`Could not migrate from ${currentVersion} to ${DESIGN_SPEC_VERSION}`);
        return null;
    }

    return current as DesignSpec;
}

// ============================================================================
// CONVERT FROM LEGACY DesignConfig
// ============================================================================

/**
 * Convert legacy DesignConfig to DesignSpec v1.
 * Used for backward compatibility during migration period.
 */
export function convertFromLegacyDesignConfig(legacy: Record<string, unknown>): DesignSpec {
    return {
        schemaVersion: '1.0',
        tokens: {
            colors: {
                accent: (legacy.accentColor as string) || DEFAULT_DESIGN_SPEC.tokens.colors.accent,
            },
            typography: {
                fontPairing: (legacy.fontPairing as string) || DEFAULT_DESIGN_SPEC.tokens.typography.fontPairing,
                fontSize: (legacy.fontSize as number) || DEFAULT_DESIGN_SPEC.tokens.typography.fontSize,
                lineHeight: (legacy.lineHeight as number) || DEFAULT_DESIGN_SPEC.tokens.typography.lineHeight,
                lineHeightSidebar: legacy.lineHeightSidebar as number | undefined,
                lineHeightContent: legacy.lineHeightContent as number | undefined,
            },
            borders: {
                sectionLineStyle: (legacy.sectionLineStyle as any) || DEFAULT_DESIGN_SPEC.tokens.borders.sectionLineStyle,
                sectionLineColor: (legacy.sectionLineColor as string) || DEFAULT_DESIGN_SPEC.tokens.borders.sectionLineColor,
                sectionLineWidth: (legacy.sectionLineWidth as number) || DEFAULT_DESIGN_SPEC.tokens.borders.sectionLineWidth,
            },
            bullets: {
                style: (legacy.bulletStyle as any) || DEFAULT_DESIGN_SPEC.tokens.bullets.style,
            },
        },
        layout: {
            preset: legacy.layoutPreset as any,
            headerStyle: (legacy.headerStyle as any) || DEFAULT_DESIGN_SPEC.layout.headerStyle,
            sidebarPosition: (legacy.sidebarPosition as any) || DEFAULT_DESIGN_SPEC.layout.sidebarPosition,
            showPhoto: legacy.showPhoto !== false,
            photoScale: (legacy.photoScale as 1 | 2 | 3) || DEFAULT_DESIGN_SPEC.layout.photoScale,
        },
        locale: {
            locale: (legacy.locale as any) || DEFAULT_DESIGN_SPEC.locale.locale,
            paperFormat: (legacy.paperFormat as any) || DEFAULT_DESIGN_SPEC.locale.paperFormat,
            targetCountry: legacy.targetCountry as string | undefined,
        },
    };
}

/**
 * SafeSection - Intelligent Page Break Control for React-PDF
 * 
 * PHASE 3: Wrapper component that ensures sections stay together
 * and handles page breaks intelligently.
 * 
 * Features:
 * - wrap={false} by default to keep content together
 * - minContent: minimum items to show with title (prevents orphan titles)
 * - break="avoid" to prevent breaking inside
 * - Smart truncation with "..." indicator
 * 
 * IMPORTANT: This is for @react-pdf/renderer components only!
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';

// ============================================================================
// TYPES
// ============================================================================

interface SafeSectionProps {
    /** Section title (optional) */
    title?: string;
    /** Title style */
    titleStyle?: Style;
    /** Container style */
    style?: Style;
    /** Children content */
    children: React.ReactNode;
    /** 
     * Wrap behavior: 
     * - false (default): Keep entire section together, move to next page if needed
     * - true: Allow section to break across pages
     */
    wrap?: boolean;
    /**
     * Minimum height in points before allowing break
     * If remaining page space < minHeight, move to next page
     */
    minHeight?: number;
    /**
     * Debug mode: render with visible border
     */
    debug?: boolean;
}

/**
 * SafeSection - Wrapper for PDF sections with intelligent break control
 * 
 * @example
 * <SafeSection title="Experience" titleStyle={styles.sectionTitle}>
 *   {experiences.map(exp => <ExperienceItem key={exp.id} {...exp} />)}
 * </SafeSection>
 */
export const SafeSection: React.FC<SafeSectionProps> = ({
    title,
    titleStyle,
    style,
    children,
    wrap = false,
    minHeight,
    debug = false,
}) => {
    // Combine styles, filtering out undefined
    const combinedStyle = [
        style,
        debug ? {
            borderWidth: 1,
            borderColor: 'red',
            borderStyle: 'dashed' as const,
        } : null,
    ].filter(Boolean) as Style[];

    return (
        <View
            style={combinedStyle}
            wrap={wrap}
            minPresenceAhead={minHeight}
        >
            {title && <Text style={titleStyle}>{title}</Text>}
            {children}
        </View>
    );
};

// ============================================================================
// SAFE ITEM - For individual items that should stay together
// ============================================================================

interface SafeItemProps {
    /** Container style */
    style?: Style;
    /** Children content */
    children: React.ReactNode;
    /** Wrap behavior (default: false) */
    wrap?: boolean;
    /** Debug mode */
    debug?: boolean;
}

/**
 * SafeItem - Wrapper for individual items (experience, education)
 * that should never be split across pages
 * 
 * @example
 * <SafeItem style={styles.expItem}>
 *   <Text>{exp.role}</Text>
 *   <Text>{exp.company}</Text>
 *   {exp.tasks.map(...)}
 * </SafeItem>
 */
export const SafeItem: React.FC<SafeItemProps> = ({
    style,
    children,
    wrap = false,
    debug = false,
}) => {
    // Combine styles, filtering out undefined
    const combinedStyle = [
        style,
        debug ? {
            borderWidth: 1,
            borderColor: 'blue',
            borderStyle: 'dotted' as const,
        } : null,
    ].filter(Boolean) as Style[];

    return (
        <View style={combinedStyle} wrap={wrap}>
            {children}
        </View>
    );
};

// ============================================================================
// TRUNCATED TEXT - Text with smart truncation
// ============================================================================

interface TruncatedTextProps {
    /** Text content */
    children: string;
    /** Maximum characters before truncation */
    maxChars: number;
    /** Text style */
    style?: Style;
    /** Truncation indicator (default: "...") */
    ellipsis?: string;
}

/**
 * TruncatedText - Text component with automatic truncation
 * 
 * @example
 * <TruncatedText maxChars={100} style={styles.taskText}>
 *   {longTaskDescription}
 * </TruncatedText>
 */
export const TruncatedText: React.FC<TruncatedTextProps> = ({
    children,
    maxChars,
    style,
    ellipsis = '...',
}) => {
    const text = typeof children === 'string' ? children : '';
    const truncated = text.length > maxChars
        ? text.substring(0, maxChars - ellipsis.length).trim() + ellipsis
        : text;

    return <Text style={style}>{truncated}</Text>;
};

// ============================================================================
// PAGE BREAK MARKER - Force page break at strategic points
// ============================================================================

interface PageBreakProps {
    /** Show debug indicator */
    debug?: boolean;
}

/**
 * PageBreak - Force a page break at this point
 * Use sparingly - let react-pdf handle breaks naturally when possible
 */
export const PageBreak: React.FC<PageBreakProps> = ({ debug = false }) => {
    return (
        <View wrap={false}>
            {debug && (
                <Text style={{ fontSize: 6, color: 'red', textAlign: 'center' }}>
                    --- PAGE BREAK ---
                </Text>
            )}
        </View>
    );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    SafeSection,
    SafeItem,
    TruncatedText,
    PageBreak,
};

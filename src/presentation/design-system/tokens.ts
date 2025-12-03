/**
 * DESIGN SYSTEM TOKENS
 * 
 * Unified design system for consistent glass morphism, gradients, and animations.
 * Single source of truth for all visual design decisions.
 */

/**
 * Glass Morphism Hierarchy
 * 
 * Three elevation levels for consistent depth perception:
 * - Base: Primary containers (sidebars, panels)
 * - Elevated: Interactive cards (modals, cards)
 * - Overlay: Floating elements (tooltips, dropdowns)
 */
export const GlassStyles = {
    base: "bg-white/95 backdrop-blur-xl border border-white/20 shadow-lg",
    elevated: "bg-white/90 backdrop-blur-md border border-white/10 shadow-xl",
    overlay: "bg-white/80 backdrop-blur-sm border border-white/5 shadow-2xl",
} as const;

/**
 * Gradient Palette
 * 
 * Semantic gradient system for consistent color usage:
 * - brand: Primary actions, branding elements
 * - success: Success states, editor mode
 * - info: Informational elements, structure mode
 * - warning: AI features, warnings
 * - accent: Highlights, modele mode, creative elements
 * - neutral: Subtle backgrounds, disabled states
 * - background: Page backgrounds, surface layers
 */
export const Gradients = {
    brand: "from-indigo-600 to-purple-600",
    success: "from-green-500 to-emerald-500",
    info: "from-blue-500 to-cyan-500",
    warning: "from-amber-500 to-orange-500",
    accent: "from-pink-500 to-rose-500",
    neutral: "from-slate-600 to-slate-700",
    background: "from-slate-50 via-slate-100 to-slate-200",
} as const;

/**
 * Spring Animation Configurations
 * 
 * Unified spring physics for smooth, natural motion:
 * - default: Standard interactions (buttons, cards)
 * - smooth: Gentle transitions (panels, modals)
 * - snappy: Quick responses (toggles, switches)
 * - gentle: Subtle movements (tooltips, hints)
 */
export const SpringConfigs = {
    default: { type: 'spring' as const, stiffness: 300, damping: 30 },
    smooth: { type: 'spring' as const, stiffness: 200, damping: 25 },
    snappy: { type: 'spring' as const, stiffness: 400, damping: 35 },
    gentle: { type: 'spring' as const, stiffness: 150, damping: 20 },
} as const;

/**
 * Interaction Animations
 * 
 * Standard motion values for consistent micro-interactions:
 * - hover: Subtle lift and scale on hover
 * - tap: Quick compression on click
 * - focus: Pulse effect for keyboard navigation
 */
export const Interactions = {
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98 },
    focus: { scale: [1, 1.02, 1] },
} as const;

/**
 * Design Tokens Bundle
 * 
 * Complete design system export for easy imports
 */
export const DesignTokens = {
    glass: GlassStyles,
    gradients: Gradients,
    springs: SpringConfigs,
    interactions: Interactions,
} as const;

export default DesignTokens;

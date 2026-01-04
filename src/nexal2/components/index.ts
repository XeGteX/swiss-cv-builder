/**
 * NEXAL2 Components Index
 */

export { NEXAL2PreviewPane } from './NEXAL2PreviewPane';
export { SpotlightOverlay } from './SpotlightOverlay';

// PR4: Spotlight Context for contextual preview highlighting
export { SpotlightProvider, useSpotlight, useSpotlightSafe, useSpotlightTrigger } from '../context/SpotlightContext';
export type { SpotlightZoneId } from '../context/SpotlightContext';

// PR4: Zone mapping for control-to-zone correlation
export { CONTROL_ZONE_MAP, getZoneForControl } from '../spotlight/zoneMapping';

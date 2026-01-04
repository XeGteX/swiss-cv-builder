/**
 * PreviewPane - NEXAL2 Only (PR3: Legacy Removal)
 * 
 * All rendering uses NEXAL2 SceneGraph pipeline.
 * Legacy CVDocumentV2 has been removed.
 */

import React from 'react';
import { NEXAL2PreviewPane } from '@/nexal2';

interface PreviewPaneProps {
    hideToolbar?: boolean;
    scale?: number;
    showErrors?: boolean;
}

/**
 * PreviewPane - Routes directly to NEXAL2PreviewPane
 * PR3: Removed Legacy engine and PreviewPaneLegacy component
 */
export const PreviewPane: React.FC<PreviewPaneProps> = () => {
    return <NEXAL2PreviewPane />;
};

export default PreviewPane;

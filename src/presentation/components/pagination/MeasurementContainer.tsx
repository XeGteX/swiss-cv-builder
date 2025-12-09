/**
 * MeasurementContainer - Invisible DOM Measurement Component
 * 
 * This component renders CV sections in an invisible container
 * for height measurement purposes. Each section must have a
 * data-section-id attribute for measurement.
 * 
 * Used by useDOMMeasuredPagination to get real content heights.
 */

import React, { forwardRef } from 'react';
import type { CVProfile } from '../../../domain/cv/v2/types';

interface MeasurementContainerProps {
    profile: CVProfile;
    sectionOrder: string[];
    children: React.ReactNode;
    visible?: boolean; // For debugging
}

export const MeasurementContainer = forwardRef<HTMLDivElement, MeasurementContainerProps>(
    ({ children, visible = false }, ref) => {
        return (
            <div
                ref={ref}
                className="measurement-container"
                style={{
                    position: visible ? 'relative' : 'absolute',
                    left: visible ? 0 : '-9999px',
                    top: visible ? 0 : '-9999px',
                    width: '210mm', // A4 width
                    visibility: visible ? 'visible' : 'hidden',
                    pointerEvents: 'none',
                    zIndex: -1
                }}
                aria-hidden="true"
            >
                {children}
            </div>
        );
    }
);

MeasurementContainer.displayName = 'MeasurementContainer';

export default MeasurementContainer;

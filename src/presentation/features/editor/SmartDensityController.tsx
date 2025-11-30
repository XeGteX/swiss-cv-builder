
import React from 'react';
import { useSmartDensity } from '../../hooks/useSmartDensity';

/**
 * Controller component that handles smart density adjustments.
 * It renders nothing but isolates the hook logic to prevent re-renders in parent components.
 */
export const SmartDensityController: React.FC = () => {
    useSmartDensity();
    return null;
};

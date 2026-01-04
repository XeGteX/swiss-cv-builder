/**
 * AnalyzerTab - Job Match Analysis
 * 
 * PR2: Simplified - Direct JobAnalyzer without mode switching.
 * The ATS mode placeholder has been removed as AnalyticsTab handles ATS scoring.
 */

import { JobAnalyzer } from './JobAnalyzer';

// ============================================================================
// MAIN EXPORT - Direct JobAnalyzer usage
// ============================================================================

export function AnalyzerTab() {
    return (
        <div className="space-y-4">
            <JobAnalyzer />
        </div>
    );
}

export default AnalyzerTab;

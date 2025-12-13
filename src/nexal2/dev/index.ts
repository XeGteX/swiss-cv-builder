/**
 * NEXAL2 - Dev Module Index
 * 
 * Development and testing utilities for NEXAL2.
 */

export {
    validateLayout,
    formatValidationResult,
    type LayoutIssue,
    type ValidationResult
} from './LayoutValidator';

export {
    runValidationMatrix,
    runAndLogMatrix,
    generateMatrixCases,
    computeEnhancedSignature,
    formatMatrixSummary,
    type MatrixCase,
    type MatrixResult,
    type MatrixSummary
} from './MatrixRunner';

export {
    runLongProfileTests,
    runAndLogLongProfileTests,
    LONG_MOCK_PROFILE,
    type LongProfileTestResult,
} from './LongProfileRunner';

// Phase 4.8: Pagination Matrix Runner
export {
    runPaginationMatrix,
    runAndLogPaginationMatrix,
    MEDIUM_MOCK_PROFILE,
    EDGECASE_MOCK_PROFILE,
    type PaginationMatrixResult,
    type PaginationMatrixSummary,
} from './PaginationMatrixRunner';

// Phase 5.0: Golden Profiles for CI testing
export {
    GOLDEN_PROFILES,
    type GoldenProfile,
} from './GoldenProfiles';

// Phase 5.0: Pagination CI Gate
export {
    runPaginationCIGate,
    generateSnapshotData,
    type SnapshotFile,
    type SnapshotCase,
    type TestResult,
    type TestSummary,
    REGIONS as CI_REGIONS,
    PRESETS as CI_PRESETS,
} from './PaginationCIGate';

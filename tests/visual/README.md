# Visual Regression Testing

Captures golden screenshots of NEXAL2 PDF output and compares against baselines.

## Quick Start

```bash
# Run visual tests (compare against baselines)
npm run test:visual

# Update baselines (regenerate golden images)
npm run test:visual:update
```

## How It Works

1. **Generate PDFs**: Uses NEXAL2 engine to create PDFs for each preset/fixture
2. **Rasterize**: Converts PDF pages to PNG screenshots
3. **Compare**: Uses pixelmatch to detect pixel differences
4. **Report**: Generates HTML report with thumbnails

## Directory Structure

```
tests/
├── __golden__/           # Baseline images (git-tracked)
│   └── pdf/
│       └── ATS_ONE_COLUMN/
│           └── junior/
│               └── page-01.png
├── __diff__/             # Current + diff output (gitignored)
│   ├── pdf/...
│   └── report.html       # Visual diff report
└── visual/               # Test scripts
    ├── config.ts         # Presets, viewports, thresholds
    ├── fixtures.ts       # Test profile data
    ├── render-pdf.ts     # PDF generation
    ├── diff.ts           # Pixel comparison
    ├── report.ts         # HTML report
    └── run-visual.ts     # CLI orchestrator
```

## Viewing the Report

After running tests, open the HTML report directly in your browser:

```bash
# Windows
start tests/__diff__/report.html

# macOS
open tests/__diff__/report.html

# Linux
xdg-open tests/__diff__/report.html
```

## Configuration

Edit `tests/visual/config.ts` to customize:

- **PRESETS_TO_TEST**: Which layout presets to test
- **DIFF_CONFIG.threshold**: Pixel sensitivity (0-1)
- **DIFF_CONFIG.maxDiffPercent**: Maximum allowed difference

## CI Integration

Add to your CI pipeline:

```yaml
- name: Visual Regression Tests
  run: npm run test:visual
```

Tests will exit with code 1 if any diffs exceed the threshold.

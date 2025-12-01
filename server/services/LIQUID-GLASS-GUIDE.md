# Liquid Glass Protocol - Usage Guide

## Quick Start

```typescript
import { PuppeteerPDFService } from './services/puppeteer-pdf.service';

// Generate PDF with default settings
const result = await PuppeteerPDFService.generatePDF({
    profileId: 'user-123'
});

// With custom template
const result = await PuppeteerPDFService.generatePDF({
    profileId: 'user-123',
    templateId: 'modern'  // or 'ats', 'creative', etc.
});

// Ultra quality
const result = await PuppeteerPDFService.generatePDF({
    profileId: 'user-123',
    quality: 'ultra'  // 300 DPI equivalent
});
```

## Result Object

```typescript
{
    buffer: Buffer,              // PDF binary data
    size: 1234567,              // Size in bytes
    generationTime: 2345,       // Time in ms
    metadata: {
        profileId: 'user-123',
        templateId: 'modern',
        timestamp: Date,
        resolution: { width: 794, height: 1123, scale: 2 }
    }
}
```

## Quality Modes

| Mode | DPI | Scale | Use Case |
|------|-----|-------|----------|
| standard | 144 | 1.5x | Fast generation |
| high | 192 | 2x | **Recommended** |
| ultra | 300 | 3x | Print quality |

## Chrome Flags Explained

### Core Glassmorphism
- `--enable-features=BackdropFilter` - **CRITICAL** for `backdrop-filter: blur()`
- `--enable-gpu-rasterization` - Hardware-accelerated rendering
- `--enable-oop-rasterization` - Modern compositing pipeline

### Typography Perfection
- `--font-render-hinting=none` - Vector-perfect font rendering
- `--disable-font-subpixel-positioning` - Pixel-accurate text

### Lucide Icon Support
- Icons are SVGs that load asynchronously
- Custom `waitForLucideIcons()` ensures all paths are rendered
- Checks for `<path>`, `<circle>`, etc. inside `<svg>`

## Template Registry

The service supports dynamic templates via query parameter:

```
/pdf-render/:profileId?template=modern
/pdf-render/:profileId?template=ats
/pdf-render/:profileId?template=creative
```

Frontend must handle this parameter and render the correct template.

## Error Handling

All errors include enhanced diagnostics:

```typescript
try {
    const result = await PuppeteerPDFService.generatePDF(options);
} catch (error) {
    // Error includes:
    // - Current URL (where it failed)
    // - Stack trace
    // - Detailed error message
    console.error(error);
}
```

## Zombie Process Protection

The service **guarantees** browser cleanup:

```typescript
finally {
    page?.close()      // Always close page
    browser?.close()   // Always close browser
}
```

No orphan Chrome processes survive, even on error.

## Console Output

```
[LIQUID-GLASS] 🎨 INIT: Generating PDF for profile user-123 with template "modern"
[LIQUID-GLASS] 🌐 BROWSER: Browser launched with Liquid Glass protocol
[LIQUID-GLASS] 📐 VIEWPORT: Set to 794x1123 @ 2x scale
[LIQUID-GLASS] 🔗 URL: Navigating to http://localhost:5173/pdf-render/user-123?template=modern
[LIQUID-GLASS] ⏳ LOADING: Initial page load complete
[LIQUID-GLASS] ✅ DOM: CV template container found
[LIQUID-GLASS] ✅ FONTS: All fonts loaded and ready
[LIQUID-GLASS] ✅ ICONS: Lucide icons rendered
[LIQUID-GLASS] 🎨 RENDER: All assets synchronized. Ready for capture.
[LIQUID-GLASS] ✨ SUCCESS: PDF generated in 2345ms (1234567 bytes)
[LIQUID-GLASS] 🔒 CLEANUP: Browser closed - no zombie processes
```

## Integration Example

```typescript
// In your PDF route
import { PuppeteerPDFService } from '../services/puppeteer-pdf.service';

router.post('/generate-pdf', async (req, res) => {
    try {
        const { profileId, templateId, quality } = req.body;

        const result = await PuppeteerPDFService.generatePDF({
            profileId,
            templateId: templateId || 'modern',
            quality: quality || 'high',
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="cv-${profileId}.pdf"`);
        res.send(result.buffer);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

**🎨 THE MIRROR IS PERFECT. THE GLASS IS LIQUID.**

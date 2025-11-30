
# PDF Engine Architecture 📄

This document explains the "Pixel-Perfect" PDF generation pipeline used in Swiss CV Builder.

## 1. The Core Problem
Generating PDFs from HTML/CSS is notoriously difficult because:
- **Browser Inconsistencies**: Different browsers render text slightly differently.
- **Layout Shifts**: Libraries like `html2canvas` often miscalculate text baselines, causing "falling text".
- **Image Distortion**: `object-fit: cover` is often ignored or rendered incorrectly.

## 2. The Solution: `html-to-image` + Hidden Iframe
We use a robust two-step process:

### Step 1: Isolation (The Sandbox)
We create a hidden `iframe` that is exactly **A4 size (794px x 1123px)**.
- **Why?** To ensure the layout is calculated in a known, fixed viewport, independent of the user's screen size.
- **Styles**: We inject a specific stylesheet into the iframe to normalize font sizes (`16px` base) and force `text-rendering: geometricPrecision`.

### Step 2: Rasterization (`html-to-image`)
Instead of `html2canvas` (which attempts to "paint" the DOM onto a canvas manually), we use `html-to-image`.
- **Mechanism**: It uses SVG `<foreignObject>` to embed the HTML directly into an SVG, then draws that SVG onto a canvas.
- **Benefit**: This delegates the rendering back to the browser's native engine, resulting in 1:1 fidelity.

## 3. Configuration
The critical settings in `src/infrastructure/pdf/pdf-service.ts` are:

```typescript
const dataUrl = await toPng(element, {
    quality: 1.0,      // Max quality
    pixelRatio: 3,     // 3x scale (approx 300 DPI) for crisp printing
    backgroundColor: '#ffffff',
});
```

## 4. Image Handling
- **Issue**: Large images can crash the generation or cause timeouts.
- **Fix**: We enforce a client-side limit of **2MB** and **2048x2048px** dimensions (implemented in `ImageUpload` component).
- **Optimization**: Images are converted to Base64 before rendering to avoid CORS issues.

## 5. Troubleshooting
- **Text is blurry**: Check `pixelRatio`. It should be at least 2, preferably 3.
- **Images are missing**: Ensure they are served with correct CORS headers or converted to Base64.
- **Layout is broken**: Check if the component relies on `vh`/`vw` units. The iframe fixes the width/height, so percentages `%` are safer.

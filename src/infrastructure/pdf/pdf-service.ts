import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

export class PDFService {
    static async generate(element: HTMLElement, filename: string): Promise<void> {
        if (!element) {
            throw new Error('Element not found for PDF generation');
        }

        // 1. Create Hidden Iframe Sandbox
        // We keep the sandbox to ensure we capture a clean state without UI overlays
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '-10000px';
        iframe.style.width = '794px'; // A4 width at 96 DPI
        iframe.style.height = '1123px'; // A4 height at 96 DPI
        iframe.style.border = 'none';
        iframe.style.zIndex = '-1000';

        document.body.appendChild(iframe);

        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) {
                throw new Error('Could not access iframe document');
            }

            // 2. Prepare Content
            const content = element.outerHTML;

            // 3. Write to Iframe
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <base href="${window.location.origin}/" />
                    <title>PDF Generation Sandbox</title>
                    <!-- Inject all current styles -->
                    ${Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                    .map(node => node.outerHTML)
                    .join('\n')}
                    <style>
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 794px !important;
                            height: 1123px !important;
                            background: white;
                            overflow: hidden;
                            -webkit-font-smoothing: antialiased;
                        }
                        #cv-container {
                            width: 100% !important;
                            height: 100% !important;
                        }
                    </style>
                </head>
                <body>
                    <div id="cv-container">
                        ${content}
                    </div>
                </body>
                </html>
            `);
            doc.close();

            // 4. Wait for Resources
            await new Promise<void>(resolve => {
                const check = () => {
                    const container = doc.getElementById('cv-container');
                    const images = container?.getElementsByTagName('img');
                    if (!images) return resolve();

                    const allLoaded = Array.from(images).every(img => img.complete);
                    if (allLoaded) resolve();
                    else setTimeout(check, 100);
                };
                check();
            });

            // Wait for fonts
            if (doc.fonts) {
                await doc.fonts.ready.catch(e => console.warn('Font loading warning:', e));
            }

            // Safety delay for layout
            await new Promise(resolve => setTimeout(resolve, 1000));

            const container = doc.getElementById('cv-container');
            if (!container) throw new Error('Container not found');

            // 5. Generate Image with html-to-image
            // This library uses SVG foreignObject which renders text EXACTLY as the browser does.
            // No more "falling text" or layout shifts.
            const dataUrl = await toPng(container, {
                quality: 1.0,
                pixelRatio: 3, // 3x scale for high DPI (approx 300 DPI)
                backgroundColor: '#ffffff',
                cacheBust: true,
            });

            // 6. Generate PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = 210;
            const pdfHeight = 297;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(filename);

        } catch (error) {
            console.error('PDF Generation failed', error);
            throw new Error('Failed to generate PDF.');
        } finally {
            document.body.removeChild(iframe);
        }
    }
}

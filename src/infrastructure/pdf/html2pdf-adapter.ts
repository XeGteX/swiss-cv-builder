
export interface PDFGenerator {
    generate(element: HTMLElement, filename: string): Promise<void>;
}

export class Html2PdfAdapter implements PDFGenerator {
    async generate(element: HTMLElement, filename: string): Promise<void> {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.html2pdf) {
            const opt = {
                margin: 0,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollY: 0,
                    windowWidth: 794, // A4 width in px at 96 DPI (approx)
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            };

            // @ts-ignore
            await window.html2pdf().set(opt).from(element).save();
        } else {
            console.error('html2pdf not loaded');
            throw new Error('PDF library not ready');
        }
    }
}

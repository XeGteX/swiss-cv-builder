
import { toPng } from 'html-to-image';

export class PageRenderer {
    static async renderToImage(element: HTMLElement, scale: number = 2): Promise<string> {
        // 2x scale is usually good trade-off for speed/quality. 
        // For "Visual" variant we might want 3x (300 DPI).

        return toPng(element, {
            quality: 0.95,
            pixelRatio: scale,
            backgroundColor: '#ffffff',
            cacheBust: true,
            // Force dimensions to avoid scrollbar issues
            width: element.offsetWidth,
            height: element.offsetHeight
        });
    }
}

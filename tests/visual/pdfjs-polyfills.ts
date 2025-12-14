/**
 * PDF.js Polyfills for Node.js/Vitest environment
 * 
 * This file MUST be imported BEFORE pdf.js to set up required DOM polyfills.
 */

import { DOMMatrix as CanvasDOMMatrix } from 'canvas';

// Polyfill DOMMatrix
if (typeof globalThis.DOMMatrix === 'undefined') {
    (globalThis as any).DOMMatrix = CanvasDOMMatrix;
}

// Polyfill Path2D with stub implementation
if (typeof globalThis.Path2D === 'undefined') {
    (globalThis as any).Path2D = class Path2D {
        constructor(_path?: string | Path2D) { }
        addPath(_path: Path2D, _transform?: DOMMatrix2DInit) { }
        closePath() { }
        moveTo(_x: number, _y: number) { }
        lineTo(_x: number, _y: number) { }
        bezierCurveTo(_cp1x: number, _cp1y: number, _cp2x: number, _cp2y: number, _x: number, _y: number) { }
        quadraticCurveTo(_cpx: number, _cpy: number, _x: number, _y: number) { }
        arc(_x: number, _y: number, _radius: number, _startAngle: number, _endAngle: number, _anticlockwise?: boolean) { }
        arcTo(_x1: number, _y1: number, _x2: number, _y2: number, _radius: number) { }
        rect(_x: number, _y: number, _w: number, _h: number) { }
        ellipse(_x: number, _y: number, _radiusX: number, _radiusY: number, _rotation: number, _startAngle: number, _endAngle: number, _anticlockwise?: boolean) { }
    };
}

// Polyfill ImageData
if (typeof globalThis.ImageData === 'undefined') {
    (globalThis as any).ImageData = class ImageData {
        width: number;
        height: number;
        data: Uint8ClampedArray;

        constructor(widthOrData: number | Uint8ClampedArray, heightOrWidth: number, height?: number) {
            if (typeof widthOrData === 'number') {
                this.width = widthOrData;
                this.height = heightOrWidth;
                this.data = new Uint8ClampedArray(widthOrData * heightOrWidth * 4);
            } else {
                this.data = widthOrData;
                this.width = heightOrWidth;
                this.height = height!;
            }
        }
    };
}

console.log('[pdf.js polyfills] DOMMatrix, Path2D, ImageData initialized');

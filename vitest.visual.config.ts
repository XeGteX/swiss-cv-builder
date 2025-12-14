/**
 * Vitest config for Visual Regression Tests
 * 
 * Runs in Node.js environment (not jsdom) with pdf.js polyfills.
 */

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'node',  // Use Node, not jsdom
        setupFiles: ['./tests/visual/pdfjs-polyfills.ts'],
        include: ['tests/visual-regression.test.ts'],
        testTimeout: 60000,
    },
});

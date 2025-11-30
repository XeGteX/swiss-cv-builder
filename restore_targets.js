const fs = require('fs');
const path = require('path');
const readline = require('readline');

const xmlPath = 'repomix-output.xml';
const targetFiles = [
    'src/presentation/layouts/mobile/MobileLayout.tsx',
    'src/presentation/features/preview/PreviewPane.tsx'
];

if (!fs.existsSync(xmlPath)) {
    console.error('Error: repomix-output.xml not found!');
    process.exit(1);
}

const fileStream = fs.createReadStream(xmlPath);
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

let currentFilePath = null;
let currentContent = [];
let insideTargetFile = false;

console.log('Starting targeted restoration...');

rl.on('line', (line) => {
    // Check for start tag
    const startMatch = line.match(/<file path="([^"]+)">/);
    if (startMatch) {
        const filePath = startMatch[1];
        if (targetFiles.includes(filePath)) {
            currentFilePath = filePath;
            insideTargetFile = true;
            currentContent = [];
            console.log(`Found target file: ${filePath}`);

            // Handle content on same line
            const contentAfter = line.substring(startMatch.index + startMatch[0].length);
            if (contentAfter) {
                currentContent.push(contentAfter);
            }
        }
        return;
    }

    // Check for end tag
    if (insideTargetFile) {
        const endMatch = line.match(/<\/file>/);
        if (endMatch) {
            // Content before tag
            const contentBefore = line.substring(0, endMatch.index);
            if (contentBefore) {
                currentContent.push(contentBefore);
            }

            // Write file
            const absolutePath = path.resolve(process.cwd(), currentFilePath);
            const dir = path.dirname(absolutePath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            let fileContent = currentContent.join('\n');

            // Unescape XML
            fileContent = fileContent
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'");

            fs.writeFileSync(absolutePath, fileContent, 'utf8');
            console.log(`✅ Restored: ${currentFilePath}`);

            insideTargetFile = false;
            currentFilePath = null;
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    }
});

rl.on('close', () => {
    console.log('Targeted restoration complete.');
});

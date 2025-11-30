const fs = require('fs');
const path = require('path');
const readline = require('readline');

const xmlPath = 'repomix-output.xml';

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
let insideFile = false;
let count = 0;

console.log('Starting stream-based restoration...');

rl.on('line', (line) => {
    // Check for start tag
    const startMatch = line.match(/<file path="([^"]+)">/);
    if (startMatch) {
        currentFilePath = startMatch[1];
        insideFile = true;
        currentContent = [];
        // If there is content on the same line after the tag, add it
        // But usually repomix puts content on next line. 
        // If the line is just the tag, we're good.
        // If line has content: <file path="...">content...
        const contentAfter = line.substring(startMatch.index + startMatch[0].length);
        if (contentAfter) {
            currentContent.push(contentAfter);
        }
        return;
    }

    // Check for end tag
    if (insideFile) {
        const endMatch = line.match(/<\/file>/);
        if (endMatch) {
            // Content before the tag on this line
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

            // Unescape XML entities
            fileContent = fileContent
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'");

            fs.writeFileSync(absolutePath, fileContent, 'utf8');
            console.log(`Restored: ${currentFilePath}`);
            count++;

            insideFile = false;
            currentFilePath = null;
            currentContent = [];
        } else {
            // Just content line
            currentContent.push(line);
        }
    }
});

rl.on('close', () => {
    console.log(`\nRestoration complete! Restored ${count} files.`);
});

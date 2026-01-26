const fs = require('fs');
const path = require('path');

const allowed = new Set([
    '#1F4EF5', '#4880EE', '#83B4F9',
    '#64768C', '#B1B8C0', '#D6DADF',
    '#1A1E27', '#505866',
    '#FFFFFF', '#000000',
    '#FFF', '#000'
].map(c => c.toLowerCase()));

const hexRegex = /#([0-9a-fA-F]{3,6})\b/g;

const filesToScan = [];

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            filesToScan.push(fullPath);
        }
    });
}

walk('c:/Users/justc/mor/src');

console.log(`Scanning ${filesToScan.length} files...`);

const violations = [];

filesToScan.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = hexRegex.exec(content)) !== null) {
        const hex = match[0].toLowerCase();
        if (!allowed.has(hex)) {
            violations.push({ file, hex, line: content.substring(0, match.index).split('\n').length });
        }
    }
});

if (violations.length === 0) {
    console.log('No palette violations found!');
} else {
    console.log(`Found ${violations.length} violations:`);
    violations.forEach(v => {
        console.log(`${v.file}:${v.line} -> ${v.hex}`);
    });
}

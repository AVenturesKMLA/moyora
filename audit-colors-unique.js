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

const uniqueNonPalette = new Map();

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let match;
            while ((match = hexRegex.exec(content)) !== null) {
                const hex = match[0].toLowerCase();
                if (!allowed.has(hex)) {
                    if (!uniqueNonPalette.has(hex)) {
                        uniqueNonPalette.set(hex, []);
                    }
                    uniqueNonPalette.get(hex).push(fullPath);
                }
            }
        }
    });
}

walk('c:/Users/justc/mor/src');

console.log('Unique Non-Palette Colors found:');
for (let [hex, files] of uniqueNonPalette.entries()) {
    console.log(`${hex} (found in ${files.length} places, e.g., ${files[0]})`);
}

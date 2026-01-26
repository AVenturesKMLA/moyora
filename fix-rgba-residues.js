const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /rgba\(0, 122, 255,/g, to: 'rgba(31, 78, 245,' },
    { from: /rgba\(52, 199, 89,/g, to: 'rgba(72, 128, 238,' },
    { from: /rgba\(255, 59, 48,/g, to: 'rgba(31, 78, 245,' }, // Map red to brand blue for now
    { from: /#ccc\b/gi, to: '#B1B8C0' },
    { from: /#999\b/gi, to: '#64768C' },
    { from: /#111\b/gi, to: '#1A1E27' },
    { from: /#000\b/gi, to: '#000000' }
];

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            replacements.forEach(r => {
                if (r.from.test(content)) {
                    content = content.replace(r.from, r.to);
                    changed = true;
                }
            });
            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated Final: ${fullPath}`);
            }
        }
    });
}

walk('c:/Users/justc/mor/src');

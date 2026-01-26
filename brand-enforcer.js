const fs = require('fs');
const path = require('path');

const brand = {
    bluePrimary: '#1F4EF5',
    blueSecondary: '#4880EE',
    blueLight: '#83B4F9',
    grayDark: '#64768C',
    grayMedium: '#B1B8C0',
    grayLight: '#D6DADF',
    textPrimary: '#1A1E27',
    textSecondary: '#505866'
};

const mappings = {
    // Blues
    '#007aff': brand.bluePrimary,
    '#0062cc': brand.blueSecondary,
    '#a0d8ef': brand.blueLight,
    '#c0dcff': brand.blueLight,
    '#c0d6ff': brand.blueLight,

    // Grays/Backgrounds
    '#f2f2f7': brand.grayLight,
    '#f9fafb': brand.grayLight,
    '#e5e5ea': brand.grayLight,
    '#d1d1d6': brand.grayLight,
    '#aeaeb2': brand.grayMedium,
    '#c7c7cc': brand.grayMedium,
    '#8e8e93': brand.grayMedium,
    '#636366': brand.grayDark,
    '#48484a': brand.grayDark,
    '#3a3a3c': brand.grayDark,

    // Dark/Text
    '#1c1c1e': brand.textPrimary,
    '#111111': brand.textPrimary,
    '#050505': brand.textPrimary,
    '#1d1d1f': brand.textPrimary,
    '#4a4a4a': brand.textSecondary,
    '#888888': brand.textSecondary,
    '#666666': brand.textSecondary,
    '#aaaaaa': brand.grayMedium,
    '#888': brand.textSecondary,
    '#333': brand.textPrimary,
    '#666': brand.textSecondary,

    // Apple/Old system colors found in Signup
    '#34c759': brand.blueSecondary,
    '#ff3b30': brand.bluePrimary,
    '#af52de': brand.grayDark,
    '#5856d6': brand.grayDark,
};

const hexRegex = /#([0-9a-fA-F]{3,6})\b/g;

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
            content = content.replace(hexRegex, (match) => {
                const hex = match.toLowerCase();
                if (mappings[hex]) {
                    changed = true;
                    return mappings[hex];
                }
                return match;
            });
            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log(`Brand Enforced: ${fullPath}`);
            }
        }
    });
}

walk('c:/Users/justc/mor/src');

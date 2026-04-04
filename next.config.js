const fs = require('fs');
const path = require('path');

/** Load optional `config/dev-admin.env` (gitignored) so both keys live in one file. */
function loadDevAdminEnvFile() {
    const envPath = path.join(__dirname, 'config', 'dev-admin.env');
    if (!fs.existsSync(envPath)) return;
    const text = fs.readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
        const s = line.trim();
        if (!s || s.startsWith('#')) continue;
        const eq = s.indexOf('=');
        if (eq < 0) continue;
        const key = s.slice(0, eq).trim();
        let val = s.slice(eq + 1).trim();
        if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
        ) {
            val = val.slice(1, -1);
        }
        if (key && process.env[key] === undefined) {
            process.env[key] = val;
        }
    }
}

loadDevAdminEnvFile();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
};

module.exports = nextConfig;

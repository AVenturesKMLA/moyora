/** `.env` values are strings; tolerate spaces / Windows line endings. */
export function isDevAdminNoDbEnabled(): boolean {
    if (process.env.NODE_ENV !== 'development') {
        return false;
    }
    const raw = process.env.DEV_ADMIN_NO_DB;
    if (raw === undefined || raw === '') {
        return true;
    }
    const v = raw.trim().toLowerCase();
    if (v === 'false' || v === '0' || v === 'no' || v === 'off') {
        return false;
    }
    return true;
}

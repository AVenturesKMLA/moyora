// Minimal shim for `lucide-react`.
// Keeping this as `.ts` (not just `.d.ts`) to ensure it's picked up by TS
// include globs in this repo.
declare module "lucide-react" {
    export const Users: any;
    export const Check: any;
    export const X: any;
    export const AlertCircle: any;
}

export {};


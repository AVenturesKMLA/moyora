// Minimal shim for `lucide-react`.
// This silences "Cannot find module 'lucide-react'..." in environments where
// node_modules/@types/lucide-react are not available to TypeScript.
declare module "lucide-react" {
    export const Users: any;
    export const Check: any;
    export const X: any;
    export const AlertCircle: any;
}


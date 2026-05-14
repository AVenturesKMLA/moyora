// Minimal shim for `next-auth/react`.
// Provides just enough typing to avoid "Cannot find module 'next-auth/react'..."
// in environments where `node_modules` / types are unavailable.
declare module "next-auth/react" {
    export function useSession(): { data: any; status: any };
}

export {};


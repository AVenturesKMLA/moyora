// Minimal shim for `next-auth/react`.
// Kept as `.d.ts` so TypeScript always treats it as a declaration.
declare module "next-auth/react" {
    export function useSession(): { data: any; status: any };
}


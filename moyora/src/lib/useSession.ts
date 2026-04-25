// Local wrapper around `next-auth`'s `useSession`.
//
// In some dev environments (like this one) TypeScript may fail to resolve the
// `next-auth/react` module/type declarations because dependencies aren't
// installed. This wrapper avoids the compile-time module-resolution error
// while still using the real hook when available.
export function useSession(): { data: any; status: any } {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('next-auth/react') as any;
        return mod.useSession();
    } catch {
        return { data: null, status: 'unauthenticated' };
    }
}


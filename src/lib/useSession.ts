import { useSession as useNextAuthSession } from 'next-auth/react';

export function useSession() {
    return useNextAuthSession();
}

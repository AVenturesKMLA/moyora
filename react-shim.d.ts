// Repo-root `react` typing shim.
//
// This is intentionally kept small and ambient so it can unblock IDE/linter
// errors in environments where the real React type declarations are missing.

declare module "react" {
    export type ReactNode = any;

    export type SetStateAction<S> = S | ((prev: S) => S);
    export type Dispatch<A> = (value: A) => void;

    export function useState<S = any>(
        initialState: S | (() => S)
    ): [S, Dispatch<SetStateAction<S>>];

    export function useEffect(effect: () => any, deps?: any[]): void;
    export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;

    /** Value refs: `current` matches the initial value type (not forced nullable). */
    export function useRef<T>(initialValue: T): { current: T };
    /** Refs to instances / DOM nodes: `null` until attached. */
    export function useRef<T>(initialValue: T | null): { current: T | null };

    export function useMemo<T>(factory: () => T, deps: readonly any[]): T;

    export function createContext<T>(defaultValue: T): any;

    export function useContext<T>(context: any): T;
    export const Suspense: any;

    const React: {
        useState: typeof useState;
        useEffect: typeof useEffect;
        useCallback: typeof useCallback;
        useRef: typeof useRef;
        useMemo: typeof useMemo;
        createContext: typeof createContext;
        useContext: typeof useContext;
        Suspense: typeof Suspense;
    };

    export default React;
}

declare module "react/jsx-runtime" {
    export const Fragment: any;
    export function jsx(type: any, props: any, key?: any): any;
    export function jsxs(type: any, props: any, key?: any): any;
}

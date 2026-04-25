// Minimal JSX typings shim.
//
// This project should normally get these types from `@types/react`, but in some
// environments TypeScript can fail to load them, causing errors like:
// "JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists."
declare namespace JSX {
    // Allow any intrinsic element tag (e.g. div, span, etc.) with `any` props.
    // This unblocks compilation when React's JSX types are unavailable.
    interface IntrinsicElements {
        [elemName: string]: any;
    }

    // `JSX.Element` is used in this file via an explicit cast.
    type Element = any;
}


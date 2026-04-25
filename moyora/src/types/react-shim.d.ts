// React 18 type shims for compatibility
import * as React from 'react';

declare module 'react' {
    export const forwardRef: typeof React.forwardRef;
    export const ElementRef: typeof React.ElementRef;
    export const ComponentPropsWithoutRef: typeof React.ComponentPropsWithoutRef;
}
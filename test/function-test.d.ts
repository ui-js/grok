/**
 * Global function
 */

declare function mainEntryPoint(one: FooInterface): boolean;

/**
 * Function with plain object arguments
 */

declare function foo(options: {
    withHighlighting: boolean;
    anotherOption: string;
}): boolean;

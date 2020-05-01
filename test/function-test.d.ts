/**
 * Global function
 */

declare function mainEntryPoint(one: string): boolean;

/**
 * Function with plain object arguments
 *
 * @param options.anotherOption Comment on second field of first argument
 * @param other Comment on rest argument
 */

declare function foo(
    options?: {
        withHighlighting: boolean;
        anotherOption: string;
    },
    ...other
): boolean;

//
// Inheritance and implementation
//

type Foo = string;

/**
 * Comments for class
 * @beta
 * @deprecated Stop using it.
 */
declare class C {
    f();
}

/**
 * Comments for interface
 * @alpha Not ready for primetime
 * @deprecated
 */

declare interface I {
    f();
}

declare class C1 extends C {
    f();
}

declare class C2 extends C {
    f();
}

declare class C21 extends C2 {
    f();
}

declare class D implements I {
    f();
}

export namespace B1.B2.B3 {
    /**
     * Shortest name:  {@link B1.B2.B3.functionB4}
     * Full name:      {@link (B1:namespace).(B2:namespace).(B3:namespace).(functionB4:function)}
     */
    export function functionB4();
}

/**
 * Shortest name:  {@link (functionD1:WITH_NUMBERS)}
 * Full name:      {@link (functionD1:WITH_NUMBERS)}
 *
 * {@label WITH_NUMBERS}
 */
// export function functionD1(y: number): number;
// Not currently supported. Not emitted by tsdoc

/**
 * Shortest name:  {@link (functionD1:WITH_LETTERS)}
 * Full name:      {@link (functionD1:WITH_LETTERS)}
 *
 * {@label WITH_LETTERS}
 */
// export function functionD1(y: number): number;
// Not currently supported. Not emitted by tsdoc
// export function functionD1(x: string): string;

/**
 * Shortest name:  {@link (MergedE1:class)}
 * Full name:      {@link (MergedE1:class)}
 */
export class MergedE1 {
    /**
     * Shortest name:  {@link (MergedE1:constructor)}
     * Full name:      {@link (MergedE1:constructor)}
     *
     * NOTE: MergedE1 is also a namespace, so it seems like we need a syntax like
     * `(MergedE1:class,constructor)` or `(MergedE1:class:constructor)`.
     * But only one selector is necessary because namespaces conveniently cannot
     * have constructors.
     */
    public constructor();

    /**
     * Shortest name:  {@link (MergedE1:class).memberE2}
     * Full name:      {@link (MergedE1:class).(memberE2:instance)}
     *
     * NOTES:
     *
     * - The "instance" selector is optional because "(MergedE1:class)" already
     *   eliminates any ambiguity.
     *
     * - Although "MergedE1.(memberE2:instance)" is theoretically also an unambiguous notation,
     *   the TSDoc standard discourages that, because resolving it might require
     *   unbounded backtracking.
     */
    public memberE2(): void;
}

/**
 * Shortest name:  {@link (MergedF1:namespace)}
 * Full name:      {@link (MergedF1:namespace)}
 */
export namespace MergedF1 {}

/**
 * Shortest name:  {@link (MergedE1:namespace)}
 * Full name:      {@link (MergedE1:namespace)}
 */
export namespace MergedE1 {
    /**
     * Shortest name:  {@link (MergedE1:namespace).memberE2}
     * Full name:      {@link (MergedE1:namespace).(memberE2:function)}
     */
    export function memberE2(): void;
}

export interface MergedG1 {
    /**
     * Shortest name:  {@link (MergedG1:interface).mergedG2}
     * Full name:      {@link (MergedG1:interface).mergedG2}
     *
     * NOTE: The full name doesn't have an additional selector, because interface
     * members are unambiguous (except for operators and function overloads, which
     * use labels).
     */
    mergedG2: string;
}

// tsdoc currently does not preserve readonly and protected keywords
// See https://github.com/microsoft/tsdoc/issues/229
// See https://github.com/microsoft/tsdoc/issues/230
declare abstract class Abstract {
    constructor(arg: string);
    protected protectedFunction();
    private privateFunction();

    regularFunction();

    readonly readonlyProperty: string;
    protected readonly protectedReadonlyProp: string;
}

/**
 * This is a variable that has the same name as a type
 */
export const Foo = 'Foo';

/**
 * Entries can also have a "flag". Unlike the tags above, flags are simply
 * on or off and have no accompanying text.
 *
 * The flag @private is redundant with a 'private' annotation.
 * The flag @protected is redundant with a 'protected' annotation.
 * The flag @static is redundant with a 'static' annotation.
 *
 * @public
 * @external
 */
declare class FooClass {
    /**
     * Should not be displayed
     * @private
     */

    notPublic(); // Should not be displayed

    private privateToo(); // Should not be displayed

    method1();
    /**
     *
     * @category Topic One
     */

    method2(): boolean;

    method3(param: string): boolean;

    /**
     * Methods can have multiple signatures
     * @param param1 info on the first param of this signature
     */

    method4(param1: string): void;
    /**
     * Second signature for Method4
     * @param param1 this is the first param of the function
     * @param param2 this is the second param of the function
     * @beta
     * @category Topic One
     */

    method4(param1: boolean, param2: Foo | 'bar'): string;

    method5(): any;

    /**
     * Static method
     */
    static staticMethod();
}

declare interface FooInterface {
    interfaceMethod(param1: Foo | 'bar'): number;
    /** @command perform */
    methodAsProperty: (
        arg: string,
        target: string,
        another?: boolean
    ) => boolean;
}

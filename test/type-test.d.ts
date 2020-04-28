/**
 * This is a comment.
 * @method foo()
 * @module Module
 * @function function()
 * @private
 * @example
 * let x = 1;
 * const y: Foo = 0;
 * @category Category One
 */

type Foo = string & boolean;

/**
 *
 * Use a table to document the value of a union, intersection or
 * enum.
 *
 * | | |
 * |------:|:------|
 * |`one`| The value foo is useful to represent fooness |
 * |`two`| The value bar is useful to represent barness |
 * |`three`| The value bar is useful to represent barness.
 * If necessary, use more lines.
 * You can even use some code samples
 * ```
 * const x = Foo.enum;
 * ``` |
 *
 */

type UnionType = 'one' | 'two' | 'three';

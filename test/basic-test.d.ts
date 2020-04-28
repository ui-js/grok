/**
 * The first comment block with a `packageDocumentation` tag is used
 * as the introductory section for the entire file.
 *
 * Just like anywhere a comment is allowed, it can include
 * [Markdown](https://marked.js.org/) **markup** and code:
 *
 * ```javascript
 * const x = y > 0 ? "yes" : "no"
 * ```
 *
 * There are a few additions to standard Markdown markup, detailed below.
 *
 * ## Links
 *
 * - reference to other elements like {@link Foo} for example.
 * - plain stylistic variations using {@linkplain Foo} or [[Foo]]
 * which uses a roman style
 * - code stylistic variation (monospace font) using {@linkcode Foo}
 * or [[`Foo`]]
 *
 * Reference links can also have a custom label for example [[Foo | Foo interface]]
 * or {@link Foo | Foo interface}
 *
 * Because symbols in links could be ambiguous, they can be further
 * specified by using 'selectors, for example:
 *
 * {@link (Foo:variable)} and {@link (Foo:type)}
 *
 * See [this TSDoc spec](https://github.com/microsoft/tsdoc/blob/master/spec/code-snippets/DeclarationReferences.ts) for details.
 *
 * ## Sections
 *
 * You can have a box displayed around a section of text for asides or
 * to callout important information.
 *
 * **(Note)**: If the text of the note starts on the same line as the note
 * itself, it will continue until a blank line.
 * This is the second line of the note (but it gets merged with the previous
 * one, as per the Markdown syntax).\
 * You can introduce another line by terminating the previous line with a
 * backslash character.
 *
 * And this is after the note, because of the blank line above.
 *
 * **(Note)**
 * Alternatively, a note can be spread over multiple lines, if the first
 * line of the note starts below its heading.
 *
 * The note will go on.
 *
 * Spread on multiple lines.
 *
 * Until a triple dash (or triple stars)
 *
 * ---
 *
 * This is outside of the note.
 *
 * There are several styles of notes, as shown below. Note that the note labels
 * are not case-sensitive
 *
 * **(WARNING)**: A warning, for something you really ought to pay attention to.
 *
 * **(Caution)**: `caution` is a synonym for `warning`
 *
 * **(danger)**: A danger note for something more ominous... Use sparingly.
 *
 * @packageDocumentation
 */

/**
 * Hidden entries.
 *
 * Entries with a tag of @internal, @ignore or @hidden will not be included
 * @ignore
 */
type HiddenType = boolean;

/**
 * Entries can use various tags.
 *
 * These tags can have an optional text.
 *
 * @eventProperty event property
 * @override {@link Foo}
 * @readonly read only
 * @sealed sealed
 * @virtual virtual
 * @deprecated Include info about how to migrate away from this item.
 * @experimental experimental
 * @alpha alpha
 * @beta slightly more baked
 */
type Baz = string;

/**
 * Entries can also have a "flag". Unlike the tags above, flags are simply
 * on or off and have no accompanying text.
 *
 * @private
 */
type PrivateBar = 'foo' | 'bar';

///

/**
 * Entries can also have a "flag". Unlike the tags above, flags are simply
 * on or off and have no accompanying text.
 *
 * @public
 * @protected
 * @external
 * @static
 */
type PublicBar = 'foo' | 'bar';

export const PI = 3.1415;
export const HELLO = 'hello world';

/** Comment for this variable
 * @beta
 */

export const vrai = true;

//
// To test the styling:
//

type T = number; // T is 'reference'

type U = T; // U is a 'typeParameter'

declare function f(a?: T, ...arg: any[]): number | 'string literal';
// f
// a:                   var
// number:              keyword
// "string literal":    stringLiteral
// (:)|                 punct
// ? and ...            modifier

//

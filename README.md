# Grok

> **grok**: /grok/, /grohk/, vt.
>
> To understand. Connotes intimate and exhaustive knowledge.

-- [The Jargon File](http://catb.org/jargon/html/G/grok.html)

Grok turns a TypeScript declaration file into a beautiful, readable, web page.

## Installation

```bash
npm install --global @ui-js/grok
```

## Usage

```bash
# Create documentation for the .d.ts files in ./dist into the ./docs folder
grok ./dist --outDir docs
```

## Configuration

Configuration can be specified:

-   as a `grok` property in `package.json`
-   as a `grok.config.json`, `grok.config.yaml`, `grok.config.js` file in your project
-   or as a specific file using the `--config` CLI option. In that case, the config file will be used **in addition** to other configuration files that may be present (it doesn't replace them)

The configuration can include the following keys:

-   `sdkName` the name of the SDK being documented
-   `modules` an array of module names that will be documented. This is useful both to indicate the order in which the modules should be displayed in the documentation and to 'hide' any unnecessary modules, while still preserving their visibility to the parser.
-   `documentTemplate` a string which will be used to build the output file, with the following substrings substituted:
    -   `{{content}}` HTML markup of the documentation (suitable for as the content of a `<body>` tag)
    -   `{{sdkName}}` the name of the SDK, as indicated above
    -   `{{packageName}}`

## Tags

Grok supports the [standard tags](https://github.com/microsoft/tsdoc/blob/master/tsdoc/src/details/StandardTags.ts) defined by tsdoc.

The `{@link symbol}` and its variants can use the tsdoc [standard declaration references](https://github.com/microsoft/tsdoc/blob/master/spec/code-snippets/DeclarationReferences.ts) to disambiguate which symbol to point to.

Grok supports a few additional extensions, including:

-   `{@tutorial path | name} to create links to pages with more detailed discussions
-   `{@linkcode symbol}` and `` [[`symbol` | title]] `` to create a link to a symbold displayed as code (in monospace font)
-   `[[symbol]]` a synonym for `{@link symbol}`
-   `@keywords` followed by a comma separated list of words which can be used by the search box

````typescript
export type InlineShortcutsOptions = {
    /** @deprecated Use:
     * ```typescript
     * mf.setConfig(
     *      'inlineShortcuts',
     *      {   ...mf.getConfig('inlineShortcuts'),
     *          ...newShortcuts
     *      }
     * )
     * ```
     * to add `newShortcuts` to the default ones. See {@linkcode setConfig} */
    overrideDefaultInlineShortcuts?: boolean;
};
````

```typescript
/**
 * Converts a LaTeX string to an Abstract Syntax Tree (MathJSON)
 *
 * **See:** {@tutorial MATHJSON | MathJson}
 *
 * @param latex A string of valid LaTeX. It does not have to start
 * with a mode token such as a `$$` or `\(`.
 * @param options.macros A dictionary of LaTeX macros
 *
 * @return  The Abstract Syntax Tree as an object literal using the MathJSON format.
 * @category Converting
 * @keywords convert, latex, mathjson, ast
 */
export declare function latexToAST(
    latex: string,
    options?: {
        macros?: MacroDictionary;
    }
);
```

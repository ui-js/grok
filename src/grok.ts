// import {TypeDoc} from 'typedoc';
const TypeDoc = require('typedoc');

const highlightJs = require('highlight.js'); // https://highlightjs.org/
const path = require('path');

const MarkdownIt = require('markdown-it');
const markdown = new MarkdownIt({
    // See https://markdown-it.github.io/markdown-it/
    html: true,
    typographer: true,
    highlight: function (str, lang) {
        if ((lang ?? 'typescript') && highlightJs.getLanguage(lang)) {
            try {
                return highlightJs.highlight(lang, str).value;
            } catch (err) {
                console.log(err);
            }
        }

        return ''; // use external default escaping
    },
});

interface Options {
    outFile?: string;

    /** If the tsc compiler encounters an error while parsing the declaration files,
     * attempt to continue nonetheless
     */
    ignoreErrors?: boolean;
    // verbose?: boolean;

    documentTemplate?:
        | string
        | ((substitutions: { [key: string]: any }) => string);

    cssVariables: { [variable: string]: string };

    keywordSynonyms?: { [word: string]: string[] };

    /**
     * Prefix added to the value of a {@tutorial} tag to determine the
     * URL to redirected to.
     * For example, {@tutorial readme.html} with tutorialPath = 'https://example.com/docs'
     * will redirect to 'https://example.com/docs/readme.html'
     */
    tutorialPath: string;

    modules?: string[];

    sdkName?: string;
}
type Tag =
    | 'alpha'
    | 'beta'
    | 'category'
    | 'command'
    | 'deprecated'
    | 'eventproperty'
    | 'experimental'
    | 'hidden'
    | 'param'
    | 'ignore'
    | 'internal'
    | 'keywords'
    | 'label'
    | 'override'
    | 'readonly'
    | 'remarks'
    | 'returns'
    | 'sealed'
    | 'virtual';

type Category = {
    title: string;
    children: Reflection[];
};

type ReflectionKind =
    | 0
    | 1
    | 2
    | 4
    | 8
    | 16
    | 32
    | 64
    | 128
    | 256
    | 512
    | 1024
    | 2048
    | 4096
    | 8192
    | 16384
    | 32768
    | 65536
    | 131072
    | 262144
    | 524288
    | 1048576
    | 2097152
    | 4194304
    | 8388608;

type Reflection = {
    id?: number;
    name?: string;
    kind?: ReflectionKind;
    type?:
        | 'abstract'
        | 'array'
        | 'conditionals'
        | 'index'
        | 'indexedAccess'
        | 'inferred'
        | 'intrinsic'
        | 'intersection'
        | 'predicate'
        | 'reference'
        | 'reflection'
        | 'stringLiteral'
        | 'tuple'
        | 'typeOperator'
        | 'typeParameter'
        | 'union'
        | 'unknown'
        | 'void'
        | Reflection; // For kind = 32: Variable,
    // 1024: Property, 4096: Call Signature, 16384: Constructor Signature
    // 8192: Index Signature, 32768: Parameter, 131072: Type Parameter,
    // 4194304: Type Alias
    groups?: Reflection[]; // For type = 'groups'
    children?: Reflection[];
    title?: string; // For groups
    comment?: {
        tags?: { tag: Tag; text?: string }[];
        shortText?: string;
        text?: string;
        returns?: string;
    };
    flags?: {
        isAbstract?: boolean;
        isPrivate?: boolean;
        isProtected?: boolean;
        isPublic?: boolean;
        isExternal?: boolean;
        isStatic?: boolean;
    };
    categories?: { title: string; children: number[] }[];
    signatures?: Reflection[];
    getSignature?: Reflection; // For accessors
    setSignature?: Reflection; // For accessors
    elementType?: Reflection;
    objectType?: Reflection;
    indexType?: Reflection;
    typeArguments?: Reflection[];
    types?: Reflection[];
    declaration?: Reflection;
    operator?: string; // For type 'typeOperator'
    target?: Reflection; // For type 'typeOperator'
    constraint?: Reflection;
    value?: string; // For type === 'stringLiteral'
    elements?: Reflection[]; // For type === 'tuple'
    defaultValue?: string; // For kind === 16 (Enum Member)
    indexSignature?: Reflection[];
    parameters?: Reflection[];
    typeParameter?: Reflection[];
    extendedTypes?: Reflection[]; // For kind = : Class
    implementedTypes?: Reflection[]; // For kind = : Class
    extendedBy?: Reflection[]; // For kind = : Class
    implementedBy?: Reflection[]; // For kind = : Class
};

type Permalink = {
    anchor: string;
    title: string;
    document?: string;
};

function span(
    value: string,
    className:
        | 'subhead'
        | 'head'
        | 'head deprecated'
        | 'stack'
        | 'flags'
        | 'keyword'
        | 'modifier'
        | 'modifier-tag'
        | 'red modifier-tag'
        | 'orange modifier-tag'
        | 'tag-name'
        | 'string-literal'
        | 'deprecated'
        | 'highlighting-mark-container'
        | ''
) {
    if (!className) return '<span>' + value + '</span>';
    return '<span class="' + className + '">' + value + '</span>';
}

function div(content: string, className?: string) {
    if (className) {
        return '\n<div class="' + className + '">' + content + '</div>\n';
    }
    return '\n<div>' + content + '</div>\n';
}

function punct(value: string): string {
    return '<span class="punctuation">' + value + '</span>';
}

function keyword(k: string): string {
    return '<span class="keyword">' + k + '</span>';
}

function section(
    content: string,
    options?: { permalink?: Permalink; className?: string; keywords?: string }
): string {
    let result = '<section';
    if (options?.keywords) {
        result += ' data-keywords="' + options.keywords.toLowerCase() + '"';
    }
    if (options?.permalink?.anchor) {
        result += ' id="' + encodeURIComponent(options.permalink.anchor) + '"';
    }
    if (options?.className) {
        result += ' class="' + options.className + '"';
    }
    result += '>' + content;
    return result + '\n</section>\n';
}

function list(
    items: (string | [string, string])[],
    className?: string
): string {
    if (!items || items.length === 0) return '';
    let result = '';
    if (Array.isArray(items[0])) {
        const definitions = items as [string, string][];
        if (className) {
            result += '\n<dl class="' + className + '">\n';
        } else {
            result += '\n<dl>\n';
        }
        result += definitions
            .map(
                (def) => '\n<dt>' + def[0] + '</dt>\n<dd>' + def[1] + '</dd>\n'
            )
            .join('');
        result += '\n</dl>\n';
    } else {
        if (className) {
            result += '\n<ul class="' + className + '">\n';
        } else {
            result += '\n<ul>\n';
        }
        result += items.map((item) => '\n<li>' + item + '</li>\n').join('');
        result += '\n</ul>\n';
    }
    return result;
}

function highlightingMark(content: string): string {
    return span(
        content +
            '<svg class="highlighting-mark"><use xlink:href="#highlighting-mark-' +
            (Math.floor(3 * Math.random()) + 1) +
            '"></use></svg>',
        'highlighting-mark-container'
    );
}

function heading(
    level: number,
    subhead: string,
    head: string,
    permalink?: Permalink,
    options?: { deprecated?: boolean; className?: string }
) {
    const tag = 'h' + Number(level).toString();

    let body = subhead ? span(subhead, 'subhead') : '';

    if (permalink?.anchor) {
        body += highlightingMark(
            span(head, options?.deprecated ? 'head deprecated' : 'head')
        );
        body = span(body, 'stack');
        body += renderPermalinkAnchor(permalink);
    } else {
        body += span(head, options?.deprecated ? 'head deprecated' : 'head');
        body = span(body, 'stack');
    }
    return (
        '<' +
        tag +
        (options?.className ? ' class="' + options.className + '"' : '') +
        '>' +
        body +
        '</' +
        tag +
        '>'
    );
}

// A "reflection" is some type information.
// In some cases, some types reference other type info by reference.
// This function locates these references by traversing the JSON
// data structure (from 'root')

function getReflectionByID(id: number, root = gNodes): Reflection {
    // A node with a given id can either be the actual node
    // or a **reference** to this node. Ignore references.
    if (root.type !== 'reference' && root.id === id) return root;
    let result: Reflection;
    if (
        root.children?.some((x) => {
            result = getReflectionByID(id, x);
            return result !== null;
        }) ??
        false
    ) {
        return result;
    }
    return null;
}

function getReflectionsByName(name: string, root?: Reflection): Reflection[] {
    if (!root) root = gNodes;
    let result = [];
    if (getName(root) === name) result.push(root);
    if (root.children) {
        root.children.forEach((x) => {
            result = [...result, ...getReflectionsByName(name, x)];
        });
    }
    return result;
}

/**
 * While a node ID is unique, names might not be.
 * Return all the matching nodes.
 */
function getReflectionByName(
    name: string,
    root?: Reflection,
    kind?: number | string
): Reflection {
    let candidates = [];
    candidates = getReflectionsByName(name, root);
    if (candidates.length > 0) {
        candidates.sort((a, b) => b.kind - a.kind);
        if (typeof kind === 'number') {
            candidates = candidates.filter((x) => (x.kind & kind) !== 0);
        } else if (kind === 'static') {
            candidates = candidates.filter(
                (x) => x.kind === 2048 && hasFlag(x, 'isStatic')
            );
        } else if (typeof kind === 'string') {
            const numKind = NUMERIC_KIND[kind];
            candidates = candidates.filter((x) => (x.kind & numKind) !== 0);
        }
        if (candidates.length > 0) {
            return candidates[0];
        }
    }
    return null;
}

const NUMERIC_KIND = {
    namespace: 2,
    enum: 4,
    variable: 32,
    function: 64,
    class: 128,
    interface: 256,
    instance: 1024 | 2048 | 262144, // property, method or getter/setter
    static: 1024 | 2048, // property or method
    type: 4194304,
};

function getNameSelector(segment: string): [string, string] {
    const m = segment.match(/^\(([^\:]+)(\:([^\)]+))?\)$/);
    if (m) {
        return [m[1], m[3]];
    }
    return [segment, undefined];
}

/*
 * Given a link, e.g. "(Animal:class).(run:instance)" or "walk"
 * return a matching reflection
 *
 * According to typedoc (https://typedoc.org/guides/doccomments/):
 * Links are resolved by looking at child reflections, then at adjacent
 * reflections, then at parent reflections. If a name contains a dot (.),
 * each part of the name will be treated as the name of a reflection.
 * For example, to link to the member property of Foo, you can use
 * {@link Foo.member}.
 */

function getReflectionByLink(link: string, root?: Reflection): Reflection {
    const segments = link.split('.');
    if (segments.length === 1) {
        // No path: look at children, then siblings, then parent, then global
        const [name, kind] = getNameSelector(segments[0]);
        return (
            getReflectionByName(name, root, kind) ||
            getReflectionByName(name, getParent(root), kind) ||
            getReflectionByName(name, null, kind)
        );
    }

    const lastSegment = segments.pop();
    let node = null;
    for (const segment of segments) {
        // Find the next path segment
        const [name, kind] = getNameSelector(segment);
        node = getReflectionByName(name, node, kind);
    }
    return getReflectionByLink(lastSegment, node);
}

/**
 * Return an array of ancestor nodes.
 * result[0] is the node
 * result[1] is the parent, etc..
 */
function getAncestors(node: Reflection, root = gNodes): Reflection[] {
    if (!node) return null;
    if (node.id === root.id) return [root];
    if (root.children) {
        for (const child of root.children) {
            const ancestors = getAncestors(node, child);
            if (ancestors) {
                return [...ancestors, root];
            }
        }
    }
    return null;
}

function getParent(node: Reflection): Reflection {
    const ancestors = getAncestors(node);
    if (ancestors) return ancestors[1];
    return null;
}

/**
 * Return all the children matching the specified list of IDs
 */
function getChildrenByID(node: Reflection, children: number[]): Reflection[] {
    return children.map(
        (x) => node.children.filter((child) => child.id === x)[0]
    );
}

function getName(node: Reflection): string {
    if (node.kind === 1) {
        return getModuleName(node);
    }
    return node.name;
}

function everyStringLiteral(nodes: Reflection[]): boolean {
    return nodes.every((x) => x.type === 'stringLiteral');
}

function sortOtherCategoryAtEnd(categories: Category[]): Category[] {
    return categories.sort((a, b): number => {
        if (a.title === b.title) return 0;
        if (a.title === 'Other') return 1;
        if (b.title === 'Other') return -1;
        return a.title < b.title ? -1 : 1;
    });
}

const KIND_ORDER = {
    512: 1, // constructor

    64: 2, // function
    2048: 3, // method
    262144: 4, // setter/getter (accessor)

    1024: 5, // property
    32: 6, // variable/properties

    256: 7, // interface
    128: 8, // class

    4194304: 9, // type alias
    4: 10, // enum
};

function sortGroups(groups: Reflection[]): Reflection[] {
    return groups.sort((a, b) => {
        console.assert(KIND_ORDER[b.kind] && KIND_ORDER[a.kind]);
        return KIND_ORDER[a.kind] === KIND_ORDER[b.kind]
            ? 0
            : KIND_ORDER[a.kind] < KIND_ORDER[b.kind]
            ? -1
            : +1;
    });
}

/**
 * Categories are grouping of related items, for example
 * all methods about a particular topic.
 *
 * In the source files, categories are indicated with a
 * @category tag (a tsdoc standard)
 */

function getCategories(node: Reflection, kind: number): Category[] {
    let result = [];
    const children = node.groups?.filter((x) => (x.kind & kind) !== 0);
    if (!children || children.length !== 1) {
        // No groups. Are there categories?
        if (node.categories) {
            return sortOtherCategoryAtEnd(
                (node.categories as unknown) as Category[]
            );
        }
        return [
            {
                title: '',
                children: node.children.filter((x) => (x.kind & kind) !== 0),
            },
        ];
    }
    if (children[0].categories) {
        result = children[0].categories.map((category) => {
            return {
                title: category.title,
                children: getChildrenByID(node, category.children),
            };
        });
        result = sortOtherCategoryAtEnd(result);
    } else {
        // No categories, return all the children of the specified kind
        console.assert(typeof children[0].children[0] === 'number');
        result = [
            {
                title: '',
                children: getChildrenByID(
                    node,
                    (children[0].children as unknown) as number[]
                ),
            },
        ];
    }
    return result;
}

// See https://github.com/microsoft/tsdoc/blob/master/spec/code-snippets/DeclarationReferences.ts
// This returns a fully qualified (non-ambiguous) permalink to this symbol
// The "(:)" operator uses a "selector" after the colon.  It has these properties:
//
// - It is used in the absence of a TypeScript name, or to choose between things that have
//   the same name.
//
// - For members of classes, the system-defined selectors are "instance" and "static"
//
// - For members of interfaces and enums, there are no system-defined selectors.
//
// - For merged declarations, the system-defined selectors are "class", "enum", "function",
//   "interface", "namespace", "type", or "variable"
//
// - Class constructors use a special "constructor" selector that applies to the class itself.
//
// - Label selectors refer to declarations indicated using the {@label LABEL} tag.  The label
//   must be all capitals (e.g. "WITH_NUMBERS") to avoid conflicts with system selectors.
//
// This returns a permalink structure made up of:
// - anchor: a URL anchor that needs to be encoded and added
// after a '#' and path to make it a full URL
// - title: a string to be displayed as the name of the URL.

function makePermalink(node: Reflection): Permalink | null {
    // We need the actual node (not a reference)
    // This is important for shouldIgnore(). It will return false for a reference
    // as the tags are not accessible on a reference node
    node = getReflectionByID(node.id);

    if (!node || node.kind === 0) {
        // kind = 0 -> file
        return null;
    }
    const parent = getParent(node);
    if (!parent) {
        // Some nodes are not in the tree of nodes and are not reachable
        // For example temporary types that are not named, as in:
        // `a: {b:T}`: `{b:T}` is an unreachable node
        return { anchor: '', title: node.name ?? '' };
    }
    let result;
    if (node.kind === 512) {
        // Special syntax for constructors
        const grandparentPermalink = makePermalink(getParent(parent));
        if (grandparentPermalink) {
            result = {
                anchor:
                    (grandparentPermalink.anchor
                        ? grandparentPermalink.anchor + '.'
                        : '') +
                    parent.name +
                    ':constructor',
                title: 'new ' + parent.name + '()',
            };
        } else {
            result = {
                anchor: parent.name + ':constructor',
                title: 'new ' + parent.name + '()',
            };
        }
    } else {
        const qualifiedSymbol = getQualifiedSymbol(parent, node);
        const parentPermalink = makePermalink(parent);
        const nodeName = getName(node);
        result = parentPermalink
            ? {
                  anchor:
                      (parentPermalink.anchor
                          ? parentPermalink.anchor + '.'
                          : '') + qualifiedSymbol,
                  title: parentPermalink.title + '.' + nodeName,
              }
            : {
                  anchor: qualifiedSymbol,
                  title: nodeName,
              };
        // There's a bug in typedoc:
        // https://github.com/TypeStrong/typedoc/issues/1284
        // exported modules are returned as 'namespace' with a stringLiteral value
        if (
            parent.kind === 1 ||
            (parent.kind === 2 && /^"(.*)"$/.test(parent.name))
        ) {
            result.title = nodeName;
        }
    }
    if (shouldIgnore(node)) {
        result.anchor = '';
    }
    return result;
}

/**
 * Render a link to an item, inline
 * The permalink is made up of
 * - document: a valid URL
 * - anchor: an unescaped ID
 * - title: a string
 */
function renderPermalink(permalink: Permalink, title?: string): string {
    if (!permalink) return '';
    title = title ?? permalink.title;
    if (permalink.document && permalink.anchor) {
        // This is an external reference (with an anchor)
        return `<a href="${permalink.document}#${encodeURIComponent(
            permalink.anchor
        )}">${title}</a>`;
    } else if (permalink.document) {
        // This is an external reference (without anchor)
        return `<a href="${permalink.document}}">${title}</a>`;
    } else if (permalink.anchor) {
        // This is a reference to a local item (in this document)
        return `<a href="#${encodeURIComponent(
            permalink.anchor
        )}">${title}</a>`;
    }
    return title;
}

/**
 * Renders the "anchor" permalink displayed on hover
 * in the card header.
 */
function renderPermalinkAnchor(permalink: Permalink): string {
    // This should only be called for items that are in this document,
    // so the permalink.document should be empty.
    console.assert(!permalink.document);

    return (
        '<a class="permalink" href="#' +
        encodeURIComponent(permalink.anchor) +
        '" title="Permalink"><span class="sr-only"> Permalink </span>' +
        '<svg><use xlink:href="#link"></use></svg>' +
        '</a>'
    );
}

/**
 * Render a "table of content"
 * for example for all the methods or properties in a class.
 *
 * Each item name has a link to its full definition.
 *
 * The items are displayed in a short form without type info.
 *
 * The items are grouped by categories
 *
 * If there are 1 or less, no table is generated (don't need
 * a table with 1 item in it)
 */
function renderIndex(
    node: Reflection,
    title?: string,
    categories?: Category[],
    options?: { symbolSuffix?: string }
) {
    if (!categories || categories.length === 0) return '';
    let result = '';
    if (title) {
        result = heading(3, getQualifiedName(node), title);
    }

    // Don't display the index if there's only one item in it
    if (categories.length === 1 && categories[0].children.length <= 1) {
        return result;
    }

    options = options || { symbolSuffix: '' }; // Could be '()' for functions/methods

    return (
        result +
        categories
            .map((category) => {
                let r = '';
                if (category.title) {
                    r += `\n\n<h4>${category.title}</h4>\n`;
                }
                const items = category.children.map((x) => {
                    // Sometimes the children can be ID (for 'Types') for example
                    let n: Reflection;
                    if (typeof x === 'number') {
                        n = getReflectionByID(x);
                    } else {
                        n = x;
                    }
                    return renderPermalink(
                        makePermalink(n),
                        getName(n) + options.symbolSuffix
                    );
                });
                r += '\n<div class="index">' + list(items) + '\n</div>\n';
                return r;
            })
            .join('\n')
    );
}

// A flag is usually a typescript keyword modifying an entry,
// for example 'protected' -> 'isProtected' or 'optional' -> 'isOptional'
function hasFlag(
    node: Reflection,
    flag: 'isProtected' | 'isOptional' | 'isStatic' | 'isAbstract' | 'isRest'
): boolean {
    return node?.flags?.[flag];
}

// A tag is a JSDOC notation, such as '@param' or '@example'
// See https://typedoc.org/guides/doccomments/
function getTag(node: Reflection, tag: Tag): string {
    if (node?.comment?.tags) {
        const result = node.comment.tags.filter((x) => x.tag === tag);
        // It *could* happen, but we're not ready to deal with that...
        console.assert(result.length <= 1);
        if (result.length === 1) {
            return result[0].text || '';
        }
    }
    return '';
}

/**
 *  Return true if a tag is present (but its content could be empty)
 */

function hasTag(node: Reflection, tag: Tag) {
    return (
        node?.comment?.tags &&
        node.comment.tags.filter((x) => x.tag === tag).length > 0
    );
}

function getKeywords(node: Reflection): string[] {
    if (node.signatures && !node.comment) {
        return getKeywords(node.signatures[0]);
    }
    let keywords = getTag(node, 'keywords');
    if (!keywords && hasTag(node, 'keyword' as any)) {
        console.warn(
            'The tag for keywords is "@keywords", not "@keyword" ',
            getQualifiedName(node)
        );
        keywords = getTag(node, 'keyword' as any);
    }

    let result = (keywords ?? '').split(',');

    result.push(
        {
            2: 'namespace',
            4: 'enum',
            32: 'variable',
            16: '', // Enum member
            64: 'function',
            128: 'class',
            256: 'interface',
            1024: '', // property, no selector (unless parent is class, see below)
            2048: '', // method, handled below
            4096: 'function', // call signature (functions)
            262144: 'instance', // get/set
            4194304: 'type', // 131072? 65535?
        }[node.kind] ?? ''
    );

    result.push(getName(node));

    if (hasTag(node, 'category' as any)) {
        const category = getTag(node, 'category' as any)
            .split(' ')
            .map((x) => x.toLowerCase().trim());
        result = [...result, ...category];
    }

    // Add synonyms
    result = [].concat(
        ...result.map((word) => {
            if (gOptions.keywordSynonyms?.[word]) {
                return [word, ...gOptions.keywordSynonyms[word]];
            }
            return [word];
        })
    );

    // Remove empty keywords, normalize to lowercase
    result = result
        .filter((x) => !!x)
        .map((x: string) => x.trim().toLowerCase());

    // Remove duplicates
    return [...new Set(result)];
}

function renderFlags(node: Reflection, style = 'block') {
    if (!node) return '';
    let result = '';
    if (node.flags) {
        if (node.flags.isAbstract) result += span('abstract', 'modifier-tag');
        if (node.flags.isPrivate) result += span('private', 'modifier-tag');
        if (node.flags.isProtected) result += span('protected', 'modifier-tag');
        if (node.flags.isPublic) result += span('public', 'modifier-tag');
        // The 'exported' flag is low information in a public API. Skip it.
        // if (json.isExported) result += span('exported', 'modifier-tag');
        if (node.flags.isExternal) result += span('external', 'modifier-tag');
        if (node.flags.isStatic) result += span('static', 'modifier-tag');
    }

    const TAGS: {
        [tag: string]: 'red modifier-tag' | 'orange modifier-tag' | '';
    } = {
        // command: '', // @command: indicate commands dispatched with .perform()
        eventproperty: '',
        override: '',
        // public: '',  // @public is not a block tag: it gets converted to a flag
        // private: '',  // @private is not a block tag: it gets converted to a flag
        // protected: '',  // @protected is not a block tag: it gets converted to a flag
        readonly: '',
        sealed: '',
        virtual: '',
        deprecated: 'red modifier-tag',
        // internal: 'red', // Items with a @internal tag are ignored
        beta: 'orange modifier-tag',
        alpha: 'orange modifier-tag',
        experimental: 'orange modifier-tag',
    };
    const TAG_NAME = {
        eventproperty: 'event',
        readonly: 'read only',
    };
    result += Object.keys(TAGS)
        .map((x) =>
            hasTag(node, x as Tag)
                ? span(TAG_NAME[x] || x, TAGS[x] || 'modifier-tag')
                : ''
        )
        .join('');

    return result
        ? style === 'block'
            ? div(result, 'flags')
            : span(result, 'flags')
        : '';
}

/**
 * JSDOC tags...
 * See https://github.com/microsoft/tsdoc/blob/master/tsdoc/src/details/StandardTags.ts for the list of supported tags
 */
function renderTag(node: Reflection, tag: string, text: string) {
    if (!tag || !text) return '';
    let result = '';
    text = trimNewline(text.trim()) || '';
    switch (tag) {
        case 'method':
            result +=
                '<strong>Method:</strong> ' +
                markdown.render(renderLinkTags(node, text));
            break;
        case 'module':
            result +=
                '<strong>Module:</strong> ' +
                markdown.render(renderLinkTags(node, text));
            break;
        case 'function':
            result +=
                '<strong>Function:</strong> ' +
                markdown.render(renderLinkTags(node, text));
            break;
        case 'example':
            result +=
                '\n<pre><code>' +
                highlightJs.highlight('typescript', text).value +
                '</code></pre>\n';
            break;
        case 'typedef':
        case 'type':
        case 'property':
        case 'param':
        case 'returns':
            // Those tags are emitted for type definition
            // but they are redundant...
            break;
        case 'privateremarks':
            // This comment is for internal use only. Do not output it
            // in the API documentation.
            break;
        case 'packageDocumentation':
            // This tag indicates this is the top-level documentation
            // We handle it separately, no need to emit it here.
            break;
        case 'category':
            // Categories/topics are handled separately
            break;
        case 'global':
            // Globals are grouped together and indicated separately
            break;
        case 'keywords':
            // Keywords are handled separately
            break;
        case 'command':
            // The @command tag indicates that the properties of a class or
            // interface specify the selectors of a command to be invoked with
            // the code which is the value of the @command tag. This is handled
            // separately and should not be displayed as a regular tag.
            break;

        case 'keyword':
            console.warn(
                'Unexpected tag "@keyword" in ' +
                    node.name +
                    '. Did you mean "@keywords"?'
            );
        // fall through

        default:
            if (text) {
                const noticeStyle =
                    {
                        eventproperty: 'info',
                        override: 'info',
                        public: 'info',
                        readonly: 'info',
                        sealed: 'info',
                        virtual: 'info',
                        alpha: 'warning',
                        beta: 'warning',
                        experimental: 'warning',
                        deprecated: 'danger',
                        internal: 'danger',
                    }[tag] || 'info';
                const tagLabel = { eventproperty: 'event' }[tag] || tag;
                // Add a notice style
                result += section(
                    '<h4>' +
                        tagLabel +
                        '</h4>\n\n' +
                        markdown.render(renderLinkTags(node, text)),
                    { className: 'notice--' + noticeStyle }
                );
            } else if (
                !/alpha|beta|deprecated|eventproperty|experimental|internal|override|public|readonly|sealed|virtual/i.test(
                    tag
                )
            ) {
                result += '<strong>' + tag + '</strong>';
            } else {
                // console.log('Unexpected tag ' + tag);
            }
    }
    return result;
}

function escapeYAMLString(str: string): string {
    return str.replace(/([^\\])'/g, "$1\\'");
}

function trimQuotes(str: string): string {
    return str.replace(/(^")|("$)/g, '');
}

function trimNewline(str: string): string {
    return str.replace(/(\n+)$/g, '');
}

function isVoid(node: Reflection): boolean {
    // Both values can be returned. Not sure when, or if that's intentional...
    return (
        node.type === 'void' ||
        (node.type === 'intrinsic' && node.name === 'void')
    );
}

/**
 * A symbol is for example the name of a type ("T") or class ("C")
 * or a method ("f") or property ("p").
 *
 * A qualified symbol adds a "selector" that is used to disambiguate
 * the symbol. For example "f" could refer either to an instance method
 * of a class, a static method of a class, or a member of an interface.
 *
 * Their respective qualified version would be:
 * "(f:instance)", "(f:static)" and "f"
 *
 * Note this function returns "full" qualified symbols:
 * when it's not ambiguous, the selector can be omitted to form
 * a short qualified name, for example if there's only a static
 * method, "f" is acceptable. However, the symbols we generate
 * (for anchor links) are always fully qualified, while the
 * ones we interpret (reading from @link, for example), don't
 * have to be.
 *
 */

function getQualifiedSymbol(parent: Reflection, node: Reflection): string {
    if (node.kind === 0) {
        // File-level
        return '';
    }
    if (node.kind === 1) {
        // This is a module
        console.assert(parent.kind === 0);
        if (parent.children.length === 1) {
            // And there is a single module in this file
            return '';
        }
        return '("' + getModuleName(node) + '":module)';
    }
    if (node.kind === 2) {
        // Namespace.
        // There's a bug in typedoc:
        // https://github.com/TypeStrong/typedoc/issues/1284
        // exported modules are returned as 'namespace' with a stringLiteral value
        if (/^"(.*)"$/.test(node.name)) {
            return '("' + trimQuotes(node.name) + '":module)';
        }
        return '(' + node.name + '":namespace)';
    }
    if (node.type === 'reference') {
        // If this is a reference, resolve it.
        // For example in 'Keys<Commands>' 'Keys' is a reference to the
        // type 'Keys'
        node = getReflectionByID(node.id);
    }
    const symbol = node.name;
    let selector = {
        2: 'namespace',
        4: 'enum',
        32: 'variable',
        16: '', // Enum member
        64: 'function',
        128: 'class',
        256: 'interface',
        1024: '', // property, no selector (unless parent is class, see below)
        2048: '', // method, handled below
        4096: 'function', // call signature (functions)
        262144: 'instance', // get/set
        4194304: 'type', // 131072? 65535?
    }[node.kind];
    console.assert(typeof selector !== 'undefined');
    if (node.kind === 512) {
        // Constructor (special syntax)
        // Note: this code should never be reached,
        // this case is handled in makePermalink()
        return ':constructor';
    }
    // See https://github.com/microsoft/tsdoc/blob/master/spec/code-snippets/DeclarationReferences.ts
    // for the list of standard selectors
    if (parent && parent.kind === 128) {
        // If the parent is a class, use a 'static' or 'instance'
        // selector for properties (1024) and methods (2048)
        if (node.kind === 1024 || node.kind === 2048) {
            if (node.flags?.isStatic) {
                selector = 'static';
            } else {
                selector = 'instance';
            }
        }
    } else if (parent?.kind === 256) {
        // There's no selector for members of interfaces
        selector = '';
    }
    const label = getTag(node, 'label');
    if (label) {
        // If there's an explicit @label set, use it as a selector
        selector = label;
    }

    return selector ? `(${symbol}:${selector})` : symbol;
}

// Return 'class', 'abstract class', 'interface, 'enum'
// when appropriate
function getQualifiedName(node: Reflection): string {
    if (!node || node.kind === 0) return '';
    if (node.kind === 128 && hasFlag(node, 'isAbstract')) {
        // Class
        return (
            keyword('abstract class ') +
            '<strong>' +
            getName(node) +
            '</strong>'
        );
    }
    // There's a bug in typedoc:
    // https://github.com/TypeStrong/typedoc/issues/1284
    // exported modules are returned as 'namespace' with a stringLiteral value
    if (node.kind === 2 && /^"(.*)"$/.test(node.name)) {
        return (
            keyword('module ') +
            '<strong>"' +
            trimQuotes(node.name).replace(/\.d$/, '') +
            '"</strong>'
        );
    }
    if (node.kind === 1) {
        return keyword('module ') + '<strong>"' + getName(node) + '"</strong>';
    }
    return (
        keyword(
            {
                256: 'interface ',
                128: 'class ',
                4: 'enum ',
                2: 'namespace ',
                1: 'module ',
            }[node.kind] ?? ''
        ) +
        '<strong>' +
        getName(node) +
        '</strong>'
    );
}

// See: https://github.com/microsoft/tsdoc/blob/master/spec/code-snippets/DeclarationReferences.ts
// link is a string, representing a potentially non-resolved symbol, for
// example "Foo", or a resolved one: "(Foo:variable)"
// or "(Foo:class).(Bar.function)" or "https://host.com/path/#Foo"
// or "@module/path/director#Foo"

function resolveLink(node: Reflection, link: string): string {
    if (/^http[s]?:\/\//.test(link)) {
        // It's a regular URL
        return link;
    }
    if (!getReflectionByLink(link, node)) {
        // Check that the link actually resolves to a reflection
        console.warn('Unresolved link in "' + node.name + '": ', link);
        // Even if it doesn't, we can still generate a URL, but it
        // likely won't point to anywhere.
    }
    let result = '';
    const imports = link.split('#');
    if (imports.length > 1) {
        result = imports[0];
        // Omit what comes before '#'
        link = imports.slice(1).join('');
        // @todo: resolve external references. Maybe have a mapping table
        // specified with @externallink foo=href ?
    }
    const linkSegments = link.split('.');
    let root = gNodes;
    linkSegments.forEach((linkSegment) => {
        root = getReflectionByLink(linkSegment, root);
    });

    return root
        ? result + '#' + encodeURIComponent(makePermalink(root).anchor)
        : result + '#' + linkSegments.join('.');
}

function getTutorial(path: string): string {
    if (!gOptions.tutorialPath) return path;
    if (!gOptions.tutorialPath.endsWith('/')) {
        return gOptions.tutorialPath + '/' + path;
    }
    return gOptions.tutorialPath + path;
}

/**
 * Render the JSDOC links that may be included in comments.
 *
 * These links could point to symbols in this file, or to some external
 * resources
 *
 */

function renderLinkTags(node: Reflection, str: string) {
    str = str.replace(
        /{@tutorial\s+(\S+?)[ \|]+(.+?)}/g,
        (_match, p1, p2) => `<a href="${getTutorial(p1)}">${p2}</a>`
    );
    str = str.replace(
        /{@tutorial\s+(\S+?)}/g,
        (_match, p1) => `<a href="${getTutorial(p1)}">${p1}</a>`
    );

    // @linkcode and [[``]]...
    // ... with title
    str = str.replace(
        /{@linkcode\s+(\S+?)\s*\|\s*(.+?)}/g,
        (_match, p1, p2) =>
            `<a href="${resolveLink(node, p1)}"><code>${p2}</code></a>`
    );
    // ... no title
    str = str.replace(
        /{@linkcode\s+(\S+?)}/g,
        (_match, p1) =>
            `<a href="${resolveLink(node, p1)}"><code>${p1}</code></a>`
    );
    // ... [[`` | ]]
    str = str.replace(
        /\[\[\`(\S+?)\`\s*\|\s*(.+?)\]\]/g,
        (_match, p1) =>
            `<a href="${resolveLink(node, p1)}"><code>${p1}</code></a>`
    );
    // ... [[``]]
    str = str.replace(
        /\[\[\`(\S+?)\`\]\]/g,
        (_match, p1) =>
            `<a href="${resolveLink(node, p1)}"><code>${p1}</code></a>`
    );

    // Plain link...
    // ... @link and @linkplain with title
    str = str.replace(
        /{@(?:link|linkplain)\s+(\S+?)\s*\|\s*(.+?)}/g,
        (_match, p1, p2) => `<a href="${resolveLink(node, p1)}">${p2}</a>`
    );

    // ... @link and @linkplain no title
    str = str.replace(
        /{@(?:link|linkplain)\s+(\S+?)}/g,
        (_match, p1) => `<a href="${resolveLink(node, p1)}">${p1}</a>`
    );

    // ... [[ | ]] with title
    str = str.replace(
        /\[\[(\S+?)\s*\|\s*(.+?)\]\]/g,
        (_match, p1, p2) => `<a href="${resolveLink(node, p1)}">${p2}</a>`
    );

    // ... [[]]
    str = str.replace(
        /\[\[(\S+?)\]\]/g,
        (_match, p1) => `<a href="${resolveLink(node, p1)}">${p1}</a>`
    );

    // {@inheritDoc ...}
    str = str.replace(/({@(?:inheritDoc)\s+(\S+?)})/gi, (_match, p1, p2) => {
        if (!p1.startsWith('{@inheritDoc')) {
            console.warn('Check capitalization of @inheritDoc', p1);
        }
        const source = getReflectionByLink(p2, node);
        if (!source) {
            console.warn('Unresolved link in "' + node.name + '": ', p1);
            return p1;
        }
        return render(source, 'block-inherit'); // As a block, but exclude tags and @example
    });

    return str;
}

/**
 */

function renderNotices(node: Reflection, str: string): string {
    const lines = str.split('\n');
    const blocks = [];
    let inShortBlock = false;
    let inLongBlock = false;
    let currentBlock = [];
    let currentType = '';
    lines.forEach((line) => {
        if (inShortBlock) {
            // Looking for an empty line
            const m = line.match(/^\s*$/i);
            if (m) {
                if (currentBlock.length > 0) {
                    blocks.push({
                        type: currentType,
                        content: currentBlock.join('\n'),
                    });
                }
                inShortBlock = false;
                currentType = '';
                currentBlock = [];
            } else {
                // Still in a short block
                currentBlock.push(line);
            }
        } else if (inLongBlock) {
            // Looking for a '---' or '***' at the begining of the line
            if (/^[ ]{0,3}(\*\*\*|---)/.test(line)) {
                if (currentBlock.length > 0) {
                    blocks.push({
                        type: currentType,
                        content: currentBlock.join('\n'),
                    });
                }
                inLongBlock = false;
                currentType = '';
                currentBlock = [];
            } else {
                // Still in a long block
                currentBlock.push(line);
            }
        } else {
            // Looking for a notice tag at the start of the line:
            // '**(note)**', etc..
            let m = line.match(/\n*\*\*\(([^]+)\):?\s*\*\*\s*:?\s*([^]+)/i);
            if (m) {
                // Found a short note
                if (currentBlock.length > 0) {
                    blocks.push({
                        type: currentType,
                        content: currentBlock.join('\n'),
                    });
                }
                inShortBlock = true;
                currentType = m[1];
                currentBlock = [m[2]];
            } else {
                m = line.match(/\n*\*\*\(([^]+)\):?\s*\*\*\s*:?\s*$/i);
                if (m) {
                    // Found a long note
                    if (currentBlock.length > 0) {
                        blocks.push({
                            type: currentType,
                            content: currentBlock.join('\n'),
                        });
                    }
                    inLongBlock = true;
                    currentType = m[1];
                    currentBlock = [];
                } else {
                    // Nothing special
                    currentBlock.push(line);
                }
            }
        }
    });
    if (currentBlock.length > 0) {
        blocks.push({ type: currentType, content: currentBlock.join('\n') });
    }
    return blocks
        .map((block) => {
            if (block.type) {
                const noticeType =
                    {
                        danger: 'danger',
                        warning: 'warning',
                        caution: 'warning',
                    }[block.type.toLowerCase()] || 'info';
                return div(
                    '<h4>' +
                        block.type +
                        '</h4>\n' +
                        markdown.render(renderLinkTags(node, block.content)),
                    'notice--' + noticeType
                );
            }
            return markdown.render(renderLinkTags(node, block.content));
        })
        .join('\n');
}

function renderComment(node: Reflection, style: string): string {
    if (!node) return '';
    if (node.signatures && !node.comment) {
        return renderComment(node.signatures[0], style);
    }
    if (!node.comment) return '';
    let result = '';
    const newLine = '\n';

    if (node.comment.shortText) {
        result += renderNotices(node, node.comment.shortText) + newLine;
    }
    if (node.comment.text) {
        result += renderNotices(node, node.comment.text) + newLine;
    }
    const remarks = getTag(node, 'remarks');
    if (remarks) {
        result += renderNotices(node, remarks) + newLine;
    }
    if (style !== 'block-inherit') {
        if (node.comment.tags && node.comment.tags.length > 0) {
            result +=
                newLine +
                node.comment.tags
                    .map((x) => renderTag(node, x.tag, x.text))
                    .filter((x) => !!x)
                    .join(newLine + newLine) +
                newLine;
        }
    }
    return result;
}

function getModuleName(node) {
    if (!node) return '';
    if (node.kind === 1) {
        return trimQuotes(node.name).replace(/\.d$/, '');
    }
    return getModuleName(getParent(node));
}

function shouldIgnore(node: Reflection): boolean {
    // @hidden and @ignore are synonyms. The nodes for these symbols are not
    // even created.
    // @internal will result in nodes being created, unless --strip-internal is
    // true (which it isn't).
    // @internal is in general a better tag, as it allows us to distintguish
    // between an @internal symbols (which should not be documented) and an
    // external symbol (which has an external link)
    return (
        hasTag(node, 'hidden') ||
        hasTag(node, 'ignore') ||
        hasTag(node, 'internal')
    );
}

/**
 * Render a card with a header, content and footer
 */

function renderCard(
    node: Reflection,
    displayName: string,
    content: string
): string {
    const parent = getParent(node);
    if (!displayName) {
        displayName = `<strong>${getName(node)}</strong>`;
        // If enum, variable (property), function (method), class,
        // interface
        if (
            node.kind === 4 ||
            node.kind === 32 ||
            node.kind === 64 ||
            node.kind === 128 ||
            node.kind === 256 ||
            node.kind === 1024 ||
            node.kind === 2048
        ) {
            if (
                parent &&
                ((parent.kind === 2 && !/^"(.*)"$/.test(parent.name)) ||
                    parent.kind === 128 ||
                    parent.kind === 256)
            ) {
                // Parent is a namespace or class or interface
                displayName = getName(parent) + punct('.') + displayName;
            }
        }
        if (node.kind === 64) {
            // Function
            displayName += punct('()');
        }
    }

    const permalink = makePermalink(node);
    // The permalink should refer to this document (and therefore be empty)
    console.assert(!permalink.document);

    const header = heading(
        3,
        getQualifiedName(parent),
        displayName,
        permalink,
        { deprecated: hasTag(node, 'deprecated') }
    );
    return section(header + content, {
        permalink,
        className: 'card',
        keywords: getKeywords(node).join(', '),
    });
}

/**
 * Each function or methods has its own separate card
 * json.kind =
 * - 64: function
 * - 512: constructor
 * - 2048: method
 *
 */
function renderMethodCard(node: Reflection): string {
    if (shouldIgnore(node)) return '';

    // The @command tag can be placed either on each individual entry
    // or on the interface/class that groups them
    const result = renderCommandCard(node);
    if (result) return result;

    const parent = getParent(node);
    let displayName = '';
    let shortName = '';
    if (node.kind === 512) {
        // Constructor
        // Constructors *always* have a (class) parent
        displayName = `${keyword('new ')}<strong>${parent.name}</strong>`;
        shortName = displayName;
    } else {
        shortName = `<strong>${node.name}</strong>`;
    }

    // Display one or more function signatures,
    // which include a summary of the signature, e.g.
    // - function foo.bar(x: string): number
    // - comments about this function
    // - details about each of the arguments

    return renderCard(
        node,
        displayName,
        renderComment(node, 'block') +
            div(
                node.signatures
                    .map((signature) => {
                        let result = renderFlags(signature);
                        // Display the "short" signature (kind 4096)
                        result += div(
                            shortName + render(signature, 'inline'),
                            'code'
                        );

                        // Display info about each of the params...
                        result += render(signature, 'block');

                        return div(result);
                    })
                    .join('\n<hr>\n')
            )
    );
}

/**
 * Card for an accessor (get/set)
 */
function renderAccessorCard(node: Reflection) {
    if (shouldIgnore(node)) return '';

    let displayName = '';

    if (node.getSignature && node.setSignature) {
        // set/get
        displayName = keyword('get/set ') + `<strong>${node.name}</strong>`;
    } else if (node.getSignature) {
        // get only
        displayName = keyword('get ') + `<strong>${node.name}</strong>`;
    } else {
        // set only
        displayName = keyword('set ') + `<strong>${node.name}</strong>`;
    }

    const signature = node.getSignature
        ? node.getSignature[0]
        : node.setSignature[0];
    let body = node.name + punct(': ') + render(signature.type, 'inline');
    if (node.getSignature && !node.setSignature) {
        body += span('read only', 'modifier-tag');
    } else if (!node.getSignature && node.setSignature) {
        body += span('write only', 'modifier-tag');
    }
    body += render(signature, 'block');

    return renderCard(
        node,
        displayName,
        div(body) + renderComment(node, 'block')
    );
}

/**
 * A class section is a top level section containing a table of content
 * (for each member method/property), grouped by categories,
 * followed by a card for each method/property
 */

function renderClassSection(node: Reflection): string {
    // If it's just a forward declaration, e.g.
    // `declare class Mathfield{}`
    // there are no children (methods, etc...) to inspect and we don't render it.
    if (shouldIgnore(node) || !node.children) return '';

    if (
        node.groups.length === 1 &&
        (node.groups[0].kind & (1024 | 2048)) !== 0 &&
        !hasTag(node, 'command')
    ) {
        // There's a single group (all the children are the same kind)
        // and all the children are properties or methods
        return render(node, 'card');
    }

    const permalink = makePermalink(node);
    const parent = getParent(node);

    const result =
        heading(
            2,
            getQualifiedName(parent),
            getQualifiedName(node),
            permalink,
            { deprecated: hasTag(node, 'deprecated') }
        ) + renderFlags(node);

    let body = '';
    if (node.extendedTypes) {
        body +=
            '<p>' +
            span('Extends:', 'tag-name') +
            node.extendedTypes
                .map((x) => render(x))
                .filter((x) => !!x)
                .join(', ') +
            '</p>';
    }

    if (node.implementedTypes) {
        body +=
            '<p>' +
            span('Implements:', 'tag-name') +
            node.implementedTypes
                .map((x) => render(x))
                .filter((x) => !!x)
                .join(', ') +
            '</p>';
    }

    if (node.extendedBy) {
        body +=
            '<p>' +
            span('Extended by:', 'tag-name') +
            node.extendedBy
                .map((x) => render(x))
                .filter((x) => !!x)
                .join(', ') +
            '</p>';
    }

    if (node.implementedBy) {
        body +=
            '<p>' +
            span('Implemented by:', 'tag-name') +
            node.implementedBy
                .map((x) => render(x))
                .filter((x) => !!x)
                .join(', ') +
            '</p>';
    }

    return section(result + div(body) + renderGroups(node), { permalink });
}

/**
 * Classes and interfaces are usually rendered as a header, some comment,
 * followed by a card for each of its member.
 *
 * However, if the interface/class is 'simple' (all members are properties
 * or all members are methods, and few comments) the class/interface
 * is rendered as a single card.
 * The decision is made in renderClassSection()
 */

function renderClassCard(node) {
    if (shouldIgnore(node) || !node.children) return '';
    let comment = renderComment(node, 'block');
    if (comment) comment += '\n<hr>\n';
    let body = '';
    if (node.children) {
        body =
            '<dl><dt id="' +
            node.children
                .map((x) => {
                    const permalink = makePermalink(x);
                    let r = encodeURIComponent(permalink.anchor) + '">';
                    if (x.kind === 2048) {
                        // Method
                        r +=
                            x.signatures
                                .map((signature) => {
                                    let sigResult =
                                        renderFlags(x, 'inline') +
                                        '<strong>' +
                                        x.name +
                                        '</strong>';
                                    if (hasFlag(x, 'isOptional')) {
                                        sigResult += span('?', 'modifier');
                                    }
                                    sigResult +=
                                        renderPermalinkAnchor(permalink) +
                                        render(signature) +
                                        '</dt><dd>' +
                                        renderComment(signature, 'block');
                                    return sigResult;
                                })
                                .join('</dd><dt>') + '</dd>';
                    } else if (x.kind === 1024) {
                        // Property
                        r += '<strong>' + x.name + '</strong>';
                        if (hasFlag(x, 'isOptional')) {
                            r += span('?', 'modifier');
                        }
                        r +=
                            punct(': ') +
                            render(x.type) +
                            renderPermalinkAnchor(permalink) +
                            '</dt><dd>' +
                            renderComment(x, 'block');
                    } else {
                        // Only expected a property or a method
                        // in a "short" class/interface
                        console.error(
                            'Unexpected item in a "short" class/interface'
                        );
                    }
                    return r;
                })
                .join('\n</dd><dt id="');
        body += '\n</dd></dl>\n';
    }
    return renderCard(node, getQualifiedName(node), comment + body);
}

/**
 * A command is identified by a selector and dispatched with another
 * function, for example the "selectAll" selector and `perform("selectAll")`
 * A command can be specified either as a property (of type function) or a
 * function (typically in an interface).
 * The @command tag on the interface indicates that the properties/methods
 * of the interface should be interepreted as methods.
 */
function renderCommandCard(node) {
    const parent = getParent(node);
    const commandTag = (
        getTag(node, 'command') || getTag(parent, 'command')
    ).trim();
    if (!commandTag) return '';

    let signature;
    if (node.kind === 1024) {
        // It's a property
        if (!node.type.declaration) return '';
        signature = node.type.declaration.signatures[0];
    } else if (node.kind === 2048) {
        // A method
        signature = node.signatures[0];
    } else {
        return '';
    }
    const params = [...signature.parameters];

    let result = commandTag + punct('(');
    params.shift(); // The sender
    if (params.length > 0) {
        result += punct('[');
        result += span('"' + node.name + '"', 'string-literal');
        result += punct(', ');
        result += params.map((x) => render(x)).join(punct(', '));
        result += punct(']');
    } else {
        // No extra params, just the selector
        result += span('"' + node.name + '"', 'string-literal');
    }
    result += punct(')');
    if (signature.type) {
        result += punct(': ');
        result += render(signature.type);
    }

    if (params.length > 0 || signature.type) {
        result += '\n<dl>\n';

        if (params.length > 0) {
            // Display each of the additional parameters, and their info
            result +=
                '\n<dt>\n' +
                params
                    .map((param) => {
                        let r =
                            '<strong><var>' + param.name + '</var></strong>';
                        const typeDef = render(param.type, 'block');
                        if (typeDef) {
                            r += punct(': ') + typeDef;
                        }
                        r += '\n</dt><dd>\n';
                        r += renderComment(param, 'block');
                        return r;
                    })
                    .join('\n</dd><dt>\n');
            result += '\n</dd>\n';
        }
        if (signature.type && hasTag(node, 'returns')) {
            // The is a return type
            result += '\n<dt>\n';
            result += '<strong>→ </strong>' + render(signature.type);
            result += '\n</dt><dd>\n';
            if (hasTag(node, 'returns')) {
                result += renderNotices(node, getTag(node, 'returns'));
            }
            result += '\n</dd>\n';
        }
        result += '\n</dl>\n';
    }
    result = div(result, 'code');

    return renderCard(
        node,
        // Note: the '&#8203;' (zws) after 'command' is important to ensure
        // that double-clicking on the name selects only the name
        span('command', 'modifier-tag') +
            '<strong>' +
            '&#8203;' +
            node.name +
            '</strong>',
        result + renderComment(node, 'block')
    );
}

/**
 * Interfaces and classes have properties (which can be functions)
 * This renders a card for a property
 * kind = 1024
 */
function renderPropertyCard(node) {
    if (shouldIgnore(node)) return '';

    // The @command tag can be placed either on each individual entry
    // or on the interface/class that groups them
    const result = renderCommandCard(node);
    if (result) return result;

    const parent = getParent(node);
    let displayName = '';
    let shortName = '';
    if (parent && (parent.kind & (1 | 2 | 4 | 128 | 256)) !== 0) {
        // Parent is a module, namespace, enum, class or interface
        // Function or method
        shortName = `<strong>${node.name}</strong>`;
        displayName = parent.name + '.' + shortName;
    }
    return renderCard(
        node,
        displayName,
        render(node.type, 'block') + renderComment(node, 'block')
    );
}

/**
 * A card for an enum
 * kind = 4
 */
function renderEnumCard(node: Reflection): string {
    if (shouldIgnore(node)) return '';
    let comment = renderComment(node, 'block');
    let body = '';
    if (node.children) {
        if (comment) comment += '\n<hr>';
        body += '\n<dl>';
        body += node.children
            .map((enumMember) => {
                return render(enumMember, 'block');
            })
            .join('');
        body += '</dl>';
    }
    return renderCard(node, '', comment + body);
}

function renderTypeAliasCard(node: Reflection): string {
    if (shouldIgnore(node)) return '';
    let result = renderComment(node, 'block');
    const typeDef = render(node, 'block');
    if (typeDef) {
        if (result) {
            result += '\n<hr>\n';
        }
        result += div(typeDef, 'code');
    }
    return renderCard(node, '', result);
}

/**
 * Groups are a collection of related items (for example all variables,
 *  all types, all functions, etc...) while `node.children` are all
 * of these items, but in their declaration order.
 *
 * Only used when in 'card' style.
 *
 * Groups have a 'children' property which is an array of ID
 *  referring to the items
 */
function renderGroup(node: Reflection, group: Reflection): string {
    const topics = getCategories(node, group.kind);
    // If there are any children, there should always be at least
    // one "Other" topic
    if (topics.length === 0) return '';
    // Render heading for group, e.g. "Types"... and index
    let header = '';
    if (
        group.kind !== 512 && // 'Constructors'
        group.kind !== 262144 && // 'Accessors'
        group.kind !== 4 // 'Namespaces'
    ) {
        if (
            (group.kind === 1024 || group.kind === 2048) &&
            hasTag(node, 'command')
        ) {
            // It's a series of commands. Display the index, but no title
            header += renderIndex(node, '', topics);
        } else if (
            (group.kind & (2 | 4 | 128 | 256)) === 0 &&
            group.children.length > 1
        ) {
            // A group of things other than namespaces, enums, classes or
            // interfaces
            // with more than single entry
            const displayTitle = {
                1: 'Modules',
                2: 'Namespaces',
                4: 'Enums',
                32: 'Variables',
                64: 'Functions',
                128: 'Classes',
                245: 'Interfaces',
                4194304: 'Types',
            }[group.kind];
            header += renderIndex(node, displayTitle, topics);
        }
    }
    const body = topics
        .map((topic) => {
            let r = '';
            if (topic.title) {
                r = heading(3, '', topic.title, null, {
                    className: 'category-title',
                });
            }
            r += topic.children.map((x) => render(x, 'section')).join('');
            return r;
        })
        .join('');
    if (!body) return '';
    return section(header + body);
}

function renderGroups(node: Reflection): string {
    if (!node.groups) return '';
    const groups = sortGroups(node.groups);
    return (
        renderComment(node, 'section') +
        groups
            .map((x) => renderGroup(node, x))
            .filter((x) => !!x)
            .join('\n\n')
    );
}

/**
 * Render a reflection (an 'element'), such as a module, a variable, a type declaration,
 * an argument list, a type definition, etc...
 *
 * @param style One of:
 * - 'inline' keep all the output info in a single line
 * - 'block' if necessary, use multiple lines to render
 * - 'card' for some types (function definition), display them using a 'card'
 * section. This allows the most info to be displayed, including comments about
 * this item.
 */
function render(node: Reflection | number, style = 'inline'): string {
    // See https://github.com/TypeStrong/typedoc/blob/master/src/lib/models/reflections/abstract.ts
    // for a list of the possible reflection kinds

    // On occasion, some nodes are not reachable by traversing the
    // tree. In this case, getReflectionById() fails and render()
    // can get called with an undefined node. Fail gracefully.
    // This happens for example with
    // ```
    //   export function foo(options: {
    //        withHighlighting: boolean;
    //    }) : boolean
    // ```
    // 'withHighlighting' is a variable, but unreachable

    if (typeof node === 'undefined') return '';
    if (typeof node === 'number') node = getReflectionByID(node);
    if (typeof node === 'string') node = getReflectionByName(node);

    // If there are groups (i.e. all methods for a class), use them.
    // Otherwise, node.children will have the full list, but not grouped by 'kind'.
    if (style === 'section' && node.groups) {
        if (node.kind === 128 || node.kind === 256) {
            // Class or Interface
            return renderClassSection(node);
        } else if (node.kind === 4) {
            // Enum
            return renderEnumCard(node);
        } else if (node.kind === 1) {
            // Modules
            const permalink = makePermalink(node);

            const result =
                heading(2, '', getQualifiedName(node), permalink) +
                renderGroups(node);

            return section(result, { permalink });
        }
        return renderGroups(node);
    }

    const parent = getParent(node);

    if (typeof node.kind === 'undefined') {
        if (node.type === 'abstract') {
            // @todo
            /*
abstract class Animal {
    abstract makeSound(): void;
    move(): void {
        console.log("roaming the earth...");
    }
}
*/ console.error(
                'Unexpected node type ',
                node.type
            );
        }

        if (node.type === 'array') {
            // @check (number | string)[]
            return render(node.elementType, 'inline') + punct('[]');
        }

        if (node.type === 'conditionals') {
            // @todo
            // 'T extends U ? X : Y'
            console.error('Unexpected node type ', node.type);
        }

        if (node.type === 'index') {
            console.error('Unexpected node type ', node.type);
        }

        if (node.type === 'indexedAccess') {
            // e.g. 'T[U]'
            return (
                render(node.objectType) +
                punct('[') +
                render(node.indexType) +
                punct(']')
            );
        }

        if (node.type === 'inferred') {
            console.error('Unexpected node type ', node.type);
        }

        if (node.type === 'intersection') {
            if (style === 'block') {
                return (
                    '<ul class="type-block"><li>' +
                    node.types
                        .map((x) => render(x, 'block'))
                        .filter((x) => !!x)
                        .join(punct(' &amp; ') + '</li>\n<li>') +
                    '</li></ul>'
                );
            }
            return node.types
                .map((x) => render(x))
                .filter((x) => !!x)
                .join(punct(' &amp; '));
        }

        if (node.type === 'intrinsic') {
            // E.g. "number", "string", etc...
            return keyword(node.name);
        }

        if (node.type === 'predicate') {
            console.error('Unexpected node type ', node.type);
        }

        if (node.type === 'reference') {
            // E.g. the name of another type
            // For example, T in 'f(a:T)'

            let typeArguments = '';
            if (node.typeArguments) {
                typeArguments =
                    punct('&lt;') +
                    node.typeArguments.map((x) => render(x)).join(punct(', ')) +
                    punct('&gt;');
            }

            // Enum, Class, Interface, TypeAlias
            let candidate;
            if (typeof node.id !== 'undefined') {
                candidate = getReflectionByID(node.id);
            }

            if (!candidate) {
                // Find by name in the parent space
                candidate = getReflectionByName(
                    node.name,
                    parent,
                    4 | 128 | 256 | 4194304
                );
            }
            if (candidate) {
                return (
                    renderPermalink(
                        makePermalink(candidate),
                        candidate.kind === 16
                            ? // For enum members, include the parent (the Enum) name
                              parent.name + '.' + node.name
                            : node.name
                    ) + typeArguments
                );
            }

            // Find by name in the global space
            candidate = getReflectionByName(
                node.name,
                undefined,
                4 | 128 | 256 | 4194304
            );
            if (candidate) {
                return (
                    renderPermalink(makePermalink(candidate), node.name) +
                    typeArguments
                );
            }
            if (candidate) {
                return node.name + typeArguments; // Don't render, it's a reference, we just need its name
            }

            if (
                [
                    'Object',
                    'Function',
                    'Boolean',
                    'Symbol',
                    'String',
                    'RegExp',
                    'Object',
                    'Number',
                    'BigInt',
                    'Math',
                    'Date',
                    'Infinity',
                    'NaN',
                    'globalThis',
                    'Error',
                    'AggregateError',
                    'InternalError',
                    'RangeError',
                    'ReferenceError',
                    'SyntaxError',
                    'TypeError',
                    'URIError',
                    'Array',
                    'Int8Array',
                    'Uint8Array',
                    'Uint8Array',
                    'Uint8ClampedArray',
                    'Int16Array',
                    'Uint16Array',
                    'Int32Array',
                    'Uint32Array',
                    'Float32Array',
                    'Float64Array',
                    'BigInt64Array',
                    'BigUint64Array',
                    'Map',
                    'Set',
                    'WeakMap',
                    'WeakSet',
                    'ArrayBuffer',
                    'SharedArrayBuffer',
                    'Atomics',
                    'DataView',
                    'JSON',
                    'Promise',
                    'Generator',
                    'GeneratorFunction',
                    'AsyncFunction',
                    'Iterator',
                    'AsyncIterator',
                    'Reflect',
                    'Proxy',
                    'Intl',
                    'WebAssembly',
                ].includes(node.name)
            ) {
                return (
                    '<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/' +
                    node.name +
                    '" class="externallink">' +
                    node.name +
                    '<svg><use xlink:href="#external-link"></use></svg>' +
                    '</a>' +
                    typeArguments
                );
            }

            // We could not resolve this reference.
            // This can happen for globally defined types, for example
            // 'KeyboardEvent'
            // In that case, create a link to reference documentation
            return (
                '<a href="https://developer.mozilla.org/Web/API/' +
                node.name +
                '" class="externallink">' +
                node.name +
                '<svg><use xlink:href="#external-link"></use></svg>' +
                '</a>' +
                typeArguments
            );
        }

        if (node.type === 'reflection') {
            return render(node.declaration, style);
        }

        if (node.type === 'stringLiteral') {
            return span('"' + node.value + '"', 'string-literal');
        }

        if (node.type === 'tuple') {
            return (
                punct('[') +
                node.elements
                    .map((x) => render(x))
                    .filter((x) => !!x)
                    .join(punct(', ')) +
                punct(']')
            );
        }

        if (node.type === 'typeOperator') {
            // e.g.. 'typeof'
            return keyword(node.operator + ' ') + render(node.target);
        }

        if (node.type === 'typeParameter') {
            // The name of a referenced type, e.g.
            // 'U' in 'T[U]'
            let result = renderPermalink(makePermalink(node));
            if (node.constraint) {
                result += keyword(' extends ');
                result += render(node.constraint);
            }
            return result;
        }

        if (node.type === 'union') {
            // E.g. "a | b"
            if (style === 'block' && !everyStringLiteral(node.types)) {
                return (
                    '<ul class="type-block"><li>' +
                    punct('| ') +
                    node.types
                        .map((x) => render(x))
                        .join('</li>\n<li>' + punct('| ')) +
                    '</li></ul>'
                );
            }
            return node.types.map((x) => render(x)).join(punct(' | '));
        }

        if (node.type === 'unknown') {
            // This is used when the type is... not known. For example in
            // `export const PI = 3.1415`, the type is 'unknown' (which has a 'name'
            // value of "3.1415"
            return '';
        }

        if (node.type === 'void') {
            return keyword('void');
        }
    }

    let result = '';

    switch (node.kind) {
        case 0: // Global/File
        case 1: // Module
        case 2: // Namespace
        case 4: // Enum
            // We always do it by groups
            console.assert(
                'Unexpected node kind ',
                Number(node.kind).toString()
            );
            break;

        case 16: // Enum Member
            result = `<dt id="${encodeURIComponent(
                makePermalink(node).anchor
            )}">`;
            result += '<strong>' + node.name + '</strong>';
            if (typeof node.defaultValue === 'string') {
                result += punct(' = ') + node.defaultValue;
            }
            result += '</dt><dd>';
            result += renderFlags(node);
            result += renderComment(node, style);
            result += '</dd>';
            break;

        case 32: // Variable
            // e.g. "a?: number" as a property of an object
            if (style === 'card' || style === 'section') {
                result = renderCard(
                    node,
                    '',
                    div(render(node, 'block')) + renderComment(node, 'block')
                );
            } else {
                result += '<strong>' + node.name + '</strong>';
                if (hasFlag(node, 'isOptional')) {
                    result += span('?', 'modifier');
                }
                if ((node.type as Reflection)?.type === 'unknown') {
                    result += punct(' = ');
                    result += (node.type as Reflection).name || '';
                }
                if ((node.type as Reflection)?.type !== 'unknown') {
                    result += punct(': ');
                    result += render(node.type as Reflection);
                }
            }
            break;

        case 64: // Function
            if (style === 'card' || style === 'section') {
                result = renderMethodCard(node);
            } else {
                console.warn('Unexpected style, kind ', node.kind);
            }
            break;

        case 128: // Class
            if (style === 'card' || style === 'section') {
                // Classes are usually rendered as a 'section' in renderClassSection()
                // but if it's a very simple interface (uniform kind of children, few comments)
                // we'll render it as a single card
                // The decision is made in renderClassSection()

                result = renderClassCard(node);
            } else {
                result = node.name;
            }
            break;

        case 256: // Interface
            if (style === 'card' || style === 'section') {
                // Interfaces are usually rendered as a 'section' in renderClassSection()
                // but if it's a very simple interface (uniform kind of children, few comments)
                // we'll render it as a single card
                // The decision is made in renderClassSection()

                result = renderClassCard(node);
            } else {
                result = node.name;
            }
            break;

        case 512: // Constructor
            if (style === 'card' || style === 'section') {
                result = renderMethodCard(node);
            } else {
                console.warn('Unexpected style, kind ', node.kind);
            }
            break;

        case 1024: // Property (of a class or interface)
            if (style === 'card' || style === 'section') {
                result = renderPropertyCard(node);
            } else {
                result =
                    (parent ? parent.name + '.' : '') +
                    node.name +
                    punct(': ') +
                    render(node.type as Reflection, style);
            }
            break;

        case 2048: // Method (of a class or interface) (may have multiple signatures)
            if (style === 'card' || style === 'section') {
                result = renderMethodCard(node);
            } else {
                console.error('Function Signature style not supported');
            }
            break;

        case 4096: // Call signature
        case 16384: // Constructor signature
            // E.g. in 'f(a: T): U', the '(a: T):U' part.
            if (style === 'inline') {
                // (a:b) : c
                result = punct('(');
                if (node.parameters) {
                    result += node.parameters
                        .map((x) => render(x))
                        .join(punct(', '));
                }
                result += punct(')');
                result += punct(': ') + render(node.type as Reflection);
            } else if (style === 'block') {
                // Display info for each param:
                // - a: b blah blah
                // - -> c blah blah
                if (node.parameters || node.type) {
                    result += '\n<dl>\n';
                    if (node.parameters) {
                        result +=
                            '\n<dt>\n' +
                            node.parameters
                                .map((param) => {
                                    let r =
                                        '<strong><var>' +
                                        param.name +
                                        '</var></strong>';
                                    const typeDef = render(
                                        param.type as Reflection,
                                        'block'
                                    );
                                    if (typeDef) {
                                        r += punct(': ') + typeDef;
                                    }
                                    r += '\n</dt><dd>\n';
                                    r += renderComment(param, style);
                                    return r;
                                })
                                .join('\n</dd><dt>\n');
                        result += '\n</dd>\n';
                    }
                    if (
                        node.type &&
                        (node.comment?.returns ||
                            !isVoid(node.type as Reflection))
                    ) {
                        result += '\n<dt>\n';
                        result +=
                            '<strong>→ </strong>' +
                            render(node.type as Reflection);
                        result += '\n</dt><dd>\n';
                        if (node.comment?.returns) {
                            result += renderNotices(node, node.comment.returns);
                        }
                        result += '\n</dd>\n';
                    }
                    result += '\n</dl>\n';
                }
            } else {
                console.error('Call signature style not supported');
            }
            break;

        case 8192: // Index signature
            // E.g. "[key: string]" in "{[key: string]}"
            result +=
                punct('[') +
                node.parameters.map((x) => render(x)).join(punct(', ')) +
                punct(']');
            result += punct(': ') + render(node.type as Reflection);
            break;

        // case 16384: // Constructor signature
        // console.warn('Unexpected kind ', node.kind);
        // break;

        case 32768: // Parameter
            // E.g. "foo: string" in "[foo: string]: string"
            // Also "a:T" in "f(a:T)"
            if (hasFlag(node, 'isRest')) {
                result += span('...', 'modifier');
            }
            result += `<var>${node.name}</var>`;
            if (hasFlag(node, 'isOptional')) {
                result += span('?', 'modifier');
            }
            result += punct(': ') + render(node.type as Reflection);
            break;

        case 65536: // Type literal
            // e.g. '{...}' or  '(x: string) => boolean'
            if (node.signatures) {
                result += node.signatures
                    .map((x) => render(x))
                    .join(punct('; '));
            } else if (node.children || node.indexSignature) {
                // E.g. `{ p: T; q: U }`
                if (style === 'block' || style === 'block-inherit') {
                    result += '<div><dl>';
                    if (node.children) {
                        result +=
                            '<dt>' +
                            node.children
                                .map((x) => {
                                    let dt = render(x) + punct(';');
                                    if (hasTag(x, 'deprecated')) {
                                        dt = span(dt, 'deprecated');
                                    }
                                    const dd =
                                        renderFlags(x) +
                                        renderComment(x, style);
                                    return dt + '</dt><dd>' + dd;
                                })
                                .join('</dd><dt>');
                        result += '</dd>';
                    }
                    if (node.indexSignature) {
                        result += '<dt>';
                        result += node.indexSignature
                            .map((x) => render(x))
                            .join(punct(';') + '</dt><dd>');
                        result += '</dd>';
                    }
                    result += '</dl>' + '</div>';
                } else if (style === 'inline') {
                    result += punct('{');
                    if (node.children) {
                        result += node.children
                            .map((x) => render(x))
                            .join(punct('; '));
                    }
                    if (node.indexSignature) {
                        result += node.indexSignature
                            .map((x) => render(x))
                            .join(punct('; '));
                    }
                    result += punct('}');
                } else {
                    console.error('Unexpected style for Type Literal');
                }
            }
            break;

        case 131072: // Type parameter
            result += node.name;
            if (node.type) {
                result += keyword(' extends ');
                result += render(node.type as Reflection);
            }
            break;
        case 524288: // Get signature
        case 1048576: // Set signature
            // The signature for the get/set should never be rendered.
            // They are aggregated in their parent 'Accessor' node
            console.warn('Unexpected kind ', node.kind);
            break;
        case 262144: // Accessor (get/set)
            if (style === 'card' || style === 'section') {
                result = renderAccessorCard(node);
            } else {
                console.warn('Unexpected style, kind ', node.kind);
            }
            break;
        case 2097152: // Object literal
            console.warn('Unexpected style, kind ', node.kind);
            break;

        case 4194304: // Type Alias
            // e.g. 'type foo = string';
            if (style === 'card' || style === 'section') {
                result = renderTypeAliasCard(node);
            } else {
                const def = render(node.type as Reflection, style);
                result = '';
                if (node.typeParameter) {
                    result += punct('&lt;');
                    result += node.typeParameter
                        .map((typeParam) => render(typeParam))
                        .join(punct(', '));
                    result += punct('&gt;');
                    if (def) {
                        result += punct(' = ');
                    }
                }
                result += def;
            }
            break;

        case 8388608: // Event
            console.warn('Unexpected style, kind ', node.kind);
            break;

        default:
            console.warn('Unexpected kind ', node.kind);
    }

    return result;
}

function getReflectionsFromFile(src: string[], options: Options): Reflection {
    let result = {};
    const app = new TypeDoc.Application();

    // If you want TypeDoc to load tsconfig.json / typedoc.json files
    app.options.addReader(new TypeDoc.TSConfigReader());
    app.options.addReader(new TypeDoc.TypeDocReader());

    app.bootstrap({
        logger: (message, _level, _newline) => console.log(message),
        mode: 'modules', // or 'file', 'modules' or 'library'

        target: 'es2017',
        module: 'ESNext',
        experimentalDecorators: true,

        // To properly resolve 'import' statements
        moduleResolution: 'node',

        noEmit: 'true',

        // We want to preserve the internals in the AST
        // and we'll strip/hide them separately
        stripInternal: false,

        // To process .d.ts files
        includeDeclarations: true,

        // To exclude references from external files
        excludeExternals: true,
    });

    src = app.expandInputFiles(src.map((x) => path.resolve(path.normalize(x))));

    const convertResult = app.converter.convert(src);
    if (convertResult.errors?.length) {
        app.logger.diagnostics(convertResult.errors);
        if (options.ignoreErrors) {
            app.logger.resetErrors();
        } else {
            return undefined;
        }
    }

    if (convertResult.project) {
        result = app.serializer.projectToObject(convertResult.project);
    }

    return result as Reflection;
}

function applyTemplate(
    src: string | ((substitutions: { [key: string]: any }) => string),
    substitutions: { [key: string]: any }
): string {
    if (typeof src === 'string') {
        Object.keys(substitutions).forEach((key) => {
            if (typeof substitutions[key] === 'string') {
                src = (src as string).replace(
                    new RegExp('{{' + key + '}}', 'g'),
                    substitutions[key]
                );
            }
        });
        return src;
    }
    if (typeof src === 'function') {
        return src(substitutions);
    }
    return '';
}

let gNodes: Reflection;

let gOptions: Options;

/**
 *  Main entry point
 *
 */

export function grok(
    src: string[],
    options: Options
): { [file: string]: string } {
    try {
        gOptions = options;
        gNodes = getReflectionsFromFile(src, options);

        const sdkName = options.sdkName ?? '';
        const packageName = options.sdkName ?? gNodes.name ?? '';

        let content;
        if (options.modules) {
            const modules = options.modules
                .map((x) => getReflectionByName(x, gNodes, 1))
                .filter((x) => !!x);
            if (modules.length === 0) {
                console.warn('Modules not found: ', options.modules.join(', '));
            } else if (modules.length !== options.modules.length) {
                const moduleNames = modules.map((x) => getName(x));
                console.warn(
                    'Module not found: ' +
                        options.modules
                            .filter((x) => !moduleNames.includes(x))
                            .join(', ')
                );
            }
            content = renderIndex(gNodes, 'Modules', [
                {
                    title: '',
                    children: modules,
                },
            ]);
            content += modules.map((x) => render(x, 'section')).join('');
            content = section(content);
        }
        if (!content) content = render(gNodes, 'section');
        if (content) {
            const document = applyTemplate(options.documentTemplate, {
                packageName: escapeYAMLString(packageName),
                sdkName: escapeYAMLString(trimNewline(sdkName)),
                cssVariables: options.cssVariables,
                content,
            });
            return { [options?.outFile ?? 'index.html']: document };
        }
    } catch (err) {
        console.error(err);
    }
    return {};
}

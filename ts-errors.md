> Duplicate identifier 'function'
> const NUMERIC_KIND = {

    namespace: 2,
    enum: 4,
    variable: 32,
    function: 64,
    class: 128,
    interface: 256,
    instance: 1024 | 2048 | 262144, // property, method or getter/setter
    static: 1024 | 2048, // property or method
    function: 4096,
    type: 4194304,

};

> Cannot find name 'segment'. Did you mean 'segments'?

    for (segment of segments) {

> Cannot find name 'p2'.

    str = str.replace(
        /{@linkcode\s+(\S+?)\s*\|\s*(.+?)}/g,
        (_match, p1) =>
            `<a href="${resolveLink(node, p1)}"><code>${p2}</code></a>`
    );

> Cannot find name 'getReflectionByI'. Did you mean 'getReflectionByID'?

    if (typeof node === 'number') node = getReflectionByI(node);

> Cannot find name 'apiname'. Did you mean 'apiName'?

    if (apiName.endsWith('.d')) apiName = apiname.substring(2);

import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import { eslint } from 'rollup-plugin-eslint';
import pkg from '.././package.json';
// import copy from 'rollup-plugin-copy';

process.env.BUILD = process.env.BUILD || 'development';
const PRODUCTION = process.env.BUILD === 'production';
const BUILD_ID =
    Date.now().toString(36).slice(-2) +
    Math.floor(Math.random() * 0x186a0).toString(36);

const TYPESCRIPT_OPTIONS = {
    typescript: require('typescript'),
    clean: PRODUCTION,
    tsconfigOverride: {
        compilerOptions: {
            declaration: false,
        },
    },
};

const TERSER_OPTIONS = {
    compress: {
        drop_console: false,
        drop_debugger: true,
        ecma: 8, // Use "5" to support older browsers
        module: true,
        warnings: true,
        passes: 2,
        global_defs: {
            ENV: JSON.stringify(process.env.BUILD),
            VERSION: JSON.stringify(pkg.version || '0.0'),
            BUILD_ID: JSON.stringify(BUILD_ID),
        },
    },
};
export default [
    {
        input: 'src/grok-cli.ts',
        output: {
            file: 'bin/grok-cli',
            format: 'cjs',
            banner: '#!/usr/bin/env node',
            sourcemap: !PRODUCTION,
        },
        plugins: [
            resolve({
                preferBuiltins: true,
            }),
            PRODUCTION && eslint(),
            typescript(TYPESCRIPT_OPTIONS),
            PRODUCTION && terser(TERSER_OPTIONS),
            // copy({
            //     targets: [{ src: 'package.json', dest: 'bin' }],
            // }),
        ],
        watch: {
            clearScreen: true,
            exclude: 'node_modules/**',
            include: ['src/**', 'examples/**'],
        },
    },
    {
        input: 'src/grok.ts',
        output: {
            file: 'bin/grok.js',
            format: 'cjs',
            sourcemap: !PRODUCTION,
        },
        plugins: [
            resolve({
                preferBuiltins: true,
            }),
            PRODUCTION && eslint(),
            typescript(TYPESCRIPT_OPTIONS),
            PRODUCTION && terser(TERSER_OPTIONS),
        ],
        watch: {
            clearScreen: false,
            exclude: ['node_modules/**'],
        },
    },
];

/*
amd – Asynchronous Module Definition, used with module loaders like RequireJS
cjs – CommonJS, suitable for Node and other bundlers
esm – Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers
iife – A self-executing function, suitable for inclusion as a <script> tag. (If you want to create a bundle for your application, you probably want to use this.)
umd – Universal Module Definition, works as amd, cjs and iife all in one
system – Native format of the SystemJS loader
*/

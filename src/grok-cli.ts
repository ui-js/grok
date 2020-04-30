const pkg = require('./package.json');
require('please-upgrade-node')(pkg);

const updateNotifier = require('update-notifier');
// Display an update message
// if a more recent version of the package is available.
updateNotifier({ pkg, shouldNotifyInNpmScript: true }).notify();

const { cosmiconfigSync } = require('cosmiconfig');
const configParser = cosmiconfigSync('grok');
const path = require('path');
const fs = require('fs-extra');

import { grok } from './grok';
import { terminal } from './terminal';

/**
 * Merge "source" into object by doing a deep copy of enumerable properties.
 */
function mergeObject(object: object, source: object): object {
    if (object === source) return;
    if (!source) return;
    Object.keys(source).forEach((key) => {
        if (Array.isArray(source[key])) {
            if (!object[key]) object[key] = [];
            object[key] = [...object[key], ...source[key]];
        } else if (typeof source[key] === 'object') {
            // Object literal
            if (!object[key]) object[key] = {};
            mergeObject(object[key], source[key]);
        } else if (typeof source[key] !== 'undefined') {
            object[key] = source[key];
        }
    });
}

function outputResult(
    outDir: string,
    result: { [file: string]: string }
): void {
    fs.mkdir(outDir, { recursive: true });
    Object.keys(result).forEach((x) => {
        fs.writeFileSync(
            path.resolve(path.normalize(path.join(outDir, x))),
            result[x]
        );
    });
}

function build(argv): void {
    try {
        let options = {
            sdkName: 'module',
            verbose: false,
            documentTemplate: `<!doctype html>
<html class="no-js" lang="">

<head>
    <meta charset="utf-8">
    <title>{{sdkName}} -- {{packageName}}</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="manifest" href="site.webmanifest">
    <link rel="apple-touch-icon" href="icon.png">
    <style>
    .sr-only {
        position: absolute !important;
        clip: rect(1px, 1px, 1px, 1px);
        height: 1px !important;
        width: 1px !important;
        border: 0 !important;
        overflow: hidden; 
    }
        svg {
        width: 1em;
        height: 1em;
    }
    /* For the sub-heading */
    h2 em {
        display: block;
        font-size: 0.7rem;
        line-height: .8;
        font-style: normal;
    }
    
    /* For the "main" symbol in the heading */
    h2 strong {
        font-weight: 700;
    }      
    </style>

</head>

<body>
    <svg xmlns="http://www.w3.org/2000/svg" style="display:none">
    <defs>
        <symbol id='link' viewBox="0 0 512 512" >
            <path fill="currentColor" d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z">
            </path>
        </symbol>
        <symbol id='external-link' viewBox="0 0 512 512">
            <path fill="currentColor" d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM474.67,0H316a28,28,0,0,0-28,28V46.71A28,28,0,0,0,316.79,73.9L384,72,135.06,319.09l-.06.06a24,24,0,0,0,0,33.94l23.94,23.85.06.06a24,24,0,0,0,33.91-.09L440,128l-1.88,67.22V196a28,28,0,0,0,28,28H484a28,28,0,0,0,28-28V37.33h0A37.33,37.33,0,0,0,474.67,0Z">
            </path>
        </symbol>
    </defs>
    </svg>
    {{content}}
</body>    
</html>
`,
        };

        //
        // 1. Load from 'standard' config locations
        //
        let configResult = configParser.search();
        if (!!configResult?.config) {
            mergeObject(options, configResult.config);
        }

        //
        // 2. If a config file is specified, merge with previous config
        //
        if (argv['config']) {
            configResult = configParser.load(argv['config']);
            if (!!configResult?.config) {
                mergeObject(options, configResult.config);
            }
        }

        //
        // 3. If command-line options are specified, merge with previous config
        //

        mergeObject(options, argv);

        //
        // 4. Process the command
        //
        if (!argv['paths'] || argv['paths'].length < 1) {
            console.error(
                terminal.error() +
                    `Expected at least one path to a directory or TypeScript declaration file.\n` +
                    `    Use ${terminal.keyword(
                        argv.$0 + ' help'
                    )} for available options.\n`
            );
            process.exit(1);
        }

        outputResult(options['outDir'] || '.', grok(argv['paths'], options));
    } catch (err) {
        console.error(err);
    }
}

function buildOptions(yargs): void {
    yargs
        .positional('<path>', {
            describe: 'Path to a TypeScript declaration file or directory',
            type: 'path',
        })
        .normalize('path')
        .option('sdkName', {
            describe: 'Name of the API/Library/Module being documented',
            type: 'string',
        })
        .option('outFile', {
            describe: 'Save output to file (in outDir)',
            type: 'path',
        })
        .normalize('outFile')
        .option('outDir', {
            alias: 'o',
            describe: 'Save output to path',
            type: 'path',
        })
        .normalize('outDir')
        .option('config', {
            describe: 'Load config file from path',
            type: 'path',
        })
        .normalize('config')
        .option('verbose', {
            describe: 'Display additional information during processing',
            type: 'boolean',
        })
        .option('no-color', {
            describe: 'Suppress color output in terminal',
            type: 'boolean',
        })
        .option('ignore-errors', {
            alias: 'i',
            describe: 'Attempt to continue when an error is encountered',
            type: 'boolean',
        });
}

require('yargs')
    .usage('Usage: $0 file(s) [options]')
    .example(
        '$0 ./src/index.d.ts -o ./build/index.html',
        'Generate a HTML documentation page from a TypeScript declaration file'
    )
    .command(
        ['* <paths..>', 'build <paths..>'],
        'Build documentation',
        buildOptions,
        build
    )
    .command(
        'help',
        'Show help',
        () => {
            return;
        },
        (yargs) => yargs.help()
    )

    .help('h')
    .alias('h', 'help')
    .epilog('For more information, see https://github.com/ui-js/grok')
    .strict(true).argv;

#!/usr/bin/env node

// eslint-disable-next-line import/no-extraneous-dependencies
const { build } = require('esbuild');
build({
  entryPoints: ['src/grok-cli.ts'],
  outfile: 'bin/grok-cli.js',
  bundle: true,
  platform: 'node',
  external: ['./node_modules/*'],
  // logLevel: 'debug',
});

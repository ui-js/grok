#!/usr/bin/env node

// https://esbuild.github.io/api/

// eslint-disable-next-line import/no-extraneous-dependencies
const { build } = require('esbuild');
build({
  entryPoints: ['src/grok-cli.ts'],
  outfile: 'bin/grok-cli.js',
  bundle: true,
  platform: 'node',
  external: ['./node_modules/*'],
  banner: { js: '#!/usr/bin/env node' },
  minify: true,
  // logLevel: 'debug',
});

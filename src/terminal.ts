const chalk = require('chalk');
const ciInfo = require('ci-info');

//
// Terminal colors for various kind of messages
//
const tcOrange = '#ffcc00';
const tcRed = '#fa2040';
const tcBlue = '#6ab3ff';
const tcPurple = '#d1d7ff';

/** Do not use fancy color output if the output stream is not a terminal
 * (e.g. if we're redirecting errors to a log file) or when in a CI environment.
 * Note that the debug console in VSCode returns 'undefined' for isTTY.
 */
let gUseColor = (process.stdout.isTTY ?? false) && !ciInfo.isCI;

export const terminal = {
  useColor: (flag: boolean): void => {
    gUseColor = flag;
  },
  autoFormat: (m: string): string => {
    return m
      .replace(/("(.*)")/g, (x) => {
        return terminal.string(x.slice(1, -1));
      })
      .replace(/(`(.*)`)/g, (x) => {
        return terminal.keyword(x);
      });
  },
  success: (m = ''): string => {
    chalk.green('✔︎   ' + m);
    return gUseColor ? chalk.bold.green('✔︎   ' + m) : '✔︎   ' + m;
  },
  error: (m = ''): string => {
    return gUseColor ? chalk.hex(tcRed)(chalk.bold('✘   ' + m)) : '✘   ' + m;
  },
  warning: (m = ''): string => {
    return gUseColor
      ? chalk.hex(tcOrange)(chalk.bold('⚠️   ' + m))
      : '⚠   ' + m;
  },
  path: (m = ''): string => {
    return gUseColor ? chalk.hex(tcBlue).italic(m) : m;
  },
  keyword: (m = ''): string => {
    return gUseColor ? chalk.hex(tcOrange)(m) : m;
  },
  string: (m = ''): string => {
    return gUseColor
      ? chalk.hex(tcOrange)('"' + chalk.italic(m) + '"')
      : '"' + m + '"';
  },
  dim: (m = ''): string => {
    return gUseColor ? chalk.hex('#999')(m) : m;
  },
  time: (t = new Date()): string => {
    return gUseColor
      ? chalk.hex(tcPurple)(`[${t.toLocaleTimeString()}]`)
      : '[' + t + ']';
  },
  link: (m: string): string => {
    return gUseColor
      ? '\n▷   ' +
          chalk.hex(tcPurple)(
            'https://github.com/arnog/chromatic/docs/errors/' + m + '.md'
          )
      : '\n▷   https://github.com/arnog/chromatic/docs/errors/' + m + '.md';
  },
};

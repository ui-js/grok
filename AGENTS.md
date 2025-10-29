# Repository Guidelines

## Project Structure & Module Organization
- Core TypeScript sources live in `src/`; `src/grok-cli.ts` routes CLI flags into the generator logic in `src/grok.ts` and `src/terminal.ts`.
- `scripts/` contains the build and test automation, and `scripts/build.js` invokes esbuild to bundle the CLI.
- Compiled artifacts land in `bin/`. Test declaration fixtures sit under `test/*.d.ts` with golden outputs in `test/output/` for quick diffing.
- Bundling tweaks live in `config/rollup.config.js`.

## Build, Test, and Development Commands
- `npm run build` bundles the CLI into `bin/grok-cli.js`; run before linking or packing.
- `npm run dist` performs a production-lean build for release candidates.
- `npm run grok -- <input.d.ts> --outDir <dir>` executes the local CLI against a fixture for manual checks.
- `npm run test` re-generates documentation from every fixture; follow with `git diff test/output` to spot regressions.
- `npm run clean` removes `bin/` and stale outputs. `npm run coverage` runs the same harness, ready for CI coverage wiring.

## Coding Style & Naming Conventions
- TypeScript files use two-space indentation, CommonJS `require` where interoperability is needed, and descriptive suffixes (e.g., `*-cli.ts` for entrypoints).
- Prettier formatting derives from `@cortex-js/prettier-config`; run `npm run prettier` prior to opening a PR.
- ESLint governs the `src/*.ts` surface. Use `npm run lint` and address autofixable issues before pushing.

## Testing Guidelines
- Tests rely on deterministic output: add `test/<feature>-test.d.ts` fixtures and capture generated docs under `test/output/<feature>/`.
- Keep fixture names kebab-cased and mirror directories from the CLI invocation.
- When behavior changes intentionally, update the matching output and reference the delta in your PR description.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`chore: deps`, `doc: update readme` are in history); keep subjects under 60 characters and in the imperative mood.
- Each PR should include a short summary, linked issue when relevant, and a note on validation. Attach snippets or screenshots of affected documentation when the output shifts.

## Environment & Tooling Tips
- Target Node.js 16+; `scripts/build.sh` installs dependencies on demand, but prefer explicit `npm install` during local setup.
- esbuild drives the bundle, so re-run `npm run build` after touching dependency topology or CLI entry files. Adjust externals in `scripts/build.js` if the bundling strategy changes.

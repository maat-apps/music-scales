# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For the generic app structure this repo follows (folder layout, routing
pattern, i18n approach, naming conventions, testing split) see
[`maat-core/STRUCTURE.md`](https://github.com/maat-apps/maat-core/blob/main/STRUCTURE.md).
For the "verify each change exactly once" principle behind this repo's
automation setup, see
[`maat-core/VERIFICATION.md`](https://github.com/maat-apps/maat-core/blob/main/VERIFICATION.md).
What follows here is what's specific to **music-scales** — product intent and
scope are in [`PRODUCT.md`](./PRODUCT.md).

<!-- BEGIN AUTO-GENERATED: setup-claude-workflow -->
<!-- Only Project Snapshot and Commands below are ever rewritten by --refresh. -->

## Project Snapshot

- Vite + React + TypeScript, Tailwind v4, shadcn (`base-nova`).
- Mobile-only (`@maat-apps/ui`'s `MobileGate`, from `src/app/root.tsx`), like routines;
  portrait and landscape.

## Commands

| Purpose   | Command                 |
| --------- | ----------------------- |
| Dev       | `npm run dev`           |
| Build     | `npm run build`         |
| Lint      | `npm run lint:fix`      |
| Format    | `npm run format`        |
| Typecheck | `npm run typecheck`     |
| Unit test | `npm run test:coverage` |
| E2E test  | `npm run test:e2e`      |
| Validate  | `npm run validate`      |

<!-- Everything below is seeded once, then append-only — --refresh never rewrites it. -->

## Conventions

- Filenames: kebab-case everywhere, including components; component names
  inside a file stay PascalCase.
- Named exports throughout.
- Hooks (`use*`) live in `src/hooks/`, not `src/lib/` — `lib/` stays free
  of `react`/`react-dom` imports.
- A Playwright project's reusable test-helper file belongs at
  `e2e/utils.ts`, not `fixtures.ts` — these are plain functions specs call
  directly, not Playwright's own `test.extend()` fixture-injection system.
- **Music theory** lives in `src/lib/music/`, framework-free and fully
  unit-tested: `notes.ts` (a note is _spelled_ — letter + accidental — not
  just a pitch class; `noteName` does international vs Polish H/B),
  `scales.ts` (each scale is a list of degrees, `"1 2 ♭3 4 5 ♭6 ♭7"`, so
  spelling follows from the degree numbers; `spellScale` picks the root
  name needing fewer accidentals, a tie keeps the sharp), `chords.ts`
  (`diatonicChords`: stacked thirds per degree, 3 or 4 notes, named by
  their intervals in `CHORD_KINDS` — symbol and Roman-numeral suffix) and
  `keyboard.ts` (keys from C of the start octave, C4 = MIDI 60).
- **Sound**: `lib/synth.ts` — Web Audio, one triangle oscillator per note,
  the context created on the first tap (browsers only start audio from
  one). Keys play on `pointerdown` (and on a keyboard-triggered click).
- **Wake lock**: `lib/wake-lock.ts` (`screenWakeLock`, read through
  `hooks/use-wake-lock.ts`) keeps the user's intent and re-requests the
  lock on `visibilitychange` — the browser drops it whenever the page is
  hidden. `"unsupported"` hides the button.
- **Settings** (`lib/app-settings.ts`, `@maat-apps/core/persisted`,
  IndexedDB): `practice` (root, scale), `keyboard` (octaves,
  startOctave), `notation`, plus the lock and install state; every stored
  field is validated on load and falls back on its own.
- **Screen**: one view, `views/home/` — summary, `piano-keyboard.tsx`
  (keys styled by `globals.css`'s `.piano-key`: the key colours are this
  app's own, on top of the shared theme), `chord-list.tsx` (triads, then seventh chords); root/scale
  selects and the wake-lock button in `BottomBar`. In landscape the column
  widens (safe-area padding for the notch) and the app title becomes
  screen-reader-only so the keyboard fits above the bar. Settings is a
  drawer (`views/settings/`).
- **i18n.** `src/i18n/pl.json` and `en.json`, Polish the fallback; `t()`
  only accepts keys present in both (a unit test checks they match).
- **E2E** runs in Polish (`locale: "pl-PL"` in `playwright.config.ts`).
  `wake-lock.spec.ts` stubs `navigator.wakeLock` rather than relying on
  what a headless browser grants.
- **App lock.** Every maat-apps app has it (`@maat-apps/core/lock` +
  `@maat-apps/ui/app-lock-gate`, wrapped around the router in
  `src/app/router.tsx`). Scales keeps no user data, so its `data`
  adapter is empty; if it ever does, connect `data.rewrite`/`data.erase`
  to storage and encrypt with `src/lib/encryption-key.ts` (maat-core's
  `docs/storage.md`). **Never change `HKDF_INFO`** (`"music-scales-data-v1"`).
- Full pattern log: none yet — run `/learn-patterns` after a non-trivial
  session to start one.

## Workflow Rules

- Don't manually re-run lint/format/typecheck/build/test to double-check a
  change before committing — CI runs the full `npm run validate` gate on
  every PR; see `maat-core/VERIFICATION.md` for why running it twice is
  pure waste, not extra safety.
- Check the current branch before editing or committing anything — never
  edit or commit directly on `main`.
- Name branches `<type>/<short-descriptive-slug>` — see
  `maat-core/STRUCTURE.md`'s "Branch naming" section — not a generic or
  session-scoped name; cut a fresh branch per PR/task rather than reusing
  one across unrelated changes.
- Commit once a task's changes are complete, then use `/open-pr` to push
  and open the PR.

<!-- END AUTO-GENERATED: setup-claude-workflow -->

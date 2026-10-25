# ohmtools design — working notes

The design every ohmtools repo follows. Rules: `DESIGN.md`. Values: `tokens/`.
Generated from them: `shadcn/src/styles/ohmtools.css` (with the template
`shadcn/index.css`), `dist/*` and the colour table in
`DESIGN.md` (between the `tokens:` markers). How other repos use it:
`README.md`.

## Non-negotiables

- **A change here is a change for every app.** Change a token, a rule or an
  output format only when the user asks, and list first what it changes for
  which repo.
- **zeiteisen is the reference.** The rules come from it (its `CLAUDE.md`,
  "Global UI decisions", `src/components/NOTES.md`,
  `src/components/ui/NOTES.md`, `src/index.css`). The other repos (faltung,
  the LaTeX worksheet in claude-plugins) do not follow the design yet: never
  take a rule or a value from them.
- **Documents and reading pages** ("Documents", "Reading pages" and the red
  rule under "Colour" in `DESIGN.md`) come from the user's design canvas
  "Übungsblatt und Skript", page "A3 Datenblatt" (user decision, 2026-10-24).
  The Lernhelfer's worksheet (claude-plugins) and lernhelfer-skript are to
  follow them; until they do, the canvas wins over both. Except, by user
  decision (2026-10-25): reading pages have the apps' compact step and
  settings dialog, which the canvas does not show, and every Ergänzung ends
  with a red end row "Ende der Ergänzung".
- Never hand-edit a generated file: edit `tokens/` (or `DESIGN.md` outside
  the table, or `scripts/outputs.mjs`), run `npm run build`, commit the
  result. CI runs `npm run check` and `npm test`.
- No npm dependencies: other repos run `bin/ohmtools-design.mjs` straight
  from git (`npx github:ohmtools/design check …`).
- The design is zeiteisen's redesign (base-vega with its own theme, user
  decision). Its sources: the claude.ai doc "Zeiteisen-Redesign:
  Designentscheidungen" and the "Zeiteisen Redesign" canvas.

## Details

- Tokens are DTCG 2025.10 (`$type`, `$value`, `$description`). Colours are
  what zeiteisen's `src/index.css` writes: sRGB (`hex` plus matching
  `components`, checked on load) for the theme, OKLCH with shadcn's numbers
  for `chart-*`. Light and dark name the same colours in the same order,
  descriptions (and the Tailwind name where it differs, `$extensions`
  `dev.ohmtools.tailwind`: `accent-red` -> `red`) only in `light`. shadcn's
  colours end with `sidebar-ring`, the design's own follow. `base` holds
  what does not change with the mode: fonts, radius, spacing, motion.
- `shadcn/src/styles/ohmtools.css` is what `shadcn init` writes for
  `shadcn/components.json` with the design's theme, the `compact` / `wide` /
  `short` variants of the app shell, `popup-glass`, the view transitions
  and the reduced-motion rule; an app's `src/index.css` imports it
  (`shadcn/index.css`, the template) and adds its own. zeiteisen's
  `src/index.css` plus `src/motion.css` still hold the same in place (until
  it adopts the import). When shadcn changes its output (new variables),
  change the template in `scripts/outputs.mjs` and the tokens together.
- OKLCH hex values are computed (OKLCH → sRGB, clipped to the gamut), tested
  against Tailwind's published hex values (`test/tokens.test.mjs`).
- `examples/index.html` rebuilds the look on `dist/tokens.css` alone; check
  it at 1440px and 360px, light and dark, after changing tokens or rules
  (headless chromium with Playwright, `colorScheme` per page).
- `shadcn/src/` holds the shared React components at the paths they take
  in an app (`ohmtools-design add` copies them, `check` compares a copy by
  its first-line marker, `scripts/components.mjs` derives names and
  dependencies from the imports; no manifest). They come from zeiteisen;
  `dropdown-menu` and `tooltip` (zeiteisen uses neither) are shadcn's output
  with the design's hand-edits. Format them with zeiteisen's `oxfmt`
  (defaults). No dependencies here, so check them in a throwaway app: a
  folder with `node_modules` linked from zeiteisen, `add --all`, a
  `src/lib/utils.ts` re-exporting `cn`, `tsc` in strict mode, and a demo
  page in Playwright at 390 × 844, 844 × 390, 834 × 1194 and 1440 × 900.
  `steps.ts` must name the same queries as the variants of the stylesheet
  (a test checks it). The element groups (`app-shell`, `views`, `panel`,
  `area`, `page-editor`, `expand`, `popup`, `lib/ohmtools/toast`) are the
  API apps use; the rest is what they are built from.
- `README.md` in German (user decision); `DESIGN.md`, this file and code
  comments in English, like zeiteisen.

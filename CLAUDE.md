# ohmtools design — working notes

The design every ohmtools repo follows. Rules: `DESIGN.md`. Values: `tokens/`.
Generated from them: `shadcn/index.css`, `dist/*` and the colour table in
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
- Never hand-edit a generated file: edit `tokens/` (or `DESIGN.md` outside
  the table, or `scripts/outputs.mjs`), run `npm run build`, commit the
  result. CI runs `npm run check` and `npm test`.
- No npm dependencies: other repos run `bin/ohmtools-design.mjs` straight
  from git (`npx github:ohmtools/design check …`).

## Details

- Tokens are DTCG 2025.10 (`$type`, `$value`, `$description`). Colours are
  OKLCH with exactly the numbers shadcn writes; light and dark name the same
  colours in the same order, descriptions only in `light`. `base` holds what
  does not change with the mode, including the tint parameters (zeiteisen's
  `src/lib/tint.ts`).
- `shadcn/index.css` is what `shadcn init` writes for
  `shadcn/components.json` plus the Red theme, plus the `desktop` variant of
  the app shell. zeiteisen's `src/index.css` has the same theme
  (`ohmtools-design check` passes there). When shadcn changes its output
  (new variables, other values), change the template in
  `scripts/outputs.mjs` and the tokens together.
- Hex values are computed (OKLCH → sRGB, clipped to the gamut), tested
  against Tailwind's published hex values (`test/tokens.test.mjs`).
- `examples/index.html` rebuilds the look on `dist/tokens.css` alone; check
  it at 1440px and 360px, light and dark, after changing tokens or rules
  (headless chromium with Playwright, `colorScheme` per page).
- Docs and code comments in English, like zeiteisen.

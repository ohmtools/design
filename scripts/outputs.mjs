// Every generated file, as text, from the loaded tokens. `build.mjs` writes
// them, `build.mjs --check` and the tests compare them.
import { cssColor, cssDimension, cssEasing, cssFont, hex, splitShadcn } from "./tokens.mjs";

// Where a generated file comes from, for its header comment.
const SOURCE = "github.com/ohmtools/design, generated from tokens/ by `npm run build`";

const decls = (list, indent = "  ") =>
  list.map(({ name, value }) => `${indent}--${name}: ${cssColor(value)};`).join("\n");

// --- shadcn/src/styles/ohmtools.css and shadcn/index.css ---------------------

// Where the design's stylesheet lies in the shared components, and its marker
// (the first line of every shared file, see scripts/components.mjs).
export const DESIGN_CSS = "shadcn/src/styles/ohmtools.css";

// An app's `src/index.css`: the design's stylesheet, then the app's own.
export function appCss() {
  return `/* The app's stylesheet. The design comes from ./styles/ohmtools.css
   (github.com/ohmtools/design: \`npx --yes github:ohmtools/design add
   ohmtools\`), copied unchanged; app-specific variants, colours and
   utilities go below. */
@import "./styles/ohmtools.css";
`;
}

// What `shadcn init` writes for components.json, with the design's theme in
// place of shadcn's colours, as zeiteisen's `src/index.css` has it: Geist and
// Geist Mono, the three steps of the app shell (DESIGN.md), the design's own
// colours in `@theme inline` before shadcn's (which it lists in reverse, as
// shadcn does), `--radius` after `--chart-5` in `:root`, as shadcn does.
// Then the view transitions and the reduced-motion rule (zeiteisen's
// `src/motion.css`).
export function shadcnCss(t) {
  const { shadcn, own } = splitShadcn(t.light);
  const themeColors = [...own, ...[...shadcn].reverse()]
    .map(({ name, utility }) => `  --color-${utility}: var(--${name});`)
    .join("\n");
  const withRadius = (list) =>
    list.flatMap((c) => {
      const line = `  --${c.name}: ${cssColor(c.value)};`;
      return c.name === "chart-5" ? [line, `  --radius: ${cssDimension(t.radius)};`] : [line];
    });
  return `/* ohmtools/design: ${DESIGN_CSS} (copied by \`ohmtools-design add\`, do not edit) */
/* ohmtools design: shadcn base-vega, zeiteisen's theme, the app shell's
   steps, frosted glass and motion.
   ${SOURCE}.
   The app's src/index.css imports it (shadcn/index.css). */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";

@custom-variant dark (&:is(.dark *));

/* Three steps, the same content in other containers (DESIGN.md, "App
   shell"): narrow (the base: phones upright, one column, the view's controls
   in a bar at the bottom, every popup a drawer), \`compact:\` (phones turned
   sideways, iPads upright, small laptops: one header row, popups, panels as
   a sheet from the right) from 40rem or on a short landscape screen,
   \`wide:\` (large iPads, iPads in landscape, desktops: a closable sidebar
   beside the content) from 64rem AND 700px height. 700px (user decision,
   2026-10-25): a laptop with about 650px under the browser's bars is a small
   laptop and gets the compact step. \`compact:\` holds on \`wide:\` screens
   too, like Tailwind's breakpoints. \`lg:\` / \`md:\` stay for what only
   cares about width. \`compact\` in the block form: Tailwind 4.3 drops
   everything after the comma of a media query list in the one-line form. */
@custom-variant compact {
  @media (width >= 40rem), (height < 600px) and (orientation: landscape) {
    @slot;
  }
}
@custom-variant wide (@media (width >= 64rem) and (height >= 700px));
/* A phone turned sideways (or any short landscape window): a lower header,
   less in each line. */
@custom-variant short (@media (height < 600px) and (orientation: landscape));

@theme inline {
  --font-heading: var(--font-sans);
  --font-sans: ${cssFont(t.font)};
  --font-mono: ${cssFont(t.mono)};
${themeColors}
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
${withRadius(t.light).join("\n")}
}

/* OLED dark: a black ground, surfaces a step above it. */
.dark {
${decls(t.dark)}
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
  /* Every step is one viewport tall (DESIGN.md, "App shell"): the page has
     nothing to scroll, yet iOS pulls it in its rubber band, and takes a
     horizontal swipe for that pull. */
  html,
  body {
    overscroll-behavior: none;
  }
}

/* Floating surfaces (popovers, menus, dialogs, sheets, drawers, toasts):
   frosted glass, \`popover\` at 72 % over a blurred backdrop. Lines, fields
   and hovers inside are tints of the foreground, so they show on the glass
   in both modes. The edge is the component's: a ring of \`foreground\` at
   30 %, or a border of it on sheets and drawers. */
@utility popup-glass {
  background-color: color-mix(in oklab, var(--popover) 72%, transparent);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  backdrop-filter: blur(24px) saturate(1.5);
  --border: color-mix(in oklab, var(--foreground) 12%, transparent);
  --input: color-mix(in oklab, var(--foreground) 15%, transparent);
  --muted: color-mix(in oklab, var(--foreground) 6%, transparent);
  --accent: color-mix(in oklab, var(--foreground) 8%, transparent);
  @apply shadow-xl shadow-black/15 dark:shadow-black/60;
}

/* View transitions (\`transition()\` in lib/ohmtools/motion.ts): the browser
   shoots the page before and after a change and animates between the shots.
   \`html[data-transition]\` names the kind for as long as one runs; outside it
   nothing carries a \`view-transition-name\`. */
@keyframes ohm-in-right {
  from {
    opacity: 0;
    transform: translateX(48px);
  }
}
@keyframes ohm-in-left {
  from {
    opacity: 0;
    transform: translateX(-48px);
  }
}
@keyframes ohm-out-left {
  to {
    opacity: 0;
    transform: translateX(-48px);
  }
}
@keyframes ohm-out-right {
  to {
    opacity: 0;
    transform: translateX(48px);
  }
}

::view-transition-group(*),
::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: ${cssDimension(t.durationIn)};
  animation-timing-function: ${cssEasing(t.easing)};
}

/* \`panel\` (wide): the sidebar slides in from the right and out the same
   way; the rest of the page stands at its new width at once (a crossfade of
   two widths shows every line twice). */
html[data-transition="panel"] [data-vt="panel"] {
  view-transition-name: panel;
}
html[data-transition="panel"]::view-transition-old(root) {
  display: none;
}
html[data-transition="panel"]::view-transition-new(root) {
  animation: none;
}
html[data-transition="panel"]::view-transition-new(panel):only-child {
  animation-name: ohm-in-right;
}
html[data-transition="panel"]::view-transition-old(panel):only-child {
  animation-name: ohm-out-right;
  animation-duration: ${cssDimension(t.durationOut)};
}

/* \`forward\` / \`back\` (phones, compact settings): a page of its own comes
   in from the right, what it covers steps aside to the left; back is the
   mirror. */
html[data-transition="forward"]::view-transition-old(root) {
  animation-name: ohm-out-left;
  animation-duration: ${cssDimension(t.durationOut)};
}
html[data-transition="forward"]::view-transition-new(root) {
  animation-name: ohm-in-right;
}
html[data-transition="back"]::view-transition-old(root) {
  animation-name: ohm-out-right;
  animation-duration: ${cssDimension(t.durationOut)};
}
html[data-transition="back"]::view-transition-new(root) {
  animation-name: ohm-in-left;
}

/* \`view-next\` / \`view-previous\`: the view behind another tab comes in
   from that tab's side; only the incoming view moves, the rest stands. */
html[data-transition^="view-"] [data-vt="view"] {
  view-transition-name: view;
}
html[data-transition^="view-"]::view-transition-old(root),
html[data-transition^="view-"]::view-transition-new(root),
html[data-transition^="view-"]::view-transition-group(view) {
  animation: none;
}
html[data-transition^="view-"]::view-transition-old(view) {
  animation: none;
  opacity: 0;
}
html[data-transition="view-next"]::view-transition-new(view) {
  animation-name: ohm-in-right;
}
html[data-transition="view-previous"]::view-transition-new(view) {
  animation-name: ohm-in-left;
}

/* Reduced motion: no movement anywhere, the app's own or shadcn's; state
   changes still show, at once. */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    animation-delay: 0ms !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0ms !important;
  }
}
`;
}

// --- dist/tokens.css ----------------------------------------------------------

// Plain custom properties for pages without shadcn / Tailwind. Dark through
// the media query alone: no class, no script, no toggle.
export function tokensCss(t) {
  return `/* ohmtools design tokens.
   ${SOURCE}.
   For pages without shadcn / Tailwind: light by default, dark when the device
   prefers it. Use the custom properties, never the values. */
:root {
  color-scheme: light dark;
  --font-sans: ${cssFont(t.font)};
  --font-mono: ${cssFont(t.mono)};
  --radius: ${cssDimension(t.radius)};
  --space-divider: ${cssDimension(t.divider)};
  --space-divider-narrow: ${cssDimension(t.dividerNarrow)};
  --ease: ${cssEasing(t.easing)};
  --duration-in: ${cssDimension(t.durationIn)};
  --duration-out: ${cssDimension(t.durationOut)};
${decls(t.light)}
}

@media (prefers-color-scheme: dark) {
  :root {
${decls(t.dark, "    ")}
  }
}
`;
}

// --- dist/tokens.json ---------------------------------------------------------

export function tokensJson(t) {
  const mode = (list) =>
    Object.fromEntries(list.map(({ name, value }) => [name, { css: cssColor(value), hex: hex(value) }]));
  const json = {
    $description: `ohmtools design tokens. ${SOURCE}. Colours per mode as CSS (hex, or oklch() for the chart colours) and sRGB hex.`,
    font: { sans: t.font, mono: t.mono },
    radius: cssDimension(t.radius),
    space: { divider: cssDimension(t.divider), "divider-narrow": cssDimension(t.dividerNarrow) },
    motion: {
      easing: cssEasing(t.easing),
      "duration-in": cssDimension(t.durationIn),
      "duration-out": cssDimension(t.durationOut),
    },
    light: mode(t.light),
    dark: mode(t.dark),
    roles: Object.fromEntries(t.light.map((c) => [c.name, c.description])),
  };
  return `${JSON.stringify(json, null, 2)}\n`;
}

// --- dist/ohmtools-colors.sty -----------------------------------------------------

// `chart-1` -> `ohmChart1`: xcolor names stay letters and digits.
const latexName = (name) =>
  `ohm${name.replace(/(^|-)(\w)/g, (_, __, ch) => ch.toUpperCase())}`;

export function latexSty(t) {
  const list = t.light.filter((c) => !c.name.startsWith("sidebar"));
  const lines = list.map(({ name, value }) => {
    if ((value.alpha ?? 1) < 1) throw new Error(`latex: ${name} has alpha`);
    return `\\definecolor{${latexName(name)}}{HTML}{${hex(value).slice(1).toUpperCase()}}`;
  });
  return `% ohmtools design colours for LaTeX.
% ${SOURCE}.
% Paper is light: these are the light-mode values. Use the names, never the
% values: \\usepackage{ohmtools-colors}, then \\color{ohmAccentRed},
% \\textcolor{ohmMutedForeground}{...}, \\arrayrulecolor{ohmBorder}.
\\NeedsTeXFormat{LaTeX2e}
\\ProvidesPackage{ohmtools-colors}[ohmtools design colours]
\\RequirePackage{xcolor}

${lines.join("\n")}

\\endinput
`;
}

// --- DESIGN.md colour table ---------------------------------------------------

export const TABLE_BEGIN = "<!-- tokens:begin (generated by npm run build) -->";
export const TABLE_END = "<!-- tokens:end -->";

export function colourTable(t) {
  const dark = new Map(t.dark.map((c) => [c.name, c.value]));
  const rows = t.light.map(
    ({ name, value, description }) =>
      `| \`${name}\` | \`${hex(value)}\` | \`${hex(dark.get(name))}\` | ${description} |`,
  );
  return [
    TABLE_BEGIN,
    "",
    "| Token | Light | Dark | Use |",
    "| --- | --- | --- | --- |",
    ...rows,
    "",
    TABLE_END,
  ].join("\n");
}

export function withColourTable(markdown, t) {
  const begin = markdown.indexOf(TABLE_BEGIN);
  const end = markdown.indexOf(TABLE_END);
  if (begin < 0 || end < begin) throw new Error("DESIGN.md: colour table markers missing");
  return markdown.slice(0, begin) + colourTable(t) + markdown.slice(end + TABLE_END.length);
}

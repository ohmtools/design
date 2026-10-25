// Every generated file, as text, from the loaded tokens. `build.mjs` writes
// them, `build.mjs --check` and the tests compare them.
import { cssColor, cssDimension, cssEasing, cssFont, hex, splitShadcn } from "./tokens.mjs";

// Where a generated file comes from, for its header comment.
const SOURCE = "github.com/ohmtools/design, generated from tokens/ by `npm run build`";

const decls = (list, indent = "  ") =>
  list.map(({ name, value }) => `${indent}--${name}: ${cssColor(value)};`).join("\n");

// --- shadcn/index.css -------------------------------------------------------

// What `shadcn init` writes for components.json, with the design's theme in
// place of shadcn's colours, as zeiteisen's `src/index.css` has it: Geist and
// Geist Mono, the three steps of the app shell (DESIGN.md), the design's own
// colours in `@theme inline` before shadcn's (which it lists in reverse, as
// shadcn does), `--radius` after `--chart-5` in `:root`, as shadcn does. The
// reduced-motion rule ends it (zeiteisen's `src/motion.css`).
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
  return `/* ohmtools design: shadcn base-vega, zeiteisen's theme.
   ${SOURCE}.
   Copy as src/index.css and keep the theme values as they are
   (\`npx --yes github:ohmtools/design check src/index.css\`). App-specific
   variants, colours and utilities go at the end. */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";

@custom-variant dark (&:is(.dark *));

/* Three steps, the same content in other containers: narrow (the base:
   phones upright, one column, the view's controls in a bar at the bottom),
   \`compact:\` (one header row, panels as a sheet from the right) from 40rem
   or on a short landscape screen (phones turned sideways), \`wide:\` (a
   closable sidebar beside the content) from 64rem AND 600px height. 600px,
   not more: an iPad 10 in landscape leaves about 700px under the browser's
   toolbar and tab strip, short laptops about 650px, and both should get the
   sidebar. \`compact:\` holds on \`wide:\` screens too, like Tailwind's
   breakpoints. \`lg:\` / \`md:\` stay for what only cares about width. */
@custom-variant compact (@media (width >= 40rem), (height < 600px) and (orientation: landscape));
@custom-variant wide (@media (width >= 64rem) and (height >= 600px));
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

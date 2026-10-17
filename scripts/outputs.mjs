// Every generated file, as text, from the loaded tokens. `build.mjs` writes
// them, `build.mjs --check` and the tests compare them.
import { cssColor, cssDimension, cssFont, hex, tints } from "./tokens.mjs";

// Where a generated file comes from, for its header comment.
const SOURCE = "github.com/ohmtools/design, generated from tokens/ by `npm run build`";

const decls = (list, indent = "  ") =>
  list.map(({ name, value }) => `${indent}--${name}: ${cssColor(value)};`).join("\n");

// --- shadcn/index.css -------------------------------------------------------

// What `shadcn init` writes for components.json plus the Red theme, the
// `desktop` variant of the app shell (DESIGN.md) in front. `@theme inline`
// lists the colours in reverse, as shadcn does; `--radius` sits after
// `--chart-5` in `:root`, as shadcn does.
export function shadcnCss(t) {
  const themeColors = [...t.light]
    .reverse()
    .map(({ name }) => `  --color-${name}: var(--${name});`)
    .join("\n");
  const rootDecls = t.light.flatMap((c) => {
    const line = `  --${c.name}: ${cssColor(c.value)};`;
    return c.name === "chart-5" ? [line, `  --radius: ${cssDimension(t.radius)};`] : [line];
  });
  return `/* ohmtools design: shadcn base-sera, Red on Neutral.
   ${SOURCE}.
   Copy as src/index.css and keep the theme values as they are
   (\`npx --yes github:ohmtools/design check src/index.css\`). App-specific
   variants and utilities go at the end. */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/inter";

@custom-variant dark (&:is(.dark *));

/* The desktop shell (the whole app in one viewport, sections scroll inside
   themselves) only works when the content fits the viewport height without a
   page scrollbar; below that the phone layout (one column, tab bar, page
   scrolls) takes over. 600px, not more: an iPad 10 in landscape leaves about
   700px under the browser's toolbar and tab strip, short laptops about 650px,
   and both should get the desktop. Use \`desktop:\` for shell layout, \`lg:\`
   stays for everything that only cares about width. */
@custom-variant desktop (@media (width >= 64rem) and (height >= 600px));

@theme inline {
  --font-heading: var(--font-sans);
  --font-sans: ${cssFont(t.font)};
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
${rootDecls.join("\n")}
}

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
  --radius: ${cssDimension(t.radius)};
  --space-divider: ${cssDimension(t.divider)};
${decls(t.light)}
${decls(tints(t.light, t.tint))}
}

@media (prefers-color-scheme: dark) {
  :root {
${decls(t.dark, "    ")}
${decls(tints(t.dark, t.tint), "    ")}
  }
}
`;
}

// --- dist/tokens.json ---------------------------------------------------------

const TINT_ROLE = (n) => `Tint step ${n} of primary, for data told apart by colour.`;

export function tokensJson(t) {
  const mode = (list) =>
    Object.fromEntries(
      [...list, ...tints(list, t.tint)].map(({ name, value }) => [
        name,
        { oklch: cssColor(value), hex: hex(value) },
      ]),
    );
  const roles = Object.fromEntries([
    ...t.light.map((c) => [c.name, c.description]),
    ...tints(t.light, t.tint).map((c, i) => [c.name, TINT_ROLE(i + 1)]),
  ]);
  const json = {
    $description: `ohmtools design tokens. ${SOURCE}. Colours per mode as CSS oklch() and sRGB hex (#rrggbbaa with alpha).`,
    font: { sans: t.font },
    radius: cssDimension(t.radius),
    space: { divider: cssDimension(t.divider) },
    light: mode(t.light),
    dark: mode(t.dark),
    roles,
  };
  return `${JSON.stringify(json, null, 2)}\n`;
}

// --- dist/ohmtools-colors.sty -----------------------------------------------------

// `chart-1` -> `ohmChart1`: xcolor names stay letters and digits.
const latexName = (name) =>
  `ohm${name.replace(/(^|-)(\w)/g, (_, __, ch) => ch.toUpperCase())}`;

export function latexSty(t) {
  const list = [...t.light.filter((c) => !c.name.startsWith("sidebar")), ...tints(t.light, t.tint)];
  const lines = list.map(({ name, value }) => {
    if ((value.alpha ?? 1) < 1) throw new Error(`latex: ${name} has alpha`);
    return `\\definecolor{${latexName(name)}}{HTML}{${hex(value).slice(1).toUpperCase()}}`;
  });
  return `% ohmtools design colours for LaTeX.
% ${SOURCE}.
% Paper is light: these are the light-mode values. Use the names, never the
% values: \\usepackage{ohmtools-colors}, then \\color{ohmPrimary},
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
  const dark = new Map([...t.dark, ...tints(t.dark, t.tint)].map((c) => [c.name, c.value]));
  const rows = [
    ...t.light.map((c) => [c.name, c.value, c.description]),
    ...tints(t.light, t.tint).map((c, i) => [c.name, c.value, TINT_ROLE(i + 1)]),
  ].map(
    ([name, value, role]) =>
      `| \`${name}\` | \`${hex(value)}\` | \`${hex(dark.get(name))}\` | ${role} |`,
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

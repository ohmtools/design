// Checks another project's files against the design, for
// `ohmtools-design check <file>…` (bin/ohmtools-design.mjs). Every check
// returns a list of problems; empty = the file follows the design.
import fs from "node:fs";
import path from "node:path";
import { cssColor, cssDimension, cssFont, loadTokens, root } from "./tokens.mjs";

// --- CSS: the theme's custom properties ----------------------------------------

// `--name: value` declarations of the blocks that hold the theme: `:root`
// (light; dark inside a `prefers-color-scheme: dark` media query) and `.dark`.
// `--font-sans` and `--font-mono` count wherever they are declared (shadcn puts
// them in `@theme`).
export function themeDeclarations(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const found = { light: new Map(), dark: new Map(), font: null, mono: null };
  const stack = [];
  let buffer = "";
  const declare = (raw) => {
    const match = raw.trim().match(/^--([\w-]+)\s*:\s*([\s\S]+)$/);
    if (!match) return;
    const [, name, value] = match;
    if (name === "font-sans") found.font = value.trim();
    if (name === "font-mono") found.mono = value.trim();
    const selector = stack.at(-1);
    const darkMedia = stack.some((p) => /prefers-color-scheme\s*:\s*dark/.test(p));
    if (selector === ":root") (darkMedia ? found.dark : found.light).set(name, value.trim());
    else if (selector === ".dark") found.dark.set(name, value.trim());
  };
  for (const ch of text) {
    if (ch === "{") {
      stack.push(buffer.trim());
      buffer = "";
    } else if (ch === "}") {
      declare(buffer);
      stack.pop();
      buffer = "";
    } else if (ch === ";") {
      declare(buffer);
      buffer = "";
    } else {
      buffer += ch;
    }
  }
  return found;
}

// Colours compare by value (`/ 10%` equals `/ 0.1`, `#FFF` equals `#ffffff`),
// everything else by text with whitespace and number formatting evened out.
function parseHex(value) {
  const m = value.trim().match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (!m) return null;
  const digits = m[1].length <= 4 ? [...m[1]].map((d) => d + d).join("") : m[1];
  const bytes = digits.match(/../g).map((b) => parseInt(b, 16));
  return [...bytes.slice(0, 3), bytes.length === 4 ? bytes[3] : 255];
}

function parseOklch(value) {
  const m = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/i);
  if (!m) return null;
  const alpha = m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1);
  return [Number(m[1]), Number(m[2]), Number(m[3]), alpha];
}

export function sameValue(actual, expected) {
  const a = parseOklch(actual);
  const e = parseOklch(expected);
  if (a && e) return a.every((n, i) => Math.abs(n - e[i]) < 1e-6);
  const ha = parseHex(actual);
  const he = parseHex(expected);
  if (ha && he) return ha.every((n, i) => n === he[i]);
  const even = (v) =>
    v
      .replace(/\s+/g, " ")
      .replace(/-?\d*\.?\d+/g, (n) => String(Number(n)))
      .replace(/'/g, '"')
      .trim()
      .toLowerCase();
  return even(actual) === even(expected);
}

export function checkCss(css, t = loadTokens()) {
  const found = themeDeclarations(css);
  const problems = [];
  const expect = (mode, name, expected) => {
    const actual = found[mode].get(name);
    if (actual === undefined) problems.push(`${mode}: --${name} missing, expected ${expected}`);
    else if (!sameValue(actual, expected)) {
      problems.push(`${mode}: --${name} is ${actual}, expected ${expected}`);
    }
  };
  for (const c of t.light) expect("light", c.name, cssColor(c.value));
  for (const c of t.dark) expect("dark", c.name, cssColor(c.value));
  expect("light", "radius", cssDimension(t.radius));
  for (const [key, name, families] of [
    ["font", "font-sans", t.font],
    ["mono", "font-mono", t.mono],
  ]) {
    const expected = cssFont(families);
    const actual = found[key];
    if (actual === null) problems.push(`--${name} missing, expected ${expected}`);
    else if (!sameValue(actual, expected)) problems.push(`--${name} is ${actual}, expected ${expected}`);
  }
  return problems;
}

// --- CSS: what a Tailwind theme adds around the tokens -------------------------

// The step variants and `popup-glass` as shadcn/index.css writes them
// (comments and whitespace aside). Only in a Tailwind file: plain pages on
// dist/tokens.css have neither.
const SHELL = [
  "@custom-variant compact",
  "@custom-variant wide",
  "@custom-variant short",
  "@utility popup-glass",
];

// The statement that starts with `head`: up to its `;`, or its block.
function statement(text, head) {
  const pattern = head.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
  const start = text.search(new RegExp(pattern + "(?![\\w-])"));
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === ";" && depth === 0) return text.slice(start, i + 1);
    if (text[i] === "{") depth++;
    if (text[i] === "}" && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

const squash = (text) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,])\s*/g, "$1")
    .trim();

export function checkShell(css) {
  const strip = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "");
  const app = strip(css);
  const design = strip(fs.readFileSync(path.join(root, "shadcn/index.css"), "utf8"));
  return SHELL.flatMap((head) => {
    const actual = statement(app, head);
    if (actual === null) return [`${head} missing, copy it from shadcn/index.css`];
    return squash(actual) === squash(statement(design, head))
      ? []
      : [`${head} differs from shadcn/index.css`];
  });
}

// --- components.json: the shadcn settings that shape the look -----------------

const STYLE_KEYS = [
  "style",
  "tailwind.baseColor",
  "tailwind.cssVariables",
  "iconLibrary",
  "menuColor",
  "menuAccent",
];

const at = (object, key) => key.split(".").reduce((o, k) => o?.[k], object);

export function checkComponentsJson(text) {
  const design = JSON.parse(fs.readFileSync(path.join(root, "shadcn/components.json"), "utf8"));
  let config;
  try {
    config = JSON.parse(text);
  } catch (error) {
    return [`not JSON: ${error.message}`];
  }
  return STYLE_KEYS.filter((key) => at(config, key) !== at(design, key)).map(
    (key) => `${key} is ${JSON.stringify(at(config, key))}, expected ${JSON.stringify(at(design, key))}`,
  );
}

// --- No uppercase text, no wide letter spacing --------------------------------

const UPPERCASE = [
  { ext: [".css", ".scss"], pattern: /text-transform\s*:\s*uppercase/ },
  {
    ext: [".tsx", ".jsx", ".ts", ".js", ".mjs", ".html", ".vue", ".svelte", ".astro"],
    pattern: /\b(?:uppercase|tracking-wider|tracking-widest)\b/,
  },
  { ext: [".tex", ".cls", ".sty"], pattern: /\\(?:MakeUppercase|uppercase)\b/ },
];

export function checkUppercase(text, file) {
  const rule = UPPERCASE.find((r) => r.ext.includes(path.extname(file)));
  if (!rule) return [];
  return text
    .split("\n")
    .flatMap((line, i) =>
      rule.pattern.test(line) ? [`line ${i + 1}: uppercase or wide letter spacing`] : [],
    );
}

// --- A file ---------------------------------------------------------------------

export function checkFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const problems = [];
  if (path.basename(file) === "components.json") problems.push(...checkComponentsJson(text));
  else if (path.extname(file) === ".css" && /--primary\s*:/.test(text)) {
    problems.push(...checkCss(text));
    if (/@import\s+["']tailwindcss["']/.test(text)) problems.push(...checkShell(text));
  }
  problems.push(...checkUppercase(text, file));
  return problems;
}

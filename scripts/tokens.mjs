// Reads the DTCG token files in `tokens/` and turns their values into the
// strings every output needs. No dependencies: the outputs are plain text,
// and other repos run `bin/ohmtools-design.mjs` straight from git.
import fs from "node:fs";
import path from "node:path";

export const root = path.resolve(import.meta.dirname, "..");

const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, "tokens", `${name}.tokens.json`), "utf8"));

// Tokens of a group in file order, `$`-keys dropped.
const entries = (group) => Object.entries(group).filter(([key]) => !key.startsWith("$"));

// The theme is sRGB hex as zeiteisen writes it; the chart colours stay the
// OKLCH shadcn writes. An sRGB token carries `hex` (what the outputs use) and
// `components` (DTCG's required form) that must say the same.
function checkColour(value, where) {
  if (value?.colorSpace === "oklch" && value.components?.length === 3) return;
  if (value?.colorSpace === "srgb" && /^#[0-9a-f]{6}$/.test(value.hex ?? "")) {
    const rgb = value.components?.map((c) => Math.round(c * 255));
    if (rgb?.length === 3 && rgb.map(hex2).join("") === value.hex.slice(1)) return;
    throw new Error(`${where}: components do not match hex ${value.hex}`);
  }
  throw new Error(`${where}: not an oklch colour or an srgb colour with a lower-case #rrggbb hex`);
}

function colors(file, mode) {
  return entries(file.color).map(([name, token]) => {
    const value = token.$value;
    checkColour(value, `tokens/${mode}: ${name}`);
    return {
      name,
      value,
      description: token.$description,
      // The Tailwind colour name, when it is not the token's own
      // (`accent-red` -> `bg-red`).
      utility: token.$extensions?.["dev.ohmtools"]?.tailwind ?? name,
    };
  });
}

export function loadTokens() {
  const base = read("base");
  const light = colors(read("light"), "light");
  const dark = colors(read("dark"), "dark");
  const names = (list) => list.map((c) => c.name).join();
  if (names(light) !== names(dark)) {
    throw new Error("tokens: light and dark must name the same colours in the same order");
  }
  return {
    light,
    dark,
    font: base.font.sans.$value,
    mono: base.font.mono.$value,
    radius: base.radius.base.$value,
    divider: base.space.divider.$value,
    dividerNarrow: base.space["divider-narrow"].$value,
    easing: base.motion.easing.$value,
    durationIn: base.motion["duration-in"].$value,
    durationOut: base.motion["duration-out"].$value,
  };
}

// shadcn's own colours end with `sidebar-ring`; what follows is the design's
// own (red accent, warning, data colours, …).
export function splitShadcn(list) {
  const end = list.findIndex((c) => c.name === "sidebar-ring") + 1;
  if (end === 0) throw new Error("tokens: sidebar-ring missing");
  return { shadcn: list.slice(0, end), own: list.slice(end) };
}

// --- CSS strings ------------------------------------------------------------

// Numbers as shadcn writes them: shortest form, no trailing zeros.
const num = (n) => String(Number(n.toFixed(3)));

export function cssColor(value) {
  if (value.colorSpace === "srgb") return value.hex;
  const [l, c, h] = value.components;
  const alpha = value.alpha ?? 1;
  const a = alpha < 1 ? ` / ${Math.round(alpha * 1000) / 10}%` : "";
  return `oklch(${num(l)} ${num(c)} ${num(h)}${a})`;
}

export const cssDimension = ({ value, unit }) => `${value}${unit}`;

export const cssEasing = (points) => `cubic-bezier(${points.join(", ")})`;

// Font names with spaces are quoted, generic families are not.
const GENERIC = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "system-ui",
  "ui-sans-serif",
  "ui-monospace",
]);
export const cssFont = (families) =>
  families.map((f) => (GENERIC.has(f) ? f : `"${f}"`)).join(", ");

// --- sRGB ---------------------------------------------------------------------

// OKLCH -> sRGB (Björn Ottosson's OKLab matrices), channels clipped to the
// sRGB gamut. Tailwind's red sits partly outside sRGB; its published hex
// values are clipped the same way.
export function srgb({ components: [L, C, H] }) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map((x) => {
    const v = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  });
}

function hex2(n) {
  return n.toString(16).padStart(2, "0");
}

// `#rrggbb`, or `#rrggbbaa` for a colour with alpha.
export function hex(value) {
  if (value.colorSpace === "srgb") return value.hex;
  const alpha = value.alpha ?? 1;
  const rgb = srgb(value).map(hex2).join("");
  return `#${rgb}${alpha < 1 ? hex2(Math.round(alpha * 255)) : ""}`;
}

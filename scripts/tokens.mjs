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

function colors(file, mode) {
  return entries(file.color).map(([name, token]) => {
    const value = token.$value;
    if (value?.colorSpace !== "oklch" || value.components?.length !== 3) {
      throw new Error(`tokens/${mode}: ${name} is not an oklch colour`);
    }
    return { name, value, description: token.$description };
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
  const tint = Object.fromEntries(entries(base.tint).map(([key, token]) => [key, token.$value]));
  return {
    light,
    dark,
    font: base.font.sans.$value,
    radius: base.radius.base.$value,
    divider: base.space.divider.$value,
    tint,
  };
}

// --- CSS strings ------------------------------------------------------------

// Numbers as shadcn writes them: shortest form, no trailing zeros.
const num = (n) => String(Number(n.toFixed(3)));

export function cssColor({ components: [l, c, h], alpha = 1 }) {
  const a = alpha < 1 ? ` / ${Math.round(alpha * 1000) / 10}%` : "";
  return `oklch(${num(l)} ${num(c)} ${num(h)}${a})`;
}

export const cssDimension = ({ value, unit }) => `${value}${unit}`;

// Font names with spaces are quoted, generic families are not.
const GENERIC = new Set(["serif", "sans-serif", "monospace", "system-ui", "ui-sans-serif"]);
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

const hex2 = (n) => n.toString(16).padStart(2, "0");

// `#rrggbb`, or `#rrggbbaa` for a colour with alpha.
export function hex(value) {
  const alpha = value.alpha ?? 1;
  const rgb = srgb(value).map(hex2).join("");
  return `#${rgb}${alpha < 1 ? hex2(Math.round(alpha * 255)) : ""}`;
}

// --- Tints ---------------------------------------------------------------------

// Step n of the primary ramp (step 0 is primary itself), as zeiteisen's
// `tint.ts` computes it at runtime with relative colour syntax.
export function tint(primary, step, t) {
  const [l, c, h] = primary.components;
  return {
    colorSpace: "oklch",
    components: [
      Number((l - step * t["lightness-step"]).toFixed(3)),
      Number(Math.max(c - step * t["chroma-step"], t["chroma-min"]).toFixed(3)),
      h,
    ],
  };
}

// tint-1 … tint-(steps - 1) of a mode; tint-0 would only repeat primary.
export function tints(mode, t) {
  const primary = mode.find((c) => c.name === "primary").value;
  return Array.from({ length: t.steps - 1 }, (_, i) => ({
    name: `tint-${i + 1}`,
    value: tint(primary, i + 1, t),
  }));
}

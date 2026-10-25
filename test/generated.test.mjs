import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  checkComponentsJson,
  checkCss,
  checkShell,
  checkUppercase,
  sameValue,
  themeDeclarations,
} from "../scripts/check.mjs";
import { generated } from "../scripts/generated.mjs";
import { DESIGN_CSS } from "../scripts/outputs.mjs";
import { root } from "../scripts/tokens.mjs";

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("generated files are up to date (npm run build)", () => {
  for (const [file, text] of generated()) assert.equal(read(file), text, file);
});

test("the generated theme files pass the check", () => {
  assert.deepEqual(checkCss(read(DESIGN_CSS)), []);
  assert.deepEqual(checkShell(read(DESIGN_CSS)), []);
  assert.deepEqual(checkCss(read("dist/tokens.css")), []);
  assert.deepEqual(checkComponentsJson(read("shadcn/components.json")), []);
});

test("the check finds a changed and a missing colour", () => {
  const css = read(DESIGN_CSS)
    .replace("--primary: #0a0a0a;", "--primary: #dc2626;")
    .replace(/\n {2}--ring: [^;]+;/, "")
    .replace(/\n {2}--font-mono: [^;]+;/, "");
  assert.deepEqual(checkCss(css), [
    "light: --primary is #dc2626, expected #0a0a0a",
    "light: --ring missing, expected #a3a3a3",
    '--font-mono missing, expected "Geist Mono Variable", ui-monospace, monospace',
  ]);
});

test("the check wants the step variants and popup-glass of the design stylesheet", () => {
  const css = read(DESIGN_CSS)
    .replace(
      /@custom-variant compact \{[\s\S]*?\n\}/,
      "@custom-variant compact (@media (width >= 40rem), (height < 600px) and (orientation: landscape));",
    )
    .replace(/@utility popup-glass \{[\s\S]*?\n\}/, "")
    .replace("@custom-variant wide (@media", "@custom-variant  wide  (@media");
  assert.deepEqual(checkShell(css), [
    `@custom-variant compact differs from ${DESIGN_CSS}`,
    `@utility popup-glass missing, copy it from ${DESIGN_CSS}`,
  ]);
});

test("dark comes from .dark and from a prefers-color-scheme :root", () => {
  const found = themeDeclarations(`
    :root { --a: 1; }
    .dark { --b: 2; }
    @media (prefers-color-scheme: dark) { :root { --c: 3; } }
    @theme inline { --font-sans: Geist; --font-mono: Mono; --color-a: var(--a); }`);
  assert.deepEqual([...found.light], [["a", "1"]]);
  assert.deepEqual(
    [...found.dark],
    [
      ["b", "2"],
      ["c", "3"],
    ],
  );
  assert.equal(found.font, "Geist");
  assert.equal(found.mono, "Mono");
});

test("colours compare by value", () => {
  const css = read("dist/tokens.css")
    .replace("--background: #ffffff;", "--background: #FFF;")
    .replace(
      "--chart-1: oklch(0.808 0.114 19.571);",
      "--chart-1: oklch(0.808 0.114 19.571 / 100%);",
    );
  assert.deepEqual(checkCss(css), []);
  assert.equal(sameValue("#1f1f1f", "#1f1f1fff"), true);
  assert.equal(sameValue("#000000", "#000"), true);
  assert.equal(sameValue("#000000", "#0a0a0a"), false);
});

test("components.json: another style is reported", () => {
  const config = JSON.parse(read("shadcn/components.json"));
  config.style = "new-york";
  assert.deepEqual(checkComponentsJson(JSON.stringify(config)), [
    'style is "new-york", expected "base-vega"',
  ]);
});

test("uppercase is found per file type", () => {
  assert.deepEqual(checkUppercase('<p className="text-xs uppercase">', "a.tsx"), [
    "line 1: uppercase or wide letter spacing",
  ]);
  assert.deepEqual(checkUppercase("a {\n  text-transform: uppercase;\n}", "a.css"), [
    "line 2: uppercase or wide letter spacing",
  ]);
  assert.deepEqual(checkUppercase("\\MakeUppercase{Gegeben}", "a.cls"), [
    "line 1: uppercase or wide letter spacing",
  ]);
  assert.deepEqual(checkUppercase("s.toUpperCase()", "a.ts"), []);
});

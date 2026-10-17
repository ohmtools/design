import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { checkComponentsJson, checkCss, checkUppercase, themeDeclarations } from "../scripts/check.mjs";
import { generated } from "../scripts/generated.mjs";
import { root } from "../scripts/tokens.mjs";

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("generated files are up to date (npm run build)", () => {
  for (const [file, text] of generated()) assert.equal(read(file), text, file);
});

test("the generated theme files pass the check", () => {
  assert.deepEqual(checkCss(read("shadcn/index.css")), []);
  assert.deepEqual(checkCss(read("dist/tokens.css")), []);
  assert.deepEqual(checkComponentsJson(read("shadcn/components.json")), []);
});

test("the check finds a changed and a missing colour", () => {
  const css = read("shadcn/index.css")
    .replace("--primary: oklch(0.505 0.213 27.518);", "--primary: oklch(0.205 0 0);")
    .replace(/\n {2}--ring: [^;]+;/, "");
  assert.deepEqual(checkCss(css), [
    "light: --primary is oklch(0.205 0 0), expected oklch(0.505 0.213 27.518)",
    "light: --ring missing, expected oklch(0.708 0 0)",
  ]);
});

test("dark comes from .dark and from a prefers-color-scheme :root", () => {
  const found = themeDeclarations(`
    :root { --a: 1; }
    .dark { --b: 2; }
    @media (prefers-color-scheme: dark) { :root { --c: 3; } }
    @theme inline { --font-sans: Inter; --color-a: var(--a); }`);
  assert.deepEqual([...found.light], [["a", "1"]]);
  assert.deepEqual([...found.dark], [["b", "2"], ["c", "3"]]);
  assert.equal(found.font, "Inter");
});

test("alpha compares by value", () => {
  const css = read("dist/tokens.css").replace("oklch(1 0 0 / 10%)", "oklch(1 0 0 / 0.1)");
  assert.deepEqual(checkCss(css), []);
});

test("components.json: another style is reported", () => {
  const config = JSON.parse(read("shadcn/components.json"));
  config.style = "new-york";
  assert.deepEqual(checkComponentsJson(JSON.stringify(config)), [
    'style is "new-york", expected "base-sera"',
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

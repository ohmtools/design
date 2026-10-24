import assert from "node:assert/strict";
import { test } from "node:test";
import { hex, loadTokens, splitShadcn } from "../scripts/tokens.mjs";

const oklch = (...components) => ({ colorSpace: "oklch", components });

test("hex matches Tailwind's published sRGB values", () => {
  // Red and neutral as Tailwind v4 lists them; red-600 and red-500 lie
  // outside sRGB and come out clipped, like Tailwind's.
  const known = [
    ["#fef2f2", oklch(0.971, 0.013, 17.38)],
    ["#fb2c36", oklch(0.637, 0.237, 25.331)],
    ["#e7000b", oklch(0.577, 0.245, 27.325)],
    ["#c10007", oklch(0.505, 0.213, 27.518)],
    ["#9f0712", oklch(0.444, 0.177, 26.899)],
    ["#0a0a0a", oklch(0.145, 0, 0)],
    ["#737373", oklch(0.556, 0, 0)],
    ["#f4f4f5", oklch(0.967, 0.001, 286.375)],
    ["#ffffff", oklch(1, 0, 0)],
  ];
  for (const [expected, value] of known) assert.equal(hex(value), expected);
});

test("hex carries alpha as a fourth byte", () => {
  assert.equal(hex({ ...oklch(1, 0, 0), alpha: 0.1 }), "#ffffff1a");
});

test("an sRGB token is its hex", () => {
  const t = loadTokens();
  const value = (name) => t.light.find((c) => c.name === name).value;
  assert.equal(hex(value("accent-red")), "#dc2626");
  assert.equal(hex(value("background")), "#ffffff");
  assert.equal(t.dark.find((c) => c.name === "background").value.hex, "#000000");
});

test("light and dark name the same colours", () => {
  const t = loadTokens();
  assert.deepEqual(
    t.light.map((c) => c.name),
    t.dark.map((c) => c.name),
  );
  assert.ok(t.light.every((c) => c.description), "every light colour has a $description");
});

test("the design's own colours follow shadcn's", () => {
  const { shadcn, own } = splitShadcn(loadTokens().light);
  assert.equal(shadcn.at(-1).name, "sidebar-ring");
  assert.deepEqual(
    own.slice(0, 4).map((c) => c.utility),
    ["grid", "hour", "red", "red-foreground"],
  );
});

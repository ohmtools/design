import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { checkFile } from "../scripts/check.mjs";
import { add, checkCopy, components, resolve } from "../scripts/components.mjs";
import { root } from "../scripts/tokens.mjs";

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("every shared component names its own path and passes the check", () => {
  const list = components();
  assert.ok(list.length > 0);
  for (const c of list) {
    assert.match(c.text, new RegExp(`^(//|/\\*) ohmtools/design: ${c.path} `), c.path);
    assert.deepEqual(checkFile(path.join(root, c.path)), [], c.path);
  }
});

test("names are unique and every import resolves (the app brings @/lib/utils)", () => {
  const list = components();
  assert.equal(new Set(list.map((c) => c.name)).size, list.length);
  for (const c of list)
    assert.deepEqual(
      c.missing.filter((s) => s !== "@/lib/utils"),
      [],
      c.name,
    );
});

test("the step queries of steps.ts are the variants of the design stylesheet", () => {
  const css = read("shadcn/src/styles/ohmtools.css");
  const steps = read("shadcn/src/lib/ohmtools/steps.ts");
  const query = (name) => steps.match(new RegExp(`export const ${name} = "([^"]+)"`))[1];
  assert.ok(css.includes(`@media ${query("COMPACT_QUERY")} {`));
  assert.ok(css.includes(`@custom-variant wide (@media ${query("WIDE_QUERY")});`));
  assert.ok(css.includes(`@custom-variant short (@media ${query("SHORT_QUERY")});`));
});

test("resolve takes what a component imports", () => {
  const names = resolve(["responsive-dialog"]).map((c) => c.name);
  for (const used of ["responsive-dialog", "dialog", "button", "phone-drawer", "drawer", "steps"]) {
    assert.ok(names.includes(used), used);
  }
  assert.throws(() => resolve(["nope"]), /unknown component: nope/);
});

test("add copies, keeps an app's own file, and the check catches an edited copy", () => {
  const app = fs.mkdtempSync(path.join(os.tmpdir(), "ohmtools-app-"));
  fs.writeFileSync(
    path.join(app, "package.json"),
    JSON.stringify({ dependencies: { react: "19" } }),
  );
  fs.mkdirSync(path.join(app, "src/components/ui"), { recursive: true });
  fs.writeFileSync(path.join(app, "src/components/ui/button.tsx"), "export const own = 1;\n");

  const first = add(["responsive-alert-dialog"], { cwd: app });
  const status = Object.fromEntries(first.results.map((r) => [r.file, r.status]));
  assert.equal(status["src/components/ohmtools/responsive-alert-dialog.tsx"], "added");
  assert.match(status["src/components/ui/button.tsx"], /^kept/);
  assert.ok(first.packages.includes("@base-ui/react"));
  assert.ok(!first.packages.includes("react"));

  const forced = add(["button"], { cwd: app, force: true });
  assert.equal(forced.results[0].status, "updated");
  assert.equal(add(["button"], { cwd: app }).results[0].status, "unchanged");

  const copy = path.join(app, "src/components/ohmtools/responsive-alert-dialog.tsx");
  assert.deepEqual(checkFile(copy), []);
  fs.writeFileSync(
    copy,
    fs.readFileSync(copy, "utf8").replace("destructive = false", "destructive = true"),
  );
  assert.match(
    checkFile(copy)[0],
    /differs from the design's shadcn\/src\/components\/ohmtools\/responsive-alert-dialog\.tsx/,
  );

  assert.deepEqual(checkCopy("export const own = 1;\n"), []);
  assert.match(checkCopy("// ohmtools/design: shadcn/src/nope.tsx\n")[0], /does not have/);
  fs.rmSync(app, { recursive: true });
});

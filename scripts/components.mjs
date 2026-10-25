// The shared React components (`shadcn/src/`): what `ohmtools-design add`
// copies into an app and what `ohmtools-design check` compares a copy with.
// Every file starts with a marker naming its path here; a file in an app that
// carries the marker must equal the design's copy.
import fs from "node:fs";
import path from "node:path";
import { root } from "./tokens.mjs";

const SOURCE = "shadcn/src";
const MARKER = /^\/\/ ohmtools\/design: (\S+)/;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

// `@/components/ui/button` -> `src/components/ui/button.tsx`, if the design has it.
function internal(specifier, byTarget) {
  if (!specifier.startsWith("@/")) return null;
  const base = "src/" + specifier.slice(2);
  return byTarget.get(base + ".tsx") ?? byTarget.get(base + ".ts") ?? null;
}

// Every shared file: its name (`button`, `responsive-dialog`), its path here,
// where it goes in an app, the shared files it imports and its npm packages.
export function components() {
  const files = walk(path.join(root, SOURCE))
    .filter((file) => /\.tsx?$/.test(file))
    .sort();
  const list = files.map((file) => {
    const repo = path.relative(root, file).split(path.sep).join("/");
    return {
      name: path.basename(file).replace(/\.tsx?$/, ""),
      path: repo,
      target: repo.slice("shadcn/".length),
      text: fs.readFileSync(file, "utf8"),
    };
  });
  const byTarget = new Map(list.map((c) => [c.target, c]));
  for (const c of list) {
    const specifiers = [
      ...c.text.matchAll(/^\s*(?:import|export)[^"']*?from\s+["']([^"']+)["']/gm),
    ].map((m) => m[1]);
    c.uses = [...new Set(specifiers.map((s) => internal(s, byTarget)?.name).filter(Boolean))];
    c.packages = [
      ...new Set(
        specifiers
          .filter((s) => !s.startsWith("@/") && !s.startsWith("."))
          .map((s) => (s.startsWith("@") ? s.split("/").slice(0, 2).join("/") : s.split("/")[0])),
      ),
    ].sort();
    c.missing = specifiers.filter((s) => s.startsWith("@/") && !internal(s, byTarget));
  }
  return list;
}

// The named components and everything they import, in a stable order.
export function resolve(names, list = components()) {
  const byName = new Map(list.map((c) => [c.name, c]));
  const unknown = names.filter((name) => !byName.has(name));
  if (unknown.length) throw new Error(`unknown component: ${unknown.join(", ")}`);
  const picked = new Set();
  const visit = (name) => {
    if (picked.has(name)) return;
    picked.add(name);
    for (const used of byName.get(name).uses) visit(used);
  };
  names.forEach(visit);
  return list.filter((c) => picked.has(c.name));
}

// Copies components into the app at `cwd`. A file there without the marker is
// the app's own and stays, unless `force`. Returns what happened per file and
// the npm packages the app still has to install.
export function add(names, { cwd = process.cwd(), force = false } = {}) {
  const picked = resolve(names);
  const results = picked.map((c) => {
    const target = path.join(cwd, c.target);
    const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
    if (current === c.text) return { file: c.target, status: "unchanged" };
    if (current !== null && !MARKER.test(current) && !force) {
      return { file: c.target, status: "kept (the app's own file; --force replaces it)" };
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, c.text);
    return { file: c.target, status: current === null ? "added" : "updated" };
  });
  const manifest = path.join(cwd, "package.json");
  const pkg = fs.existsSync(manifest) ? JSON.parse(fs.readFileSync(manifest, "utf8")) : {};
  const have = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
  const packages = [...new Set(picked.flatMap((c) => c.packages))]
    .filter((p) => !(p in have))
    .sort();
  return { results, packages };
}

// A copy in an app: equal to the design's file its marker names.
export function checkCopy(text) {
  const marker = text.match(MARKER);
  if (!marker) return [];
  const source = path.join(root, marker[1]);
  if (!marker[1].startsWith(SOURCE + "/") || !fs.existsSync(source)) {
    return [`names ${marker[1]}, which the design does not have`];
  }
  const normal = (s) => s.replace(/\r\n/g, "\n");
  if (normal(text) === normal(fs.readFileSync(source, "utf8"))) return [];
  const name = path.basename(marker[1]).replace(/\.tsx?$/, "");
  return [
    `differs from the design's ${marker[1]}: do not edit a copied component, ` +
      `run \`npx --yes github:ohmtools/design add ${name}\` (or change it in the design)`,
  ];
}

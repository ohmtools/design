// `npm run build`: writes every generated file from `tokens/`.
// `npm run check` (`--check`): writes nothing, fails if a file is out of date.
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { generated } from "./generated.mjs";
import { root } from "./tokens.mjs";

const { values } = parseArgs({ options: { check: { type: "boolean" } }, strict: true });

let stale = 0;
for (const [file, text] of generated()) {
  const target = path.join(root, file);
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
  if (current === text) continue;
  if (values.check) {
    console.error(`out of date: ${file}`);
    stale++;
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
    console.log(`wrote ${file}`);
  }
}
if (stale) {
  console.error("run `npm run build` and commit the result");
  process.exit(1);
}

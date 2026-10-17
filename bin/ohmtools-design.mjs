#!/usr/bin/env node
// Checks a project against the ohmtools design, from that project's root or CI:
//   npx --yes github:ohmtools/design check src/index.css components.json src/components/ui/*.tsx
import { parseArgs } from "node:util";
import { checkFile } from "../scripts/check.mjs";

const USAGE = `usage: ohmtools-design check <file>...

  *.css            a file that declares --primary must carry the theme unchanged
  components.json  the shadcn style settings must match shadcn/components.json
  any file         no uppercase text, no wide letter spacing`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { help: { type: "boolean", short: "h" } },
  strict: true,
});
const [command, ...files] = positionals;
if (values.help || command !== "check" || files.length === 0) {
  console.error(USAGE);
  process.exit(values.help ? 0 : 2);
}

let failed = 0;
for (const file of files) {
  const problems = checkFile(file);
  for (const problem of problems) console.error(`${file}: ${problem}`);
  if (problems.length) failed++;
}
if (failed) {
  console.error(`${failed} of ${files.length} files do not follow the ohmtools design (DESIGN.md)`);
  process.exit(1);
}
console.log(`${files.length} files follow the ohmtools design`);

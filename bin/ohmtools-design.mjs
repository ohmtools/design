#!/usr/bin/env node
// The ohmtools design for another project, from that project's root or CI:
//   npx --yes github:ohmtools/design check src/index.css components.json src/components/**/*.tsx
//   npx --yes github:ohmtools/design add responsive-dialog settings
import { parseArgs } from "node:util";
import { checkFile } from "../scripts/check.mjs";
import { add, components } from "../scripts/components.mjs";

const USAGE = `usage: ohmtools-design check <file>...
       ohmtools-design add [--force] <component>... | --all
       ohmtools-design list

check: exits 1 when a file does not follow the design
  *.css            a file that declares --primary must carry the theme unchanged
                   (with tailwindcss: also the step variants and popup-glass)
  components.json  the shadcn style settings must match shadcn/components.json
  copied component a file with the design's marker must equal the design's copy
  any file         no uppercase text, no wide letter spacing

add: copies shared components (and what they import) into src/, the same
  paths as in shadcn/src/; a file of the app's own stays unless --force.
list: the shared components and what each one imports.`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    help: { type: "boolean", short: "h" },
    all: { type: "boolean" },
    force: { type: "boolean" },
  },
  strict: true,
});
const [command, ...args] = positionals;

if (values.help) {
  console.log(USAGE);
} else if (command === "check" && args.length) {
  let failed = 0;
  for (const file of args) {
    const problems = checkFile(file);
    for (const problem of problems) console.error(`${file}: ${problem}`);
    if (problems.length) failed++;
  }
  if (failed) {
    console.error(
      `${failed} of ${args.length} files do not follow the ohmtools design (DESIGN.md)`,
    );
    process.exit(1);
  }
  console.log(`${args.length} files follow the ohmtools design`);
} else if (command === "add" && (args.length || values.all)) {
  const names = values.all ? components().map((c) => c.name) : args;
  let outcome;
  try {
    outcome = add(names, { force: values.force });
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  for (const { file, status } of outcome.results) console.log(`${status}: ${file}`);
  if (outcome.packages.length)
    console.log(`\nstill to install: npm install ${outcome.packages.join(" ")}`);
} else if (command === "list" && !args.length) {
  for (const c of components()) {
    const uses = c.uses.length ? ` (uses ${c.uses.join(", ")})` : "";
    console.log(`${c.name.padEnd(24)} ${c.target}${uses}`);
  }
} else {
  console.error(USAGE);
  process.exit(2);
}

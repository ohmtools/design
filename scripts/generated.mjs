// The list of generated files: repository path -> expected content.
import fs from "node:fs";
import path from "node:path";
import {
  DESIGN_CSS,
  appCss,
  latexSty,
  shadcnCss,
  tokensCss,
  tokensJson,
  withColourTable,
} from "./outputs.mjs";
import { loadTokens, root } from "./tokens.mjs";

export function generated() {
  const t = loadTokens();
  const design = fs.readFileSync(path.join(root, "DESIGN.md"), "utf8");
  return [
    [DESIGN_CSS, shadcnCss(t)],
    ["shadcn/index.css", appCss()],
    ["dist/tokens.css", tokensCss(t)],
    ["dist/tokens.json", tokensJson(t)],
    ["dist/ohmtools-colors.sty", latexSty(t)],
    ["DESIGN.md", withColourTable(design, t)],
  ];
}

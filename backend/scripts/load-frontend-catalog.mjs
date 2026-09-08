import fs from "fs";
import path from "path";
import vm from "vm";
import ts from "typescript";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const catalogPath = path.resolve(__dirname, "../../src/data/catalog.ts");

export function loadFrontendCatalog() {
  let source = fs.readFileSync(catalogPath, "utf8");

  source = source.replace(
    /^import\s+([a-zA-Z0-9_]+)\s+from\s+["']@\/assets\/([^"']+)["'];$/gm,
    (_match, name, assetPath) => `const ${name} = "/assets/${assetPath.replace(/\\/g, "/")}";`,
  );

  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });

  const sandbox = {
    module: { exports: {} },
    exports: null,
    require: createRequire(import.meta.url),
    console,
    globalThis: {},
  };
  sandbox.exports = sandbox.module.exports;

  vm.runInNewContext(output.outputText, sandbox, { filename: "catalog.cjs" });
  return sandbox.module.exports;
}

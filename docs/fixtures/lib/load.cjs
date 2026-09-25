// Load app TS modules (with their @/ and relative imports) in plain node for tests.
const ts = require("C:/Users/realy/OneDrive/Documents/Work/DashUI/node_modules/typescript");
const fs = require("fs"), path = require("path");
const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const cache = {};
const projectRequire = require("module").createRequire(ROOT + "/package.json");
function load(file) {
  file = path.resolve(file);
  if (cache[file]) return cache[file].exports;
  const m = { exports: {} }; cache[file] = m;
  const js = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.React } }).outputText;
  const req = (p) => {
    if (p.startsWith("@/")) p = ROOT + "/" + p.slice(2);
    else if (p.startsWith(".")) p = path.resolve(path.dirname(file), p);
    else return projectRequire(p);
    for (const ext of [".ts", ".tsx", ""]) if (fs.existsSync(p + ext)) return load(p + ext);
    return projectRequire(p);
  };
  new Function("module", "exports", "require", js)(m, m.exports, req);
  return m.exports;
}
module.exports = { load, ROOT };

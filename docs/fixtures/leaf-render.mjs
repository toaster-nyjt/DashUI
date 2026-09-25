// Renders one config's leaves at their real box sizes with the run's own primitives (from the
// run log) and the app's FitText, then probes each box: hidden vertical overflow (content
// past the box: root, or the scroll body the post-processor adds) and horizontal overflow.
// Usage: node leaf-render.mjs --log=<task jsonl> --dir=<config dir> --out=<html>
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const ROOT = "C:/Users/realy/OneDrive/Documents/Work/DashUI";
const ts = createRequire(ROOT + "/package.json")("typescript");
const arg = (k) => process.argv.find((a) => a.startsWith("--" + k + "="))?.slice(k.length + 3);
const L = fs.readFileSync(arg("log"), "utf8").trim().split("\n").map(JSON.parse);
const dir = arg("dir");
const inputs = JSON.parse(fs.readFileSync("leaf-inputs.json", "utf8")).filter((x, i, a) => a.findIndex((y) => y.leaf === x.leaf) === i);

const tx = (src) => ts.transpileModule(src, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;
const fit = fs.readFileSync(ROOT + "/app/api/SKILLS.ts", "utf8").match(/export const FIT_TEXT_SOURCE = `([\s\S]*?)`;/)[1].replace(/^export\s+/gm, "");
// Each type's passing code (last primitive entry without errors).
const prims = {};
for (const e of L) if (e.stage === "primitive" && e.code && !e.errors?.length) prims[e.type] = e.code;
const primJs = Object.values(prims).map((c) => tx(c.replace(/^export\s+/gm, ""))).join("\n");
const leaves = inputs.map((inp, i) => {
  const f = path.join(dir, i + ".tsx");
  if (!fs.existsSync(f)) return `null`;
  const js = tx(fs.readFileSync(f, "utf8").replace(/export\s+default\s+function\s+GeneratedComponent/, "function GeneratedComponent"));
  return `(function(){ ${js}\n return GeneratedComponent; })()`;
});

const html = `<title>${path.basename(dir)}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<body style="background:#050505;color:#aaa;font:12px sans-serif;margin:0;padding:12px">
<div id="root"></div>
<script>
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
${tx(fit)}
${primJs}
const LEAVES = [${leaves.join(",\n")}];
const META = ${JSON.stringify(inputs.map((x) => ({ leaf: x.leaf, box: x.boxSize })))};
const h = React.createElement;
class Guard extends React.Component { constructor(p){super(p);this.state={e:null};} static getDerivedStateFromError(e){return {e};} render(){ return this.state.e ? h("pre",{"data-err":"1",style:{color:"#f55"}},String(this.state.e.message||this.state.e)) : this.props.children; } }
function App(){ return h("div",null, META.map((m,i)=> h("div",{key:i,style:{marginBottom:14}},
  h("div",{style:{marginBottom:3}}, m.leaf + " — " + Math.round(m.box.x) + "x" + Math.round(m.box.y)),
  h("div",{"data-box":i,className:"bg-zinc-950",style:{width:m.box.x,height:m.box.y,outline:"1px solid #333",overflow:"hidden",position:"relative"}},
    LEAVES[i] ? h(Guard,null,h(LEAVES[i])) : h("i",null,"missing"))))); }
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
setTimeout(()=>{ const out=[]; document.querySelectorAll("[data-box]").forEach((b)=>{ const root=b.firstElementChild; if(!root){out.push({i:+b.dataset.box,missing:true});return;}
  const err=!!b.querySelector("[data-err]");
  const scrollers=[root,...root.children];
  const v=Math.max(0,...scrollers.map((el)=>el.scrollHeight-el.clientHeight));
  const hz=Math.max(0,root.scrollWidth-root.clientWidth);
  out.push({i:+b.dataset.box,err,vOverflowRem:+(v/16).toFixed(1),hOverflowRem:+(hz/16).toFixed(1)}); });
  const p=document.createElement("pre"); p.id="probe"; p.textContent=JSON.stringify(out); document.body.appendChild(p); }, 900);
</script>`;
fs.writeFileSync(arg("out"), html);

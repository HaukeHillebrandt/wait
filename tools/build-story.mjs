// build-story.mjs — generate a readable story.html from the STORY array in index.html.
// Prose (think/quote/todo/pause) is shown; all "code stuff" (tool calls, spinners,
// result blocks) is grouped into collapsed <details>. Prints a word count.
//
//   node tools/build-story.mjs
//
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const m = html.match(/const STORY = \[([\s\S]*?)\n\];/);
if (!m) { console.error("could not find STORY array"); process.exit(1); }
const STORY = eval("[" + m[1] + "\n]");   // the array literal is plain JS data

const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const words = (s) => (String(s).match(/[A-Za-z0-9µ-ɏΑ-Ωα-ω’'`-]+/g) || []).length;

const PROSE = new Set(["think", "quote", "todo", "pause"]);
let proseWords = 0, codeWords = 0;

// ---- group segments: runs of non-prose collapse into one <details> ----
const blocks = [];
let pending = [];
const flush = () => { if (pending.length) { blocks.push({ code: pending }); pending = []; } };
for (const seg of STORY) {
  if (PROSE.has(seg.kind)) { flush(); blocks.push({ prose: seg }); }
  else pending.push(seg);
}
flush();

// ---- render ----
const parts = [];
for (const b of blocks) {
  if (b.prose) {
    const s = b.prose;
    if (s.kind === "think") {
      proseWords += words(s.text);
      parts.push(`<p class="think">${esc(s.text)}</p>`);
    } else if (s.kind === "quote") {
      proseWords += words(s.text);
      const talk = s.opts && s.opts.src === "talk";
      const cite = talk ? "the talk on writing the constitution" : "Claude’s Constitution";
      parts.push(`<blockquote class="quote${talk ? " talk" : ""}">${esc(s.text)}<cite>— ${cite}</cite></blockquote>`);
    } else if (s.kind === "todo") {
      const o = s.opts || {};
      proseWords += words(s.text) + (o.items || []).reduce((n, it) => n + words(it.t), 0);
      const items = (o.items || []).map((it) => {
        const mk = it.s === "ok" ? "✔" : it.s === "now" ? "◼" : "☐";
        return `<li class="${it.s}">${mk} ${esc(it.t)}</li>`;
      }).join("");
      parts.push(`<div class="todo"><div class="todo-h">✳ ${esc(s.text)}${o.meta ? ` <span>(${esc(o.meta)})</span>` : ""}</div><ul>${items}</ul></div>`);
    } else if (s.kind === "pause") {
      proseWords += words(s.text) + words((s.opts && s.opts.sub) || "");
      parts.push(`<div class="pause">··· ${esc(s.text)} ···${s.opts && s.opts.sub ? `<span>${esc(s.opts.sub)}</span>` : ""}</div>`);
    }
  } else {
    // collapsed code run
    const tools = b.code.filter((x) => x.kind === "tool").map((x) => x.text);
    const summary = tools.length ? tools.map(esc).join("  ·  ") : "agent output";
    const body = b.code.map((x) => {
      codeWords += words(x.text);
      if (x.kind === "tool")    return `<div class="t">● ${esc(x.text)}</div>`;
      if (x.kind === "spinner") return `<div class="sp">⟳ ${esc(x.text)}</div>`;
      if (x.kind === "result-summary") return `<div class="rs">⎿ ${esc(x.text)}</div>`;
      return `<pre>${esc(x.text)}</pre>`;
    }).join("\n");
    parts.push(`<details class="code"><summary>${summary} <em>— show output</em></summary>\n${body}\n</details>`);
  }
}

const total = proseWords + codeWords;
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wait — (raw story)</title>
<style>
  :root { --bg:#0e0e13; --fg:#e8e3d6; --dim:#8a8a96; --accent:#ffb454; --quote:#e5c07b; --talk:#56b6c2; --line:#2a2a35; }
  body { margin:0; background:var(--bg); color:var(--fg); padding:40px 20px;
    font:17px/1.7 Georgia,"Iowan Old Style",serif; }
  main { max-width:720px; margin:0 auto; }
  h1 { font:600 30px/1.1 ui-monospace,Menlo,monospace; letter-spacing:-.5px; margin:0 0 4px; }
  h1 .em { color:var(--accent); }
  .meta { color:var(--dim); font:13px/1.5 ui-monospace,monospace; margin-bottom:28px; }
  .meta b { color:var(--accent); }
  p.think { margin:0 0 18px; }
  blockquote.quote { margin:18px 0; padding:6px 0 6px 18px; border-left:3px solid var(--quote);
    color:var(--quote); font-style:italic; }
  blockquote.quote.talk { border-left-color:var(--talk); color:var(--talk); }
  blockquote.quote cite { display:block; margin-top:6px; font:12px/1.4 ui-monospace,monospace;
    font-style:normal; opacity:.6; }
  .todo { margin:18px 0; font:13.5px/1.6 ui-monospace,monospace; }
  .todo-h { color:var(--accent); } .todo-h span { color:var(--dim); }
  .todo ul { list-style:none; margin:4px 0 0; padding-left:18px; color:var(--dim); }
  .todo li.ok { color:#98c379; } .todo li.now { color:var(--accent); }
  .pause { text-align:center; color:var(--accent); font:600 14px/1.5 ui-monospace,monospace;
    letter-spacing:1px; margin:30px 0; border-top:1px dashed var(--line);
    border-bottom:1px dashed var(--line); padding:12px 0; }
  .pause span { display:block; color:var(--dim); font-weight:400; font-size:12px; letter-spacing:0;
    font-style:italic; margin-top:4px; }
  details.code { margin:14px 0; border:1px solid var(--line); border-radius:6px;
    background:#15151d; font:12.5px/1.5 ui-monospace,Menlo,monospace; }
  details.code > summary { cursor:pointer; padding:8px 12px; color:var(--accent); list-style:none; }
  details.code > summary em { color:var(--dim); font-style:normal; }
  details.code[open] > summary { border-bottom:1px solid var(--line); }
  details.code .t { color:var(--accent); padding:8px 12px 0; }
  details.code .sp,.rs { color:var(--dim); padding:2px 12px; }
  details.code pre { margin:6px 12px; padding:10px; background:#0c0c11; border-radius:4px;
    overflow-x:auto; color:#c9c4b6; white-space:pre-wrap; word-break:break-word; }
</style></head><body><main>
<h1>Wait<span class="em"> —</span></h1>
<div class="meta">raw story · code collapsed · <b>${proseWords.toLocaleString()}</b> words of prose
  (${total.toLocaleString()} incl. code blocks) · ${STORY.length} segments</div>
${parts.join("\n")}
</main></body></html>`;

writeFileSync(new URL("../story.html", import.meta.url), page);
console.log(`story.html written`);
console.log(`prose words : ${proseWords}`);
console.log(`code words  : ${codeWords}`);
console.log(`total words : ${total}`);
console.log(`segments    : ${STORY.length}`);

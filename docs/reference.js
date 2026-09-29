// Reference ページの表示処理。
// データは lessons.js（手順）・reference-code.js（Preview から生成したコード）・dictionary.js（辞書）・macros.js（定数・マクロの辞書）にある。
"use strict";

const GENERATIONS = ["dx9", "dx11", "dx12"];
const FOLDER = { dx9: "DX9", dx11: "DX11", dx12: "DX12" };
const API_GROUPS = {
  dx9: ["win32", "wic", "dx9", "math", "common"],
  dx11: ["win32", "wic", "dx11", "dxcommon", "math", "common"],
  dx12: ["win32", "wic", "dx12", "dxcommon", "math", "common"],
};
const STAGE_LABEL = { window: "起動", clear: "確認 1", one: "確認 2", final: "完成" };
const STORAGE_KEY = "kcg-directx-reference";
const SHOT_CAPTION = {
  clear: "F3: 背景色だけ",
  sprite: "F4: Sprite 1枚（透視投影）",
  cube: "F5: 立方体1個（透視投影）",
  final: "F6: 完成（透視投影）",
  "final-ortho": "F6 のあと F1: 完成（平行投影）",
};

let generation = "dx9";
let steps = [];          // 現在の世代の手順（番号付き）
let index = null;        // コード中のリンク用の索引

// ---------- 小さな道具 ----------

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// 文章中の `code` を <code> にする。
function inline(text) {
  return escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 保存できない環境でも表示は続ける。
  }
}

// ---------- 手順の組み立て ----------

function buildSteps() {
  const lesson = LESSONS[generation];
  let number = 0;
  steps = [];
  lesson.chapters.forEach((chapter, chapterIndex) => {
    chapter.steps.forEach(step => {
      number += 1;
      steps.push({ ...step, number, chapterIndex, id: `${generation}-${number}` });
    });
  });
}

function codeForStep(step) {
  const code = CODE[generation];
  switch (step.kind) {
    case "block":
    case "main":
      return code.blocks[step.kind === "main" ? "main" : step.target];
    case "shader":
      return code.shader;
    case "member":
      return code.functions[step.target];
    case "helpers": {
      const parts = step.target.map(name => code.functions[name]);
      return {
        code: parts.map(part => part.code).join("\n\n"),
        units: parts.flatMap((part, i) => part.units.map((unit, j) => (i > 0 && j === 0 ? { ...unit, blank: unit.blank + 1 } : unit))),
        start: Math.min(...parts.map(part => part.start)),
        end: Math.max(...parts.map(part => part.end)),
      };
    }
    default:
      return null;
  }
}

function whereToWrite(step) {
  const file = step.kind === "shader"
    ? `PracticeProj/${FOLDER[generation]}/${FOLDER[generation]}SceneShader.hlsl`
    : `PracticeProj/${FOLDER[generation]}/main.cpp`;
  const signature = step.kind === "member" ? CODE[generation].functions[step.target].signature : "";
  const places = {
    headers: { search: "// TODO 1:", how: "この行を消して、その場所に下のコードを1文ずつ貼る。" },
    types: { search: "// TODO 2:", how: "この行を消して、その場所に下のコードを1文ずつ貼る。" },
    renderer: { search: "// TODO 4:", how: "この行を消して、その場所に下のコードを1文ずつ貼る。" },
  };
  if (step.kind === "block") return { file, ...places[step.target] };
  if (step.kind === "helpers") {
    return { file, search: "// TODO 3:", how: "この行のすぐ上に下のコードを1文ずつ貼り、TODO 3 との間を1行あける。TODO 3 の行は消さない（次の補助関数もこの上に足していく）。" };
  }
  if (step.kind === "main") {
    return { file, search: "// TODO 5:", how: "この行からファイルの最後までを消して（Ctrl + Shift + End で選択できる）、その場所に下のコードを1文ずつ貼る。" };
  }
  if (step.kind === "member") {
    return { file, search: `// TODO: ${step.target}`, how: `Renderer の ${signature} の中にある、この行を消して、その場所に下のコードを1文ずつ貼る。`, signature };
  }
  return { file, search: "", how: "ソリューション エクスプローラーでこのファイルを開き、中身を全部消してから下のコードを1文ずつ貼る。" };
}

// ---------- コードの色付けとリンク ----------

const KEYWORDS = new Set(("auto bool break case catch class const constexpr continue default delete do double else enum explicit false float for if " +
  "int long namespace new noexcept nullptr operator private protected public return short signed sizeof static static_assert static_cast struct switch " +
  "template this throw true try typedef typename union unsigned using virtual void volatile while reinterpret_cast alignas " +
  "cbuffer register float2 float3 float4 float4x4 Texture2D SamplerState").split(" "));

function buildIndex() {
  const groups = new Set(API_GROUPS[generation]);
  const apis = new Map();   // 短い名前 → API の配列
  DICTIONARY.apis.filter(api => groups.has(api.group)).forEach(api => {
    api.name.split(" / ").forEach(part => {
      const short = part.replace(/\s*\(HLSL\)$/, "").split(/::|\./).at(-1).trim();
      if (!/^\w+$/.test(short) || ["Get", "As"].includes(short)) return;
      if (!apis.has(short)) apis.set(short, []);
      if (!apis.get(short).includes(api)) apis.get(short).push(api);
    });
  });
  const types = new Map();
  DICTIONARY.types.filter(type => groups.has(type.group) || type.group === "wic" || type.group === "win32").forEach(type => {
    type.name.split(" / ").forEach(part => types.set(part.trim(), type));
  });
  const macros = new Map();  // 値の名前 → その値が属する系統
  MACROS.filter(family => groups.has(family.group)).forEach(family => {
    family.values.forEach(([name]) => macros.set(name, family));
  });
  const functions = new Map();
  steps.forEach(step => {
    if (step.type !== "code") return;
    const names = step.kind === "helpers" ? step.target : step.kind === "member" ? [step.target] : [];
    names.forEach(name => functions.set(name, step));
  });
  index = { apis, types, macros, functions };
}

// 同じ名前の API が複数あるときは、「->」の左側の変数名から選ぶ（m_swapChain->Present など）。
function pickApi(candidates, receiver) {
  if (candidates.length === 1 || !receiver) return candidates[0];
  const name = receiver.replace(/^m_/, "");
  const owner = api => api.name.split("::")[0].toLowerCase();
  // まず変数名全体（swapChain → IDXGISwapChain）、だめなら最後の単語（iconTexture → Texture）で探す。
  const lastWord = name.split(/(?=[A-Z])/).at(-1).toLowerCase();
  return candidates.find(api => owner(api).includes(name.toLowerCase()))
    ?? candidates.find(api => owner(api).includes(lastWord))
    ?? candidates[0];
}

function highlight(code) {
  const pattern = /(\/\/[^\n]*)|(^[ \t]*#[^\n]*)|(L?"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?f?\b)|([A-Za-z_]\w*)/gm;
  let html = "";
  let last = 0;
  let match;
  while ((match = pattern.exec(code))) {
    html += escapeHtml(code.slice(last, match.index));
    last = pattern.lastIndex;
    const [text, comment, preprocessor, string, number, word] = match;
    if (comment) html += `<span class="c">${escapeHtml(text)}</span>`;
    else if (preprocessor) html += `<span class="p">${escapeHtml(text)}</span>`;
    else if (string) html += `<span class="s">${escapeHtml(text)}</span>`;
    else if (number) html += `<span class="n">${text}</span>`;
    else if (word) html += linkWord(word, code, match.index);
  }
  return html + escapeHtml(code.slice(last));
}

function linkWord(word, code, position) {
  if (KEYWORDS.has(word)) return `<span class="k">${word}</span>`;
  const receiver = code.slice(Math.max(0, position - 40), position).match(/(\w+)\s*(?:->|\.)\s*$/)?.[1];
  // 自分で書く関数（CreateDevice(hwnd) や renderer.Render() など）は、同じ名前の API より手順へのリンクを優先する。
  if (!receiver || receiver === "renderer") {
    const step = index.functions.get(word);
    if (step) return `<a class="ref fn" href="#${step.id}" title="手順 ${step.number}: ${escapeHtml(step.title)}">${word}</a>`;
    if (receiver) return word;
  }
  if (index.apis.has(word)) {
    const api = pickApi(index.apis.get(word), receiver);
    return `<button type="button" class="ref api" data-api="${escapeHtml(api.name)}">${word}</button>`;
  }
  if (index.types.has(word)) {
    return `<button type="button" class="ref type" data-type="${escapeHtml(index.types.get(word).name)}">${word}</button>`;
  }
  if (index.macros.has(word)) {
    return `<button type="button" class="ref macro" data-macro="${word}">${word}</button>`;
  }
  return word;
}

// ---------- 描画 ----------

function renderTabs() {
  document.querySelectorAll("button[data-generation]").forEach(button => {
    button.classList.toggle("active", button.dataset.generation === generation);
    button.setAttribute("aria-pressed", button.dataset.generation === generation);
  });
  document.querySelector("#assignment-link").href = `assignment.html#${generation}`;
  document.documentElement.dataset.generation = generation;
  document.title = `${LESSONS[generation].label} 実装ガイド`;
}

function renderOverview() {
  const lesson = LESSONS[generation];
  const images = ["clear", "sprite", "cube", "final"];
  const captions = ["確認 1（F3）: 背景色だけ", "確認 2（F4）: Sprite 1枚", "確認 2（F5）: 立方体1個", "完成（F6）: 物体を並べた場面"];
  document.querySelector("#overview").innerHTML = `
    <p class="eyebrow">${escapeHtml(lesson.label)}</p>
    <h1>${escapeHtml(lesson.theme)}</h1>
    ${lesson.intro.map(text => `<p class="lead">${inline(text)}</p>`).join("")}
    <div class="milestones">
      ${images.map((name, i) => `
        <figure>
          <img src="checkpoints/${generation}-${name}.png" alt="${escapeHtml(captions[i])}" width="1280" height="720" loading="lazy">
          <figcaption>${escapeHtml(captions[i])}</figcaption>
        </figure>`).join("")}
    </div>
    <div class="howto">
      <h2>進め方</h2>
      <ol>
        <li>ダウンロードしたフォルダーの <b><code>PracticeProj/PracticeProj.sln</code></b> を Visual Studio で開く。構成は <b>Debug / x64</b>、今日の世代をスタートアップ プロジェクトにする。</li>
        <li>手順を上から順に進める。<b>「貼る場所」の文字を Ctrl + F で検索</b>する。コードは<b>文の末尾の「コピー」で1文ずつ</b>（直前のコメントも一緒に）コピーできる。定型の手順は右上の「全部コピー」でまとめて貼ってよい。</li>
        <li>1手順ごとに <b>Ctrl + Shift + B</b> でビルドする。エラーが出たら次へ進まず、直前に貼った文を見直す（貼り忘れ・二重貼りが多い）。</li>
        <li><span class="run-chip">起動</span> の手順だけ <b>Ctrl + F5</b> で起動し、見本の画像と見比べる。</li>
      </ol>
      <p class="note">講師の説明に合わせて1文ずつ、何をしている文かを読んでから貼ります。「定型」の手順は、説明を読んで役割が分かれば、中身は貼るだけで十分です。「ここが本題」の手順は、コードの中のコメントと下の「ここを見る」も読みます。コード中の青い名前をクリックすると辞書が開きます。</p>
    </div>`;
}

function renderToc() {
  const lesson = LESSONS[generation];
  const done = loadState().done ?? {};
  document.querySelector("#toc").innerHTML = lesson.chapters.map((chapter, chapterIndex) => `
    <div class="toc-chapter">
      <a class="toc-title" href="#${generation}-ch${chapterIndex}">${chapterIndex}. ${escapeHtml(chapter.title)}</a>
      <ol>
        ${steps.filter(step => step.chapterIndex === chapterIndex).map(step => `
          <li class="${step.type === "run" ? "toc-run" : ""} ${done[step.id] ? "done" : ""}">
            <a href="#${step.id}"><span>${step.number}</span>${escapeHtml(step.type === "run" ? `${STAGE_LABEL[step.stage]}: 起動して確認` : step.title)}</a>
          </li>`).join("")}
      </ol>
    </div>`).join("") + `
    <div class="toc-chapter">
      <a class="toc-title" href="#compare">3世代の比較</a>
      <a class="toc-title" href="#dictionary">辞書</a>
    </div>`;
  renderProgress();
}

function renderProgress() {
  const done = loadState().done ?? {};
  const count = steps.filter(step => done[step.id]).length;
  document.querySelector("#progress").innerHTML = `
    <div class="progress-label"><b>${escapeHtml(LESSONS[generation].label)}</b><span>${count} / ${steps.length}</span></div>
    <div class="progress-bar"><span style="width:${(count / steps.length) * 100}%"></span></div>`;
}

function renderCodeStep(step, done) {
  const code = codeForStep(step);
  const where = whereToWrite(step);
  const lineCount = code.code.split("\n").length;
  const source = step.kind === "shader" ? `PreviewProj/${FOLDER[generation]}/${code.path}` : CODE[generation].source;
  const codeHtml = `<pre class="code"><code>${renderUnits(step, code.units)}</code></pre>`;
  return `
    <article class="step ${step.routine ? "is-routine" : "is-core"}" id="${step.id}">
      <header class="step-head">
        <span class="step-number">${step.number}</span>
        <h3>${escapeHtml(step.title)}</h3>
        <span class="badge">${step.routine ? "定型" : "ここが本題"}</span>
        <label class="done-toggle" title="できたら印を付ける"><input type="checkbox" data-done="${step.id}" ${done ? "checked" : ""}> できた</label>
      </header>
      <div class="why">${step.why.map(text => `<p>${inline(text)}</p>`).join("")}</div>
      ${step.diff ? `<p class="diff"><b>他の世代との違い</b>${inline(step.diff)}</p>` : ""}
      <div class="where">
        <div class="where-file">${escapeHtml(where.file)}</div>
        ${where.search ? `<div class="where-search"><span>貼る場所</span><code>${escapeHtml(where.search)}</code></div>` : ""}
        <p>${escapeHtml(where.how)}</p>
      </div>
      <div class="code-box">
        <div class="code-toolbar">
          <span>${escapeHtml(step.kind === "member" ? `${step.target} の中身` : step.kind === "helpers" ? step.target.join(" / ") : step.kind === "shader" ? code.path : step.kind === "main" ? "wWinMain" : { headers: "include などの宣言", types: "データの型", renderer: "Renderer クラス（中身は TODO）" }[step.target])}（${lineCount} 行）</span>
          <button type="button" class="mini-button" data-copy-all="${step.id}">全部コピー</button>
        </div>
        ${codeHtml}
      </div>
      ${step.look ? `<div class="look"><b>ここを見る</b><ul>${step.look.map(text => `<li>${inline(text)}</li>`).join("")}</ul></div>` : ""}
      <footer class="step-foot">
        <span>貼り終えたら <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> でビルド。エラー 0 件なら次へ。</span>
        <span class="source">見本: ${escapeHtml(source)} ${code.start}–${code.end} 行</span>
      </footer>
    </article>`;
}

// ---------- 1文ずつコピー ----------

function renderUnits(step, units) {
  let html = "";
  units.forEach((unit, i) => {
    html += "\n".repeat(unit.blank);
    if (unit.comment) html += `<span class="c">${escapeHtml(unit.comment)}</span>\n`;
    if (!unit.code) return;
    html += `<span class="unit">${highlight(unit.code)}`
      + `<button type="button" class="unit-copy" data-copy-unit="${i}" data-step-id="${step.id}" title="この文を（直前のコメントも含めて）コピー">コピー</button></span>\n`;
  });
  return html.replace(/\n$/, "");
}

function unitsForStep(stepId) {
  return codeForStep(steps.find(item => item.id === stepId)).units;
}

async function copyText(text, button, label) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  button.textContent = "✓ コピー済み";
  button.classList.add("copied");
  setTimeout(() => {
    button.textContent = label;
    button.classList.remove("copied");
  }, 1200);
}

function copyUnit(stepId, index, button) {
  const unit = unitsForStep(stepId)[index];
  copyText((unit.comment ? `${unit.comment}\n` : "") + unit.code + "\n", button, "コピー");
}

function copyAll(stepId, button) {
  copyText(codeForStep(steps.find(item => item.id === stepId)).code + "\n", button, "全部コピー");
}

function renderRunStep(step, done) {
  const images = step.images ?? [];
  return `
    <article class="step run-step" id="${step.id}">
      <header class="step-head">
        <span class="step-number">${step.number}</span>
        <h3>${escapeHtml(step.title)}</h3>
        <span class="badge run">${escapeHtml(STAGE_LABEL[step.stage])}</span>
        <label class="done-toggle"><input type="checkbox" data-done="${step.id}" ${done ? "checked" : ""}> できた</label>
      </header>
      <ol class="keys">
        ${step.keys.map(([key, text]) => `<li><kbd>${escapeHtml(key)}</kbd><span>${escapeHtml(text)}</span></li>`).join("")}
      </ol>
      ${images.length ? `<div class="shots">${images.map(name => `<figure><img src="checkpoints/${name}" alt="見本の画面" width="1280" height="720" loading="lazy"><figcaption>見本: ${escapeHtml(SHOT_CAPTION[name.replace(/^dx\d+-/, "").replace(/\.png$/, "")] ?? "この画面になれば OK")}</figcaption></figure>`).join("")}</div>` : ""}
      <div class="expect"><b>確認すること</b><ul>${step.expect.map(text => `<li>${inline(text)}</li>`).join("")}</ul></div>
      <details class="trouble"><summary>うまくいかないとき</summary><ul>${step.trouble.map(text => `<li>${inline(text)}</li>`).join("")}</ul></details>
    </article>`;
}

function renderChapters() {
  const lesson = LESSONS[generation];
  const done = loadState().done ?? {};
  document.querySelector("#chapters").innerHTML = lesson.chapters.map((chapter, chapterIndex) => `
    <section class="chapter" id="${generation}-ch${chapterIndex}">
      <header class="chapter-head">
        <span class="chapter-number">${chapterIndex}</span>
        <div><h2>${escapeHtml(chapter.title)}</h2><p>${inline(chapter.goal)}</p></div>
      </header>
      ${steps.filter(step => step.chapterIndex === chapterIndex)
        .map(step => step.type === "run" ? renderRunStep(step, done[step.id]) : renderCodeStep(step, done[step.id])).join("")}
    </section>`).join("");
}

function renderCompare() {
  const rows = [
    ["命令を出す相手", "Device", "ImmediateContext（Device は作るだけ）", "CommandList に記録し、CommandQueue で送る"],
    ["頂点の形の伝え方", "FVF", "InputLayout", "InputLayout（PSO の一部）"],
    ["行列の渡し方", "SetTransform", "ConstantBuffer（UpdateSubresource）", "ConstantBuffer（物体ごとに 256byte の場所）"],
    ["Texture の渡し方", "SetTexture", "SRV を PSSetShaderResources", "SRV を DescriptorHeap に置き、RootSignature 経由で指定"],
    ["描き方の設定", "SetRenderState で1項目ずつ", "State オブジェクトを差し替え", "PSO（Shader も含めて1つ）を切り替え"],
    ["描画先の指定", "Device が作った BackBuffer に自動で描く", "BackBuffer の RTV を OMSetRenderTargets", "RTV を棚に置き、場所を OMSetRenderTargets"],
    ["Depth バッファ", "Device を作るときに自動で作られる", "Texture と DSV を自分で作る", "Resource と DSV（棚）を自分で作る"],
    ["Resource の使い方の切り替え", "Direct3D が管理", "Direct3D が管理", "Barrier で自分で宣言（PRESENT ⇄ RENDER_TARGET など）"],
    ["GPU の完了待ち", "Direct3D が管理", "Direct3D が管理", "Fence で自分で待つ"],
  ];
  document.querySelector("#compare").innerHTML = `
    <h2>3世代の比較</h2>
    <p>同じ画面を作るのに、どの世代で何が変わったか。上の世代ほど、Direct3D が裏でやっていたことをアプリが自分で書くようになります。</p>
    <div class="table-wrap"><table>
      <thead><tr><th></th><th class="${generation === "dx9" ? "current" : ""}">DirectX 9</th><th class="${generation === "dx11" ? "current" : ""}">DirectX 11</th><th class="${generation === "dx12" ? "current" : ""}">DirectX 12</th></tr></thead>
      <tbody>${rows.map(([label, ...cells]) => `<tr><th>${escapeHtml(label)}</th>${cells.map((cell, i) => `<td class="${GENERATIONS[i] === generation ? "current" : ""}">${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
}

// ---------- 辞書 ----------

function dictionaryEntries() {
  const groups = new Set(API_GROUPS[generation]);
  return {
    terms: DICTIONARY.terms[generation].map(([name, text]) => ({ name, text })),
    concepts: DICTIONARY.concepts,
    types: DICTIONARY.types.filter(type => groups.has(type.group) || type.group === "wic" || type.group === "win32"),
    apis: DICTIONARY.apis.filter(api => groups.has(api.group)),
    macros: MACROS.filter(family => groups.has(family.group)),
  };
}

function renderDictionary() {
  const entries = dictionaryEntries();
  const state = loadState();
  const tab = state.dictionaryTab ?? "terms";
  const tabs = [["terms", "用語"], ["concepts", "しくみ"], ["types", "型・構造体"], ["apis", "関数（API）"], ["macros", "定数・マクロ"]];
  const list = {
    terms: entries.terms.map(term => `<div class="dict-item" data-term="${escapeHtml(term.name)}"><dt>${escapeHtml(term.name)}</dt><dd>${inline(term.text)}</dd></div>`),
    concepts: entries.concepts.map(concept => `<div class="dict-item" data-term="${escapeHtml(concept.name)}"><dt>${escapeHtml(concept.name)}</dt><dd><p>${inline(concept.beginner)}</p><p class="muted">${inline(concept.why)}</p></dd></div>`),
    types: entries.types.map(type => `<div class="dict-item"><dt><button type="button" class="ref type" data-type="${escapeHtml(type.name)}">${escapeHtml(type.name)}</button></dt><dd>${inline(type.summary)}</dd></div>`),
    apis: entries.apis.map(api => `<div class="dict-item"><dt><button type="button" class="ref api" data-api="${escapeHtml(api.name)}">${escapeHtml(api.name)}</button></dt><dd>${inline(api.summary)}</dd></div>`),
    macros: entries.macros.map(family => `<div class="dict-item"><dt><button type="button" class="ref macro" data-macro="${escapeHtml(family.values[0][0])}">${escapeHtml(family.title)}</button></dt><dd>${inline(family.summary)}</dd></div>`),
  };
  document.querySelector("#dictionary").innerHTML = `
    <h2>辞書（${escapeHtml(LESSONS[generation].label)}）</h2>
    <p>最初から読む必要はありません。コード中の名前をクリックしたときや、<kbd>Ctrl</kbd> + <kbd>K</kbd> で検索したときに使います。</p>
    <div class="dict-tabs">${tabs.map(([key, label]) => `<button type="button" data-dict-tab="${key}" class="${key === tab ? "active" : ""}">${label}<small>${list[key].length}</small></button>`).join("")}</div>
    <dl class="dict-list">${list[tab].join("")}</dl>`;
}

function apiCard(api) {
  const notes = api.notes ?? {};
  return `
    <h3>${escapeHtml(api.name)}</h3>
    <p class="drawer-group">${escapeHtml(DICTIONARY.groups[api.group] ?? api.group)}</p>
    <p>${inline(api.summary)}</p>
    ${notes.beginner ? `<p class="drawer-note">${inline(notes.beginner)}</p>` : ""}
    <pre class="code small"><code>${escapeHtml(api.signature)}</code></pre>
    ${api.params.length ? `<h4>引数</h4><dl class="params">${api.params.map(([name, text]) => `<dt><code>${escapeHtml(name)}</code></dt><dd>${inline(text)}</dd>`).join("")}</dl>` : ""}
    <h4>戻り値</h4><p>${inline(api.returns)}</p>
    <h4>この教材で使う場所</h4><p>${inline(api.when)}</p>
    ${notes.fail ? `<h4>失敗しやすい点</h4><p>${inline(notes.fail)}</p>` : ""}
    ${notes.deep ? `<h4>もう一歩</h4><p>${inline(notes.deep)}</p>` : ""}
    ${(api.tips ?? []).length ? `<ul>${api.tips.map(tip => `<li>${inline(tip)}</li>`).join("")}</ul>` : ""}
    <h4>例</h4><pre class="code small"><code>${escapeHtml(api.example)}</code></pre>`;
}

function typeCard(type) {
  return `
    <h3>${escapeHtml(type.name)}</h3>
    <p class="drawer-group">${escapeHtml(DICTIONARY.groups[type.group] ?? type.group)}</p>
    <p>${inline(type.summary)}</p>
    ${type.fields.length ? `<h4>主なメンバー（右はこの教材での値）</h4><dl class="fields">${type.fields.map(([name, value, text]) => `<dt><code>${escapeHtml(name)}</code><span>${escapeHtml(value)}</span></dt><dd>${inline(text)}</dd>`).join("")}</dl>` : ""}
    <h4>使う場所</h4><p>${inline(type.used)}</p>
    ${type.deep ? `<h4>もう一歩</h4><p>${inline(type.deep)}</p>` : ""}`;
}

// 定数・マクロは系統ごとに表示し、押した値に印を付ける。教材のコードで使っている値には「使用」を付ける。
function macroCard(family, name) {
  const code = codeWordsOfGeneration();
  return `
    <h3>${escapeHtml(family.title)}</h3>
    <p class="drawer-group">${escapeHtml(DICTIONARY.groups[family.group] ?? family.group)}</p>
    <p>${inline(family.summary)}</p>
    <h4>値（「使用」はこの教材のコードで使っている値）</h4>
    <dl class="macro-values">${family.values.map(([value, text]) => `
      <div class="${value === name ? "current" : ""}"><dt><code>${escapeHtml(value)}</code>${code.has(value) ? `<span class="used">使用</span>` : ""}</dt><dd>${inline(text)}</dd></div>`).join("")}
    </dl>
    ${family.note ? `<p class="drawer-note">${inline(family.note)}</p>` : ""}`;
}

let codeWordsCache = {};
function codeWordsOfGeneration() {
  if (!codeWordsCache[generation]) {
    const code = CODE[generation];
    const text = [...Object.values(code.blocks), ...Object.values(code.functions), code.shader].filter(Boolean).map(part => part.code).join("\n");
    codeWordsCache[generation] = new Set(text.match(/\w+/g));
  }
  return codeWordsCache[generation];
}

function findMacroFamily(name) {
  return MACROS.find(family => family.values.some(([value]) => value === name));
}

function openDrawer(kind, name) {
  const drawer = document.querySelector("#drawer");
  const item = kind === "api" ? DICTIONARY.apis.find(api => api.name === name)
    : kind === "macro" ? findMacroFamily(name)
    : DICTIONARY.types.find(type => type.name === name);
  if (!item) return;
  document.querySelector("#drawer-kind").textContent = { api: "関数（API）", macro: "定数・マクロ" }[kind] ?? "型・構造体";
  document.querySelector("#drawer-body").innerHTML = kind === "api" ? apiCard(item) : kind === "macro" ? macroCard(item, name) : typeCard(item);
  drawer.hidden = false;
  drawer.querySelector(".drawer-body").scrollTop = 0;
}

// ---------- 検索 ----------

function searchItems() {
  const entries = dictionaryEntries();
  return [
    ...steps.map(step => ({
      label: step.type === "run" ? `${step.number}. ${step.title}` : `${step.number}. ${step.title}`,
      detail: step.type === "code" ? [step.target].flat().join(" / ") : "起動して確認",
      keywords: `${step.title} ${[step.target ?? ""].flat().join(" ")} ${(step.why ?? []).join(" ")}`,
      kind: "手順",
      open: () => navigate(step.id),
    })),
    ...entries.terms.map(term => ({ label: term.name, detail: term.text, keywords: `${term.name} ${term.text}`, kind: "用語", open: () => navigateToTerm("terms", term.name) })),
    ...entries.concepts.map(concept => ({ label: concept.name, detail: concept.beginner, keywords: `${concept.name} ${concept.short} ${concept.beginner}`, kind: "しくみ", open: () => navigateToTerm("concepts", concept.name) })),
    ...entries.apis.map(api => ({ label: api.name, detail: api.summary, keywords: `${api.name} ${api.summary}`, kind: "API", open: () => pushDrawer("api", api.name) })),
    ...entries.types.map(type => ({ label: type.name, detail: type.summary, keywords: `${type.name} ${type.summary}`, kind: "型", open: () => pushDrawer("type", type.name) })),
    ...entries.macros.flatMap(family => family.values.map(([value, text]) => ({ label: value, detail: text, keywords: `${value} ${family.title} ${text}`, kind: "定数", open: () => pushDrawer("macro", value) }))),
  ];
}

function openDictionaryTab(tab, name) {
  const state = loadState();
  state.dictionaryTab = tab;
  saveState(state);
  renderDictionary();
  const item = name && [...document.querySelectorAll("[data-term]")].find(element => element.dataset.term === name);
  (item ?? document.querySelector("#dictionary")).scrollIntoView({ block: item ? "center" : "start" });
  item?.classList.add("flash");
}

let searchResults = [];
let searchSelected = 0;

function renderSearch() {
  const query = document.querySelector("#search-input").value.trim().toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  const items = searchItems();
  searchResults = words.length
    ? items
      .map(item => {
        const label = item.label.toLowerCase();
        const text = item.keywords.toLowerCase();
        if (!words.every(word => text.includes(word))) return null;
        const score = words.reduce((sum, word) => sum + (label.startsWith(word) ? 3 : label.includes(word) ? 2 : 0), 0);
        return { ...item, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
    : [];
  searchSelected = 0;
  document.querySelector("#search-results").innerHTML = searchResults.length
    ? searchResults.map((item, i) => `<li><button type="button" data-result="${i}" class="${i === 0 ? "selected" : ""}"><span class="result-kind">${item.kind}</span><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.detail.slice(0, 80))}</small></button></li>`).join("")
    : `<li class="empty">${query ? "見つかりませんでした" : `${escapeHtml(LESSONS[generation].label)} の手順・用語・API・型を検索します`}</li>`;
}

function openSearchResult(i) {
  const item = searchResults[i];
  if (!item) return;
  document.querySelector("#search").close();
  item.open();
}

// ---------- 全体 ----------

function render() {
  buildSteps();
  buildIndex();
  renderTabs();
  renderOverview();
  renderToc();
  renderChapters();
  renderCompare();
  renderDictionary();
}

function setGeneration(next) {
  if (!GENERATIONS.includes(next) || next === generation && document.querySelector("#chapters").children.length) return;
  generation = next;
  const state = loadState();
  state.generation = generation;
  saveState(state);
  render();
}

// ---------- 履歴（ブラウザの「戻る」「進む」） ----------
// 履歴の1件ごとに「世代・どの見出しから何 px 下を見ていたか・開いていた辞書」を保存し、
// 戻る / 進むのときにその場所をそのまま復元する。
// px だけでなく見出し（手順）を基準にするのは、世代を切り替えて描き直したときに位置がずれないようにするため。

const ANCHOR_SELECTOR = "#overview, .chapter, .step, #compare, #dictionary";

function currentPosition() {
  const topbar = document.querySelector(".topbar").offsetHeight;
  let anchor = null;
  for (const element of document.querySelectorAll(ANCHOR_SELECTOR)) {
    if (element.getBoundingClientRect().top - topbar > 1) break;
    anchor = element;
  }
  if (!anchor?.id) return { anchor: null, offset: 0, scrollY: window.scrollY };
  const top = anchor.getBoundingClientRect().top + window.scrollY;
  return { anchor: anchor.id, offset: window.scrollY - top, scrollY: window.scrollY };
}

function saveHistoryPosition() {
  history.replaceState({ ...(history.state ?? {}), generation, ...currentPosition() }, "");
}

function restorePosition(state) {
  const element = state.anchor && document.getElementById(state.anchor);
  window.scrollTo(0, element ? element.getBoundingClientRect().top + window.scrollY + state.offset : state.scrollY ?? 0);
}

function scrollToId(id) {
  if (!id || GENERATIONS.includes(id)) {
    window.scrollTo(0, 0);
    return;
  }
  document.getElementById(id)?.scrollIntoView();
}

// 別の場所へ移動する。今いる場所を今の履歴に保存してから、移動先の履歴を積む。
function navigate(hash) {
  saveHistoryPosition();
  const target = GENERATIONS.find(key => hash === key || hash.startsWith(`${key}-`));
  if (target) setGeneration(target);
  history.pushState({ generation }, "", `#${hash}`);
  closeDrawer();
  scrollToId(hash);
  saveHistoryPosition();
}

function navigateToTerm(tab, name) {
  saveHistoryPosition();
  history.pushState({ generation }, "", location.hash);
  closeDrawer();
  openDictionaryTab(tab, name);
  saveHistoryPosition();
}

// 辞書パネルを開くのも履歴に積む（「戻る」でパネルが閉じ、元の場所のまま）。
function pushDrawer(kind, name) {
  saveHistoryPosition();
  history.pushState({ ...history.state, drawer: { kind, name } }, "");
  openDrawer(kind, name);
}

function closeDrawer() {
  document.querySelector("#drawer").hidden = true;
}

function requestCloseDrawer() {
  if (history.state?.drawer) history.back();
  else closeDrawer();
}

window.addEventListener("popstate", event => {
  const state = event.state;
  if (state?.generation) {
    setGeneration(state.generation);
    if (state.drawer) openDrawer(state.drawer.kind, state.drawer.name);
    else closeDrawer();
    if (state.anchor || state.scrollY != null) {
      restorePosition(state);
      return;
    }
  }
  // URL の # を手で書き換えたときなど、位置の記録がない履歴
  const hash = decodeURIComponent(location.hash.slice(1));
  const target = GENERATIONS.find(key => hash === key || hash.startsWith(`${key}-`));
  if (target) setGeneration(target);
  closeDrawer();
  scrollToId(hash);
  saveHistoryPosition();
});

// スクロールするたびに（少し待ってから）今の履歴へ位置を保存する。
let scrollSaveTimer = null;
window.addEventListener("scroll", () => {
  clearTimeout(scrollSaveTimer);
  scrollSaveTimer = setTimeout(saveHistoryPosition, 150);
}, { passive: true });

// ---------- 操作 ----------

document.addEventListener("click", event => {
  const target = event.target.closest("button, a");
  if (!target) return;
  if (target.dataset.copyUnit) {
    copyUnit(target.dataset.stepId, Number(target.dataset.copyUnit), target);
    return;
  }
  if (target.dataset.copyAll) {
    copyAll(target.dataset.copyAll, target);
    return;
  }
  const href = target.getAttribute("href");
  if (target.tagName === "A" && href?.startsWith("#") && target.dataset.action !== "top") {
    event.preventDefault();
    navigate(decodeURIComponent(href.slice(1)));
  } else if (target.dataset.generation) {
    navigate(target.dataset.generation);
  } else if (target.dataset.api) {
    pushDrawer("api", target.dataset.api);
  } else if (target.dataset.type) {
    pushDrawer("type", target.dataset.type);
  } else if (target.dataset.macro) {
    pushDrawer("macro", target.dataset.macro);
  } else if (target.dataset.dictTab) {
    openDictionaryTab(target.dataset.dictTab);
  } else if (target.dataset.result) {
    openSearchResult(Number(target.dataset.result));
  } else if (target.dataset.action === "search") {
    openSearch();
  } else if (target.dataset.action === "close-drawer") {
    requestCloseDrawer();
  } else if (target.dataset.action === "top") {
    event.preventDefault();
    window.scrollTo(0, 0);
  }
});

document.addEventListener("change", event => {
  const id = event.target.dataset.done;
  if (!id) return;
  const state = loadState();
  state.done = { ...(state.done ?? {}), [id]: event.target.checked };
  saveState(state);
  document.querySelector(`#toc a[href="#${id}"]`)?.parentElement.classList.toggle("done", event.target.checked);
  renderProgress();
});

function openSearch() {
  const dialog = document.querySelector("#search");
  const input = document.querySelector("#search-input");
  input.value = "";
  renderSearch();
  dialog.showModal();
  input.focus();
}

document.querySelector("#search-input").addEventListener("input", renderSearch);
document.querySelector("#search-input").addEventListener("keydown", event => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    searchSelected = Math.max(0, Math.min(searchResults.length - 1, searchSelected + (event.key === "ArrowDown" ? 1 : -1)));
    document.querySelectorAll("[data-result]").forEach((button, i) => button.classList.toggle("selected", i === searchSelected));
    document.querySelector(`[data-result="${searchSelected}"]`)?.scrollIntoView({ block: "nearest" });
  } else if (event.key === "Enter") {
    event.preventDefault();
    openSearchResult(searchSelected);
  }
});
document.querySelector("#search").addEventListener("click", event => {
  if (event.target.id === "search") event.target.close();
});

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  } else if (event.key === "Escape" && !document.querySelector("#drawer").hidden) {
    requestCloseDrawer();
  }
});

// ---------- 最初の表示 ----------
// 世代は URL の #dx11 など → 前回開いていた世代 → DX9 の順で決める。
// ページを再読み込みしたときは、履歴に保存してあった場所へ戻す。

history.scrollRestoration = "manual";
const initialHash = decodeURIComponent(location.hash.slice(1));
const savedState = history.state;
generation = GENERATIONS.find(key => initialHash === key || initialHash.startsWith(`${key}-`))
  ?? savedState?.generation ?? loadState().generation ?? "dx9";
render();
requestAnimationFrame(() => {
  if (savedState?.generation === generation && (savedState.anchor || savedState.scrollY != null)) {
    if (savedState.drawer) openDrawer(savedState.drawer.kind, savedState.drawer.name);
    restorePosition(savedState);
  } else {
    scrollToId(initialHash);
  }
  saveHistoryPosition();
});

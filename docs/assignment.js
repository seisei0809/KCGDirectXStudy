// 課題ページ。Reference を最後まで進めて完成画面が出たあとに取り組む。
"use strict";

const GENERATION_KEYS = ["dx9", "dx11", "dx12"];
const LABELS = { dx9: "DirectX 9", dx11: "DirectX 11", dx12: "DirectX 12" };
const PROGRESS_KEY = "kcg-directx-assignments";

// where: 変える関数（Reference の手順へのリンクになる）、change: 何をどう変えるか
const ASSIGNMENTS = [
  {
    title: "背景色を変える",
    goal: "完成画面の背景（物体の後ろ）の色を、自分で決めた色に変える。",
    where: "RenderScenePass",
    change: {
      dx9: "Clear に渡している D3DCOLOR_XRGB(24, 31, 42) の3つの数（R, G, B。0〜255）を変える。",
      dx11: "clearColor の最初の3つの数（R, G, B。0〜1）を変える。",
      dx12: "clearColor の最初の3つの数（R, G, B。0〜1）を変える。",
    },
    success: "床・立方体・四角すい・パネルはそのままで、背景の色だけが変わる。",
    think: "F3（背景だけ）の画面の色は変わらない。なぜか？（どの関数の色を変えたかを考える）",
    image: "01-background.png",
  },
  {
    title: "立方体と四角すいの左右を入れ替える",
    goal: "左にある立方体と右にある四角すいの位置を入れ替える。",
    where: "RenderScenePass",
    change: {
      dx9: "DrawObject に渡している XMMatrixTranslation の x（-1.65f と 1.65f）を入れ替える。",
      dx11: "DrawObject に渡している XMMatrixTranslation の x（-1.65f と 1.65f）を入れ替える。",
      dx12: "DrawObject に渡している XMMatrixTranslation の x（-1.65f と 1.65f）を入れ替える。objectIndex（1 と 2）は変えない。",
    },
    success: "四角すいが左、立方体が右に表示される。形（頂点データ）は1つも変えていない。",
    think: "形を作る BuildSceneGeometry を変えずに位置を変えられたのはなぜか？（World 行列の役割）",
    image: "02-swap-objects.png",
  },
  {
    title: "視野角を狭くする",
    goal: "透視投影の上下の視野角を 60 度から 40 度にして、見え方を比べる。",
    where: "BuildViewProjection",
    change: {
      dx9: "XMMatrixPerspectiveFovLH に渡している XMConvertToRadians(60.0f) を 40.0f にする。",
      dx11: "XMMatrixPerspectiveFovLH に渡している XMConvertToRadians(60.0f) を 40.0f にする。",
      dx12: "XMMatrixPerspectiveFovLH に渡している XMConvertToRadians(60.0f) を 40.0f にする。",
    },
    success: "F2（透視投影）では物体が大きく映り、床の端が画面の外へ出る。F1（平行投影）の見え方は変わらない。",
    think: "カメラは動かしていないのに大きく見えるのはなぜか？（望遠レンズと同じ）",
    image: "03-narrow-fov.png",
  },
  {
    title: "床の模様を細かくする",
    goal: "床に貼った画像の繰り返しを 4×4 回から 8×8 回にする。",
    where: "BuildSceneGeometry",
    change: {
      dx9: "床の AppendQuad の最後の引数（uvScale）4.0f を 8.0f にする。",
      dx11: "床の AppendQuad の最後の引数（uvScale）4.0f を 8.0f にする。",
      dx12: "床の AppendQuad の最後の引数（uvScale）4.0f を 8.0f にする。",
    },
    success: "床の画像が細かく 8×8 回繰り返される。ほかの物体の見た目は変わらない。",
    think: "UV が 1 を超えても画像が繰り返されるのは、どの設定のおかげか？（Sampler の WRAP）",
    image: "04-floor-uv.png",
  },
  {
    title: "パネルをもっと透明にする",
    goal: "半透明パネルの alpha を下げて、奥がよりはっきり見えるようにする。",
    where: "BuildSceneGeometry",
    change: {
      dx9: "パネルの D3DCOLOR_ARGB(90, 64, 166, 255) の最初の数（alpha）を 30 くらいにする。",
      dx11: "パネルの色 { 0.25f, 0.65f, 1.0f, 0.35f } の最後の数（alpha）を 0.12f くらいにする。",
      dx12: "パネルの色 { 0.25f, 0.65f, 1.0f, 0.35f } の最後の数（alpha）を 0.12f くらいにする。",
    },
    success: "パネルがほとんど見えなくなり、奥の立方体と四角すいがはっきり見える。床や立方体は透けない。",
    think: "Blend の式「新しい色 × alpha ＋ 今の色 × (1 − alpha)」に alpha = 0 を入れるとどうなるか？",
    image: "05-panel-alpha.png",
  },
  {
    title: "画面に貼る四角形を小さくする",
    goal: "SceneTexture を画面いっぱいではなく少し小さく貼り、まわりに枠を作る。",
    where: "BuildSceneGeometry",
    change: {
      dx9: "presentQuad の AppendQuad の座標 -1 と 1 を、-0.88f と 0.88f にする。",
      dx11: "presentQuad の AppendQuad の座標 -1 と 1 を、-0.88f と 0.88f にする。",
      dx12: "presentQuad の AppendQuad の座標 -1 と 1 を、-0.88f と 0.88f にする。",
    },
    success: "場面全体が少し小さく表示され、まわりに RenderPresentPass で Clear した、より暗い色の枠が見える。",
    think: "場面の中身は1つも変えていないのに、全体の大きさを変えられた。2段階で描く利点は何か？",
    image: "06-inset-present.png",
  },
];

// 世代ごとの「その世代らしさ」を体験する課題
const SPECIAL = {
  dx9: {
    title: "Device に残る設定を体験する",
    goal: "設定が Device に残り続けることを、わざと設定を忘れて確かめる。",
    where: "RenderOneObject",
    change: "m_device->SetTexture(0, m_iconTexture.Get()); の行を消して起動し、F4（Sprite 1枚）を押す（確認したら元に戻す）。",
    success: "Icon.png の代わりに、完成画面そのものが四角形に貼られて表示される。",
    think: "最後に SetTexture したのはどこか？（ヒント: RenderPresentPass）。DX11 / DX12 では、この「前の設定が残る」問題をどう防いでいるか？",
    image: "dx9-leftover-texture.png",
  },
  dx11: {
    title: "「読みながら描く」危険を体験する",
    goal: "同じ Texture を読み取り元（SRV）のまま描画先（RTV）にすると何が起きるかを確かめる。",
    where: "RenderScenePass",
    change: "最初の2行（nullSRV を作って PSSetShaderResources する行）を消し、Visual Studio の F5（デバッグ実行）で起動して、Visual Studio の「出力」ウィンドウを見る（確認したら元に戻す）。",
    success: "画面は変わらないが、「出力」に次のような警告が毎フレーム出る。\nD3D11 WARNING: ID3D11DeviceContext::OMSetRenderTargets: Resource being set to OM RenderTarget slot 0 is still bound on input!\nD3D11 WARNING: … Forcing PS shader resource slot 0 to NULL.",
    think: "画面が壊れなかったのは、Direct3D 11 が自動で SRV を外してくれたから。DX12 ではこの切り替えを誰がどう書いているか？（ヒント: Barrier）",
    image: null,
  },
  dx12: {
    title: "「GPU はあとで描く」を体験する",
    goal: "物体ごとに ConstantBuffer の場所を分けている理由を、わざと同じ場所を使って確かめる。",
    where: "RenderScenePass",
    change: "床・立方体・四角すい・パネルの DrawObject の最初の引数（objectIndex）1, 2, 3 をすべて 0 にする（確認したら元に戻す）。",
    success: "立方体と四角すいが、画面の中央で重なって表示される。",
    think: "CPU は床 → 立方体 → 四角すい → パネルの順に行列を書いたのに、GPU が描くときには全部パネルの行列（位置は原点）になっていた。なぜか？ DX11 の UpdateSubresource ではなぜ起きなかったか？",
    image: "dx12-same-object-index.png",
  },
};

function escapeHtml(text) {
  return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function stepNumber(generation, functionName) {
  let number = 0;
  for (const chapter of LESSONS[generation].chapters) {
    for (const step of chapter.steps) {
      number += 1;
      const targets = [step.target ?? []].flat();
      if (step.type === "code" && targets.includes(functionName)) return number;
    }
  }
  return null;
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // 保存できない環境でも課題は表示する。
  }
}

function card(generation, number, item, change) {
  const id = `${generation}-${number}`;
  const step = stepNumber(generation, item.where);
  const done = loadProgress()[id];
  const link = step ? `<a href="reference.html#${generation}-${step}">Reference の手順 ${step}（${escapeHtml(item.where)}）</a>` : escapeHtml(item.where);
  return `
    <article class="step assignment ${item.special ? "is-core" : ""}" id="${id}">
      <header class="step-head">
        <span class="step-number">${number}</span>
        <h3>${escapeHtml(item.title)}</h3>
        ${item.special ? `<span class="badge">${escapeHtml(LABELS[generation])} らしさ</span>` : ""}
        <label class="done-toggle"><input type="checkbox" data-done="${id}" ${done ? "checked" : ""}> できた</label>
      </header>
      <p>${escapeHtml(item.goal)}</p>
      <dl class="assignment-list">
        <dt>変える場所</dt><dd>${link}</dd>
        <dt>変えること</dt><dd>${escapeHtml(change)}</dd>
        <dt>成功の条件</dt><dd class="pre">${escapeHtml(item.success)}</dd>
        <dt>考えてみよう</dt><dd>${escapeHtml(item.think)}</dd>
      </dl>
      ${item.image ? `<details class="trouble"><summary>期待する画面を見る</summary><figure class="assignment-shot"><img src="assignment-results/${item.image}" alt="${escapeHtml(item.title)}の期待結果" loading="lazy"></figure></details>` : ""}
    </article>`;
}

function render(generation) {
  document.documentElement.dataset.generation = generation;
  document.querySelectorAll("button[data-generation]").forEach(button => button.classList.toggle("active", button.dataset.generation === generation));
  document.querySelector("#reference-link").href = `reference.html#${generation}`;
  const special = { ...SPECIAL[generation], special: true };
  document.querySelector("#assignments").innerHTML = `
    <h2>${escapeHtml(LABELS[generation])} の課題</h2>
    ${ASSIGNMENTS.map((item, i) => card(generation, i + 1, item, item.change[generation])).join("")}
    ${card(generation, ASSIGNMENTS.length + 1, special, special.change)}`;
}

let current = GENERATION_KEYS.find(key => location.hash === `#${key}`) ?? "dx9";
render(current);

document.addEventListener("click", event => {
  const button = event.target.closest("button[data-generation]");
  if (!button) return;
  current = button.dataset.generation;
  history.replaceState(null, "", `#${current}`);
  render(current);
});

document.addEventListener("change", event => {
  const id = event.target.dataset.done;
  if (!id) return;
  const progress = loadProgress();
  progress[id] = event.target.checked;
  saveProgress(progress);
});

window.addEventListener("hashchange", () => {
  const next = GENERATION_KEYS.find(key => location.hash === `#${key}`);
  if (next) render(next);
});

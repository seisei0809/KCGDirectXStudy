// マクロ・定数（フラグや列挙値）の辞書（手で編集してよい）。
// コード中の大文字の名前をクリックすると、その名前が属する「系統」が右に開く。
// 1系統 = { group, title, summary, values: [[名前, 意味], ...], note }。
// 教材のコードで実際に使っている値は、表示するときに自動で印が付く。
"use strict";

const MACROS = (() => {
  const list = [];
  const M = (group, title, summary, values, note = "") => list.push({ group, title, summary, values, note });

  // DX11 と DX12 で名前の頭だけが違う系統は、説明を共通にして2つ作る。
  const pair = (title, summary, prefix11, prefix12, values, note = "") => {
    M("dx11", `${prefix11}*（${title}）`, summary, values.map(([name, text]) => [prefix11 + name, text]), note);
    M("dx12", `${prefix12}*（${title}）`, summary, values.map(([name, text]) => [prefix12 + name, text]),
      note ? `${note} DX11 の ${prefix11}* と同じ意味。` : `DX11 の ${prefix11}* と同じ意味。`);
  };

  // ---------- COM・WIC（全世代） ----------
  M("wic", "COINIT_*（COM の使い方）", "CoInitializeEx に渡す、このスレッドで COM をどう使うかの指定。WIC が COM なので最初に1回呼ぶ。", [
    ["COINIT_APARTMENTTHREADED", "このスレッドだけで COM を使う。ウィンドウを持つスレッドでは普通これ。"],
    ["COINIT_MULTITHREADED", "複数のスレッドから同じ COM オブジェクトを使う。"],
  ]);
  M("wic", "CLSCTX_*（COM オブジェクトを動かす場所）", "CoCreateInstance で、作るオブジェクトをどこで動かすか。", [
    ["CLSCTX_INPROC_SERVER", "自分のプロセスの中で DLL として動かす。WIC はこれ。"],
    ["CLSCTX_LOCAL_SERVER", "別のプロセス（exe）で動かす。"],
    ["CLSCTX_ALL", "どれでもよい。"],
  ]);
  M("wic", "CLSID_WICImagingFactory", "WIC の入口（Factory）を表す ID。CoCreateInstance に渡すと WIC の Factory ができる。", [
    ["CLSID_WICImagingFactory", "WIC の Factory の ID。"],
  ]);
  M("wic", "GENERIC_*（ファイルの開き方）", "ファイルを開くときの読み書きの指定。", [
    ["GENERIC_READ", "読むだけ。PNG を読み込むのでこれ。"],
    ["GENERIC_WRITE", "書く。画像を保存するとき。"],
  ]);
  M("wic", "WICDecodeMetadataCache*（メタ情報の読み方）", "PNG の付加情報（撮影日時など）をいつ読むか。画素には関係しない。", [
    ["WICDecodeMetadataCacheOnLoad", "開いたときに全部読む。"],
    ["WICDecodeMetadataCacheOnDemand", "必要になったときに読む。"],
  ]);
  M("wic", "GUID_WICPixelFormat*（画素の形式）", "FormatConverter で、どんな画素の並びにそろえるか。", [
    ["GUID_WICPixelFormat32bppBGRA", "1画素 4byte、メモリ上で B, G, R, A の順。DX9 の A8R8G8B8、DX11/12 の B8G8R8A8_UNORM とそのまま一致する。"],
    ["GUID_WICPixelFormat32bppRGBA", "R, G, B, A の順。R8G8B8A8_UNORM の Texture に合わせるとき。"],
    ["GUID_WICPixelFormat32bppPBGRA", "色に alpha を掛け済みの BGRA（Premultiplied alpha）。"],
  ]);
  M("wic", "WICBitmapDitherType* / WICBitmapPaletteType*（変換の細かい指定）", "形式を変換するときの、色を減らす方法とパレットの指定。32bit カラーへの変換では使われないので決まり文句。", [
    ["WICBitmapDitherTypeNone", "ディザ（色を減らすときの点描）をしない。"],
    ["WICBitmapPaletteTypeCustom", "パレットを使わない変換のときの指定。"],
  ]);

  // ---------- DX9 ----------
  M("dx9", "D3D_SDK_VERSION", "Direct3DCreate9 に渡す番号。ヘッダーと実行環境の Direct3D 9 が合っているかの確認に使う。", [
    ["D3D_SDK_VERSION", "決まった値を渡すだけ。"],
  ]);
  M("dx9", "D3DADAPTER_DEFAULT", "どの GPU（Adapter）を使うか。", [
    ["D3DADAPTER_DEFAULT", "メインの GPU（番号 0）。他の GPU は GetAdapterCount で数えて番号で指定する。"],
  ]);
  M("dx9", "D3DDEVTYPE_*（Device の種類）", "CreateDevice で、描画を誰にやらせるか。", [
    ["D3DDEVTYPE_HAL", "GPU（ハードウェア）で描く。普通はこれ。"],
    ["D3DDEVTYPE_REF", "CPU で正確に描く検証用。非常に遅い。"],
    ["D3DDEVTYPE_NULLREF", "何も描かない。Resource の作成だけ試すとき。"],
  ]);
  M("dx9", "D3DCREATE_*（Device の作り方）", "CreateDevice の動作フラグ。| で組み合わせる。", [
    ["D3DCREATE_HARDWARE_VERTEXPROCESSING", "頂点の変換を GPU で行う。今の PC はほぼこれで作れる。"],
    ["D3DCREATE_SOFTWARE_VERTEXPROCESSING", "頂点の変換を CPU で行う。古い GPU 用の保険。"],
    ["D3DCREATE_MIXED_VERTEXPROCESSING", "GPU と CPU を切り替えられる。"],
    ["D3DCREATE_MULTITHREADED", "複数のスレッドから Device を使う（少し遅くなる）。"],
    ["D3DCREATE_PUREDEVICE", "設定の読み出し（Get〇〇）を禁止して少し速くする。"],
  ]);
  M("dx9", "D3DSWAPEFFECT_*（表示の方式）", "BackBuffer をウィンドウへ出すやり方。", [
    ["D3DSWAPEFFECT_DISCARD", "表示した後の BackBuffer の中身は捨ててよい。毎フレーム全部描き直すならこれが一番速い。"],
    ["D3DSWAPEFFECT_FLIP", "複数の BackBuffer を順番に入れ替える。"],
    ["D3DSWAPEFFECT_COPY", "BackBuffer をコピーして表示し、中身を残す。"],
  ], "DX11/12 の DXGI_SWAP_EFFECT_FLIP_DISCARD が後継の考え方。");
  M("dx9", "D3DFMT_*（形式）", "画素・Depth・Index の形式。名前は32bit の上位ビットから並べた順で、メモリ上（リトルエンディアン）では逆順になる。", [
    ["D3DFMT_UNKNOWN", "BackBuffer では「今のデスクトップと同じ形式」の意味（ウィンドウモードだけ）。"],
    ["D3DFMT_X8R8G8B8", "色 24bit + 使わない 8bit。"],
    ["D3DFMT_A8R8G8B8", "A, R, G, B 各 8bit。メモリ上は B, G, R, A の順なので WIC の BGRA と一致する。"],
    ["D3DFMT_R5G6B5", "16bit カラー（昔の省メモリ用）。"],
    ["D3DFMT_D24S8", "Depth 24bit + Stencil 8bit。"],
    ["D3DFMT_D24X8", "Depth 24bit（Stencil なし）。"],
    ["D3DFMT_D16", "Depth 16bit。軽いが奥行きが粗い。"],
    ["D3DFMT_INDEX16", "Index 1個 16bit（頂点 65535 個まで）。"],
    ["D3DFMT_INDEX32", "Index 1個 32bit（大きなモデル用）。"],
  ]);
  M("dx9", "D3DPRESENT_INTERVAL_*（表示のタイミング）", "Present したとき、モニターの更新をどう待つか。", [
    ["D3DPRESENT_INTERVAL_ONE", "画面の更新1回ごとに表示（垂直同期）。画面が裂けない。"],
    ["D3DPRESENT_INTERVAL_IMMEDIATE", "待たずにすぐ表示。速いが画面が裂ける（ティアリング）ことがある。"],
    ["D3DPRESENT_INTERVAL_DEFAULT", "ほぼ ONE と同じ。"],
    ["D3DPRESENT_INTERVAL_TWO", "更新2回に1回（30fps 固定など）。"],
  ], "DX11/12 では Present(1, 0) の 1 がこれに当たる。");
  M("dx9", "D3DCLEAR_*（Clear で消すもの）", "Clear で何を初期化するか。| で組み合わせる。", [
    ["D3DCLEAR_TARGET", "描画先の色。"],
    ["D3DCLEAR_ZBUFFER", "Depth。"],
    ["D3DCLEAR_STENCIL", "Stencil。"],
  ]);
  M("dx9", "D3DERR_*（DX9 のエラー）", "DX9 の関数が返す失敗の値の一部。", [
    ["D3DERR_DEVICELOST", "Device が失われた（画面ロック・全画面切り替えなど）。復帰するまで描けない。"],
    ["D3DERR_DEVICENOTRESET", "失われた Device を Reset すれば復帰できる状態。"],
    ["D3DERR_INVALIDCALL", "引数や呼び方が間違っている。"],
  ]);
  M("dx9", "D3DFVF_*（頂点の中身）", "FVF のビット。頂点に何が入っているかを | で組み合わせて伝える。並び順は決まっている（位置 → 法線 → 色 → UV）。", [
    ["D3DFVF_XYZ", "位置 float×3（変換前）。"],
    ["D3DFVF_XYZRHW", "変換済みの画面座標 float×4。行列を通さず 2D を描くとき。"],
    ["D3DFVF_NORMAL", "法線 float×3（ライティング用）。"],
    ["D3DFVF_DIFFUSE", "頂点の色 D3DCOLOR。"],
    ["D3DFVF_SPECULAR", "反射光の色 D3DCOLOR。"],
    ["D3DFVF_TEX1", "UV を1組。"],
    ["D3DFVF_TEX2", "UV を2組。"],
  ], "DX11/12 では FVF の代わりに InputLayout を使う。");
  M("dx9", "D3DPOOL_*（Resource を置くメモリ）", "Buffer や Texture をどこに置き、誰が管理するか。", [
    ["D3DPOOL_MANAGED", "GPU に置き、DX9 が CPU 側にも控えを持つ。Device が失われても自動で戻る。"],
    ["D3DPOOL_DEFAULT", "GPU のメモリだけ。Device が失われたら作り直しが必要。描画先の Texture はこれ。"],
    ["D3DPOOL_SYSTEMMEM", "CPU のメモリ。GPU からは直接使えない（コピー元にする）。"],
    ["D3DPOOL_SCRATCH", "CPU で読み書きするだけの作業用。"],
  ], "DX11 では Usage、DX12 では Heap の種類（DEFAULT / UPLOAD）で選ぶ。");
  M("dx9", "D3DPT_*（三角形の並び方）", "DrawIndexedPrimitive で、Index をどう図形にするか。", [
    ["D3DPT_TRIANGLELIST", "Index 3個ずつで三角形1枚。"],
    ["D3DPT_TRIANGLESTRIP", "前の2頂点と次の1頂点で三角形を続けてつなぐ。"],
    ["D3DPT_TRIANGLEFAN", "最初の1頂点を中心に扇形に三角形を作る。"],
    ["D3DPT_LINELIST", "2個ずつで線1本。"],
    ["D3DPT_LINESTRIP", "線をつなげて描く。"],
    ["D3DPT_POINTLIST", "点を描く。"],
  ]);
  M("dx9", "D3DRS_*（SetRenderState の項目）", "SetRenderState で変える「今の設定」の名前。一度変えると変えるまで残る。", [
    ["D3DRS_LIGHTING", "固定機能のライティング。初期値 TRUE（法線と光が無いと真っ黒になる）。"],
    ["D3DRS_CULLMODE", "裏向きの三角形を捨てるか（D3DCULL_*）。"],
    ["D3DRS_ZENABLE", "Depth で前後を判定するか。"],
    ["D3DRS_ZWRITEENABLE", "描いたとき Depth を書き込むか。"],
    ["D3DRS_ZFUNC", "Depth の比べ方（初期値 LESSEQUAL）。"],
    ["D3DRS_ALPHABLENDENABLE", "色を混ぜるか（半透明）。"],
    ["D3DRS_SRCBLEND", "新しく描く色に掛ける値（D3DBLEND_*）。"],
    ["D3DRS_DESTBLEND", "すでにある色に掛ける値（D3DBLEND_*）。"],
    ["D3DRS_BLENDOP", "2つをどう合わせるか（初期値 ADD）。"],
    ["D3DRS_FILLMODE", "塗りつぶし / 線だけ。"],
  ], "DX11 では State オブジェクト、DX12 では PSO にまとめて持つ。");
  M("dx9", "D3DCULL_*（裏向きの面を捨てるか）", "D3DRS_CULLMODE に設定する値。", [
    ["D3DCULL_NONE", "捨てない。裏向きの面も描く。"],
    ["D3DCULL_CCW", "反時計回りに見える三角形を捨てる（初期値）。"],
    ["D3DCULL_CW", "時計回りに見える三角形を捨てる。"],
  ]);
  M("dx9", "D3DBLEND_*（混ぜるときに掛ける値）", "D3DRS_SRCBLEND / DESTBLEND に設定する値。結果 = 新しい色 × SRCBLEND ＋ 今の色 × DESTBLEND。", [
    ["D3DBLEND_SRCALPHA", "新しい色の alpha を掛ける。"],
    ["D3DBLEND_INVSRCALPHA", "1 − 新しい色の alpha を掛ける。SRCALPHA と組むと普通の半透明。"],
    ["D3DBLEND_ONE", "1 を掛ける（そのまま）。ONE + ONE で足し算（光・炎）。"],
    ["D3DBLEND_ZERO", "0 を掛ける（消す）。"],
    ["D3DBLEND_DESTCOLOR", "今の色を掛ける（掛け算合成）。"],
  ]);
  M("dx9", "D3DTSS_*（TextureStage の項目）", "SetTextureStageState で変える、固定機能の「画素の色の決め方」。", [
    ["D3DTSS_COLOROP", "色の計算方法（D3DTOP_*）。"],
    ["D3DTSS_COLORARG1", "色の計算の1つ目の材料（D3DTA_*）。"],
    ["D3DTSS_COLORARG2", "色の計算の2つ目の材料。"],
    ["D3DTSS_ALPHAOP", "alpha の計算方法。"],
    ["D3DTSS_ALPHAARG1", "alpha の計算の1つ目の材料。"],
    ["D3DTSS_ALPHAARG2", "alpha の計算の2つ目の材料。"],
  ], "DX11/12 では PixelShader に書く（gTexture.Sample(…) * color）。");
  M("dx9", "D3DTOP_*（TextureStage の計算）", "COLOROP / ALPHAOP に設定する計算。", [
    ["D3DTOP_MODULATE", "ARG1 × ARG2（掛け算）。画像 × 頂点色。"],
    ["D3DTOP_MODULATE2X", "掛け算して2倍（明るくする）。"],
    ["D3DTOP_SELECTARG1", "ARG1 だけを使う。"],
    ["D3DTOP_SELECTARG2", "ARG2 だけを使う。"],
    ["D3DTOP_ADD", "ARG1 + ARG2。"],
    ["D3DTOP_DISABLE", "このステージを使わない。"],
  ]);
  M("dx9", "D3DTA_*（TextureStage の材料）", "COLORARG / ALPHAARG に設定する材料。", [
    ["D3DTA_TEXTURE", "貼った画像の色。"],
    ["D3DTA_DIFFUSE", "頂点の色。"],
    ["D3DTA_CURRENT", "前のステージの結果。"],
    ["D3DTA_SPECULAR", "反射光の色。"],
  ]);
  M("dx9", "D3DSAMP_*（SetSamplerState の項目）", "画像の読み方の設定の名前。", [
    ["D3DSAMP_ADDRESSU", "横方向で UV が 0〜1 を出たときの扱い（D3DTADDRESS_*）。"],
    ["D3DSAMP_ADDRESSV", "縦方向で UV が 0〜1 を出たときの扱い。"],
    ["D3DSAMP_MINFILTER", "縮小するときの補間（D3DTEXF_*）。"],
    ["D3DSAMP_MAGFILTER", "拡大するときの補間。"],
    ["D3DSAMP_MIPFILTER", "Mip の間の補間。"],
  ], "DX11 では SamplerState、DX12 では Static Sampler にまとめる。");
  M("dx9", "D3DTADDRESS_*（UV が範囲外のとき）", "ADDRESSU / V に設定する値。", [
    ["D3DTADDRESS_WRAP", "繰り返す（床の 4×4）。"],
    ["D3DTADDRESS_CLAMP", "端の色を伸ばす。"],
    ["D3DTADDRESS_MIRROR", "折り返して繰り返す。"],
    ["D3DTADDRESS_BORDER", "決めた枠の色にする。"],
  ]);
  M("dx9", "D3DTEXF_*（補間の方法）", "MINFILTER / MAGFILTER / MIPFILTER に設定する値。", [
    ["D3DTEXF_LINEAR", "近くの画素を混ぜてなめらかにする。"],
    ["D3DTEXF_POINT", "一番近い画素そのまま（ドット絵風にくっきり）。"],
    ["D3DTEXF_ANISOTROPIC", "斜めから見た面もきれいにする（重め）。"],
    ["D3DTEXF_NONE", "使わない（MIPFILTER で Mip を使わないとき）。"],
  ]);
  M("dx9", "D3DTS_*（SetTransform の行列）", "Device に覚えさせる行列の種類。", [
    ["D3DTS_WORLD", "物体をどこに置くか。"],
    ["D3DTS_VIEW", "カメラから見るとどこか。"],
    ["D3DTS_PROJECTION", "画面にどう映すか（平行 / 透視）。"],
  ], "DX11/12 では自分で掛け算し、ConstantBuffer で Shader に渡す。");

  // ---------- DX11 / DX12 共通 ----------
  M("dxcommon", "D3DCOMPILE_*（HLSL のコンパイルのフラグ）", "D3DCompileFromFile に渡す指定。| で組み合わせる。", [
    ["D3DCOMPILE_ENABLE_STRICTNESS", "古い書き方を禁止して、間違いをエラーにする。"],
    ["D3DCOMPILE_DEBUG", "デバッグ情報を入れる（グラフィックス デバッガーで HLSL の行が分かる）。"],
    ["D3DCOMPILE_SKIP_OPTIMIZATION", "最適化しない。命令が HLSL の書いた順のままで追いやすいが、遅い。Debug ビルドだけで使う。"],
    ["D3DCOMPILE_OPTIMIZATION_LEVEL3", "最大限に最適化する（Release 向け）。"],
    ["D3DCOMPILE_WARNINGS_ARE_ERRORS", "警告もエラーにする。"],
    ["D3DCOMPILE_PACK_MATRIX_ROW_MAJOR", "行列を行優先で読む。付けると C++ 側の転置（Transpose）が要らなくなる。"],
  ]);
  M("dxcommon", "D3D_COMPILE_STANDARD_FILE_INCLUDE", "HLSL の #include をどう探すか。", [
    ["D3D_COMPILE_STANDARD_FILE_INCLUDE", "HLSL ファイルのあるフォルダーから相対パスで探す。nullptr にすると #include が使えない。"],
  ]);
  M("dxcommon", "D3D_FEATURE_LEVEL_*（求める GPU の機能）", "GPU に最低これだけの機能を求める、という指定。API の世代とは別。", [
    ["D3D_FEATURE_LEVEL_11_0", "DX11 世代の機能。DX12 もこの世代の GPU から動く。"],
    ["D3D_FEATURE_LEVEL_11_1", "DX11.1 の機能。"],
    ["D3D_FEATURE_LEVEL_12_0", "DX12 世代の機能。"],
    ["D3D_FEATURE_LEVEL_12_1", "さらに新しい機能。"],
    ["D3D_FEATURE_LEVEL_10_0", "古い GPU 向け。"],
  ]);
  M("dxcommon", "DXGI_FORMAT_*（形式）", "画素・Depth・頂点のメンバー・Index の形式。名前はチャンネルとビット数を順に並べ、最後が型（UNORM = 0〜1 の数、FLOAT = 小数、UINT = 整数）。", [
    ["DXGI_FORMAT_R8G8B8A8_UNORM", "R, G, B, A 各 8bit。0〜255 を 0.0〜1.0 として読む。BackBuffer の定番。"],
    ["DXGI_FORMAT_B8G8R8A8_UNORM", "B, G, R, A の順。WIC の BGRA とそのまま一致する。"],
    ["DXGI_FORMAT_R8G8B8A8_UNORM_SRGB", "ガンマ補正込みで読み書きする。"],
    ["DXGI_FORMAT_R16G16B16A16_FLOAT", "各 16bit の小数（HDR）。"],
    ["DXGI_FORMAT_D24_UNORM_S8_UINT", "Depth 24bit + Stencil 8bit。"],
    ["DXGI_FORMAT_D32_FLOAT", "Depth 32bit の小数。精度が高い。"],
    ["DXGI_FORMAT_D16_UNORM", "Depth 16bit。軽いが粗い。"],
    ["DXGI_FORMAT_R32G32B32A32_FLOAT", "float 4つ（頂点の色 XMFLOAT4）。"],
    ["DXGI_FORMAT_R32G32B32_FLOAT", "float 3つ（頂点の位置 XMFLOAT3）。"],
    ["DXGI_FORMAT_R32G32_FLOAT", "float 2つ（UV の XMFLOAT2）。"],
    ["DXGI_FORMAT_R16_UINT", "16bit の整数1つ（Index）。"],
    ["DXGI_FORMAT_R32_UINT", "32bit の整数1つ（頂点の多い Index）。"],
    ["DXGI_FORMAT_UNKNOWN", "形式なし。ただの Buffer のとき。"],
  ]);
  M("dxcommon", "DXGI_SWAP_EFFECT_*（表示の方式）", "SwapChain が BackBuffer をどう画面に出すか。", [
    ["DXGI_SWAP_EFFECT_FLIP_DISCARD", "コピーせず入れ替えて表示し、中身は捨ててよい。今の推奨。"],
    ["DXGI_SWAP_EFFECT_FLIP_SEQUENTIAL", "入れ替えて表示し、中身を残す。"],
    ["DXGI_SWAP_EFFECT_DISCARD", "旧方式（コピーして表示）。DX12 では使えない。"],
    ["DXGI_SWAP_EFFECT_SEQUENTIAL", "旧方式で中身を残す。DX12 では使えない。"],
  ], "FLIP 系は BackBuffer 2枚以上・MSAA なし（SampleDesc.Count = 1）が条件。");
  M("dxcommon", "DXGI_USAGE_*（BackBuffer の使い道）", "SwapChain の BackBuffer を何に使うか。", [
    ["DXGI_USAGE_RENDER_TARGET_OUTPUT", "描画先として使う。"],
    ["DXGI_USAGE_SHADER_INPUT", "Shader からも読む。"],
  ]);
  M("dxcommon", "HLSL の Semantic（: POSITION など）", "HLSL の変数に付ける意味の名札。C++ の InputLayout の SemanticName と、この名札でつながる。末尾の数字は同じ名札の何番目か。", [
    ["POSITION", "頂点の位置。InputLayout の \"POSITION\" と対応。"],
    ["COLOR0", "頂点の色（0番）。InputLayout の \"COLOR\" と SemanticIndex 0 に対応。"],
    ["TEXCOORD0", "UV（0番）。InputLayout の \"TEXCOORD\" と対応。"],
    ["SV_POSITION", "SV = System Value。VertexShader が出す、画面上の位置。GPU が三角形を画素にするのに使う。"],
    ["SV_TARGET", "PixelShader が出す、描画先（RTV 0番）に書く色。SV_TARGET1 なら 1番の描画先。"],
  ]);

  // ---------- DX11 ----------
  M("dx11", "D3D11_CREATE_DEVICE_*（Device の作り方）", "D3D11CreateDeviceAndSwapChain のフラグ。| で組み合わせる。", [
    ["D3D11_CREATE_DEVICE_DEBUG", "Debug Layer を有効にする。API の使い方の誤りを「出力」ウィンドウに書く。Windows の「グラフィックス ツール」が必要。"],
    ["D3D11_CREATE_DEVICE_BGRA_SUPPORT", "BGRA 形式の対応を求める（Direct2D と一緒に使うとき）。"],
    ["D3D11_CREATE_DEVICE_SINGLETHREADED", "1スレッドからしか使わないと約束して少し速くする。"],
  ]);
  M("dx11", "D3D11_SDK_VERSION", "D3D11CreateDeviceAndSwapChain に渡す決まった番号。", [
    ["D3D11_SDK_VERSION", "決まった値を渡すだけ。"],
  ]);
  M("dx11", "D3D_DRIVER_TYPE_*（Device の種類）", "描画を誰にやらせるか。", [
    ["D3D_DRIVER_TYPE_HARDWARE", "GPU で描く。普通はこれ。"],
    ["D3D_DRIVER_TYPE_WARP", "CPU で動く高速なソフトウェア実装。GPU が無い環境のテスト用。"],
    ["D3D_DRIVER_TYPE_REFERENCE", "CPU で正確に描く検証用。非常に遅い。"],
  ]);
  M("dx11", "D3D11_USAGE_*（Resource の使い方）", "CPU と GPU がどう読み書きするか。", [
    ["D3D11_USAGE_DEFAULT", "GPU が読み書きする。CPU からは UpdateSubresource で書く。"],
    ["D3D11_USAGE_IMMUTABLE", "GPU が読むだけ。作るときに中身が必須で、後から変えられない。"],
    ["D3D11_USAGE_DYNAMIC", "CPU が毎フレーム Map で書く。CPUAccessFlags = WRITE が必要。"],
    ["D3D11_USAGE_STAGING", "GPU の結果を CPU へ読み戻すための作業用。"],
  ], "DX12 では Heap の種類（DEFAULT / UPLOAD / READBACK）で選ぶ。");
  M("dx11", "D3D11_BIND_*（何につなぐ Resource か）", "BindFlags。| で複数指定できる（ConstantBuffer は単独）。", [
    ["D3D11_BIND_VERTEX_BUFFER", "VertexBuffer として使う。"],
    ["D3D11_BIND_INDEX_BUFFER", "IndexBuffer として使う。"],
    ["D3D11_BIND_CONSTANT_BUFFER", "ConstantBuffer として使う。ByteWidth は 16 の倍数にする。"],
    ["D3D11_BIND_SHADER_RESOURCE", "Shader から読む（SRV を作る）。"],
    ["D3D11_BIND_RENDER_TARGET", "描画先にする（RTV を作る）。"],
    ["D3D11_BIND_DEPTH_STENCIL", "Depth の書き込み先にする（DSV を作る）。"],
    ["D3D11_BIND_UNORDERED_ACCESS", "Shader から書き込む（UAV。Compute Shader など）。"],
  ], "DX12 では D3D12_RESOURCE_FLAG_ALLOW_* に当たる。");
  M("dx11", "D3D11_CLEAR_*（Depth の Clear で消すもの）", "ClearDepthStencilView で何を初期化するか。", [
    ["D3D11_CLEAR_DEPTH", "Depth。"],
    ["D3D11_CLEAR_STENCIL", "Stencil。"],
  ]);
  M("dx11", "D3D11_PRIMITIVE_TOPOLOGY_*（三角形の並び方）", "IASetPrimitiveTopology に渡す、Index をどう図形にするか。", [
    ["D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST", "Index 3個ずつで三角形1枚。"],
    ["D3D11_PRIMITIVE_TOPOLOGY_TRIANGLESTRIP", "三角形を続けてつなぐ。"],
    ["D3D11_PRIMITIVE_TOPOLOGY_LINELIST", "2個ずつで線1本。"],
    ["D3D11_PRIMITIVE_TOPOLOGY_POINTLIST", "点。"],
  ], "DX9 では DrawIndexedPrimitive の引数（D3DPT_*）だった。");

  pair("Sampler の補間", "縮小（MIN）・拡大（MAG）・Mip の間（MIP）の補間方法を名前に並べた値。", "D3D11_FILTER_", "D3D12_FILTER_", [
    ["MIN_MAG_MIP_LINEAR", "全部なめらかに補間する。"],
    ["MIN_MAG_MIP_POINT", "全部一番近い画素のまま（くっきり）。"],
    ["MIN_MAG_LINEAR_MIP_POINT", "拡大縮小はなめらか、Mip は切り替えるだけ。"],
    ["ANISOTROPIC", "斜めから見た面もきれいにする（MaxAnisotropy で強さを決める）。"],
  ]);
  pair("UV が範囲外のとき", "Sampler の AddressU / V / W に設定する値。", "D3D11_TEXTURE_ADDRESS_", "D3D12_TEXTURE_ADDRESS_MODE_", [
    ["WRAP", "繰り返す（床の 4×4）。"],
    ["CLAMP", "端の色を伸ばす。"],
    ["MIRROR", "折り返して繰り返す。"],
    ["BORDER", "決めた枠の色にする。"],
  ]);
  pair("比べ方", "Depth の判定や、比較 Sampler で使う比べ方。", "D3D11_COMPARISON_", "D3D12_COMPARISON_FUNC_", [
    ["LESS", "今より小さい（手前）なら通す。Depth の定番。"],
    ["LESS_EQUAL", "今以下なら通す。"],
    ["GREATER", "今より大きいなら通す（Reversed-Z で使う）。"],
    ["ALWAYS", "いつも通す。"],
    ["NEVER", "決して通さない。比較を使わない Sampler ではこれを入れておく。"],
  ]);
  pair("塗り方", "Rasterizer の FillMode。", "D3D11_FILL_", "D3D12_FILL_MODE_", [
    ["SOLID", "三角形を塗りつぶす。"],
    ["WIREFRAME", "線だけ描く（形の確認に便利）。"],
  ]);
  pair("裏向きの面を捨てるか", "Rasterizer の CullMode。表 = 時計回りに見える三角形（FrontCounterClockwise = FALSE のとき）。", "D3D11_CULL_", "D3D12_CULL_MODE_", [
    ["NONE", "捨てない。裏向きの面も描く。"],
    ["BACK", "裏向きを捨てる。普通はこれ（描く量が約半分になる）。"],
    ["FRONT", "表向きを捨てる。"],
  ]);
  pair("Depth を書くか", "DepthStencil の DepthWriteMask。", "D3D11_DEPTH_WRITE_MASK_", "D3D12_DEPTH_WRITE_MASK_", [
    ["ALL", "描いた画素の Depth を書き込む（不透明）。"],
    ["ZERO", "書き込まない。判定だけする（半透明）。DX9 の ZWRITEENABLE = FALSE。"],
  ]);
  pair("Blend で掛ける値", "結果 = 新しい色 × SrcBlend （BlendOp） 今の色 × DestBlend。", "D3D11_BLEND_", "D3D12_BLEND_", [
    ["SRC_ALPHA", "新しい色の alpha を掛ける。"],
    ["INV_SRC_ALPHA", "1 − 新しい色の alpha。SRC_ALPHA と組むと普通の半透明。"],
    ["ONE", "1 を掛ける（そのまま）。ONE + ONE で足し算（光・炎）。"],
    ["ZERO", "0 を掛ける（消す）。"],
    ["DEST_COLOR", "今の色を掛ける（掛け算合成）。"],
    ["BLEND_FACTOR", "OMSetBlendState で渡す定数色を掛ける。"],
  ]);
  pair("Blend の合わせ方", "SrcBlend 側と DestBlend 側をどう合わせるか。", "D3D11_BLEND_OP_", "D3D12_BLEND_OP_", [
    ["ADD", "足す。普通はこれ。"],
    ["SUBTRACT", "新しい色 − 今の色。"],
    ["REV_SUBTRACT", "今の色 − 新しい色。"],
    ["MIN", "小さい方。"],
    ["MAX", "大きい方。"],
  ]);
  pair("書き込む色", "Blend の RenderTargetWriteMask。どのチャンネルを書くか。", "D3D11_COLOR_WRITE_ENABLE_", "D3D12_COLOR_WRITE_ENABLE_", [
    ["ALL", "R, G, B, A 全部を書く。0 のままだと何も書かれない。"],
    ["RED", "R だけ（GREEN / BLUE / ALPHA も同様）。"],
  ]);
  M("dx11", "D3D11_INPUT_*（InputLayout の進み方）", "InputLayout の1行が、頂点ごとに進むか、インスタンスごとに進むか。", [
    ["D3D11_INPUT_PER_VERTEX_DATA", "頂点ごとに次のデータへ進む。普通はこれ。"],
    ["D3D11_INPUT_PER_INSTANCE_DATA", "インスタンス（同じ形の複製）ごとに進む。草や木を大量に描くとき。"],
  ]);
  M("dx12", "D3D12_INPUT_CLASSIFICATION_*（InputLayout の進み方）", "InputLayout の1行が、頂点ごとに進むか、インスタンスごとに進むか。", [
    ["D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA", "頂点ごとに次のデータへ進む。普通はこれ。"],
    ["D3D12_INPUT_CLASSIFICATION_PER_INSTANCE_DATA", "インスタンスごとに進む。"],
  ], "DX11 の D3D11_INPUT_* と同じ意味。");
  M("dx11", "D3D11_FLOAT32_MAX", "float の最大値。Sampler の MaxLOD に入れると「Mip の制限なし」。", [
    ["D3D11_FLOAT32_MAX", "float の最大値。"],
  ]);
  M("dx12", "D3D12_FLOAT32_MAX", "float の最大値。Sampler の MaxLOD に入れると「Mip の制限なし」。", [
    ["D3D12_FLOAT32_MAX", "float の最大値。"],
  ]);

  // ---------- DX12 ----------
  M("dx12", "DXGI_CREATE_FACTORY_*（Factory の作り方）", "CreateDXGIFactory2 のフラグ。", [
    ["DXGI_CREATE_FACTORY_DEBUG", "DXGI 側の Debug 表示を有効にする（SwapChain の使い方の誤りなど）。"],
  ]);
  M("dx12", "D3D12_COMMAND_LIST_TYPE_*（命令の種類）", "CommandQueue / CommandAllocator / CommandList の種類。3つとも同じ種類にそろえる。", [
    ["D3D12_COMMAND_LIST_TYPE_DIRECT", "描画・計算・コピー何でもできる。普通はこれ。"],
    ["D3D12_COMMAND_LIST_TYPE_COMPUTE", "計算（Compute Shader）とコピーだけ。描画と並行して動かせる。"],
    ["D3D12_COMMAND_LIST_TYPE_COPY", "コピーだけ。転送を描画と並行して行うとき。"],
    ["D3D12_COMMAND_LIST_TYPE_BUNDLE", "何度も使う短い命令の束。"],
  ]);
  M("dx12", "D3D12_DESCRIPTOR_HEAP_TYPE_*（棚の種類）", "DescriptorHeap に何の札を置くか。", [
    ["D3D12_DESCRIPTOR_HEAP_TYPE_RTV", "描画先（RTV）の札。"],
    ["D3D12_DESCRIPTOR_HEAP_TYPE_DSV", "Depth（DSV）の札。"],
    ["D3D12_DESCRIPTOR_HEAP_TYPE_CBV_SRV_UAV", "ConstantBuffer・Texture・書き込み用 Resource の札。混ぜて置ける。"],
    ["D3D12_DESCRIPTOR_HEAP_TYPE_SAMPLER", "Sampler の札。"],
  ]);
  M("dx12", "D3D12_DESCRIPTOR_HEAP_FLAG_*（棚の見え方）", "DescriptorHeap を Shader から見えるようにするか。", [
    ["D3D12_DESCRIPTOR_HEAP_FLAG_SHADER_VISIBLE", "Shader から見える棚にする。CBV_SRV_UAV と SAMPLER の棚だけに付けられる。"],
    ["D3D12_DESCRIPTOR_HEAP_FLAG_NONE", "CPU だけが使う棚（RTV / DSV の棚はこれ）。"],
  ]);
  M("dx12", "D3D12_FENCE_FLAG_*（Fence の作り方）", "CreateFence のフラグ。", [
    ["D3D12_FENCE_FLAG_NONE", "普通の Fence。"],
    ["D3D12_FENCE_FLAG_SHARED", "別の Device やプロセスと共有する。"],
  ]);
  M("dx12", "D3D12_RESOURCE_BARRIER_TYPE_*（Barrier の種類）", "ResourceBarrier で何を宣言するか。", [
    ["D3D12_RESOURCE_BARRIER_TYPE_TRANSITION", "Resource の使い方（State）を切り替える。この教材の Barrier はすべてこれ。"],
    ["D3D12_RESOURCE_BARRIER_TYPE_ALIASING", "同じメモリを別の Resource で使い回すときの切り替え。"],
    ["D3D12_RESOURCE_BARRIER_TYPE_UAV", "Shader からの書き込みが終わるのを待つ。"],
  ]);
  M("dx12", "D3D12_RESOURCE_BARRIER_ALL_SUBRESOURCES", "Barrier の対象を、Resource の全部（Mip や配列の全部）にする指定。", [
    ["D3D12_RESOURCE_BARRIER_ALL_SUBRESOURCES", "全部まとめて切り替える。"],
  ]);
  M("dx12", "D3D12_RESOURCE_STATE_*（Resource の使い方）", "Resource を「今何として使っているか」。使い方を変えるときは Barrier で切り替える。", [
    ["D3D12_RESOURCE_STATE_PRESENT", "画面に表示するための状態（BackBuffer）。"],
    ["D3D12_RESOURCE_STATE_RENDER_TARGET", "描画先。"],
    ["D3D12_RESOURCE_STATE_COMMON", "特定の用途なし。Buffer は作った直後必ずこれ。"],
    ["D3D12_RESOURCE_STATE_COPY_DEST", "コピー先。"],
    ["D3D12_RESOURCE_STATE_COPY_SOURCE", "コピー元。"],
    ["D3D12_RESOURCE_STATE_GENERIC_READ", "いろいろな読み取りの組み合わせ。UPLOAD の Resource は必ずこれ。"],
    ["D3D12_RESOURCE_STATE_VERTEX_AND_CONSTANT_BUFFER", "VertexBuffer か ConstantBuffer として読む。"],
    ["D3D12_RESOURCE_STATE_INDEX_BUFFER", "IndexBuffer として読む。"],
    ["D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE", "PixelShader から Texture として読む。"],
    ["D3D12_RESOURCE_STATE_NON_PIXEL_SHADER_RESOURCE", "PixelShader 以外（VS や CS）から読む。"],
    ["D3D12_RESOURCE_STATE_DEPTH_WRITE", "Depth の書き込み先。"],
    ["D3D12_RESOURCE_STATE_DEPTH_READ", "Depth を読むだけ。"],
    ["D3D12_RESOURCE_STATE_UNORDERED_ACCESS", "Shader から書き込む（UAV）。"],
  ], "DX11 までは Direct3D が自動で切り替えていた。");
  M("dx12", "D3D12_ROOT_PARAMETER_TYPE_*（Root の引数の種類）", "RootSignature の1項目で、Shader に何をどう渡すか。", [
    ["D3D12_ROOT_PARAMETER_TYPE_CBV", "ConstantBuffer の GPU 番地を直接渡す（b0 など）。"],
    ["D3D12_ROOT_PARAMETER_TYPE_DESCRIPTOR_TABLE", "棚（DescriptorHeap）の場所を渡し、そこから連続した札を使う。Texture はこれで渡す。"],
    ["D3D12_ROOT_PARAMETER_TYPE_32BIT_CONSTANTS", "小さい値そのものを直接渡す（Buffer 不要）。"],
    ["D3D12_ROOT_PARAMETER_TYPE_SRV", "Buffer の SRV の番地を直接渡す。"],
    ["D3D12_ROOT_PARAMETER_TYPE_UAV", "Buffer の UAV の番地を直接渡す。"],
  ]);
  M("dx12", "D3D12_DESCRIPTOR_RANGE_TYPE_*（Table に入る札の種類）", "DescriptorTable の範囲が、どの種類の register につながるか。", [
    ["D3D12_DESCRIPTOR_RANGE_TYPE_SRV", "t レジスター（Texture など）。"],
    ["D3D12_DESCRIPTOR_RANGE_TYPE_CBV", "b レジスター（ConstantBuffer）。"],
    ["D3D12_DESCRIPTOR_RANGE_TYPE_UAV", "u レジスター（書き込み用）。"],
    ["D3D12_DESCRIPTOR_RANGE_TYPE_SAMPLER", "s レジスター（Sampler）。"],
  ]);
  M("dx12", "D3D12_DESCRIPTOR_RANGE_OFFSET_APPEND", "DescriptorTable の中で、この範囲をどこから始めるか。", [
    ["D3D12_DESCRIPTOR_RANGE_OFFSET_APPEND", "前の範囲のすぐ後ろから。範囲が1つなら 0 と同じ。"],
  ]);
  M("dx12", "D3D12_SHADER_VISIBILITY_*（どの Shader に見せるか）", "Root の引数や Static Sampler を、どの Shader が使うか。", [
    ["D3D12_SHADER_VISIBILITY_ALL", "全部の Shader。"],
    ["D3D12_SHADER_VISIBILITY_VERTEX", "VertexShader だけ。"],
    ["D3D12_SHADER_VISIBILITY_PIXEL", "PixelShader だけ。"],
  ]);
  M("dx12", "D3D12_ROOT_SIGNATURE_FLAG_*（RootSignature の指定）", "RootSignature 全体に付けるフラグ。", [
    ["D3D12_ROOT_SIGNATURE_FLAG_ALLOW_INPUT_ASSEMBLER_INPUT_LAYOUT", "InputLayout（頂点の読み方）を使う。VertexBuffer を使うなら必須。"],
    ["D3D12_ROOT_SIGNATURE_FLAG_NONE", "何もしない。"],
    ["D3D12_ROOT_SIGNATURE_FLAG_DENY_HULL_SHADER_ROOT_ACCESS", "使わない段階を宣言して少し速くする（DOMAIN / GEOMETRY なども同様）。"],
  ]);
  M("dx12", "D3D_ROOT_SIGNATURE_VERSION_*（RootSignature の版）", "D3D12SerializeRootSignature で使う書式の版。", [
    ["D3D_ROOT_SIGNATURE_VERSION_1", "最初の版。D3D12SerializeRootSignature ではこれ。"],
    ["D3D_ROOT_SIGNATURE_VERSION_1_1", "最適化用の指定が増えた版（D3D12SerializeVersionedRootSignature で使う）。"],
  ]);
  M("dx12", "D3D12_PRIMITIVE_TOPOLOGY_TYPE_*（PSO の図形の種類）", "PSO に固める、三角形か線か点か。LIST か STRIP かは描くときに IASetPrimitiveTopology で決める。", [
    ["D3D12_PRIMITIVE_TOPOLOGY_TYPE_TRIANGLE", "三角形。"],
    ["D3D12_PRIMITIVE_TOPOLOGY_TYPE_LINE", "線。"],
    ["D3D12_PRIMITIVE_TOPOLOGY_TYPE_POINT", "点。"],
  ]);
  M("dx12", "D3D_PRIMITIVE_TOPOLOGY_*（三角形の並び方）", "IASetPrimitiveTopology に渡す、Index をどう図形にするか。", [
    ["D3D_PRIMITIVE_TOPOLOGY_TRIANGLELIST", "Index 3個ずつで三角形1枚。"],
    ["D3D_PRIMITIVE_TOPOLOGY_TRIANGLESTRIP", "三角形を続けてつなぐ。"],
    ["D3D_PRIMITIVE_TOPOLOGY_LINELIST", "2個ずつで線1本。"],
    ["D3D_PRIMITIVE_TOPOLOGY_POINTLIST", "点。"],
  ], "DX11 の D3D11_PRIMITIVE_TOPOLOGY_* と同じもの。");
  M("dx12", "D3D12_HEAP_TYPE_*（メモリの種類）", "Resource を置くメモリ（Heap）の種類。", [
    ["D3D12_HEAP_TYPE_DEFAULT", "GPU 専用で速い。CPU からは見えない。"],
    ["D3D12_HEAP_TYPE_UPLOAD", "CPU が書ける。GPU からも読めるが遅め。転送用や毎フレーム書く ConstantBuffer に使う。"],
    ["D3D12_HEAP_TYPE_READBACK", "GPU の結果を CPU で読む用。"],
    ["D3D12_HEAP_TYPE_CUSTOM", "細かい性質を自分で指定する。"],
  ], "DX11 の Usage、DX9 の D3DPOOL に当たる。");
  M("dx12", "D3D12_HEAP_FLAG_*（Heap のフラグ）", "CreateCommittedResource に渡す Heap の追加指定。", [
    ["D3D12_HEAP_FLAG_NONE", "特になし。"],
    ["D3D12_HEAP_FLAG_SHARED", "別の Device やプロセスと共有する。"],
  ]);
  M("dx12", "D3D12_CPU_PAGE_PROPERTY_* / D3D12_MEMORY_POOL_*", "HEAP_TYPE_CUSTOM のときだけ使う細かい指定。それ以外は UNKNOWN にする決まり。", [
    ["D3D12_CPU_PAGE_PROPERTY_UNKNOWN", "Type に任せる。"],
    ["D3D12_MEMORY_POOL_UNKNOWN", "Type に任せる。"],
  ]);
  M("dx12", "D3D12_RESOURCE_DIMENSION_*（Resource の形）", "RESOURCE_DESC の Dimension。DX12 は Buffer も Texture も同じ構造体で作る。", [
    ["D3D12_RESOURCE_DIMENSION_BUFFER", "ただの Buffer（1次元の byte 列）。"],
    ["D3D12_RESOURCE_DIMENSION_TEXTURE1D", "1次元の Texture。"],
    ["D3D12_RESOURCE_DIMENSION_TEXTURE2D", "普通の画像。"],
    ["D3D12_RESOURCE_DIMENSION_TEXTURE3D", "3次元の Texture。"],
  ]);
  M("dx12", "D3D12_TEXTURE_LAYOUT_*（メモリ上の並べ方）", "Resource の中身をメモリにどう並べるか。", [
    ["D3D12_TEXTURE_LAYOUT_ROW_MAJOR", "行ごとに順番に並べる。Buffer は必ずこれ。"],
    ["D3D12_TEXTURE_LAYOUT_UNKNOWN", "GPU が読みやすい並べ方におまかせ。CPU からは並びが分からないので、UPLOAD 経由でコピーする。"],
  ]);
  M("dx12", "D3D12_RESOURCE_FLAG_*（Resource の使い道）", "RESOURCE_DESC の Flags。DX11 の BindFlags に当たる。", [
    ["D3D12_RESOURCE_FLAG_NONE", "特になし（Shader から読むだけなど）。"],
    ["D3D12_RESOURCE_FLAG_ALLOW_RENDER_TARGET", "描画先にできる。"],
    ["D3D12_RESOURCE_FLAG_ALLOW_DEPTH_STENCIL", "Depth の書き込み先にできる。"],
    ["D3D12_RESOURCE_FLAG_ALLOW_UNORDERED_ACCESS", "Shader から書き込める。"],
    ["D3D12_RESOURCE_FLAG_DENY_SHADER_RESOURCE", "Shader から読まない（Depth で少し速くなる）。"],
  ]);
  M("dx12", "D3D12_TEXTURE_COPY_TYPE_*（コピーの場所の指定方法）", "CopyTextureRegion のコピー元・先をどう表すか。", [
    ["D3D12_TEXTURE_COPY_TYPE_SUBRESOURCE_INDEX", "Texture の何番目（Mip など）かで指定する。コピー先の Texture 側。"],
    ["D3D12_TEXTURE_COPY_TYPE_PLACED_FOOTPRINT", "Buffer の中に、この並べ方（Footprint）で置いてある、と指定する。コピー元の UPLOAD 側。"],
  ]);
  M("dx12", "D3D12_SRV_DIMENSION_*（SRV の形）", "Shader から何として読むか。", [
    ["D3D12_SRV_DIMENSION_TEXTURE2D", "普通の画像（HLSL の Texture2D）。"],
    ["D3D12_SRV_DIMENSION_TEXTURECUBE", "キューブマップ。"],
    ["D3D12_SRV_DIMENSION_BUFFER", "Buffer。"],
  ]);
  M("dx12", "D3D12_DEFAULT_SHADER_4_COMPONENT_MAPPING", "SRV で読むときの R, G, B, A の並べ替え。", [
    ["D3D12_DEFAULT_SHADER_4_COMPONENT_MAPPING", "並べ替えない（R は R、G は G のまま）。"],
  ]);
  M("dx12", "D3D12_*_ALIGNMENT（揃える単位）", "DX12 のメモリ配置の決まり。", [
    ["D3D12_CONSTANT_BUFFER_DATA_PLACEMENT_ALIGNMENT", "256。ConstantBuffer は 256byte 境界からしか置けない。"],
    ["D3D12_TEXTURE_DATA_PITCH_ALIGNMENT", "256。Texture を Buffer からコピーするとき、1行の間隔（RowPitch）はこの倍数。"],
  ]);
  M("dx12", "D3D12_CLEAR_FLAG_*（Depth の Clear で消すもの）", "ClearDepthStencilView で何を初期化するか。", [
    ["D3D12_CLEAR_FLAG_DEPTH", "Depth。"],
    ["D3D12_CLEAR_FLAG_STENCIL", "Stencil。"],
  ]);
  M("dx12", "UINT_MAX", "UINT の最大値（全ビットが 1）。", [
    ["UINT_MAX", "PSO の SampleMask では「全部のサンプルに書く」の意味（DX11 の 0xFFFFFFFF）。"],
  ]);
  M("dx12", "INFINITE", "Windows の待ち時間の指定。", [
    ["INFINITE", "時間切れなしで待つ。Fence の合図が来るまで CPU を止める。"],
  ]);

  return list;
})();

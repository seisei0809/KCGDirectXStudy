// 用語・考え方・型・API の辞書データ（手で編集してよい）。
const DICTIONARY = {
 "terms": {
  "dx9": [
   [
    "Device",
    "DX9 の中心になるオブジェクトです。GPU Resource の作成、描画状態の設定、Draw、画面表示までをこの Device に対して行います。"
   ],
   [
    "BackBuffer",
    "最終的に画面へ表示するための描画先です。Present を呼ぶと、この BackBuffer の内容が Window に表示されます。"
   ],
   [
    "Windowed mode",
    "画面全体を占有する表示ではなく、通常の Windows の Window 内へ描画する方式です。D3DPRESENT_PARAMETERS.Windowed = TRUE で指定します。"
   ],
   [
    "DepthStencil",
    "奥行き判定用の Depth 値と、必要に応じて Stencil 値を保存する Buffer です。手前の物体を奥の物体より前に表示するために使います。"
   ],
   [
    "Present interval",
    "Present を画面更新の何回ごとに行うかを決める設定です。D3DPRESENT_INTERVAL_ONE は通常 1 回の画面更新に 1 回合わせる VSync 相当です。"
   ],
   [
    "SwapEffect",
    "Present 後に BackBuffer をどう扱うかを決める設定です。D3DSWAPEFFECT_DISCARD は Present 後の内容を保持する必要がない方式です。"
   ],
   [
    "Hardware / Software Vertex Processing",
    "DX9 が頂点の変換処理をどこで行うかを決める方式です。Hardware は GPU 側、Software は CPU 側で処理します。最初に Hardware を試し、作れない環境では Software へ切り替えます。"
   ],
   [
    "WIC",
    "Windows Imaging Component。PNG などの画像ファイルを開き、画素データへ変換する Windows の画像処理 API です。この教材では Icon.png の読み込みに使います。"
   ],
   [
    "BGRA",
    "1ピクセルを Blue・Green・Red・Alpha の順で並べる色データ形式です。この教材では各色成分を 8bit、合計 32bit で扱います。"
   ],
   [
    "HRESULT",
    "DirectX / COM API の成功・失敗を表す戻り値です。FAILED(hr) で失敗かどうかを判定します。"
   ],
   [
    "COM / ComPtr",
    "DirectX や WIC の多くのインターフェースが使うオブジェクト管理方式です。ComPtr は参照数を管理し、使い終わった COM オブジェクトを自動で解放します。"
   ],
   [
    "VertexBuffer",
    "頂点座標・色・UV など、頂点ごとのデータを GPU が読むための Buffer です。"
   ],
   [
    "IndexBuffer",
    "どの頂点をどの順番で使って三角形を作るかを番号で保存する Buffer です。"
   ],
   [
    "VB / IB",
    "VB は VertexBuffer、IB は IndexBuffer の略です。VB に頂点データ、IB に頂点を使う順番を入れます。"
   ],
   [
    "FVF",
    "Flexible Vertex Format。VertexBuffer の1頂点に位置・色・UV がどの順で入っているかを固定機能 Pipeline へ伝えます。"
   ],
   [
    "Fixed Function Pipeline",
    "Shader を自分で書く代わりに、SetTransform や TextureStageState など DX9 側に用意された固定処理を組み合わせる描画経路です。"
   ],
   [
    "Device state / RenderState",
    "Device が現在覚えている描画設定です。Depth、Blend、Cull、Texture などを SetRenderState などで変更すると、その後の Draw に使われます。"
   ],
   [
    "World / View / Projection",
    "World は物体の位置・向き、View は Camera から見た座標、Projection は遠近感を付けて画面へ投影する変換です。"
   ],
   [
    "Orthographic / Perspective",
    "Orthographic（平行投影）は、遠くの物も近くの物も同じ大きさで映る投影です。Perspective（透視投影）は、遠くの物ほど小さく映る投影です。この教材ではカメラ（View）は共通のまま Projection 行列だけを入れ替え、F1 / F2 でどの段階でも切り替えられます。"
   ],
   [
    "RenderTarget",
    "Draw の結果を書き込む描画先です。最終表示用の BackBuffer だけでなく、Texture を中間描画先として使うこともできます。"
   ],
   [
    "Surface",
    "DX9 で Texture の各 level や BackBuffer の描画面を表すオブジェクトです。SetRenderTarget には Surface を渡します。"
   ],
   [
    "Texture",
    "画像の画素を GPU から読むための Resource です。この教材では Icon.png と、Scene を描いた結果の2種類を使います。"
   ],
   [
    "Texture Stage",
    "Texture の色と頂点色をどう組み合わせるかを決める固定機能 Pipeline の設定です。"
   ],
   [
    "Sampler",
    "Texture を拡大・縮小するときの補間方法と、UV が 0..1 を越えたときの扱いを決めます。"
   ],
   [
    "Depth Test",
    "描こうとしているピクセルが、すでに描かれたピクセルより手前か奥かを Depth 値で判定する処理です。"
   ],
   [
    "Alpha Blend",
    "半透明表示のために、新しく描く色とすでに RenderTarget にある色を alpha 値で混ぜる処理です。"
   ],
   [
    "SceneTexture",
    "3D Scene をいったん描いて保存する中間 Texture です。最後にこの Texture を BackBuffer へ貼って表示します。"
   ],
   [
    "Scene Pass / Present Pass",
    "Scene Pass は3D Scene を SceneTexture へ描く処理、Present Pass はその SceneTexture を BackBuffer へ描く処理です。"
   ],
   [
    "Indexed Draw",
    "頂点を直接順番に並べるのではなく、IndexBuffer の番号で再利用しながら三角形を描く方法です。"
   ],
   [
    "Fullscreen Quad",
    "画面全体を覆う長方形です。SceneTexture をこの Quad に貼って描くことで、中間描画結果を BackBuffer 全体へ表示します。"
   ],
   [
    "Present",
    "BackBuffer に完成した1フレームを Window へ表示する処理です。"
   ]
  ],
  "dx11": [
   [
    "Device",
    "Buffer、Texture、Shader、State、View を作るためのオブジェクトです。DX11 では『作る役』を主に担当します。"
   ],
   [
    "ImmediateContext",
    "作成済み Resource や State を Pipeline へ設定し、Clear や DrawIndexed を実行するオブジェクトです。DX11 では『使う役』を主に担当します。"
   ],
   [
    "Pipeline",
    "頂点データが入力され、VertexShader、Rasterizer、PixelShader、出力の順に処理されて画面の色になる流れです。"
   ],
   [
    "Bind",
    "作成済みの Resource・Shader・State を、次の Draw で使う Pipeline の場所へ設定することです。"
   ],
   [
    "SwapChain",
    "画面表示用 BackBuffer を管理し、完成した BackBuffer を Present する仕組みです。"
   ],
   [
    "Windowed mode",
    "画面全体を占有せず、通常の Windows の Window 内へ描画する表示方式です。SwapChain の Windowed = TRUE で指定します。"
   ],
   [
    "SwapEffect",
    "Present のときに BackBuffer をどう表示側へ渡すかを決める設定です。この教材では、現在推奨される DXGI_SWAP_EFFECT_FLIP_DISCARD（flip model）を使います。"
   ],
   [
    "Debug Layer",
    "Direct3D の使い方に誤りがあるとき、Visual Studio の出力へ詳しい警告やエラーを出してくれる検証機能です。Debug build で有効化します。"
   ],
   [
    "Feature Level",
    "GPU が利用できる描画機能の基準です。DirectX API の世代番号とは別で、DX11 では D3D_FEATURE_LEVEL_11_0 を要求します。"
   ],
   [
    "Present interval / VSync",
    "Present(1, 0) の最初の 1 は、画面更新1回ごとに表示を切り替える指定です。描画更新をディスプレイの垂直同期に合わせます。"
   ],
   [
    "HLSL",
    "High Level Shading Language。GPU 上で動く Shader を記述する言語です。この教材では頂点の座標変換と Texture の読み取りに使います。"
   ],
   [
    "Shader Model",
    "HLSL をどの世代の Shader 命令としてコンパイルするかを示す番号です。DX11 では vs_5_0 / ps_5_0 を使います。"
   ],
   [
    "Shader bytecode",
    "HLSL をコンパイルして GPU が読み込める形にしたバイトコードです。VertexShader / PixelShader オブジェクトの作成に渡します。"
   ],
   [
    "WIC",
    "Windows Imaging Component。PNG などの画像ファイルを開き、画素データへ変換する Windows の画像処理 API です。この教材では Icon.png の読み込みに使います。"
   ],
   [
    "BGRA",
    "1ピクセルを Blue・Green・Red・Alpha の順で並べる色データ形式です。この教材では各色成分を 8bit、合計 32bit で扱います。"
   ],
   [
    "HRESULT",
    "DirectX / COM API の成功・失敗を表す戻り値です。FAILED(hr) で失敗かどうかを判定します。"
   ],
   [
    "COM / ComPtr",
    "DirectX や WIC の多くのインターフェースが使うオブジェクト管理方式です。ComPtr は参照数を管理し、使い終わった COM オブジェクトを自動で解放します。"
   ],
   [
    "BackBuffer",
    "最終的に Window へ表示する描画先 Texture です。SwapChain から取得して RTV を作ります。"
   ],
   [
    "Resource",
    "GPU が使う Buffer や Texture の実体です。DX11 では用途ごとに View を作って使い分けます。"
   ],
   [
    "View",
    "同じ Resource を『描画先として使う』『Shader から読む』『Depth に使う』など、用途別に見せるためのオブジェクトです。"
   ],
   [
    "RTV",
    "Render Target View。Texture を色の描画先として使うための View です。"
   ],
   [
    "SRV",
    "Shader Resource View。Texture を Shader から読み取るための View です。"
   ],
   [
    "DSV",
    "Depth Stencil View。Depth Texture を奥行き判定用として使うための View です。"
   ],
   [
    "Shader",
    "頂点位置の変換や Texture の読み取りなど、GPU 上で各頂点・ピクセルに対して実行するプログラムです。"
   ],
   [
    "InputLayout",
    "C++ 側 Vertex のメモリ配置と、HLSL 側 POSITION / COLOR / TEXCOORD を対応付けます。"
   ],
   [
    "ConstantBuffer",
    "World / View / Projection など、複数の頂点で共通して使う値を Shader へ渡す Buffer です。"
   ],
   [
    "VB / IB / CB",
    "VB は VertexBuffer、IB は IndexBuffer、CB は ConstantBuffer の略です。頂点、頂点の並び順、Shader へ渡す共通値をそれぞれ保存します。"
   ],
   [
    "IA / VS / PS / RS / OM",
    "DX11 Pipeline の段階名の略です。IA は Input Assembler、VS は Vertex Shader、PS は Pixel Shader、RS は Rasterizer、OM は Output Merger を表します。"
   ],
   [
    "MSAA",
    "Multisample Anti-Aliasing。三角形の輪郭を複数のサンプルで判定し、ギザギザを減らす方法です。SampleDesc.Count = 1 は MSAA を使わない設定です。"
   ],
   [
    "State Object",
    "Blend、Depth、Rasterizer の設定をあらかじめオブジェクトとして作り、必要な Draw の前で Context へ設定します。"
   ],
   [
    "Rasterizer",
    "三角形を画面上のピクセルへ変換する段階です。表裏どちらを描くか、塗りつぶすかなどの条件もここで決めます。"
   ],
   [
    "Depth Test",
    "描こうとしているピクセルが、すでに描かれたピクセルより手前か奥かを Depth 値で判定する処理です。"
   ],
   [
    "Alpha Blend",
    "透明度を使い、新しく描く色と RenderTarget にすでにある色を混ぜる処理です。"
   ],
   [
    "Viewport",
    "RenderTarget のどの範囲へ、どの大きさで描画するかをピクセル座標で指定する領域です。"
   ],
   [
    "Sampler",
    "Texture を拡大・縮小するときの補間方法と、UV が範囲外になったときの扱いを決める状態です。"
   ],
   [
    "DepthStencilState",
    "Depth Test を有効にするか、Depth を書き込むかなどをまとめた状態です。"
   ],
   [
    "BlendState",
    "半透明描画で、これから描く色と描画済みの色をどう混ぜるかをまとめた状態です。"
   ],
   [
    "b0 / t0 / s0",
    "HLSL のスロット番号です。b0 は ConstantBuffer、t0 は Texture、s0 は Sampler を表し、C++ 側で同じ番号へ設定します。"
   ],
   [
    "Offscreen RenderTarget",
    "BackBuffer ではない Texture へ Scene を先に描き、その Texture を次の描画で読み取るための中間描画先です。"
   ],
   [
    "SceneTexture",
    "3D Scene をいったん描いて保存する中間 Texture です。Scene Pass では RTV、Present Pass では SRV として同じ Resource を使います。"
   ],
   [
    "Scene Pass / Present Pass",
    "Scene Pass は3D Scene を SceneTexture へ描く処理、Present Pass は SceneTexture を読み取って BackBuffer へ描く処理です。"
   ],
   [
    "WVP",
    "World・View・Projection の3つの行列をまとめた呼び方です。物体の座標を最終的な画面座標へ変換します。"
   ],
   [
    "Orthographic / Perspective",
    "Orthographic（平行投影）は、遠くの物も近くの物も同じ大きさで映る投影です。Perspective（透視投影）は、遠くの物ほど小さく映る投影です。この教材ではカメラ（View）は共通のまま Projection 行列だけを入れ替え、F1 / F2 でどの段階でも切り替えられます。"
   ],
   [
    "Indexed Draw",
    "IndexBuffer の番号を使って頂点を再利用しながら三角形を描く方法です。DX11 では DrawIndexed を使います。"
   ],
   [
    "Fullscreen Quad",
    "画面全体を覆う長方形です。SceneTexture を Texture として読み、その結果を BackBuffer 全体へ表示するために使います。"
   ],
   [
    "Present",
    "SwapChain の BackBuffer に完成した1フレームを Window へ表示する処理です。"
   ]
  ],
  "dx12": [
   [
    "Device",
    "DX12 の Resource、DescriptorHeap、RootSignature、PSO などを作るための中心オブジェクトです。"
   ],
   [
    "DXGI Factory",
    "GPU Adapter（描画に使う GPU）や SwapChain など、画面表示まわりの DXGI オブジェクトを作る入口です。DX12 では CreateDXGIFactory2 で取得します。"
   ],
   [
    "Debug Layer",
    "Resource State や Command の使い方に誤りがあるとき、詳しい警告やエラーを出してくれる検証機能です。Device を作る前に有効化します。"
   ],
   [
    "Feature Level",
    "GPU が利用できる描画機能の基準です。DX12 API を使っていても Device 作成時には最低限必要な Feature Level を別に指定します。"
   ],
   [
    "SwapChain",
    "画面表示用 BackBuffer を管理し、完成した BackBuffer を Present する仕組みです。"
   ],
   [
    "SwapEffect / flip model",
    "Present 時に BackBuffer を表示側へどう渡すかを決める方式です。DX12 では DXGI_SWAP_EFFECT_FLIP_DISCARD を使い、BackBuffer を順番に切り替える flip model で表示します。"
   ],
   [
    "Present interval / VSync",
    "Present(1, 0) の最初の 1 は、画面更新1回ごとに表示を切り替える指定です。描画更新をディスプレイの垂直同期に合わせます。"
   ],
   [
    "HLSL",
    "High Level Shading Language。GPU 上で動く Shader を記述する言語です。この教材では頂点の座標変換と Texture の読み取りに使います。"
   ],
   [
    "Shader Model",
    "HLSL をどの世代の Shader 命令としてコンパイルするかを示す番号です。DX12 の教材では vs_5_1 / ps_5_1 を使います。"
   ],
   [
    "Shader bytecode",
    "HLSL をコンパイルして GPU が読み込める形にしたバイトコードです。DX12 では PSO の作成時に渡します。"
   ],
   [
    "WIC",
    "Windows Imaging Component。PNG などの画像ファイルを開き、画素データへ変換する Windows の画像処理 API です。この教材では Icon.png の読み込みに使います。"
   ],
   [
    "BGRA",
    "1ピクセルを Blue・Green・Red・Alpha の順で並べる色データ形式です。この教材では各色成分を 8bit、合計 32bit で扱います。"
   ],
   [
    "HRESULT",
    "DirectX / COM API の成功・失敗を表す戻り値です。FAILED(hr) で失敗かどうかを判定します。"
   ],
   [
    "COM / ComPtr",
    "DirectX や WIC の多くのインターフェースが使うオブジェクト管理方式です。ComPtr は参照数を管理し、使い終わった COM オブジェクトを自動で解放します。"
   ],
   [
    "CBV",
    "Constant Buffer View。Shader から ConstantBuffer を読むための接続方法です。この教材の DX12 では Root CBV として GPU 仮想アドレスを直接指定します。"
   ],
   [
    "Descriptor Range / Root Parameter",
    "Descriptor Range は連続する Descriptor の範囲、Root Parameter は RootSignature 内の1つの接続口です。t0 Texture や b0 ConstantBuffer をどこへ接続するか定義します。"
   ],
   [
    "Static Sampler",
    "DescriptorHeap に Sampler を置かず、RootSignature の中へ固定 Sampler 設定を直接埋め込む仕組みです。"
   ],
   [
    "Viewport / Scissor",
    "Viewport は描画結果を置く画面領域、Scissor は実際にピクセルを書いてよい矩形範囲です。この教材ではどちらも 1280 × 720 全体に設定します。"
   ],
   [
    "BackBuffer",
    "最終的に Window へ表示する描画先 Resource です。描画時は RENDER_TARGET、表示時は PRESENT の state にします。"
   ],
   [
    "Resource",
    "GPU が使う Buffer や Texture の実体です。DX12 では現在の用途を Resource State として明示します。"
   ],
   [
    "Descriptor",
    "Resource を RTV / DSV / SRV などの用途で使うための小さな設定情報です。DescriptorHeap のスロットに置きます。"
   ],
   [
    "DescriptorHeap",
    "RTV / DSV / SRV などの Descriptor を連続したスロットとして置く領域です。CPU/GPU Handle で各スロットを指します。"
   ],
   [
    "RTV / DSV / SRV",
    "RTV は色の描画先、DSV は Depth 用、SRV は Shader から読むための Descriptor です。"
   ],
   [
    "CommandQueue",
    "記録済み CommandList を GPU の実行順へ投入する Queue です。"
   ],
   [
    "CommandList",
    "Clear、Barrier、Draw など、GPU に実行させる命令を順番に記録するオブジェクトです。"
   ],
   [
    "Pipeline",
    "頂点データが入力され、VertexShader、Rasterizer、PixelShader、出力の順に処理されて画面の色になる流れです。DX12 では固定設定の多くを PSO にまとめます。"
   ],
   [
    "Bind",
    "Descriptor、RootSignature、PSO などを、これから CommandList に記録する Draw で使う状態へ設定することです。"
   ],
   [
    "CommandAllocator",
    "CommandList が命令を記録するために使うメモリです。GPU がその命令を使い終わってから Reset します。"
   ],
   [
    "Fence",
    "GPU が Queue のどこまで処理を終えたかを数値で確認する同期用オブジェクトです。"
   ],
   [
    "RootSignature",
    "Shader が使う ConstantBuffer、Texture、Sampler と C++ 側の設定場所を対応付ける契約です。"
   ],
   [
    "PSO",
    "Pipeline State Object。Shader、Blend、Depth、Rasterizer、出力形式など Draw 時に必要な固定設定をまとめたオブジェクトです。"
   ],
   [
    "Rasterizer",
    "三角形を画面上のピクセルへ変換する段階です。表裏どちらを描くか、塗りつぶすかなどの設定は PSO に含めます。"
   ],
   [
    "Depth Test",
    "描こうとしているピクセルが、すでに描かれたピクセルより手前か奥かを Depth 値で判定する処理です。DX12 では設定を PSO に含めます。"
   ],
   [
    "Alpha Blend",
    "透明度を使い、新しく描く色と RenderTarget にすでにある色を混ぜる処理です。DX12 では設定を PSO に含めます。"
   ],
   [
    "ConstantBuffer",
    "World / View / Projection など、Shader で共通して使う値を渡す Buffer です。DX12 では 256バイト単位に揃えて配置します。"
   ],
   [
    "VB / IB / CB",
    "VB は VertexBuffer、IB は IndexBuffer、CB は ConstantBuffer の略です。頂点、頂点の並び順、Shader へ渡す共通値をそれぞれ保存します。"
   ],
   [
    "MSAA",
    "Multisample Anti-Aliasing。三角形の輪郭を複数のサンプルで判定し、ギザギザを減らす方法です。SampleDesc.Count = 1 は MSAA を使わない設定です。"
   ],
   [
    "Resource State",
    "Resource を現在どの用途で使うかを表す状態です。COPY_DEST、RENDER_TARGET、PIXEL_SHADER_RESOURCE、PRESENT などがあります。"
   ],
   [
    "ResourceBarrier",
    "同じ Resource の用途を切り替えるときに、StateBefore から StateAfter への変更を CommandList へ記録する命令です。"
   ],
   [
    "Upload Heap",
    "CPU から書き込みやすいメモリです。Vertex / Index / Texture のデータを一度ここへ置いてから GPU 向け Resource へコピーします。"
   ],
   [
    "Default Heap",
    "GPU が主に使用するメモリです。CPU から直接書かず、Upload Heap からコピー命令で転送します。"
   ],
   [
    "Descriptor Table",
    "Shader から見える DescriptorHeap のどのスロットを Texture などとして読むかを RootSignature 経由で指定する仕組みです。"
   ],
   [
    "CPU / GPU Descriptor Handle",
    "DescriptorHeap 内のスロットを指す値です。CPU Handle は Descriptor 作成や RenderTarget 設定、GPU Handle は Shader から読む Descriptor の指定に使います。"
   ],
   [
    "SceneTexture",
    "3D Scene をいったん描いて保存する中間 Texture です。RENDER_TARGET と PIXEL_SHADER_RESOURCE の間を ResourceBarrier で切り替えます。"
   ],
   [
    "Scene Pass / Present Pass",
    "Scene Pass は SceneTexture へ3D Scene を描く処理、Present Pass はその SceneTexture を BackBuffer へ描く処理です。"
   ],
   [
    "WVP",
    "World・View・Projection の3つの行列をまとめた呼び方です。物体の座標を最終的な画面座標へ変換します。"
   ],
   [
    "Orthographic / Perspective",
    "Orthographic（平行投影）は、遠くの物も近くの物も同じ大きさで映る投影です。Perspective（透視投影）は、遠くの物ほど小さく映る投影です。この教材ではカメラ（View）は共通のまま Projection 行列だけを入れ替え、F1 / F2 でどの段階でも切り替えられます。"
   ],
   [
    "Indexed Draw",
    "IndexBuffer の番号を使って頂点を再利用しながら三角形を描く方法です。DX12 では DrawIndexedInstanced を使います。"
   ],
   [
    "Fullscreen Quad",
    "画面全体を覆う長方形です。SceneTexture を Shader から読み、BackBuffer 全体へ表示する Present Pass で使います。"
   ],
   [
    "Present",
    "BackBuffer を PRESENT state に戻したあと、SwapChain へ完成した1フレームを Window に表示させる処理です。"
   ]
  ]
 },
 "concepts": [
  {
   "name": "DirectX / Direct3D / DXGI / WIC の関係",
   "short": "最初に名前を整理する",
   "beginner": "DirectX は Windows のマルチメディアAPI群の総称です。この教材で主に触る描画APIが Direct3D 9 / 11 / 12。DXGI はGPU Adapter・Display・SwapChainなど表示との橋渡し、WIC はPNG/JPEGなど画像のdecodeを担当します。",
   "why": "DX11/12では『描画』『画面表示』『画像decode』が別APIへ分かれているため、1つのRendererでもDirect3D・DXGI・WICを組み合わせます。",
   "advanced": "Direct3D 12は特にresource/command APIへ集中しており、swap chainはDXGI側です。画像codecもDirect3Dの責務ではないためWIC等を使います。この責務分離を意識するとAPI境界が理解しやすくなります。"
  },
  {
   "name": "CPU と GPU は別々に進む",
   "short": "描画APIを理解する土台",
   "beginner": "CPU は C++ のコードを実行し、GPU は頂点処理・ラスタライズ・PixelShader など大量の描画処理を並列に進めます。Draw を呼んだからといって、その瞬間に画面への描画が完了しているとは限りません。",
   "why": "DX9 / DX11 では Runtime や Driver が多くを隠します。DX12 では CommandList を記録し、Queue に投入し、Fence で完了位置を確認するため、この非同期性がコード上に直接現れます。",
   "advanced": "重要なのは『API call の完了』と『GPU work の完了』を分けて考えることです。CPU が command memory や upload resource を再利用してよい時点は、対応する GPU work の完了後です。"
  },
  {
   "name": "Device / Context / Queue",
   "short": "作る役と、命令する役を分ける",
   "beginner": "Device は GPU Resource や Pipeline Object を作る入口です。DX11 の ImmediateContext は Draw や Binding を行う命令先、DX12 の CommandQueue は記録済み CommandList を GPU へ投入する入口です。",
   "why": "DX9 は Device が作成と描画命令の両方を広く担当します。DX11 で Device と Context が分離され、DX12 では『記録』と『投入』までさらに分かれます。",
   "advanced": "この分離は Renderer abstraction の境界そのものです。Resource creation、command recording、submission、synchronization を別責務として扱えると、後で multi-thread recording や複数 Queue へ拡張しやすくなります。"
  },
  {
   "name": "Resource と View / Descriptor",
   "short": "実体と『どう見るか』は別物",
   "beginner": "Texture2D や Buffer が Resource 本体です。同じ Texture を『描画先』として使うなら RTV、『Shader から読む』なら SRV、『Depth』なら DSV という見え方を用意します。",
   "why": "1つのメモリを用途ごとに別オブジェクトへコピーするのではなく、同じ Resource に対して用途を表す View を作れるからです。今回の Offscreen Texture は RTV と SRV の両方を持ちます。",
   "advanced": "DX11 の View は COM Object ですが、DX12 の RTV/SRV/DSV は DescriptorHeap の slot に書かれる Descriptor です。DX12 では Descriptor の寿命・slot・CPU/GPU handle の区別までアプリ側の管理対象になります。"
  },
  {
   "name": "Pipeline と State",
   "short": "Draw は大量の状態の組み合わせ",
   "beginner": "Draw の結果は VertexBuffer だけでは決まりません。Shader、Blend、Depth、Rasterizer、RenderTarget、Texture など、その時点で設定されている状態の組み合わせで決まります。",
   "why": "DX9 は Device の current state を少しずつ変更します。DX11 は BlendState などを Object 化し、DX12 は多くの状態を PSO に事前集約します。",
   "advanced": "DX12 の PSO は Driver が Draw 時に解釈する可変状態を減らし、事前検証・最適化しやすくする設計です。PSO cache や material/pass 設計に繋がる考え方です。"
  },
  {
   "name": "Vertex / Index / Input Assembler",
   "short": "GPUへ形状をどう渡すか",
   "beginner": "VertexBuffer は頂点属性の配列、IndexBuffer は『どの頂点をどの順番で使うか』の配列です。TriangleList なら Index 3個で1三角形になります。",
   "why": "Index を使うと同じ頂点を複数三角形から再利用できます。InputLayout / FVF / VBV は、その生バイト列を POSITION・COLOR・TEXCOORD としてどう読むかを GPU に伝えます。",
   "advanced": "stride、offset、format、semantic の不一致は描画崩れの典型原因です。DX12 の VBV/IBV は Resource COM Object 自体ではなく GPU virtual address と byte range を示す軽量 view struct です。"
  },
  {
   "name": "Texture Format / Stride / RowPitch",
   "short": "画像は『色』ではなくバイト列",
   "beginner": "PNG を decode すると最終的には pixel のバイト列になります。今回の WIC 出力は 32bpp BGRA なので、1 pixel は B,G,R,A の4 byte です。",
   "why": "CPU 側のバイト並びと GPU Texture Format が一致しないと、赤と青が入れ替わるなど誤った色になります。また1行の実メモリ幅は単純な width×4 と一致しない場合があります。",
   "advanced": "DX9 の D3DFMT_A8R8G8B8 は little-endian memory 上では BGRA byte order と整合します。DX11/12 の PNG Texture は DXGI_FORMAT_B8G8R8A8_UNORM を使っています。DX12 upload では RowPitch alignment を GetCopyableFootprints で取得します。"
  },
  {
   "name": "Shader と Binding Slot",
   "short": "HLSL の変数は自動では C++ と繋がらない",
   "beginner": "HLSL の register(b0)、register(t0)、register(s0) は ConstantBuffer、Texture、Sampler の接続先番号です。C++ 側も同じ slot に Resource を設定する必要があります。",
   "why": "Shader source の変数名と C++ の変数名が同じでも自動接続はされません。Binding は API の slot / RootParameter / DescriptorTable で決まります。",
   "advanced": "DX11 では Stage ごとに slot binding を行い、DX12 では RootSignature が Shader visibility と register space を含む契約になります。Root cost や descriptor table layout は大規模 Renderer で重要になります。"
  },
  {
   "name": "RenderTarget / Depth / Blend",
   "short": "最終pixelを書き込む段階",
   "beginner": "RenderTarget は色を書き込む先、DepthBuffer は前後関係を判定する先、Blend は新しい色と既に書かれた色をどう混ぜるかを決めます。",
   "why": "半透明は単に alpha 値を持たせるだけでは成立しません。Blend State を有効にし、必要なら Depth write をどうするかも考える必要があります。",
   "advanced": "透明物の一般的な描画では順序依存が発生します。今回の Panel は Blend State の差を観察するための最小例であり、実ゲームでは sort、premultiplied alpha、depth write policy などが設計課題になります。"
  },
  {
   "name": "SwapChain / BackBuffer / Present",
   "short": "描画結果をWindowへ見せる仕組み",
   "beginner": "BackBuffer は今から描く画面用 Texture、Present は完成した BackBuffer を表示側へ渡す処理です。SwapChain は複数 BackBuffer を順番に回します。",
   "why": "表示中の画像へ直接書き込むのではなく、裏で次のフレームを描き、完成後に切り替えることで tearing や待ちを制御できます。",
   "advanced": "DX12 の flip model では Present 後に現在の BackBuffer index が進みます。BackBuffer Resource は Present 前に PRESENT state に戻す必要があります。syncInterval は VSync の挙動にも関係します。"
  },
  {
   "name": "Offscreen RenderTarget と 2-pass",
   "short": "一度描いた画像をもう一度入力にする",
   "beginner": "Scene を直接 BackBuffer へ描かず、別 Texture へ描きます。その Texture を次の Draw で読み、Fullscreen Quad に貼って BackBuffer へ出します。",
   "why": "同じ Texture を『出力』と『入力』の両方で使うことで、Resource/View/State の違いが一度に理解できます。PostEffect や ShadowMap も同じ発想の延長です。",
   "advanced": "DX11 では同一 subresource を RTV と SRV に同時 bind できないため hazard があり、Runtime が競合 binding を解除・警告します。DX12 では用途切替を ResourceBarrier で明示します。"
  },
  {
   "name": "UploadHeap / DefaultHeap / Resource Lifetime",
   "short": "CPUからGPUメモリへ渡す",
   "beginner": "DX12 では CPU が書きやすい UploadHeap と、GPU が使いやすい DefaultHeap を分けます。CPU は UploadHeap に書き、Copy command で DefaultHeap へ転送します。",
   "why": "CPU と GPU で最適なメモリ特性が違うからです。Texture や静的 VertexBuffer は DefaultHeap に置くのが基本です。",
   "advanced": "Upload Resource は Copy command を Queue に投入しただけでは解放できません。GPU が Copy を終えた Fence value まで生存させる必要があります。Persistent mapping も一般的な設計です。"
  },
  {
   "name": "CommandAllocator / CommandList / Fence",
   "short": "DX12の記録・実行・再利用",
   "beginner": "CommandList に命令を書き、Close して Queue に渡します。CommandAllocator はその記録用メモリ、Fence は GPU がどこまで終わったかを示す番号です。",
   "why": "CPU が次のフレームを書いている間に GPU が前のフレームを実行できるよう、命令の記録と実行を分離しています。",
   "advanced": "Allocator を Reset できるのは、それを使った CommandList の GPU 実行完了後です。教材では毎フレーム待ちますが、実運用では frame context ごとに allocator/fence value を持って CPU-GPU overlap を作ります。"
  },
  {
   "name": "COM / ComPtr / HRESULT",
   "short": "DirectX APIの所有権とエラー処理",
   "beginner": "DirectX と WIC の多くは COM Interface を返します。ComPtr は AddRef / Release を自動管理する smart pointer、HRESULT は成功・失敗を表す値です。",
   "why": "生の COM pointer を手作業で Release すると漏れや二重解放が起きやすいため、教材では ComPtr を使います。HRESULT は FAILED / SUCCEEDED で判定します。",
   "advanced": "GetAddressOf は out parameter 用、Get は一時的な生 pointer 参照、Attach は既に返された ownership を ComPtr に受け渡す操作です。IID_PPV_ARGS は interface IID と void** の組を型安全寄りに生成します。"
  },
  {
   "name": "Create / Bind / Draw は別の処理",
   "short": "作っただけでは描画に使われない",
   "beginner": "CreateTexture2D や CreateBuffer は Resource を『作る』処理です。その後 SRV や VertexBuffer を Pipeline へ『bindする』処理があり、最後に Draw して初めてその設定が描画へ使われます。",
   "why": "黒画面の多くは『Resourceは作れたがDraw時にbindされていない』という状態です。作成成功と描画成功を分けて確認すると原因を追いやすくなります。",
   "advanced": "DX9はDevice current state、DX11はContext binding、DX12はCommandList recordingとしてbind操作が現れます。DX12では作成・recording・submission・completionまで時間軸も分離します。"
  },
  {
   "name": "*_DESC は Object ではなく作成レシピ",
   "short": "構造体とGPU Objectを区別する",
   "beginner": "D3D11_TEXTURE2D_DESC や D3D12_RESOURCE_DESC は Textureそのものではありません。幅・Format・用途などを書いた設定表で、その設定表を Create* API に渡して初めてResourceが作られます。",
   "why": "DirectXでは大量の設定を関数の引数へ直接並べず、DESC構造体へまとめて渡す設計が多いためです。関数名だけでなくDESCの各fieldを読む必要があります。",
   "advanced": "DX12のPSOは特にこの思想が強く、複数のDESCを巨大なPipeline descriptionへ集約してimmutable objectを作ります。Descriptionとruntime objectの寿命は独立です。"
  },
  {
   "name": "Fixed Function Pipeline と Programmable Shader",
   "short": "DX9にもShaderはあり、DX11/12にも固定機能Stageは残る",
   "beginner": "Direct3D 9 は Fixed Function Pipeline と Vertex / Pixel Shader の両方を利用できます。この教材のDX9では FVF、SetTransform、TextureStageState などの Fixed Function 経路を使います。DX11 / DX12 では座標変換やTexture Samplingを Shaderで記述します。",
   "why": "DX9のFixed Function経路を先に触ると、以前APIやDriver側に用意されていた処理の一部が、後の世代ではShaderや明示的なPipeline設定へ移ったことを比較しやすくなります。",
   "advanced": "『Programmable Pipeline = 全段階がShader』ではありません。DX11 / DX12にも Input Assembler、Rasterizer、Output Merger など固定機能Stageがあります。Programmableなのは主にVS/PS/GS/HS/DS/CS等のShader Stageで、固定機能Stageの挙動はState ObjectやPSOで設定します。"
  },
  {
   "name": "World / View / Projection",
   "short": "3D座標が画面座標になるまで",
   "beginner": "World は物体を世界へ配置し、View は世界をCamera視点へ変換し、Projection は遠近感を付けて画面へ投影します。今回Cameraは固定です。",
   "why": "DirectX API 自体より数学の話ですが、3D Geometry を同じ見た目で比較するため最低限必要です。",
   "advanced": "行列の掛け順、row/column-major、HLSL mul の順序は混乱しやすい箇所です。教材では C++ 側で world*view*projection を作り、HLSL へ渡す前に transpose する方針へ統一しています。"
  }
 ],
 "types": [
  {
   "name": "WNDCLASSEXW",
   "group": "win32",
   "summary": "WindowProc や Cursor、ClassName など、CreateWindowExW より前に OS へ登録する Window class の設定です.",
   "fields": [
    [
     "cbSize",
     "sizeof(WNDCLASSEXW)",
     "構造体のサイズ。Windows がどの版の構造体か判断するために必要です。"
    ],
    [
     "style",
     "CS_HREDRAW | CS_VREDRAW など",
     "Window class の再描画や入力に関する共通属性です。"
    ],
    [
     "lpfnWndProc",
     "WindowProc",
     "この class から作った Window が Message を受けたとき呼ばれる関数です。"
    ],
    [
     "hInstance",
     "wWinMain の HINSTANCE",
     "この実行モジュールを識別します。"
    ],
    [
     "hCursor",
     "LoadCursor(...)",
     "Window 上で表示する Cursor です。"
    ],
    [
     "lpszClassName",
     "一意な文字列",
     "RegisterClassExW と CreateWindowExW の className を一致させます。"
    ]
   ],
   "used": "RegisterClassExW の引数。",
   "deep": "RegisterClassExW はこの構造体をコピーして OS 側に登録します。ローカル変数で問題ありません。"
  },
  {
   "name": "IWICImagingFactory / IWICBitmapDecoder / IWICBitmapFrameDecode / IWICFormatConverter",
   "group": "wic",
   "summary": "WIC で画像ファイルを開き、Frame を取り出し、GPU に渡しやすい 32bpp BGRA へ変換するための COM Interface 群です。",
   "fields": [
    [
     "IWICImagingFactory",
     "入口",
     "Decoder や FormatConverter を作ります。"
    ],
    [
     "IWICBitmapDecoder",
     "画像ファイル",
     "PNG などのファイルを decode し、Frame を取得します。"
    ],
    [
     "IWICBitmapFrameDecode",
     "1枚の画像",
     "Decoder が持つ特定 Frame の pixel source です。"
    ],
    [
     "IWICFormatConverter",
     "pixel format 変換",
     "Frame を 32bpp BGRA に揃え、GetSize / CopyPixels で CPU memory へ取り出せる形にします。"
    ]
   ],
   "used": "LoadPngWithWIC。",
   "deep": "4つは同じ Object ではありません。Factory が作成を担当し、Decoder → Frame → Converter の順に画像データを絞り込みます。"
  },
  {
   "name": "ID3DBlob",
   "group": "dxcommon",
   "summary": "Shader compiler や RootSignature serializer が返す可変長 byte 配列を保持する COM Interface です。",
   "fields": [
    [
     "GetBufferPointer",
     "先頭 address",
     "compiled bytecode や serialized data の先頭を返します。"
    ],
    [
     "GetBufferSize",
     "byte 数",
     "その Blob に入っている有効 byte 数を返します。"
    ]
   ],
   "used": "D3DCompileFromFile / D3D12SerializeRootSignature の出力。",
   "deep": "DX11 では Shader Object / InputLayout 作成へ、DX12 では PSO / RootSignature 作成へ bytecode を渡します。"
  },
  {
   "name": "D3D_FEATURE_LEVEL",
   "group": "dxcommon",
   "summary": "Device が保証する Direct3D 機能レベルを表す enum です。",
   "fields": [
    [
     "D3D_FEATURE_LEVEL_11_0",
     "教材の要求値",
     "DX11 Device と DX12 Device の作成時に、最低限必要な GPU 機能として指定します。"
    ]
   ],
   "used": "D3D11CreateDeviceAndSwapChain / D3D12CreateDevice。",
   "deep": "API の世代番号と Feature Level は別概念です。DX12 API でも minimum feature level として 11_0 を指定できます。"
  },
  {
   "name": "D3DPRESENT_PARAMETERS",
   "group": "dx9",
   "summary": "DX9 で画面表示用の BackBuffer、Window 表示、DepthStencil、垂直同期などを Device 作成時にまとめて指定します。",
   "fields": [
    [
     "BackBufferWidth / Height",
     "1280 / 720",
     "BackBuffer の幅と高さです。ここでは Window の描画領域と同じ 1280 × 720 にします。"
    ],
    [
     "BackBufferFormat",
     "D3DFMT_UNKNOWN",
     "Window 表示では、Desktop の表示形式と互換の形式を自動選択させます。"
    ],
    [
     "BackBufferCount",
     "0 または 1",
     "追加 BackBuffer 数。教材では既定動作に任せます。"
    ],
    [
     "SwapEffect",
     "D3DSWAPEFFECT_DISCARD",
     "画面へ表示した後の BackBuffer 内容を保持せず、次の frame で描き直す方式です。"
    ],
    [
     "hDeviceWindow",
     "HWND",
     "Device が Present する Window。focusWindow と同じなら省略可能な場合があります。"
    ],
    [
     "Windowed",
     "TRUE",
     "画面全体を占有せず、通常の Window 内へ表示します。"
    ],
    [
     "EnableAutoDepthStencil",
     "TRUE",
     "Device に DepthStencil Surface を自動生成させます。"
    ],
    [
     "AutoDepthStencilFormat",
     "D3DFMT_D24S8",
     "Depth に 24bit、Stencil に 8bit を使う形式です。"
    ],
    [
     "PresentationInterval",
     "D3DPRESENT_INTERVAL_ONE",
     "画面更新1回ごとに Present します。垂直同期に合わせる設定です。"
    ]
   ],
   "used": "IDirect3D9::CreateDevice。",
   "deep": "DX9 は Present 設定と Device 初期化が強く結び付いています。DX11/12 では SwapChain description へ分離されます。"
  },
  {
   "name": "D3DLOCKED_RECT",
   "group": "dx9",
   "summary": "LockRect で返る Texture memory の先頭 pointer と1行の byte 幅です。",
   "fields": [
    [
     "Pitch",
     "runtime が返す値",
     "次の行へ進む byte 数。width×bytesPerPixel と一致する保証はありません。"
    ],
    [
     "pBits",
     "runtime が返す pointer",
     "Lock した領域の先頭 address。UnlockRect 後は使いません。"
    ]
   ],
   "used": "IDirect3DTexture9::LockRect。",
   "deep": "画像転送で Pitch を無視して1回 memcpy すると、環境によって行が崩れる原因になります。"
  },
  {
   "name": "D3DMATRIX",
   "group": "dx9",
   "summary": "Direct3D 9 の固定機能 Transform API が受け取る 4x4 行列型です。",
   "fields": [
    [
     "m[4][4]",
     "16個の float",
     "World / View / Projection 変換を表します。教材では DirectXMath の XMMATRIX と同じ 4x4 の値を SetTransform へ渡します。"
    ]
   ],
   "used": "IDirect3DDevice9::SetTransform。",
   "deep": "DX11 / DX12 では同じ変換を ConstantBuffer 経由で VertexShader へ渡します。"
  },
  {
   "name": "DXGI_SWAP_CHAIN_DESC",
   "group": "dx11",
   "summary": "DX11 の SwapChain と BackBuffer の設定です。",
   "fields": [
    [
     "BufferDesc.Width / Height",
     "1280 / 720",
     "BackBuffer の pixel size。"
    ],
    [
     "BufferDesc.Format",
     "DXGI_FORMAT_R8G8B8A8_UNORM",
     "BackBuffer の色 format。"
    ],
    [
     "SampleDesc.Count",
     "1",
     "MSAA sample 数。1 は非MSAA。"
    ],
    [
     "BufferUsage",
     "DXGI_USAGE_RENDER_TARGET_OUTPUT",
     "BackBuffer を RenderTarget として使うことを示します。"
    ],
    [
     "BufferCount",
     "2",
     "BackBuffer 数。"
    ],
    [
     "OutputWindow",
     "HWND",
     "表示先 Window。"
    ],
    [
     "Windowed",
     "TRUE",
     "Windowed mode。"
    ],
    [
     "SwapEffect",
     "DXGI_SWAP_EFFECT_FLIP_DISCARD",
     "表示方式。FLIP_DISCARD は現在推奨される flip model で、DX12 でも同じ方式を使います。"
    ]
   ],
   "used": "D3D11CreateDeviceAndSwapChain。",
   "deep": "SwapChain の format はそこから取得する BackBuffer RTV の format と整合している必要があります。"
  },
  {
   "name": "ID3D11Texture2D / ID3D11ShaderResourceView",
   "group": "dx11",
   "summary": "Texture2D は画像を保持する Resource、ShaderResourceView はその Resource を Shader から読むための View です。",
   "fields": [
    [
     "ID3D11Texture2D",
     "Resource",
     "BackBuffer、Depth、Icon、Offscreen SceneTexture の実データを保持します。"
    ],
    [
     "ID3D11ShaderResourceView",
     "View",
     "Texture2D を PixelShader の t slot から読む見え方を表します。"
    ]
   ],
   "used": "CreateTexture2D / CreateShaderResourceView。",
   "deep": "Offscreen Texture は1つの ID3D11Texture2D に RTV と SRV の両方を作り、pass ごとに用途を切り替えます。"
  },
  {
   "name": "D3D11_BUFFER_DESC",
   "group": "dx11",
   "summary": "Vertex / Index / Constant Buffer の用途とサイズを定義します。",
   "fields": [
    [
     "ByteWidth",
     "必要 byte 数",
     "VB/IB は要素数×sizeof。D3D11_BIND_CONSTANT_BUFFER を指定する Buffer は 16 byte の倍数にします。今回の SceneConstants は float4x4 1個で64 byteです。"
    ],
    [
     "Usage",
     "IMMUTABLE / DEFAULT など",
     "CPU/GPU からの更新方法を決めます。"
    ],
    [
     "BindFlags",
     "VERTEX_BUFFER / INDEX_BUFFER / CONSTANT_BUFFER",
     "Pipeline のどの用途へ bind できるか指定します。"
    ],
    [
     "CPUAccessFlags",
     "通常 0",
     "CPU read/write を許可する場合に設定します。Usage と組合せ制約があります。"
    ],
    [
     "MiscFlags",
     "通常 0",
     "Raw/Structured/Shared 等の追加用途。"
    ],
    [
     "StructureByteStride",
     "通常 0",
     "Structured Buffer の1要素 size。今回未使用。"
    ]
   ],
   "used": "ID3D11Device::CreateBuffer。",
   "deep": "Usage・CPUAccessFlags・BindFlags は独立ではなく、許可される組合せがあります。静的VB/IBをIMMUTABLEにすると後から更新できません。"
  },
  {
   "name": "D3D11_SUBRESOURCE_DATA",
   "group": "dx11",
   "summary": "CreateBuffer / CreateTexture2D へ渡す初期データの pointer と pitch 情報です。",
   "fields": [
    [
     "pSysMem",
     "CPU data pointer",
     "初期化元データ。API 呼び出し中に読み取られます。"
    ],
    [
     "SysMemPitch",
     "1行の byte 数",
     "2D Texture で重要。Buffer では通常 0。"
    ],
    [
     "SysMemSlicePitch",
     "1slice の byte 数",
     "3D Texture 等で使用。今回 0。"
    ]
   ],
   "used": "CreateBuffer / CreateTexture2D の initialData。",
   "deep": "DX11 の DEFAULT/IMMUTABLE resource は initial data を API が内部転送するため、DX12 の UploadHeap より短く書けます。"
  },
  {
   "name": "D3D11_TEXTURE2D_DESC",
   "group": "dx11",
   "summary": "Texture2D の形状、format、用途、bind 可能な Pipeline stage を定義します。",
   "fields": [
    [
     "Width / Height",
     "pixel size",
     "Texture の横・縦 pixel 数。"
    ],
    [
     "MipLevels",
     "1",
     "Mip level 数。0 は full mip chain を要求する特殊ケース。教材は1。"
    ],
    [
     "ArraySize",
     "1",
     "Texture array の slice 数。"
    ],
    [
     "Format",
     "DXGI_FORMAT_*",
     "各 pixel のメモリ解釈。WIC BGRA には B8G8R8A8_UNORM を使用。"
    ],
    [
     "SampleDesc",
     "Count=1",
     "MSAA 設定。"
    ],
    [
     "Usage",
     "IMMUTABLE / DEFAULT",
     "PNG は IMMUTABLE、RenderTarget/Depth は DEFAULT。"
    ],
    [
     "BindFlags",
     "SHADER_RESOURCE / RENDER_TARGET / DEPTH_STENCIL",
     "同じ Resource に複数用途を持たせる場合 OR します。"
    ],
    [
     "CPUAccessFlags",
     "0",
     "今回 CPU は作成後 Resource を直接 map しません。"
    ],
    [
     "MiscFlags",
     "0",
     "追加機能 flag。"
    ]
   ],
   "used": "ID3D11Device::CreateTexture2D。",
   "deep": "Offscreen Texture は RENDER_TARGET と SHADER_RESOURCE の両 BindFlags を持つため、同じ Resource に RTV と SRV を作れます。"
  },
  {
   "name": "D3D11_INPUT_ELEMENT_DESC",
   "group": "dx11",
   "summary": "Vertex struct の各フィールドと VertexShader input semantic の対応を定義します。",
   "fields": [
    [
     "SemanticName / SemanticIndex",
     "POSITION/0 など",
     "HLSL の POSITION、COLOR0、TEXCOORD0 と一致させます。"
    ],
    [
     "Format",
     "R32G32B32_FLOAT 等",
     "1要素を何byte・何componentとして読むか。"
    ],
    [
     "InputSlot",
     "0",
     "どの VertexBuffer slot から読むか。"
    ],
    [
     "AlignedByteOffset",
     "offsetof(Vertex, field)",
     "Vertex 内の field byte offset。"
    ],
    [
     "InputSlotClass",
     "PER_VERTEX_DATA",
     "頂点単位かInstance単位か。"
    ],
    [
     "InstanceDataStepRate",
     "0",
     "Per-vertex では 0。"
    ]
   ],
   "used": "ID3D11Device::CreateInputLayout。",
   "deep": "C++ struct と HLSL input の両方に整合しないと、コンパイルが通っても頂点属性が壊れます。"
  },
  {
   "name": "D3D11_SAMPLER_DESC",
   "group": "dx11",
   "summary": "Texture sample 時の filter・addressing・LOD を定義します。",
   "fields": [
    [
     "Filter",
     "MIN_MAG_MIP_LINEAR",
     "縮小・拡大・Mip の補間方法。"
    ],
    [
     "AddressU/V/W",
     "WRAP",
     "UV が0..1を超えたときの扱い。"
    ],
    [
     "MipLODBias",
     "0",
     "選択Mipへ加える bias。"
    ],
    [
     "MaxAnisotropy",
     "1",
     "Anisotropic filter 時の最大異方性。"
    ],
    [
     "ComparisonFunc",
     "ALWAYS 等",
     "Comparison sampler 用。今回通常 sample。"
    ],
    [
     "MinLOD / MaxLOD",
     "0 / FLOAT32_MAX",
     "利用可能なMip範囲。"
    ]
   ],
   "used": "ID3D11Device::CreateSamplerState。",
   "deep": "Texture Resource と Sampler は別物です。同じ Texture を異なる filter/address mode で読むこともできます。"
  },
  {
   "name": "D3D11_DEPTH_STENCIL_DESC",
   "group": "dx11",
   "summary": "Depth test / write と Stencil の挙動を定義します。",
   "fields": [
    [
     "DepthEnable",
     "TRUE/FALSE",
     "Depth test を行うか。"
    ],
    [
     "DepthWriteMask",
     "ALL/ZERO",
     "Depth test 通過時に Depth Buffer を更新するか。"
    ],
    [
     "DepthFunc",
     "LESS",
     "既存depthとの比較条件。"
    ],
    [
     "StencilEnable",
     "FALSE",
     "Stencil test の有効化。教材では未使用。"
    ]
   ],
   "used": "ID3D11Device::CreateDepthStencilState。",
   "deep": "透明描画では Depth test はしたいが Depth write は止めたい、という別Stateが必要になることがあります。"
  },
  {
   "name": "D3D11_BLEND_DESC",
   "group": "dx11",
   "summary": "RenderTarget へ新しいPixelをどう合成するか定義します。",
   "fields": [
    [
     "AlphaToCoverageEnable",
     "FALSE",
     "MSAA coverage に alpha を利用する機能。"
    ],
    [
     "IndependentBlendEnable",
     "FALSE",
     "MRTごとに別 Blend State を使うか。"
    ],
    [
     "RenderTarget[i].BlendEnable",
     "TRUE/FALSE",
     "対象RTV slotでBlendを行うか。"
    ],
    [
     "SrcBlend / DestBlend",
     "SRC_ALPHA / INV_SRC_ALPHA",
     "src と dst に掛ける係数。"
    ],
    [
     "BlendOp",
     "ADD",
     "係数適用後の合成演算。"
    ],
    [
     "SrcBlendAlpha / DestBlendAlpha",
     "ONE / ZERO",
     "Alpha channel側に掛ける係数。Color channelとは別に設定します。"
    ],
    [
     "BlendOpAlpha",
     "ADD",
     "Alpha channel側の合成演算。"
    ],
    [
     "RenderTargetWriteMask",
     "COLOR_WRITE_ENABLE_ALL",
     "RGBAのどのchannelを書き込むか。"
    ]
   ],
   "used": "ID3D11Device::CreateBlendState。",
   "deep": "一般的な非premultiplied alpha は SrcAlpha / InvSrcAlpha。premultiplied alpha では別設定になります。"
  },
  {
   "name": "DXGI_SWAP_CHAIN_DESC1",
   "group": "dx12",
   "summary": "DX12 で使用する flip model SwapChain の設定です。",
   "fields": [
    [
     "Width / Height",
     "1280 / 720",
     "BackBuffer size。"
    ],
    [
     "Format",
     "R8G8B8A8_UNORM",
     "BackBuffer format。PSO RTVFormats と一致させます。"
    ],
    [
     "SampleDesc.Count",
     "1",
     "Flip model では直接MSAA BackBufferにしない設計が一般的です。"
    ],
    [
     "BufferUsage",
     "RENDER_TARGET_OUTPUT",
     "BackBuffer用途。"
    ],
    [
     "BufferCount",
     "2",
     "FlipするBuffer数。"
    ],
    [
     "SwapEffect",
     "FLIP_DISCARD",
     "DX12で一般的な flip model。"
    ]
   ],
   "used": "IDXGIFactory2::CreateSwapChainForHwnd。",
   "deep": "PSO の RTV format と SwapChain BackBuffer format が合わないと描画時検証エラーになります。"
  },
  {
   "name": "ID3D12Debug / IDXGISwapChain1 / ID3D12Resource / ID3D12CommandList / ID3D12DescriptorHeap",
   "group": "dx12",
   "summary": "DX12 の初期化・Resource・Command・Descriptor でコード中に現れる主要 Interface です。",
   "fields": [
    [
     "ID3D12Debug",
     "Debug Layer",
     "Device 作成前に Debug Layer を有効化します。"
    ],
    [
     "IDXGISwapChain1",
     "SwapChain 作成直後の Interface",
     "CreateSwapChainForHwnd の出力を受け、教材では IDXGISwapChain3 へ Query します。"
    ],
    [
     "ID3D12Resource",
     "Buffer / Texture",
     "Vertex、Index、Constant、Depth、BackBuffer、Offscreen、Upload の実体を同じ Resource Interface で扱います。"
    ],
    [
     "ID3D12CommandList",
     "Queue へ渡す共通基底",
     "ExecuteCommandLists へ ID3D12GraphicsCommandList を配列として渡すときの型です。"
    ],
    [
     "ID3D12DescriptorHeap",
     "Descriptor の連続領域",
     "RTV / DSV / SRV の slot を保持し、CPU/GPU descriptor handle の起点を返します。"
    ]
   ],
   "used": "DX12 の Device / Queue / Descriptor / Render 初期化。",
   "deep": "DX12 では Resource 自体と、それをどう見るかを表す Descriptor を分離して管理します。"
  },
  {
   "name": "D3D12_GPU_VIRTUAL_ADDRESS",
   "group": "dx12",
   "summary": "GPU が Buffer 内の byte 位置を参照するための 64bit address 型です。",
   "fields": [
    [
     "value",
     "Resource::GetGPUVirtualAddress の戻り値",
     "Vertex/Index Buffer View や Root CBV の先頭 address として使います。"
    ]
   ],
   "used": "GetGPUVirtualAddress / SetGraphicsRootConstantBufferView。",
   "deep": "CPU pointer ではありません。CPU から dereference せず、GPU command の binding 情報として渡します。"
  },
  {
   "name": "D3D12_RESOURCE_STATES",
   "group": "dx12",
   "summary": "Resource を現在どの用途で使っているかを表す state flag です。",
   "fields": [
    [
     "COPY_DEST",
     "copy の書き込み先",
     "Upload から Default Resource へ転送するときの destination state です。"
    ],
    [
     "PIXEL_SHADER_RESOURCE",
     "PixelShader から読む",
     "Icon Texture や SceneTexture を SRV として sample するときに使います。"
    ],
    [
     "RENDER_TARGET",
     "Color 出力先",
     "SceneTexture や BackBuffer を RTV として描画するときに使います。"
    ],
    [
     "PRESENT",
     "画面表示待ち",
     "SwapChain BackBuffer を Present できる状態です。"
    ],
    [
     "DEPTH_WRITE",
     "Depth 出力先",
     "Depth Resource を DSV として書き込む状態です。"
    ]
   ],
   "used": "CreateCommittedResource / D3D12_RESOURCE_BARRIER。",
   "deep": "同じ Resource を別用途へ変える前に StateBefore / StateAfter を ResourceBarrier へ記録します。"
  },
  {
   "name": "D3D12_COMMAND_QUEUE_DESC",
   "group": "dx12",
   "summary": "GPUへ投入する CommandQueue の種類と優先度を定義します。",
   "fields": [
    [
     "Type",
     "DIRECT",
     "Graphics/Compute/Copy command を受ける Queue type。"
    ],
    [
     "Priority",
     "NORMAL",
     "Queue scheduling priority。"
    ],
    [
     "Flags",
     "NONE",
     "追加 flag。"
    ],
    [
     "NodeMask",
     "0",
     "Multi-adapter node 指定。single GPUでは0。"
    ]
   ],
   "used": "ID3D12Device::CreateCommandQueue。",
   "deep": "CommandAllocator / CommandList の Type は実行する Queue と互換である必要があります。"
  },
  {
   "name": "D3D12_DESCRIPTOR_HEAP_DESC",
   "group": "dx12",
   "summary": "Descriptor を並べる Heap の種類、個数、Shader可視性を定義します。",
   "fields": [
    [
     "Type",
     "RTV / DSV / CBV_SRV_UAV",
     "格納できる Descriptor の種類。異なるTypeを同じHeapへ混在できません。"
    ],
    [
     "NumDescriptors",
     "必要 slot 数",
     "BackBuffer数やTexture数を見積もって確保します。"
    ],
    [
     "Flags",
     "SHADER_VISIBLE / NONE",
     "ShaderからDescriptorTable経由で見るHeapだけSHADER_VISIBLE。RTV/DSVは不可。"
    ],
    [
     "NodeMask",
     "0",
     "Multi-adapter node。"
    ]
   ],
   "used": "ID3D12Device::CreateDescriptorHeap。",
   "deep": "Shader-visible CBV_SRV_UAV Heap は同時に CommandList へ設定できる数に制約があり、大規模Rendererではallocator設計が必要になります。"
  },
  {
   "name": "D3D12_HEAP_PROPERTIES",
   "group": "dx12",
   "summary": "Resource が置かれるメモリHeapの性質を指定します。",
   "fields": [
    [
     "Type",
     "DEFAULT / UPLOAD",
     "DEFAULTはGPU利用向け、UPLOADはCPU書込向け。"
    ],
    [
     "CPUPageProperty",
     "UNKNOWN",
     "Custom heap以外はTypeから決まるためUNKNOWN。"
    ],
    [
     "MemoryPoolPreference",
     "UNKNOWN",
     "同上。"
    ],
    [
     "CreationNodeMask / VisibleNodeMask",
     "1",
     "single-node GPU の node mask。"
    ]
   ],
   "used": "ID3D12Device::CreateCommittedResource。",
   "deep": "UPLOAD Heap Resource は GENERIC_READ state で作成し、そのstateから遷移させないのが基本です。"
  },
  {
   "name": "D3D12_RESOURCE_DESC",
   "group": "dx12",
   "summary": "Buffer / Texture Resource の寸法、format、layout、利用可能なflagを定義します。",
   "fields": [
    [
     "Dimension",
     "BUFFER / TEXTURE2D",
     "Resourceの種類。"
    ],
    [
     "Alignment",
     "0",
     "0でruntime既定alignment。"
    ],
    [
     "Width / Height",
     "byte数またはpixel数",
     "BufferはWidthがbyte size、Textureはpixel width/height。"
    ],
    [
     "DepthOrArraySize",
     "1",
     "2D Textureならarray slice数。"
    ],
    [
     "MipLevels",
     "1",
     "Mip level数。"
    ],
    [
     "Format",
     "UNKNOWN / DXGI_FORMAT_*",
     "Bufferは通常UNKNOWN、Textureはpixel format。"
    ],
    [
     "SampleDesc",
     "Count=1",
     "MSAA設定。"
    ],
    [
     "Layout",
     "ROW_MAJOR / UNKNOWN",
     "BufferはROW_MAJOR、Textureは通常UNKNOWN。"
    ],
    [
     "Flags",
     "ALLOW_RENDER_TARGET / ALLOW_DEPTH_STENCIL 等",
     "Resourceを特別な出力用途に使う場合に必要。"
    ]
   ],
   "used": "ID3D12Device::CreateCommittedResource。",
   "deep": "Resource state と Resource flags は別概念です。Flags は『このResourceが許可する用途』、State は『今どの用途として使っているか』を示します。"
  },
  {
   "name": "D3D12_CLEAR_VALUE",
   "group": "dx12",
   "summary": "RenderTarget / Depth Resource の optimized clear 値です。",
   "fields": [
    [
     "Format",
     "ResourceのRTV/DSV format",
     "ClearValueとResource/View formatを整合させます。"
    ],
    [
     "Color[4]",
     "RGBA",
     "RenderTarget用。"
    ],
    [
     "DepthStencil.Depth / Stencil",
     "1.0 / 0",
     "DepthStencil用。"
    ]
   ],
   "used": "CreateCommittedResource の clearValue。",
   "deep": "これは『作成時に自動Clearする値』ではなく、DriverがClearを最適化するための値です。実際のClear命令は別途必要です。"
  },
  {
   "name": "D3D12_RESOURCE_BARRIER",
   "group": "dx12",
   "summary": "Resource usage の順序と状態遷移をGPUへ伝える記述です。",
   "fields": [
    [
     "Type",
     "TRANSITION",
     "今回使うBarrier種別。"
    ],
    [
     "Flags",
     "NONE",
     "Split barrierを使わない通常遷移。"
    ],
    [
     "Transition.pResource",
     "対象Resource",
     "状態を変えるResource。"
    ],
    [
     "Transition.Subresource",
     "ALL_SUBRESOURCES",
     "全Mip/Array sliceをまとめて遷移。"
    ],
    [
     "Transition.StateBefore",
     "現在state",
     "GPU/DebugLayerが想定する現在用途。"
    ],
    [
     "Transition.StateAfter",
     "次のstate",
     "次に使う用途。"
    ]
   ],
   "used": "ID3D12GraphicsCommandList::ResourceBarrier。",
   "deep": "Barrierは単なるenum更新ではなく、必要に応じてcache flushやorderingを伴います。正しいstate trackingはRendererの重要責務です。"
  },
  {
   "name": "D3D12_DESCRIPTOR_RANGE / D3D12_ROOT_PARAMETER",
   "group": "dx12",
   "summary": "RootSignature で Shader register と DescriptorTable / Root Descriptor の対応を定義します。",
   "fields": [
    [
     "RangeType",
     "SRV/CBV/UAV/SAMPLER",
     "Descriptor table内のresource種類。"
    ],
    [
     "NumDescriptors",
     "1",
     "Rangeに含むdescriptor数。"
    ],
    [
     "BaseShaderRegister",
     "0",
     "HLSL register(t0)なら0。"
    ],
    [
     "RegisterSpace",
     "0",
     "HLSL register space。"
    ],
    [
     "ParameterType",
     "CBV / DESCRIPTOR_TABLE",
     "Root slotが何を直接保持するか。"
    ],
    [
     "ShaderVisibility",
     "ALL / VERTEX / PIXEL",
     "どのShader stageから見えるか。"
    ]
   ],
   "used": "D3D12_ROOT_SIGNATURE_DESC。",
   "deep": "Root Parameter index と HLSL register番号は別物です。SetGraphicsRootDescriptorTable の第1引数はRootParameter indexです。"
  },
  {
   "name": "D3D12_ROOT_SIGNATURE_DESC",
   "group": "dx12",
   "summary": "RootParameter と StaticSampler を束ね、Shaderとのresource binding契約を定義します。",
   "fields": [
    [
     "NumParameters / pParameters",
     "parameter配列",
     "CBVやDescriptorTableのroot slot一覧。"
    ],
    [
     "NumStaticSamplers / pStaticSamplers",
     "sampler配列",
     "RootSignature内に固定samplerを埋め込めます。"
    ],
    [
     "Flags",
     "ALLOW_INPUT_ASSEMBLER_INPUT_LAYOUT",
     "必要なPipeline機能を許可/拒否します。"
    ]
   ],
   "used": "D3D12SerializeRootSignature。",
   "deep": "RootSignatureは単なるbind一覧ではなく、変更コストやroot sizeにも影響するため、実エンジンではlayout設計が重要です。"
  },
  {
   "name": "D3D12_GRAPHICS_PIPELINE_STATE_DESC",
   "group": "dx12",
   "summary": "Graphics Draw に必要なShader・固定機能State・出力formatをまとめたPSO descriptionです。",
   "fields": [
    [
     "pRootSignature",
     "RootSignature",
     "Shader binding layout。"
    ],
    [
     "VS / PS",
     "Shader bytecode",
     "Compiled shaderのpointer/size。"
    ],
    [
     "BlendState",
     "D3D12_BLEND_DESC",
     "RTVへの合成。"
    ],
    [
     "SampleMask",
     "UINT_MAX",
     "sample書込mask。"
    ],
    [
     "RasterizerState",
     "D3D12_RASTERIZER_DESC",
     "Cull/Fill/DepthClip等。"
    ],
    [
     "DepthStencilState",
     "D3D12_DEPTH_STENCIL_DESC",
     "Depth/Stencil test/write。"
    ],
    [
     "InputLayout",
     "element配列",
     "Vertex memory layout。"
    ],
    [
     "PrimitiveTopologyType",
     "TRIANGLE",
     "許可するtopology大分類。"
    ],
    [
     "NumRenderTargets / RTVFormats",
     "1 / R8G8B8A8_UNORM",
     "接続するRTV数とformat。"
    ],
    [
     "DSVFormat",
     "D24_UNORM_S8_UINT",
     "Depth format。Present PSOではUNKNOWNにできます。"
    ],
    [
     "SampleDesc",
     "Count=1",
     "MSAA sample設定。"
    ]
   ],
   "used": "ID3D12Device::CreateGraphicsPipelineState。",
   "deep": "DX12ではBlendだけ変えたい場合でもPSO差分になります。実運用ではPSO cacheと組合せ爆発の管理が重要です。"
  },
  {
   "name": "D3D12_VERTEX_BUFFER_VIEW / D3D12_INDEX_BUFFER_VIEW",
   "group": "dx12",
   "summary": "Buffer Resource のどのGPU address範囲をIAがVertex/Indexとして読むか示すView structです。",
   "fields": [
    [
     "BufferLocation",
     "GPU virtual address",
     "Resource::GetGPUVirtualAddress から取得。"
    ],
    [
     "SizeInBytes",
     "有効byte範囲",
     "Buffer全体またはsubset。"
    ],
    [
     "StrideInBytes",
     "sizeof(Vertex)",
     "VBVのみ。1vertexのbyte幅。"
    ],
    [
     "Format",
     "R16_UINT",
     "IBVのみ。1indexの型。"
    ]
   ],
   "used": "IASetVertexBuffers / IASetIndexBuffer。",
   "deep": "DX11のBuffer COM pointer bindと違い、DX12ではGPU virtual addressを含む軽量structをCommandListへ渡します。"
  },
  {
   "name": "D3D12_TEXTURE_COPY_LOCATION / D3D12_PLACED_SUBRESOURCE_FOOTPRINT",
   "group": "dx12",
   "summary": "CopyTextureRegion でTextureとUploadBuffer上の配置を表します。",
   "fields": [
    [
     "pResource",
     "TextureまたはUpload Buffer",
     "Copy元/先Resource。"
    ],
    [
     "Type",
     "SUBRESOURCE_INDEX / PLACED_FOOTPRINT",
     "Texture側はsubresource index、Buffer側はfootprint。"
    ],
    [
     "SubresourceIndex",
     "0",
     "TextureのMip/Array subresource。"
    ],
    [
     "PlacedFootprint.Offset",
     "aligned offset",
     "UploadBuffer内開始位置。"
    ],
    [
     "PlacedFootprint.Footprint.RowPitch",
     "256-byte alignmentを満たす値",
     "各行のbuffer上のbyte間隔。"
    ],
    [
     "PlacedFootprint.Footprint.Format/Width/Height",
     "copy対象画像情報",
     "GetCopyableFootprintsが計算します。"
    ]
   ],
   "used": "GetCopyableFootprints / CopyTextureRegion。",
   "deep": "source画像の実row bytesとUploadBufferのRowPitchは別です。各行をRowPitch間隔へコピーします。"
  },
  {
   "name": "D3D12_VIEWPORT / D3D12_RECT",
   "group": "dx12",
   "summary": "NDCからRenderTargetへ写すViewportと、pixel書込を許可するScissor範囲です。",
   "fields": [
    [
     "TopLeftX / TopLeftY",
     "0 / 0",
     "Viewport左上。"
    ],
    [
     "Width / Height",
     "1280 / 720",
     "Viewport size。"
    ],
    [
     "MinDepth / MaxDepth",
     "0 / 1",
     "Depth範囲。"
    ],
    [
     "RECT left/top/right/bottom",
     "0,0,1280,720",
     "Scissor内だけRasterize結果を書き込みます。"
    ]
   ],
   "used": "RSSetViewports / RSSetScissorRects。",
   "deep": "Viewportは座標変換、Scissorは切り抜きです。似ていますが役割が違います。"
  },
  {
   "name": "D3D12_CPU_DESCRIPTOR_HANDLE / D3D12_GPU_DESCRIPTOR_HANDLE",
   "group": "dx12",
   "summary": "DescriptorHeap 内の1 slot を指す軽量 handle です。CPU handle は Descriptor の作成や OM bind、GPU handle は Shader の DescriptorTable bind に使います。",
   "fields": [
    [
     "ptr",
     "Heap先頭 + slotIndex * incrementSize",
     "DescriptorHeap 内の byte 位置です。GetDescriptorHandleIncrementSize が返す値で隣の slot へ進めます。"
    ]
   ],
   "used": "DescriptorHeap の GetCPUDescriptorHandleForHeapStart / GetGPUDescriptorHandleForHeapStart。",
   "deep": "CPU handle と GPU handle は用途が違います。同じ Heap の同じ slot を指していても、CreateShaderResourceView には CPU handle、SetGraphicsRootDescriptorTable には GPU handle を渡します。"
  },
  {
   "name": "D3D11_RASTERIZER_DESC",
   "group": "dx11",
   "summary": "三角形をpixel候補へ変換するときのCull・Fill・DepthClipなどを定義します。",
   "fields": [
    [
     "FillMode",
     "D3D11_FILL_SOLID",
     "面を塗りつぶすかWireframeにするか。"
    ],
    [
     "CullMode",
     "D3D11_CULL_NONE",
     "Front/Back faceを除外するか。教材は頂点順序を主題にしないためNONE。"
    ],
    [
     "FrontCounterClockwise",
     "FALSE",
     "どちらのwindingをFrontと判定するか。"
    ],
    [
     "DepthBias / SlopeScaledDepthBias",
     "0",
     "Depth値へbiasを加える設定。ShadowMap等で利用されます。"
    ],
    [
     "DepthClipEnable",
     "TRUE",
     "Near/Far plane外のprimitiveをclipします。"
    ],
    [
     "ScissorEnable",
     "FALSE",
     "Scissor testを有効にするか。"
    ],
    [
     "MultisampleEnable / AntialiasedLineEnable",
     "FALSE",
     "MSAA/line rasterization関連。"
    ]
   ],
   "used": "ID3D11Device::CreateRasterizerState。",
   "deep": "RasterizerStateはGeometryそのものではなく『三角形をどうpixel化するか』の規則です。DX12では同等設定がPSOへ入ります。"
  },
  {
   "name": "D3D11_VIEWPORT",
   "group": "dx11",
   "summary": "VertexShader出力のNDC座標をRenderTarget上のpixel座標へ写す矩形です。",
   "fields": [
    [
     "TopLeftX / TopLeftY",
     "0 / 0",
     "描画領域の左上pixel位置。"
    ],
    [
     "Width / Height",
     "1280 / 720",
     "NDCを写すpixel領域の幅と高さ。"
    ],
    [
     "MinDepth / MaxDepth",
     "0 / 1",
     "Viewport変換後のDepth範囲。通常0..1。"
    ]
   ],
   "used": "ID3D11DeviceContext::RSSetViewports。",
   "deep": "RenderTargetが1280x720でもViewportが小さければ、その範囲にしか描画されません。Resource sizeとViewport sizeは別設定です。"
  },
  {
   "name": "D3D12_RASTERIZER_DESC",
   "group": "dx12",
   "summary": "PSOに含めるRasterizer固定機能Stateです。",
   "fields": [
    [
     "FillMode",
     "D3D12_FILL_MODE_SOLID",
     "Solid / Wireframe。"
    ],
    [
     "CullMode",
     "D3D12_CULL_MODE_NONE",
     "除外するface。"
    ],
    [
     "FrontCounterClockwise",
     "FALSE",
     "Front faceのwinding規則。"
    ],
    [
     "DepthBias / DepthBiasClamp / SlopeScaledDepthBias",
     "既定値",
     "Rasterized depthへ加えるbias。"
    ],
    [
     "DepthClipEnable",
     "TRUE",
     "clip volume外をclip。"
    ],
    [
     "MultisampleEnable",
     "FALSE",
     "MSAA line rasterization等に関係。"
    ],
    [
     "ConservativeRaster",
     "OFF",
     "Conservative Rasterizationの有効化。"
    ]
   ],
   "used": "D3D12_GRAPHICS_PIPELINE_STATE_DESC::RasterizerState。",
   "deep": "DX12ではRasterizerState単独COM ObjectをbindせずPSOの一部として固定します。BlendだけでなくRasterizer差分もPSO variationになります。"
  },
  {
   "name": "D3D12_BLEND_DESC / D3D12_RENDER_TARGET_BLEND_DESC",
   "group": "dx12",
   "summary": "PSOに含めるColor Blend規則です。RTV slotごとにSrc/Dest係数と演算を指定します。",
   "fields": [
    [
     "AlphaToCoverageEnable",
     "FALSE",
     "AlphaをMSAA coverageへ変換する機能。"
    ],
    [
     "IndependentBlendEnable",
     "FALSE",
     "複数RTVに別Blend設定を持たせるか。"
    ],
    [
     "RenderTarget[i].BlendEnable",
     "TRUE/FALSE",
     "そのRTV slotでBlendするか。"
    ],
    [
     "SrcBlend / DestBlend",
     "SRC_ALPHA / INV_SRC_ALPHA",
     "source/destination colorへ掛ける係数。"
    ],
    [
     "BlendOp",
     "ADD",
     "係数適用後の演算。"
    ],
    [
     "SrcBlendAlpha / DestBlendAlpha / BlendOpAlpha",
     "ONE / ZERO / ADD等",
     "Alpha channel専用の演算。"
    ],
    [
     "RenderTargetWriteMask",
     "COLOR_WRITE_ENABLE_ALL",
     "RGBAの書込許可mask。"
    ]
   ],
   "used": "D3D12_GRAPHICS_PIPELINE_STATE_DESC::BlendState。",
   "deep": "DX11のBlendState Objectに相当する情報がDX12ではPSOへ含まれます。透明用PSOを別に作る理由がここです。"
  },
  {
   "name": "D3D12_DEPTH_STENCIL_DESC",
   "group": "dx12",
   "summary": "PSOに含めるDepth / Stencil testとwrite規則です。",
   "fields": [
    [
     "DepthEnable",
     "TRUE/FALSE",
     "Depth testを行うか。"
    ],
    [
     "DepthWriteMask",
     "ALL / ZERO",
     "test通過時にDepthを更新するか。"
    ],
    [
     "DepthFunc",
     "LESS",
     "既存Depthとの比較演算。"
    ],
    [
     "StencilEnable",
     "FALSE",
     "Stencil testを使うか。"
    ],
    [
     "StencilReadMask / StencilWriteMask",
     "既定値",
     "Stencil bitの読書きmask。"
    ],
    [
     "FrontFace / BackFace",
     "KEEP / ALWAYS等",
     "Stencil fail/pass時の面ごとの演算。"
    ]
   ],
   "used": "D3D12_GRAPHICS_PIPELINE_STATE_DESC::DepthStencilState。",
   "deep": "Depth Resource/DSVは保存先、DepthStencilStateは比較規則です。Present PassではDepthを使わないPSOへ切り替えます。"
  },
  {
   "name": "D3D12_INPUT_ELEMENT_DESC",
   "group": "dx12",
   "summary": "Vertex Buffer内の各属性とVertexShader input semanticを対応付ける記述です。",
   "fields": [
    [
     "SemanticName / SemanticIndex",
     "POSITION/0等",
     "HLSL input semanticとの対応。"
    ],
    [
     "Format",
     "R32G32B32_FLOAT等",
     "memory上のcomponent数と型。"
    ],
    [
     "InputSlot",
     "0",
     "どのVertexBuffer slotから読むか。"
    ],
    [
     "AlignedByteOffset",
     "offsetof(Vertex, field)",
     "Vertex1要素内のbyte offset。"
    ],
    [
     "InputSlotClass",
     "PER_VERTEX_DATA",
     "vertex単位かinstance単位か。"
    ],
    [
     "InstanceDataStepRate",
     "0",
     "Per-vertex inputでは0。"
    ]
   ],
   "used": "D3D12_GRAPHICS_PIPELINE_STATE_DESC::InputLayout。",
   "deep": "DX11ではInputLayout COM Objectを作りますが、DX12ではInputLayout descriptionそのものがPSO作成時に取り込まれます。"
  },
  {
   "name": "D3D12_SHADER_RESOURCE_VIEW_DESC",
   "group": "dx12",
   "summary": "ResourceをShaderからどのformat・dimension・mip範囲で読むかDescriptorへ書く設定です。",
   "fields": [
    [
     "Shader4ComponentMapping",
     "D3D12_DEFAULT_SHADER_4_COMPONENT_MAPPING",
     "Resource componentをShaderのRGBAへどう対応させるか。通常既定mapping。"
    ],
    [
     "Format",
     "DXGI_FORMAT_B8G8R8A8_UNORM等",
     "Shaderから読むpixel解釈。Resourceと互換である必要があります。"
    ],
    [
     "ViewDimension",
     "D3D12_SRV_DIMENSION_TEXTURE2D",
     "Texture2D/Array/Buffer等、Shaderからの見え方。"
    ],
    [
     "Texture2D.MostDetailedMip",
     "0",
     "最初に見えるMip。"
    ],
    [
     "Texture2D.MipLevels",
     "1",
     "見えるMip数。"
    ],
    [
     "Texture2D.ResourceMinLODClamp",
     "0",
     "SRVから参照できる最小LOD clamp。"
    ]
   ],
   "used": "ID3D12Device::CreateShaderResourceView。",
   "deep": "DX12のSRVはCOM ObjectではなくDescriptor slotへ書き込まれるデータです。同じResourceに異なるMip範囲のSRVを複数作ることもできます。"
  },
  {
   "name": "D3D12_STATIC_SAMPLER_DESC",
   "group": "dx12",
   "summary": "Sampler設定をDescriptorHeapではなくRootSignature内へ固定して埋め込む記述です。",
   "fields": [
    [
     "Filter",
     "MIN_MAG_MIP_LINEAR",
     "Texture filter方式。"
    ],
    [
     "AddressU / AddressV / AddressW",
     "WRAP",
     "UV範囲外のaddressing。"
    ],
    [
     "MipLODBias",
     "0",
     "Mip選択bias。"
    ],
    [
     "MaxAnisotropy",
     "1",
     "Anisotropic時の最大値。"
    ],
    [
     "ComparisonFunc",
     "ALWAYS",
     "Comparison sampler時の比較。"
    ],
    [
     "MinLOD / MaxLOD",
     "0 / FLOAT32_MAX",
     "利用Mip範囲。"
    ],
    [
     "ShaderRegister / RegisterSpace",
     "s0 / space0",
     "HLSL sampler registerとの対応。"
    ],
    [
     "ShaderVisibility",
     "PIXEL",
     "参照可能Shader stage。"
    ]
   ],
   "used": "D3D12_ROOT_SIGNATURE_DESC::pStaticSamplers。",
   "deep": "Samplerが固定ならstatic samplerにするとSampler DescriptorHeapを用意せずに済みます。動的にfilterを切り替える用途ではDescriptor Samplerを使います。"
  },
  {
   "name": "D3D12_RANGE",
   "group": "dx12",
   "summary": "Map時にCPUがResourceのどのbyte範囲を読むか、またはUnmap時にどこを書いたかをDriverへ伝える範囲hintです。",
   "fields": [
    [
     "Begin",
     "0",
     "範囲の先頭byte offset。"
    ],
    [
     "End",
     "0 または書込終端",
     "終端byte offset。Begin==Endの{0,0}はCPUから読まないことを示します。"
    ]
   ],
   "used": "ID3D12Resource::Map / Unmap。",
   "deep": "UploadHeapへ書くだけならMapのreadRange={0,0}が適切です。これはResource stateやGPU access rangeとは別概念です。"
  }
 ],
 "apis": [
  {
   "name": "ComPtr::Get / GetAddressOf / Attach / Reset / As",
   "group": "common",
   "signature": "T* ComPtr<T>::Get() const;\nT** ComPtr<T>::GetAddressOf();\nvoid ComPtr<T>::Attach(T* other);\nvoid ComPtr<T>::Reset();\ntemplate<class U> HRESULT ComPtr<T>::As(ComPtr<U>* other) const;",
   "summary": "WRL の ComPtr が保持する COM Interface を DirectX API の in/out parameter と接続し、参照カウントによる寿命を管理します。",
   "params": [
    [
     "Get()",
     "保持中の生 pointer を一時的に取得します。所有権は ComPtr に残ります。"
    ],
    [
     "GetAddressOf()",
     "T** の out parameter を要求する Create* API へ受け取り先を渡します。"
    ],
    [
     "Attach(other)",
     "既に所有権付きで返された生 pointer を ComPtr に引き取らせます。Direct3DCreate9 の戻り値で使用。"
    ],
    [
     "Reset()",
     "保持している Interface を Release し nullptr に戻します。DX12 の Upload Resource 解放等で使用。"
    ],
    [
     "As(other)",
     "QueryInterface 相当で別 Interface 型へ変換します。IDXGISwapChain1 から IDXGISwapChain3 への取得で使用。"
    ]
   ],
   "returns": "Get/Attach/Reset は voidまたはpointer、As は HRESULT。",
   "when": "COM Interface を作成・受け渡し・解放するとき。",
   "example": "ComPtr<IDXGISwapChain1> swap1;\nfactory->CreateSwapChainForHwnd(queue.Get(), hwnd, &desc, nullptr, nullptr, swap1.GetAddressOf());\nThrowIfFailed(swap1.As(&swapChain3), \"Query IDXGISwapChain3 failed.\");",
   "tips": []
  },
  {
   "name": "IID_PPV_ARGS",
   "group": "common",
   "signature": "IID_PPV_ARGS(ppType)",
   "summary": "COM API が要求する Interface ID(REFIID) と void** の組を、受け取り pointer の型から生成する Windows macro です。",
   "params": [
    [
     "ppType",
     "COM Interface pointer の受け取り先。通常 ComPtr<T>::GetAddressOf() を渡します。"
    ]
   ],
   "returns": "関数値ではなく、API 呼び出しの2引数へ展開される macro。",
   "when": "CreateDXGIFactory2、D3D12CreateDevice、CreateCommittedResource など REFIID + void** を要求する API。",
   "example": "D3D12CreateDevice(nullptr, D3D_FEATURE_LEVEL_11_0, IID_PPV_ARGS(device.GetAddressOf()));",
   "tips": []
  },
  {
   "name": "FAILED / SUCCEEDED",
   "group": "common",
   "signature": "BOOL FAILED(HRESULT hr);\nBOOL SUCCEEDED(HRESULT hr);",
   "summary": "HRESULT の最上位bitを使い、COM / DirectX API の成功・失敗を判定する macro です。S_FALSE のような0以外の成功値も正しく成功として扱います。",
   "params": [
    [
     "hr",
     "判定する HRESULT。"
    ]
   ],
   "returns": "FAILED は失敗なら TRUE、SUCCEEDED は成功なら TRUE。",
   "when": "ThrowIfFailed、Debug Interface の任意取得など。",
   "example": "if (FAILED(hr)) { throw std::runtime_error(message); }",
   "tips": []
  },
  {
   "name": "D3DCOLOR_XRGB / D3DCOLOR_ARGB",
   "group": "dx9",
   "signature": "D3DCOLOR_XRGB(r,g,b)\nD3DCOLOR_ARGB(a,r,g,b)",
   "summary": "8bit channel 値を DX9 の 32bit D3DCOLOR に pack する macro です。",
   "params": [
    [
     "a / r / g / b",
     "0～255 の channel 値。XRGB は alpha を 255 として作成。"
    ]
   ],
   "returns": "D3DCOLOR(DWORD)。",
   "when": "Clear color / vertex color 等。",
   "example": "const D3DCOLOR clear = D3DCOLOR_XRGB(24, 31, 42);",
   "tips": []
  },
  {
   "name": "RegisterClassExW",
   "group": "win32",
   "signature": "ATOM RegisterClassExW(const WNDCLASSEXW* lpwcx);",
   "summary": "ウィンドウクラスを OS に登録します。CreateWindowExW より先に1回呼びます。",
   "params": [
    [
     "lpwcx",
     "WNDCLASSEXW へのポインタ。WindowProc、HINSTANCE、クラス名、Cursor などを設定します。"
    ]
   ],
   "returns": "成功時は登録された ATOM、失敗時は 0。失敗理由は GetLastError で取得できます。",
   "when": "CreateMainWindow の先頭。",
   "example": "if (!RegisterClassExW(&windowClass)) throw std::runtime_error(\"RegisterClassExW failed.\");",
   "tips": []
  },
  {
   "name": "AdjustWindowRect",
   "group": "win32",
   "signature": "BOOL AdjustWindowRect(LPRECT lpRect, DWORD dwStyle, BOOL bMenu);",
   "summary": "希望するクライアント領域から、タイトルバーや枠を含むウィンドウ全体のサイズを計算します。",
   "params": [
    [
     "lpRect",
     "入力は希望する Client 幅・高さ。戻り時は必要な Window 矩形になります。"
    ],
    [
     "dwStyle",
     "CreateWindowExW に渡す Window Style と同じ値を指定します。"
    ],
    [
     "bMenu",
     "メニューを持つ場合 TRUE。今回の Window はメニューなしなので FALSE。"
    ]
   ],
   "returns": "成功時 TRUE、失敗時 FALSE。",
   "when": "1280x720 の描画領域を正確に確保するとき。",
   "example": "RECT r{0,0,1280,720};\nAdjustWindowRect(&r, style, FALSE);",
   "tips": []
  },
  {
   "name": "CreateWindowExW",
   "group": "win32",
   "signature": "HWND CreateWindowExW(DWORD exStyle, LPCWSTR className, LPCWSTR windowName, DWORD style, int x, int y, int width, int height, HWND parent, HMENU menu, HINSTANCE instance, LPVOID param);",
   "summary": "登録済みウィンドウクラスから実際の Window を作成します。",
   "params": [
    [
     "exStyle",
     "拡張スタイル。今回 0。"
    ],
    [
     "className",
     "RegisterClassExW で登録した lpszClassName。"
    ],
    [
     "windowName",
     "タイトルバー文字列。"
    ],
    [
     "style",
     "WS_OVERLAPPED / WS_CAPTION などの組合せ。"
    ],
    [
     "x / y",
     "初期位置。CW_USEDEFAULT で OS に任せられます。"
    ],
    [
     "width / height",
     "AdjustWindowRect 後の外枠込みサイズ。"
    ],
    [
     "parent",
     "親 Window。トップレベルなので nullptr。"
    ],
    [
     "menu",
     "Menu handle。今回は nullptr。"
    ],
    [
     "instance",
     "wWinMain の HINSTANCE。"
    ],
    [
     "param",
     "WM_NCCREATE へ渡す任意データ。今回は nullptr。"
    ]
   ],
   "returns": "成功時 HWND、失敗時 nullptr。",
   "when": "DirectX の SwapChain 作成より前。",
   "example": "HWND hwnd = CreateWindowExW(0, kWindowClassName, kWindowTitle, style, CW_USEDEFAULT, CW_USEDEFAULT, w, h, nullptr, nullptr, instance, nullptr);",
   "tips": []
  },
  {
   "name": "DefWindowProcW",
   "group": "win32",
   "signature": "LRESULT DefWindowProcW(HWND hWnd, UINT Msg, WPARAM wParam, LPARAM lParam);",
   "summary": "自分で処理しなかった Window Message を Windows 標準処理へ渡します。",
   "params": [
    [
     "hWnd",
     "Message の対象 Window。"
    ],
    [
     "Msg",
     "WM_* Message ID。"
    ],
    [
     "wParam / lParam",
     "Message 固有の追加情報。"
    ]
   ],
   "returns": "Message に応じた LRESULT。",
   "when": "WindowProc の最後。",
   "example": "return DefWindowProcW(hwnd, message, wParam, lParam);",
   "tips": []
  },
  {
   "name": "PeekMessageW",
   "group": "win32",
   "signature": "BOOL PeekMessageW(LPMSG msg, HWND hwnd, UINT min, UINT max, UINT removeMsg);",
   "summary": "Message Queue を非ブロッキングで確認します。ゲームループを止めずに Window Message を処理できます。",
   "params": [
    [
     "msg",
     "取得した MSG を格納。"
    ],
    [
     "hwnd",
     "nullptr なら Thread の全 Window。"
    ],
    [
     "min / max",
     "Message filter。0,0 ですべて。"
    ],
    [
     "removeMsg",
     "PM_REMOVE で取得した Message を Queue から削除。"
    ]
   ],
   "returns": "Message があれば TRUE、なければ FALSE。",
   "when": "毎フレームの Message Pump。",
   "example": "if (PeekMessageW(&message, nullptr, 0, 0, PM_REMOVE)) { ... }",
   "tips": []
  },
  {
   "name": "TranslateMessage",
   "group": "win32",
   "signature": "BOOL TranslateMessage(const MSG* msg);",
   "summary": "Keyboard Message から WM_CHAR などの文字 Message を生成します。",
   "params": [
    [
     "msg",
     "PeekMessageW / GetMessage で得た MSG。"
    ]
   ],
   "returns": "通常は変換可否。ゲーム側では戻り値を使いません。",
   "when": "DispatchMessageW の直前。",
   "example": "TranslateMessage(&message);",
   "tips": []
  },
  {
   "name": "DispatchMessageW",
   "group": "win32",
   "signature": "LRESULT DispatchMessageW(const MSG* msg);",
   "summary": "MSG を対象 Window の WindowProc へ配送します。",
   "params": [
    [
     "msg",
     "配送する MSG。"
    ]
   ],
   "returns": "WindowProc の戻り値。",
   "when": "TranslateMessage の後。",
   "example": "DispatchMessageW(&message);",
   "tips": []
  },
  {
   "name": "PostQuitMessage",
   "group": "win32",
   "signature": "void PostQuitMessage(int exitCode);",
   "summary": "Thread の Message Queue に WM_QUIT を入れます。",
   "params": [
    [
     "exitCode",
     "WM_QUIT の wParam へ格納される終了コード。"
    ]
   ],
   "returns": "なし。",
   "when": "WM_DESTROY を受けたとき。",
   "example": "PostQuitMessage(0);",
   "tips": []
  },
  {
   "name": "DestroyWindow",
   "group": "win32",
   "signature": "BOOL DestroyWindow(HWND hwnd);",
   "summary": "Window を破棄し、最終的に WM_DESTROY を発生させます。",
   "params": [
    [
     "hwnd",
     "破棄する Window handle。"
    ]
   ],
   "returns": "成功時 TRUE。",
   "when": "Esc キーで終了するとき。",
   "example": "if (wParam == VK_ESCAPE) DestroyWindow(hwnd);",
   "tips": []
  },
  {
   "name": "ShowWindow",
   "group": "win32",
   "signature": "BOOL ShowWindow(HWND hwnd, int cmdShow);",
   "summary": "作成済み Window の表示状態を変更します。",
   "params": [
    [
     "hwnd",
     "対象 Window。"
    ],
    [
     "cmdShow",
     "SW_SHOW など。"
    ]
   ],
   "returns": "以前表示されていた場合 TRUE。",
   "when": "CreateWindowExW 成功後。",
   "example": "ShowWindow(hwnd, SW_SHOW);",
   "tips": []
  },
  {
   "name": "UpdateWindow",
   "group": "win32",
   "signature": "BOOL UpdateWindow(HWND hwnd);",
   "summary": "Update Region がある場合 WM_PAINT を直ちに送ります。",
   "params": [
    [
     "hwnd",
     "対象 Window。"
    ]
   ],
   "returns": "成功時 0 以外。",
   "when": "ShowWindow の直後。",
   "example": "UpdateWindow(hwnd);",
   "tips": []
  },
  {
   "name": "GetModuleFileNameW",
   "group": "win32",
   "signature": "DWORD GetModuleFileNameW(HMODULE module, LPWSTR filename, DWORD size);",
   "summary": "実行中 EXE の絶対パスを取得します。Icon.png や HLSL を EXE から相対探索するときに使います。",
   "params": [
    [
     "module",
     "nullptr で現在の EXE。"
    ],
    [
     "filename",
     "結果を書き込む wchar_t buffer。"
    ],
    [
     "size",
     "buffer の wchar_t 要素数。"
    ]
   ],
   "returns": "書き込んだ文字数。0 は失敗。",
   "when": "Asset path 解決。",
   "example": "wchar_t path[MAX_PATH]{}; GetModuleFileNameW(nullptr, path, MAX_PATH);",
   "tips": []
  },
  {
   "name": "LoadCursor",
   "group": "win32",
   "signature": "HCURSOR LoadCursor(HINSTANCE instance, LPCWSTR cursorName);",
   "summary": "Window class に設定する Cursor handle を取得します。",
   "params": [
    [
     "instance",
     "System cursor を使う場合 nullptr。"
    ],
    [
     "cursorName",
     "IDC_ARROW などの predefined cursor。"
    ]
   ],
   "returns": "成功時 HCURSOR、失敗時 nullptr。",
   "when": "WNDCLASSEXW::hCursor 設定時。",
   "example": "windowClass.hCursor = LoadCursor(nullptr, IDC_ARROW);",
   "tips": []
  },
  {
   "name": "CreateEventW",
   "group": "win32",
   "signature": "HANDLE CreateEventW(LPSECURITY_ATTRIBUTES attributes, BOOL manualReset, BOOL initialState, LPCWSTR name);",
   "summary": "Fence 完了通知を待つための Win32 Event を作成します。",
   "params": [
    [
     "attributes",
     "Security 設定を使わないので nullptr。"
    ],
    [
     "manualReset",
     "FALSE で auto-reset event。"
    ],
    [
     "initialState",
     "FALSE で非 signal 状態から開始。"
    ],
    [
     "name",
     "名前なしなので nullptr。"
    ]
   ],
   "returns": "成功時 Event HANDLE、失敗時 nullptr。",
   "when": "DX12 Fence 作成時。",
   "example": "m_fenceEvent = CreateEventW(nullptr, FALSE, FALSE, nullptr);",
   "tips": []
  },
  {
   "name": "WaitForSingleObject",
   "group": "win32",
   "signature": "DWORD WaitForSingleObject(HANDLE handle, DWORD milliseconds);",
   "summary": "Event などの Kernel Object が signal になるまで現在 Thread を待機します。",
   "params": [
    [
     "handle",
     "Fence 完了通知用 Event。"
    ],
    [
     "milliseconds",
     "INFINITE なら時間制限なし。"
    ]
   ],
   "returns": "WAIT_OBJECT_0 / WAIT_TIMEOUT / WAIT_FAILED など。",
   "when": "DX12 Fence::SetEventOnCompletion の後。",
   "example": "WaitForSingleObject(m_fenceEvent, INFINITE);",
   "tips": []
  },
  {
   "name": "CloseHandle",
   "group": "win32",
   "signature": "BOOL CloseHandle(HANDLE object);",
   "summary": "CreateEventW などで作った Kernel Handle を解放します。",
   "params": [
    [
     "object",
     "解放する HANDLE。"
    ]
   ],
   "returns": "成功時 TRUE。",
   "when": "Renderer destructor で Fence Event を破棄するとき。",
   "example": "if (m_fenceEvent) CloseHandle(m_fenceEvent);",
   "tips": []
  },
  {
   "name": "MessageBoxW",
   "group": "win32",
   "signature": "int MessageBoxW(HWND hwnd, LPCWSTR text, LPCWSTR caption, UINT type);",
   "summary": "メッセージをダイアログで表示します。この教材では、例外で止まったときにエラー内容を表示するのに使います。",
   "params": [
    [
     "hwnd",
     "親ウィンドウ。nullptr なら親なし。"
    ],
    [
     "text",
     "本文（UTF-16 の文字列）。"
    ],
    [
     "caption",
     "ダイアログのタイトル。"
    ],
    [
     "type",
     "MB_OK | MB_ICONERROR など、ボタンとアイコンの種類。"
    ]
   ],
   "returns": "押されたボタンの ID。",
   "when": "ShowErrorMessage の中。",
   "example": "MessageBoxW(nullptr, L\"失敗しました\", kWindowTitle, MB_OK | MB_ICONERROR);",
   "tips": []
  },
  {
   "name": "CoInitializeEx",
   "group": "win32",
   "signature": "HRESULT CoInitializeEx(LPVOID reserved, DWORD coInit);",
   "summary": "現在 Thread で COM を初期化します。WIC の COM Object を作る前に必要です。",
   "params": [
    [
     "reserved",
     "必ず nullptr。"
    ],
    [
     "coInit",
     "COINIT_APARTMENTTHREADED などの Apartment model。"
    ]
   ],
   "returns": "S_OK / S_FALSE は成功。RPC_E_CHANGED_MODE は既存 Apartment model と競合。",
   "when": "wWinMain の開始直後、WIC 利用前。",
   "example": "ThrowIfFailed(CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED), \"CoInitializeEx failed.\");",
   "tips": [],
   "notes": {
    "beginner": "WIC は COM Object なので、使う Thread を COM に参加させる初期化です。『画像読み込み用ライブラリの初期化』というより、COM Interface を安全に使うための Thread 設定です。",
    "pre": "同じ Thread 上で WIC の CoCreateInstance より先に呼びます。成功した呼び出しには対応する CoUninitialize が必要です。",
    "fail": "RPC_E_CHANGED_MODE は、その Thread が既に別 Apartment model で初期化済みであることを示します。S_FALSE は失敗ではなく『既に同じ方式で初期化済み』です。",
    "deep": "COM apartment は object の呼び出し規則と thread affinity に関係します。今回のWICは単一Threadで完結するため COINIT_APARTMENTTHREADED で十分です。"
   }
  },
  {
   "name": "CoUninitialize",
   "group": "win32",
   "signature": "void CoUninitialize();",
   "summary": "CoInitializeEx と対応して COM を終了します。",
   "params": [],
   "returns": "なし。",
   "when": "Main loop 終了後。",
   "example": "CoUninitialize();",
   "tips": []
  },
  {
   "name": "CoCreateInstance",
   "group": "wic",
   "signature": "HRESULT CoCreateInstance(REFCLSID clsid, LPUNKNOWN outer, DWORD clsContext, REFIID iid, LPVOID* object);",
   "summary": "COM Class から Object を生成します。WIC では IWICImagingFactory を取得します。",
   "params": [
    [
     "clsid",
     "CLSID_WICImagingFactory。"
    ],
    [
     "outer",
     "Aggregation しないので nullptr。"
    ],
    [
     "clsContext",
     "CLSID の実装をどこから読み込むか。WIC は CLSCTX_INPROC_SERVER。"
    ],
    [
     "iid",
     "取得する Interface ID。IID_PPV_ARGS を使うと安全。"
    ],
    [
     "object",
     "生成した Interface pointer の受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "WIC 読み込みの最初。",
   "example": "CoCreateInstance(CLSID_WICImagingFactory, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(factory.GetAddressOf()));",
   "tips": []
  },
  {
   "name": "IWICImagingFactory::CreateDecoderFromFilename",
   "group": "wic",
   "signature": "HRESULT CreateDecoderFromFilename(LPCWSTR filename, const GUID* vendor, DWORD access, WICDecodeOptions metadataOptions, IWICBitmapDecoder** decoder);",
   "summary": "ファイル名から適切な Codec を選び Decoder を作成します。PNG なら PNG Decoder が選ばれます。",
   "params": [
    [
     "filename",
     "Icon.png の絶対または有効な相対パス。"
    ],
    [
     "vendor",
     "特定 Vendor Codec を要求しないので nullptr。"
    ],
    [
     "access",
     "GENERIC_READ。"
    ],
    [
     "metadataOptions",
     "WICDecodeMetadataCacheOnLoad で decode 時に metadata を読みます。"
    ],
    [
     "decoder",
     "IWICBitmapDecoder の受け取り先。"
    ]
   ],
   "returns": "HRESULT。ファイル不存在・未対応形式などで失敗します。",
   "when": "WIC Factory 作成後。",
   "example": "factory->CreateDecoderFromFilename(path.c_str(), nullptr, GENERIC_READ, WICDecodeMetadataCacheOnLoad, decoder.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "PNG専用関数ではありません。拡張子やファイル内容に応じて WIC が適切な decoder を選びます。",
    "pre": "COM初期化済みで IWICImagingFactory を取得しておき、path が実在する必要があります。",
    "fail": "相対pathの基準が想定と違う、ファイルが存在しない、codecが利用できない、アクセス権がない、などで失敗します。",
    "deep": "DecoderとGPU Textureは別責務です。ここで得られるのは圧縮画像を読めるCPU側Objectで、GPUへ転送されるのは後段のCopyPixels結果です。"
   }
  },
  {
   "name": "IWICBitmapDecoder::GetFrame",
   "group": "wic",
   "signature": "HRESULT GetFrame(UINT index, IWICBitmapFrameDecode** frame);",
   "summary": "複数 Frame を持つ画像から指定 Frame を取得します。PNG は通常 index 0 の1枚です。",
   "params": [
    [
     "index",
     "Frame index。Icon.png は 0。"
    ],
    [
     "frame",
     "取得した IWICBitmapFrameDecode。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Decoder 作成後。",
   "example": "decoder->GetFrame(0, frame.GetAddressOf());",
   "tips": []
  },
  {
   "name": "IWICImagingFactory::CreateFormatConverter",
   "group": "wic",
   "signature": "HRESULT CreateFormatConverter(IWICFormatConverter** converter);",
   "summary": "画像の Pixel Format を GPU に渡しやすい形式へ変換する Object を作ります。",
   "params": [
    [
     "converter",
     "IWICFormatConverter の受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Frame 取得後。",
   "example": "factory->CreateFormatConverter(converter.GetAddressOf());",
   "tips": []
  },
  {
   "name": "IWICFormatConverter::Initialize",
   "group": "wic",
   "signature": "HRESULT Initialize(IWICBitmapSource* source, REFWICPixelFormatGUID dstFormat, WICBitmapDitherType dither, IWICPalette* palette, double alphaThreshold, WICBitmapPaletteType paletteType);",
   "summary": "Converter の入力と出力 Pixel Format を設定します。今回の出力は 32bpp BGRA です。",
   "params": [
    [
     "source",
     "Frame などの IWICBitmapSource。"
    ],
    [
     "dstFormat",
     "GUID_WICPixelFormat32bppBGRA。1 pixel = B,G,R,A の4 byte。"
    ],
    [
     "dither",
     "WICBitmapDitherTypeNone。"
    ],
    [
     "palette",
     "TrueColor 変換なので nullptr。"
    ],
    [
     "alphaThreshold",
     "Palette 変換時の alpha threshold。今回 0.0。"
    ],
    [
     "paletteType",
     "WICBitmapPaletteTypeCustom。Palette 自体は使いません。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "CopyPixels より前。",
   "example": "converter->Initialize(frame.Get(), GUID_WICPixelFormat32bppBGRA, WICBitmapDitherTypeNone, nullptr, 0.0, WICBitmapPaletteTypeCustom);",
   "tips": [],
   "notes": {
    "beginner": "PNGごとに異なり得るPixel Formatを、後段で扱いやすい32bpp BGRAへ統一します。",
    "pre": "source Frame が有効で、converter Object を作成済みである必要があります。",
    "fail": "source/destination format の組合せが変換不可、palette設定が不正、sourceが無効などで失敗します。",
    "deep": "32bpp BGRAを選ぶと1pixel=4byteで扱いやすくなりますが、GPU側FormatもB8G8R8A8系に合わせる必要があります。Color spaceやsRGBは別論点です。"
   }
  },
  {
   "name": "IWICBitmapSource::GetSize",
   "group": "wic",
   "signature": "HRESULT GetSize(UINT* width, UINT* height);",
   "summary": "Decode 後の画像サイズを pixel 単位で取得します。",
   "params": [
    [
     "width",
     "幅の受け取り先。"
    ],
    [
     "height",
     "高さの受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "CPU pixel buffer の確保前。",
   "example": "converter->GetSize(&image.width, &image.height);",
   "tips": []
  },
  {
   "name": "IWICBitmapSource::CopyPixels",
   "group": "wic",
   "signature": "HRESULT CopyPixels(const WICRect* rect, UINT stride, UINT bufferSize, BYTE* buffer);",
   "summary": "Decode / Convert 済み pixel を CPU buffer へコピーします。",
   "params": [
    [
     "rect",
     "nullptr なら画像全体。"
    ],
    [
     "stride",
     "1行の byte 数。32bpp BGRA なら width * 4。"
    ],
    [
     "bufferSize",
     "出力 buffer 全体の byte 数。"
    ],
    [
     "buffer",
     "書き込み先 BYTE 配列。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "WIC decode の最後。",
   "example": "converter->CopyPixels(nullptr, width * 4, static_cast<UINT>(pixels.size()), pixels.data());",
   "tips": [],
   "notes": {
    "beginner": "Decode済み画像を、自分で所有する連続したCPU memoryへ取り出す最後の処理です。",
    "pre": "strideとbufferSizeをpixel formatに合わせて正しく計算します。32bppなら最低でもwidth*4 byte/rowが必要です。",
    "fail": "stride不足、bufferSize不足、巨大画像でUINT計算がoverflowする、といったサイズ計算ミスが典型です。",
    "deep": "ここで得たCPU配列の寿命はアプリ側管理です。DX11はCreateTexture2D呼び出し中に初期dataを消費しますが、DX12はGPU copy完了までUpload Resourceが必要です。"
   }
  },
  {
   "name": "Direct3DCreate9",
   "group": "dx9",
   "signature": "IDirect3D9* Direct3DCreate9(UINT sdkVersion);",
   "summary": "Direct3D 9 の入口となる IDirect3D9 を取得します。",
   "params": [
    [
     "sdkVersion",
     "必ず D3D_SDK_VERSION。Header と Runtime の互換確認に使われます。"
    ]
   ],
   "returns": "成功時 IDirect3D9*、失敗時 nullptr。HRESULT ではありません。",
   "when": "DX9 初期化の最初。",
   "example": "ComPtr<IDirect3D9> d3d; d3d.Attach(Direct3DCreate9(D3D_SDK_VERSION));",
   "tips": []
  },
  {
   "name": "IDirect3D9::CreateDevice",
   "group": "dx9",
   "signature": "HRESULT CreateDevice(UINT adapter, D3DDEVTYPE deviceType, HWND focusWindow, DWORD behaviorFlags, D3DPRESENT_PARAMETERS* params, IDirect3DDevice9** device);",
   "summary": "描画を行う IDirect3DDevice9 を作成します。画面表示と Depth の設定も同時に渡します。",
   "params": [
    [
     "adapter",
     "D3DADAPTER_DEFAULT で既定の GPU を使います。"
    ],
    [
     "deviceType",
     "D3DDEVTYPE_HAL で GPU の Hardware 描画機能を使います。"
    ],
    [
     "focusWindow",
     "描画結果を表示する HWND。"
    ],
    [
     "behaviorFlags",
     "頂点処理を GPU 側で行う D3DCREATE_HARDWARE_VERTEXPROCESSING などを指定します。"
    ],
    [
     "params",
     "BackBuffer の幅・高さ・色形式、Window 表示、DepthStencil、垂直同期などをまとめた設定。"
    ],
    [
     "device",
     "作成した IDirect3DDevice9 の受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Direct3DCreate9 の後。",
   "example": "d3d->CreateDevice(D3DADAPTER_DEFAULT, D3DDEVTYPE_HAL, hwnd, D3DCREATE_HARDWARE_VERTEXPROCESSING, &present, device.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "DX9では、このDeviceがResource作成・State設定・Draw・Presentの中心になります。",
    "pre": "Direct3DCreate9成功後、登録済みのHWNDと正しいD3DPRESENT_PARAMETERSを用意します。",
    "fail": "選んだbackbuffer/depth formatが非対応、hardware vertex processing非対応、fullscreen設定不整合などで失敗します。",
    "deep": "DX9のDeviceは巨大なcurrent-state machineです。後世代でDevice/Context/PSO/Queueへ責務が分かれていく比較の起点になります。"
   }
  },
  {
   "name": "IDirect3DDevice9::CreateVertexBuffer",
   "group": "dx9",
   "signature": "HRESULT CreateVertexBuffer(UINT length, DWORD usage, DWORD fvf, D3DPOOL pool, IDirect3DVertexBuffer9** vb, HANDLE* shared);",
   "summary": "GPU が Vertex Stream として参照する Buffer を作成します。",
   "params": [
    [
     "length",
     "Buffer byte 数。vertexCount * sizeof(Vertex)。"
    ],
    [
     "usage",
     "Usage flag。静的教材データは 0。"
    ],
    [
     "fvf",
     "頂点形式。kVertexFVF。"
    ],
    [
     "pool",
     "D3DPOOL_MANAGED。"
    ],
    [
     "vb",
     "作成された VertexBuffer。"
    ],
    [
     "shared",
     "Shared handle。今回は nullptr。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Geometry 作成時。",
   "example": "device->CreateVertexBuffer(bytes, 0, kVertexFVF, D3DPOOL_MANAGED, vb.GetAddressOf(), nullptr);",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::CreateIndexBuffer",
   "group": "dx9",
   "signature": "HRESULT CreateIndexBuffer(UINT length, DWORD usage, D3DFORMAT format, D3DPOOL pool, IDirect3DIndexBuffer9** ib, HANDLE* shared);",
   "summary": "Index Buffer を作成します。",
   "params": [
    [
     "length",
     "indexCount * sizeof(uint16_t)。"
    ],
    [
     "usage",
     "0。"
    ],
    [
     "format",
     "D3DFMT_INDEX16。"
    ],
    [
     "pool",
     "D3DPOOL_MANAGED。"
    ],
    [
     "ib",
     "作成された IndexBuffer。"
    ],
    [
     "shared",
     "nullptr。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Geometry 作成時。",
   "example": "device->CreateIndexBuffer(bytes, 0, D3DFMT_INDEX16, D3DPOOL_MANAGED, ib.GetAddressOf(), nullptr);",
   "tips": []
  },
  {
   "name": "IDirect3DVertexBuffer9::Lock / Unlock",
   "group": "dx9",
   "signature": "HRESULT Lock(UINT offset, UINT size, void** data, DWORD flags);\nHRESULT Unlock();",
   "summary": "Buffer memory を CPU から書ける状態にし、頂点データをコピーして閉じます。",
   "params": [
    [
     "offset",
     "Lock 開始 byte。0 で先頭。"
    ],
    [
     "size",
     "0 で Buffer 全体。"
    ],
    [
     "data",
     "書き込み先 memory pointer の受け取り先。"
    ],
    [
     "flags",
     "通常 0。"
    ]
   ],
   "returns": "どちらも HRESULT。",
   "when": "CreateVertexBuffer / CreateIndexBuffer 直後。",
   "example": "void* dst=nullptr; vb->Lock(0,0,&dst,0); memcpy(dst, vertices.data(), bytes); vb->Unlock();",
   "tips": []
  },
  {
   "name": "IDirect3DIndexBuffer9::Lock / Unlock",
   "group": "dx9",
   "signature": "HRESULT Lock(UINT offset, UINT size, void** data, DWORD flags);\nHRESULT Unlock();",
   "summary": "IndexBuffer memory を CPU から書ける状態にし、index 配列をコピーして閉じます。",
   "params": [
    [
     "offset",
     "Lock 開始 byte。0 で先頭。"
    ],
    [
     "size",
     "0 で Buffer 全体。"
    ],
    [
     "data",
     "書き込み先 memory pointer の受け取り先。"
    ],
    [
     "flags",
     "通常 0。"
    ]
   ],
   "returns": "どちらも HRESULT。",
   "when": "CreateIndexBuffer 直後。",
   "example": "void* dst=nullptr; ib->Lock(0,0,&dst,0); memcpy(dst, indices.data(), bytes); ib->Unlock();",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::CreateTexture",
   "group": "dx9",
   "signature": "HRESULT CreateTexture(UINT width, UINT height, UINT levels, DWORD usage, D3DFORMAT format, D3DPOOL pool, IDirect3DTexture9** texture, HANDLE* shared);",
   "summary": "2D Texture を作成します。PNG Texture と RenderTarget Texture の両方で使用します。",
   "params": [
    [
     "width / height",
     "Texture pixel size。"
    ],
    [
     "levels",
     "Mip level 数。1 なら base level のみ。"
    ],
    [
     "usage",
     "通常 Texture は 0、描画先は D3DUSAGE_RENDERTARGET。"
    ],
    [
     "format",
     "D3DFMT_A8R8G8B8。"
    ],
    [
     "pool",
     "通常は D3DPOOL_MANAGED、RenderTarget は D3DPOOL_DEFAULT。"
    ],
    [
     "texture",
     "作成された Texture。"
    ],
    [
     "shared",
     "nullptr。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "PNG upload / Offscreen 作成。",
   "example": "device->CreateTexture(w,h,1,0,D3DFMT_A8R8G8B8,D3DPOOL_MANAGED,texture.GetAddressOf(),nullptr);",
   "tips": [],
   "notes": {
    "beginner": "同じ関数でも、普通のShader用TextureとRenderTarget Textureの両方を作れます。違いはusage/pool/formatです。",
    "pre": "用途に応じて D3DPOOL と D3DUSAGE を選びます。RenderTargetは通常D3DPOOL_DEFAULTが必要です。",
    "fail": "RenderTarget用途なのにMANAGED poolを指定する、未対応format/sizeを指定する、といった組合せ不整合が典型です。",
    "deep": "DX9はResource用途の制約がAPIのusage/poolへ強く埋め込まれています。DX12ではHeapType・ResourceFlags・ResourceStateへ概念が分離されます。"
   }
  },
  {
   "name": "IDirect3DTexture9::LockRect / UnlockRect",
   "group": "dx9",
   "signature": "HRESULT LockRect(UINT level, D3DLOCKED_RECT* locked, const RECT* rect, DWORD flags);\nHRESULT UnlockRect(UINT level);",
   "summary": "Texture の指定 Mip Level を CPU から書けるようにします。Pitch は width*4 と一致するとは限らないため行単位でコピーします。",
   "params": [
    [
     "level",
     "Mip level。今回 0。"
    ],
    [
     "locked",
     "pBits と Pitch の受け取り先。"
    ],
    [
     "rect",
     "nullptr で Texture 全体。"
    ],
    [
     "flags",
     "通常 0。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "WIC pixel を DX9 Texture へ転送するとき。",
   "example": "D3DLOCKED_RECT l{}; texture->LockRect(0,&l,nullptr,0); /* row copy */ texture->UnlockRect(0);",
   "tips": [],
   "notes": {
    "beginner": "TextureのCPU書込み可能領域を一時的に借り、PNG pixelをコピーして返します。",
    "pre": "Lock可能なResourceである必要があります。返されたPitchを使って行単位で進みます。",
    "fail": "width*4をPitchだと思い込む、Unlock後のpBitsを使う、Lockできないpool/usageのTextureをLockする、が典型です。",
    "deep": "Lockは単なるpointer取得ではなくRuntimeとの同期点になり得ます。頻繁な更新ではusage/lock flagの選択が性能に影響します。"
   }
  },
  {
   "name": "IDirect3DTexture9::GetSurfaceLevel",
   "group": "dx9",
   "signature": "HRESULT GetSurfaceLevel(UINT level, IDirect3DSurface9** surface);",
   "summary": "Texture の Mip Level を RenderTarget として扱うため Surface Interface を取得します。",
   "params": [
    [
     "level",
     "0。"
    ],
    [
     "surface",
     "IDirect3DSurface9 の受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "D3DUSAGE_RENDERTARGET Texture 作成後。",
   "example": "sceneTexture->GetSurfaceLevel(0, sceneSurface.GetAddressOf());",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::GetRenderTarget / SetRenderTarget",
   "group": "dx9",
   "signature": "HRESULT GetRenderTarget(DWORD index, IDirect3DSurface9** surface);\nHRESULT SetRenderTarget(DWORD index, IDirect3DSurface9* surface);",
   "summary": "現在の BackBuffer Surface を保存し、描画先を Offscreen Surface / BackBuffer へ切り替えます。",
   "params": [
    [
     "index",
     "MRT slot。今回 0。"
    ],
    [
     "surface",
     "Get は受け取り先、Set は設定する Surface。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "2-pass rendering。",
   "example": "device->GetRenderTarget(0, backBuffer.GetAddressOf());\ndevice->SetRenderTarget(0, sceneSurface.Get());",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::SetFVF",
   "group": "dx9",
   "signature": "HRESULT SetFVF(DWORD fvf);",
   "summary": "Fixed Function Vertex Pipeline が Vertex memory をどう読むか指定します。",
   "params": [
    [
     "fvf",
     "今回のVertexは位置・頂点色・UVを持つため D3DFVF_XYZ | D3DFVF_DIFFUSE | D3DFVF_TEX1。C++のVertex structと順序・属性を一致させます。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Draw 前の Pipeline setup。",
   "example": "constexpr DWORD kVertexFVF = D3DFVF_XYZ | D3DFVF_DIFFUSE | D3DFVF_TEX1;\ndevice->SetFVF(kVertexFVF);",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::SetStreamSource",
   "group": "dx9",
   "signature": "HRESULT SetStreamSource(UINT stream, IDirect3DVertexBuffer9* vb, UINT offset, UINT stride);",
   "summary": "VertexBuffer を Input Stream に設定します。",
   "params": [
    [
     "stream",
     "Stream index。通常 0。"
    ],
    [
     "vb",
     "VertexBuffer。"
    ],
    [
     "offset",
     "先頭 byte offset。0。"
    ],
    [
     "stride",
     "1 vertex の byte size。sizeof(Vertex)。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Draw 前。",
   "example": "device->SetStreamSource(0, vb.Get(), 0, sizeof(Vertex));",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::SetIndices",
   "group": "dx9",
   "signature": "HRESULT SetIndices(IDirect3DIndexBuffer9* ib);",
   "summary": "DrawIndexedPrimitive が使用する IndexBuffer を設定します。",
   "params": [
    [
     "ib",
     "IndexBuffer。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Draw 前。",
   "example": "device->SetIndices(indexBuffer.Get());",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::SetTexture",
   "group": "dx9",
   "signature": "HRESULT SetTexture(DWORD stage, IDirect3DBaseTexture9* texture);",
   "summary": "Texture Stage に Texture を設定します。",
   "params": [
    [
     "stage",
     "Stage index。Pixel Texture 0 は 0。"
    ],
    [
     "texture",
     "PNG Texture または Offscreen Texture。nullptr で解除。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Scene Pass / Present Pass。",
   "example": "device->SetTexture(0, texture.Get());",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::SetTransform",
   "group": "dx9",
   "signature": "HRESULT SetTransform(D3DTRANSFORMSTATETYPE state, const D3DMATRIX* matrix);",
   "summary": "Fixed Function Transform に World / View / Projection Matrix を設定します。",
   "params": [
    [
     "state",
     "D3DTS_WORLD / D3DTS_VIEW / D3DTS_PROJECTION。"
    ],
    [
     "matrix",
     "設定する D3DMATRIX。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "3D Geometry Draw 前。",
   "example": "device->SetTransform(D3DTS_VIEW, &view);",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::SetRenderState",
   "group": "dx9",
   "signature": "HRESULT SetRenderState(D3DRENDERSTATETYPE state, DWORD value);",
   "summary": "Depth、Blend、Cull などの描画状態を Device の current state として設定します。",
   "params": [
    [
     "state",
     "D3DRS_ZENABLE / D3DRS_ALPHABLENDENABLE / D3DRS_SRCBLEND など。"
    ],
    [
     "value",
     "State に対応する BOOL / enum / packed value。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Pipeline state 切替時。",
   "example": "device->SetRenderState(D3DRS_ALPHABLENDENABLE, TRUE);",
   "tips": [],
   "notes": {
    "beginner": "DepthやBlendなど、これ以降のDrawに使う『現在の設定』を書き換えます。",
    "pre": "stateごとにvalueの意味が違います。BOOL、enum、floatのbit表現などをDWORDへ渡すAPIです。",
    "fail": "BlendEnableだけONにしてSrc/DestBlendを意図通り設定していない、DepthWriteを戻し忘れる、などstate leakが起きやすいです。",
    "deep": "このstate leak問題が、DX11のState ObjectやDX12のPSOへ繋がります。Renderer側でstate cacheを持つ設計が必要になった歴史的背景です。"
   }
  },
  {
   "name": "IDirect3DDevice9::SetSamplerState",
   "group": "dx9",
   "signature": "HRESULT SetSamplerState(DWORD sampler, D3DSAMPLERSTATETYPE type, DWORD value);",
   "summary": "Texture sampling の Filter / Address mode を設定します。",
   "params": [
    [
     "sampler",
     "Sampler index。Texture stage 0 なら 0。"
    ],
    [
     "type",
     "D3DSAMP_ADDRESSU / MINFILTER 等。"
    ],
    [
     "value",
     "D3DTADDRESS_WRAP / D3DTEXF_LINEAR 等。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Texture 使用前。",
   "example": "device->SetSamplerState(0, D3DSAMP_MINFILTER, D3DTEXF_LINEAR);",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::SetTextureStageState",
   "group": "dx9",
   "signature": "HRESULT SetTextureStageState(DWORD stage, D3DTEXTURESTAGESTATETYPE type, DWORD value);",
   "summary": "Fixed Function Pixel Pipeline で Texture color と vertex color をどう合成するか設定します。",
   "params": [
    [
     "stage",
     "Texture stage index。"
    ],
    [
     "type",
     "D3DTSS_COLOROP / COLORARG1 / COLORARG2 など。"
    ],
    [
     "value",
     "D3DTOP_MODULATE / D3DTA_TEXTURE など。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "DX9 の Texture Pipeline setup。",
   "example": "device->SetTextureStageState(0, D3DTSS_COLOROP, D3DTOP_MODULATE);",
   "tips": [],
   "notes": {
    "beginner": "DX9の固定機能Pixel Pipelineで、Textureの色と頂点色をどう組み合わせるか決めます。Shaderを書かずに色演算を選んでいる点が特徴です。",
    "pre": "対象stageへTextureをSetTexture済みで、COLOROPとCOLORARG1/2の組合せを揃えます。",
    "fail": "COLOROPだけ設定して入力ARGを想定と違うまま使う、次stageを無効化せず意図しない合成が残る、が典型です。",
    "deep": "このstage combinatorはprogrammable shader以前の発想です。DX11以降では同じ色演算をPixelShaderへ記述するため、固定機能からprogrammable pipelineへの歴史が最も見えやすいAPIです。"
   }
  },
  {
   "name": "IDirect3DDevice9::Clear",
   "group": "dx9",
   "signature": "HRESULT Clear(DWORD count, const D3DRECT* rects, DWORD flags, D3DCOLOR color, float z, DWORD stencil);",
   "summary": "RenderTarget / Depth / Stencil を初期値でクリアします。",
   "params": [
    [
     "count / rects",
     "0 / nullptr で全体。"
    ],
    [
     "flags",
     "D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER など。"
    ],
    [
     "color",
     "Clear color。"
    ],
    [
     "z",
     "Depth clear value。通常 1.0f。"
    ],
    [
     "stencil",
     "Stencil clear value。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "各 Pass の描画開始前。",
   "example": "device->Clear(0,nullptr,D3DCLEAR_TARGET|D3DCLEAR_ZBUFFER,color,1.0f,0);",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::BeginScene / EndScene",
   "group": "dx9",
   "signature": "HRESULT BeginScene();\nHRESULT EndScene();",
   "summary": "3D scene の描画命令区間を開始・終了します。",
   "params": [],
   "returns": "HRESULT。",
   "when": "Draw call 群を囲む。",
   "example": "device->BeginScene();\n/* Draw */\ndevice->EndScene();",
   "tips": []
  },
  {
   "name": "IDirect3DDevice9::DrawIndexedPrimitive",
   "group": "dx9",
   "signature": "HRESULT DrawIndexedPrimitive(D3DPRIMITIVETYPE type, INT baseVertexIndex, UINT minVertexIndex, UINT numVertices, UINT startIndex, UINT primitiveCount);",
   "summary": "現在設定中の VB / IB / State を使って Indexed Geometry を描画します。",
   "params": [
    [
     "type",
     "D3DPT_TRIANGLELIST。"
    ],
    [
     "baseVertexIndex",
     "Index に加算する base vertex。今回 0。"
    ],
    [
     "minVertexIndex",
     "使用する最小 vertex index。0。"
    ],
    [
     "numVertices",
     "参照可能な vertex 数。"
    ],
    [
     "startIndex",
     "IndexBuffer 内の開始 index。"
    ],
    [
     "primitiveCount",
     "TriangleList なら indexCount / 3。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Geometry Draw。",
   "example": "device->DrawIndexedPrimitive(D3DPT_TRIANGLELIST,0,0,vertexCount,startIndex,indexCount/3);",
   "tips": [],
   "notes": {
    "beginner": "現在Deviceに設定されているVB/IB/FVF/Texture/RenderStateをまとめて使い、Index指定の三角形を描きます。",
    "pre": "SetStreamSource、SetIndices、SetFVFと必要なstateをDraw前に設定します。TriangleListならprimitiveCountはindexCount/3です。",
    "fail": "numVerticesとprimitiveCountを混同する、startIndexをbyte offsetだと思う、VB/IBをbindし忘れる、が典型です。",
    "deep": "Draw call自体は短いですが結果は大量のcurrent stateに依存します。DX11のContext state、DX12のPSO/Root bindingへ責務が整理されていく比較点です。"
   }
  },
  {
   "name": "IDirect3DDevice9::Present",
   "group": "dx9",
   "signature": "HRESULT Present(const RECT* src, const RECT* dst, HWND overrideWindow, const RGNDATA* dirtyRegion);",
   "summary": "BackBuffer の内容を Window へ提示します。",
   "params": [
    [
     "src / dst",
     "nullptr で全領域。"
    ],
    [
     "overrideWindow",
     "nullptr で Device 作成時の Window。"
    ],
    [
     "dirtyRegion",
     "nullptr。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Frame 最後。",
   "example": "device->Present(nullptr,nullptr,nullptr,nullptr);",
   "tips": []
  },
  {
   "name": "D3D11CreateDeviceAndSwapChain",
   "group": "dx11",
   "signature": "HRESULT D3D11CreateDeviceAndSwapChain(IDXGIAdapter* adapter, D3D_DRIVER_TYPE driverType, HMODULE software, UINT flags, const D3D_FEATURE_LEVEL* levels, UINT levelCount, UINT sdkVersion, const DXGI_SWAP_CHAIN_DESC* swapDesc, IDXGISwapChain** swapChain, ID3D11Device** device, D3D_FEATURE_LEVEL* createdLevel, ID3D11DeviceContext** context);",
   "summary": "Device、ImmediateContext、SwapChain をまとめて作成します。",
   "params": [
    [
     "adapter",
     "nullptr なら既定の GPU Adapter を使います。"
    ],
    [
     "driverType",
     "D3D_DRIVER_TYPE_HARDWARE で GPU の Hardware 描画を使います。"
    ],
    [
     "software",
     "Software rasterizer を使わないため nullptr。"
    ],
    [
     "flags",
     "Debug build では D3D11_CREATE_DEVICE_DEBUG を追加します。"
    ],
    [
     "levels",
     "要求する Feature Level を並べた配列。"
    ],
    [
     "levelCount",
     "levels 配列の要素数。今回 1。"
    ],
    [
     "sdkVersion",
     "Windows SDK と一致させる D3D11_SDK_VERSION。"
    ],
    [
     "swapDesc",
     "BackBuffer の幅・高さ・色形式・枚数・描画先 Window など。"
    ],
    [
     "swapChain",
     "作成した SwapChain の受け取り先。"
    ],
    [
     "device",
     "作成した Device の受け取り先。"
    ],
    [
     "createdLevel",
     "実際に選ばれた Feature Level の受け取り先。"
    ],
    [
     "context",
     "作成した ImmediateContext の受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "DX11 初期化の最初。",
   "example": "D3D11CreateDeviceAndSwapChain(nullptr,D3D_DRIVER_TYPE_HARDWARE,nullptr,flags,levels,1,D3D11_SDK_VERSION,&desc,swap.GetAddressOf(),device.GetAddressOf(),&level,context.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "DX11のDevice、ImmediateContext、SwapChainを一度に作ります。Deviceは作成、Contextは命令、SwapChainは表示担当です。",
    "pre": "HWNDを作成済みで、有効なDXGI_SWAP_CHAIN_DESCとFeatureLevel配列を用意します。",
    "fail": "Debug Layer未インストールでDEBUG flagを指定した場合、要求FeatureLevel非対応、swapchain設定不正などで失敗します。",
    "deep": "DeviceとContextの分離はDX9の巨大Deviceからの重要な変化です。DeferredContextもありますが、今回使うのはImmediateContextです。"
   }
  },
  {
   "name": "IDXGISwapChain::GetBuffer",
   "group": "dxcommon",
   "signature": "HRESULT GetBuffer(UINT buffer, REFIID riid, void** surface);",
   "summary": "SwapChain が所有する BackBuffer Resource を取得します。DX11 では ID3D11Texture2D、DX12 では ID3D12Resource として受け取ります。",
   "params": [
    [
     "buffer",
     "取得する BackBuffer index。DX11 の教材では 0、DX12 では 0 ～ BufferCount-1 を順に取得します。"
    ],
    [
     "riid",
     "受け取りたい Interface の IID。DX11 は ID3D11Texture2D、DX12 は ID3D12Resource。IID_PPV_ARGS を使います。"
    ],
    [
     "surface",
     "要求した Interface pointer の受け取り先。ComPtr::GetAddressOf() と IID_PPV_ARGS を組み合わせます。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "SwapChain 作成後、BackBuffer の RTV を作る前。",
   "example": "swapChain->GetBuffer(index, IID_PPV_ARGS(backBuffer.GetAddressOf()));",
   "tips": []
  },
  {
   "name": "ID3D11Device::CreateTexture2D",
   "group": "dx11",
   "signature": "HRESULT CreateTexture2D(const D3D11_TEXTURE2D_DESC* desc, const D3D11_SUBRESOURCE_DATA* initialData, ID3D11Texture2D** texture);",
   "summary": "2D Texture Resource を作成します。PNG、Depth、Offscreen RenderTarget で使用します。",
   "params": [
    [
     "desc",
     "Width / Height / Format / BindFlags / Usage 等。"
    ],
    [
     "initialData",
     "初期 pixel data。PNG Texture は指定、RenderTarget/Depth は nullptr。"
    ],
    [
     "texture",
     "作成された Texture。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "各 Texture Resource 作成時。",
   "example": "device->CreateTexture2D(&desc, &data, texture.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "Texture本体を作ります。『画像Texture』『Depth Texture』『Offscreen RenderTarget』は同じTexture2DでもDescの用途が違います。",
    "pre": "Format、Usage、BindFlags、初期dataの組合せを用途に合わせます。",
    "fail": "BGRA pixelへRGBA formatを指定する、IMMUTABLEなのにinitialDataがない、RenderTarget/SRV両方使うのにBindFlagsが片方だけ、などが典型です。",
    "deep": "Resource本体とViewを分けて考えるのがDX11の核心です。同じTexture2DにRTVとSRVを作れるのは、Resourceが両方のBindFlagsを持つ場合です。"
   }
  },
  {
   "name": "ID3D11Device::CreateRenderTargetView",
   "group": "dx11",
   "signature": "HRESULT CreateRenderTargetView(ID3D11Resource* resource, const D3D11_RENDER_TARGET_VIEW_DESC* desc, ID3D11RenderTargetView** rtv);",
   "summary": "Resource を Output Merger の描画先として参照する View を作ります。",
   "params": [
    [
     "resource",
     "BackBuffer または D3D11_BIND_RENDER_TARGET を持つ Texture。"
    ],
    [
     "desc",
     "nullptr なら Resource から既定 View を推論。"
    ],
    [
     "rtv",
     "RTV 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "BackBuffer / Offscreen 作成後。",
   "example": "device->CreateRenderTargetView(texture.Get(), nullptr, rtv.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "Textureを『Pixelを書き込む先』として見るためのViewを作ります。Textureそのものを複製するわけではありません。",
    "pre": "ResourceがRENDER_TARGET bindを許可し、View format/dimensionがResourceと互換である必要があります。",
    "fail": "BindFlags不足、format不一致、MSAA dimension不一致などで失敗します。",
    "deep": "ViewはResourceの解釈です。Typeless Resourceを異なるtyped Viewで読む高度な使い方もありますが、教材では同一formatの基本形に限定しています。"
   }
  },
  {
   "name": "ID3D11Device::CreateShaderResourceView",
   "group": "dx11",
   "signature": "HRESULT CreateShaderResourceView(ID3D11Resource* resource, const D3D11_SHADER_RESOURCE_VIEW_DESC* desc, ID3D11ShaderResourceView** srv);",
   "summary": "Texture を Shader から sample するための View を作ります。",
   "params": [
    [
     "resource",
     "D3D11_BIND_SHADER_RESOURCE を持つ Resource。"
    ],
    [
     "desc",
     "nullptr なら既定 View。"
    ],
    [
     "srv",
     "SRV 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "PNG / Offscreen Texture 作成後。",
   "example": "device->CreateShaderResourceView(texture.Get(), nullptr, srv.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "TextureをShaderから読むためのViewです。HLSLのTexture2D register(t#)へbindするのはこのSRVです。",
    "pre": "ResourceにSHADER_RESOURCE BindFlagがあり、View formatが互換である必要があります。",
    "fail": "Offscreen TextureをRTVとしてbindしたまま同じsubresourceのSRVをPSへbindするとhazardになります。",
    "deep": "DX11 Runtimeは同時read/write hazardを検出すると競合bindingをNULLへ置き換えたりDebug warningを出します。DX12ではRuntime任せではなくBarrier/state管理へ移ります。"
   }
  },
  {
   "name": "ID3D11Device::CreateDepthStencilView",
   "group": "dx11",
   "signature": "HRESULT CreateDepthStencilView(ID3D11Resource* resource, const D3D11_DEPTH_STENCIL_VIEW_DESC* desc, ID3D11DepthStencilView** dsv);",
   "summary": "Depth Texture を DepthStencil Buffer として参照する View を作ります。",
   "params": [
    [
     "resource",
     "D3D11_BIND_DEPTH_STENCIL の Texture。"
    ],
    [
     "desc",
     "nullptr で既定 DSV。"
    ],
    [
     "dsv",
     "DSV 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Depth Texture 作成後。",
   "example": "device->CreateDepthStencilView(depthTexture.Get(), nullptr, dsv.GetAddressOf());",
   "tips": []
  },
  {
   "name": "ID3D11Device::CreateBuffer",
   "group": "dx11",
   "signature": "HRESULT CreateBuffer(const D3D11_BUFFER_DESC* desc, const D3D11_SUBRESOURCE_DATA* initialData, ID3D11Buffer** buffer);",
   "summary": "Vertex / Index / Constant Buffer を作成します。BindFlags で用途が決まります。",
   "params": [
    [
     "desc",
     "ByteWidth / Usage / BindFlags / CPUAccessFlags 等。"
    ],
    [
     "initialData",
     "初期データ。VB/IB は指定、CB は nullptr でも可。"
    ],
    [
     "buffer",
     "Buffer 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Scene Resource 作成。",
   "example": "device->CreateBuffer(&desc, &initial, buffer.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "Vertex/Index/Constantの実体はすべてBufferで、BindFlagsによって役割を付けます。",
    "pre": "ByteWidth、Usage、BindFlags、CPUAccessFlagsを用途に合わせ、ConstantBufferは必要なサイズ制約を満たします。",
    "fail": "要素数をByteWidthに入れる、IMMUTABLEでinitialDataを渡さない、CPUAccessFlagsとUsageの不正組合せが典型です。",
    "deep": "Resource typeを共通化し、View/Bindで用途を分ける思想はDX12へさらに進みます。Dynamic更新が必要ならMap方式との使い分けもあります。"
   }
  },
  {
   "name": "D3DCompileFromFile",
   "group": "dxcommon",
   "signature": "HRESULT D3DCompileFromFile(LPCWSTR fileName, const D3D_SHADER_MACRO* defines, ID3DInclude* include, LPCSTR entryPoint, LPCSTR target, UINT flags1, UINT flags2, ID3DBlob** code, ID3DBlob** errors);",
   "summary": "HLSL ファイルを GPU が読み込める Shader バイトコードへコンパイルします。DX11 / DX12 両方で使用します。",
   "params": [
    [
     "fileName",
     "コンパイルする HLSL ファイルのパス。"
    ],
    [
     "defines",
     "追加するマクロ定義。今回は使わないため nullptr。"
    ],
    [
     "include",
     "HLSL の #include を通常のファイル検索で処理する D3D_COMPILE_STANDARD_FILE_INCLUDE。"
    ],
    [
     "entryPoint",
     "コンパイルを開始する HLSL 関数名。完成コードでは VSMain / PSMain。"
    ],
    [
     "target",
     "Shader Model。DX11 は vs_5_0 / ps_5_0、DX12 は vs_5_1 / ps_5_1。"
    ],
    [
     "flags1",
     "検査・Debug 情報・最適化などのコンパイル条件をまとめたフラグ。"
    ],
    [
     "flags2",
     "Effect 用フラグ。この教材では使わないため 0。"
    ],
    [
     "code",
     "コンパイル済み Shader バイトコードを受け取る ID3DBlob。"
    ],
    [
     "errors",
     "コンパイルエラーや警告メッセージを受け取る ID3DBlob。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Shader オブジェクト / PSO 作成前。",
   "example": "D3DCompileFromFile(path.c_str(), nullptr, D3D_COMPILE_STANDARD_FILE_INCLUDE, \"VSMain\", \"vs_5_0\", flags, 0, code.GetAddressOf(), errors.GetAddressOf());",
   "tips": []
  },
  {
   "name": "ID3DBlob::GetBufferPointer / GetBufferSize",
   "group": "dxcommon",
   "signature": "LPVOID GetBufferPointer();\nSIZE_T GetBufferSize();",
   "summary": "Compiled Shader や Serialized RootSignature Blob の先頭 address と byte size を取得します。DX11 / DX12 の両方で bytecode を次の API へ渡すために使います。",
   "params": [],
   "returns": "GetBufferPointer は memory pointer、GetBufferSize は byte 数。",
   "when": "CreateVertexShader / CreatePixelShader / CreateRootSignature / PSO 設定時。",
   "example": "const void* bytecode = vertexBlob->GetBufferPointer();\nconst SIZE_T bytecodeSize = vertexBlob->GetBufferSize();",
   "tips": []
  },
  {
   "name": "ID3D11Device::CreateVertexShader / CreatePixelShader",
   "group": "dx11",
   "signature": "HRESULT CreateVertexShader(const void* bytecode, SIZE_T bytecodeLength, ID3D11ClassLinkage* linkage, ID3D11VertexShader** shader);\nHRESULT CreatePixelShader(const void* bytecode, SIZE_T bytecodeLength, ID3D11ClassLinkage* linkage, ID3D11PixelShader** shader);",
   "summary": "Compiled HLSL bytecode から Shader Object を作ります。",
   "params": [
    [
     "bytecode",
     "ID3DBlob::GetBufferPointer。"
    ],
    [
     "bytecodeLength",
     "ID3DBlob::GetBufferSize。"
    ],
    [
     "linkage",
     "Dynamic class linkage を使わないため nullptr。"
    ],
    [
     "shader",
     "作成 Shader の受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "CompileShader の後。",
   "example": "device->CreateVertexShader(blob->GetBufferPointer(), blob->GetBufferSize(), nullptr, vs.GetAddressOf());",
   "tips": []
  },
  {
   "name": "ID3D11Device::CreateInputLayout",
   "group": "dx11",
   "signature": "HRESULT CreateInputLayout(const D3D11_INPUT_ELEMENT_DESC* elements, UINT count, const void* shaderBytecode, SIZE_T bytecodeLength, ID3D11InputLayout** layout);",
   "summary": "Vertex struct の memory layout と VertexShader input semantic を対応付けます。",
   "params": [
    [
     "elements",
     "POSITION / COLOR / TEXCOORD などの配列。"
    ],
    [
     "count",
     "配列要素数。"
    ],
    [
     "shaderBytecode / bytecodeLength",
     "対応する VertexShader bytecode。Semantic 検証に使われます。"
    ],
    [
     "layout",
     "InputLayout 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "VertexShader compile 後。",
   "example": "device->CreateInputLayout(elements,count,vsBlob->GetBufferPointer(),vsBlob->GetBufferSize(),layout.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "C++のVertex structのバイト配置と、VertexShaderが期待するPOSITION/COLOR/TEXCOORDを接続します。",
    "pre": "対応するVertexShader bytecodeが必要です。Semantic名・Format・offsetをVertex structとHLSLの両方へ一致させます。",
    "fail": "offsetofを誤る、float3にR32G32_FLOATを指定する、Semantic名がShaderと違う、などで頂点が壊れます。",
    "deep": "InputLayout作成時にVS bytecodeを渡すのは、layoutとShader input signatureの互換性を検証するためです。"
   }
  },
  {
   "name": "ID3D11Device::CreateSamplerState",
   "group": "dx11",
   "signature": "HRESULT CreateSamplerState(const D3D11_SAMPLER_DESC* desc, ID3D11SamplerState** sampler);",
   "summary": "Texture sampling の Filter / Address mode を immutable な State Object として作成します。",
   "params": [
    [
     "desc",
     "Filter、AddressU/V/W、LOD 等。"
    ],
    [
     "sampler",
     "SamplerState 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Texture binding 前。",
   "example": "device->CreateSamplerState(&desc, sampler.GetAddressOf());",
   "tips": []
  },
  {
   "name": "ID3D11Device::CreateRasterizerState",
   "group": "dx11",
   "signature": "HRESULT CreateRasterizerState(const D3D11_RASTERIZER_DESC* desc, ID3D11RasterizerState** state);",
   "summary": "Cull、FillMode、DepthClip など Rasterizer の状態を作成します。",
   "params": [
    [
     "desc",
     "D3D11_RASTERIZER_DESC。"
    ],
    [
     "state",
     "RasterizerState 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Pipeline resource 作成時。",
   "example": "device->CreateRasterizerState(&desc, rasterizer.GetAddressOf());",
   "tips": []
  },
  {
   "name": "ID3D11Device::CreateDepthStencilState",
   "group": "dx11",
   "signature": "HRESULT CreateDepthStencilState(const D3D11_DEPTH_STENCIL_DESC* desc, ID3D11DepthStencilState** state);",
   "summary": "Depth test / Depth write / Stencil の挙動を State Object にします。",
   "params": [
    [
     "desc",
     "DepthEnable / DepthWriteMask / DepthFunc 等。"
    ],
    [
     "state",
     "DepthStencilState 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Depth pipeline 作成時。",
   "example": "device->CreateDepthStencilState(&desc, state.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "Depth testを行うか、通過した値をDepthBufferへ書くか、比較条件を何にするかを1つのState Objectへまとめます。",
    "pre": "Depth Texture/DSVとは別物です。Resource/Viewを作っただけではDepth testの規則は決まりません。",
    "fail": "DepthEnableはTRUEなのにDSVをbindしていない、透明物でDepthWriteを止め忘れる、DepthFuncを逆にする、が典型です。",
    "deep": "『Depth Resource』『DSV』『DepthStencilState』の3つを分けて考えるとDX11が理解しやすくなります。DX12ではDepthStencilStateがPSOへ取り込まれます。"
   }
  },
  {
   "name": "ID3D11Device::CreateBlendState",
   "group": "dx11",
   "signature": "HRESULT CreateBlendState(const D3D11_BLEND_DESC* desc, ID3D11BlendState** state);",
   "summary": "RenderTarget への color blending を State Object にします。",
   "params": [
    [
     "desc",
     "BlendEnable、SrcBlend、DestBlend、BlendOp、WriteMask 等。"
    ],
    [
     "state",
     "BlendState 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Opaque / AlphaBlend state 作成時。",
   "example": "device->CreateBlendState(&desc, alphaBlend.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "PixelShaderが出した新しい色とRenderTargetに既にある色を、どの係数で混ぜるか決めるState Objectです。",
    "pre": "BlendEnableだけでなくSrcBlend、DestBlend、BlendOp、WriteMaskを揃えます。",
    "fail": "alpha値を設定しただけで透明になると思う、premultiplied alpha画像に通常alpha設定を使う、Stateを戻し忘れる、が典型です。",
    "deep": "DX9ではRenderStateの集合、DX11では独立State Object、DX12ではPSOの一部です。同じ機能が世代ごとにどこへ移動したか比較しやすい項目です。"
   }
  },
  {
   "name": "ID3D11DeviceContext::UpdateSubresource",
   "group": "dx11",
   "signature": "void UpdateSubresource(ID3D11Resource* dst, UINT subresource, const D3D11_BOX* box, const void* srcData, UINT srcRowPitch, UINT srcDepthPitch);",
   "summary": "CPU memory から GPU Resource の内容を更新します。今回 ConstantBuffer 更新に使用します。",
   "params": [
    [
     "dst",
     "更新対象 Resource。"
    ],
    [
     "subresource",
     "Buffer は 0。"
    ],
    [
     "box",
     "Buffer 全体なら nullptr。"
    ],
    [
     "srcData",
     "コピー元 struct。"
    ],
    [
     "srcRowPitch / srcDepthPitch",
     "Buffer では 0。"
    ]
   ],
   "returns": "なし。",
   "when": "DrawObject の直前。",
   "example": "context->UpdateSubresource(constantBuffer.Get(),0,nullptr,&constants,0,0);",
   "tips": [],
   "notes": {
    "beginner": "CPU側の小さなデータを既存Resourceへ更新します。今回ConstantBufferへWorldViewProjectionを書き直すために使います。",
    "pre": "destination ResourceのUsageと更新方法がUpdateSubresourceに適している必要があります。CPU sourceは呼び出し中に有効であれば構いません。",
    "fail": "struct size/layoutがHLSL側と合わない、row/depth pitchをTextureとBufferで混同する、頻繁な大容量更新へ無批判に使う、が典型です。",
    "deep": "更新頻度やサイズによってDynamic+Map、ring buffer、staging等を選ぶ余地があります。教材ではAPIの意味を明確にするため小さなConstantBuffer更新へ限定します。"
   }
  },
  {
   "name": "ID3D11DeviceContext::IASetVertexBuffers",
   "group": "dx11",
   "signature": "void IASetVertexBuffers(UINT startSlot, UINT numBuffers, ID3D11Buffer* const* buffers, const UINT* strides, const UINT* offsets);",
   "summary": "Input Assembler に VertexBuffer と stride / offset を設定します。",
   "params": [
    [
     "startSlot",
     "0。"
    ],
    [
     "numBuffers",
     "1。"
    ],
    [
     "buffers",
     "VertexBuffer pointer 配列。"
    ],
    [
     "strides",
     "1 vertex の byte size。"
    ],
    [
     "offsets",
     "Buffer 先頭 offset。"
    ]
   ],
   "returns": "なし。",
   "when": "Draw 前。",
   "example": "context->IASetVertexBuffers(0,1,vb.GetAddressOf(),&stride,&offset);",
   "tips": []
  },
  {
   "name": "ID3D11DeviceContext::IASetIndexBuffer",
   "group": "dx11",
   "signature": "void IASetIndexBuffer(ID3D11Buffer* buffer, DXGI_FORMAT format, UINT offset);",
   "summary": "IndexBuffer と index format を設定します。",
   "params": [
    [
     "buffer",
     "IndexBuffer。"
    ],
    [
     "format",
     "DXGI_FORMAT_R16_UINT。"
    ],
    [
     "offset",
     "byte offset。0。"
    ]
   ],
   "returns": "なし。",
   "when": "DrawIndexed 前。",
   "example": "context->IASetIndexBuffer(ib.Get(), DXGI_FORMAT_R16_UINT, 0);",
   "tips": []
  },
  {
   "name": "ID3D11DeviceContext::IASetInputLayout / IASetPrimitiveTopology",
   "group": "dx11",
   "signature": "void IASetInputLayout(ID3D11InputLayout* layout);\nvoid IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY topology);",
   "summary": "InputLayout と primitive topology を Input Assembler に設定します。",
   "params": [
    [
     "layout",
     "CreateInputLayout で作成した Object。"
    ],
    [
     "topology",
     "D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST。"
    ]
   ],
   "returns": "なし。",
   "when": "Draw 前の IA setup。",
   "example": "context->IASetInputLayout(layout.Get());\ncontext->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);",
   "tips": []
  },
  {
   "name": "ID3D11DeviceContext::VSSetShader / PSSetShader",
   "group": "dx11",
   "signature": "void VSSetShader(ID3D11VertexShader* shader, ID3D11ClassInstance* const* instances, UINT count);\nvoid PSSetShader(ID3D11PixelShader* shader, ID3D11ClassInstance* const* instances, UINT count);",
   "summary": "使用する VertexShader / PixelShader を Pipeline Stage に設定します。",
   "params": [
    [
     "shader",
     "作成済み Shader Object。"
    ],
    [
     "instances",
     "Dynamic linkage 未使用なので nullptr。"
    ],
    [
     "count",
     "0。"
    ]
   ],
   "returns": "なし。",
   "when": "Draw 前。",
   "example": "context->VSSetShader(vs.Get(),nullptr,0); context->PSSetShader(ps.Get(),nullptr,0);",
   "tips": []
  },
  {
   "name": "ID3D11DeviceContext::VSSetConstantBuffers",
   "group": "dx11",
   "signature": "void VSSetConstantBuffers(UINT startSlot, UINT numBuffers, ID3D11Buffer* const* buffers);",
   "summary": "ConstantBuffer を VertexShader の b-register slot に設定します。",
   "params": [
    [
     "startSlot",
     "HLSL register(b0) なら 0。"
    ],
    [
     "numBuffers",
     "1。"
    ],
    [
     "buffers",
     "ConstantBuffer pointer 配列。"
    ]
   ],
   "returns": "なし。",
   "when": "VertexShader binding 時。",
   "example": "context->VSSetConstantBuffers(0,1,constantBuffer.GetAddressOf());",
   "tips": []
  },
  {
   "name": "ID3D11DeviceContext::PSSetShaderResources / PSSetSamplers",
   "group": "dx11",
   "signature": "void PSSetShaderResources(UINT startSlot, UINT numViews, ID3D11ShaderResourceView* const* views);\nvoid PSSetSamplers(UINT startSlot, UINT numSamplers, ID3D11SamplerState* const* samplers);",
   "summary": "PixelShader の Texture SRV と Sampler slot を設定します。",
   "params": [
    [
     "startSlot",
     "register(t0) / register(s0) なら 0。"
    ],
    [
     "numViews / numSamplers",
     "設定数。通常 1。"
    ],
    [
     "views / samplers",
     "SRV / SamplerState の pointer 配列。"
    ]
   ],
   "returns": "なし。",
   "when": "Texture sample を行う Draw 前。",
   "example": "context->PSSetShaderResources(0,1,srv.GetAddressOf()); context->PSSetSamplers(0,1,sampler.GetAddressOf());",
   "tips": [],
   "notes": {
    "beginner": "HLSLのt0/s0などへTextureのSRVとSamplerStateを接続します。TextureとSamplerは別々にbindします。",
    "pre": "Shader側register番号とstartSlotを一致させ、SRV対象Resourceが現在出力先として使われていないことを確認します。",
    "fail": "RTVとしてbind中の同じTextureをSRVへbindする、slot番号を間違える、Samplerをbindし忘れる、が典型です。",
    "deep": "DX11 Runtimeはbinding hazardをある程度追跡しますが、不要なstate changeやhazard解消のコストは残ります。DX12ではDescriptorTableとstate trackingへ責務が移ります。"
   }
  },
  {
   "name": "ID3D11DeviceContext::OMSetRenderTargets",
   "group": "dx11",
   "signature": "void OMSetRenderTargets(UINT numViews, ID3D11RenderTargetView* const* rtvs, ID3D11DepthStencilView* dsv);",
   "summary": "Output Merger の color target と depth target を設定します。",
   "params": [
    [
     "numViews",
     "RTV 数。今回 1。"
    ],
    [
     "rtvs",
     "RTV pointer 配列。"
    ],
    [
     "dsv",
     "Scene Pass は DSV、Present Pass は nullptr。"
    ]
   ],
   "returns": "なし。",
   "when": "各 Pass 開始時。",
   "example": "context->OMSetRenderTargets(1, sceneRTV.GetAddressOf(), depthDSV.Get());",
   "tips": [],
   "notes": {
    "beginner": "これからPixelShaderの出力色とDepthを書き込む先を設定します。",
    "pre": "RTV/DSVのsize、sample count、用途が互換である必要があります。",
    "fail": "Scene用SRVを解除せず同じResourceをRTVへ戻す、DepthとColorのsample設定が合わない、などが典型です。",
    "deep": "Output MergerはBlend/Depth/RenderTargetが交わるstageです。DX12でも概念は残りますが、PSOとDescriptorに責務が分散します。"
   }
  },
  {
   "name": "ID3D11DeviceContext::RSSetViewports / RSSetState",
   "group": "dx11",
   "signature": "void RSSetViewports(UINT count, const D3D11_VIEWPORT* viewports);\nvoid RSSetState(ID3D11RasterizerState* state);",
   "summary": "Rasterizer Stage に Viewport と RasterizerState を設定します。",
   "params": [
    [
     "count",
     "Viewport 数。今回 1。"
    ],
    [
     "viewports",
     "D3D11_VIEWPORT 配列。"
    ],
    [
     "state",
     "CreateRasterizerState で作成した State。nullptr で default。"
    ]
   ],
   "returns": "なし。",
   "when": "Draw 前。",
   "example": "context->RSSetViewports(1,&viewport); context->RSSetState(rasterizer.Get());",
   "tips": []
  },
  {
   "name": "ID3D11DeviceContext::OMSetDepthStencilState",
   "group": "dx11",
   "signature": "void OMSetDepthStencilState(ID3D11DepthStencilState* state, UINT stencilRef);",
   "summary": "Depth / Stencil state を Output Merger に設定します。",
   "params": [
    [
     "state",
     "DepthStencilState。nullptr は default。"
    ],
    [
     "stencilRef",
     "Stencil reference。今回 0。"
    ]
   ],
   "returns": "なし。",
   "when": "Scene / Present pass で Depth 有無を切り替えるとき。",
   "example": "context->OMSetDepthStencilState(depthState.Get(),0);",
   "tips": []
  },
  {
   "name": "ID3D11DeviceContext::OMSetBlendState",
   "group": "dx11",
   "signature": "void OMSetBlendState(ID3D11BlendState* state, const FLOAT blendFactor[4], UINT sampleMask);",
   "summary": "BlendState を Output Merger に設定します。",
   "params": [
    [
     "state",
     "Opaque は nullptr/default、透明描画は AlphaBlend State。"
    ],
    [
     "blendFactor",
     "D3D11_BLEND_BLEND_FACTOR を使わない場合 nullptr。"
    ],
    [
     "sampleMask",
     "通常 0xffffffff。"
    ]
   ],
   "returns": "なし。",
   "when": "半透明 Panel の前後。",
   "example": "context->OMSetBlendState(alphaBlend.Get(), nullptr, 0xffffffff);",
   "tips": []
  },
  {
   "name": "ID3D11DeviceContext::ClearRenderTargetView / ClearDepthStencilView",
   "group": "dx11",
   "signature": "void ClearRenderTargetView(ID3D11RenderTargetView* rtv, const FLOAT color[4]);\nvoid ClearDepthStencilView(ID3D11DepthStencilView* dsv, UINT flags, FLOAT depth, UINT8 stencil);",
   "summary": "Color / Depth target を初期値にクリアします。",
   "params": [
    [
     "rtv / dsv",
     "対象 View。"
    ],
    [
     "color",
     "RGBA float[4]。"
    ],
    [
     "flags",
     "D3D11_CLEAR_DEPTH / STENCIL。"
    ],
    [
     "depth",
     "通常 1.0f。"
    ],
    [
     "stencil",
     "通常 0。"
    ]
   ],
   "returns": "なし。",
   "when": "各 Pass 開始前。",
   "example": "context->ClearRenderTargetView(rtv.Get(), clearColor);",
   "tips": []
  },
  {
   "name": "ID3D11DeviceContext::DrawIndexed",
   "group": "dx11",
   "signature": "void DrawIndexed(UINT indexCount, UINT startIndexLocation, INT baseVertexLocation);",
   "summary": "現在 Context に設定されている Pipeline State / Resource を使って Indexed Draw を発行します。",
   "params": [
    [
     "indexCount",
     "描画 index 数。"
    ],
    [
     "startIndexLocation",
     "IndexBuffer 内の開始 index。"
    ],
    [
     "baseVertexLocation",
     "Index に加算する base vertex。今回 0。"
    ]
   ],
   "returns": "なし。",
   "when": "各 Geometry draw。",
   "example": "context->DrawIndexed(range.indexCount, range.startIndex, 0);",
   "tips": [],
   "notes": {
    "beginner": "IA/VS/PS/OMなどContextに今bindされている状態を使ってIndexed Drawを発行します。",
    "pre": "VB、IB、InputLayout、Topology、Shader、必要Resource、RenderTargetを全てbind済みにします。",
    "fail": "何か1つ未bindでもC++側は実行できるため、黒画面やDebug Layer warningになることがあります。startIndexはindex単位です。",
    "deep": "ImmediateContextはAPI call順をRuntime/Driverへ渡します。DX12ではDrawIndexedInstancedをCommandListへ記録し、あとでQueueへ提出するためsubmission境界が明示されます。"
   }
  },
  {
   "name": "CreateDXGIFactory2",
   "group": "dx12",
   "signature": "HRESULT CreateDXGIFactory2(UINT flags, REFIID riid, void** factory);",
   "summary": "DXGI Factory を作成します。Adapter / SwapChain 作成の入口です。",
   "params": [
    [
     "flags",
     "Debug 時 DXGI_CREATE_FACTORY_DEBUG、通常 0。"
    ],
    [
     "riid / factory",
     "IDXGIFactory6 などの取得先。IID_PPV_ARGS を使用。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "DX12 初期化の最初。",
   "example": "CreateDXGIFactory2(factoryFlags, IID_PPV_ARGS(factory.GetAddressOf()));",
   "tips": []
  },
  {
   "name": "D3D12CreateDevice",
   "group": "dx12",
   "signature": "HRESULT D3D12CreateDevice(IUnknown* adapter, D3D_FEATURE_LEVEL minimumLevel, REFIID riid, void** device);",
   "summary": "Direct3D 12 Device を作成します。",
   "params": [
    [
     "adapter",
     "nullptr で既定 Adapter。"
    ],
    [
     "minimumLevel",
     "最低 Feature Level。今回 D3D_FEATURE_LEVEL_11_0。"
    ],
    [
     "riid / device",
     "ID3D12Device 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Factory 作成後。",
   "example": "D3D12CreateDevice(nullptr,D3D_FEATURE_LEVEL_11_0,IID_PPV_ARGS(device.GetAddressOf()));",
   "tips": [],
   "notes": {
    "beginner": "指定したAdapterでDirect3D 12を使うためのDeviceを作ります。ResourceやPSOなど大半のGPU Object作成の入口です。",
    "pre": "Debug Layerを使う場合はDevice作成より前に有効化します。minimumLevelは必要Feature Levelの下限です。",
    "fail": "対応しないFeature Levelを要求する、Adapter選択と要求機能が合わない、Debug Layerを後から有効にしようとする、が典型です。",
    "deep": "Feature LevelはAPI versionそのものではなくGPU機能セットの段階です。Direct3D 12 APIを使いながらminimum feature levelとして11_0を要求することは矛盾ではありません。"
   }
  },
  {
   "name": "D3D12GetDebugInterface / ID3D12Debug::EnableDebugLayer",
   "group": "dx12",
   "signature": "HRESULT D3D12GetDebugInterface(REFIID riid, void** debug);\nvoid EnableDebugLayer();",
   "summary": "Debug Layer Interface を取得し、ResourceState や Descriptor 等の不正を Debug Output に報告させます。",
   "params": [
    [
     "riid / debug",
     "ID3D12Debug の取得先。"
    ]
   ],
   "returns": "取得は HRESULT、EnableDebugLayer は戻り値なし。",
   "when": "Device 作成より前。",
   "example": "ComPtr<ID3D12Debug> debug; if (SUCCEEDED(D3D12GetDebugInterface(IID_PPV_ARGS(debug.GetAddressOf())))) debug->EnableDebugLayer();",
   "tips": []
  },
  {
   "name": "ID3D12Device::CreateCommandQueue",
   "group": "dx12",
   "signature": "HRESULT CreateCommandQueue(const D3D12_COMMAND_QUEUE_DESC* desc, REFIID riid, void** queue);",
   "summary": "CommandList を GPU へ投入する Queue を作ります。",
   "params": [
    [
     "desc",
     "Type=DIRECT、Priority、Flags 等。"
    ],
    [
     "riid / queue",
     "ID3D12CommandQueue 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Device 作成後、SwapChain 作成前。",
   "example": "device->CreateCommandQueue(&desc, IID_PPV_ARGS(queue.GetAddressOf()));",
   "tips": [],
   "notes": {
    "beginner": "記録済みCommandListをGPUへ提出するQueueを作ります。Graphics描画はDIRECT Queueを使います。",
    "pre": "CommandList/Allocatorと互換のQueue typeを選びます。SwapChainはDX12ではDeviceではなくこのCommandQueueと関連付けます。",
    "fail": "COPY用ListをDIRECT以外へ誤って出す、SwapChain作成へDeviceを渡す、Queue typeの役割を混同する、が典型です。",
    "deep": "DIRECT/COMPUTE/COPY Queueを分けると非同期copyやasync computeへ発展できますが、Queue間同期にはFenceが必要です。基本編はDIRECT 1本に絞ります。"
   }
  },
  {
   "name": "IDXGIFactory2::CreateSwapChainForHwnd",
   "group": "dx12",
   "signature": "HRESULT CreateSwapChainForHwnd(IUnknown* pDevice, HWND hWnd, const DXGI_SWAP_CHAIN_DESC1* pDesc, const DXGI_SWAP_CHAIN_FULLSCREEN_DESC* pFullscreenDesc, IDXGIOutput* pRestrictToOutput, IDXGISwapChain1** ppSwapChain);",
   "summary": "CommandQueue と HWND を結び付けた SwapChain を作成します。DX12 では pDevice に Device ではなく CommandQueue を渡します。",
   "params": [
    [
     "pDevice",
     "DX12では ID3D12CommandQueue。DXGIから見るとIUnknownなのでこの名前ですが、描画Queueを渡します。"
    ],
    [
     "hWnd",
     "描画 Window。"
    ],
    [
     "pDesc",
     "Width / Height / Format / BufferCount / SwapEffect 等を持つ DXGI_SWAP_CHAIN_DESC1。"
    ],
    [
     "pFullscreenDesc",
     "Fullscreen設定。Windowedで使うため nullptr。"
    ],
    [
     "pRestrictToOutput",
     "表示先Outputを制限しないため nullptr。"
    ],
    [
     "ppSwapChain",
     "IDXGISwapChain1 の受け取り先。教材では後で IDXGISwapChain3 へ QueryInterface します。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "CommandQueue 作成後。",
   "example": "factory->CreateSwapChainForHwnd(queue.Get(), hwnd, &desc, nullptr, nullptr, swap1.GetAddressOf());",
   "tips": []
  },
  {
   "name": "IDXGIFactory::MakeWindowAssociation",
   "group": "dx12",
   "signature": "HRESULT MakeWindowAssociation(HWND hwnd, UINT flags);",
   "summary": "DXGI が Window に対して行う自動動作を制御します。",
   "params": [
    [
     "hwnd",
     "SwapChain の Window。"
    ],
    [
     "flags",
     "DXGI_MWA_NO_ALT_ENTER で Alt+Enter の自動 fullscreen 切り替えを無効化。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "SwapChain 作成後。",
   "example": "factory->MakeWindowAssociation(hwnd, DXGI_MWA_NO_ALT_ENTER);",
   "tips": []
  },
  {
   "name": "IDXGISwapChain3::GetCurrentBackBufferIndex",
   "group": "dx12",
   "signature": "UINT GetCurrentBackBufferIndex();",
   "summary": "Flip model SwapChain で現在描画すべき BackBuffer index を取得します。",
   "params": [],
   "returns": "0 ～ BufferCount-1 の index。",
   "when": "SwapChain 作成直後と Present 後。",
   "example": "m_frameIndex = swapChain->GetCurrentBackBufferIndex();",
   "tips": []
  },
  {
   "name": "ID3D12Device::CreateDescriptorHeap",
   "group": "dx12",
   "signature": "HRESULT CreateDescriptorHeap(const D3D12_DESCRIPTOR_HEAP_DESC* desc, REFIID riid, void** heap);",
   "summary": "RTV / DSV / CBV_SRV_UAV 等の Descriptor を連続配置する Heap を作成します。",
   "params": [
    [
     "desc",
     "Type、NumDescriptors、Flags。Shader から見る Heap は SHADER_VISIBLE。"
    ],
    [
     "riid / heap",
     "ID3D12DescriptorHeap 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Resource View 作成前。",
   "example": "device->CreateDescriptorHeap(&desc, IID_PPV_ARGS(heap.GetAddressOf()));",
   "tips": [],
   "notes": {
    "beginner": "DX12ではSRV/RTV/DSVなどをCOM Objectとして直接持たず、DescriptorHeapのslotへ説明情報を書きます。",
    "pre": "必要descriptor数とHeap typeを先に見積もります。Shaderから読むCBV_SRV_UAV/SAMPLER HeapだけSHADER_VISIBLEにします。",
    "fail": "Heap typeを混同する、NumDescriptors不足、CPU/GPU Handleを取り違える、increment sizeをsizeofで進める、が典型です。",
    "deep": "Descriptor allocationはDX12 Rendererで重要なサブシステムになります。実エンジンではpersistent領域とframe-local領域、free list/ring allocator等を設計します。"
   }
  },
  {
   "name": "ID3D12Device::GetDescriptorHandleIncrementSize",
   "group": "dx12",
   "signature": "UINT GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE type);",
   "summary": "DescriptorHeap 内で隣の Descriptor へ進む byte increment を取得します。CPU pointer arithmetic で sizeof を使ってはいけません。",
   "params": [
    [
     "type",
     "RTV / DSV / CBV_SRV_UAV。対象 Heap と一致させます。"
    ]
   ],
   "returns": "Descriptor 1個分の increment size。",
   "when": "Heap 作成後。",
   "example": "rtvSize = device->GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE_RTV);",
   "tips": []
  },
  {
   "name": "ID3D12Device::CreateRenderTargetView / CreateDepthStencilView / CreateShaderResourceView",
   "group": "dx12",
   "signature": "void CreateRenderTargetView(ID3D12Resource* pResource, const D3D12_RENDER_TARGET_VIEW_DESC* pDesc, D3D12_CPU_DESCRIPTOR_HANDLE DestDescriptor);\nvoid CreateDepthStencilView(ID3D12Resource* pResource, const D3D12_DEPTH_STENCIL_VIEW_DESC* pDesc, D3D12_CPU_DESCRIPTOR_HANDLE DestDescriptor);\nvoid CreateShaderResourceView(ID3D12Resource* pResource, const D3D12_SHADER_RESOURCE_VIEW_DESC* pDesc, D3D12_CPU_DESCRIPTOR_HANDLE DestDescriptor);",
   "summary": "Resource の見え方を Descriptor として指定された Heap slot に書き込みます。DX11 と違い View 自体は COM Object ではありません。",
   "params": [
    [
     "pResource",
     "Viewを作る対象Resource。今回RTVはBackBuffer/Offscreen、DSVはDepth、SRVはIcon/Offscreen Texture。"
    ],
    [
     "pDesc",
     "ViewのFormat・Dimension・Mip範囲等。Resourceから既定値を推論できるRTV/DSVではnullptrも使用します。SRVは今回明示Descを渡します。"
    ],
    [
     "DestDescriptor",
     "Descriptorを書き込むCPU Descriptor Handle。Heap typeはRTV/DSV/CBV_SRV_UAVの用途と一致させます。"
    ]
   ],
   "returns": "戻り値なし。Debug Layer が不正を報告します。",
   "when": "Resource と DescriptorHeap 作成後。",
   "example": "device->CreateRenderTargetView(resource.Get(), nullptr, rtvHandle);\ndevice->CreateDepthStencilView(depth.Get(), nullptr, dsvHandle);\ndevice->CreateShaderResourceView(texture.Get(), &srvDesc, srvHandle);",
   "tips": []
  },
  {
   "name": "ID3D12Device::CreateCommandAllocator",
   "group": "dx12",
   "signature": "HRESULT CreateCommandAllocator(D3D12_COMMAND_LIST_TYPE type, REFIID riid, void** allocator);",
   "summary": "CommandList が記録した command memory の allocator を作ります。GPU が参照中の allocator は Reset できません。",
   "params": [
    [
     "type",
     "D3D12_COMMAND_LIST_TYPE_DIRECT。"
    ],
    [
     "riid / allocator",
     "ID3D12CommandAllocator 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "CommandList 作成前。",
   "example": "device->CreateCommandAllocator(D3D12_COMMAND_LIST_TYPE_DIRECT, IID_PPV_ARGS(allocator.GetAddressOf()));",
   "tips": [],
   "notes": {
    "beginner": "CommandListが記録する命令データの保存領域です。CommandList本体と記録メモリを分けています。",
    "pre": "使用するCommandList/Queueと互換のTypeで作ります。",
    "fail": "GPUが前回のcommand memoryをまだ読んでいるのにResetすると未定義動作・Debug errorになります。",
    "deep": "複数frameを並行させる実装ではframe数分のAllocatorを持つのが基本です。Fence valueとAllocator寿命を対応付けます。"
   }
  },
  {
   "name": "ID3D12Device::CreateCommandList",
   "group": "dx12",
   "signature": "HRESULT CreateCommandList(UINT nodeMask, D3D12_COMMAND_LIST_TYPE type, ID3D12CommandAllocator* allocator, ID3D12PipelineState* initialState, REFIID riid, void** list);",
   "summary": "GPU command を記録する GraphicsCommandList を作成します。作成直後は Open 状態です。",
   "params": [
    [
     "nodeMask",
     "Single GPU なら 0。"
    ],
    [
     "type",
     "DIRECT。"
    ],
    [
     "allocator",
     "記録 memory を供給する Allocator。"
    ],
    [
     "initialState",
     "初期 PSO。nullptr 可。"
    ],
    [
     "riid / list",
     "ID3D12GraphicsCommandList。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "Allocator 作成後。",
   "example": "device->CreateCommandList(0,D3D12_COMMAND_LIST_TYPE_DIRECT,allocator.Get(),nullptr,IID_PPV_ARGS(list.GetAddressOf()));",
   "tips": [],
   "notes": {
    "beginner": "DrawやBarrierなどGPUに実行させたい命令を順番に記録するObjectです。",
    "pre": "有効なAllocatorが必要です。作成直後はOpen状態なので、初回に何も記録しないならCloseしてからframe Resetします。",
    "fail": "OpenのままExecuteしようとする、Close済みをResetせず記録する、Allocator type不一致などが典型です。",
    "deep": "CPU側でCommandListを複数Threadから並列記録できる設計がDX12の強みの一つです。Queue投入順がGPU実行順序の基礎になります。"
   }
  },
  {
   "name": "ID3D12Device::CreateFence",
   "group": "dx12",
   "signature": "HRESULT CreateFence(UINT64 initialValue, D3D12_FENCE_FLAGS flags, REFIID riid, void** fence);",
   "summary": "GPU command の完了位置を CPU から確認する Fence を作ります。",
   "params": [
    [
     "initialValue",
     "初期 completed value。通常 0。"
    ],
    [
     "flags",
     "D3D12_FENCE_FLAG_NONE。"
    ],
    [
     "riid / fence",
     "ID3D12Fence 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "同期 Object 初期化。",
   "example": "device->CreateFence(0,D3D12_FENCE_FLAG_NONE,IID_PPV_ARGS(fence.GetAddressOf()));",
   "tips": [],
   "notes": {
    "beginner": "GPUの完了位置を数値で追跡する同期Objectを作ります。FenceそのものがGPUを待たせるわけではありません。",
    "pre": "初期値を決め、Queue::Signalで進める値を単調増加させる設計にします。CPU待機にはWin32 Eventを組み合わせます。",
    "fail": "Fenceを作っただけで同期できたと思う、Signal位置が待ちたいworkより前、value管理を複数用途で衝突させる、が典型です。",
    "deep": "FenceはCPU waitだけでなくQueue間依存やresource retirementにも使えます。DX12で『寿命管理』と『同期』が同じtimeline valueへ結び付く重要な仕組みです。"
   }
  },
  {
   "name": "D3D12SerializeRootSignature",
   "group": "dx12",
   "signature": "HRESULT D3D12SerializeRootSignature(const D3D12_ROOT_SIGNATURE_DESC* desc, D3D_ROOT_SIGNATURE_VERSION version, ID3DBlob** blob, ID3DBlob** errorBlob);",
   "summary": "RootSignature description を Driver が受け取れる serialized bytecode に変換します。",
   "params": [
    [
     "desc",
     "RootParameter / StaticSampler / Flags。"
    ],
    [
     "version",
     "D3D_ROOT_SIGNATURE_VERSION_1。"
    ],
    [
     "blob",
     "Serialized data。"
    ],
    [
     "errorBlob",
     "検証失敗時の説明。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "CreateRootSignature の直前。",
   "example": "D3D12SerializeRootSignature(&desc,D3D_ROOT_SIGNATURE_VERSION_1,blob.GetAddressOf(),errors.GetAddressOf());",
   "tips": []
  },
  {
   "name": "ID3D12Device::CreateRootSignature",
   "group": "dx12",
   "signature": "HRESULT CreateRootSignature(UINT nodeMask, const void* blob, SIZE_T blobLength, REFIID riid, void** rootSignature);",
   "summary": "Shader が参照する CBV / SRV / Sampler 等の Root binding layout を作ります。",
   "params": [
    [
     "nodeMask",
     "0。"
    ],
    [
     "blob / blobLength",
     "SerializeRootSignature の出力。"
    ],
    [
     "riid / rootSignature",
     "ID3D12RootSignature。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "PSO 作成前。",
   "example": "device->CreateRootSignature(0,blob->GetBufferPointer(),blob->GetBufferSize(),IID_PPV_ARGS(root.GetAddressOf()));",
   "tips": [],
   "notes": {
    "beginner": "Shaderが必要とするCBV/SRV/Samplerを、C++側からどのRoot slotへ渡すか決める契約です。",
    "pre": "Serialize済みRootSignature blobが必要で、Shaderのregister配置と一致するlayoutにします。",
    "fail": "RootParameter indexとShader register番号を混同する、visibilityやdescriptor rangeを誤る、PSOと別RootSignatureをbindする、が典型です。",
    "deep": "RootSignatureはroot argumentのサイズ・更新頻度・descriptor indirectionに影響します。実エンジンではresource frequencyごとの設計が性能へ効きます。"
   }
  },
  {
   "name": "ID3D12Device::CreateGraphicsPipelineState",
   "group": "dx12",
   "signature": "HRESULT CreateGraphicsPipelineState(const D3D12_GRAPHICS_PIPELINE_STATE_DESC* desc, REFIID riid, void** pso);",
   "summary": "Shader、Blend、Rasterizer、Depth、InputLayout、RTV Format 等を1つの immutable PSO にまとめます。",
   "params": [
    [
     "desc",
     "RootSignature / VS / PS / BlendState / RasterizerState / DepthStencilState / InputLayout / Formats 等。"
    ],
    [
     "riid / pso",
     "ID3D12PipelineState 受け取り先。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "RootSignature / Shader compile 後。",
   "example": "device->CreateGraphicsPipelineState(&desc,IID_PPV_ARGS(pso.GetAddressOf()));",
   "tips": [],
   "notes": {
    "beginner": "Shader、Blend、Depth、Rasterizer、InputLayout、RenderTarget FormatなどDrawに必要な状態を1つへ固定します。",
    "pre": "RootSignature、Shader bytecode、RTV/DSV format等を全て整合させます。",
    "fail": "SwapChain/OffscreenのRTV FormatとPSOが違う、DepthなしPassなのに不整合DSV設定、RootSignatureとShader bindingが合わない、などが典型です。",
    "deep": "DX9/11のDraw時state validationを前倒ししやすくする設計です。実運用ではshader variant×blend×depth等でPSO数が増えるためcache戦略が必要です。"
   }
  },
  {
   "name": "ID3D12Device::CreateCommittedResource",
   "group": "dx12",
   "signature": "HRESULT CreateCommittedResource(const D3D12_HEAP_PROPERTIES* heapProps, D3D12_HEAP_FLAGS heapFlags, const D3D12_RESOURCE_DESC* desc, D3D12_RESOURCE_STATES initialState, const D3D12_CLEAR_VALUE* clearValue, REFIID riid, void** resource);",
   "summary": "Heap と Resource を一度に確保します。Buffer、Texture、Depth、RenderTarget、Upload buffer すべてで使用します。",
   "params": [
    [
     "heapProps",
     "DEFAULT / UPLOAD など Memory type。"
    ],
    [
     "heapFlags",
     "通常 NONE。"
    ],
    [
     "desc",
     "Buffer / Texture の size、Format、Flags。"
    ],
    [
     "initialState",
     "Resource 作成直後の state。COPY_DEST / GENERIC_READ / DEPTH_WRITE 等。"
    ],
    [
     "clearValue",
     "RenderTarget / Depth の optimized clear value。不要なら nullptr。"
    ],
    [
     "riid / resource",
     "ID3D12Resource。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "GPU Resource 作成時。",
   "example": "device->CreateCommittedResource(&heap,D3D12_HEAP_FLAG_NONE,&desc,state,clear,IID_PPV_ARGS(resource.GetAddressOf()));",
   "tips": [],
   "notes": {
    "beginner": "BufferやTextureのGPU Resource本体と、それを置くHeapをまとめて確保します。",
    "pre": "HeapType、ResourceDesc、InitialState、ResourceFlags、ClearValueを用途に合わせます。",
    "fail": "UPLOAD Heapに不正なstate、RenderTargetなのにALLOW_RENDER_TARGETなし、ClearValue format不一致、size/alignment不正などが典型です。",
    "deep": "Committed Resourceは1Resource=1専用allocationに近い簡単な方式です。大規模RendererではPlaced Resourceと大きなHeapを使うmemory allocatorへ発展します。"
   }
  },
  {
   "name": "ID3D12Resource::Map / Unmap",
   "group": "dx12",
   "signature": "HRESULT Map(UINT subresource, const D3D12_RANGE* readRange, void** data);\nvoid Unmap(UINT subresource, const D3D12_RANGE* writtenRange);",
   "summary": "CPU visible Resource の memory address を取得します。UploadHeap / ConstantBuffer に書くときに使用します。",
   "params": [
    [
     "subresource",
     "Buffer は 0。"
    ],
    [
     "readRange",
     "CPU が読まない場合 {0,0}。"
    ],
    [
     "data",
     "mapped pointer 受け取り先。"
    ],
    [
     "writtenRange",
     "書き込んだ範囲。nullptr で全体を示せます。"
    ]
   ],
   "returns": "Map は HRESULT、Unmap は戻り値なし。",
   "when": "Upload buffer / ConstantBuffer 作成後。",
   "example": "resource->Map(0,&noRead,&mapped); memcpy(mapped,src,size); resource->Unmap(0,nullptr);",
   "tips": [],
   "notes": {
    "beginner": "CPUから見えるResourceのmemory addressを取得します。UploadHeapやConstantBufferへ値を書くために使います。",
    "pre": "CPU-visibleなHeap typeである必要があります。readRangeはCPUが読む範囲をDriverへ伝えるhintです。",
    "fail": "DefaultHeapをMapしようとする、Texture uploadのRowPitchを無視する、GPUが読む領域をFence完了前に上書きする、が典型です。",
    "deep": "UploadHeapは長時間Mapしたまま使うpersistent mappingが一般的です。Unmapは必須のflush操作というよりmapping lifetimeを終えるAPIで、writtenRangeは最適化hintになります。"
   }
  },
  {
   "name": "ID3D12Device::GetCopyableFootprints",
   "group": "dx12",
   "signature": "void GetCopyableFootprints(const D3D12_RESOURCE_DESC* desc, UINT firstSubresource, UINT numSubresources, UINT64 baseOffset, D3D12_PLACED_SUBRESOURCE_FOOTPRINT* layouts, UINT* numRows, UINT64* rowSize, UINT64* totalBytes);",
   "summary": "Texture を Buffer から Copy するために必要な RowPitch alignment と Upload buffer size を計算します。",
   "params": [
    [
     "desc",
     "Copy destination Texture の ResourceDesc。"
    ],
    [
     "firstSubresource",
     "0。"
    ],
    [
     "numSubresources",
     "Mip 1枚なら 1。"
    ],
    [
     "baseOffset",
     "Upload buffer 内 offset。0。"
    ],
    [
     "layouts",
     "CopyTextureRegion の source.PlacedFootprint に使う layout。"
    ],
    [
     "numRows",
     "行数。"
    ],
    [
     "rowSize",
     "実データ1行の byte size。"
    ],
    [
     "totalBytes",
     "必要 Upload buffer byte 数。"
    ]
   ],
   "returns": "なし。",
   "when": "PNG Texture Upload buffer 確保前。",
   "example": "device->GetCopyableFootprints(&textureDesc,0,1,0,&footprint,&rows,&rowSize,&uploadSize);",
   "tips": [],
   "notes": {
    "beginner": "Textureは行ごとにalignment制約があるため、UploadBuffer上で何byte間隔に並べるべきかGPU用layoutを計算してもらいます。",
    "pre": "コピー先TextureのResourceDescを確定してから呼びます。",
    "fail": "sourceRowPitchとfootprint.RowPitchを同じだと思う、必要totalBytesより小さいUploadBufferを作る、が典型です。",
    "deep": "D3D12_TEXTURE_DATA_PITCH_ALIGNMENTはTexture uploadの重要制約です。APIに計算を任せることでformat/mipごとの配置条件を正しく満たせます。"
   }
  },
  {
   "name": "ID3D12GraphicsCommandList::CopyBufferRegion",
   "group": "dx12",
   "signature": "void CopyBufferRegion(ID3D12Resource* dst, UINT64 dstOffset, ID3D12Resource* src, UINT64 srcOffset, UINT64 numBytes);",
   "summary": "UploadHeap Buffer から DefaultHeap Buffer へ GPU copy command を記録します。",
   "params": [
    [
     "dst",
     "DefaultHeap Buffer。COPY_DEST state。"
    ],
    [
     "dstOffset",
     "0。"
    ],
    [
     "src",
     "UploadHeap Buffer。"
    ],
    [
     "srcOffset",
     "0。"
    ],
    [
     "numBytes",
     "コピー byte 数。"
    ]
   ],
   "returns": "なし。CommandList に command が記録されます。",
   "when": "VB/IB upload。",
   "example": "list->CopyBufferRegion(defaultBuffer.Get(),0,upload.Get(),0,byteSize);",
   "tips": []
  },
  {
   "name": "ID3D12GraphicsCommandList::CopyTextureRegion",
   "group": "dx12",
   "signature": "void CopyTextureRegion(const D3D12_TEXTURE_COPY_LOCATION* dst, UINT dstX, UINT dstY, UINT dstZ, const D3D12_TEXTURE_COPY_LOCATION* src, const D3D12_BOX* srcBox);",
   "summary": "Upload buffer の placed footprint から Texture subresource へ pixel data をコピーします。",
   "params": [
    [
     "dst",
     "Destination Texture + SUBRESOURCE_INDEX。"
    ],
    [
     "dstX/Y/Z",
     "0。"
    ],
    [
     "src",
     "Upload buffer + PLACED_FOOTPRINT。"
    ],
    [
     "srcBox",
     "nullptr で全 source。"
    ]
   ],
   "returns": "なし。",
   "when": "PNG upload。",
   "example": "list->CopyTextureRegion(&destination,0,0,0,&source,nullptr);",
   "tips": [],
   "notes": {
    "beginner": "UploadBuffer上に並べたpixelをGPU Textureのsubresourceへコピーする命令をCommandListへ記録します。",
    "pre": "destinationはCOPY_DEST state、source footprintはGetCopyableFootprintsに従って配置済みである必要があります。",
    "fail": "RowPitch alignment違反、source/destinationのFormatや寸法不整合、copy後Barrierを忘れる、が典型です。",
    "deep": "Texture copyはCPU memcpyではなくGPU copy commandです。呼び出し直後にTextureへデータが到着しているわけではなく、Queue実行とFence完了までUpload Resourceを保持します。"
   }
  },
  {
   "name": "ID3D12GraphicsCommandList::ResourceBarrier",
   "group": "dx12",
   "signature": "void ResourceBarrier(UINT numBarriers, const D3D12_RESOURCE_BARRIER* barriers);",
   "summary": "Resource の使用状態遷移を明示します。今回の中心 API です。",
   "params": [
    [
     "numBarriers",
     "Barrier 数。今回多くは 1。"
    ],
    [
     "barriers",
     "TRANSITION barrier 配列。pResource / StateBefore / StateAfter / Subresource を設定。"
    ]
   ],
   "returns": "なし。",
   "when": "COPY_DEST→PIXEL_SHADER_RESOURCE、PRESENT↔RENDER_TARGET、Offscreen の RENDER_TARGET↔PIXEL_SHADER_RESOURCE で使用。",
   "example": "auto b = TransitionBarrier(scene.Get(), D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE, D3D12_RESOURCE_STATE_RENDER_TARGET); list->ResourceBarrier(1,&b);",
   "tips": [
    "StateBefore は実際の現在 state と一致させます。",
    "Barrier を忘れると Debug Layer が state mismatch を報告します。"
   ],
   "notes": {
    "beginner": "同じResourceを『コピー先』『描画先』『Shaderから読む』『Presentする』など別用途へ切り替えるとき、その順序をGPUへ明示します。",
    "pre": "StateBeforeをアプリ側で追跡し、実際の現在stateと一致させます。Barrier自体もCommandList上の命令なのでGPU実行順の中に置きます。",
    "fail": "before/after逆、Barrier忘れ、同じResourceのstate trackingずれ、Present前にPRESENTへ戻し忘れる、が典型です。",
    "deep": "BarrierはAPI上のラベル変更だけではなく、必要なorderingやcache visibilityを成立させます。RendererのResourceStateTrackerはDX12 abstractionの中核になります。"
   }
  },
  {
   "name": "ID3D12CommandAllocator::Reset",
   "group": "dx12",
   "signature": "HRESULT Reset();",
   "summary": "Allocator 内の command memory を再利用可能な初期状態へ戻します。GPU がまだその memory を参照している間は呼べません。",
   "params": [],
   "returns": "HRESULT。",
   "when": "Fence で前回使用分の GPU 完了を確認した後、CommandList::Reset より先。",
   "example": "allocator->Reset();",
   "tips": [],
   "notes": {
    "beginner": "前回CommandListの記録に使ったcommand memoryを、新しいframeで再利用できる状態へ戻します。",
    "pre": "そのAllocatorを使ったGPU workがFenceで完了済みである必要があります。",
    "fail": "Fence待ち前にResetするのが最も危険なミスです。CommandList::Resetとは別物です。",
    "deep": "教材の毎frame WaitForGpuは安全ですがCPU/GPU並列性を潰します。FrameContext方式では各Allocatorに最後に使ったFence valueを持たせます。"
   }
  },
  {
   "name": "ID3D12GraphicsCommandList::Reset",
   "group": "dx12",
   "signature": "HRESULT Reset(ID3D12CommandAllocator* allocator, ID3D12PipelineState* initialState);",
   "summary": "Closed CommandList を再び記録可能状態にします。",
   "params": [
    [
     "allocator",
     "Reset 済み Allocator。"
    ],
    [
     "initialState",
     "初期 PSO。nullptr または Scene PSO。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "毎フレーム command recording 開始。",
   "example": "list->Reset(allocator.Get(), scenePSO.Get());",
   "tips": []
  },
  {
   "name": "ID3D12GraphicsCommandList::SetGraphicsRootSignature",
   "group": "dx12",
   "signature": "void SetGraphicsRootSignature(ID3D12RootSignature* rootSignature);",
   "summary": "Graphics Pipeline が使う RootSignature を設定します。",
   "params": [
    [
     "rootSignature",
     "CreateRootSignature で作成した Object。"
    ]
   ],
   "returns": "なし。",
   "when": "Draw command 記録前。",
   "example": "list->SetGraphicsRootSignature(rootSignature.Get());",
   "tips": []
  },
  {
   "name": "ID3D12GraphicsCommandList::SetDescriptorHeaps",
   "group": "dx12",
   "signature": "void SetDescriptorHeaps(UINT count, ID3D12DescriptorHeap* const* heaps);",
   "summary": "Shader-visible DescriptorHeap を CommandList に設定します。",
   "params": [
    [
     "count",
     "設定 Heap 数。今回 1。"
    ],
    [
     "heaps",
     "CBV_SRV_UAV / SAMPLER の shader-visible heap pointer 配列。"
    ]
   ],
   "returns": "なし。",
   "when": "DescriptorTable を設定する前。",
   "example": "ID3D12DescriptorHeap* heaps[]{srvHeap.Get()}; list->SetDescriptorHeaps(1,heaps);",
   "tips": [],
   "notes": {
    "beginner": "Shaderから参照するDescriptorが入ったGPU-visible Heapを、これから使うHeapとしてCommandListへ設定します。",
    "pre": "HeapがSHADER_VISIBLEで、DescriptorTableを設定する前にbindしておきます。",
    "fail": "CPU-only RTV Heapを渡す、Heapを切り替えた後に古いGPU Handleを使う、DescriptorTable設定を忘れる、が典型です。",
    "deep": "Heap切替は軽視できないため、実Rendererでは大きなshader-visible heapを使い、頻繁な切替を避ける設計が一般的です。"
   }
  },
  {
   "name": "ID3D12GraphicsCommandList::SetGraphicsRootDescriptorTable",
   "group": "dx12",
   "signature": "void SetGraphicsRootDescriptorTable(UINT rootParameterIndex, D3D12_GPU_DESCRIPTOR_HANDLE baseDescriptor);",
   "summary": "RootSignature の DescriptorTable parameter に GPU Descriptor Handle を設定します。",
   "params": [
    [
     "rootParameterIndex",
     "RootSignature で定義した parameter index。"
    ],
    [
     "baseDescriptor",
     "Table 先頭 Descriptor の GPU Handle。"
    ]
   ],
   "returns": "なし。",
   "when": "SRV bind。",
   "example": "list->SetGraphicsRootDescriptorTable(1, textureGpuHandle);",
   "tips": [],
   "notes": {
    "beginner": "RootSignatureのDescriptorTable slotへ、Heap内のどのDescriptorから読むかGPU Handleで指定します。",
    "pre": "対応HeapをSetDescriptorHeaps済みで、RootSignatureのparameter indexとrangeがShader registerへ対応している必要があります。",
    "fail": "CPU Handleを渡す、RootParameter indexをt0の0と取り違える、Heap開始からのoffset計算を誤る、が典型です。",
    "deep": "DescriptorTableは複数Descriptorを1つのRoot Parameterから参照できます。Texture数が増えたとき、RootSignatureを増やさずtable内indexで管理できます。"
   }
  },
  {
   "name": "ID3D12GraphicsCommandList::SetGraphicsRootConstantBufferView",
   "group": "dx12",
   "signature": "void SetGraphicsRootConstantBufferView(UINT rootParameterIndex, D3D12_GPU_VIRTUAL_ADDRESS bufferLocation);",
   "summary": "Root CBV parameter に ConstantBuffer の GPU Virtual Address を直接設定します。",
   "params": [
    [
     "rootParameterIndex",
     "CBV root parameter index。"
    ],
    [
     "bufferLocation",
     "256 byte aligned ConstantBuffer address。"
    ]
   ],
   "returns": "なし。",
   "when": "Object Draw 前。",
   "example": "list->SetGraphicsRootConstantBufferView(0, cb->GetGPUVirtualAddress() + offset);",
   "tips": [],
   "notes": {
    "beginner": "RootSignatureのCBV slotへConstantBufferのGPU virtual addressを直接渡します。",
    "pre": "addressは256-byte alignmentを満たし、GPU実行中もResourceと内容が有効である必要があります。",
    "fail": "256-byte境界でないoffset、RootParameter indexの誤り、GPUが読む前に同じslotを上書きする、が典型です。",
    "deep": "Root CBVはDescriptorHeapを経由しないため小数の頻繁更新Resourceに便利ですが、RootSignatureのroot costを消費します。頻度に応じてRoot DescriptorとDescriptorTableを使い分けます。"
   }
  },
  {
   "name": "ID3D12GraphicsCommandList::SetPipelineState",
   "group": "dx12",
   "signature": "void SetPipelineState(ID3D12PipelineState* pso);",
   "summary": "使用 PSO を切り替えます。Opaque / AlphaBlend / Present の状態一式を変更します。",
   "params": [
    [
     "pso",
     "CreateGraphicsPipelineState で作成した PSO。"
    ]
   ],
   "returns": "なし。",
   "when": "Pass / Material state 切替時。",
   "example": "list->SetPipelineState(alphaBlendPSO.Get());",
   "tips": []
  },
  {
   "name": "ID3D12GraphicsCommandList::RSSetViewports / RSSetScissorRects",
   "group": "dx12",
   "signature": "void RSSetViewports(UINT count, const D3D12_VIEWPORT* viewports);\nvoid RSSetScissorRects(UINT count, const D3D12_RECT* rects);",
   "summary": "Rasterizer に Viewport と Scissor Rect を設定します。",
   "params": [
    [
     "count",
     "設定数。今回 1。"
    ],
    [
     "viewports",
     "TopLeftX/Y、Width/Height、MinDepth/MaxDepth。"
    ],
    [
     "rects",
     "描画を許可する pixel rectangle。"
    ]
   ],
   "returns": "なし。",
   "when": "Draw command 記録前。",
   "example": "list->RSSetViewports(1, &m_viewport);\nlist->RSSetScissorRects(1, &m_scissorRect);",
   "tips": []
  },
  {
   "name": "ID3D12GraphicsCommandList::OMSetRenderTargets",
   "group": "dx12",
   "signature": "void OMSetRenderTargets(UINT numRTVs, const D3D12_CPU_DESCRIPTOR_HANDLE* rtvs, BOOL singleRange, const D3D12_CPU_DESCRIPTOR_HANDLE* dsv);",
   "summary": "現在の color / depth output Descriptor を設定します。",
   "params": [
    [
     "numRTVs",
     "RTV 数。1。"
    ],
    [
     "rtvs",
     "CPU RTV Descriptor Handle。"
    ],
    [
     "singleRange",
     "Descriptor が連続 Range か。1枚なので FALSE で問題ありません。"
    ],
    [
     "dsv",
     "Scene Pass は DSV、Present Pass は nullptr。"
    ]
   ],
   "returns": "なし。",
   "when": "各 Pass で Barrier 後。",
   "example": "list->OMSetRenderTargets(1,&sceneRtv,FALSE,&dsv);",
   "tips": []
  },
  {
   "name": "ID3D12GraphicsCommandList::ClearRenderTargetView / ClearDepthStencilView",
   "group": "dx12",
   "signature": "void ClearRenderTargetView(D3D12_CPU_DESCRIPTOR_HANDLE rtv, const FLOAT color[4], UINT rectCount, const D3D12_RECT* rects);\nvoid ClearDepthStencilView(D3D12_CPU_DESCRIPTOR_HANDLE dsv, D3D12_CLEAR_FLAGS flags, FLOAT depth, UINT8 stencil, UINT rectCount, const D3D12_RECT* rects);",
   "summary": "RTV / DSV Descriptor が指す Resource を Clear します。",
   "params": [
    [
     "rtv / dsv",
     "CPU Descriptor Handle。"
    ],
    [
     "color",
     "RGBA float[4]。"
    ],
    [
     "rectCount / rects",
     "0 / nullptr で全体。"
    ],
    [
     "flags",
     "D3D12_CLEAR_FLAG_DEPTH 等。"
    ],
    [
     "depth / stencil",
     "通常 1.0f / 0。"
    ]
   ],
   "returns": "なし。",
   "when": "Pass 開始時。",
   "example": "list->ClearRenderTargetView(rtv, clearColor, 0, nullptr);",
   "tips": []
  },
  {
   "name": "ID3D12GraphicsCommandList::IASetVertexBuffers / IASetIndexBuffer",
   "group": "dx12",
   "signature": "void IASetVertexBuffers(UINT startSlot, UINT numViews, const D3D12_VERTEX_BUFFER_VIEW* views);\nvoid IASetIndexBuffer(const D3D12_INDEX_BUFFER_VIEW* view);",
   "summary": "Input Assembler に Resource そのものではなく Buffer View struct を設定します。",
   "params": [
    [
     "startSlot",
     "0。"
    ],
    [
     "numViews",
     "1。"
    ],
    [
     "views",
     "GPU Virtual Address / Size / Stride を持つ VBV。"
    ],
    [
     "view",
     "GPU Virtual Address / Size / Format を持つ IBV。"
    ]
   ],
   "returns": "なし。",
   "when": "Draw 前。",
   "example": "list->IASetVertexBuffers(0,1,&vbv); list->IASetIndexBuffer(&ibv);",
   "tips": []
  },
  {
   "name": "ID3D12GraphicsCommandList::IASetPrimitiveTopology",
   "group": "dx12",
   "signature": "void IASetPrimitiveTopology(D3D12_PRIMITIVE_TOPOLOGY topology);",
   "summary": "Primitive topology を設定します。",
   "params": [
    [
     "topology",
     "D3D_PRIMITIVE_TOPOLOGY_TRIANGLELIST。"
    ]
   ],
   "returns": "なし。",
   "when": "Draw 前。",
   "example": "list->IASetPrimitiveTopology(D3D_PRIMITIVE_TOPOLOGY_TRIANGLELIST);",
   "tips": []
  },
  {
   "name": "ID3D12GraphicsCommandList::DrawIndexedInstanced",
   "group": "dx12",
   "signature": "void DrawIndexedInstanced(UINT indexCountPerInstance, UINT instanceCount, UINT startIndexLocation, INT baseVertexLocation, UINT startInstanceLocation);",
   "summary": "現在の PSO / Root binding / IA / OM state で Indexed Draw を command list に記録します。",
   "params": [
    [
     "indexCountPerInstance",
     "1 instance あたり index 数。"
    ],
    [
     "instanceCount",
     "今回は 1。"
    ],
    [
     "startIndexLocation",
     "IndexBuffer 内の開始 index。"
    ],
    [
     "baseVertexLocation",
     "base vertex。0。"
    ],
    [
     "startInstanceLocation",
     "Instance ID の開始値。0。"
    ]
   ],
   "returns": "なし。",
   "when": "Geometry draw。",
   "example": "list->DrawIndexedInstanced(range.indexCount,1,range.startIndex,0,0);",
   "tips": [],
   "notes": {
    "beginner": "現在CommandListへ設定済みのPSO、Root binding、VBV/IBV、RenderTargetを使うDraw命令を記録します。今回はinstanceCount=1です。",
    "pre": "必要なstateとbindingを全て先に設定し、対象RenderTargetをRENDER_TARGET stateへ遷移しておきます。",
    "fail": "PSOやRootSignature不整合、IBV Format違い、indexCount/startIndex誤り、Descriptor未設定などがDebug Layerで報告されます。",
    "deep": "DX11のDrawIndexedと見た目は似ていますが、DX12では即時GPU実行ではなくCommandListへの記録です。Instancingへ拡張する場合はinstanceCountとinstance data入力を増やします。"
   }
  },
  {
   "name": "ID3D12GraphicsCommandList::Close",
   "group": "dx12",
   "signature": "HRESULT Close();",
   "summary": "Command recording を終了し、Queue に Execute できる状態にします。",
   "params": [],
   "returns": "HRESULT。",
   "when": "ExecuteCommandLists の直前。",
   "example": "list->Close();",
   "tips": []
  },
  {
   "name": "ID3D12CommandQueue::ExecuteCommandLists",
   "group": "dx12",
   "signature": "void ExecuteCommandLists(UINT count, ID3D12CommandList* const* lists);",
   "summary": "Closed CommandList を GPU Queue に投入します。非同期で戻ります。",
   "params": [
    [
     "count",
     "CommandList 数。今回 1。"
    ],
    [
     "lists",
     "ID3D12CommandList* 配列。"
    ]
   ],
   "returns": "なし。CPU は GPU 完了を待ちません。",
   "when": "CommandList::Close 後。",
   "example": "ID3D12CommandList* lists[]{commandList.Get()}; queue->ExecuteCommandLists(1,lists);",
   "tips": [],
   "notes": {
    "beginner": "記録済みCommandListをGPUの実行列へ積みます。呼び出しが戻ってもGPU処理は通常まだ終わっていません。",
    "pre": "全CommandListがClose済みで、参照するResource/Descriptor/command memoryが実行完了まで生存する必要があります。",
    "fail": "Upload ResourceやDescriptorを直後に破棄/上書きする、Open listを渡す、AllocatorをすぐResetする、が典型です。",
    "deep": "CPU submissionとGPU completionを分離して考える重要APIです。SignalをQueue上に置くことで、その前までのwork完了点をFence valueへ対応付けられます。"
   }
  },
  {
   "name": "IDXGISwapChain::Present",
   "group": "dxcommon",
   "signature": "HRESULT Present(UINT syncInterval, UINT flags);",
   "summary": "描画済み BackBuffer を表示側へ提示します。DX11 / DX12 の両方で使用します。",
   "params": [
    [
     "syncInterval",
     "0 は垂直同期を待たず、1 は通常 1 refresh 間隔で提示します。2以上は複数 refresh 間隔。利用可能な flags や tearing 条件と組み合わせ制約があります。"
    ],
    [
     "flags",
     "Present 動作を変える DXGI_PRESENT_* flag。今回 0。"
    ]
   ],
   "returns": "HRESULT。Device removed / reset 等の異常もここで表面化する場合があります。",
   "when": "1 frame の最後。DX12 では対象 BackBuffer を D3D12_RESOURCE_STATE_PRESENT へ戻してから呼びます。",
   "example": "ThrowIfFailed(swapChain->Present(1, 0), \"Present failed.\");",
   "tips": [],
   "notes": {
    "beginner": "描き終わったBackBufferを表示側へ渡して次のframeへ進みます。",
    "pre": "DX12では対象BackBufferをPRESENT stateへ戻しておきます。DX11ではRuntimeがResource stateを明示させません。",
    "fail": "DX12でstate戻し忘れ、device removedを無視、syncInterval/flagsの不正組合せなどが問題になります。",
    "deep": "PresentはGPU描画そのものではなくpresentation queueとの境界です。VSync、tearing、latency、frame pacingの設計はここから発展します。"
   }
  },
  {
   "name": "ID3D12CommandQueue::Signal",
   "group": "dx12",
   "signature": "HRESULT Signal(ID3D12Fence* fence, UINT64 value);",
   "summary": "Queue 上で、それ以前の command が完了したら Fence を指定値へ進める command を追加します。",
   "params": [
    [
     "fence",
     "対象 Fence。"
    ],
    [
     "value",
     "単調増加させる signal value。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "ExecuteCommandLists 後の GPU 完了追跡。",
   "example": "queue->Signal(fence.Get(), ++fenceValue);",
   "tips": [],
   "notes": {
    "beginner": "Queue上で『ここまでGPUが終わったらFenceをこの番号にする』という目印を置きます。",
    "pre": "Fence valueは用途ごとに単調増加させ、待ちたいworkの後にSignalをenqueueします。",
    "fail": "CPU側で値を書き換えたつもりになる、どのAllocator/Resourceがどのvalueに対応するか管理しない、が典型です。",
    "deep": "Fenceは単なるWait用ではなく、Resource retirement、descriptor再利用、frame pacing、複数Queue同期にも使われるGPU timeline primitiveです。"
   }
  },
  {
   "name": "ID3D12Fence::GetCompletedValue",
   "group": "dx12",
   "signature": "UINT64 GetCompletedValue();",
   "summary": "GPU が完了済みの Fence value を CPU から読みます。",
   "params": [],
   "returns": "現在完了済みの Fence value。Device removed 時 UINT64_MAX の場合があります。",
   "when": "CPU が待つ必要があるか判断するとき。",
   "example": "if (fence->GetCompletedValue() < value) { ... }",
   "tips": [],
   "notes": {
    "beginner": "GPUがFenceのどの番号まで処理済みかCPUから確認します。",
    "pre": "比較するtarget valueが、以前Queue::Signalした値である必要があります。",
    "fail": "Signalしていない値を待つ、completed valueをframe番号そのものと混同する、UINT64_MAXのdevice removedケースを無視する、が典型です。",
    "deep": "pollingし続けるより、未完了ならSetEventOnCompletionでEvent待ちへ移る方がCPUを消費しません。実エンジンではresource retirement queueの判定にも使います。"
   }
  },
  {
   "name": "ID3D12Fence::SetEventOnCompletion",
   "group": "dx12",
   "signature": "HRESULT SetEventOnCompletion(UINT64 value, HANDLE event);",
   "summary": "Fence が指定値へ到達したとき Win32 Event を signal 状態にします。",
   "params": [
    [
     "value",
     "待ちたい Fence value。"
    ],
    [
     "event",
     "CreateEventW で作った HANDLE。"
    ]
   ],
   "returns": "HRESULT。",
   "when": "WaitForSingleObject の前。",
   "example": "fence->SetEventOnCompletion(value, fenceEvent);",
   "tips": [],
   "notes": {
    "beginner": "Fenceが指定値へ到達した時にWin32 Eventをsignal状態にするよう登録します。CPUはそのEventを待てます。",
    "pre": "有効なFenceとEvent HANDLEが必要です。すでにcompletedなら待機せず進めるためGetCompletedValueと組み合わせます。",
    "fail": "Eventを作っていない、target valueを間違える、毎frame無条件待ちしてCPU/GPU並列性を失う、が典型です。",
    "deep": "Fence値とEventは『GPU timelineをOSの待機Primitiveへ橋渡しする』関係です。教材では理解のため毎frame待ちますが、実運用では再利用直前まで待機を遅らせます。"
   }
  },
  {
   "name": "ID3D12Resource::GetGPUVirtualAddress",
   "group": "dx12",
   "signature": "D3D12_GPU_VIRTUAL_ADDRESS GetGPUVirtualAddress();",
   "summary": "Buffer Resource の GPU Virtual Address を取得します。VBV / IBV / Root CBV に使用します。Texture では使いません。",
   "params": [],
   "returns": "64bit GPU virtual address。",
   "when": "Buffer 作成後。",
   "example": "vbv.BufferLocation = vertexBuffer->GetGPUVirtualAddress();",
   "tips": []
  },
  {
   "name": "ID3D12DescriptorHeap::GetCPUDescriptorHandleForHeapStart / GetGPUDescriptorHandleForHeapStart",
   "group": "dx12",
   "signature": "D3D12_CPU_DESCRIPTOR_HANDLE GetCPUDescriptorHandleForHeapStart();\nD3D12_GPU_DESCRIPTOR_HANDLE GetGPUDescriptorHandleForHeapStart();",
   "summary": "DescriptorHeap の先頭 Handle を取得します。CPU Handle は Descriptor 作成 / OM bind、GPU Handle は Shader DescriptorTable に使います。",
   "params": [],
   "returns": "Handle struct。",
   "when": "Descriptor slot 計算の起点。",
   "example": "auto cpu = heap->GetCPUDescriptorHandleForHeapStart(); cpu.ptr += index * descriptorSize;",
   "tips": []
  },
  {
   "name": "XMMatrixLookAtLH",
   "group": "math",
   "signature": "XMMATRIX XM_CALLCONV XMMatrixLookAtLH(FXMVECTOR eye, FXMVECTOR focus, FXMVECTOR up);",
   "summary": "左手座標系の View Matrix を作ります。Camera Controller はなく、固定 Camera の View 作成に使用します。",
   "params": [
    [
     "eye",
     "Camera position。"
    ],
    [
     "focus",
     "注視点。"
    ],
    [
     "up",
     "上方向。通常 (0,1,0)。"
    ]
   ],
   "returns": "View XMMATRIX。",
   "when": "毎フレームまたは初期化時。",
   "example": "XMMatrixLookAtLH(XMVectorSet(0,3,-7,1), XMVectorSet(0,0,0,1), XMVectorSet(0,1,0,0));",
   "tips": []
  },
  {
   "name": "XMMatrixPerspectiveFovLH",
   "group": "math",
   "signature": "XMMATRIX XM_CALLCONV XMMatrixPerspectiveFovLH(float fovAngleY, float aspectRatio, float nearZ, float farZ);",
   "summary": "左手座標系 Perspective Projection Matrix を作ります。",
   "params": [
    [
     "fovAngleY",
     "垂直 FOV。radian。"
    ],
    [
     "aspectRatio",
     "width / height。"
    ],
    [
     "nearZ",
     "Near clip。0 より大きい値。"
    ],
    [
     "farZ",
     "Far clip。nearZ より大きい値。"
    ]
   ],
   "returns": "Projection XMMATRIX。",
   "when": "3D Scene setup。",
   "example": "XMMatrixPerspectiveFovLH(XMConvertToRadians(60.0f), 1280.0f/720.0f, 0.1f, 100.0f);",
   "tips": []
  },
  {
   "name": "XMMatrixOrthographicLH",
   "group": "math",
   "signature": "XMMATRIX XM_CALLCONV XMMatrixOrthographicLH(float viewWidth, float viewHeight, float nearZ, float farZ);",
   "summary": "左手座標系の Orthographic（平行投影）の Projection 行列を作ります。Perspective と違い、奥へ離れても見た目の大きさが変わりません。",
   "params": [
    [
     "viewWidth",
     "映す範囲の横幅。教材では縦幅に画面の縦横比を掛けて、形が伸びないようにします。"
    ],
    [
     "viewHeight",
     "映す範囲の高さ。教材では 9.0f。"
    ],
    [
     "nearZ",
     "描画する手前側の距離。"
    ],
    [
     "farZ",
     "描画する奥側の距離。"
    ]
   ],
   "returns": "Projection XMMATRIX。",
   "when": "BuildViewProjection で、F1（平行投影）のときの Projection を作るとき。",
   "example": "XMMatrixOrthographicLH(9.0f * aspect, 9.0f, 0.1f, 100.0f);",
   "tips": []
  },
  {
   "name": "XMMatrixTranslation / XMMatrixIdentity / XMMatrixTranspose",
   "group": "math",
   "signature": "XMMATRIX XMMatrixTranslation(float x,float y,float z);\nXMMATRIX XMMatrixIdentity();\nXMMATRIX XMMatrixTranspose(FXMMATRIX m);",
   "summary": "World Matrix の配置、単位行列、HLSL へ渡す前の転置に使用します。",
   "params": [
    [
     "x/y/z",
     "Translation 量。"
    ],
    [
     "m",
     "転置する Matrix。"
    ]
   ],
   "returns": "XMMATRIX。",
   "when": "Object transform / ConstantBuffer 更新。",
   "example": "XMStoreFloat4x4(&constants.worldViewProjection, XMMatrixTranspose(world * view * projection));",
   "tips": []
  },
  {
   "name": "XMVectorSet",
   "group": "math",
   "signature": "XMVECTOR XM_CALLCONV XMVectorSet(float x, float y, float z, float w);",
   "summary": "4成分の XMVECTOR を作ります。Camera position・注視点・up vector の入力に使用します。",
   "params": [
    [
     "x / y / z",
     "3D vector の各成分。位置なら座標、方向なら方向量。"
    ],
    [
     "w",
     "同次座標成分。位置では1、方向では0を使うのが一般的です。"
    ]
   ],
   "returns": "XMVECTOR。",
   "when": "XMMatrixLookAtLH の eye / focus / up を作るとき。",
   "example": "const XMVECTOR eye = XMVectorSet(0.0f, 3.2f, -7.5f, 1.0f);",
   "tips": []
  },
  {
   "name": "XMConvertToRadians",
   "group": "math",
   "signature": "float XMConvertToRadians(float degrees);",
   "summary": "degree で書いた角度を DirectXMath の三角関数・Projection API が使う radian へ変換します。",
   "params": [
    [
     "degrees",
     "degree単位の角度。60.0f など。"
    ]
   ],
   "returns": "radian単位のfloat。",
   "when": "Perspective FOV を読みやすいdegree表記から作るとき。",
   "example": "const float fov = XMConvertToRadians(60.0f);",
   "tips": []
  },
  {
   "name": "XMStoreFloat4x4",
   "group": "math",
   "signature": "void XM_CALLCONV XMStoreFloat4x4(XMFLOAT4X4* destination, FXMMATRIX matrix);",
   "summary": "SIMD向け XMMATRIX の値を、ConstantBuffer struct 等へ保存しやすい XMFLOAT4X4 へ書き出します。",
   "params": [
    [
     "destination",
     "書き込み先 XMFLOAT4X4 pointer。"
    ],
    [
     "matrix",
     "保存する XMMATRIX。今回は transpose 済み WVP。"
    ]
   ],
   "returns": "なし。",
   "when": "DX11/12 の SceneConstants を更新するとき。",
   "example": "XMStoreFloat4x4(&constants.worldViewProjection, XMMatrixTranspose(world * view * projection));",
   "tips": []
  },
  {
   "name": "mul (HLSL)",
   "group": "math",
   "signature": "mul(x, y)",
   "summary": "HLSL の Matrix / Vector 乗算 builtin です。今回 Vertex position に WorldViewProjection を適用します。",
   "params": [
    [
     "x / y",
     "Scalar / Vector / Matrix。型と順序で結果が決まります。C++ 側の行列配置と transpose 方針を統一します。"
    ]
   ],
   "returns": "乗算結果。",
   "when": "VertexShader。",
   "example": "output.position = mul(float4(input.position, 1.0f), gWorldViewProjection);",
   "tips": []
  },
  {
   "name": "Texture2D.Sample (HLSL)",
   "group": "math",
   "signature": "Object.Sample(SamplerState sampler, float2 location)",
   "summary": "Texture を SamplerState の filter / address mode で sample します。",
   "params": [
    [
     "sampler",
     "register(s#) に bind した SamplerState。"
    ],
    [
     "location",
     "通常 UV。0..1 を超える値の扱いは AddressMode で決まります。"
    ]
   ],
   "returns": "Texture format に応じた float4 等。",
   "when": "PixelShader。",
   "example": "float4 color = gTexture.Sample(gSampler, input.uv);",
   "tips": []
  },
  {
   "name": "MultiByteToWideChar",
   "group": "win32",
   "signature": "int MultiByteToWideChar(UINT codePage, DWORD flags, LPCCH source, int sourceLength, LPWSTR destination, int destinationLength);",
   "summary": "UTF-8 などの char 文字列を、Windows の API が使う UTF-16（wchar_t）の文字列へ変換します。",
   "params": [
    [
     "codePage",
     "元の文字コード。UTF-8 なら CP_UTF8。"
    ],
    [
     "flags",
     "0 でよい。"
    ],
    [
     "source / sourceLength",
     "元の文字列と長さ。-1 なら終端の \u0000 まで。"
    ],
    [
     "destination / destinationLength",
     "変換先。destination を nullptr にすると、必要な長さだけを返す。"
    ]
   ],
   "returns": "変換した（または必要な）文字数。",
   "when": "ShowErrorMessage で、例外のメッセージ（UTF-8）を MessageBoxW に渡す前。",
   "example": "const int length = MultiByteToWideChar(CP_UTF8, 0, text, -1, nullptr, 0);",
   "tips": []
  }
 ],
 "groups": {
  "win32": "Win32",
  "wic": "WIC",
  "dx9": "DirectX 9",
  "dx11": "DirectX 11",
  "dx12": "DirectX 12",
  "dxcommon": "DX11 / DX12",
  "math": "Math / HLSL",
  "common": "COM"
 }
};

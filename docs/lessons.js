// Reference の手順データ（手で編集してよい）。docs-temp/tools/build_reference.py と verify_practice.py も読む。
const LESSONS = {
  "dx9": {
    "label": "DirectX 9",
    "theme": "Device に「今の設定」を積み重ね、次の Draw がそれを使う",
    "intro": [
      "DirectX 9 では、ほぼすべてを Device という1つのオブジェクトに頼みます。Texture を選ぶ、奥行き判定を有効にする、物体を描く…どれも m_device->Set〇〇 や m_device->Draw〇〇 です。",
      "設定は Device に残り続け、Draw はその時点の設定で描かれます。「今 Device にどんな設定が残っているか」を意識するのが、DX9 を読むコツです。"
    ],
    "chapters": [
      {
        "title": "準備: ウィンドウに Renderer の枠を付ける",
        "goal": "DirectX のコードを貼る場所を用意する。この章の終わりでは、まだ何も描かれない。",
        "steps": [
          {
            "type": "code",
            "kind": "block",
            "target": "headers",
            "title": "DirectX 9 のヘッダーを読み込む",
            "why": [
              "d3d9.h は Direct3D 9 の関数や型の宣言、DirectXMath.h は行列の計算、wincodec.h は PNG の読み込み（WIC）に使います。",
              "#pragma comment(lib, …) は、使うライブラリ（.lib）をリンクするよう Visual Studio に伝える行です。これが無いとリンクエラー（LNK2019）になります。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "block",
            "target": "types",
            "title": "データの型を決める",
            "why": [
              "描画で使うデータの形をまとめて定義します。ProjectionMode と RenderStage は F1〜F6 キーで切り替える表示の種類、ImageData は PNG を読み込んだ結果、Vertex は1頂点のデータです。",
              "SceneGeometry は、すべての物体の頂点を1つの大きな配列にまとめたものです。物体ごとに「配列のどこからどこまでか」を DrawRange で覚えておき、描くときに範囲を指定します。"
            ],
            "look": [
              "Vertex のメンバーの順番（位置 → 色 → UV）と、kVertexFVF のフラグの順番（XYZ → DIFFUSE → TEX1）が一致している",
              "DX9 では、頂点の形を FVF（フラグの組み合わせ）で Device に伝える"
            ],
            "diff": "DX11 / DX12 では、FVF の代わりに InputLayout という表で頂点の形を伝えます。"
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "ThrowIfFailed",
              "ShowErrorMessage"
            ],
            "title": "失敗したら止める仕組みを作る",
            "why": [
              "DirectX の関数の多くは、成功したか失敗したかを HRESULT という値で返します。失敗を見逃して先へ進むと、原因から離れた場所で画面が真っ黒になるなど、原因を探しにくくなります。",
              "ThrowIfFailed は失敗していたらその場で例外を投げて止め、ShowErrorMessage はその内容をダイアログに表示します。以降のコードでは、DirectX の関数をほぼすべて ThrowIfFailed(…) で包みます。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "block",
            "target": "renderer",
            "title": "Renderer クラスの枠を書く",
            "why": [
              "Renderer は、Direct3D の準備と描画をまとめるクラスです。中身が「// TODO: 関数名」の1行だけになった関数が並んでいて、このあとの手順で1つずつ埋めていきます。",
              "Initialize には「どの順番で準備するか」、Render(stage) には「F3〜F6 で選ばれた段階を、どの関数で描くか」だけが書いてあります。空の関数を呼んでも何も起きないので、途中の段階でも必ずビルドして起動できます。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "main",
            "target": "wWinMain",
            "title": "wWinMain から Renderer を動かす",
            "why": [
              "プログラムの入口 wWinMain を、Renderer を使う形に置き換えます。起動時に1回だけ Initialize を呼び、あとはウィンドウが閉じられるまで「メッセージ（キー入力など）を処理 → 1フレーム描く」を繰り返します。",
              "F1 / F2 で投影方法（平行投影 / 透視投影）、F3〜F6 で「背景だけ」「Sprite 1枚」「立方体1個」「完成画面」を切り替えます。2つは別々の切り替えなので、どの段階でも F1 / F2 が効きます。途中の動作確認では、このキーを使います。"
            ],
            "look": [
              "Initialize は1回だけ、描画はループの中で毎フレーム呼ばれる",
              "選んだ段階は renderer.Render(stage) に渡され、Renderer の中で RenderClearOnly / RenderOneObject / RenderFullScene に振り分けられる。最初は F6（完成画面）・透視投影で始まる"
            ]
          },
          {
            "type": "run",
            "stage": "window",
            "title": "ここで一度起動する: ウィンドウが開く",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する"
              ]
            ],
            "expect": [
              "1280×720 のウィンドウが開く（中身はまだ何も描いていないので、白や黒のままで正常）",
              "Esc キーで閉じられる"
            ],
            "trouble": [
              "ビルドエラー C2065 / C3861（識別子が見つからない） → 前の手順を飛ばしていないか。貼る場所を間違えていないか。1文の貼り忘れ・二重貼りがないか",
              "{ } の数が合わないエラーが大量に出る → TODO の行だけでなく、前後の行まで消していないか"
            ]
          }
        ]
      },
      {
        "title": "Device を作って画面を塗る",
        "goal": "背景色だけの画面を表示する（確認 1）。",
        "steps": [
          {
            "type": "code",
            "kind": "member",
            "target": "CreateDevice",
            "title": "Device を作る",
            "why": [
              "Direct3DCreate9 で Direct3D 9 の入口を作り、CreateDevice で Device を作ります。このあと GPU への頼みごとは、ほぼすべて Device に対して行います。",
              "D3DPRESENT_PARAMETERS は「どう表示するか」の設定です。画面に出す画像（BackBuffer）の大きさと、奥行き判定に使う Depth バッファを、ここで一緒に作ってもらいます。"
            ],
            "look": [
              "Windowed = TRUE: 全画面ではなく、ウィンドウの中に表示する",
              "EnableAutoDepthStencil = TRUE: Depth バッファを自動で作ってもらう",
              "PresentationInterval = D3DPRESENT_INTERVAL_ONE: モニターの更新に合わせて表示する（垂直同期）"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "PresentFrame",
            "title": "描いた画像をウィンドウに表示する",
            "why": [
              "Present は、描き終わった BackBuffer をウィンドウへ表示する関数です。",
              "DX9 では画面のロックなどで Device が「失われる（Lost）」ことがあり、そのとき Present は D3DERR_DEVICELOST を返します。この教材では復帰処理を省き、そのフレームの表示をあきらめるだけにしています。"
            ],
            "diff": "DX10 以降は仕組みが変わり、通常の使い方で Device が失われることはほぼなくなりました。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "RenderClearOnly",
            "title": "背景色で塗って表示する（確認用）",
            "why": [
              "Clear で描画先を1色で塗りつぶし、Present で表示します。まだ物体は描きません。Device と表示の仕組みが正しく動くかを、最小のコードで確かめるための関数です。",
              "D3DCLEAR_ZBUFFER を付けて、Depth バッファも一緒に初期化しています（Depth は物体を描くときに使います）。"
            ]
          },
          {
            "type": "run",
            "stage": "clear",
            "title": "ここで一度起動する: 確認 1 背景色だけ",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する"
              ],
              [
                "F3",
                "「背景だけ」の表示に切り替える"
              ]
            ],
            "expect": [
              "ウィンドウ全体が暗い青灰色になる",
              "Esc キーで閉じられる"
            ],
            "trouble": [
              "F3 を押しても何も変わらない → wWinMain を置き換えたか（TODO 5）",
              "起動直後にエラーのダイアログが出る → 表示された関数名の行から、直前の手順を見直す"
            ],
            "images": [
              "dx9-clear.png"
            ]
          }
        ]
      },
      {
        "title": "頂点と画像を GPU へ渡す",
        "goal": "物体の形と Icon.png を、GPU が読める Buffer と Texture にする。",
        "steps": [
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "GetIconPath",
              "LoadPngWithWIC"
            ],
            "title": "Icon.png を読み込む関数（WIC）",
            "why": [
              "WIC（Windows Imaging Component）は Windows に入っている画像読み込みの機能です。PNG ファイルを開き、1画素 4byte（B, G, R, A）の配列に変換します。",
              "ここは DirectX ではないので、中身を細かく理解しなくても構いません。貼りながら「PNG ファイル → 画素の配列」という入口と出口だけ確認します（流れは Factory → Decoder → Frame → 形式の変換 → CopyPixels）。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "AppendQuad",
              "AppendTriangle",
              "BuildSceneGeometry"
            ],
            "title": "物体の形（頂点と Index）を作る関数",
            "why": [
              "GPU は三角形しか描けないので、四角形は三角形2枚に分けます。4つの頂点に番号（Index）を付け、[0, 1, 2] と [0, 2, 3] のように番号で指すと、頂点を重複させずに三角形2枚を表せます。",
              "BuildSceneGeometry は、Sprite・床・立方体・四角すい・パネルを、1つの頂点配列と1つの Index 配列へ順に追加し、それぞれの範囲を DrawRange に記録します。"
            ],
            "look": [
              "UV は画像上の位置（左上が 0, 0、右下が 1, 1）。床は UV を 0〜4 にして、画像を 4×4 回繰り返す",
              "物体の位置はここでは決めない。どこに置くかは、描くときの World 行列で決める"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateGeometryBuffers",
            "title": "VertexBuffer と IndexBuffer を作る",
            "why": [
              "CPU の配列（std::vector）は GPU から直接読めません。GPU が読める VertexBuffer / IndexBuffer を作り、そこへ中身をコピーします。",
              "DX9 では Lock で書き込み先のメモリを借り、memcpy でコピーし、Unlock で返します。D3DPOOL_MANAGED にすると、GPU 側へのコピーを Direct3D 9 が管理してくれます。"
            ],
            "diff": "DX11 では作成時に初期データを渡すだけ、DX12 では「転送用メモリ → GPU 用メモリ」のコピーを自分で命令します。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateIconTexture",
            "title": "Icon.png の Texture を作る",
            "why": [
              "画像と同じ大きさの Texture を作り、LockRect で書き込み先を借りて画素をコピーします。",
              "Texture の1行の byte 数（Pitch）は、GPU の都合で「幅 × 4」より大きいことがあります。そのため画像全体を一度にコピーせず、1行ずつ Pitch 分ずらしながらコピーします。"
            ],
            "look": [
              "D3DFMT_A8R8G8B8 は名前が ARGB の順でも、メモリ上は B, G, R, A の順に並ぶ（WIC の BGRA と一致する）"
            ]
          }
        ]
      },
      {
        "title": "描き方を設定して1個描く",
        "goal": "F4 で画像を貼った四角形（Sprite）1枚、F5 で立方体1個を表示する（確認 2）。",
        "steps": [
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "ToD3DMatrix",
              "BuildViewProjection"
            ],
            "title": "カメラと投影の行列を作る",
            "why": [
              "物体の頂点は3つの行列で画面上の位置へ変換されます。World（物体をどこに置くか）→ View（カメラから見るとどこか）→ Projection（画面にどう映すか）の順です。",
              "BuildViewProjection は View と Projection を返します。カメラ（View）はどちらも同じで、変わるのは Projection だけです。平行投影（Orthographic）は遠くの物も同じ大きさで映り、透視投影（Perspective）は遠くの物ほど小さく映ります。物体もカメラも同じまま、Projection 1つで見え方が変わることを F1 / F2 で確かめます。",
              "ToD3DMatrix は、DirectXMath の行列（XMMATRIX）を DX9 が受け取る D3DMATRIX 型へ変換するだけの関数です。"
            ],
            "look": [
              "XMMatrixLookAtLH(カメラの位置, 見る点, 上方向)",
              "XMMatrixPerspectiveFovLH(上下の視野角 60 度, 縦横比, 近い面, 遠い面)",
              "XMMatrixOrthographicLH(横幅, 縦幅 9, 近い面, 遠い面)"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "ConfigureFixedFunctionPipeline",
            "title": "描き方の共通設定をする",
            "why": [
              "DX9 には、Shader を書かなくても描ける「固定機能パイプライン」があります。そのかわり、描き方を SetRenderState などで Device に1項目ずつ設定します。",
              "ここでは、頂点の形（FVF）と読み込む Buffer、ライトを使わない・裏面も描くという設定、「Texture の色 × 頂点色」で色を決める設定、Texture の読み方（繰り返し・なめらかな補間）を設定します。一度設定すると、変えるまで Device に残ります。"
            ],
            "diff": "DX11 では Shader を自分で書き、設定は State オブジェクトにまとめます。DX12 ではさらに PSO という1つのオブジェクトにまとめます。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "SetCameraTransforms",
            "title": "カメラの行列を Device に設定する",
            "why": [
              "今の投影方法（平行投影 / 透視投影）の View と Projection を、SetTransform で Device に設定します。以降の Draw は、すべてこのカメラで描かれます。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "DrawObject",
            "title": "物体を1個描く",
            "why": [
              "SetTransform(D3DTS_WORLD, …) で物体の置き場所（World 行列）を設定してから、DrawIndexedPrimitive で描きます。",
              "描く範囲は DrawRange で指定します。「IndexBuffer の startIndex 番目から、三角形を indexCount / 3 枚」です。同じ VertexBuffer から、範囲を変えるだけで別の物体を描けます。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "RenderOneObject",
            "title": "物体を1個だけ描く（確認用）",
            "why": [
              "BackBuffer へ直接、渡された物体を1個だけ描きます。Texture を選び、奥行き判定（Z）を有効にし、カメラを設定してから DrawObject を呼びます。",
              "DX9 では、描画の命令を BeginScene と EndScene の間に書く決まりがあります。"
            ],
            "look": [
              "何を描くかは引数 range で受け取る。Render(stage) が F4 なら Sprite、F5 なら立方体の範囲を渡す",
              "物体は原点に置く（World 行列 = 単位行列）。F1 / F2 を押すと Projection だけが変わる"
            ]
          },
          {
            "type": "run",
            "stage": "one",
            "title": "ここで一度起動する: 確認 2 物体を1個だけ",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する"
              ],
              [
                "F4",
                "Sprite（画像を貼った四角形）1枚"
              ],
              [
                "F5",
                "立方体1個"
              ],
              [
                "F1 / F2",
                "平行投影 / 透視投影に切り替える"
              ]
            ],
            "expect": [
              "F4: Icon.png を貼った四角形が、画面の中央に少し奥へ傾いて表示される（画像の上下・左右が反転していない）",
              "F5: 画像を貼った立方体が中央に表示され、面の前後関係が正しい",
              "F1（平行投影）: 奥の辺と手前の辺が同じ長さになり、遠近感がなくなる。F2 で元に戻る"
            ],
            "trouble": [
              "真っ白な四角になる → CreateIconTexture と、RenderOneObject の SetTexture",
              "何も表示されない → ConfigureFixedFunctionPipeline の SetStreamSource / SetIndices と、DrawObject の範囲",
              "立方体の面の前後がおかしい → D3DRS_ZENABLE と、Clear の D3DCLEAR_ZBUFFER"
            ],
            "images": [
              "dx9-sprite.png",
              "dx9-cube.png"
            ]
          }
        ]
      },
      {
        "title": "物体を並べて完成させる",
        "goal": "床・立方体・四角すい・半透明パネルを並べて描く。",
        "steps": [
          {
            "type": "code",
            "kind": "member",
            "target": "RenderFullScene",
            "title": "床・立方体・四角すい・パネルを並べて描く",
            "why": [
              "RenderOneObject と同じ準備（Clear → BeginScene → Texture・奥行き・カメラ）をしてから、物体を4つ描きます。同じ立方体の形でも、World 行列（XMMatrixTranslation）を変えれば別の場所に置けます。",
              "半透明のパネルは最後に描きます。ALPHABLENDENABLE を TRUE にすると、「新しい色 × alpha ＋ 今の色 × (1 − alpha)」で色が混ざります。パネルは Depth を書き込まない（ZWRITEENABLE = FALSE）ので、後ろの物体を隠しません。"
            ],
            "look": [
              "最後に設定を元に戻している。DX9 の設定は Device に残り続け、次の Draw にも効いてしまうため",
              "不透明な物体を先、半透明のパネルを最後に描く（混ぜる相手の色が先に必要）"
            ],
            "diff": "DX11 では State オブジェクトを丸ごと差し替え、DX12 では PSO を切り替えます。"
          },
          {
            "type": "run",
            "stage": "final",
            "title": "起動して完成を確認する",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する（最初から完成画面）"
              ],
              [
                "F1 / F2",
                "平行投影 / 透視投影に切り替える"
              ]
            ],
            "expect": [
              "左に立方体、右に四角すい。床には画像が 4×4 回繰り返し貼られている",
              "手前の半透明パネル越しに、奥の物体が透けて見える",
              "F1（平行投影）では、床の左右の縁が平行になり、奥の物も小さくならない",
              "PreviewProj の同じ世代を起動した画面と一致する"
            ],
            "trouble": [
              "パネルが透けない → パネルの頂点色の alpha と、D3DRS_SRCBLEND / D3DRS_DESTBLEND",
              "床や立方体まで透ける → パネルを描いたあと ALPHABLENDENABLE を FALSE に戻しているか",
              "立方体と四角すいの位置が逆・重なる → DrawObject に渡す XMMatrixTranslation の x"
            ],
            "images": [
              "dx9-final.png",
              "dx9-final-ortho.png"
            ]
          }
        ]
      }
    ]
  },
  "dx11": {
    "label": "DirectX 11",
    "theme": "作る係（Device）と命令する係（Context）が分かれ、設定は State オブジェクトになる",
    "intro": [
      "DirectX 11 では、Resource（Buffer や Texture）を作るのは Device、描画の命令を出すのは Context、と役割が分かれます。DX9 で Device に1項目ずつ設定していた描き方は、State オブジェクトとしてまとめて作り、丸ごと差し替えます。",
      "もう1つの大きな変化は View です。同じ Texture を「描画先」として使うのか「Shader から読む画像」として使うのかを、RTV / SRV といった View で区別します。"
    ],
    "chapters": [
      {
        "title": "準備: ウィンドウに Renderer の枠を付ける",
        "goal": "DirectX のコードを貼る場所を用意する。この章の終わりでは、まだ何も描かれない。",
        "steps": [
          {
            "type": "code",
            "kind": "block",
            "target": "headers",
            "title": "DirectX 11 のヘッダーを読み込む",
            "why": [
              "d3d11.h は Direct3D 11、d3dcompiler.h は HLSL（Shader の言語）のコンパイル、DirectXMath.h は行列の計算、wincodec.h は PNG の読み込み（WIC）に使います。",
              "#pragma comment(lib, …) は、使うライブラリ（.lib）をリンクするよう Visual Studio に伝える行です。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "block",
            "target": "types",
            "title": "データの型を決める",
            "why": [
              "描画で使うデータの形をまとめて定義します。ProjectionMode と RenderStage は F1〜F6 キーで切り替える表示の種類、ImageData は PNG を読み込んだ結果、Vertex は1頂点のデータ、SceneGeometry はすべての物体の頂点をまとめたものです。",
              "DX9 との違いは2つです。頂点の形は FVF ではなく InputLayout（あとの手順）で伝えます。また、行列を Shader へ渡すための SceneConstants があります。"
            ],
            "look": [
              "SceneConstants は、HLSL の cbuffer SceneConstants と同じ形にする（cbuffer の中身は 16byte 単位で並ぶ。行列1つの 64byte ならそのまま一致する）"
            ]
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "ThrowIfFailed",
              "ShowErrorMessage"
            ],
            "title": "失敗したら止める仕組みを作る",
            "why": [
              "DirectX の関数の多くは、成功したか失敗したかを HRESULT という値で返します。失敗を見逃して先へ進むと、原因から離れた場所で画面が真っ黒になるなど、原因を探しにくくなります。",
              "ThrowIfFailed は失敗していたらその場で例外を投げて止め、ShowErrorMessage はその内容をダイアログに表示します。以降のコードでは、DirectX の関数をほぼすべて ThrowIfFailed(…) で包みます。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "block",
            "target": "renderer",
            "title": "Renderer クラスの枠を書く",
            "why": [
              "Renderer は、Direct3D の準備と描画をまとめるクラスです。中身が「// TODO: 関数名」の1行だけになった関数が並んでいて、このあとの手順で1つずつ埋めていきます。",
              "Initialize には「どの順番で準備するか」、Render(stage) には「F3〜F6 で選ばれた段階を、どの関数で描くか」だけが書いてあります。空の関数を呼んでも何も起きないので、途中の段階でも必ずビルドして起動できます。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "main",
            "target": "wWinMain",
            "title": "wWinMain から Renderer を動かす",
            "why": [
              "プログラムの入口 wWinMain を、Renderer を使う形に置き換えます。起動時に1回だけ Initialize を呼び、あとはウィンドウが閉じられるまで「メッセージ（キー入力など）を処理 → 1フレーム描く」を繰り返します。",
              "F1 / F2 で投影方法（平行投影 / 透視投影）、F3〜F6 で「背景だけ」「Sprite 1枚」「立方体1個」「完成画面」を切り替えます。2つは別々の切り替えなので、どの段階でも F1 / F2 が効きます。途中の動作確認では、このキーを使います。"
            ],
            "look": [
              "Initialize は1回だけ、描画はループの中で毎フレーム呼ばれる",
              "選んだ段階は renderer.Render(stage) に渡され、Renderer の中で RenderClearOnly / RenderOneObject / RenderFullScene に振り分けられる。最初は F6（完成画面）・透視投影で始まる"
            ]
          },
          {
            "type": "run",
            "stage": "window",
            "title": "ここで一度起動する: ウィンドウが開く",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する"
              ]
            ],
            "expect": [
              "1280×720 のウィンドウが開く（中身はまだ何も描いていないので、白や黒のままで正常）",
              "Esc キーで閉じられる"
            ],
            "trouble": [
              "ビルドエラー C2065 / C3861（識別子が見つからない） → 前の手順を飛ばしていないか。貼る場所を間違えていないか。1文の貼り忘れ・二重貼りがないか",
              "{ } の数が合わないエラーが大量に出る → TODO の行だけでなく、前後の行まで消していないか"
            ]
          }
        ]
      },
      {
        "title": "Device と SwapChain を作って画面を塗る",
        "goal": "背景色だけの画面を表示する（確認 1）。",
        "steps": [
          {
            "type": "code",
            "kind": "member",
            "target": "CreateDeviceAndSwapChain",
            "title": "Device・Context・SwapChain を作る",
            "why": [
              "D3D11CreateDeviceAndSwapChain で3つをまとめて作ります。Device は Buffer や Texture を作る係、ImmediateContext は描画の命令を出す係、SwapChain は BackBuffer を2枚持って交互に表示する係です。",
              "Debug ビルドでは D3D11_CREATE_DEVICE_DEBUG を付けて Debug Layer を有効にします。API の使い方を間違えると、Visual Studio の「出力」ウィンドウに原因が表示されます（Visual Studio で F5 を押すデバッグ実行のとき）。"
            ],
            "look": [
              "SwapEffect = DXGI_SWAP_EFFECT_FLIP_DISCARD: 現在推奨されている表示方式。DX12 はこの方式しか使えない",
              "BufferCount = 2: 表示している画像と、次に描く画像の2枚"
            ],
            "diff": "DX9 では Device 1つが、作るのも命令するのも表示するのも担当していました。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateBackBufferView",
            "title": "BackBuffer の RTV を作る",
            "why": [
              "SwapChain の BackBuffer（Texture）を取り出し、RTV（RenderTargetView）を作ります。DX11 では Texture を直接「描画先」に指定できず、「この Texture を描画先として使う」という View を作って渡します。",
              "View は Texture に付ける「使い道の札」です。同じ Texture でも、描画先なら RTV、Shader から読むなら SRV、Depth なら DSV を作ります。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "RenderClearOnly",
            "title": "背景色で塗って表示する（確認用）",
            "why": [
              "OMSetRenderTargets で描画先（RTV）を Context に設定し、ClearRenderTargetView で塗りつぶし、SwapChain の Present で表示します。",
              "色は 0〜1 の float 4つ（R, G, B, A）で指定します。"
            ],
            "diff": "DX9 の Clear は Device の関数でしたが、DX11 では Context に命令します。"
          },
          {
            "type": "run",
            "stage": "clear",
            "title": "ここで一度起動する: 確認 1 背景色だけ",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する"
              ],
              [
                "F3",
                "「背景だけ」の表示に切り替える"
              ]
            ],
            "expect": [
              "ウィンドウ全体が暗い青灰色になる",
              "Esc キーで閉じられる"
            ],
            "trouble": [
              "F3 を押しても何も変わらない → wWinMain を置き換えたか（TODO 5）",
              "起動直後にエラーのダイアログが出る → 表示された関数名の行から、直前の手順を見直す"
            ],
            "images": [
              "dx11-clear.png"
            ]
          }
        ]
      },
      {
        "title": "Shader と頂点データを用意する",
        "goal": "HLSL を書き、頂点・行列・画像を GPU の Buffer と Texture にする。",
        "steps": [
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "GetShaderPath",
              "CompileShader"
            ],
            "title": "HLSL をコンパイルする関数",
            "why": [
              "HLSL で書いた Shader を、起動時に D3DCompileFromFile でコンパイルします。VSMain（頂点用）と PSMain（画素用）を、それぞれ vs_5_0 / ps_5_0 という形式の命令にします。",
              "HLSL に文法の間違いがあると、行番号付きのエラー文がダイアログに表示されます。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "shader",
            "target": "shader",
            "title": "HLSL（Shader）を書く",
            "why": [
              "DX11 からは Shader（GPU で動く小さなプログラム）が必須です。VertexShader は頂点ごとに1回動き、頂点の位置を行列で画面上の位置へ変換します。PixelShader は画素ごとに1回動き、その画素の色（画像の色 × 頂点色）を決めます。",
              "register(b0) / register(t0) / register(s0) は、C++ 側と値をやりとりする番号です。b は ConstantBuffer（行列）、t は Texture、s は Sampler（画像の読み方）。C++ 側でも同じ番号に設定します。"
            ],
            "look": [
              "VSInput の POSITION / COLOR0 / TEXCOORD0 は、C++ の InputLayout の SemanticName と対応する",
              "mul(位置, 行列) で、頂点の位置を画面上の位置（SV_POSITION）へ変換する",
              "PixelShader の戻り値（SV_TARGET）が、その画素の色になる"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateShaders",
            "title": "Shader と InputLayout を作る",
            "why": [
              "コンパイル結果から VertexShader / PixelShader のオブジェクトを作ります。",
              "InputLayout は、C++ の Vertex 構造体の何 byte 目に何が入っているかを GPU に教える表です。SemanticName（POSITION など）が HLSL の VSInput と、offsetof(Vertex, …) が C++ の Vertex と対応しています。"
            ],
            "diff": "DX9 の FVF と同じ役割です。"
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "GetIconPath",
              "LoadPngWithWIC"
            ],
            "title": "Icon.png を読み込む関数（WIC）",
            "why": [
              "WIC（Windows Imaging Component）は Windows に入っている画像読み込みの機能です。PNG ファイルを開き、1画素 4byte（B, G, R, A）の配列に変換します。",
              "ここは DirectX ではないので、中身を細かく理解しなくても構いません。貼りながら「PNG ファイル → 画素の配列」という入口と出口だけ確認します（流れは Factory → Decoder → Frame → 形式の変換 → CopyPixels）。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "AppendQuad",
              "AppendTriangle",
              "BuildSceneGeometry"
            ],
            "title": "物体の形（頂点と Index）を作る関数",
            "why": [
              "GPU は三角形しか描けないので、四角形は三角形2枚に分けます。4つの頂点に番号（Index）を付け、[0, 1, 2] と [0, 2, 3] のように番号で指すと、頂点を重複させずに三角形2枚を表せます。",
              "BuildSceneGeometry は、Sprite・床・立方体・四角すい・パネルを、1つの頂点配列と1つの Index 配列へ順に追加し、それぞれの範囲を DrawRange に記録します。"
            ],
            "look": [
              "UV は画像上の位置（左上が 0, 0、右下が 1, 1）。床は UV を 0〜4 にして、画像を 4×4 回繰り返す",
              "物体の位置はここでは決めない。どこに置くかは、描くときの World 行列で決める"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateGeometryBuffers",
            "title": "VertexBuffer と IndexBuffer を作る",
            "why": [
              "D3D11_BUFFER_DESC で大きさ・使い方（Usage）・用途（BindFlags）を決め、CreateBuffer で作ります。作ると同時に D3D11_SUBRESOURCE_DATA で初期データを渡すので、DX9 の Lock / Unlock は要りません。",
              "Usage の IMMUTABLE は「作ったあとは書き換えない」という宣言です。GPU が読みやすい場所に置けます。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateConstantBuffer",
            "title": "行列を渡す ConstantBuffer を作る",
            "why": [
              "ConstantBuffer は、C++ から Shader へ行列などの値を渡すための Buffer です。物体を描くたびに中身を書き換えるので、Usage は DEFAULT にし、描画時に UpdateSubresource で更新します。"
            ],
            "diff": "DX9 の SetTransform に相当します。DX11 以降は行列の計算結果を、自分で Shader へ渡します。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateIconTexture",
            "title": "Icon.png の Texture と SRV を作る",
            "why": [
              "D3D11_TEXTURE2D_DESC で画像の大きさと形式を決め、CreateTexture2D で画素をコピーしながら作ります。SysMemPitch は、CPU 側の配列で1行が何 byte かを伝える値です。",
              "Shader は Texture を直接読めないので、読むための View である SRV（ShaderResourceView）を作っておきます。"
            ]
          }
        ]
      },
      {
        "title": "描き方を設定して1個描く",
        "goal": "F4 で画像を貼った四角形（Sprite）1枚、F5 で立方体1個を表示する（確認 2）。",
        "steps": [
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "BuildViewProjection"
            ],
            "title": "カメラと投影の行列を作る",
            "why": [
              "物体の頂点は3つの行列で画面上の位置へ変換されます。World（物体をどこに置くか）→ View（カメラから見るとどこか）→ Projection（画面にどう映すか）の順です。",
              "BuildViewProjection は View と Projection を返します。カメラ（View）はどちらも同じで、変わるのは Projection だけです。平行投影（Orthographic）は遠くの物も同じ大きさで映り、透視投影（Perspective）は遠くの物ほど小さく映ります。物体もカメラも同じまま、Projection 1つで見え方が変わることを F1 / F2 で確かめます。"
            ],
            "look": [
              "XMMatrixLookAtLH(カメラの位置, 見る点, 上方向)",
              "XMMatrixPerspectiveFovLH(上下の視野角 60 度, 縦横比, 近い面, 遠い面)",
              "XMMatrixOrthographicLH(横幅, 縦幅 9, 近い面, 遠い面)"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateDepthBuffer",
            "title": "Depth バッファと DSV を作る",
            "why": [
              "Depth（奥行き）を記録する Texture と、DSV（DepthStencilView）を作ります。画素ごとに「今までで一番手前の距離」を覚えておき、それより奥の画素は描かないことで、前後関係を正しくします。"
            ],
            "diff": "DX9 では Device を作るときに自動で作ってもらいましたが、DX11 では自分で作ります。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreatePipelineStates",
            "title": "描き方の State オブジェクトを作る",
            "why": [
              "描き方の設定を、State オブジェクトとして先に作っておきます。Sampler（画像の読み方）、Rasterizer（三角形の塗り方）、DepthStencil（奥行き判定）、Blend（色の混ぜ方）です。",
              "Depth と Blend はそれぞれ2種類（不透明用・半透明用）を作っておき、描く物体に合わせて差し替えます。"
            ],
            "diff": "DX9 では SetRenderState で1項目ずつ Device に設定していました。DX11 では関係する設定を1つのオブジェクトにまとめ、丸ごと差し替えます。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "BindCommonPipeline",
            "title": "Draw の前に共通の設定を Context につなぐ",
            "why": [
              "Draw の前に、どの Buffer・Shader・設定を使うかを Context に接続（Bind）します。関数名の頭は GPU の処理の段階を表していて、IA（入力）→ VS（頂点 Shader）→ RS（三角形を画素にする段階）→ PS（ピクセル Shader）→ OM（出力）の順に処理されます。",
              "Viewport は、描いた結果を描画先のどの範囲に置くかの指定です。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "DrawObject",
            "title": "物体を1個描く",
            "why": [
              "World × View × Projection を掛けた行列を ConstantBuffer に書き込み、DrawIndexed で描きます。",
              "XMMatrixTranspose（転置）するのは、DirectXMath と HLSL で行列の数字の並べ方（行優先 / 列優先）が違うためです。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "RenderOneObject",
            "title": "物体を1個だけ描く（確認用）",
            "why": [
              "描画先を BackBuffer と Depth にして初期化し、BindCommonPipeline のあと、Icon.png の SRV・奥行きあり・不透明の State を設定して、渡された物体を1個描きます。"
            ],
            "look": [
              "何を描くかは引数 range で受け取る。Render(stage) が F4 なら Sprite、F5 なら立方体の範囲を渡す",
              "物体は原点に置く（World 行列 = 単位行列）。F1 / F2 を押すと Projection だけが変わる"
            ]
          },
          {
            "type": "run",
            "stage": "one",
            "title": "ここで一度起動する: 確認 2 物体を1個だけ",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する"
              ],
              [
                "F4",
                "Sprite（画像を貼った四角形）1枚"
              ],
              [
                "F5",
                "立方体1個"
              ],
              [
                "F1 / F2",
                "平行投影 / 透視投影に切り替える"
              ]
            ],
            "expect": [
              "F4: Icon.png を貼った四角形が、画面の中央に少し奥へ傾いて表示される（画像の上下・左右が反転していない）",
              "F5: 画像を貼った立方体が中央に表示され、面の前後関係が正しい",
              "F1（平行投影）: 奥の辺と手前の辺が同じ長さになり、遠近感がなくなる。F2 で元に戻る"
            ],
            "trouble": [
              "起動直後に「HLSL のコンパイルに失敗しました」 → 表示された行番号の HLSL を確認する",
              "真っ白な四角になる → CreateIconTexture の SRV と、PSSetShaderResources",
              "何も表示されない → InputLayout と Vertex の対応、BindCommonPipeline、ConstantBuffer の転置",
              "Visual Studio の「出力」に D3D11 ERROR が出ている → 最初の1件から直す"
            ],
            "images": [
              "dx11-sprite.png",
              "dx11-cube.png"
            ]
          }
        ]
      },
      {
        "title": "物体を並べて完成させる",
        "goal": "床・立方体・四角すい・半透明パネルを並べて描く。",
        "steps": [
          {
            "type": "code",
            "kind": "member",
            "target": "RenderFullScene",
            "title": "床・立方体・四角すい・パネルを並べて描く",
            "why": [
              "RenderOneObject と同じ準備（描画先の Clear → BindCommonPipeline → SRV・State の設定）をしてから、物体を4つ描きます。同じ立方体の形でも、World 行列（XMMatrixTranslation）を変えれば別の場所に置けます。",
              "半透明パネルは、BlendState を「alpha で混ぜる」に、DepthStencilState を「判定だけ・書き込まない」に差し替えて最後に描きます。"
            ],
            "look": [
              "不透明な物体を先、半透明のパネルを最後に描く（混ぜる相手の色が先に必要）"
            ],
            "diff": "DX9 では RenderState を1つずつ変えて、あとで戻していました。DX11 では State オブジェクトを丸ごと差し替えるので、次に使うときは別のオブジェクトを設定するだけです。"
          },
          {
            "type": "run",
            "stage": "final",
            "title": "起動して完成を確認する",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する（最初から完成画面）"
              ],
              [
                "F1 / F2",
                "平行投影 / 透視投影に切り替える"
              ]
            ],
            "expect": [
              "左に立方体、右に四角すい。床には画像が 4×4 回繰り返し貼られている",
              "手前の半透明パネル越しに、奥の物体が透けて見える",
              "F1（平行投影）では、床の左右の縁が平行になり、奥の物も小さくならない",
              "PreviewProj の同じ世代を起動した画面と一致する"
            ],
            "trouble": [
              "パネルが透けない → m_alphaBlendState の設定と、パネルの頂点色の alpha",
              "パネルの後ろの物体が消える → パネルの前に m_depthReadOnlyState へ差し替えているか",
              "「出力」に D3D11 ERROR が出ている → 最初の1件から直す"
            ],
            "images": [
              "dx11-final.png",
              "dx11-final-ortho.png"
            ]
          }
        ]
      }
    ]
  },
  "dx12": {
    "label": "DirectX 12",
    "theme": "命令を自分で記録して送り、Resource の使い方の切り替えと完了待ちも自分で行う",
    "intro": [
      "DirectX 12 では、DX11 まで Direct3D が裏でやってくれていた仕事をアプリが行います。命令は CommandList に記録してから Queue でまとめて GPU に送り、GPU が終わるのを Fence で待ちます。Texture を「描画先」と「読む画像」で使い分けるときは、Barrier で切り替えを宣言します。",
      "コードは長くなりますが、増えた部分のほとんどは「DX11 では Direct3D が自動でやっていたこと」です。1つずつ、何のためにあるのかを確認しながら進めます。"
    ],
    "chapters": [
      {
        "title": "準備: ウィンドウに Renderer の枠を付ける",
        "goal": "DirectX のコードを貼る場所を用意する。この章の終わりでは、まだ何も描かれない。",
        "steps": [
          {
            "type": "code",
            "kind": "block",
            "target": "headers",
            "title": "DirectX 12 のヘッダーを読み込む",
            "why": [
              "d3d12.h は Direct3D 12、dxgi1_6.h は GPU の選択と画面表示（DXGI）、d3dcompiler.h は HLSL のコンパイル、DirectXMath.h は行列の計算、wincodec.h は PNG の読み込み（WIC）に使います。",
              "#pragma comment(lib, …) は、使うライブラリ（.lib）をリンクするよう Visual Studio に伝える行です。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "block",
            "target": "types",
            "title": "定数とデータの型を決める",
            "why": [
              "DX11 と同じ型に加えて、定数がいくつか増えています。DX12 では「BackBuffer を何枚使うか」「Descriptor を棚の何番に置くか」なども、自分で決めて管理するためです。"
            ],
            "look": [
              "kIconSrvIndex / kSrvCount: Descriptor を置く棚（DescriptorHeap）の中の番号と個数",
              "kConstantBufferStride: ConstantBuffer は 256byte 単位で置く決まりがあるため、1物体分（64byte）を 256byte に切り上げている"
            ]
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "ThrowIfFailed",
              "ShowErrorMessage"
            ],
            "title": "失敗したら止める仕組みを作る",
            "why": [
              "DirectX の関数の多くは、成功したか失敗したかを HRESULT という値で返します。失敗を見逃して先へ進むと、原因から離れた場所で画面が真っ黒になるなど、原因を探しにくくなります。",
              "ThrowIfFailed は失敗していたらその場で例外を投げて止め、ShowErrorMessage はその内容をダイアログに表示します。以降のコードでは、DirectX の関数をほぼすべて ThrowIfFailed(…) で包みます。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "block",
            "target": "renderer",
            "title": "Renderer クラスの枠を書く",
            "why": [
              "Renderer は、Direct3D の準備と描画をまとめるクラスです。中身が「// TODO: 関数名」の1行だけになった関数が並んでいて、このあとの手順で1つずつ埋めていきます。",
              "Initialize には「どの順番で準備するか」、Render(stage) には「F3〜F6 で選ばれた段階を、どの関数で描くか」だけが書いてあります。空の関数を呼んでも何も起きないので、途中の段階でも必ずビルドして起動できます。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "main",
            "target": "wWinMain",
            "title": "wWinMain から Renderer を動かす",
            "why": [
              "プログラムの入口 wWinMain を、Renderer を使う形に置き換えます。起動時に1回だけ Initialize を呼び、あとはウィンドウが閉じられるまで「メッセージ（キー入力など）を処理 → 1フレーム描く」を繰り返します。",
              "F1 / F2 で投影方法（平行投影 / 透視投影）、F3〜F6 で「背景だけ」「Sprite 1枚」「立方体1個」「完成画面」を切り替えます。2つは別々の切り替えなので、どの段階でも F1 / F2 が効きます。途中の動作確認では、このキーを使います。"
            ],
            "look": [
              "Initialize は1回だけ、描画はループの中で毎フレーム呼ばれる",
              "選んだ段階は renderer.Render(stage) に渡され、Renderer の中で RenderClearOnly / RenderOneObject / RenderFullScene に振り分けられる。最初は F6（完成画面）・透視投影で始まる"
            ]
          },
          {
            "type": "run",
            "stage": "window",
            "title": "ここで一度起動する: ウィンドウが開く",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する"
              ]
            ],
            "expect": [
              "1280×720 のウィンドウが開く（中身はまだ何も描いていないので、白や黒のままで正常）",
              "Esc キーで閉じられる"
            ],
            "trouble": [
              "ビルドエラー C2065 / C3861（識別子が見つからない） → 前の手順を飛ばしていないか。貼る場所を間違えていないか。1文の貼り忘れ・二重貼りがないか",
              "{ } の数が合わないエラーが大量に出る → TODO の行だけでなく、前後の行まで消していないか"
            ]
          }
        ]
      },
      {
        "title": "Device・SwapChain・Descriptor を用意する",
        "goal": "GPU に命令を出す相手と、画面に表示する仕組みを作る。",
        "steps": [
          {
            "type": "code",
            "kind": "member",
            "target": "EnableDebugLayer",
            "title": "Debug Layer を有効にする",
            "why": [
              "DX12 は、間違った使い方をしてもエラーにならず、画面が乱れたり落ちたりするだけのことがあります。Debug Layer を有効にすると、間違いを Visual Studio の「出力」ウィンドウに表示してくれます（Visual Studio で F5 を押すデバッグ実行のとき）。",
              "Device を作るより前に有効にする必要があります。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateDeviceAndSwapChain",
            "title": "Device・CommandQueue・SwapChain を作る",
            "why": [
              "DXGI Factory（GPU と画面を扱う入口）と Device を作ります。DX12 の Device は Resource などを作る係で、描画の命令は出しません。",
              "命令は CommandQueue（命令の受付窓口）を通して GPU へ送ります。SwapChain も表示の命令をこの Queue に並べるので、Queue を渡して作ります。"
            ],
            "diff": "DX11 は D3D11CreateDeviceAndSwapChain 1回で3つ作れましたが、DX12 では1つずつ作ります。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateDescriptorHeaps",
            "title": "Descriptor を置く棚（DescriptorHeap）を作る",
            "why": [
              "Descriptor は「この Resource をこう使う」という情報で、DX11 の View にあたります。DX12 では Descriptor を置く棚（DescriptorHeap）を自分で作り、何番に何を置くかも自分で決めます。",
              "RTV 用・DSV 用・SRV 用の3つの棚を作ります。SRV 用の棚には、Shader から見えるよう SHADER_VISIBLE を付けます。Descriptor 1個の大きさは GPU によって違うので、Device に聞いて覚えておきます。"
            ]
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "CpuHandle",
              "GpuHandle"
            ],
            "title": "棚の n 番目の場所を計算する関数",
            "why": [
              "棚（Heap）の n 番目の場所は「先頭 + n × Descriptor 1個の大きさ」で計算します。",
              "CPU で Descriptor を書き込むときは CPU 側の番地（CpuHandle）、Shader に場所を伝えるときは GPU 側の番地（GpuHandle）を使います。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateBackBufferViews",
            "title": "BackBuffer の RTV を作る",
            "why": [
              "SwapChain の BackBuffer 2枚を取り出し、RTV 用の棚の 0 番と 1 番に RTV を書き込みます。"
            ],
            "diff": "DX11 の RTV は1つのオブジェクトでしたが、DX12 の RTV は棚の中の1か所に書き込まれるデータです。"
          }
        ]
      },
      {
        "title": "命令を記録して送り、画面を塗る",
        "goal": "背景色だけの画面を表示する（確認 1）。",
        "steps": [
          {
            "type": "code",
            "kind": "member",
            "target": "CreateCommandObjects",
            "title": "CommandAllocator と CommandList を作る",
            "why": [
              "CommandAllocator は命令を書きためるメモリ、CommandList は命令を書き込む係です。Clear や Draw を呼んでも、その場では実行されず CommandList に記録されるだけです。",
              "作った直後の CommandList は「記録中」なので、いったん Close しておきます。記録を始めるときに Reset します。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateFence",
            "title": "GPU の完了を待つための Fence を作る",
            "why": [
              "Fence は「GPU がどこまで終わったか」を表す番号です。CPU と GPU は別々に動くので、GPU が使い終わる前に CPU がメモリを書き換えたり解放したりしないよう、この番号で待ち合わせます。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "ExecuteCommandList",
            "title": "記録した命令を GPU へ送る",
            "why": [
              "Close で記録を終え、ExecuteCommandLists で CommandQueue に渡します。ここで初めて、GPU が命令を実行し始めます。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "WaitForGpu",
            "title": "GPU が終わるまで待つ",
            "why": [
              "Signal で「ここまで終わったら Fence を signalValue にして」と Queue に頼み、Fence がその値になるまで CPU を止めて待ちます。",
              "この教材では分かりやすさを優先して、毎フレーム GPU の完了を待ちます。実際のゲームでは、待ち時間を減らすために複数フレーム分のメモリを用意し、待たずに次のフレームを記録します。"
            ]
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "TransitionBarrier"
            ],
            "title": "Resource の使い方を切り替える命令（Barrier）",
            "why": [
              "DX12 では、Resource ごとに「今何として使っているか（State）」があり、使い方を変えるときは Barrier という命令で切り替えを宣言します。例えば BackBuffer は、描くときは RENDER_TARGET、表示するときは PRESENT です。",
              "この関数は、Barrier の内容（どの Resource を、どの State からどの State へ）を作るだけです。"
            ],
            "diff": "DX11 までは、この切り替えを Direct3D が自動で行っていました。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "BeginFrame",
            "title": "1フレームの記録を始める",
            "why": [
              "CommandAllocator と CommandList を Reset して記録を始め、今の BackBuffer を PRESENT → RENDER_TARGET へ切り替える Barrier を記録します。",
              "Allocator の Reset は、前のフレームの命令を GPU が実行し終わってからでないとできません。前のフレームの最後に WaitForGpu で待っているので、安全に Reset できます。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "EndFrame",
            "title": "1フレームの記録を終えて表示する",
            "why": [
              "BackBuffer を RENDER_TARGET → PRESENT に戻す Barrier を記録し、命令を GPU へ送って Present します。最後に GPU の完了を待ち、次に描く BackBuffer の番号を取得します。",
              "BackBuffer は2枚を交互に使うので、m_frameIndex は 0, 1, 0, 1… と変わります。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "RenderClearOnly",
            "title": "背景色で塗って表示する（確認用）",
            "why": [
              "BeginFrame と EndFrame の間で、今の BackBuffer の RTV を描画先にして Clear する命令を記録します。",
              "RTV は棚の m_frameIndex 番にあるので、CpuHandle で場所を計算して渡します。"
            ]
          },
          {
            "type": "run",
            "stage": "clear",
            "title": "ここで一度起動する: 確認 1 背景色だけ",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する"
              ],
              [
                "F3",
                "「背景だけ」の表示に切り替える"
              ]
            ],
            "expect": [
              "ウィンドウ全体が暗い青灰色になる",
              "Esc キーで閉じられる"
            ],
            "trouble": [
              "「出力」ウィンドウに D3D12 ERROR が出ている → 最初の1件のメッセージを読む（多くは Barrier の State の食い違い）",
              "ID3D12GraphicsCommandList::Reset failed → CreateCommandObjects の最後で Close したか",
              "F3 を押しても何も変わらない → wWinMain を置き換えたか（TODO 5）",
              "起動直後にエラーのダイアログが出る → 表示された関数名の行から、直前の手順を見直す"
            ],
            "images": [
              "dx12-clear.png"
            ]
          }
        ]
      },
      {
        "title": "Shader・RootSignature・PSO を作る",
        "goal": "Shader へのデータの渡し方と、描き方の設定一式を作る。",
        "steps": [
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "GetShaderPath",
              "CompileShader"
            ],
            "title": "HLSL をコンパイルする関数",
            "why": [
              "HLSL で書いた Shader を、起動時に D3DCompileFromFile でコンパイルします。DX12 では vs_5_1 / ps_5_1 という形式を使います。",
              "HLSL に文法の間違いがあると、行番号付きのエラー文がダイアログに表示されます。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "shader",
            "target": "shader",
            "title": "HLSL（Shader）を書く",
            "why": [
              "DX11 からは Shader（GPU で動く小さなプログラム）が必須です。VertexShader は頂点ごとに1回動き、頂点の位置を行列で画面上の位置へ変換します。PixelShader は画素ごとに1回動き、その画素の色（画像の色 × 頂点色）を決めます。",
              "register(b0) / register(t0) / register(s0) は、C++ 側と値をやりとりする番号です。b は ConstantBuffer（行列）、t は Texture、s は Sampler（画像の読み方）。C++ 側でも同じ番号に設定します。",
              "中身は DX11 と同じ HLSL です。変わるのは、C++ 側で値を渡す方法（次の RootSignature）です。"
            ],
            "look": [
              "VSInput の POSITION / COLOR0 / TEXCOORD0 は、C++ の InputLayout の SemanticName と対応する",
              "mul(位置, 行列) で、頂点の位置を画面上の位置（SV_POSITION）へ変換する",
              "PixelShader の戻り値（SV_TARGET）が、その画素の色になる"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateRootSignature",
            "title": "RootSignature（Shader への渡し方の表）を作る",
            "why": [
              "RootSignature は「Shader にどんなデータを、どの番号で渡すか」の一覧表です。ここでは 0 番に ConstantBuffer（b0）の番地、1 番に Texture（t0）の Descriptor の場所を渡すと決め、Sampler（s0）は表の中に直接埋め込みます。",
              "描くときは SetGraphicsRootConstantBufferView(0, …) や SetGraphicsRootDescriptorTable(1, …) のように、この表の番号を指定して値を渡します。"
            ],
            "diff": "DX11 では VSSetConstantBuffers / PSSetShaderResources で番号を直接指定していた部分を、先に表として決めておきます。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreatePipelineStates",
            "title": "PSO（描き方の設定一式）を2つ作る",
            "why": [
              "PSO（Pipeline State Object）は、Shader・InputLayout・Rasterizer・Blend・Depth・描画先の形式などを1つにまとめたオブジェクトです。GPU は描く前に PSO を丸ごと受け取ります。",
              "Blend や Depth だけを後から差し替えることはできないので、不透明用・半透明用の2つの PSO を作っておき、描くものに合わせて切り替えます。"
            ],
            "diff": "DX11 の InputLayout と各 State オブジェクトが、PSO 1つにまとまりました。"
          }
        ]
      },
      {
        "title": "GPU のメモリにデータを送る",
        "goal": "頂点・画像・行列・Depth のための Resource を作る。",
        "steps": [
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "HeapProperties",
              "BufferDescription"
            ],
            "title": "メモリの種類と Buffer の設定を作る関数",
            "why": [
              "DX12 では、Resource を置くメモリの種類（Heap）を自分で選びます。DEFAULT は GPU 専用で速いけれど CPU からは書けないメモリ、UPLOAD は CPU から書けるけれど GPU からは遅いメモリです。",
              "BufferDescription は「size byte の Buffer」を作るための設定を返すだけの関数です。"
            ]
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "GetIconPath",
              "LoadPngWithWIC"
            ],
            "title": "Icon.png を読み込む関数（WIC）",
            "why": [
              "WIC（Windows Imaging Component）は Windows に入っている画像読み込みの機能です。PNG ファイルを開き、1画素 4byte（B, G, R, A）の配列に変換します。",
              "ここは DirectX ではないので、中身を細かく理解しなくても構いません。貼りながら「PNG ファイル → 画素の配列」という入口と出口だけ確認します（流れは Factory → Decoder → Frame → 形式の変換 → CopyPixels）。"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "AppendQuad",
              "AppendTriangle",
              "BuildSceneGeometry"
            ],
            "title": "物体の形（頂点と Index）を作る関数",
            "why": [
              "GPU は三角形しか描けないので、四角形は三角形2枚に分けます。4つの頂点に番号（Index）を付け、[0, 1, 2] と [0, 2, 3] のように番号で指すと、頂点を重複させずに三角形2枚を表せます。",
              "BuildSceneGeometry は、Sprite・床・立方体・四角すい・パネルを、1つの頂点配列と1つの Index 配列へ順に追加し、それぞれの範囲を DrawRange に記録します。"
            ],
            "look": [
              "UV は画像上の位置（左上が 0, 0、右下が 1, 1）。床は UV を 0〜4 にして、画像を 4×4 回繰り返す",
              "物体の位置はここでは決めない。どこに置くかは、描くときの World 行列で決める"
            ],
            "routine": true
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateDefaultBuffer",
            "title": "UPLOAD 経由で GPU 用の Buffer を作る",
            "why": [
              "頂点のように何度も読むデータは、速い DEFAULT メモリに置きたいのですが、CPU から直接は書けません。そこで UPLOAD メモリにいったん書き、GPU にコピーさせます。",
              "コピーは命令として CommandList に記録します。コピーの前に COPY_DEST（コピー先）、コピーの後に本来の使い方（VertexBuffer など）へ、Barrier で State を切り替えます。"
            ],
            "diff": "DX11 では CreateBuffer に初期データを渡すだけで、この作業を Direct3D がやっていました。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateGeometryBuffers",
            "title": "VertexBuffer と IndexBuffer を作る",
            "why": [
              "CreateDefaultBuffer で VertexBuffer と IndexBuffer を作り、View を用意します。DX12 の VertexBufferView / IndexBufferView は「GPU 上の番地・全体の大きさ・1頂点の大きさ（または Index の形式）」を書いただけの構造体です。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateIconTexture",
            "title": "Icon.png の Texture と SRV を作る",
            "why": [
              "Texture も Buffer と同じく、UPLOAD メモリ経由で GPU 用のメモリへコピーします。",
              "GPU へのコピーでは、1行の byte 数を 256 の倍数に揃える決まりがあります。GetCopyableFootprints で「1行を何 byte 間隔で置けばよいか（RowPitch）」を教えてもらい、その間隔で1行ずつ書き込みます。最後に、SRV を棚の kIconSrvIndex 番に書き込みます。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "UploadSceneResources",
            "title": "コピー命令をまとめて実行する",
            "why": [
              "CreateGeometryBuffers と CreateIconTexture は、コピーの命令を記録するだけです。ここで記録を始め、2つを呼んだあと命令を GPU へ送り、完了を待ちます。",
              "UPLOAD 用の Buffer は、GPU がコピーし終わるまで解放してはいけません。WaitForGpu で待ったあと、関数を抜けるときに ComPtr が自動で解放します。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateConstantBuffer",
            "title": "行列を渡す ConstantBuffer を作る",
            "why": [
              "行列は毎フレーム CPU から書き換えるので、ConstantBuffer は UPLOAD メモリに作り、Map したままにして直接書き込みます。",
              "物体ごとに 256byte ずつ場所を分けて、4個分を確保します（なぜ分けるのかは DrawObject で説明します）。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "CreateDepthBuffer",
            "title": "Depth バッファと DSV を作る",
            "why": [
              "Depth 用の Texture を DEFAULT メモリに作り、DSV を棚に書き込みます。D3D12_CLEAR_VALUE で「Clear に使う値」を伝えておくと、GPU が Clear を速く行えます。"
            ]
          }
        ]
      },
      {
        "title": "1個描く",
        "goal": "F4 で画像を貼った四角形（Sprite）1枚、F5 で立方体1個を表示する（確認 2）。",
        "steps": [
          {
            "type": "code",
            "kind": "helpers",
            "target": [
              "BuildViewProjection"
            ],
            "title": "カメラと投影の行列を作る",
            "why": [
              "物体の頂点は3つの行列で画面上の位置へ変換されます。World（物体をどこに置くか）→ View（カメラから見るとどこか）→ Projection（画面にどう映すか）の順です。",
              "BuildViewProjection は View と Projection を返します。カメラ（View）はどちらも同じで、変わるのは Projection だけです。平行投影（Orthographic）は遠くの物も同じ大きさで映り、透視投影（Perspective）は遠くの物ほど小さく映ります。物体もカメラも同じまま、Projection 1つで見え方が変わることを F1 / F2 で確かめます。"
            ],
            "look": [
              "XMMatrixLookAtLH(カメラの位置, 見る点, 上方向)",
              "XMMatrixPerspectiveFovLH(上下の視野角 60 度, 縦横比, 近い面, 遠い面)",
              "XMMatrixOrthographicLH(横幅, 縦幅 9, 近い面, 遠い面)"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "BindCommonPipeline",
            "title": "Draw の前に共通の設定を記録する",
            "why": [
              "RootSignature、Shader が参照する DescriptorHeap、描く範囲、VertexBuffer / IndexBuffer を CommandList に設定します。",
              "DX12 では、Viewport に加えて Scissor（切り抜く範囲）も必ず設定します。"
            ]
          },
          {
            "type": "code",
            "kind": "member",
            "target": "DrawObject",
            "title": "物体を1個描く",
            "why": [
              "物体ごとの行列を ConstantBuffer に書き込み、その番地を RootSignature の 0 番に設定して、描く命令を記録します。",
              "物体ごとに ConstantBuffer の場所を分ける（objectIndex）のは、GPU が実際に描くのは命令を送った後だからです。同じ場所を上書きすると、GPU が描く時点では、全部の物体が最後に書いた行列で描かれてしまいます。"
            ],
            "diff": "DX11 の UpdateSubresource は、この「上書き問題」を Direct3D が裏で回避してくれていました。"
          },
          {
            "type": "code",
            "kind": "member",
            "target": "RenderOneObject",
            "title": "物体を1個だけ描く（確認用）",
            "why": [
              "BeginFrame と EndFrame の間で、描画先を BackBuffer と Depth にして初期化し、不透明用の PSO と Icon.png の SRV を指定して、渡された物体を1個描きます。"
            ],
            "look": [
              "何を描くかは引数 range で受け取る。Render(stage) が F4 なら Sprite、F5 なら立方体の範囲を渡す",
              "物体は原点に置く（World 行列 = 単位行列）。F1 / F2 を押すと Projection だけが変わる"
            ]
          },
          {
            "type": "run",
            "stage": "one",
            "title": "ここで一度起動する: 確認 2 物体を1個だけ",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する"
              ],
              [
                "F4",
                "Sprite（画像を貼った四角形）1枚"
              ],
              [
                "F5",
                "立方体1個"
              ],
              [
                "F1 / F2",
                "平行投影 / 透視投影に切り替える"
              ]
            ],
            "expect": [
              "F4: Icon.png を貼った四角形が、画面の中央に少し奥へ傾いて表示される（画像の上下・左右が反転していない）",
              "F5: 画像を貼った立方体が中央に表示され、面の前後関係が正しい",
              "F1（平行投影）: 奥の辺と手前の辺が同じ長さになり、遠近感がなくなる。F2 で元に戻る"
            ],
            "trouble": [
              "起動直後に「HLSL のコンパイルに失敗しました」 → 表示された行番号の HLSL を確認する",
              "真っ白な四角になる → CreateIconTexture の SRV、SetDescriptorHeaps、SetGraphicsRootDescriptorTable の番号",
              "「出力」に D3D12 ERROR が出ている → 最初の1件を読む（Barrier の State、Root Parameter の番号が多い）"
            ],
            "images": [
              "dx12-sprite.png",
              "dx12-cube.png"
            ]
          }
        ]
      },
      {
        "title": "物体を並べて完成させる",
        "goal": "床・立方体・四角すい・半透明パネルを並べて描く。",
        "steps": [
          {
            "type": "code",
            "kind": "member",
            "target": "RenderFullScene",
            "title": "床・立方体・四角すい・パネルを並べて描く",
            "why": [
              "RenderOneObject と同じ準備（BeginFrame → 描画先の Clear → BindCommonPipeline → PSO と SRV の指定）をしてから、物体を4つ描きます。",
              "物体ごとに別の objectIndex（ConstantBuffer の場所）を使います。半透明パネルは、PSO を半透明用に切り替えて最後に描きます。"
            ],
            "look": [
              "objectIndex は 0〜3 で、kObjectCount（4）個ぶんの場所を使い切っている",
              "不透明な物体を先、半透明のパネルを最後に描く（混ぜる相手の色が先に必要）"
            ]
          },
          {
            "type": "run",
            "stage": "final",
            "title": "起動して完成を確認する",
            "keys": [
              [
                "Ctrl + F5",
                "ビルドして起動する（最初から完成画面）"
              ],
              [
                "F1 / F2",
                "平行投影 / 透視投影に切り替える"
              ]
            ],
            "expect": [
              "左に立方体、右に四角すい。床には画像が 4×4 回繰り返し貼られている",
              "手前の半透明パネル越しに、奥の物体が透けて見える",
              "F1（平行投影）では、床の左右の縁が平行になり、奥の物も小さくならない",
              "PreviewProj の同じ世代を起動した画面と一致する"
            ],
            "trouble": [
              "立方体と四角すいが中央で重なる → DrawObject の objectIndex が同じになっていないか",
              "パネルが透けない → m_alphaBlendPSO に切り替えてからパネルを描いているか",
              "「出力」に D3D12 ERROR が出ている → 最初の1件を読む（CBV の場所・Root Parameter の番号が多い）"
            ],
            "images": [
              "dx12-final.png",
              "dx12-final-ortho.png"
            ]
          }
        ]
      }
    ]
  }
};

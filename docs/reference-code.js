// 自動生成ファイル。直接編集しない。PreviewProj を直したら docs-temp/tools/build_reference.py を実行する。
const CODE = {
 "dx9": {
  "source": "PreviewProj/DX9/main.cpp",
  "blocks": {
   "headers": {
    "code": "#include <d3d9.h>        // Direct3D 9 の Device・Buffer・Texture\n#include <DirectXMath.h> // World / View / Projection 行列の計算\n#include <wincodec.h>    // WIC: Icon.png を画素の配列へ変換する\n#include <wrl/client.h>  // ComPtr: COM オブジェクトを自動で解放する\n\n#include <cstddef>    // std::size_t\n#include <cstdint>    // std::uint8_t / std::uint16_t\n#include <cstring>    // std::memcpy\n#include <exception>  // std::exception\n#include <filesystem> // Icon.png の場所を探す\n#include <stdexcept>  // std::runtime_error\n#include <string>     // std::wstring（エラー表示）\n#include <vector>     // 画素・頂点・Index の配列\n\nusing Microsoft::WRL::ComPtr;\nusing namespace DirectX;\n\n#pragma comment(lib, \"d3d9.lib\")\n#pragma comment(lib, \"windowscodecs.lib\")\n#pragma comment(lib, \"ole32.lib\")",
    "start": 5,
    "end": 25
   },
   "types": {
    "code": "// F1 / F2 で切り替える投影方法。\nenum class ProjectionMode\n{\n    Orthographic, // 平行投影（遠近感なし）\n    Perspective,  // 透視投影（遠近感あり）\n};\n\n// F3〜F6 で切り替える、途中確認用の描画内容。\nenum class RenderStage\n{\n    ClearOnly, // F3: 背景色だけ\n    Sprite,    // F4: 画像を貼った四角形（Sprite）1枚\n    Cube,      // F5: 立方体1個\n    FullScene, // F6: 完成画面\n};\n\n// カメラ（View）と投影（Projection）の行列をまとめて返すための入れ物。\nstruct ViewProjectionMatrices\n{\n    XMMATRIX view;\n    XMMATRIX projection;\n};\n\n// PNG を読み込んだ結果。1画素 = B, G, R, A の4byte。\nstruct ImageData\n{\n    UINT width = 0;\n    UINT height = 0;\n    std::vector<std::uint8_t> pixels;\n};\n\n// 1頂点が持つデータ。位置・色・Texture 上の位置（UV）。\nstruct Vertex\n{\n    float x, y, z;\n    D3DCOLOR color;\n    float u, v;\n};\n\n// Vertex の並びを Direct3D 9 へ伝える FVF（Flexible Vertex Format）。\n// XYZ → DIFFUSE（色）→ TEX1（UV 1組）の順は、上の Vertex のメンバー順と一致させる。\nconstexpr DWORD kVertexFVF = D3DFVF_XYZ | D3DFVF_DIFFUSE | D3DFVF_TEX1;\n\n// 大きな IndexBuffer の中で、1つの物体が使う範囲。\nstruct DrawRange\n{\n    UINT startIndex = 0;\n    UINT indexCount = 0;\n};\n\n// すべての物体の頂点と Index を1つにまとめたもの。\nstruct SceneGeometry\n{\n    std::vector<Vertex> vertices;\n    std::vector<std::uint16_t> indices;\n    DrawRange sprite;\n    DrawRange floor;\n    DrawRange cube;\n    DrawRange pyramid;\n    DrawRange transparentPanel;\n    DrawRange presentQuad;\n};",
    "start": 35,
    "end": 96
   },
   "renderer": {
    "code": "class Renderer\n{\npublic:\n    void Initialize(HWND hwnd)\n    {\n        CreateDevice(hwnd);\n        CreateGeometryBuffers();\n        CreateIconTexture();\n        CreateSceneTexture();\n        ConfigureFixedFunctionPipeline();\n    }\n\n    void SetProjectionMode(ProjectionMode mode)\n    {\n        m_projectionMode = mode;\n    }\n\n    // F3〜F6 で選ばれた段階の描画を呼ぶ。\n    void Render(RenderStage stage)\n    {\n        switch (stage)\n        {\n        case RenderStage::ClearOnly: RenderClearOnly(); break;\n        case RenderStage::Sprite: RenderOneObject(m_geometry.sprite); break;\n        case RenderStage::Cube: RenderOneObject(m_geometry.cube); break;\n        case RenderStage::FullScene: RenderFullScene(); break;\n        }\n    }\n\n    // 確認 1（F3）: 背景色で塗りつぶして表示するだけ。\n    void RenderClearOnly()\n    {\n        // TODO: RenderClearOnly\n    }\n\n    // 確認 2（F4 / F5）: BackBuffer へ直接、物体を1個だけ描く。\n    void RenderOneObject(const DrawRange& range)\n    {\n        // TODO: RenderOneObject\n    }\n\n    // 完成（F6）: SceneTexture へ描いてから、それを画面へ貼る 2-pass 描画。\n    void RenderFullScene()\n    {\n        // TODO: RenderFullScene\n    }\n\nprivate:\n    void CreateDevice(HWND hwnd)\n    {\n        // TODO: CreateDevice\n    }\n\n    void PresentFrame()\n    {\n        // TODO: PresentFrame\n    }\n\n    void CreateGeometryBuffers()\n    {\n        // TODO: CreateGeometryBuffers\n    }\n\n    void CreateIconTexture()\n    {\n        // TODO: CreateIconTexture\n    }\n\n    void CreateSceneTexture()\n    {\n        // TODO: CreateSceneTexture\n    }\n\n    void ConfigureFixedFunctionPipeline()\n    {\n        // TODO: ConfigureFixedFunctionPipeline\n    }\n\n    void SetCameraTransforms()\n    {\n        // TODO: SetCameraTransforms\n    }\n\n    void DrawObject(const DrawRange& range, FXMMATRIX world)\n    {\n        // TODO: DrawObject\n    }\n\n    void RenderScenePass()\n    {\n        // TODO: RenderScenePass\n    }\n\n    void RenderPresentPass()\n    {\n        // TODO: RenderPresentPass\n    }\n\n    ComPtr<IDirect3D9> m_d3d;\n    ComPtr<IDirect3DDevice9> m_device;\n    ComPtr<IDirect3DVertexBuffer9> m_vertexBuffer;\n    ComPtr<IDirect3DIndexBuffer9> m_indexBuffer;\n    ComPtr<IDirect3DTexture9> m_iconTexture;\n    ComPtr<IDirect3DTexture9> m_sceneTexture;\n    ComPtr<IDirect3DSurface9> m_sceneSurface;\n    ComPtr<IDirect3DSurface9> m_backBufferSurface;\n    SceneGeometry m_geometry;\n    ProjectionMode m_projectionMode = ProjectionMode::Perspective;\n};",
    "start": 323,
    "end": 661
   },
   "main": {
    "code": "int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int)\n{\n    try\n    {\n        // WIC は COM の仕組みで動くため、最初に COM を使える状態にする。\n        ThrowIfFailed(CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED), \"CoInitializeEx failed.\");\n\n        const HWND hwnd = CreateMainWindow(instance);\n        if (!hwnd)\n        {\n            throw std::runtime_error(\"Window creation failed.\");\n        }\n\n        Renderer renderer;\n        renderer.Initialize(hwnd);\n        RenderStage stage = RenderStage::FullScene;\n\n        MSG message{};\n        while (message.message != WM_QUIT)\n        {\n            // ウィンドウへのメッセージ（キー入力・閉じるなど）があれば先に処理する。\n            if (PeekMessageW(&message, nullptr, 0, 0, PM_REMOVE))\n            {\n                if (message.message == WM_KEYDOWN)\n                {\n                    switch (message.wParam)\n                    {\n                    case VK_F1: renderer.SetProjectionMode(ProjectionMode::Orthographic); break;\n                    case VK_F2: renderer.SetProjectionMode(ProjectionMode::Perspective); break;\n                    case VK_F3: stage = RenderStage::ClearOnly; break;\n                    case VK_F4: stage = RenderStage::Sprite; break;\n                    case VK_F5: stage = RenderStage::Cube; break;\n                    case VK_F6: stage = RenderStage::FullScene; break;\n                    }\n                }\n                TranslateMessage(&message);\n                DispatchMessageW(&message);\n                continue;\n            }\n\n            // メッセージがなければ、選ばれている段階を1フレーム描く。\n            renderer.Render(stage);\n        }\n\n        CoUninitialize();\n        return static_cast<int>(message.wParam);\n    }\n    catch (const std::exception& exception)\n    {\n        ShowErrorMessage(exception.what());\n        return -1;\n    }\n}",
    "start": 725,
    "end": 777
   }
  },
  "functions": {
   "ThrowIfFailed": {
    "kind": "helper",
    "signature": "void ThrowIfFailed(HRESULT hr, const char* message)",
    "code": "// HRESULT が失敗を示していたら、例外にして処理を止める。\nvoid ThrowIfFailed(HRESULT hr, const char* message)\n{\n    if (FAILED(hr))\n    {\n        throw std::runtime_error(message);\n    }\n}",
    "start": 100,
    "end": 107
   },
   "ShowErrorMessage": {
    "kind": "helper",
    "signature": "void ShowErrorMessage(const char* message)",
    "code": "// 例外のメッセージをダイアログで表示する。文字列は UTF-8 なので、Windows 用の UTF-16 へ変換する。\nvoid ShowErrorMessage(const char* message)\n{\n    const int length = MultiByteToWideChar(CP_UTF8, 0, message, -1, nullptr, 0);\n    std::wstring wideMessage(static_cast<std::size_t>(length), L'\\0');\n    MultiByteToWideChar(CP_UTF8, 0, message, -1, wideMessage.data(), length);\n    MessageBoxW(nullptr, wideMessage.c_str(), kWindowTitle, MB_OK | MB_ICONERROR);\n}",
    "start": 109,
    "end": 116
   },
   "GetIconPath": {
    "kind": "helper",
    "signature": "std::filesystem::path GetIconPath()",
    "code": "std::filesystem::path GetIconPath()\n{\n    // exe のあるフォルダーから親フォルダーへ向かって Icon.png を探す。\n    wchar_t executablePath[MAX_PATH]{};\n    GetModuleFileNameW(nullptr, executablePath, MAX_PATH);\n\n    std::filesystem::path directory = std::filesystem::path(executablePath).parent_path();\n    for (int i = 0; i < 5; ++i)\n    {\n        const std::filesystem::path candidate = directory / L\"Icon.png\";\n        if (std::filesystem::exists(candidate))\n        {\n            return candidate;\n        }\n        directory = directory.parent_path();\n    }\n\n    throw std::runtime_error(\"Icon.png が見つかりません。PracticeProj（または PreviewProj）フォルダーの中に Icon.png があるか確認してください。\");\n}",
    "start": 118,
    "end": 136
   },
   "LoadPngWithWIC": {
    "kind": "helper",
    "signature": "ImageData LoadPngWithWIC(const std::filesystem::path& path)",
    "code": "ImageData LoadPngWithWIC(const std::filesystem::path& path)\n{\n    // WIC の入口（Factory）を作る。\n    ComPtr<IWICImagingFactory> factory;\n    ThrowIfFailed(\n        CoCreateInstance(\n            CLSID_WICImagingFactory,\n            nullptr,\n            CLSCTX_INPROC_SERVER,\n            IID_PPV_ARGS(factory.GetAddressOf())),\n        \"CoCreateInstance(CLSID_WICImagingFactory) failed.\");\n\n    // PNG ファイルを開き、1枚目の画像を取り出す。\n    ComPtr<IWICBitmapDecoder> decoder;\n    ThrowIfFailed(\n        factory->CreateDecoderFromFilename(\n            path.c_str(),\n            nullptr,\n            GENERIC_READ,\n            WICDecodeMetadataCacheOnLoad,\n            decoder.GetAddressOf()),\n        \"IWICImagingFactory::CreateDecoderFromFilename failed.\");\n\n    ComPtr<IWICBitmapFrameDecode> frame;\n    ThrowIfFailed(decoder->GetFrame(0, frame.GetAddressOf()), \"IWICBitmapDecoder::GetFrame failed.\");\n\n    // どんな PNG でも、1画素 4byte の BGRA 形式へそろえる。\n    ComPtr<IWICFormatConverter> converter;\n    ThrowIfFailed(factory->CreateFormatConverter(converter.GetAddressOf()), \"IWICImagingFactory::CreateFormatConverter failed.\");\n    ThrowIfFailed(\n        converter->Initialize(\n            frame.Get(),\n            GUID_WICPixelFormat32bppBGRA,\n            WICBitmapDitherTypeNone,\n            nullptr,\n            0.0,\n            WICBitmapPaletteTypeCustom),\n        \"IWICFormatConverter::Initialize failed.\");\n\n    // 画像サイズを調べ、画素を CPU 側の配列へコピーする。\n    ImageData image;\n    ThrowIfFailed(converter->GetSize(&image.width, &image.height), \"IWICBitmapSource::GetSize failed.\");\n    const UINT rowPitch = image.width * 4;\n    image.pixels.resize(static_cast<std::size_t>(rowPitch) * image.height);\n    ThrowIfFailed(\n        converter->CopyPixels(nullptr, rowPitch, static_cast<UINT>(image.pixels.size()), image.pixels.data()),\n        \"IWICBitmapSource::CopyPixels failed.\");\n    return image;\n}",
    "start": 138,
    "end": 186
   },
   "AppendQuad": {
    "kind": "helper",
    "signature": "void AppendQuad( SceneGeometry& geometry, XMFLOAT3 p0, XMFLOAT3 p1, XMFLOAT3 p2, XMFLOAT3 p3, D3DCOLOR color, float uvScale = 1.0f)",
    "code": "// 4頂点の四角形を、2枚の三角形（Index 6個）として追加する。\n// p0 = 左下、p1 = 左上、p2 = 右上、p3 = 右下 の順で渡す。\nvoid AppendQuad(\n    SceneGeometry& geometry,\n    XMFLOAT3 p0,\n    XMFLOAT3 p1,\n    XMFLOAT3 p2,\n    XMFLOAT3 p3,\n    D3DCOLOR color,\n    float uvScale = 1.0f)\n{\n    const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());\n    geometry.vertices.push_back({ p0.x, p0.y, p0.z, color, 0.0f, uvScale });\n    geometry.vertices.push_back({ p1.x, p1.y, p1.z, color, 0.0f, 0.0f });\n    geometry.vertices.push_back({ p2.x, p2.y, p2.z, color, uvScale, 0.0f });\n    geometry.vertices.push_back({ p3.x, p3.y, p3.z, color, uvScale, uvScale });\n\n    const std::uint16_t quadIndices[] = { 0, 1, 2, 0, 2, 3 };\n    for (const std::uint16_t index : quadIndices)\n    {\n        geometry.indices.push_back(static_cast<std::uint16_t>(base + index));\n    }\n}",
    "start": 188,
    "end": 210
   },
   "AppendTriangle": {
    "kind": "helper",
    "signature": "void AppendTriangle( SceneGeometry& geometry, XMFLOAT3 p0, XMFLOAT3 p1, XMFLOAT3 p2, D3DCOLOR color)",
    "code": "// 3頂点の三角形（Index 3個）を追加する。\nvoid AppendTriangle(\n    SceneGeometry& geometry,\n    XMFLOAT3 p0,\n    XMFLOAT3 p1,\n    XMFLOAT3 p2,\n    D3DCOLOR color)\n{\n    const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());\n    geometry.vertices.push_back({ p0.x, p0.y, p0.z, color, 0.0f, 1.0f });\n    geometry.vertices.push_back({ p1.x, p1.y, p1.z, color, 0.5f, 0.0f });\n    geometry.vertices.push_back({ p2.x, p2.y, p2.z, color, 1.0f, 1.0f });\n\n    for (std::uint16_t index = 0; index < 3; ++index)\n    {\n        geometry.indices.push_back(static_cast<std::uint16_t>(base + index));\n    }\n}",
    "start": 212,
    "end": 229
   },
   "BuildSceneGeometry": {
    "kind": "helper",
    "signature": "SceneGeometry BuildSceneGeometry()",
    "code": "SceneGeometry BuildSceneGeometry()\n{\n    SceneGeometry geometry;\n    const D3DCOLOR white = D3DCOLOR_ARGB(255, 255, 255, 255);\n\n    // 画像を1枚貼っただけの四角形（Sprite）。\n    geometry.sprite.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -2, -2, 0 }, { -2, 2, 0 }, { 2, 2, 0 }, { 2, -2, 0 }, white);\n    geometry.sprite.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.sprite.startIndex;\n\n    // 床。UV を 0～4 にして、Texture を 4×4 回繰り返す。\n    geometry.floor.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -5, -1.25f, -5 }, { -5, -1.25f, 5 }, { 5, -1.25f, 5 }, { 5, -1.25f, -5 }, white, 4.0f);\n    geometry.floor.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.floor.startIndex;\n\n    // 立方体。6面それぞれに Texture 全体を貼るため、面ごとに頂点を分ける。\n    geometry.cube.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -1, -1, -1 }, { -1, 1, -1 }, { 1, 1, -1 }, { 1, -1, -1 }, white); // 手前\n    AppendQuad(geometry, { 1, -1, 1 }, { 1, 1, 1 }, { -1, 1, 1 }, { -1, -1, 1 }, white);     // 奥\n    AppendQuad(geometry, { -1, -1, 1 }, { -1, 1, 1 }, { -1, 1, -1 }, { -1, -1, -1 }, white); // 左\n    AppendQuad(geometry, { 1, -1, -1 }, { 1, 1, -1 }, { 1, 1, 1 }, { 1, -1, 1 }, white);     // 右\n    AppendQuad(geometry, { -1, 1, -1 }, { -1, 1, 1 }, { 1, 1, 1 }, { 1, 1, -1 }, white);     // 上\n    AppendQuad(geometry, { -1, -1, 1 }, { -1, -1, -1 }, { 1, -1, -1 }, { 1, -1, 1 }, white); // 下\n    geometry.cube.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.cube.startIndex;\n\n    // 四角すい。底面1枚と側面4枚。\n    geometry.pyramid.startIndex = static_cast<UINT>(geometry.indices.size());\n    const XMFLOAT3 top{ 0.0f, 1.1f, 0.0f };\n    const XMFLOAT3 b0{ -1, -1, -1 };\n    const XMFLOAT3 b1{ -1, -1, 1 };\n    const XMFLOAT3 b2{ 1, -1, 1 };\n    const XMFLOAT3 b3{ 1, -1, -1 };\n    AppendQuad(geometry, b1, b0, b3, b2, white);\n    AppendTriangle(geometry, b0, top, b3, white);\n    AppendTriangle(geometry, b3, top, b2, white);\n    AppendTriangle(geometry, b2, top, b1, white);\n    AppendTriangle(geometry, b1, top, b0, white);\n    geometry.pyramid.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.pyramid.startIndex;\n\n    // 半透明のパネル。頂点色の alpha = 90 / 255（約 35%）。\n    geometry.transparentPanel.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(\n        geometry,\n        { -2.7f, -0.8f, -1.8f },\n        { -2.7f, 1.8f, -1.8f },\n        { 2.7f, 1.8f, -1.8f },\n        { 2.7f, -0.8f, -1.8f },\n        D3DCOLOR_ARGB(90, 64, 166, 255),\n        2.0f);\n    geometry.transparentPanel.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.transparentPanel.startIndex;\n\n    // 画面全体を覆う四角形。行列を使わず、-1～1 の座標がそのまま画面の端になる。\n    geometry.presentQuad.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -1, -1, 0 }, { -1, 1, 0 }, { 1, 1, 0 }, { 1, -1, 0 }, white);\n    geometry.presentQuad.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.presentQuad.startIndex;\n\n    return geometry;\n}",
    "start": 231,
    "end": 288
   },
   "ToD3DMatrix": {
    "kind": "helper",
    "signature": "D3DMATRIX ToD3DMatrix(FXMMATRIX matrix)",
    "code": "// DirectXMath の行列を、DX9 の SetTransform が受け取る D3DMATRIX へ変換する。\nD3DMATRIX ToD3DMatrix(FXMMATRIX matrix)\n{\n    XMFLOAT4X4 stored{};\n    XMStoreFloat4x4(&stored, matrix);\n\n    D3DMATRIX result{};\n    static_assert(sizeof(result) == sizeof(stored));\n    std::memcpy(&result, &stored, sizeof(result));\n    return result;\n}",
    "start": 290,
    "end": 300
   },
   "BuildViewProjection": {
    "kind": "helper",
    "signature": "ViewProjectionMatrices BuildViewProjection(ProjectionMode mode)",
    "code": "ViewProjectionMatrices BuildViewProjection(ProjectionMode mode)\n{\n    // カメラ（View）はどちらの投影でも同じ。斜め上から原点のあたりを見下ろす。\n    const XMMATRIX view = XMMatrixLookAtLH(\n        XMVectorSet(0.0f, 3.2f, -7.5f, 1.0f),   // カメラの位置\n        XMVectorSet(0.0f, -0.1f, 0.0f, 1.0f),   // 見る点\n        XMVectorSet(0.0f, 1.0f, 0.0f, 0.0f));   // 上方向\n    const float aspect = static_cast<float>(kClientWidth) / static_cast<float>(kClientHeight);\n\n    // 平行投影: 遠くの物も近くの物も同じ大きさで映る。縦 9 の範囲が画面に収まる。\n    if (mode == ProjectionMode::Orthographic)\n    {\n        return { view, XMMatrixOrthographicLH(9.0f * aspect, 9.0f, 0.1f, 100.0f) };\n    }\n\n    // 透視投影: 遠くの物ほど小さく映る。上下の視野角は 60 度。\n    return { view, XMMatrixPerspectiveFovLH(XMConvertToRadians(60.0f), aspect, 0.1f, 100.0f) };\n}",
    "start": 302,
    "end": 319
   },
   "RenderPresentPass": {
    "kind": "member",
    "signature": "void RenderPresentPass()",
    "code": "// 2段階目: 描画先を BackBuffer に戻す。\nThrowIfFailed(m_device->SetRenderTarget(0, m_backBufferSurface.Get()), \"SetRenderTarget(BackBuffer) failed.\");\nThrowIfFailed(\n    m_device->Clear(0, nullptr, D3DCLEAR_TARGET, D3DCOLOR_XRGB(10, 13, 18), 1.0f, 0),\n    \"Clear(BackBuffer) failed.\");\nThrowIfFailed(m_device->BeginScene(), \"BeginScene(present) failed.\");\n\n// さっき描いた SceneTexture を、今度は「貼る画像」として使う。\nm_device->SetTexture(0, m_sceneTexture.Get());\nm_device->SetRenderState(D3DRS_ZENABLE, FALSE);\n\n// 行列は何も変換しない単位行列にし、presentQuad の -1～1 をそのまま画面の端にする。\n// DX9 だけの注意: 画素の中心と Texture の画素の中心が 0.5 画素ずれるため、\n// 四角形を左上へ 0.5 画素ずらして、ぼやけないようにする。\nconst D3DMATRIX identity = ToD3DMatrix(XMMatrixIdentity());\nm_device->SetTransform(D3DTS_VIEW, &identity);\nm_device->SetTransform(D3DTS_PROJECTION, &identity);\nconst XMMATRIX halfPixelOffset = XMMatrixTranslation(-1.0f / kClientWidth, 1.0f / kClientHeight, 0.0f);\nDrawObject(m_geometry.presentQuad, halfPixelOffset);\n\nThrowIfFailed(m_device->EndScene(), \"EndScene(present) failed.\");",
    "start": 628,
    "end": 648
   },
   "RenderScenePass": {
    "kind": "member",
    "signature": "void RenderScenePass()",
    "code": "// 1段階目: 描画先を SceneTexture に切り替え、背景色と Depth を初期化する。\nThrowIfFailed(m_device->SetRenderTarget(0, m_sceneSurface.Get()), \"SetRenderTarget(SceneTexture) failed.\");\nThrowIfFailed(\n    m_device->Clear(0, nullptr, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER, D3DCOLOR_XRGB(24, 31, 42), 1.0f, 0),\n    \"Clear(SceneTexture) failed.\");\nThrowIfFailed(m_device->BeginScene(), \"BeginScene(scene) failed.\");\n\n// Icon.png・奥行き判定・カメラを設定する。\nm_device->SetTexture(0, m_iconTexture.Get());\nm_device->SetRenderState(D3DRS_ZENABLE, TRUE);\nm_device->SetRenderState(D3DRS_ZWRITEENABLE, TRUE);\nm_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);\nSetCameraTransforms();\n\n// 不透明な物体を描く。同じ形でも World 行列を変えれば別の場所に置ける。\nDrawObject(m_geometry.floor, XMMatrixIdentity());\nDrawObject(m_geometry.cube, XMMatrixTranslation(-1.65f, 0.0f, 0.0f));\nDrawObject(m_geometry.pyramid, XMMatrixTranslation(1.65f, 0.0f, 0.0f));\n\n// 半透明のパネルは最後に描く。色を混ぜる設定にし、Depth は書き込まない。\nm_device->SetRenderState(D3DRS_ALPHABLENDENABLE, TRUE);\nm_device->SetRenderState(D3DRS_SRCBLEND, D3DBLEND_SRCALPHA);\nm_device->SetRenderState(D3DRS_DESTBLEND, D3DBLEND_INVSRCALPHA);\nm_device->SetRenderState(D3DRS_ZWRITEENABLE, FALSE);\nDrawObject(m_geometry.transparentPanel, XMMatrixIdentity());\n\n// 変えた設定を元に戻す。DX9 の設定は Device に残り続け、次の Draw にも効くため。\nm_device->SetRenderState(D3DRS_ZWRITEENABLE, TRUE);\nm_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);\nThrowIfFailed(m_device->EndScene(), \"EndScene(scene) failed.\");",
    "start": 594,
    "end": 623
   },
   "DrawObject": {
    "kind": "member",
    "signature": "void DrawObject(const DrawRange& range, FXMMATRIX world)",
    "code": "// この物体の位置（World 行列）を設定する。\nconst D3DMATRIX d3dWorld = ToD3DMatrix(world);\nm_device->SetTransform(D3DTS_WORLD, &d3dWorld);\n\n// IndexBuffer の startIndex から、三角形 indexCount / 3 枚を描く。\nThrowIfFailed(\n    m_device->DrawIndexedPrimitive(\n        D3DPT_TRIANGLELIST,\n        0,\n        0,\n        static_cast<UINT>(m_geometry.vertices.size()),\n        range.startIndex,\n        range.indexCount / 3),\n    \"IDirect3DDevice9::DrawIndexedPrimitive failed.\");",
    "start": 576,
    "end": 589
   },
   "SetCameraTransforms": {
    "kind": "member",
    "signature": "void SetCameraTransforms()",
    "code": "// 今の投影方法に合わせた View / Projection 行列を Device に設定する。\nconst ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);\nconst D3DMATRIX view = ToD3DMatrix(matrices.view);\nconst D3DMATRIX projection = ToD3DMatrix(matrices.projection);\nm_device->SetTransform(D3DTS_VIEW, &view);\nm_device->SetTransform(D3DTS_PROJECTION, &projection);",
    "start": 566,
    "end": 571
   },
   "ConfigureFixedFunctionPipeline": {
    "kind": "member",
    "signature": "void ConfigureFixedFunctionPipeline()",
    "code": "// 頂点の形式と、読み込む VertexBuffer / IndexBuffer を設定する。\nm_device->SetFVF(kVertexFVF);\nm_device->SetStreamSource(0, m_vertexBuffer.Get(), 0, sizeof(Vertex));\nm_device->SetIndices(m_indexBuffer.Get());\n\n// ライトは使わず頂点色をそのまま使う。裏面も描く。\nm_device->SetRenderState(D3DRS_LIGHTING, FALSE);\nm_device->SetRenderState(D3DRS_CULLMODE, D3DCULL_NONE);\n\n// 最終的な色 = Texture の色 × 頂点色（alpha も同じ）。\nm_device->SetTextureStageState(0, D3DTSS_COLOROP, D3DTOP_MODULATE);\nm_device->SetTextureStageState(0, D3DTSS_COLORARG1, D3DTA_TEXTURE);\nm_device->SetTextureStageState(0, D3DTSS_COLORARG2, D3DTA_DIFFUSE);\nm_device->SetTextureStageState(0, D3DTSS_ALPHAOP, D3DTOP_MODULATE);\nm_device->SetTextureStageState(0, D3DTSS_ALPHAARG1, D3DTA_TEXTURE);\nm_device->SetTextureStageState(0, D3DTSS_ALPHAARG2, D3DTA_DIFFUSE);\n\n// Texture の読み方: UV が 0～1 を超えたら繰り返し、拡大縮小はなめらかに補間する。\nm_device->SetSamplerState(0, D3DSAMP_ADDRESSU, D3DTADDRESS_WRAP);\nm_device->SetSamplerState(0, D3DSAMP_ADDRESSV, D3DTADDRESS_WRAP);\nm_device->SetSamplerState(0, D3DSAMP_MINFILTER, D3DTEXF_LINEAR);\nm_device->SetSamplerState(0, D3DSAMP_MAGFILTER, D3DTEXF_LINEAR);",
    "start": 540,
    "end": 561
   },
   "CreateSceneTexture": {
    "kind": "member",
    "signature": "void CreateSceneTexture()",
    "code": "// 今の描画先（= BackBuffer）を覚えておく。2-pass の最後にここへ戻す。\nThrowIfFailed(\n    m_device->GetRenderTarget(0, m_backBufferSurface.GetAddressOf()),\n    \"IDirect3DDevice9::GetRenderTarget failed.\");\n\n// 描画先にも Texture にもなる SceneTexture を作る（D3DUSAGE_RENDERTARGET）。\n// 描画先にする Texture は D3DPOOL_DEFAULT（GPU メモリ）に置く決まり。\nThrowIfFailed(\n    m_device->CreateTexture(\n        kClientWidth,\n        kClientHeight,\n        1,\n        D3DUSAGE_RENDERTARGET,\n        D3DFMT_A8R8G8B8,\n        D3DPOOL_DEFAULT,\n        m_sceneTexture.GetAddressOf(),\n        nullptr),\n    \"Create SceneTexture failed.\");\n\n// SetRenderTarget は Texture ではなく Surface（1枚の画像面）を受け取るため、取り出しておく。\nThrowIfFailed(\n    m_sceneTexture->GetSurfaceLevel(0, m_sceneSurface.GetAddressOf()),\n    \"IDirect3DTexture9::GetSurfaceLevel failed.\");",
    "start": 513,
    "end": 535
   },
   "CreateIconTexture": {
    "kind": "member",
    "signature": "void CreateIconTexture()",
    "code": "// Icon.png を BGRA の画素配列として読み込む。\nconst ImageData image = LoadPngWithWIC(GetIconPath());\n\n// 画像と同じ大きさの Texture を作る。D3DFMT_A8R8G8B8 はメモリ上で B, G, R, A の順。\nThrowIfFailed(\n    m_device->CreateTexture(\n        image.width,\n        image.height,\n        1,\n        0,\n        D3DFMT_A8R8G8B8,\n        D3DPOOL_MANAGED,\n        m_iconTexture.GetAddressOf(),\n        nullptr),\n    \"IDirect3DDevice9::CreateTexture failed.\");\n\n// LockRect で書き込み先を借り、1行ずつコピーする。\n// Texture の1行の byte 数（Pitch）は width × 4 より大きいことがあるため、まとめてコピーしない。\nD3DLOCKED_RECT locked{};\nThrowIfFailed(m_iconTexture->LockRect(0, &locked, nullptr, 0), \"IDirect3DTexture9::LockRect failed.\");\nconst UINT sourceRowPitch = image.width * 4;\nfor (UINT y = 0; y < image.height; ++y)\n{\n    std::memcpy(\n        static_cast<std::uint8_t*>(locked.pBits) + static_cast<std::size_t>(y) * locked.Pitch,\n        image.pixels.data() + static_cast<std::size_t>(y) * sourceRowPitch,\n        sourceRowPitch);\n}\nThrowIfFailed(m_iconTexture->UnlockRect(0), \"IDirect3DTexture9::UnlockRect failed.\");",
    "start": 480,
    "end": 508
   },
   "CreateGeometryBuffers": {
    "kind": "member",
    "signature": "void CreateGeometryBuffers()",
    "code": "// CPU 側で、すべての物体の頂点と Index を作る。\nm_geometry = BuildSceneGeometry();\n\n// VertexBuffer を作り、Lock で書き込み先を借りて頂点をコピーする。\nconst UINT vertexBytes = static_cast<UINT>(m_geometry.vertices.size() * sizeof(Vertex));\nThrowIfFailed(\n    m_device->CreateVertexBuffer(vertexBytes, 0, kVertexFVF, D3DPOOL_MANAGED, m_vertexBuffer.GetAddressOf(), nullptr),\n    \"IDirect3DDevice9::CreateVertexBuffer failed.\");\n\nvoid* vertexDestination = nullptr;\nThrowIfFailed(m_vertexBuffer->Lock(0, 0, &vertexDestination, 0), \"IDirect3DVertexBuffer9::Lock failed.\");\nstd::memcpy(vertexDestination, m_geometry.vertices.data(), vertexBytes);\nThrowIfFailed(m_vertexBuffer->Unlock(), \"IDirect3DVertexBuffer9::Unlock failed.\");\n\n// IndexBuffer も同じ手順で作る。Index は 16bit（D3DFMT_INDEX16）。\nconst UINT indexBytes = static_cast<UINT>(m_geometry.indices.size() * sizeof(std::uint16_t));\nThrowIfFailed(\n    m_device->CreateIndexBuffer(indexBytes, 0, D3DFMT_INDEX16, D3DPOOL_MANAGED, m_indexBuffer.GetAddressOf(), nullptr),\n    \"IDirect3DDevice9::CreateIndexBuffer failed.\");\n\nvoid* indexDestination = nullptr;\nThrowIfFailed(m_indexBuffer->Lock(0, 0, &indexDestination, 0), \"IDirect3DIndexBuffer9::Lock failed.\");\nstd::memcpy(indexDestination, m_geometry.indices.data(), indexBytes);\nThrowIfFailed(m_indexBuffer->Unlock(), \"IDirect3DIndexBuffer9::Unlock failed.\");",
    "start": 452,
    "end": 475
   },
   "PresentFrame": {
    "kind": "member",
    "signature": "void PresentFrame()",
    "code": "// BackBuffer をウィンドウへ表示する。\n// DX9 では画面ロックなどで Device が「失われる（Lost）」ことがある。\n// その間は描画をあきらめて次のフレームへ進む（復帰処理はこの教材では扱わない）。\nconst HRESULT hr = m_device->Present(nullptr, nullptr, nullptr, nullptr);\nif (hr == D3DERR_DEVICELOST)\n{\n    return;\n}\nThrowIfFailed(hr, \"IDirect3DDevice9::Present failed.\");",
    "start": 439,
    "end": 447
   },
   "CreateDevice": {
    "kind": "member",
    "signature": "void CreateDevice(HWND hwnd)",
    "code": "// Direct3D 9 の入口（IDirect3D9）を作る。\nm_d3d.Attach(Direct3DCreate9(D3D_SDK_VERSION));\nif (!m_d3d)\n{\n    throw std::runtime_error(\"Direct3DCreate9 failed.\");\n}\n\n// 画面表示の条件を決める。BackBuffer と Depth 用の面もここで一緒に作られる。\nD3DPRESENT_PARAMETERS present{};\npresent.Windowed = TRUE;\npresent.SwapEffect = D3DSWAPEFFECT_DISCARD;\npresent.BackBufferFormat = D3DFMT_UNKNOWN;\npresent.BackBufferWidth = kClientWidth;\npresent.BackBufferHeight = kClientHeight;\npresent.EnableAutoDepthStencil = TRUE;\npresent.AutoDepthStencilFormat = D3DFMT_D24S8;\npresent.PresentationInterval = D3DPRESENT_INTERVAL_ONE;\n\n// Device を作る。頂点計算を GPU で行えない環境では CPU で行う設定で作り直す。\nHRESULT hr = m_d3d->CreateDevice(\n    D3DADAPTER_DEFAULT,\n    D3DDEVTYPE_HAL,\n    hwnd,\n    D3DCREATE_HARDWARE_VERTEXPROCESSING,\n    &present,\n    m_device.GetAddressOf());\nif (FAILED(hr))\n{\n    hr = m_d3d->CreateDevice(\n        D3DADAPTER_DEFAULT,\n        D3DDEVTYPE_HAL,\n        hwnd,\n        D3DCREATE_SOFTWARE_VERTEXPROCESSING,\n        &present,\n        m_device.GetAddressOf());\n}\nThrowIfFailed(hr, \"IDirect3D9::CreateDevice failed.\");",
    "start": 398,
    "end": 434
   },
   "RenderFullScene": {
    "kind": "member",
    "signature": "void RenderFullScene()",
    "code": "RenderScenePass();\nRenderPresentPass();\nPresentFrame();",
    "start": 390,
    "end": 392
   },
   "RenderOneObject": {
    "kind": "member",
    "signature": "void RenderOneObject(const DrawRange& range)",
    "code": "// 背景色と奥行き（Depth）を初期化する。\nThrowIfFailed(\n    m_device->Clear(0, nullptr, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER, D3DCOLOR_XRGB(24, 31, 42), 1.0f, 0),\n    \"IDirect3DDevice9::Clear failed.\");\nThrowIfFailed(m_device->BeginScene(), \"IDirect3DDevice9::BeginScene failed.\");\n\n// Icon.png を貼り、奥行き判定を有効にする。\nm_device->SetTexture(0, m_iconTexture.Get());\nm_device->SetRenderState(D3DRS_ZENABLE, TRUE);\nm_device->SetRenderState(D3DRS_ZWRITEENABLE, TRUE);\nm_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);\nSetCameraTransforms();\n\n// 渡された物体を1個、原点に描く。\nDrawObject(range, XMMatrixIdentity());\n\nThrowIfFailed(m_device->EndScene(), \"IDirect3DDevice9::EndScene failed.\");\nPresentFrame();",
    "start": 367,
    "end": 384
   },
   "RenderClearOnly": {
    "kind": "member",
    "signature": "void RenderClearOnly()",
    "code": "// 描画先（BackBuffer）を背景色で塗りつぶす。\nThrowIfFailed(\n    m_device->Clear(0, nullptr, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER, D3DCOLOR_XRGB(24, 31, 42), 1.0f, 0),\n    \"IDirect3DDevice9::Clear failed.\");\n\n// BackBuffer をウィンドウへ表示する。\nPresentFrame();",
    "start": 355,
    "end": 361
   }
  }
 },
 "dx11": {
  "source": "PreviewProj/DX11/main.cpp",
  "blocks": {
   "headers": {
    "code": "#include <d3d11.h>       // Direct3D 11 の Device・Context・Resource・View\n#include <d3dcompiler.h> // HLSL ファイルを実行時にコンパイルする\n#include <DirectXMath.h> // World / View / Projection 行列の計算\n#include <wincodec.h>    // WIC: Icon.png を画素の配列へ変換する\n#include <wrl/client.h>  // ComPtr: COM オブジェクトを自動で解放する\n\n#include <cstddef>    // std::size_t, offsetof\n#include <cstdint>    // std::uint8_t / std::uint16_t\n#include <exception>  // std::exception\n#include <filesystem> // Icon.png と HLSL ファイルの場所を探す\n#include <iterator>   // std::size（配列の要素数）\n#include <stdexcept>  // std::runtime_error\n#include <string>     // Shader のエラー文\n#include <vector>     // 画素・頂点・Index の配列\n\nusing Microsoft::WRL::ComPtr;\nusing namespace DirectX;\n\n#pragma comment(lib, \"d3d11.lib\")\n#pragma comment(lib, \"d3dcompiler.lib\")\n#pragma comment(lib, \"windowscodecs.lib\")\n#pragma comment(lib, \"ole32.lib\")",
    "start": 5,
    "end": 27
   },
   "types": {
    "code": "// F1 / F2 で切り替える投影方法。\nenum class ProjectionMode\n{\n    Orthographic, // 平行投影（遠近感なし）\n    Perspective,  // 透視投影（遠近感あり）\n};\n\n// F3〜F6 で切り替える、途中確認用の描画内容。\nenum class RenderStage\n{\n    ClearOnly, // F3: 背景色だけ\n    Sprite,    // F4: 画像を貼った四角形（Sprite）1枚\n    Cube,      // F5: 立方体1個\n    FullScene, // F6: 完成画面\n};\n\n// カメラ（View）と投影（Projection）の行列をまとめて返すための入れ物。\nstruct ViewProjectionMatrices\n{\n    XMMATRIX view;\n    XMMATRIX projection;\n};\n\n// PNG を読み込んだ結果。1画素 = B, G, R, A の4byte。\nstruct ImageData\n{\n    UINT width = 0;\n    UINT height = 0;\n    std::vector<std::uint8_t> pixels;\n};\n\n// 1頂点が持つデータ。位置・色・Texture 上の位置（UV）。\n// どの byte が何なのかは、CreateShaders の InputLayout で GPU に伝える。\nstruct Vertex\n{\n    XMFLOAT3 position;\n    XMFLOAT4 color;\n    XMFLOAT2 uv;\n};\n\n// 大きな IndexBuffer の中で、1つの物体が使う範囲。\nstruct DrawRange\n{\n    UINT startIndex = 0;\n    UINT indexCount = 0;\n};\n\n// すべての物体の頂点と Index を1つにまとめたもの。\nstruct SceneGeometry\n{\n    std::vector<Vertex> vertices;\n    std::vector<std::uint16_t> indices;\n    DrawRange sprite;\n    DrawRange floor;\n    DrawRange cube;\n    DrawRange pyramid;\n    DrawRange transparentPanel;\n    DrawRange presentQuad;\n};\n\n// Shader の cbuffer SceneConstants（register b0）と同じ形にする。\n// ConstantBuffer の大きさは 16byte の倍数でなければならない（float4x4 は 64byte）。\nstruct SceneConstants\n{\n    XMFLOAT4X4 worldViewProjection;\n};\nstatic_assert(sizeof(SceneConstants) % 16 == 0);",
    "start": 37,
    "end": 103
   },
   "renderer": {
    "code": "class Renderer\n{\npublic:\n    void Initialize(HWND hwnd)\n    {\n        CreateDeviceAndSwapChain(hwnd);\n        CreateBackBufferView();\n        CreateShaders();\n        CreateGeometryBuffers();\n        CreateConstantBuffer();\n        CreateIconTexture();\n        CreateDepthBuffer();\n        CreatePipelineStates();\n        CreateSceneTexture();\n    }\n\n    void SetProjectionMode(ProjectionMode mode)\n    {\n        m_projectionMode = mode;\n    }\n\n    // F3〜F6 で選ばれた段階の描画を呼ぶ。\n    void Render(RenderStage stage)\n    {\n        switch (stage)\n        {\n        case RenderStage::ClearOnly: RenderClearOnly(); break;\n        case RenderStage::Sprite: RenderOneObject(m_geometry.sprite); break;\n        case RenderStage::Cube: RenderOneObject(m_geometry.cube); break;\n        case RenderStage::FullScene: RenderFullScene(); break;\n        }\n    }\n\n    // 確認 1（F3）: 背景色で塗りつぶして表示するだけ。\n    void RenderClearOnly()\n    {\n        // TODO: RenderClearOnly\n    }\n\n    // 確認 2（F4 / F5）: BackBuffer へ直接、物体を1個だけ描く。\n    void RenderOneObject(const DrawRange& range)\n    {\n        // TODO: RenderOneObject\n    }\n\n    // 完成（F6）: SceneTexture へ描いてから、それを画面へ貼る 2-pass 描画。\n    void RenderFullScene()\n    {\n        // TODO: RenderFullScene\n    }\n\nprivate:\n    void CreateDeviceAndSwapChain(HWND hwnd)\n    {\n        // TODO: CreateDeviceAndSwapChain\n    }\n\n    void CreateBackBufferView()\n    {\n        // TODO: CreateBackBufferView\n    }\n\n    void CreateShaders()\n    {\n        // TODO: CreateShaders\n    }\n\n    void CreateGeometryBuffers()\n    {\n        // TODO: CreateGeometryBuffers\n    }\n\n    void CreateConstantBuffer()\n    {\n        // TODO: CreateConstantBuffer\n    }\n\n    void CreateIconTexture()\n    {\n        // TODO: CreateIconTexture\n    }\n\n    void CreateDepthBuffer()\n    {\n        // TODO: CreateDepthBuffer\n    }\n\n    void CreatePipelineStates()\n    {\n        // TODO: CreatePipelineStates\n    }\n\n    void CreateSceneTexture()\n    {\n        // TODO: CreateSceneTexture\n    }\n\n    void BindCommonPipeline()\n    {\n        // TODO: BindCommonPipeline\n    }\n\n    void DrawObject(const DrawRange& range, FXMMATRIX world, CXMMATRIX view, CXMMATRIX projection)\n    {\n        // TODO: DrawObject\n    }\n\n    void RenderScenePass()\n    {\n        // TODO: RenderScenePass\n    }\n\n    void RenderPresentPass()\n    {\n        // TODO: RenderPresentPass\n    }\n\n    ComPtr<ID3D11Device> m_device;\n    ComPtr<ID3D11DeviceContext> m_context;\n    ComPtr<IDXGISwapChain> m_swapChain;\n    ComPtr<ID3D11RenderTargetView> m_backBufferRTV;\n    ComPtr<ID3D11VertexShader> m_vertexShader;\n    ComPtr<ID3D11PixelShader> m_pixelShader;\n    ComPtr<ID3D11InputLayout> m_inputLayout;\n    ComPtr<ID3D11Buffer> m_vertexBuffer;\n    ComPtr<ID3D11Buffer> m_indexBuffer;\n    ComPtr<ID3D11Buffer> m_constantBuffer;\n    ComPtr<ID3D11ShaderResourceView> m_iconSRV;\n    ComPtr<ID3D11DepthStencilView> m_depthStencilView;\n    ComPtr<ID3D11SamplerState> m_sampler;\n    ComPtr<ID3D11RasterizerState> m_rasterizerState;\n    ComPtr<ID3D11DepthStencilState> m_depthWriteState;\n    ComPtr<ID3D11DepthStencilState> m_depthReadOnlyState;\n    ComPtr<ID3D11DepthStencilState> m_depthDisabledState;\n    ComPtr<ID3D11BlendState> m_opaqueBlendState;\n    ComPtr<ID3D11BlendState> m_alphaBlendState;\n    ComPtr<ID3D11RenderTargetView> m_sceneRTV;\n    ComPtr<ID3D11ShaderResourceView> m_sceneSRV;\n    SceneGeometry m_geometry;\n    ProjectionMode m_projectionMode = ProjectionMode::Perspective;\n};",
    "start": 368,
    "end": 840
   },
   "main": {
    "code": "int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int)\n{\n    try\n    {\n        // WIC は COM の仕組みで動くため、最初に COM を使える状態にする。\n        ThrowIfFailed(CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED), \"CoInitializeEx failed.\");\n\n        const HWND hwnd = CreateMainWindow(instance);\n        if (!hwnd)\n        {\n            throw std::runtime_error(\"Window creation failed.\");\n        }\n\n        Renderer renderer;\n        renderer.Initialize(hwnd);\n        RenderStage stage = RenderStage::FullScene;\n\n        MSG message{};\n        while (message.message != WM_QUIT)\n        {\n            // ウィンドウへのメッセージ（キー入力・閉じるなど）があれば先に処理する。\n            if (PeekMessageW(&message, nullptr, 0, 0, PM_REMOVE))\n            {\n                if (message.message == WM_KEYDOWN)\n                {\n                    switch (message.wParam)\n                    {\n                    case VK_F1: renderer.SetProjectionMode(ProjectionMode::Orthographic); break;\n                    case VK_F2: renderer.SetProjectionMode(ProjectionMode::Perspective); break;\n                    case VK_F3: stage = RenderStage::ClearOnly; break;\n                    case VK_F4: stage = RenderStage::Sprite; break;\n                    case VK_F5: stage = RenderStage::Cube; break;\n                    case VK_F6: stage = RenderStage::FullScene; break;\n                    }\n                }\n                TranslateMessage(&message);\n                DispatchMessageW(&message);\n                continue;\n            }\n\n            // メッセージがなければ、選ばれている段階を1フレーム描く。\n            renderer.Render(stage);\n        }\n\n        CoUninitialize();\n        return static_cast<int>(message.wParam);\n    }\n    catch (const std::exception& exception)\n    {\n        ShowErrorMessage(exception.what());\n        return -1;\n    }\n}",
    "start": 904,
    "end": 956
   }
  },
  "functions": {
   "ThrowIfFailed": {
    "kind": "helper",
    "signature": "void ThrowIfFailed(HRESULT hr, const char* message)",
    "code": "// HRESULT が失敗を示していたら、例外にして処理を止める。\nvoid ThrowIfFailed(HRESULT hr, const char* message)\n{\n    if (FAILED(hr))\n    {\n        throw std::runtime_error(message);\n    }\n}",
    "start": 107,
    "end": 114
   },
   "ShowErrorMessage": {
    "kind": "helper",
    "signature": "void ShowErrorMessage(const char* message)",
    "code": "// 例外のメッセージをダイアログで表示する。文字列は UTF-8 なので、Windows 用の UTF-16 へ変換する。\nvoid ShowErrorMessage(const char* message)\n{\n    const int length = MultiByteToWideChar(CP_UTF8, 0, message, -1, nullptr, 0);\n    std::wstring wideMessage(static_cast<std::size_t>(length), L'\\0');\n    MultiByteToWideChar(CP_UTF8, 0, message, -1, wideMessage.data(), length);\n    MessageBoxW(nullptr, wideMessage.c_str(), kWindowTitle, MB_OK | MB_ICONERROR);\n}",
    "start": 116,
    "end": 123
   },
   "GetShaderPath": {
    "kind": "helper",
    "signature": "std::filesystem::path GetShaderPath()",
    "code": "std::filesystem::path GetShaderPath()\n{\n    // main.cpp と同じフォルダーの HLSL を使う（HLSL を書き換えたら、ビルドし直さなくても次の起動で反映される）。\n    const std::filesystem::path besideSource = std::filesystem::path(__FILE__).parent_path() / L\"DX11SceneShader.hlsl\";\n    if (std::filesystem::exists(besideSource))\n    {\n        return besideSource;\n    }\n\n    // exe だけを別の PC へ持って行った場合は、ビルド時に exe の隣へコピーされた HLSL を使う。\n    wchar_t executablePath[MAX_PATH]{};\n    GetModuleFileNameW(nullptr, executablePath, MAX_PATH);\n    return std::filesystem::path(executablePath).parent_path() / L\"DX11SceneShader.hlsl\";\n}",
    "start": 125,
    "end": 138
   },
   "CompileShader": {
    "kind": "helper",
    "signature": "ComPtr<ID3DBlob> CompileShader(const std::filesystem::path& path, const char* entryPoint, const char* target)",
    "code": "ComPtr<ID3DBlob> CompileShader(const std::filesystem::path& path, const char* entryPoint, const char* target)\n{\n    // Debug ビルドでは、Shader もデバッグしやすい形でコンパイルする。\n    UINT flags = D3DCOMPILE_ENABLE_STRICTNESS;\n#if defined(_DEBUG)\n    flags |= D3DCOMPILE_DEBUG | D3DCOMPILE_SKIP_OPTIMIZATION;\n#endif\n\n    // HLSL ファイルの entryPoint 関数を、target（例: vs_5_0）の命令へコンパイルする。\n    ComPtr<ID3DBlob> shader;\n    ComPtr<ID3DBlob> errors;\n    const HRESULT hr = D3DCompileFromFile(\n        path.c_str(),\n        nullptr,\n        D3D_COMPILE_STANDARD_FILE_INCLUDE,\n        entryPoint,\n        target,\n        flags,\n        0,\n        shader.GetAddressOf(),\n        errors.GetAddressOf());\n\n    // 失敗したら、コンパイラのエラー文（行番号つき）をそのまま表示する。\n    if (FAILED(hr))\n    {\n        std::string message = \"HLSL のコンパイルに失敗しました。\\n\";\n        if (errors)\n        {\n            message.append(static_cast<const char*>(errors->GetBufferPointer()), errors->GetBufferSize());\n        }\n        throw std::runtime_error(message);\n    }\n    return shader;\n}",
    "start": 140,
    "end": 173
   },
   "GetIconPath": {
    "kind": "helper",
    "signature": "std::filesystem::path GetIconPath()",
    "code": "std::filesystem::path GetIconPath()\n{\n    // exe のあるフォルダーから親フォルダーへ向かって Icon.png を探す。\n    wchar_t executablePath[MAX_PATH]{};\n    GetModuleFileNameW(nullptr, executablePath, MAX_PATH);\n\n    std::filesystem::path directory = std::filesystem::path(executablePath).parent_path();\n    for (int i = 0; i < 5; ++i)\n    {\n        const std::filesystem::path candidate = directory / L\"Icon.png\";\n        if (std::filesystem::exists(candidate))\n        {\n            return candidate;\n        }\n        directory = directory.parent_path();\n    }\n\n    throw std::runtime_error(\"Icon.png が見つかりません。PracticeProj（または PreviewProj）フォルダーの中に Icon.png があるか確認してください。\");\n}",
    "start": 175,
    "end": 193
   },
   "LoadPngWithWIC": {
    "kind": "helper",
    "signature": "ImageData LoadPngWithWIC(const std::filesystem::path& path)",
    "code": "ImageData LoadPngWithWIC(const std::filesystem::path& path)\n{\n    // WIC の入口（Factory）を作る。\n    ComPtr<IWICImagingFactory> factory;\n    ThrowIfFailed(\n        CoCreateInstance(\n            CLSID_WICImagingFactory,\n            nullptr,\n            CLSCTX_INPROC_SERVER,\n            IID_PPV_ARGS(factory.GetAddressOf())),\n        \"CoCreateInstance(CLSID_WICImagingFactory) failed.\");\n\n    // PNG ファイルを開き、1枚目の画像を取り出す。\n    ComPtr<IWICBitmapDecoder> decoder;\n    ThrowIfFailed(\n        factory->CreateDecoderFromFilename(\n            path.c_str(),\n            nullptr,\n            GENERIC_READ,\n            WICDecodeMetadataCacheOnLoad,\n            decoder.GetAddressOf()),\n        \"IWICImagingFactory::CreateDecoderFromFilename failed.\");\n\n    ComPtr<IWICBitmapFrameDecode> frame;\n    ThrowIfFailed(decoder->GetFrame(0, frame.GetAddressOf()), \"IWICBitmapDecoder::GetFrame failed.\");\n\n    // どんな PNG でも、1画素 4byte の BGRA 形式へそろえる。\n    ComPtr<IWICFormatConverter> converter;\n    ThrowIfFailed(factory->CreateFormatConverter(converter.GetAddressOf()), \"IWICImagingFactory::CreateFormatConverter failed.\");\n    ThrowIfFailed(\n        converter->Initialize(\n            frame.Get(),\n            GUID_WICPixelFormat32bppBGRA,\n            WICBitmapDitherTypeNone,\n            nullptr,\n            0.0,\n            WICBitmapPaletteTypeCustom),\n        \"IWICFormatConverter::Initialize failed.\");\n\n    // 画像サイズを調べ、画素を CPU 側の配列へコピーする。\n    ImageData image;\n    ThrowIfFailed(converter->GetSize(&image.width, &image.height), \"IWICBitmapSource::GetSize failed.\");\n    const UINT rowPitch = image.width * 4;\n    image.pixels.resize(static_cast<std::size_t>(rowPitch) * image.height);\n    ThrowIfFailed(\n        converter->CopyPixels(nullptr, rowPitch, static_cast<UINT>(image.pixels.size()), image.pixels.data()),\n        \"IWICBitmapSource::CopyPixels failed.\");\n    return image;\n}",
    "start": 195,
    "end": 243
   },
   "AppendQuad": {
    "kind": "helper",
    "signature": "void AppendQuad( SceneGeometry& geometry, XMFLOAT3 p0, XMFLOAT3 p1, XMFLOAT3 p2, XMFLOAT3 p3, XMFLOAT4 color, float uvScale = 1.0f)",
    "code": "// 4頂点の四角形を、2枚の三角形（Index 6個）として追加する。\n// p0 = 左下、p1 = 左上、p2 = 右上、p3 = 右下 の順で渡す。\nvoid AppendQuad(\n    SceneGeometry& geometry,\n    XMFLOAT3 p0,\n    XMFLOAT3 p1,\n    XMFLOAT3 p2,\n    XMFLOAT3 p3,\n    XMFLOAT4 color,\n    float uvScale = 1.0f)\n{\n    const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());\n    geometry.vertices.push_back({ p0, color, { 0.0f, uvScale } });\n    geometry.vertices.push_back({ p1, color, { 0.0f, 0.0f } });\n    geometry.vertices.push_back({ p2, color, { uvScale, 0.0f } });\n    geometry.vertices.push_back({ p3, color, { uvScale, uvScale } });\n\n    const std::uint16_t quadIndices[] = { 0, 1, 2, 0, 2, 3 };\n    for (const std::uint16_t index : quadIndices)\n    {\n        geometry.indices.push_back(static_cast<std::uint16_t>(base + index));\n    }\n}",
    "start": 245,
    "end": 267
   },
   "AppendTriangle": {
    "kind": "helper",
    "signature": "void AppendTriangle( SceneGeometry& geometry, XMFLOAT3 p0, XMFLOAT3 p1, XMFLOAT3 p2, XMFLOAT4 color)",
    "code": "// 3頂点の三角形（Index 3個）を追加する。\nvoid AppendTriangle(\n    SceneGeometry& geometry,\n    XMFLOAT3 p0,\n    XMFLOAT3 p1,\n    XMFLOAT3 p2,\n    XMFLOAT4 color)\n{\n    const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());\n    geometry.vertices.push_back({ p0, color, { 0.0f, 1.0f } });\n    geometry.vertices.push_back({ p1, color, { 0.5f, 0.0f } });\n    geometry.vertices.push_back({ p2, color, { 1.0f, 1.0f } });\n\n    for (std::uint16_t index = 0; index < 3; ++index)\n    {\n        geometry.indices.push_back(static_cast<std::uint16_t>(base + index));\n    }\n}",
    "start": 269,
    "end": 286
   },
   "BuildSceneGeometry": {
    "kind": "helper",
    "signature": "SceneGeometry BuildSceneGeometry()",
    "code": "SceneGeometry BuildSceneGeometry()\n{\n    SceneGeometry geometry;\n    const XMFLOAT4 white{ 1.0f, 1.0f, 1.0f, 1.0f };\n\n    // 画像を1枚貼っただけの四角形（Sprite）。\n    geometry.sprite.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -2, -2, 0 }, { -2, 2, 0 }, { 2, 2, 0 }, { 2, -2, 0 }, white);\n    geometry.sprite.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.sprite.startIndex;\n\n    // 床。UV を 0～4 にして、Texture を 4×4 回繰り返す。\n    geometry.floor.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -5, -1.25f, -5 }, { -5, -1.25f, 5 }, { 5, -1.25f, 5 }, { 5, -1.25f, -5 }, white, 4.0f);\n    geometry.floor.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.floor.startIndex;\n\n    // 立方体。6面それぞれに Texture 全体を貼るため、面ごとに頂点を分ける。\n    geometry.cube.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -1, -1, -1 }, { -1, 1, -1 }, { 1, 1, -1 }, { 1, -1, -1 }, white); // 手前\n    AppendQuad(geometry, { 1, -1, 1 }, { 1, 1, 1 }, { -1, 1, 1 }, { -1, -1, 1 }, white);     // 奥\n    AppendQuad(geometry, { -1, -1, 1 }, { -1, 1, 1 }, { -1, 1, -1 }, { -1, -1, -1 }, white); // 左\n    AppendQuad(geometry, { 1, -1, -1 }, { 1, 1, -1 }, { 1, 1, 1 }, { 1, -1, 1 }, white);     // 右\n    AppendQuad(geometry, { -1, 1, -1 }, { -1, 1, 1 }, { 1, 1, 1 }, { 1, 1, -1 }, white);     // 上\n    AppendQuad(geometry, { -1, -1, 1 }, { -1, -1, -1 }, { 1, -1, -1 }, { 1, -1, 1 }, white); // 下\n    geometry.cube.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.cube.startIndex;\n\n    // 四角すい。底面1枚と側面4枚。\n    geometry.pyramid.startIndex = static_cast<UINT>(geometry.indices.size());\n    const XMFLOAT3 top{ 0.0f, 1.1f, 0.0f };\n    const XMFLOAT3 b0{ -1, -1, -1 };\n    const XMFLOAT3 b1{ -1, -1, 1 };\n    const XMFLOAT3 b2{ 1, -1, 1 };\n    const XMFLOAT3 b3{ 1, -1, -1 };\n    AppendQuad(geometry, b1, b0, b3, b2, white);\n    AppendTriangle(geometry, b0, top, b3, white);\n    AppendTriangle(geometry, b3, top, b2, white);\n    AppendTriangle(geometry, b2, top, b1, white);\n    AppendTriangle(geometry, b1, top, b0, white);\n    geometry.pyramid.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.pyramid.startIndex;\n\n    // 半透明のパネル。頂点色の alpha = 0.35。\n    geometry.transparentPanel.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(\n        geometry,\n        { -2.7f, -0.8f, -1.8f },\n        { -2.7f, 1.8f, -1.8f },\n        { 2.7f, 1.8f, -1.8f },\n        { 2.7f, -0.8f, -1.8f },\n        { 0.25f, 0.65f, 1.0f, 0.35f },\n        2.0f);\n    geometry.transparentPanel.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.transparentPanel.startIndex;\n\n    // 画面全体を覆う四角形。行列を使わず、-1～1 の座標がそのまま画面の端になる。\n    geometry.presentQuad.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -1, -1, 0 }, { -1, 1, 0 }, { 1, 1, 0 }, { 1, -1, 0 }, white);\n    geometry.presentQuad.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.presentQuad.startIndex;\n\n    return geometry;\n}",
    "start": 288,
    "end": 345
   },
   "BuildViewProjection": {
    "kind": "helper",
    "signature": "ViewProjectionMatrices BuildViewProjection(ProjectionMode mode)",
    "code": "ViewProjectionMatrices BuildViewProjection(ProjectionMode mode)\n{\n    // カメラ（View）はどちらの投影でも同じ。斜め上から原点のあたりを見下ろす。\n    const XMMATRIX view = XMMatrixLookAtLH(\n        XMVectorSet(0.0f, 3.2f, -7.5f, 1.0f),   // カメラの位置\n        XMVectorSet(0.0f, -0.1f, 0.0f, 1.0f),   // 見る点\n        XMVectorSet(0.0f, 1.0f, 0.0f, 0.0f));   // 上方向\n    const float aspect = static_cast<float>(kClientWidth) / static_cast<float>(kClientHeight);\n\n    // 平行投影: 遠くの物も近くの物も同じ大きさで映る。縦 9 の範囲が画面に収まる。\n    if (mode == ProjectionMode::Orthographic)\n    {\n        return { view, XMMatrixOrthographicLH(9.0f * aspect, 9.0f, 0.1f, 100.0f) };\n    }\n\n    // 透視投影: 遠くの物ほど小さく映る。上下の視野角は 60 度。\n    return { view, XMMatrixPerspectiveFovLH(XMConvertToRadians(60.0f), aspect, 0.1f, 100.0f) };\n}",
    "start": 347,
    "end": 364
   },
   "RenderPresentPass": {
    "kind": "member",
    "signature": "void RenderPresentPass()",
    "code": "// 2段階目: 描画先を BackBuffer の RTV にする（Depth は使わない）。\nconst float clearColor[4] = { 10.0f / 255.0f, 13.0f / 255.0f, 18.0f / 255.0f, 1.0f };\nm_context->OMSetRenderTargets(1, m_backBufferRTV.GetAddressOf(), nullptr);\nm_context->ClearRenderTargetView(m_backBufferRTV.Get(), clearColor);\n\n// さっき RTV で描いた SceneTexture を、今度は SRV（読み取り元）として Shader へ渡す。\nBindCommonPipeline();\nm_context->PSSetShaderResources(0, 1, m_sceneSRV.GetAddressOf());\nm_context->OMSetDepthStencilState(m_depthDisabledState.Get(), 0);\nm_context->OMSetBlendState(m_opaqueBlendState.Get(), nullptr, 0xFFFFFFFF);\n\n// 行列は何も変換しない単位行列にし、presentQuad の -1～1 をそのまま画面の端にする。\nDrawObject(m_geometry.presentQuad, XMMatrixIdentity(), XMMatrixIdentity(), XMMatrixIdentity());",
    "start": 802,
    "end": 814
   },
   "RenderScenePass": {
    "kind": "member",
    "signature": "void RenderScenePass()",
    "code": "// SceneTexture は前のフレームで SRV（読み取り元）として接続されたまま。\n// 同じ Texture を「読みながら描く」ことはできないので、先に SRV の接続を外す。\nID3D11ShaderResourceView* nullSRV = nullptr;\nm_context->PSSetShaderResources(0, 1, &nullSRV);\n\n// 1段階目: 描画先を SceneTexture の RTV + Depth にして、両方を初期化する。\nconst float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };\nm_context->OMSetRenderTargets(1, m_sceneRTV.GetAddressOf(), m_depthStencilView.Get());\nm_context->ClearRenderTargetView(m_sceneRTV.Get(), clearColor);\nm_context->ClearDepthStencilView(m_depthStencilView.Get(), D3D11_CLEAR_DEPTH, 1.0f, 0);\n\n// 共通の設定に加え、Icon.png・奥行きあり・不透明の State を接続する。\nBindCommonPipeline();\nm_context->PSSetShaderResources(0, 1, m_iconSRV.GetAddressOf());\nm_context->OMSetDepthStencilState(m_depthWriteState.Get(), 0);\nm_context->OMSetBlendState(m_opaqueBlendState.Get(), nullptr, 0xFFFFFFFF);\nconst ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);\n\n// 不透明な物体を描く。同じ形でも World 行列を変えれば別の場所に置ける。\nDrawObject(m_geometry.floor, XMMatrixIdentity(), matrices.view, matrices.projection);\nDrawObject(m_geometry.cube, XMMatrixTranslation(-1.65f, 0.0f, 0.0f), matrices.view, matrices.projection);\nDrawObject(m_geometry.pyramid, XMMatrixTranslation(1.65f, 0.0f, 0.0f), matrices.view, matrices.projection);\n\n// 半透明のパネルは最後に描く。State Object を「混ぜる」「Depth は書かない」ものへ差し替える。\nm_context->OMSetBlendState(m_alphaBlendState.Get(), nullptr, 0xFFFFFFFF);\nm_context->OMSetDepthStencilState(m_depthReadOnlyState.Get(), 0);\nDrawObject(m_geometry.transparentPanel, XMMatrixIdentity(), matrices.view, matrices.projection);",
    "start": 771,
    "end": 797
   },
   "DrawObject": {
    "kind": "member",
    "signature": "void DrawObject(const DrawRange& range, FXMMATRIX world, CXMMATRIX view, CXMMATRIX projection)",
    "code": "// World × View × Projection をまとめた行列を ConstantBuffer へ書き込む。\n// HLSL は列優先で行列を読むため、転置（Transpose）してから渡す。\nSceneConstants constants{};\nXMStoreFloat4x4(&constants.worldViewProjection, XMMatrixTranspose(world * view * projection));\nm_context->UpdateSubresource(m_constantBuffer.Get(), 0, nullptr, &constants, 0, 0);\n\n// IndexBuffer の startIndex から indexCount 個の Index を使って描く。\nm_context->DrawIndexed(range.indexCount, range.startIndex, 0);",
    "start": 759,
    "end": 766
   },
   "BindCommonPipeline": {
    "kind": "member",
    "signature": "void BindCommonPipeline()",
    "code": "// 入力: 頂点の読み方・三角形の並び・VertexBuffer・IndexBuffer。\nconst UINT stride = sizeof(Vertex);\nconst UINT offset = 0;\nm_context->IASetInputLayout(m_inputLayout.Get());\nm_context->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);\nm_context->IASetVertexBuffers(0, 1, m_vertexBuffer.GetAddressOf(), &stride, &offset);\nm_context->IASetIndexBuffer(m_indexBuffer.Get(), DXGI_FORMAT_R16_UINT, 0);\n\n// Shader と、Shader が読む ConstantBuffer（b0）・Sampler（s0）。\nm_context->VSSetShader(m_vertexShader.Get(), nullptr, 0);\nm_context->VSSetConstantBuffers(0, 1, m_constantBuffer.GetAddressOf());\nm_context->PSSetShader(m_pixelShader.Get(), nullptr, 0);\nm_context->PSSetSamplers(0, 1, m_sampler.GetAddressOf());\n\n// 描く範囲（Viewport = 画面全体）と、三角形の塗り方。\nconst D3D11_VIEWPORT viewport{ 0.0f, 0.0f, static_cast<float>(kClientWidth), static_cast<float>(kClientHeight), 0.0f, 1.0f };\nm_context->RSSetViewports(1, &viewport);\nm_context->RSSetState(m_rasterizerState.Get());",
    "start": 737,
    "end": 754
   },
   "CreateSceneTexture": {
    "kind": "member",
    "signature": "void CreateSceneTexture()",
    "code": "// 描画先にも、Shader から読む Texture にもなる SceneTexture を作る。\n// BindFlags に2つの用途（RENDER_TARGET と SHADER_RESOURCE）を両方指定する。\nD3D11_TEXTURE2D_DESC sceneDesc{};\nsceneDesc.Width = kClientWidth;\nsceneDesc.Height = kClientHeight;\nsceneDesc.MipLevels = 1;\nsceneDesc.ArraySize = 1;\nsceneDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;\nsceneDesc.SampleDesc.Count = 1;\nsceneDesc.Usage = D3D11_USAGE_DEFAULT;\nsceneDesc.BindFlags = D3D11_BIND_RENDER_TARGET | D3D11_BIND_SHADER_RESOURCE;\nComPtr<ID3D11Texture2D> sceneTexture;\nThrowIfFailed(\n    m_device->CreateTexture2D(&sceneDesc, nullptr, sceneTexture.GetAddressOf()),\n    \"CreateTexture2D(SceneTexture) failed.\");\n\n// 同じ Texture に、用途ごとの View を2つ作る。描くときは RTV、読むときは SRV。\nThrowIfFailed(\n    m_device->CreateRenderTargetView(sceneTexture.Get(), nullptr, m_sceneRTV.GetAddressOf()),\n    \"CreateRenderTargetView(SceneTexture) failed.\");\nThrowIfFailed(\n    m_device->CreateShaderResourceView(sceneTexture.Get(), nullptr, m_sceneSRV.GetAddressOf()),\n    \"CreateShaderResourceView(SceneTexture) failed.\");",
    "start": 710,
    "end": 732
   },
   "CreatePipelineStates": {
    "kind": "member",
    "signature": "void CreatePipelineStates()",
    "code": "// Sampler: UV が 0～1 を超えたら繰り返し（WRAP）、拡大縮小はなめらかに補間する。\nD3D11_SAMPLER_DESC samplerDesc{};\nsamplerDesc.Filter = D3D11_FILTER_MIN_MAG_MIP_LINEAR;\nsamplerDesc.AddressU = D3D11_TEXTURE_ADDRESS_WRAP;\nsamplerDesc.AddressV = D3D11_TEXTURE_ADDRESS_WRAP;\nsamplerDesc.AddressW = D3D11_TEXTURE_ADDRESS_WRAP;\nsamplerDesc.MaxAnisotropy = 1;\nsamplerDesc.ComparisonFunc = D3D11_COMPARISON_NEVER;\nsamplerDesc.MaxLOD = D3D11_FLOAT32_MAX;\nThrowIfFailed(m_device->CreateSamplerState(&samplerDesc, m_sampler.GetAddressOf()), \"CreateSamplerState failed.\");\n\n// Rasterizer: 三角形を塗りつぶし、裏向きの面も描く。\nD3D11_RASTERIZER_DESC rasterizerDesc{};\nrasterizerDesc.FillMode = D3D11_FILL_SOLID;\nrasterizerDesc.CullMode = D3D11_CULL_NONE;\nrasterizerDesc.DepthClipEnable = TRUE;\nThrowIfFailed(m_device->CreateRasterizerState(&rasterizerDesc, m_rasterizerState.GetAddressOf()), \"CreateRasterizerState failed.\");\n\n// Depth の3種類: 判定して書き込む（不透明）/ 判定だけ（半透明）/ 使わない（画面へ貼るとき）。\nD3D11_DEPTH_STENCIL_DESC depthWriteDesc{};\ndepthWriteDesc.DepthEnable = TRUE;\ndepthWriteDesc.DepthWriteMask = D3D11_DEPTH_WRITE_MASK_ALL;\ndepthWriteDesc.DepthFunc = D3D11_COMPARISON_LESS;\nThrowIfFailed(m_device->CreateDepthStencilState(&depthWriteDesc, m_depthWriteState.GetAddressOf()), \"CreateDepthStencilState(write) failed.\");\n\nD3D11_DEPTH_STENCIL_DESC depthReadOnlyDesc = depthWriteDesc;\ndepthReadOnlyDesc.DepthWriteMask = D3D11_DEPTH_WRITE_MASK_ZERO;\nThrowIfFailed(m_device->CreateDepthStencilState(&depthReadOnlyDesc, m_depthReadOnlyState.GetAddressOf()), \"CreateDepthStencilState(read only) failed.\");\n\nD3D11_DEPTH_STENCIL_DESC depthDisabledDesc{};\ndepthDisabledDesc.DepthEnable = FALSE;\ndepthDisabledDesc.DepthWriteMask = D3D11_DEPTH_WRITE_MASK_ZERO;\ndepthDisabledDesc.DepthFunc = D3D11_COMPARISON_ALWAYS;\nThrowIfFailed(m_device->CreateDepthStencilState(&depthDisabledDesc, m_depthDisabledState.GetAddressOf()), \"CreateDepthStencilState(disabled) failed.\");\n\n// Blend の2種類: 上書き（不透明）/ alpha で混ぜる（半透明）。\n// 半透明の式: 結果 = 新しい色 × alpha + 今の色 × (1 - alpha)\nD3D11_BLEND_DESC opaqueBlendDesc{};\nopaqueBlendDesc.RenderTarget[0].BlendEnable = FALSE;\nopaqueBlendDesc.RenderTarget[0].RenderTargetWriteMask = D3D11_COLOR_WRITE_ENABLE_ALL;\nThrowIfFailed(m_device->CreateBlendState(&opaqueBlendDesc, m_opaqueBlendState.GetAddressOf()), \"CreateBlendState(opaque) failed.\");\n\nD3D11_BLEND_DESC alphaBlendDesc = opaqueBlendDesc;\nD3D11_RENDER_TARGET_BLEND_DESC& alphaTarget = alphaBlendDesc.RenderTarget[0];\nalphaTarget.BlendEnable = TRUE;\nalphaTarget.SrcBlend = D3D11_BLEND_SRC_ALPHA;\nalphaTarget.DestBlend = D3D11_BLEND_INV_SRC_ALPHA;\nalphaTarget.BlendOp = D3D11_BLEND_OP_ADD;\nalphaTarget.SrcBlendAlpha = D3D11_BLEND_ONE;\nalphaTarget.DestBlendAlpha = D3D11_BLEND_ZERO;\nalphaTarget.BlendOpAlpha = D3D11_BLEND_OP_ADD;\nThrowIfFailed(m_device->CreateBlendState(&alphaBlendDesc, m_alphaBlendState.GetAddressOf()), \"CreateBlendState(alpha) failed.\");",
    "start": 654,
    "end": 705
   },
   "CreateDepthBuffer": {
    "kind": "member",
    "signature": "void CreateDepthBuffer()",
    "code": "// 奥行き（Depth）を記録する Texture2D を作る。1画素 = Depth 24bit + Stencil 8bit。\nD3D11_TEXTURE2D_DESC depthDesc{};\ndepthDesc.Width = kClientWidth;\ndepthDesc.Height = kClientHeight;\ndepthDesc.MipLevels = 1;\ndepthDesc.ArraySize = 1;\ndepthDesc.Format = DXGI_FORMAT_D24_UNORM_S8_UINT;\ndepthDesc.SampleDesc.Count = 1;\ndepthDesc.Usage = D3D11_USAGE_DEFAULT;\ndepthDesc.BindFlags = D3D11_BIND_DEPTH_STENCIL;\n\nComPtr<ID3D11Texture2D> depthTexture;\nThrowIfFailed(\n    m_device->CreateTexture2D(&depthDesc, nullptr, depthTexture.GetAddressOf()),\n    \"CreateTexture2D(Depth) failed.\");\n\n// 「Depth の書き込み先として使う」ための View（DSV）を作る。\nThrowIfFailed(\n    m_device->CreateDepthStencilView(depthTexture.Get(), nullptr, m_depthStencilView.GetAddressOf()),\n    \"CreateDepthStencilView failed.\");",
    "start": 630,
    "end": 649
   },
   "CreateIconTexture": {
    "kind": "member",
    "signature": "void CreateIconTexture()",
    "code": "// Icon.png を BGRA の画素配列として読み込む。\nconst ImageData image = LoadPngWithWIC(GetIconPath());\n\n// 画像と同じ大きさの Texture2D を、画素をコピーしながら作る。\n// SysMemPitch = CPU 側の画素配列で、1行が何 byte か。\nD3D11_TEXTURE2D_DESC textureDesc{};\ntextureDesc.Width = image.width;\ntextureDesc.Height = image.height;\ntextureDesc.MipLevels = 1;\ntextureDesc.ArraySize = 1;\ntextureDesc.Format = DXGI_FORMAT_B8G8R8A8_UNORM;\ntextureDesc.SampleDesc.Count = 1;\ntextureDesc.Usage = D3D11_USAGE_IMMUTABLE;\ntextureDesc.BindFlags = D3D11_BIND_SHADER_RESOURCE;\nD3D11_SUBRESOURCE_DATA textureData{};\ntextureData.pSysMem = image.pixels.data();\ntextureData.SysMemPitch = image.width * 4;\n\nComPtr<ID3D11Texture2D> texture;\nThrowIfFailed(\n    m_device->CreateTexture2D(&textureDesc, &textureData, texture.GetAddressOf()),\n    \"CreateTexture2D(Icon) failed.\");\n\n// Shader から読むための View（SRV）を作る。Shader には Texture ではなく SRV を渡す。\nThrowIfFailed(\n    m_device->CreateShaderResourceView(texture.Get(), nullptr, m_iconSRV.GetAddressOf()),\n    \"CreateShaderResourceView(Icon) failed.\");",
    "start": 599,
    "end": 625
   },
   "CreateConstantBuffer": {
    "kind": "member",
    "signature": "void CreateConstantBuffer()",
    "code": "// 物体ごとに書き換える行列（SceneConstants）を置く Buffer を作る。\n// DEFAULT = GPU 用のメモリ。中身は描画のたびに UpdateSubresource で更新する。\nD3D11_BUFFER_DESC constantDesc{};\nconstantDesc.ByteWidth = sizeof(SceneConstants);\nconstantDesc.Usage = D3D11_USAGE_DEFAULT;\nconstantDesc.BindFlags = D3D11_BIND_CONSTANT_BUFFER;\nThrowIfFailed(\n    m_device->CreateBuffer(&constantDesc, nullptr, m_constantBuffer.GetAddressOf()),\n    \"CreateBuffer(ConstantBuffer) failed.\");",
    "start": 586,
    "end": 594
   },
   "CreateGeometryBuffers": {
    "kind": "member",
    "signature": "void CreateGeometryBuffers()",
    "code": "// CPU 側で、すべての物体の頂点と Index を作る。\nm_geometry = BuildSceneGeometry();\n\n// VertexBuffer を作る。作成と同時に初期データ（pSysMem）をコピーする。\n// IMMUTABLE = 作った後は書き換えない。GPU が読みやすい場所に置ける。\nD3D11_BUFFER_DESC vertexDesc{};\nvertexDesc.ByteWidth = static_cast<UINT>(m_geometry.vertices.size() * sizeof(Vertex));\nvertexDesc.Usage = D3D11_USAGE_IMMUTABLE;\nvertexDesc.BindFlags = D3D11_BIND_VERTEX_BUFFER;\nD3D11_SUBRESOURCE_DATA vertexData{};\nvertexData.pSysMem = m_geometry.vertices.data();\nThrowIfFailed(\n    m_device->CreateBuffer(&vertexDesc, &vertexData, m_vertexBuffer.GetAddressOf()),\n    \"CreateBuffer(VertexBuffer) failed.\");\n\n// IndexBuffer も同じ手順。BindFlags だけが違う。\nD3D11_BUFFER_DESC indexDesc{};\nindexDesc.ByteWidth = static_cast<UINT>(m_geometry.indices.size() * sizeof(std::uint16_t));\nindexDesc.Usage = D3D11_USAGE_IMMUTABLE;\nindexDesc.BindFlags = D3D11_BIND_INDEX_BUFFER;\nD3D11_SUBRESOURCE_DATA indexData{};\nindexData.pSysMem = m_geometry.indices.data();\nThrowIfFailed(\n    m_device->CreateBuffer(&indexDesc, &indexData, m_indexBuffer.GetAddressOf()),\n    \"CreateBuffer(IndexBuffer) failed.\");",
    "start": 557,
    "end": 581
   },
   "CreateShaders": {
    "kind": "member",
    "signature": "void CreateShaders()",
    "code": "// HLSL ファイルの VSMain / PSMain を、それぞれ Shader Model 5.0 でコンパイルする。\nconst std::filesystem::path shaderPath = GetShaderPath();\nconst ComPtr<ID3DBlob> vertexShaderCode = CompileShader(shaderPath, \"VSMain\", \"vs_5_0\");\nconst ComPtr<ID3DBlob> pixelShaderCode = CompileShader(shaderPath, \"PSMain\", \"ps_5_0\");\n\n// コンパイル結果から VertexShader / PixelShader オブジェクトを作る。\nThrowIfFailed(\n    m_device->CreateVertexShader(\n        vertexShaderCode->GetBufferPointer(),\n        vertexShaderCode->GetBufferSize(),\n        nullptr,\n        m_vertexShader.GetAddressOf()),\n    \"CreateVertexShader failed.\");\nThrowIfFailed(\n    m_device->CreatePixelShader(\n        pixelShaderCode->GetBufferPointer(),\n        pixelShaderCode->GetBufferSize(),\n        nullptr,\n        m_pixelShader.GetAddressOf()),\n    \"CreatePixelShader failed.\");\n\n// InputLayout: Vertex の各メンバーを、HLSL の POSITION / COLOR / TEXCOORD と対応させる。\n// 「何 byte 目から・どの形式で」読むかを1行ずつ書く。\nconst D3D11_INPUT_ELEMENT_DESC inputElements[] =\n{\n    { \"POSITION\", 0, DXGI_FORMAT_R32G32B32_FLOAT,    0, offsetof(Vertex, position), D3D11_INPUT_PER_VERTEX_DATA, 0 },\n    { \"COLOR\",    0, DXGI_FORMAT_R32G32B32A32_FLOAT, 0, offsetof(Vertex, color),    D3D11_INPUT_PER_VERTEX_DATA, 0 },\n    { \"TEXCOORD\", 0, DXGI_FORMAT_R32G32_FLOAT,       0, offsetof(Vertex, uv),       D3D11_INPUT_PER_VERTEX_DATA, 0 },\n};\nThrowIfFailed(\n    m_device->CreateInputLayout(\n        inputElements,\n        static_cast<UINT>(std::size(inputElements)),\n        vertexShaderCode->GetBufferPointer(),\n        vertexShaderCode->GetBufferSize(),\n        m_inputLayout.GetAddressOf()),\n    \"CreateInputLayout failed.\");",
    "start": 516,
    "end": 552
   },
   "CreateBackBufferView": {
    "kind": "member",
    "signature": "void CreateBackBufferView()",
    "code": "// SwapChain が持つ BackBuffer（Texture2D）を取り出す。\nComPtr<ID3D11Texture2D> backBuffer;\nThrowIfFailed(\n    m_swapChain->GetBuffer(0, IID_PPV_ARGS(backBuffer.GetAddressOf())),\n    \"IDXGISwapChain::GetBuffer failed.\");\n\n// 「描画先として使う」ための View（RTV）を作る。Draw の描画先には Texture ではなく View を渡す。\nThrowIfFailed(\n    m_device->CreateRenderTargetView(backBuffer.Get(), nullptr, m_backBufferRTV.GetAddressOf()),\n    \"CreateRenderTargetView(BackBuffer) failed.\");",
    "start": 502,
    "end": 511
   },
   "CreateDeviceAndSwapChain": {
    "kind": "member",
    "signature": "void CreateDeviceAndSwapChain(HWND hwnd)",
    "code": "// SwapChain の設定: 1280×720 の BackBuffer を2枚用意し、交互に表示する。\nDXGI_SWAP_CHAIN_DESC swapChainDesc{};\nswapChainDesc.BufferDesc.Width = kClientWidth;\nswapChainDesc.BufferDesc.Height = kClientHeight;\nswapChainDesc.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;\nswapChainDesc.SampleDesc.Count = 1;\nswapChainDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;\nswapChainDesc.BufferCount = 2;\nswapChainDesc.OutputWindow = hwnd;\nswapChainDesc.Windowed = TRUE;\nswapChainDesc.SwapEffect = DXGI_SWAP_EFFECT_FLIP_DISCARD;\n\n// Debug ビルドでは Debug Layer を有効にし、API の使い方の誤りを「出力」ウィンドウへ表示させる。\nUINT flags = 0;\n#if defined(_DEBUG)\nflags |= D3D11_CREATE_DEVICE_DEBUG;\n#endif\nconst D3D_FEATURE_LEVEL featureLevel = D3D_FEATURE_LEVEL_11_0;\n\n// Device（作る係）・ImmediateContext（命令する係）・SwapChain（表示する係）を一度に作る。\nHRESULT hr = D3D11CreateDeviceAndSwapChain(\n    nullptr,\n    D3D_DRIVER_TYPE_HARDWARE,\n    nullptr,\n    flags,\n    &featureLevel,\n    1,\n    D3D11_SDK_VERSION,\n    &swapChainDesc,\n    m_swapChain.GetAddressOf(),\n    m_device.GetAddressOf(),\n    nullptr,\n    m_context.GetAddressOf());\n\n// Debug Layer が入っていない PC では失敗するため、Debug Layer なしで作り直す。\nif (FAILED(hr) && (flags & D3D11_CREATE_DEVICE_DEBUG) != 0)\n{\n    hr = D3D11CreateDeviceAndSwapChain(\n        nullptr,\n        D3D_DRIVER_TYPE_HARDWARE,\n        nullptr,\n        0,\n        &featureLevel,\n        1,\n        D3D11_SDK_VERSION,\n        &swapChainDesc,\n        m_swapChain.GetAddressOf(),\n        m_device.GetAddressOf(),\n        nullptr,\n        m_context.GetAddressOf());\n}\nThrowIfFailed(hr, \"D3D11CreateDeviceAndSwapChain failed.\");",
    "start": 446,
    "end": 497
   },
   "RenderFullScene": {
    "kind": "member",
    "signature": "void RenderFullScene()",
    "code": "RenderScenePass();\nRenderPresentPass();\nThrowIfFailed(m_swapChain->Present(1, 0), \"IDXGISwapChain::Present failed.\");",
    "start": 438,
    "end": 440
   },
   "RenderOneObject": {
    "kind": "member",
    "signature": "void RenderOneObject(const DrawRange& range)",
    "code": "// 描画先を BackBuffer + Depth にして、両方を初期化する。\nconst float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };\nm_context->OMSetRenderTargets(1, m_backBufferRTV.GetAddressOf(), m_depthStencilView.Get());\nm_context->ClearRenderTargetView(m_backBufferRTV.Get(), clearColor);\nm_context->ClearDepthStencilView(m_depthStencilView.Get(), D3D11_CLEAR_DEPTH, 1.0f, 0);\n\n// 共通の設定に加え、Icon.png・奥行きあり・不透明の State を接続する。\nBindCommonPipeline();\nm_context->PSSetShaderResources(0, 1, m_iconSRV.GetAddressOf());\nm_context->OMSetDepthStencilState(m_depthWriteState.Get(), 0);\nm_context->OMSetBlendState(m_opaqueBlendState.Get(), nullptr, 0xFFFFFFFF);\n\n// 渡された物体を1個、原点に描く。\nconst ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);\nDrawObject(range, XMMatrixIdentity(), matrices.view, matrices.projection);\n\nThrowIfFailed(m_swapChain->Present(1, 0), \"IDXGISwapChain::Present failed.\");",
    "start": 416,
    "end": 432
   },
   "RenderClearOnly": {
    "kind": "member",
    "signature": "void RenderClearOnly()",
    "code": "// 描画先を BackBuffer の RTV にして、背景色で塗りつぶす。\nconst float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };\nm_context->OMSetRenderTargets(1, m_backBufferRTV.GetAddressOf(), nullptr);\nm_context->ClearRenderTargetView(m_backBufferRTV.Get(), clearColor);\n\n// BackBuffer をウィンドウへ表示する。\nThrowIfFailed(m_swapChain->Present(1, 0), \"IDXGISwapChain::Present failed.\");",
    "start": 404,
    "end": 410
   }
  },
  "shader": {
   "path": "DX11SceneShader.hlsl",
   "code": "// C++ から渡される値。register の番号（b0 / t0 / s0）で C++ 側と対応させる。\ncbuffer SceneConstants : register(b0)\n{\n    float4x4 gWorldViewProjection; // World × View × Projection\n};\nTexture2D gTexture : register(t0);     // 貼る画像\nSamplerState gSampler : register(s0);  // 画像の読み方\n\n// VertexShader が受け取る1頂点。名前の後ろ（POSITION など）は InputLayout の SemanticName と一致させる。\nstruct VSInput\n{\n    float3 position : POSITION;\n    float4 color : COLOR0;\n    float2 uv : TEXCOORD0;\n};\n\n// VertexShader から PixelShader へ渡す値。SV_POSITION は画面上の位置として GPU が使う。\nstruct VSOutput\n{\n    float4 position : SV_POSITION;\n    float4 color : COLOR0;\n    float2 uv : TEXCOORD0;\n};\n\n// 頂点ごとに1回: 頂点の位置を、行列で画面上の位置へ変換する。\nVSOutput VSMain(VSInput input)\n{\n    VSOutput output;\n    output.position = mul(float4(input.position, 1.0f), gWorldViewProjection);\n    output.color = input.color;\n    output.uv = input.uv;\n    return output;\n}\n\n// 画素ごとに1回: 画像の色 × 頂点色 を、その画素の色にする。\nfloat4 PSMain(VSOutput input) : SV_TARGET\n{\n    return gTexture.Sample(gSampler, input.uv) * input.color;\n}",
   "start": 1,
   "end": 39
  }
 },
 "dx12": {
  "source": "PreviewProj/DX12/main.cpp",
  "blocks": {
   "headers": {
    "code": "#include <d3d12.h>       // Direct3D 12 の Device・Resource・Command・PSO\n#include <dxgi1_6.h>     // DXGI: GPU の選択と SwapChain（画面表示）\n#include <d3dcompiler.h> // HLSL のコンパイルと RootSignature の変換\n#include <DirectXMath.h> // World / View / Projection 行列の計算\n#include <wincodec.h>    // WIC: Icon.png を画素の配列へ変換する\n#include <wrl/client.h>  // ComPtr: COM オブジェクトを自動で解放する\n\n#include <array>      // BackBuffer 2枚の配列\n#include <cstddef>    // std::size_t, offsetof\n#include <cstdint>    // std::uint8_t / std::uint16_t\n#include <cstring>    // std::memcpy\n#include <exception>  // std::exception\n#include <filesystem> // Icon.png と HLSL ファイルの場所を探す\n#include <iterator>   // std::size（配列の要素数）\n#include <stdexcept>  // std::runtime_error\n#include <string>     // エラー文\n#include <vector>     // 画素・頂点・Index の配列\n\nusing Microsoft::WRL::ComPtr;\nusing namespace DirectX;\n\n#pragma comment(lib, \"d3d12.lib\")\n#pragma comment(lib, \"dxgi.lib\")\n#pragma comment(lib, \"d3dcompiler.lib\")\n#pragma comment(lib, \"windowscodecs.lib\")\n#pragma comment(lib, \"ole32.lib\")",
    "start": 5,
    "end": 31
   },
   "types": {
    "code": "// BackBuffer の枚数と、1フレームで描く物体の数（床・立方体・四角すい・パネル・画面用の四角形）。\nconstexpr UINT kFrameCount = 2;\nconstexpr UINT kObjectCount = 5;\n\n// DescriptorHeap の中の並び順。\n// RTV Heap: [0] [1] = BackBuffer、[2] = SceneTexture\n// SRV Heap: [0] = Icon.png、[1] = SceneTexture\nconstexpr UINT kSceneRtvIndex = kFrameCount;\nconstexpr UINT kIconSrvIndex = 0;\nconstexpr UINT kSceneSrvIndex = 1;\nconstexpr UINT kSrvCount = 2;\n\n// F1 / F2 で切り替える投影方法。\nenum class ProjectionMode\n{\n    Orthographic, // 平行投影（遠近感なし）\n    Perspective,  // 透視投影（遠近感あり）\n};\n\n// F3〜F6 で切り替える、途中確認用の描画内容。\nenum class RenderStage\n{\n    ClearOnly, // F3: 背景色だけ\n    Sprite,    // F4: 画像を貼った四角形（Sprite）1枚\n    Cube,      // F5: 立方体1個\n    FullScene, // F6: 完成画面\n};\n\n// カメラ（View）と投影（Projection）の行列をまとめて返すための入れ物。\nstruct ViewProjectionMatrices\n{\n    XMMATRIX view;\n    XMMATRIX projection;\n};\n\n// PNG を読み込んだ結果。1画素 = B, G, R, A の4byte。\nstruct ImageData\n{\n    UINT width = 0;\n    UINT height = 0;\n    std::vector<std::uint8_t> pixels;\n};\n\n// 1頂点が持つデータ。位置・色・Texture 上の位置（UV）。\n// どの byte が何なのかは、CreatePipelineStates の InputLayout で GPU に伝える。\nstruct Vertex\n{\n    XMFLOAT3 position;\n    XMFLOAT4 color;\n    XMFLOAT2 uv;\n};\n\n// 大きな IndexBuffer の中で、1つの物体が使う範囲。\nstruct DrawRange\n{\n    UINT startIndex = 0;\n    UINT indexCount = 0;\n};\n\n// すべての物体の頂点と Index を1つにまとめたもの。\nstruct SceneGeometry\n{\n    std::vector<Vertex> vertices;\n    std::vector<std::uint16_t> indices;\n    DrawRange sprite;\n    DrawRange floor;\n    DrawRange cube;\n    DrawRange pyramid;\n    DrawRange transparentPanel;\n    DrawRange presentQuad;\n};\n\n// Shader の cbuffer SceneConstants（register b0）と同じ形にする。\nstruct SceneConstants\n{\n    XMFLOAT4X4 worldViewProjection;\n};\n\n// ConstantBuffer は 256byte 境界から置く決まりがある。1物体ぶんを 256byte に切り上げた間隔。\nconstexpr UINT kConstantBufferStride =\n    (sizeof(SceneConstants) + D3D12_CONSTANT_BUFFER_DATA_PLACEMENT_ALIGNMENT - 1)\n    & ~(D3D12_CONSTANT_BUFFER_DATA_PLACEMENT_ALIGNMENT - 1);",
    "start": 41,
    "end": 122
   },
   "renderer": {
    "code": "class Renderer\n{\npublic:\n    ~Renderer()\n    {\n        // 毎フレーム GPU の完了を待っているので、ここで GPU が Resource を使っていることはない。\n        if (m_fenceEvent)\n        {\n            CloseHandle(m_fenceEvent);\n        }\n    }\n\n    void Initialize(HWND hwnd)\n    {\n        EnableDebugLayer();\n        CreateDeviceAndSwapChain(hwnd);\n        CreateDescriptorHeaps();\n        CreateBackBufferViews();\n        CreateCommandObjects();\n        CreateFence();\n        CreateRootSignature();\n        CreatePipelineStates();\n        UploadSceneResources();\n        CreateConstantBuffer();\n        CreateDepthBuffer();\n        CreateSceneTexture();\n    }\n\n    void SetProjectionMode(ProjectionMode mode)\n    {\n        m_projectionMode = mode;\n    }\n\n    // F3〜F6 で選ばれた段階の描画を呼ぶ。\n    void Render(RenderStage stage)\n    {\n        switch (stage)\n        {\n        case RenderStage::ClearOnly: RenderClearOnly(); break;\n        case RenderStage::Sprite: RenderOneObject(m_geometry.sprite); break;\n        case RenderStage::Cube: RenderOneObject(m_geometry.cube); break;\n        case RenderStage::FullScene: RenderFullScene(); break;\n        }\n    }\n\n    // 確認 1（F3）: 背景色で塗りつぶして表示するだけ。\n    void RenderClearOnly()\n    {\n        // TODO: RenderClearOnly\n    }\n\n    // 確認 2（F4 / F5）: BackBuffer へ直接、物体を1個だけ描く。\n    void RenderOneObject(const DrawRange& range)\n    {\n        // TODO: RenderOneObject\n    }\n\n    // 完成（F6）: SceneTexture へ描いてから、それを画面へ貼る 2-pass 描画。\n    void RenderFullScene()\n    {\n        // TODO: RenderFullScene\n    }\n\nprivate:\n    void EnableDebugLayer()\n    {\n        // TODO: EnableDebugLayer\n    }\n\n    void CreateDeviceAndSwapChain(HWND hwnd)\n    {\n        // TODO: CreateDeviceAndSwapChain\n    }\n\n    void CreateDescriptorHeaps()\n    {\n        // TODO: CreateDescriptorHeaps\n    }\n\n    void CreateBackBufferViews()\n    {\n        // TODO: CreateBackBufferViews\n    }\n\n    void CreateCommandObjects()\n    {\n        // TODO: CreateCommandObjects\n    }\n\n    void CreateFence()\n    {\n        // TODO: CreateFence\n    }\n\n    void ExecuteCommandList()\n    {\n        // TODO: ExecuteCommandList\n    }\n\n    void WaitForGpu()\n    {\n        // TODO: WaitForGpu\n    }\n\n    void BeginFrame()\n    {\n        // TODO: BeginFrame\n    }\n\n    void EndFrame()\n    {\n        // TODO: EndFrame\n    }\n\n    void CreateRootSignature()\n    {\n        // TODO: CreateRootSignature\n    }\n\n    void CreatePipelineStates()\n    {\n        // TODO: CreatePipelineStates\n    }\n\n    void CreateDefaultBuffer(\n        const void* data,\n        UINT64 byteSize,\n        D3D12_RESOURCE_STATES finalState,\n        ComPtr<ID3D12Resource>& defaultBuffer,\n        ComPtr<ID3D12Resource>& uploadBuffer)\n    {\n        // TODO: CreateDefaultBuffer\n    }\n\n    void CreateGeometryBuffers(ComPtr<ID3D12Resource>& vertexUpload, ComPtr<ID3D12Resource>& indexUpload)\n    {\n        // TODO: CreateGeometryBuffers\n    }\n\n    void CreateIconTexture(ComPtr<ID3D12Resource>& textureUpload)\n    {\n        // TODO: CreateIconTexture\n    }\n\n    void UploadSceneResources()\n    {\n        // TODO: UploadSceneResources\n    }\n\n    void CreateConstantBuffer()\n    {\n        // TODO: CreateConstantBuffer\n    }\n\n    void CreateDepthBuffer()\n    {\n        // TODO: CreateDepthBuffer\n    }\n\n    void CreateSceneTexture()\n    {\n        // TODO: CreateSceneTexture\n    }\n\n    void BindCommonPipeline()\n    {\n        // TODO: BindCommonPipeline\n    }\n\n    void DrawObject(UINT objectIndex, const DrawRange& range, FXMMATRIX world, CXMMATRIX view, CXMMATRIX projection)\n    {\n        // TODO: DrawObject\n    }\n\n    void RenderScenePass()\n    {\n        // TODO: RenderScenePass\n    }\n\n    void RenderPresentPass()\n    {\n        // TODO: RenderPresentPass\n    }\n\n    bool m_debugLayerEnabled = false;\n    ComPtr<IDXGIFactory6> m_factory;\n    ComPtr<ID3D12Device> m_device;\n    ComPtr<ID3D12CommandQueue> m_commandQueue;\n    ComPtr<IDXGISwapChain3> m_swapChain;\n    std::array<ComPtr<ID3D12Resource>, kFrameCount> m_backBuffers;\n    UINT m_frameIndex = 0;\n\n    ComPtr<ID3D12DescriptorHeap> m_rtvHeap;\n    ComPtr<ID3D12DescriptorHeap> m_dsvHeap;\n    ComPtr<ID3D12DescriptorHeap> m_srvHeap;\n    UINT m_rtvDescriptorSize = 0;\n    UINT m_srvDescriptorSize = 0;\n\n    ComPtr<ID3D12CommandAllocator> m_commandAllocator;\n    ComPtr<ID3D12GraphicsCommandList> m_commandList;\n    ComPtr<ID3D12Fence> m_fence;\n    UINT64 m_fenceValue = 0;\n    HANDLE m_fenceEvent = nullptr;\n\n    ComPtr<ID3D12RootSignature> m_rootSignature;\n    ComPtr<ID3D12PipelineState> m_opaquePSO;\n    ComPtr<ID3D12PipelineState> m_alphaBlendPSO;\n    ComPtr<ID3D12PipelineState> m_presentPSO;\n\n    SceneGeometry m_geometry;\n    ComPtr<ID3D12Resource> m_vertexBuffer;\n    ComPtr<ID3D12Resource> m_indexBuffer;\n    D3D12_VERTEX_BUFFER_VIEW m_vertexBufferView{};\n    D3D12_INDEX_BUFFER_VIEW m_indexBufferView{};\n    ComPtr<ID3D12Resource> m_iconTexture;\n    ComPtr<ID3D12Resource> m_constantBuffer;\n    std::uint8_t* m_mappedConstants = nullptr;\n    ComPtr<ID3D12Resource> m_depthBuffer;\n    ComPtr<ID3D12Resource> m_sceneTexture;\n    ProjectionMode m_projectionMode = ProjectionMode::Perspective;\n};",
    "start": 444,
    "end": 1182
   },
   "main": {
    "code": "int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int)\n{\n    try\n    {\n        // WIC は COM の仕組みで動くため、最初に COM を使える状態にする。\n        ThrowIfFailed(CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED), \"CoInitializeEx failed.\");\n\n        const HWND hwnd = CreateMainWindow(instance);\n        if (!hwnd)\n        {\n            throw std::runtime_error(\"Window creation failed.\");\n        }\n\n        Renderer renderer;\n        renderer.Initialize(hwnd);\n        RenderStage stage = RenderStage::FullScene;\n\n        MSG message{};\n        while (message.message != WM_QUIT)\n        {\n            // ウィンドウへのメッセージ（キー入力・閉じるなど）があれば先に処理する。\n            if (PeekMessageW(&message, nullptr, 0, 0, PM_REMOVE))\n            {\n                if (message.message == WM_KEYDOWN)\n                {\n                    switch (message.wParam)\n                    {\n                    case VK_F1: renderer.SetProjectionMode(ProjectionMode::Orthographic); break;\n                    case VK_F2: renderer.SetProjectionMode(ProjectionMode::Perspective); break;\n                    case VK_F3: stage = RenderStage::ClearOnly; break;\n                    case VK_F4: stage = RenderStage::Sprite; break;\n                    case VK_F5: stage = RenderStage::Cube; break;\n                    case VK_F6: stage = RenderStage::FullScene; break;\n                    }\n                }\n                TranslateMessage(&message);\n                DispatchMessageW(&message);\n                continue;\n            }\n\n            // メッセージがなければ、選ばれている段階を1フレーム描く。\n            renderer.Render(stage);\n        }\n\n        CoUninitialize();\n        return static_cast<int>(message.wParam);\n    }\n    catch (const std::exception& exception)\n    {\n        ShowErrorMessage(exception.what());\n        return -1;\n    }\n}",
    "start": 1246,
    "end": 1298
   }
  },
  "functions": {
   "ThrowIfFailed": {
    "kind": "helper",
    "signature": "void ThrowIfFailed(HRESULT hr, const char* message)",
    "code": "// HRESULT が失敗を示していたら、例外にして処理を止める。\nvoid ThrowIfFailed(HRESULT hr, const char* message)\n{\n    if (FAILED(hr))\n    {\n        throw std::runtime_error(message);\n    }\n}",
    "start": 126,
    "end": 133
   },
   "ShowErrorMessage": {
    "kind": "helper",
    "signature": "void ShowErrorMessage(const char* message)",
    "code": "// 例外のメッセージをダイアログで表示する。文字列は UTF-8 なので、Windows 用の UTF-16 へ変換する。\nvoid ShowErrorMessage(const char* message)\n{\n    const int length = MultiByteToWideChar(CP_UTF8, 0, message, -1, nullptr, 0);\n    std::wstring wideMessage(static_cast<std::size_t>(length), L'\\0');\n    MultiByteToWideChar(CP_UTF8, 0, message, -1, wideMessage.data(), length);\n    MessageBoxW(nullptr, wideMessage.c_str(), kWindowTitle, MB_OK | MB_ICONERROR);\n}",
    "start": 135,
    "end": 142
   },
   "CpuHandle": {
    "kind": "helper",
    "signature": "D3D12_CPU_DESCRIPTOR_HANDLE CpuHandle(ID3D12DescriptorHeap* heap, UINT index, UINT descriptorSize)",
    "code": "// DescriptorHeap の index 番目の場所。「Heap の先頭 + index × 1個の大きさ」で求める。\nD3D12_CPU_DESCRIPTOR_HANDLE CpuHandle(ID3D12DescriptorHeap* heap, UINT index, UINT descriptorSize)\n{\n    D3D12_CPU_DESCRIPTOR_HANDLE handle = heap->GetCPUDescriptorHandleForHeapStart();\n    handle.ptr += static_cast<SIZE_T>(index) * descriptorSize;\n    return handle;\n}",
    "start": 144,
    "end": 150
   },
   "GpuHandle": {
    "kind": "helper",
    "signature": "D3D12_GPU_DESCRIPTOR_HANDLE GpuHandle(ID3D12DescriptorHeap* heap, UINT index, UINT descriptorSize)",
    "code": "// Shader から見るときの場所（GPU 側の番地）も、同じ計算で求める。\nD3D12_GPU_DESCRIPTOR_HANDLE GpuHandle(ID3D12DescriptorHeap* heap, UINT index, UINT descriptorSize)\n{\n    D3D12_GPU_DESCRIPTOR_HANDLE handle = heap->GetGPUDescriptorHandleForHeapStart();\n    handle.ptr += static_cast<UINT64>(index) * descriptorSize;\n    return handle;\n}",
    "start": 152,
    "end": 158
   },
   "TransitionBarrier": {
    "kind": "helper",
    "signature": "D3D12_RESOURCE_BARRIER TransitionBarrier(ID3D12Resource* resource, D3D12_RESOURCE_STATES before, D3D12_RESOURCE_STATES after)",
    "code": "// Resource の使い方（State）を before から after へ切り替える命令（Barrier）の内容を作る。\nD3D12_RESOURCE_BARRIER TransitionBarrier(ID3D12Resource* resource, D3D12_RESOURCE_STATES before, D3D12_RESOURCE_STATES after)\n{\n    D3D12_RESOURCE_BARRIER barrier{};\n    barrier.Type = D3D12_RESOURCE_BARRIER_TYPE_TRANSITION;\n    barrier.Transition.pResource = resource;\n    barrier.Transition.Subresource = D3D12_RESOURCE_BARRIER_ALL_SUBRESOURCES;\n    barrier.Transition.StateBefore = before;\n    barrier.Transition.StateAfter = after;\n    return barrier;\n}",
    "start": 160,
    "end": 170
   },
   "GetShaderPath": {
    "kind": "helper",
    "signature": "std::filesystem::path GetShaderPath()",
    "code": "std::filesystem::path GetShaderPath()\n{\n    // main.cpp と同じフォルダーの HLSL を使う（HLSL を書き換えたら、ビルドし直さなくても次の起動で反映される）。\n    const std::filesystem::path besideSource = std::filesystem::path(__FILE__).parent_path() / L\"DX12SceneShader.hlsl\";\n    if (std::filesystem::exists(besideSource))\n    {\n        return besideSource;\n    }\n\n    // exe だけを別の PC へ持って行った場合は、ビルド時に exe の隣へコピーされた HLSL を使う。\n    wchar_t executablePath[MAX_PATH]{};\n    GetModuleFileNameW(nullptr, executablePath, MAX_PATH);\n    return std::filesystem::path(executablePath).parent_path() / L\"DX12SceneShader.hlsl\";\n}",
    "start": 172,
    "end": 185
   },
   "CompileShader": {
    "kind": "helper",
    "signature": "ComPtr<ID3DBlob> CompileShader(const std::filesystem::path& path, const char* entryPoint, const char* target)",
    "code": "ComPtr<ID3DBlob> CompileShader(const std::filesystem::path& path, const char* entryPoint, const char* target)\n{\n    // Debug ビルドでは、Shader もデバッグしやすい形でコンパイルする。\n    UINT flags = D3DCOMPILE_ENABLE_STRICTNESS;\n#if defined(_DEBUG)\n    flags |= D3DCOMPILE_DEBUG | D3DCOMPILE_SKIP_OPTIMIZATION;\n#endif\n\n    // HLSL ファイルの entryPoint 関数を、target（例: vs_5_1）の命令へコンパイルする。\n    ComPtr<ID3DBlob> shader;\n    ComPtr<ID3DBlob> errors;\n    const HRESULT hr = D3DCompileFromFile(\n        path.c_str(),\n        nullptr,\n        D3D_COMPILE_STANDARD_FILE_INCLUDE,\n        entryPoint,\n        target,\n        flags,\n        0,\n        shader.GetAddressOf(),\n        errors.GetAddressOf());\n\n    // 失敗したら、コンパイラのエラー文（行番号つき）をそのまま表示する。\n    if (FAILED(hr))\n    {\n        std::string message = \"HLSL のコンパイルに失敗しました。\\n\";\n        if (errors)\n        {\n            message.append(static_cast<const char*>(errors->GetBufferPointer()), errors->GetBufferSize());\n        }\n        throw std::runtime_error(message);\n    }\n    return shader;\n}",
    "start": 187,
    "end": 220
   },
   "HeapProperties": {
    "kind": "helper",
    "signature": "D3D12_HEAP_PROPERTIES HeapProperties(D3D12_HEAP_TYPE type)",
    "code": "// Resource を置くメモリ（Heap）の種類を指定する。\n// DEFAULT = GPU 専用で速い。UPLOAD = CPU から書き込める（GPU からも読める）。\nD3D12_HEAP_PROPERTIES HeapProperties(D3D12_HEAP_TYPE type)\n{\n    D3D12_HEAP_PROPERTIES properties{};\n    properties.Type = type;\n    properties.CPUPageProperty = D3D12_CPU_PAGE_PROPERTY_UNKNOWN;\n    properties.MemoryPoolPreference = D3D12_MEMORY_POOL_UNKNOWN;\n    properties.CreationNodeMask = 1;\n    properties.VisibleNodeMask = 1;\n    return properties;\n}",
    "start": 222,
    "end": 233
   },
   "BufferDescription": {
    "kind": "helper",
    "signature": "D3D12_RESOURCE_DESC BufferDescription(UINT64 size)",
    "code": "// size byte のただの Buffer（1次元のメモリ）を作るための設定。\nD3D12_RESOURCE_DESC BufferDescription(UINT64 size)\n{\n    D3D12_RESOURCE_DESC desc{};\n    desc.Dimension = D3D12_RESOURCE_DIMENSION_BUFFER;\n    desc.Width = size;\n    desc.Height = 1;\n    desc.DepthOrArraySize = 1;\n    desc.MipLevels = 1;\n    desc.Format = DXGI_FORMAT_UNKNOWN;\n    desc.SampleDesc.Count = 1;\n    desc.Layout = D3D12_TEXTURE_LAYOUT_ROW_MAJOR;\n    desc.Flags = D3D12_RESOURCE_FLAG_NONE;\n    return desc;\n}",
    "start": 235,
    "end": 249
   },
   "GetIconPath": {
    "kind": "helper",
    "signature": "std::filesystem::path GetIconPath()",
    "code": "std::filesystem::path GetIconPath()\n{\n    // exe のあるフォルダーから親フォルダーへ向かって Icon.png を探す。\n    wchar_t executablePath[MAX_PATH]{};\n    GetModuleFileNameW(nullptr, executablePath, MAX_PATH);\n\n    std::filesystem::path directory = std::filesystem::path(executablePath).parent_path();\n    for (int i = 0; i < 5; ++i)\n    {\n        const std::filesystem::path candidate = directory / L\"Icon.png\";\n        if (std::filesystem::exists(candidate))\n        {\n            return candidate;\n        }\n        directory = directory.parent_path();\n    }\n\n    throw std::runtime_error(\"Icon.png が見つかりません。PracticeProj（または PreviewProj）フォルダーの中に Icon.png があるか確認してください。\");\n}",
    "start": 251,
    "end": 269
   },
   "LoadPngWithWIC": {
    "kind": "helper",
    "signature": "ImageData LoadPngWithWIC(const std::filesystem::path& path)",
    "code": "ImageData LoadPngWithWIC(const std::filesystem::path& path)\n{\n    // WIC の入口（Factory）を作る。\n    ComPtr<IWICImagingFactory> factory;\n    ThrowIfFailed(\n        CoCreateInstance(\n            CLSID_WICImagingFactory,\n            nullptr,\n            CLSCTX_INPROC_SERVER,\n            IID_PPV_ARGS(factory.GetAddressOf())),\n        \"CoCreateInstance(CLSID_WICImagingFactory) failed.\");\n\n    // PNG ファイルを開き、1枚目の画像を取り出す。\n    ComPtr<IWICBitmapDecoder> decoder;\n    ThrowIfFailed(\n        factory->CreateDecoderFromFilename(\n            path.c_str(),\n            nullptr,\n            GENERIC_READ,\n            WICDecodeMetadataCacheOnLoad,\n            decoder.GetAddressOf()),\n        \"IWICImagingFactory::CreateDecoderFromFilename failed.\");\n\n    ComPtr<IWICBitmapFrameDecode> frame;\n    ThrowIfFailed(decoder->GetFrame(0, frame.GetAddressOf()), \"IWICBitmapDecoder::GetFrame failed.\");\n\n    // どんな PNG でも、1画素 4byte の BGRA 形式へそろえる。\n    ComPtr<IWICFormatConverter> converter;\n    ThrowIfFailed(factory->CreateFormatConverter(converter.GetAddressOf()), \"IWICImagingFactory::CreateFormatConverter failed.\");\n    ThrowIfFailed(\n        converter->Initialize(\n            frame.Get(),\n            GUID_WICPixelFormat32bppBGRA,\n            WICBitmapDitherTypeNone,\n            nullptr,\n            0.0,\n            WICBitmapPaletteTypeCustom),\n        \"IWICFormatConverter::Initialize failed.\");\n\n    // 画像サイズを調べ、画素を CPU 側の配列へコピーする。\n    ImageData image;\n    ThrowIfFailed(converter->GetSize(&image.width, &image.height), \"IWICBitmapSource::GetSize failed.\");\n    const UINT rowPitch = image.width * 4;\n    image.pixels.resize(static_cast<std::size_t>(rowPitch) * image.height);\n    ThrowIfFailed(\n        converter->CopyPixels(nullptr, rowPitch, static_cast<UINT>(image.pixels.size()), image.pixels.data()),\n        \"IWICBitmapSource::CopyPixels failed.\");\n    return image;\n}",
    "start": 271,
    "end": 319
   },
   "AppendQuad": {
    "kind": "helper",
    "signature": "void AppendQuad( SceneGeometry& geometry, XMFLOAT3 p0, XMFLOAT3 p1, XMFLOAT3 p2, XMFLOAT3 p3, XMFLOAT4 color, float uvScale = 1.0f)",
    "code": "// 4頂点の四角形を、2枚の三角形（Index 6個）として追加する。\n// p0 = 左下、p1 = 左上、p2 = 右上、p3 = 右下 の順で渡す。\nvoid AppendQuad(\n    SceneGeometry& geometry,\n    XMFLOAT3 p0,\n    XMFLOAT3 p1,\n    XMFLOAT3 p2,\n    XMFLOAT3 p3,\n    XMFLOAT4 color,\n    float uvScale = 1.0f)\n{\n    const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());\n    geometry.vertices.push_back({ p0, color, { 0.0f, uvScale } });\n    geometry.vertices.push_back({ p1, color, { 0.0f, 0.0f } });\n    geometry.vertices.push_back({ p2, color, { uvScale, 0.0f } });\n    geometry.vertices.push_back({ p3, color, { uvScale, uvScale } });\n\n    const std::uint16_t quadIndices[] = { 0, 1, 2, 0, 2, 3 };\n    for (const std::uint16_t index : quadIndices)\n    {\n        geometry.indices.push_back(static_cast<std::uint16_t>(base + index));\n    }\n}",
    "start": 321,
    "end": 343
   },
   "AppendTriangle": {
    "kind": "helper",
    "signature": "void AppendTriangle( SceneGeometry& geometry, XMFLOAT3 p0, XMFLOAT3 p1, XMFLOAT3 p2, XMFLOAT4 color)",
    "code": "// 3頂点の三角形（Index 3個）を追加する。\nvoid AppendTriangle(\n    SceneGeometry& geometry,\n    XMFLOAT3 p0,\n    XMFLOAT3 p1,\n    XMFLOAT3 p2,\n    XMFLOAT4 color)\n{\n    const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());\n    geometry.vertices.push_back({ p0, color, { 0.0f, 1.0f } });\n    geometry.vertices.push_back({ p1, color, { 0.5f, 0.0f } });\n    geometry.vertices.push_back({ p2, color, { 1.0f, 1.0f } });\n\n    for (std::uint16_t index = 0; index < 3; ++index)\n    {\n        geometry.indices.push_back(static_cast<std::uint16_t>(base + index));\n    }\n}",
    "start": 345,
    "end": 362
   },
   "BuildSceneGeometry": {
    "kind": "helper",
    "signature": "SceneGeometry BuildSceneGeometry()",
    "code": "SceneGeometry BuildSceneGeometry()\n{\n    SceneGeometry geometry;\n    const XMFLOAT4 white{ 1.0f, 1.0f, 1.0f, 1.0f };\n\n    // 画像を1枚貼っただけの四角形（Sprite）。\n    geometry.sprite.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -2, -2, 0 }, { -2, 2, 0 }, { 2, 2, 0 }, { 2, -2, 0 }, white);\n    geometry.sprite.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.sprite.startIndex;\n\n    // 床。UV を 0～4 にして、Texture を 4×4 回繰り返す。\n    geometry.floor.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -5, -1.25f, -5 }, { -5, -1.25f, 5 }, { 5, -1.25f, 5 }, { 5, -1.25f, -5 }, white, 4.0f);\n    geometry.floor.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.floor.startIndex;\n\n    // 立方体。6面それぞれに Texture 全体を貼るため、面ごとに頂点を分ける。\n    geometry.cube.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -1, -1, -1 }, { -1, 1, -1 }, { 1, 1, -1 }, { 1, -1, -1 }, white); // 手前\n    AppendQuad(geometry, { 1, -1, 1 }, { 1, 1, 1 }, { -1, 1, 1 }, { -1, -1, 1 }, white);     // 奥\n    AppendQuad(geometry, { -1, -1, 1 }, { -1, 1, 1 }, { -1, 1, -1 }, { -1, -1, -1 }, white); // 左\n    AppendQuad(geometry, { 1, -1, -1 }, { 1, 1, -1 }, { 1, 1, 1 }, { 1, -1, 1 }, white);     // 右\n    AppendQuad(geometry, { -1, 1, -1 }, { -1, 1, 1 }, { 1, 1, 1 }, { 1, 1, -1 }, white);     // 上\n    AppendQuad(geometry, { -1, -1, 1 }, { -1, -1, -1 }, { 1, -1, -1 }, { 1, -1, 1 }, white); // 下\n    geometry.cube.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.cube.startIndex;\n\n    // 四角すい。底面1枚と側面4枚。\n    geometry.pyramid.startIndex = static_cast<UINT>(geometry.indices.size());\n    const XMFLOAT3 top{ 0.0f, 1.1f, 0.0f };\n    const XMFLOAT3 b0{ -1, -1, -1 };\n    const XMFLOAT3 b1{ -1, -1, 1 };\n    const XMFLOAT3 b2{ 1, -1, 1 };\n    const XMFLOAT3 b3{ 1, -1, -1 };\n    AppendQuad(geometry, b1, b0, b3, b2, white);\n    AppendTriangle(geometry, b0, top, b3, white);\n    AppendTriangle(geometry, b3, top, b2, white);\n    AppendTriangle(geometry, b2, top, b1, white);\n    AppendTriangle(geometry, b1, top, b0, white);\n    geometry.pyramid.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.pyramid.startIndex;\n\n    // 半透明のパネル。頂点色の alpha = 0.35。\n    geometry.transparentPanel.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(\n        geometry,\n        { -2.7f, -0.8f, -1.8f },\n        { -2.7f, 1.8f, -1.8f },\n        { 2.7f, 1.8f, -1.8f },\n        { 2.7f, -0.8f, -1.8f },\n        { 0.25f, 0.65f, 1.0f, 0.35f },\n        2.0f);\n    geometry.transparentPanel.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.transparentPanel.startIndex;\n\n    // 画面全体を覆う四角形。行列を使わず、-1～1 の座標がそのまま画面の端になる。\n    geometry.presentQuad.startIndex = static_cast<UINT>(geometry.indices.size());\n    AppendQuad(geometry, { -1, -1, 0 }, { -1, 1, 0 }, { 1, 1, 0 }, { 1, -1, 0 }, white);\n    geometry.presentQuad.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.presentQuad.startIndex;\n\n    return geometry;\n}",
    "start": 364,
    "end": 421
   },
   "BuildViewProjection": {
    "kind": "helper",
    "signature": "ViewProjectionMatrices BuildViewProjection(ProjectionMode mode)",
    "code": "ViewProjectionMatrices BuildViewProjection(ProjectionMode mode)\n{\n    // カメラ（View）はどちらの投影でも同じ。斜め上から原点のあたりを見下ろす。\n    const XMMATRIX view = XMMatrixLookAtLH(\n        XMVectorSet(0.0f, 3.2f, -7.5f, 1.0f),   // カメラの位置\n        XMVectorSet(0.0f, -0.1f, 0.0f, 1.0f),   // 見る点\n        XMVectorSet(0.0f, 1.0f, 0.0f, 0.0f));   // 上方向\n    const float aspect = static_cast<float>(kClientWidth) / static_cast<float>(kClientHeight);\n\n    // 平行投影: 遠くの物も近くの物も同じ大きさで映る。縦 9 の範囲が画面に収まる。\n    if (mode == ProjectionMode::Orthographic)\n    {\n        return { view, XMMatrixOrthographicLH(9.0f * aspect, 9.0f, 0.1f, 100.0f) };\n    }\n\n    // 透視投影: 遠くの物ほど小さく映る。上下の視野角は 60 度。\n    return { view, XMMatrixPerspectiveFovLH(XMConvertToRadians(60.0f), aspect, 0.1f, 100.0f) };\n}",
    "start": 423,
    "end": 440
   },
   "RenderPresentPass": {
    "kind": "member",
    "signature": "void RenderPresentPass()",
    "code": "// 2段階目: 描画先を今の BackBuffer の RTV にする（Depth は使わない）。\nconst float clearColor[4] = { 10.0f / 255.0f, 13.0f / 255.0f, 18.0f / 255.0f, 1.0f };\nconst D3D12_CPU_DESCRIPTOR_HANDLE rtv = CpuHandle(m_rtvHeap.Get(), m_frameIndex, m_rtvDescriptorSize);\nm_commandList->OMSetRenderTargets(1, &rtv, FALSE, nullptr);\nm_commandList->ClearRenderTargetView(rtv, clearColor, 0, nullptr);\n\n// 画面へ貼る用 PSO にし、t0 に SceneTexture の SRV を指定する。\nBindCommonPipeline();\nm_commandList->SetPipelineState(m_presentPSO.Get());\nm_commandList->SetGraphicsRootDescriptorTable(1, GpuHandle(m_srvHeap.Get(), kSceneSrvIndex, m_srvDescriptorSize));\n\n// 行列は何も変換しない単位行列にし、presentQuad の -1～1 をそのまま画面の端にする。\nDrawObject(4, m_geometry.presentQuad, XMMatrixIdentity(), XMMatrixIdentity(), XMMatrixIdentity());",
    "start": 1131,
    "end": 1143
   },
   "RenderScenePass": {
    "kind": "member",
    "signature": "void RenderScenePass()",
    "code": "// SceneTexture を「Shader から読む」から「描画先」へ切り替える。\nconst D3D12_RESOURCE_BARRIER toRenderTarget = TransitionBarrier(\n    m_sceneTexture.Get(),\n    D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE,\n    D3D12_RESOURCE_STATE_RENDER_TARGET);\nm_commandList->ResourceBarrier(1, &toRenderTarget);\n\n// 1段階目: 描画先を SceneTexture の RTV + Depth にして、両方を初期化する。\nconst float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };\nconst D3D12_CPU_DESCRIPTOR_HANDLE rtv = CpuHandle(m_rtvHeap.Get(), kSceneRtvIndex, m_rtvDescriptorSize);\nconst D3D12_CPU_DESCRIPTOR_HANDLE dsv = m_dsvHeap->GetCPUDescriptorHandleForHeapStart();\nm_commandList->OMSetRenderTargets(1, &rtv, FALSE, &dsv);\nm_commandList->ClearRenderTargetView(rtv, clearColor, 0, nullptr);\nm_commandList->ClearDepthStencilView(dsv, D3D12_CLEAR_FLAG_DEPTH, 1.0f, 0, 0, nullptr);\n\n// 共通の設定に加え、不透明用 PSO と Icon.png の SRV（t0）を指定する。\nBindCommonPipeline();\nm_commandList->SetPipelineState(m_opaquePSO.Get());\nm_commandList->SetGraphicsRootDescriptorTable(1, GpuHandle(m_srvHeap.Get(), kIconSrvIndex, m_srvDescriptorSize));\nconst ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);\n\n// 不透明な物体を描く。物体ごとに別の objectIndex（ConstantBuffer の場所）を使う。\nDrawObject(0, m_geometry.floor, XMMatrixIdentity(), matrices.view, matrices.projection);\nDrawObject(1, m_geometry.cube, XMMatrixTranslation(-1.65f, 0.0f, 0.0f), matrices.view, matrices.projection);\nDrawObject(2, m_geometry.pyramid, XMMatrixTranslation(1.65f, 0.0f, 0.0f), matrices.view, matrices.projection);\n\n// 半透明のパネルは最後に、半透明用の PSO へ切り替えて描く。\nm_commandList->SetPipelineState(m_alphaBlendPSO.Get());\nDrawObject(3, m_geometry.transparentPanel, XMMatrixIdentity(), matrices.view, matrices.projection);\n\n// 描き終えた SceneTexture を「描画先」から「Shader から読む」へ切り替える。\nconst D3D12_RESOURCE_BARRIER toShaderResource = TransitionBarrier(\n    m_sceneTexture.Get(),\n    D3D12_RESOURCE_STATE_RENDER_TARGET,\n    D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE);\nm_commandList->ResourceBarrier(1, &toShaderResource);",
    "start": 1091,
    "end": 1126
   },
   "DrawObject": {
    "kind": "member",
    "signature": "void DrawObject(UINT objectIndex, const DrawRange& range, FXMMATRIX world, CXMMATRIX view, CXMMATRIX projection)",
    "code": "// この物体専用の場所（objectIndex 番目の 256byte）へ、転置した WVP 行列を書き込む。\n// 物体ごとに場所を分けるのは、GPU が実際に描くのは命令を送った後だから。\n// 同じ場所を上書きすると、全部の物体が最後に書いた行列で描かれてしまう。\nSceneConstants constants{};\nXMStoreFloat4x4(&constants.worldViewProjection, XMMatrixTranspose(world * view * projection));\nstd::memcpy(m_mappedConstants + static_cast<std::size_t>(objectIndex) * kConstantBufferStride, &constants, sizeof(constants));\n\n// Root Parameter 0（b0）にその場所の GPU 番地を指定し、Index を使って描く命令を記録する。\nconst D3D12_GPU_VIRTUAL_ADDRESS address = m_constantBuffer->GetGPUVirtualAddress() + static_cast<UINT64>(objectIndex) * kConstantBufferStride;\nm_commandList->SetGraphicsRootConstantBufferView(0, address);\nm_commandList->DrawIndexedInstanced(range.indexCount, 1, range.startIndex, 0, 0);",
    "start": 1076,
    "end": 1086
   },
   "BindCommonPipeline": {
    "kind": "member",
    "signature": "void BindCommonPipeline()",
    "code": "// RootSignature と、Shader が参照する DescriptorHeap を指定する。\nm_commandList->SetGraphicsRootSignature(m_rootSignature.Get());\nID3D12DescriptorHeap* heaps[] = { m_srvHeap.Get() };\nm_commandList->SetDescriptorHeaps(1, heaps);\n\n// 描く範囲。DX12 では Viewport に加えて Scissor（切り抜く範囲）も必ず指定する。\nconst D3D12_VIEWPORT viewport{ 0.0f, 0.0f, static_cast<float>(kClientWidth), static_cast<float>(kClientHeight), 0.0f, 1.0f };\nconst D3D12_RECT scissor{ 0, 0, static_cast<LONG>(kClientWidth), static_cast<LONG>(kClientHeight) };\nm_commandList->RSSetViewports(1, &viewport);\nm_commandList->RSSetScissorRects(1, &scissor);\n\n// 入力: 三角形の並び・VertexBuffer・IndexBuffer。\nm_commandList->IASetPrimitiveTopology(D3D_PRIMITIVE_TOPOLOGY_TRIANGLELIST);\nm_commandList->IASetVertexBuffers(0, 1, &m_vertexBufferView);\nm_commandList->IASetIndexBuffer(&m_indexBufferView);",
    "start": 1057,
    "end": 1071
   },
   "CreateSceneTexture": {
    "kind": "member",
    "signature": "void CreateSceneTexture()",
    "code": "// 描画先にも、Shader から読む Texture にもなる SceneTexture を作る。\n// 最初の State は「Shader から読む」。描く直前に Barrier で「描画先」へ切り替える。\nD3D12_RESOURCE_DESC sceneDesc{};\nsceneDesc.Dimension = D3D12_RESOURCE_DIMENSION_TEXTURE2D;\nsceneDesc.Width = kClientWidth;\nsceneDesc.Height = kClientHeight;\nsceneDesc.DepthOrArraySize = 1;\nsceneDesc.MipLevels = 1;\nsceneDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;\nsceneDesc.SampleDesc.Count = 1;\nsceneDesc.Layout = D3D12_TEXTURE_LAYOUT_UNKNOWN;\nsceneDesc.Flags = D3D12_RESOURCE_FLAG_ALLOW_RENDER_TARGET;\n\nD3D12_CLEAR_VALUE clearValue{};\nclearValue.Format = sceneDesc.Format;\nclearValue.Color[0] = 24.0f / 255.0f;\nclearValue.Color[1] = 31.0f / 255.0f;\nclearValue.Color[2] = 42.0f / 255.0f;\nclearValue.Color[3] = 1.0f;\nconst D3D12_HEAP_PROPERTIES defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);\nThrowIfFailed(\n    m_device->CreateCommittedResource(&defaultHeap, D3D12_HEAP_FLAG_NONE, &sceneDesc, D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE, &clearValue, IID_PPV_ARGS(m_sceneTexture.GetAddressOf())),\n    \"CreateCommittedResource(SceneTexture) failed.\");\n\n// 同じ Resource に、描画先としての RTV と、読み取り元としての SRV を書き込む。\nm_device->CreateRenderTargetView(m_sceneTexture.Get(), nullptr, CpuHandle(m_rtvHeap.Get(), kSceneRtvIndex, m_rtvDescriptorSize));\nm_device->CreateShaderResourceView(m_sceneTexture.Get(), nullptr, CpuHandle(m_srvHeap.Get(), kSceneSrvIndex, m_srvDescriptorSize));",
    "start": 1026,
    "end": 1052
   },
   "CreateDepthBuffer": {
    "kind": "member",
    "signature": "void CreateDepthBuffer()",
    "code": "// 奥行き（Depth）を記録する Texture を GPU 用メモリに作る。最初から Depth の書き込み用 State にする。\nD3D12_RESOURCE_DESC depthDesc{};\ndepthDesc.Dimension = D3D12_RESOURCE_DIMENSION_TEXTURE2D;\ndepthDesc.Width = kClientWidth;\ndepthDesc.Height = kClientHeight;\ndepthDesc.DepthOrArraySize = 1;\ndepthDesc.MipLevels = 1;\ndepthDesc.Format = DXGI_FORMAT_D24_UNORM_S8_UINT;\ndepthDesc.SampleDesc.Count = 1;\ndepthDesc.Layout = D3D12_TEXTURE_LAYOUT_UNKNOWN;\ndepthDesc.Flags = D3D12_RESOURCE_FLAG_ALLOW_DEPTH_STENCIL;\n\n// Clear に使う値を作成時に伝えておくと、GPU が Clear を速く行える。\nD3D12_CLEAR_VALUE clearValue{};\nclearValue.Format = depthDesc.Format;\nclearValue.DepthStencil.Depth = 1.0f;\nconst D3D12_HEAP_PROPERTIES defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);\nThrowIfFailed(\n    m_device->CreateCommittedResource(&defaultHeap, D3D12_HEAP_FLAG_NONE, &depthDesc, D3D12_RESOURCE_STATE_DEPTH_WRITE, &clearValue, IID_PPV_ARGS(m_depthBuffer.GetAddressOf())),\n    \"CreateCommittedResource(Depth) failed.\");\n\n// DSV Heap の [0] に DSV を書き込む。\nm_device->CreateDepthStencilView(m_depthBuffer.Get(), nullptr, m_dsvHeap->GetCPUDescriptorHandleForHeapStart());",
    "start": 999,
    "end": 1021
   },
   "CreateConstantBuffer": {
    "kind": "member",
    "signature": "void CreateConstantBuffer()",
    "code": "// 物体ごとの行列を置く ConstantBuffer を、CPU から毎フレーム書ける UPLOAD メモリに作る。\n// 物体1個ぶんを 256byte ずつ離して、kObjectCount 個ぶん確保する。\nconst D3D12_HEAP_PROPERTIES uploadHeap = HeapProperties(D3D12_HEAP_TYPE_UPLOAD);\nconst D3D12_RESOURCE_DESC constantDesc = BufferDescription(static_cast<UINT64>(kConstantBufferStride) * kObjectCount);\nThrowIfFailed(\n    m_device->CreateCommittedResource(&uploadHeap, D3D12_HEAP_FLAG_NONE, &constantDesc, D3D12_RESOURCE_STATE_GENERIC_READ, nullptr, IID_PPV_ARGS(m_constantBuffer.GetAddressOf())),\n    \"CreateCommittedResource(ConstantBuffer) failed.\");\n\n// Map したままにして、描画のたびに m_mappedConstants へ書き込む。\nconst D3D12_RANGE noRead{ 0, 0 };\nThrowIfFailed(m_constantBuffer->Map(0, &noRead, reinterpret_cast<void**>(&m_mappedConstants)), \"ID3D12Resource::Map failed.\");",
    "start": 984,
    "end": 994
   },
   "UploadSceneResources": {
    "kind": "member",
    "signature": "void UploadSceneResources()",
    "code": "// 転送命令の記録を始める。\nThrowIfFailed(m_commandAllocator->Reset(), \"ID3D12CommandAllocator::Reset failed.\");\nThrowIfFailed(m_commandList->Reset(m_commandAllocator.Get(), nullptr), \"ID3D12GraphicsCommandList::Reset failed.\");\n\n// 転送用 Buffer は、GPU のコピーが終わるまで解放してはいけないので、ここで持っておく。\nComPtr<ID3D12Resource> vertexUpload;\nComPtr<ID3D12Resource> indexUpload;\nComPtr<ID3D12Resource> textureUpload;\nCreateGeometryBuffers(vertexUpload, indexUpload);\nCreateIconTexture(textureUpload);\n\n// 記録した転送命令を GPU で実行し、終わるまで待つ。関数を抜けると転送用 Buffer は解放される。\nExecuteCommandList();\nWaitForGpu();",
    "start": 966,
    "end": 979
   },
   "CreateIconTexture": {
    "kind": "member",
    "signature": "void CreateIconTexture(ComPtr<ID3D12Resource>& textureUpload)",
    "code": "// Icon.png を BGRA の画素配列として読み込み、同じ大きさの Texture を GPU 用メモリに作る。\nconst ImageData image = LoadPngWithWIC(GetIconPath());\nD3D12_RESOURCE_DESC textureDesc{};\ntextureDesc.Dimension = D3D12_RESOURCE_DIMENSION_TEXTURE2D;\ntextureDesc.Width = image.width;\ntextureDesc.Height = image.height;\ntextureDesc.DepthOrArraySize = 1;\ntextureDesc.MipLevels = 1;\ntextureDesc.Format = DXGI_FORMAT_B8G8R8A8_UNORM;\ntextureDesc.SampleDesc.Count = 1;\ntextureDesc.Layout = D3D12_TEXTURE_LAYOUT_UNKNOWN;\nconst D3D12_HEAP_PROPERTIES defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);\nThrowIfFailed(\n    m_device->CreateCommittedResource(&defaultHeap, D3D12_HEAP_FLAG_NONE, &textureDesc, D3D12_RESOURCE_STATE_COPY_DEST, nullptr, IID_PPV_ARGS(m_iconTexture.GetAddressOf())),\n    \"CreateCommittedResource(Icon texture) failed.\");\n\n// 転送用 Buffer の並べ方を Device に聞く。GPU へのコピーでは1行を 256byte の倍数に揃える必要がある。\nD3D12_PLACED_SUBRESOURCE_FOOTPRINT footprint{};\nUINT rowCount = 0;\nUINT64 rowBytes = 0;\nUINT64 uploadBytes = 0;\nm_device->GetCopyableFootprints(&textureDesc, 0, 1, 0, &footprint, &rowCount, &rowBytes, &uploadBytes);\n\n// 転送用 Buffer を作り、画素を1行ずつ（行の間隔 = RowPitch）書き込む。\nconst D3D12_HEAP_PROPERTIES uploadHeap = HeapProperties(D3D12_HEAP_TYPE_UPLOAD);\nconst D3D12_RESOURCE_DESC uploadDesc = BufferDescription(uploadBytes);\nThrowIfFailed(\n    m_device->CreateCommittedResource(&uploadHeap, D3D12_HEAP_FLAG_NONE, &uploadDesc, D3D12_RESOURCE_STATE_GENERIC_READ, nullptr, IID_PPV_ARGS(textureUpload.GetAddressOf())),\n    \"CreateCommittedResource(Icon upload) failed.\");\n\nstd::uint8_t* mapped = nullptr;\nconst D3D12_RANGE noRead{ 0, 0 };\nThrowIfFailed(textureUpload->Map(0, &noRead, reinterpret_cast<void**>(&mapped)), \"ID3D12Resource::Map failed.\");\nconst UINT sourceRowPitch = image.width * 4;\nfor (UINT y = 0; y < rowCount; ++y)\n{\n    std::memcpy(\n        mapped + footprint.Offset + static_cast<std::size_t>(y) * footprint.Footprint.RowPitch,\n        image.pixels.data() + static_cast<std::size_t>(y) * sourceRowPitch,\n        sourceRowPitch);\n}\ntextureUpload->Unmap(0, nullptr);\n\n// 「転送用 Buffer → Texture」のコピー命令と、Shader から読む State への Barrier を記録する。\nD3D12_TEXTURE_COPY_LOCATION destination{};\ndestination.pResource = m_iconTexture.Get();\ndestination.Type = D3D12_TEXTURE_COPY_TYPE_SUBRESOURCE_INDEX;\ndestination.SubresourceIndex = 0;\nD3D12_TEXTURE_COPY_LOCATION source{};\nsource.pResource = textureUpload.Get();\nsource.Type = D3D12_TEXTURE_COPY_TYPE_PLACED_FOOTPRINT;\nsource.PlacedFootprint = footprint;\nm_commandList->CopyTextureRegion(&destination, 0, 0, 0, &source, nullptr);\n\nconst D3D12_RESOURCE_BARRIER barrier = TransitionBarrier(m_iconTexture.Get(), D3D12_RESOURCE_STATE_COPY_DEST, D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE);\nm_commandList->ResourceBarrier(1, &barrier);\n\n// SRV Heap の [kIconSrvIndex] に、Shader から読むための SRV を書き込む。\nD3D12_SHADER_RESOURCE_VIEW_DESC srvDesc{};\nsrvDesc.Shader4ComponentMapping = D3D12_DEFAULT_SHADER_4_COMPONENT_MAPPING;\nsrvDesc.Format = textureDesc.Format;\nsrvDesc.ViewDimension = D3D12_SRV_DIMENSION_TEXTURE2D;\nsrvDesc.Texture2D.MipLevels = 1;\nm_device->CreateShaderResourceView(m_iconTexture.Get(), &srvDesc, CpuHandle(m_srvHeap.Get(), kIconSrvIndex, m_srvDescriptorSize));",
    "start": 898,
    "end": 961
   },
   "CreateGeometryBuffers": {
    "kind": "member",
    "signature": "void CreateGeometryBuffers(ComPtr<ID3D12Resource>& vertexUpload, ComPtr<ID3D12Resource>& indexUpload)",
    "code": "// CPU 側で、すべての物体の頂点と Index を作る。\nm_geometry = BuildSceneGeometry();\n\n// VertexBuffer を GPU 用メモリに作り、View（どこから何 byte ずつ読むか）を用意する。\nconst UINT vertexBytes = static_cast<UINT>(m_geometry.vertices.size() * sizeof(Vertex));\nCreateDefaultBuffer(m_geometry.vertices.data(), vertexBytes, D3D12_RESOURCE_STATE_VERTEX_AND_CONSTANT_BUFFER, m_vertexBuffer, vertexUpload);\nm_vertexBufferView.BufferLocation = m_vertexBuffer->GetGPUVirtualAddress();\nm_vertexBufferView.SizeInBytes = vertexBytes;\nm_vertexBufferView.StrideInBytes = sizeof(Vertex);\n\n// IndexBuffer も同じ手順。Index は 16bit（R16_UINT）。\nconst UINT indexBytes = static_cast<UINT>(m_geometry.indices.size() * sizeof(std::uint16_t));\nCreateDefaultBuffer(m_geometry.indices.data(), indexBytes, D3D12_RESOURCE_STATE_INDEX_BUFFER, m_indexBuffer, indexUpload);\nm_indexBufferView.BufferLocation = m_indexBuffer->GetGPUVirtualAddress();\nm_indexBufferView.SizeInBytes = indexBytes;\nm_indexBufferView.Format = DXGI_FORMAT_R16_UINT;",
    "start": 878,
    "end": 893
   },
   "CreateDefaultBuffer": {
    "kind": "member",
    "signature": "void CreateDefaultBuffer( const void* data, UINT64 byteSize, D3D12_RESOURCE_STATES finalState, ComPtr<ID3D12Resource>& defaultBuffer, ComPtr<ID3D12Resource>& uploadBuffer)",
    "code": "// GPU 用（DEFAULT）と、CPU から書き込む転送用（UPLOAD）の Buffer を同じ大きさで作る。\n// Buffer は作成直後、必ず COMMON（特定の用途なし）という State になる。\nconst D3D12_HEAP_PROPERTIES defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);\nconst D3D12_HEAP_PROPERTIES uploadHeap = HeapProperties(D3D12_HEAP_TYPE_UPLOAD);\nconst D3D12_RESOURCE_DESC bufferDesc = BufferDescription(byteSize);\nThrowIfFailed(\n    m_device->CreateCommittedResource(&defaultHeap, D3D12_HEAP_FLAG_NONE, &bufferDesc, D3D12_RESOURCE_STATE_COMMON, nullptr, IID_PPV_ARGS(defaultBuffer.GetAddressOf())),\n    \"CreateCommittedResource(default buffer) failed.\");\nThrowIfFailed(\n    m_device->CreateCommittedResource(&uploadHeap, D3D12_HEAP_FLAG_NONE, &bufferDesc, D3D12_RESOURCE_STATE_GENERIC_READ, nullptr, IID_PPV_ARGS(uploadBuffer.GetAddressOf())),\n    \"CreateCommittedResource(upload buffer) failed.\");\n\n// 転送用 Buffer を Map して CPU からデータを書き込む。\nvoid* mapped = nullptr;\nconst D3D12_RANGE noRead{ 0, 0 };\nThrowIfFailed(uploadBuffer->Map(0, &noRead, &mapped), \"ID3D12Resource::Map failed.\");\nstd::memcpy(mapped, data, static_cast<std::size_t>(byteSize));\nuploadBuffer->Unmap(0, nullptr);\n\n// GPU 用 Buffer を「コピー先」にしてから、転送用 → GPU 用へのコピー命令を記録する。\nconst D3D12_RESOURCE_BARRIER toCopyDest = TransitionBarrier(defaultBuffer.Get(), D3D12_RESOURCE_STATE_COMMON, D3D12_RESOURCE_STATE_COPY_DEST);\nm_commandList->ResourceBarrier(1, &toCopyDest);\nm_commandList->CopyBufferRegion(defaultBuffer.Get(), 0, uploadBuffer.Get(), 0, byteSize);\n\n// コピーが終わったら、本来の使い方（VertexBuffer など）へ切り替える。\nconst D3D12_RESOURCE_BARRIER toFinalState = TransitionBarrier(defaultBuffer.Get(), D3D12_RESOURCE_STATE_COPY_DEST, finalState);\nm_commandList->ResourceBarrier(1, &toFinalState);",
    "start": 847,
    "end": 873
   },
   "CreatePipelineStates": {
    "kind": "member",
    "signature": "void CreatePipelineStates()",
    "code": "// HLSL の VSMain / PSMain を、それぞれ Shader Model 5.1 でコンパイルする。\nconst std::filesystem::path shaderPath = GetShaderPath();\nconst ComPtr<ID3DBlob> vertexShaderCode = CompileShader(shaderPath, \"VSMain\", \"vs_5_1\");\nconst ComPtr<ID3DBlob> pixelShaderCode = CompileShader(shaderPath, \"PSMain\", \"ps_5_1\");\n\n// InputLayout: Vertex の各メンバーを、HLSL の POSITION / COLOR / TEXCOORD と対応させる。\nconst D3D12_INPUT_ELEMENT_DESC inputElements[] =\n{\n    { \"POSITION\", 0, DXGI_FORMAT_R32G32B32_FLOAT,    0, offsetof(Vertex, position), D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },\n    { \"COLOR\",    0, DXGI_FORMAT_R32G32B32A32_FLOAT, 0, offsetof(Vertex, color),    D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },\n    { \"TEXCOORD\", 0, DXGI_FORMAT_R32G32_FLOAT,       0, offsetof(Vertex, uv),       D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },\n};\n\n// Rasterizer: 三角形を塗りつぶし、裏向きの面も描く。\nD3D12_RASTERIZER_DESC rasterizer{};\nrasterizer.FillMode = D3D12_FILL_MODE_SOLID;\nrasterizer.CullMode = D3D12_CULL_MODE_NONE;\nrasterizer.DepthClipEnable = TRUE;\n\n// Blend: 上書き（不透明）。\nD3D12_BLEND_DESC opaqueBlend{};\nopaqueBlend.RenderTarget[0].BlendEnable = FALSE;\nopaqueBlend.RenderTarget[0].RenderTargetWriteMask = D3D12_COLOR_WRITE_ENABLE_ALL;\n\n// Depth: 手前にあるときだけ描き、Depth を書き込む。\nD3D12_DEPTH_STENCIL_DESC depthWrite{};\ndepthWrite.DepthEnable = TRUE;\ndepthWrite.DepthWriteMask = D3D12_DEPTH_WRITE_MASK_ALL;\ndepthWrite.DepthFunc = D3D12_COMPARISON_FUNC_LESS;\n\n// ここまでの設定と Shader・描画先の形式をまとめて、1つの PSO（Pipeline State Object）にする。\nD3D12_GRAPHICS_PIPELINE_STATE_DESC opaqueDesc{};\nopaqueDesc.pRootSignature = m_rootSignature.Get();\nopaqueDesc.VS = { vertexShaderCode->GetBufferPointer(), vertexShaderCode->GetBufferSize() };\nopaqueDesc.PS = { pixelShaderCode->GetBufferPointer(), pixelShaderCode->GetBufferSize() };\nopaqueDesc.InputLayout = { inputElements, static_cast<UINT>(std::size(inputElements)) };\nopaqueDesc.RasterizerState = rasterizer;\nopaqueDesc.BlendState = opaqueBlend;\nopaqueDesc.DepthStencilState = depthWrite;\nopaqueDesc.SampleMask = UINT_MAX;\nopaqueDesc.PrimitiveTopologyType = D3D12_PRIMITIVE_TOPOLOGY_TYPE_TRIANGLE;\nopaqueDesc.NumRenderTargets = 1;\nopaqueDesc.RTVFormats[0] = DXGI_FORMAT_R8G8B8A8_UNORM;\nopaqueDesc.DSVFormat = DXGI_FORMAT_D24_UNORM_S8_UINT;\nopaqueDesc.SampleDesc.Count = 1;\nThrowIfFailed(m_device->CreateGraphicsPipelineState(&opaqueDesc, IID_PPV_ARGS(m_opaquePSO.GetAddressOf())), \"CreateGraphicsPipelineState(opaque) failed.\");\n\n// 半透明用 PSO: 不透明用をコピーし、Blend を「alpha で混ぜる」、Depth を「書き込まない」に変える。\n// DX12 では Blend だけを後から差し替えられないため、PSO ごと別に作る。\nD3D12_GRAPHICS_PIPELINE_STATE_DESC alphaDesc = opaqueDesc;\nD3D12_RENDER_TARGET_BLEND_DESC& alphaTarget = alphaDesc.BlendState.RenderTarget[0];\nalphaTarget.BlendEnable = TRUE;\nalphaTarget.SrcBlend = D3D12_BLEND_SRC_ALPHA;\nalphaTarget.DestBlend = D3D12_BLEND_INV_SRC_ALPHA;\nalphaTarget.BlendOp = D3D12_BLEND_OP_ADD;\nalphaTarget.SrcBlendAlpha = D3D12_BLEND_ONE;\nalphaTarget.DestBlendAlpha = D3D12_BLEND_ZERO;\nalphaTarget.BlendOpAlpha = D3D12_BLEND_OP_ADD;\nalphaDesc.DepthStencilState.DepthWriteMask = D3D12_DEPTH_WRITE_MASK_ZERO;\nThrowIfFailed(m_device->CreateGraphicsPipelineState(&alphaDesc, IID_PPV_ARGS(m_alphaBlendPSO.GetAddressOf())), \"CreateGraphicsPipelineState(alpha) failed.\");\n\n// 画面へ貼る用 PSO: Depth を使わない。Depth の形式も「なし（UNKNOWN）」にする。\nD3D12_GRAPHICS_PIPELINE_STATE_DESC presentDesc = opaqueDesc;\npresentDesc.DepthStencilState.DepthEnable = FALSE;\npresentDesc.DepthStencilState.DepthWriteMask = D3D12_DEPTH_WRITE_MASK_ZERO;\npresentDesc.DSVFormat = DXGI_FORMAT_UNKNOWN;\nThrowIfFailed(m_device->CreateGraphicsPipelineState(&presentDesc, IID_PPV_ARGS(m_presentPSO.GetAddressOf())), \"CreateGraphicsPipelineState(present) failed.\");",
    "start": 771,
    "end": 837
   },
   "CreateRootSignature": {
    "kind": "member",
    "signature": "void CreateRootSignature()",
    "code": "// Root Parameter 0: ConstantBuffer（b0）。GPU 上の番地を直接渡す。\nD3D12_ROOT_PARAMETER rootParameters[2]{};\nrootParameters[0].ParameterType = D3D12_ROOT_PARAMETER_TYPE_CBV;\nrootParameters[0].Descriptor.ShaderRegister = 0;\nrootParameters[0].ShaderVisibility = D3D12_SHADER_VISIBILITY_VERTEX;\n\n// Root Parameter 1: Texture（t0）。SRV Heap の中の場所（Descriptor Table）を渡す。\nD3D12_DESCRIPTOR_RANGE srvRange{};\nsrvRange.RangeType = D3D12_DESCRIPTOR_RANGE_TYPE_SRV;\nsrvRange.NumDescriptors = 1;\nsrvRange.BaseShaderRegister = 0;\nsrvRange.OffsetInDescriptorsFromTableStart = D3D12_DESCRIPTOR_RANGE_OFFSET_APPEND;\nrootParameters[1].ParameterType = D3D12_ROOT_PARAMETER_TYPE_DESCRIPTOR_TABLE;\nrootParameters[1].DescriptorTable.NumDescriptorRanges = 1;\nrootParameters[1].DescriptorTable.pDescriptorRanges = &srvRange;\nrootParameters[1].ShaderVisibility = D3D12_SHADER_VISIBILITY_PIXEL;\n\n// Sampler（s0）は変更しないので、RootSignature に直接埋め込む（Static Sampler）。\nD3D12_STATIC_SAMPLER_DESC sampler{};\nsampler.Filter = D3D12_FILTER_MIN_MAG_MIP_LINEAR;\nsampler.AddressU = D3D12_TEXTURE_ADDRESS_MODE_WRAP;\nsampler.AddressV = D3D12_TEXTURE_ADDRESS_MODE_WRAP;\nsampler.AddressW = D3D12_TEXTURE_ADDRESS_MODE_WRAP;\nsampler.MaxAnisotropy = 1;\nsampler.ComparisonFunc = D3D12_COMPARISON_FUNC_NEVER;\nsampler.MaxLOD = D3D12_FLOAT32_MAX;\nsampler.ShaderRegister = 0;\nsampler.ShaderVisibility = D3D12_SHADER_VISIBILITY_PIXEL;\n\nD3D12_ROOT_SIGNATURE_DESC rootDesc{};\nrootDesc.NumParameters = static_cast<UINT>(std::size(rootParameters));\nrootDesc.pParameters = rootParameters;\nrootDesc.NumStaticSamplers = 1;\nrootDesc.pStaticSamplers = &sampler;\nrootDesc.Flags = D3D12_ROOT_SIGNATURE_FLAG_ALLOW_INPUT_ASSEMBLER_INPUT_LAYOUT;\n\n// 設定を GPU 用のデータへ変換（Serialize）してから、RootSignature を作る。\nComPtr<ID3DBlob> serialized;\nComPtr<ID3DBlob> errors;\nconst HRESULT hr = D3D12SerializeRootSignature(&rootDesc, D3D_ROOT_SIGNATURE_VERSION_1, serialized.GetAddressOf(), errors.GetAddressOf());\nif (FAILED(hr))\n{\n    std::string message = \"D3D12SerializeRootSignature failed.\\n\";\n    if (errors)\n    {\n        message.append(static_cast<const char*>(errors->GetBufferPointer()), errors->GetBufferSize());\n    }\n    throw std::runtime_error(message);\n}\nThrowIfFailed(\n    m_device->CreateRootSignature(0, serialized->GetBufferPointer(), serialized->GetBufferSize(), IID_PPV_ARGS(m_rootSignature.GetAddressOf())),\n    \"CreateRootSignature failed.\");",
    "start": 715,
    "end": 766
   },
   "EndFrame": {
    "kind": "member",
    "signature": "void EndFrame()",
    "code": "// BackBuffer を「描画先」から「表示用」へ戻す。\nconst D3D12_RESOURCE_BARRIER toPresent = TransitionBarrier(\n    m_backBuffers[m_frameIndex].Get(),\n    D3D12_RESOURCE_STATE_RENDER_TARGET,\n    D3D12_RESOURCE_STATE_PRESENT);\nm_commandList->ResourceBarrier(1, &toPresent);\n\n// 記録した命令を GPU へ送り、BackBuffer の表示を予約する。\nExecuteCommandList();\nThrowIfFailed(m_swapChain->Present(1, 0), \"IDXGISwapChain::Present failed.\");\n\n// GPU が終わるまで待ち、次に描く BackBuffer の番号を取得する。\nWaitForGpu();\nm_frameIndex = m_swapChain->GetCurrentBackBufferIndex();",
    "start": 697,
    "end": 710
   },
   "BeginFrame": {
    "kind": "member",
    "signature": "void BeginFrame()",
    "code": "// 命令の記録を始める。前のフレームの GPU 処理は終わっている（WaitForGpu 済み）ので、メモリを再利用できる。\nThrowIfFailed(m_commandAllocator->Reset(), \"ID3D12CommandAllocator::Reset failed.\");\nThrowIfFailed(m_commandList->Reset(m_commandAllocator.Get(), nullptr), \"ID3D12GraphicsCommandList::Reset failed.\");\n\n// 今の BackBuffer を「表示用（PRESENT）」から「描画先（RENDER_TARGET）」へ切り替える。\nconst D3D12_RESOURCE_BARRIER toRenderTarget = TransitionBarrier(\n    m_backBuffers[m_frameIndex].Get(),\n    D3D12_RESOURCE_STATE_PRESENT,\n    D3D12_RESOURCE_STATE_RENDER_TARGET);\nm_commandList->ResourceBarrier(1, &toRenderTarget);",
    "start": 683,
    "end": 692
   },
   "WaitForGpu": {
    "kind": "member",
    "signature": "void WaitForGpu()",
    "code": "// Queue に「ここまで終わったら Fence を signalValue にして」と頼む。\nconst UINT64 signalValue = ++m_fenceValue;\nThrowIfFailed(m_commandQueue->Signal(m_fence.Get(), signalValue), \"ID3D12CommandQueue::Signal failed.\");\n\n// GPU がまだそこまで進んでいなければ、進むまで CPU を止めて待つ。\nif (m_fence->GetCompletedValue() < signalValue)\n{\n    ThrowIfFailed(m_fence->SetEventOnCompletion(signalValue, m_fenceEvent), \"ID3D12Fence::SetEventOnCompletion failed.\");\n    WaitForSingleObject(m_fenceEvent, INFINITE);\n}",
    "start": 669,
    "end": 678
   },
   "ExecuteCommandList": {
    "kind": "member",
    "signature": "void ExecuteCommandList()",
    "code": "// 記録を閉じ、CommandQueue へ渡して GPU に実行させる。\nThrowIfFailed(m_commandList->Close(), \"ID3D12GraphicsCommandList::Close failed.\");\nID3D12CommandList* lists[] = { m_commandList.Get() };\nm_commandQueue->ExecuteCommandLists(1, lists);",
    "start": 661,
    "end": 664
   },
   "CreateFence": {
    "kind": "member",
    "signature": "void CreateFence()",
    "code": "// Fence（GPU がどこまで終わったかを示す番号）と、待つための Event を作る。\nThrowIfFailed(\n    m_device->CreateFence(0, D3D12_FENCE_FLAG_NONE, IID_PPV_ARGS(m_fence.GetAddressOf())),\n    \"CreateFence failed.\");\nm_fenceEvent = CreateEventW(nullptr, FALSE, FALSE, nullptr);\nif (!m_fenceEvent)\n{\n    throw std::runtime_error(\"CreateEventW failed.\");\n}",
    "start": 648,
    "end": 656
   },
   "CreateCommandObjects": {
    "kind": "member",
    "signature": "void CreateCommandObjects()",
    "code": "// CommandAllocator（命令を記録するメモリ）と CommandList（命令を書き込む係）を作る。\nThrowIfFailed(\n    m_device->CreateCommandAllocator(D3D12_COMMAND_LIST_TYPE_DIRECT, IID_PPV_ARGS(m_commandAllocator.GetAddressOf())),\n    \"CreateCommandAllocator failed.\");\nThrowIfFailed(\n    m_device->CreateCommandList(\n        0,\n        D3D12_COMMAND_LIST_TYPE_DIRECT,\n        m_commandAllocator.Get(),\n        nullptr,\n        IID_PPV_ARGS(m_commandList.GetAddressOf())),\n    \"CreateCommandList failed.\");\n\n// 作った直後の CommandList は「記録中」。記録を始めるときに Reset するので、いったん閉じておく。\nThrowIfFailed(m_commandList->Close(), \"ID3D12GraphicsCommandList::Close failed.\");",
    "start": 629,
    "end": 643
   },
   "CreateBackBufferViews": {
    "kind": "member",
    "signature": "void CreateBackBufferViews()",
    "code": "// BackBuffer を1枚ずつ取り出し、RTV Heap の [0] [1] に RTV を書き込む。\nfor (UINT i = 0; i < kFrameCount; ++i)\n{\n    ThrowIfFailed(\n        m_swapChain->GetBuffer(i, IID_PPV_ARGS(m_backBuffers[i].GetAddressOf())),\n        \"IDXGISwapChain::GetBuffer failed.\");\n    m_device->CreateRenderTargetView(m_backBuffers[i].Get(), nullptr, CpuHandle(m_rtvHeap.Get(), i, m_rtvDescriptorSize));\n}",
    "start": 617,
    "end": 624
   },
   "CreateDescriptorHeaps": {
    "kind": "member",
    "signature": "void CreateDescriptorHeaps()",
    "code": "// RTV（描画先）用の DescriptorHeap: BackBuffer 2枚 + SceneTexture 1枚。\nD3D12_DESCRIPTOR_HEAP_DESC rtvHeapDesc{};\nrtvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_RTV;\nrtvHeapDesc.NumDescriptors = kFrameCount + 1;\nThrowIfFailed(m_device->CreateDescriptorHeap(&rtvHeapDesc, IID_PPV_ARGS(m_rtvHeap.GetAddressOf())), \"CreateDescriptorHeap(RTV) failed.\");\n\n// DSV（Depth の書き込み先）用の DescriptorHeap: 1個。\nD3D12_DESCRIPTOR_HEAP_DESC dsvHeapDesc{};\ndsvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_DSV;\ndsvHeapDesc.NumDescriptors = 1;\nThrowIfFailed(m_device->CreateDescriptorHeap(&dsvHeapDesc, IID_PPV_ARGS(m_dsvHeap.GetAddressOf())), \"CreateDescriptorHeap(DSV) failed.\");\n\n// SRV（Shader から読む Texture）用の DescriptorHeap: Icon.png と SceneTexture。\n// Shader から見えるように SHADER_VISIBLE を付ける。\nD3D12_DESCRIPTOR_HEAP_DESC srvHeapDesc{};\nsrvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_CBV_SRV_UAV;\nsrvHeapDesc.NumDescriptors = kSrvCount;\nsrvHeapDesc.Flags = D3D12_DESCRIPTOR_HEAP_FLAG_SHADER_VISIBLE;\nThrowIfFailed(m_device->CreateDescriptorHeap(&srvHeapDesc, IID_PPV_ARGS(m_srvHeap.GetAddressOf())), \"CreateDescriptorHeap(SRV) failed.\");\n\n// Descriptor 1個の大きさ（byte）は GPU によって違うので、Device に問い合わせる。\nm_rtvDescriptorSize = m_device->GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE_RTV);\nm_srvDescriptorSize = m_device->GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE_CBV_SRV_UAV);",
    "start": 590,
    "end": 612
   },
   "CreateDeviceAndSwapChain": {
    "kind": "member",
    "signature": "void CreateDeviceAndSwapChain(HWND hwnd)",
    "code": "// DXGI Factory（GPU と画面を扱う入口）と、Device（Resource などを作る係）を作る。\nconst UINT factoryFlags = m_debugLayerEnabled ? DXGI_CREATE_FACTORY_DEBUG : 0;\nThrowIfFailed(CreateDXGIFactory2(factoryFlags, IID_PPV_ARGS(m_factory.GetAddressOf())), \"CreateDXGIFactory2 failed.\");\nThrowIfFailed(\n    D3D12CreateDevice(nullptr, D3D_FEATURE_LEVEL_11_0, IID_PPV_ARGS(m_device.GetAddressOf())),\n    \"D3D12CreateDevice failed.\");\n\n// CommandQueue（記録した命令を GPU へ送る窓口）を作る。\nD3D12_COMMAND_QUEUE_DESC queueDesc{};\nqueueDesc.Type = D3D12_COMMAND_LIST_TYPE_DIRECT;\nThrowIfFailed(\n    m_device->CreateCommandQueue(&queueDesc, IID_PPV_ARGS(m_commandQueue.GetAddressOf())),\n    \"CreateCommandQueue failed.\");\n\n// SwapChain（BackBuffer 2枚を交互に表示する仕組み）を作る。DX12 では Queue を渡して作る。\nDXGI_SWAP_CHAIN_DESC1 swapChainDesc{};\nswapChainDesc.Width = kClientWidth;\nswapChainDesc.Height = kClientHeight;\nswapChainDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;\nswapChainDesc.SampleDesc.Count = 1;\nswapChainDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;\nswapChainDesc.BufferCount = kFrameCount;\nswapChainDesc.SwapEffect = DXGI_SWAP_EFFECT_FLIP_DISCARD;\n\nComPtr<IDXGISwapChain1> swapChain1;\nThrowIfFailed(\n    m_factory->CreateSwapChainForHwnd(m_commandQueue.Get(), hwnd, &swapChainDesc, nullptr, nullptr, swapChain1.GetAddressOf()),\n    \"CreateSwapChainForHwnd failed.\");\n\n// 「今どちらの BackBuffer に描くか」を調べられる IDXGISwapChain3 として使う。\nThrowIfFailed(swapChain1.As(&m_swapChain), \"IDXGISwapChain3 is not supported.\");\nm_frameIndex = m_swapChain->GetCurrentBackBufferIndex();",
    "start": 554,
    "end": 585
   },
   "EnableDebugLayer": {
    "kind": "member",
    "signature": "void EnableDebugLayer()",
    "code": "#if defined(_DEBUG)\n// Debug ビルドでは Debug Layer を有効にし、API の使い方の誤りを「出力」ウィンドウへ表示させる。\n// Device を作る前に有効にする必要がある。\nComPtr<ID3D12Debug> debug;\nif (SUCCEEDED(D3D12GetDebugInterface(IID_PPV_ARGS(debug.GetAddressOf()))))\n{\n    debug->EnableDebugLayer();\n    m_debugLayerEnabled = true;\n}\n#endif",
    "start": 540,
    "end": 549
   },
   "RenderFullScene": {
    "kind": "member",
    "signature": "void RenderFullScene()",
    "code": "BeginFrame();\nRenderScenePass();\nRenderPresentPass();\nEndFrame();",
    "start": 531,
    "end": 534
   },
   "RenderOneObject": {
    "kind": "member",
    "signature": "void RenderOneObject(const DrawRange& range)",
    "code": "BeginFrame();\n\n// 描画先を BackBuffer + Depth にして、両方を初期化する。\nconst float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };\nconst D3D12_CPU_DESCRIPTOR_HANDLE rtv = CpuHandle(m_rtvHeap.Get(), m_frameIndex, m_rtvDescriptorSize);\nconst D3D12_CPU_DESCRIPTOR_HANDLE dsv = m_dsvHeap->GetCPUDescriptorHandleForHeapStart();\nm_commandList->OMSetRenderTargets(1, &rtv, FALSE, &dsv);\nm_commandList->ClearRenderTargetView(rtv, clearColor, 0, nullptr);\nm_commandList->ClearDepthStencilView(dsv, D3D12_CLEAR_FLAG_DEPTH, 1.0f, 0, 0, nullptr);\n\n// 共通の設定に加え、不透明用 PSO と Icon.png の SRV（t0）を指定する。\nBindCommonPipeline();\nm_commandList->SetPipelineState(m_opaquePSO.Get());\nm_commandList->SetGraphicsRootDescriptorTable(1, GpuHandle(m_srvHeap.Get(), kIconSrvIndex, m_srvDescriptorSize));\n\n// 渡された物体を1個、原点に描く。\nconst ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);\nDrawObject(0, range, XMMatrixIdentity(), matrices.view, matrices.projection);\n\nEndFrame();",
    "start": 506,
    "end": 525
   },
   "RenderClearOnly": {
    "kind": "member",
    "signature": "void RenderClearOnly()",
    "code": "BeginFrame();\n\n// 今の BackBuffer の RTV を描画先にして、背景色で塗りつぶす。\nconst float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };\nconst D3D12_CPU_DESCRIPTOR_HANDLE rtv = CpuHandle(m_rtvHeap.Get(), m_frameIndex, m_rtvDescriptorSize);\nm_commandList->OMSetRenderTargets(1, &rtv, FALSE, nullptr);\nm_commandList->ClearRenderTargetView(rtv, clearColor, 0, nullptr);\n\nEndFrame();",
    "start": 492,
    "end": 500
   }
  },
  "shader": {
   "path": "DX12SceneShader.hlsl",
   "code": "// C++ から渡される値。register の番号（b0 / t0 / s0）で C++ 側と対応させる。\ncbuffer SceneConstants : register(b0)\n{\n    float4x4 gWorldViewProjection; // World × View × Projection\n};\nTexture2D gTexture : register(t0);     // 貼る画像\nSamplerState gSampler : register(s0);  // 画像の読み方\n\n// VertexShader が受け取る1頂点。名前の後ろ（POSITION など）は InputLayout の SemanticName と一致させる。\nstruct VSInput\n{\n    float3 position : POSITION;\n    float4 color : COLOR0;\n    float2 uv : TEXCOORD0;\n};\n\n// VertexShader から PixelShader へ渡す値。SV_POSITION は画面上の位置として GPU が使う。\nstruct VSOutput\n{\n    float4 position : SV_POSITION;\n    float4 color : COLOR0;\n    float2 uv : TEXCOORD0;\n};\n\n// 頂点ごとに1回: 頂点の位置を、行列で画面上の位置へ変換する。\nVSOutput VSMain(VSInput input)\n{\n    VSOutput output;\n    output.position = mul(float4(input.position, 1.0f), gWorldViewProjection);\n    output.color = input.color;\n    output.uv = input.uv;\n    return output;\n}\n\n// 画素ごとに1回: 画像の色 × 頂点色 を、その画素の色にする。\nfloat4 PSMain(VSOutput input) : SV_TARGET\n{\n    return gTexture.Sample(gSampler, input.uv) * input.color;\n}",
   "start": 1,
   "end": 39
  }
 }
};

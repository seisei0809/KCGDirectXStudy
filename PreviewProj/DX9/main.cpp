#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>

#include <d3d9.h>        // Direct3D 9 の Device・Buffer・Texture
#include <DirectXMath.h> // World / View / Projection 行列の計算
#include <wincodec.h>    // WIC: Icon.png を画素の配列へ変換する
#include <wrl/client.h>  // ComPtr: COM オブジェクトを自動で解放する

#include <cstddef>    // std::size_t
#include <cstdint>    // std::uint8_t / std::uint16_t
#include <cstring>    // std::memcpy
#include <exception>  // std::exception
#include <filesystem> // Icon.png の場所を探す
#include <stdexcept>  // std::runtime_error
#include <string>     // std::wstring（エラー表示）
#include <vector>     // 画素・頂点・Index の配列

using Microsoft::WRL::ComPtr;
using namespace DirectX;

#pragma comment(lib, "d3d9.lib")
#pragma comment(lib, "windowscodecs.lib")
#pragma comment(lib, "ole32.lib")

namespace
{
    constexpr UINT kClientWidth = 1280;
    constexpr UINT kClientHeight = 720;
    constexpr wchar_t kWindowClassName[] = L"KCGDirectXStudyDX9Preview";
    constexpr wchar_t kWindowTitle[] = L"KCG DirectX Study - DirectX 9 Preview";

    // ---------- データの型 ----------

    // F1 / F2 で切り替える投影方法。
    enum class ProjectionMode
    {
        Orthographic, // 平行投影（遠近感なし）
        Perspective,  // 透視投影（遠近感あり）
    };

    // F3〜F6 で切り替える、途中確認用の描画内容。
    enum class RenderStage
    {
        ClearOnly, // F3: 背景色だけ
        Sprite,    // F4: 画像を貼った四角形（Sprite）1枚
        Cube,      // F5: 立方体1個
        FullScene, // F6: 完成画面
    };

    // カメラ（View）と投影（Projection）の行列をまとめて返すための入れ物。
    struct ViewProjectionMatrices
    {
        XMMATRIX view;
        XMMATRIX projection;
    };

    // PNG を読み込んだ結果。1画素 = B, G, R, A の4byte。
    struct ImageData
    {
        UINT width = 0;
        UINT height = 0;
        std::vector<std::uint8_t> pixels;
    };

    // 1頂点が持つデータ。位置・色・Texture 上の位置（UV）。
    struct Vertex
    {
        float x, y, z;
        D3DCOLOR color;
        float u, v;
    };

    // Vertex の並びを Direct3D 9 へ伝える FVF（Flexible Vertex Format）。
    // XYZ → DIFFUSE（色）→ TEX1（UV 1組）の順は、上の Vertex のメンバー順と一致させる。
    constexpr DWORD kVertexFVF = D3DFVF_XYZ | D3DFVF_DIFFUSE | D3DFVF_TEX1;

    // 大きな IndexBuffer の中で、1つの物体が使う範囲。
    struct DrawRange
    {
        UINT startIndex = 0;
        UINT indexCount = 0;
    };

    // すべての物体の頂点と Index を1つにまとめたもの。
    struct SceneGeometry
    {
        std::vector<Vertex> vertices;
        std::vector<std::uint16_t> indices;
        DrawRange sprite;
        DrawRange floor;
        DrawRange cube;
        DrawRange pyramid;
        DrawRange transparentPanel;
        DrawRange presentQuad;
    };

    // ---------- 補助関数 ----------

    // HRESULT が失敗を示していたら、例外にして処理を止める。
    void ThrowIfFailed(HRESULT hr, const char* message)
    {
        if (FAILED(hr))
        {
            throw std::runtime_error(message);
        }
    }

    // 例外のメッセージをダイアログで表示する。文字列は UTF-8 なので、Windows 用の UTF-16 へ変換する。
    void ShowErrorMessage(const char* message)
    {
        const int length = MultiByteToWideChar(CP_UTF8, 0, message, -1, nullptr, 0);
        std::wstring wideMessage(static_cast<std::size_t>(length), L'\0');
        MultiByteToWideChar(CP_UTF8, 0, message, -1, wideMessage.data(), length);
        MessageBoxW(nullptr, wideMessage.c_str(), kWindowTitle, MB_OK | MB_ICONERROR);
    }

    std::filesystem::path GetIconPath()
    {
        // exe のあるフォルダーから親フォルダーへ向かって Icon.png を探す。
        wchar_t executablePath[MAX_PATH]{};
        GetModuleFileNameW(nullptr, executablePath, MAX_PATH);

        std::filesystem::path directory = std::filesystem::path(executablePath).parent_path();
        for (int i = 0; i < 5; ++i)
        {
            const std::filesystem::path candidate = directory / L"Icon.png";
            if (std::filesystem::exists(candidate))
            {
                return candidate;
            }
            directory = directory.parent_path();
        }

        throw std::runtime_error("Icon.png が見つかりません。PracticeProj（または PreviewProj）フォルダーの中に Icon.png があるか確認してください。");
    }

    ImageData LoadPngWithWIC(const std::filesystem::path& path)
    {
        // WIC の入口（Factory）を作る。
        ComPtr<IWICImagingFactory> factory;
        ThrowIfFailed(
            CoCreateInstance(
                CLSID_WICImagingFactory,
                nullptr,
                CLSCTX_INPROC_SERVER,
                IID_PPV_ARGS(factory.GetAddressOf())),
            "CoCreateInstance(CLSID_WICImagingFactory) failed.");

        // PNG ファイルを開き、1枚目の画像を取り出す。
        ComPtr<IWICBitmapDecoder> decoder;
        ThrowIfFailed(
            factory->CreateDecoderFromFilename(
                path.c_str(),
                nullptr,
                GENERIC_READ,
                WICDecodeMetadataCacheOnLoad,
                decoder.GetAddressOf()),
            "IWICImagingFactory::CreateDecoderFromFilename failed.");

        ComPtr<IWICBitmapFrameDecode> frame;
        ThrowIfFailed(decoder->GetFrame(0, frame.GetAddressOf()), "IWICBitmapDecoder::GetFrame failed.");

        // どんな PNG でも、1画素 4byte の BGRA 形式へそろえる。
        ComPtr<IWICFormatConverter> converter;
        ThrowIfFailed(factory->CreateFormatConverter(converter.GetAddressOf()), "IWICImagingFactory::CreateFormatConverter failed.");
        ThrowIfFailed(
            converter->Initialize(
                frame.Get(),
                GUID_WICPixelFormat32bppBGRA,
                WICBitmapDitherTypeNone,
                nullptr,
                0.0,
                WICBitmapPaletteTypeCustom),
            "IWICFormatConverter::Initialize failed.");

        // 画像サイズを調べ、画素を CPU 側の配列へコピーする。
        ImageData image;
        ThrowIfFailed(converter->GetSize(&image.width, &image.height), "IWICBitmapSource::GetSize failed.");
        const UINT rowPitch = image.width * 4;
        image.pixels.resize(static_cast<std::size_t>(rowPitch) * image.height);
        ThrowIfFailed(
            converter->CopyPixels(nullptr, rowPitch, static_cast<UINT>(image.pixels.size()), image.pixels.data()),
            "IWICBitmapSource::CopyPixels failed.");
        return image;
    }

    // 4頂点の四角形を、2枚の三角形（Index 6個）として追加する。
    // p0 = 左下、p1 = 左上、p2 = 右上、p3 = 右下 の順で渡す。
    void AppendQuad(
        SceneGeometry& geometry,
        XMFLOAT3 p0,
        XMFLOAT3 p1,
        XMFLOAT3 p2,
        XMFLOAT3 p3,
        D3DCOLOR color,
        float uvScale = 1.0f)
    {
        const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());
        geometry.vertices.push_back({ p0.x, p0.y, p0.z, color, 0.0f, uvScale });
        geometry.vertices.push_back({ p1.x, p1.y, p1.z, color, 0.0f, 0.0f });
        geometry.vertices.push_back({ p2.x, p2.y, p2.z, color, uvScale, 0.0f });
        geometry.vertices.push_back({ p3.x, p3.y, p3.z, color, uvScale, uvScale });

        const std::uint16_t quadIndices[] = { 0, 1, 2, 0, 2, 3 };
        for (const std::uint16_t index : quadIndices)
        {
            geometry.indices.push_back(static_cast<std::uint16_t>(base + index));
        }
    }

    // 3頂点の三角形（Index 3個）を追加する。
    void AppendTriangle(
        SceneGeometry& geometry,
        XMFLOAT3 p0,
        XMFLOAT3 p1,
        XMFLOAT3 p2,
        D3DCOLOR color)
    {
        const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());
        geometry.vertices.push_back({ p0.x, p0.y, p0.z, color, 0.0f, 1.0f });
        geometry.vertices.push_back({ p1.x, p1.y, p1.z, color, 0.5f, 0.0f });
        geometry.vertices.push_back({ p2.x, p2.y, p2.z, color, 1.0f, 1.0f });

        for (std::uint16_t index = 0; index < 3; ++index)
        {
            geometry.indices.push_back(static_cast<std::uint16_t>(base + index));
        }
    }

    SceneGeometry BuildSceneGeometry()
    {
        SceneGeometry geometry;
        const D3DCOLOR white = D3DCOLOR_ARGB(255, 255, 255, 255);

        // 画像を1枚貼っただけの四角形（Sprite）。
        geometry.sprite.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(geometry, { -2, -2, 0 }, { -2, 2, 0 }, { 2, 2, 0 }, { 2, -2, 0 }, white);
        geometry.sprite.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.sprite.startIndex;

        // 床。UV を 0～4 にして、Texture を 4×4 回繰り返す。
        geometry.floor.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(geometry, { -5, -1.25f, -5 }, { -5, -1.25f, 5 }, { 5, -1.25f, 5 }, { 5, -1.25f, -5 }, white, 4.0f);
        geometry.floor.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.floor.startIndex;

        // 立方体。6面それぞれに Texture 全体を貼るため、面ごとに頂点を分ける。
        geometry.cube.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(geometry, { -1, -1, -1 }, { -1, 1, -1 }, { 1, 1, -1 }, { 1, -1, -1 }, white); // 手前
        AppendQuad(geometry, { 1, -1, 1 }, { 1, 1, 1 }, { -1, 1, 1 }, { -1, -1, 1 }, white);     // 奥
        AppendQuad(geometry, { -1, -1, 1 }, { -1, 1, 1 }, { -1, 1, -1 }, { -1, -1, -1 }, white); // 左
        AppendQuad(geometry, { 1, -1, -1 }, { 1, 1, -1 }, { 1, 1, 1 }, { 1, -1, 1 }, white);     // 右
        AppendQuad(geometry, { -1, 1, -1 }, { -1, 1, 1 }, { 1, 1, 1 }, { 1, 1, -1 }, white);     // 上
        AppendQuad(geometry, { -1, -1, 1 }, { -1, -1, -1 }, { 1, -1, -1 }, { 1, -1, 1 }, white); // 下
        geometry.cube.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.cube.startIndex;

        // 四角すい。底面1枚と側面4枚。
        geometry.pyramid.startIndex = static_cast<UINT>(geometry.indices.size());
        const XMFLOAT3 top{ 0.0f, 1.1f, 0.0f };
        const XMFLOAT3 b0{ -1, -1, -1 };
        const XMFLOAT3 b1{ -1, -1, 1 };
        const XMFLOAT3 b2{ 1, -1, 1 };
        const XMFLOAT3 b3{ 1, -1, -1 };
        AppendQuad(geometry, b1, b0, b3, b2, white);
        AppendTriangle(geometry, b0, top, b3, white);
        AppendTriangle(geometry, b3, top, b2, white);
        AppendTriangle(geometry, b2, top, b1, white);
        AppendTriangle(geometry, b1, top, b0, white);
        geometry.pyramid.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.pyramid.startIndex;

        // 半透明のパネル。頂点色の alpha = 90 / 255（約 35%）。
        geometry.transparentPanel.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(
            geometry,
            { -2.7f, -0.8f, -1.8f },
            { -2.7f, 1.8f, -1.8f },
            { 2.7f, 1.8f, -1.8f },
            { 2.7f, -0.8f, -1.8f },
            D3DCOLOR_ARGB(90, 64, 166, 255),
            2.0f);
        geometry.transparentPanel.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.transparentPanel.startIndex;

        // 画面全体を覆う四角形。行列を使わず、-1～1 の座標がそのまま画面の端になる。
        geometry.presentQuad.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(geometry, { -1, -1, 0 }, { -1, 1, 0 }, { 1, 1, 0 }, { 1, -1, 0 }, white);
        geometry.presentQuad.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.presentQuad.startIndex;

        return geometry;
    }

    // DirectXMath の行列を、DX9 の SetTransform が受け取る D3DMATRIX へ変換する。
    D3DMATRIX ToD3DMatrix(FXMMATRIX matrix)
    {
        XMFLOAT4X4 stored{};
        XMStoreFloat4x4(&stored, matrix);

        D3DMATRIX result{};
        static_assert(sizeof(result) == sizeof(stored));
        std::memcpy(&result, &stored, sizeof(result));
        return result;
    }

    ViewProjectionMatrices BuildViewProjection(ProjectionMode mode)
    {
        // カメラ（View）はどちらの投影でも同じ。斜め上から原点のあたりを見下ろす。
        const XMMATRIX view = XMMatrixLookAtLH(
            XMVectorSet(0.0f, 3.2f, -7.5f, 1.0f),   // カメラの位置
            XMVectorSet(0.0f, -0.1f, 0.0f, 1.0f),   // 見る点
            XMVectorSet(0.0f, 1.0f, 0.0f, 0.0f));   // 上方向
        const float aspect = static_cast<float>(kClientWidth) / static_cast<float>(kClientHeight);

        // 平行投影: 遠くの物も近くの物も同じ大きさで映る。縦 9 の範囲が画面に収まる。
        if (mode == ProjectionMode::Orthographic)
        {
            return { view, XMMatrixOrthographicLH(9.0f * aspect, 9.0f, 0.1f, 100.0f) };
        }

        // 透視投影: 遠くの物ほど小さく映る。上下の視野角は 60 度。
        return { view, XMMatrixPerspectiveFovLH(XMConvertToRadians(60.0f), aspect, 0.1f, 100.0f) };
    }

    // ---------- Renderer ----------

    class Renderer
    {
    public:
        void Initialize(HWND hwnd)
        {
            CreateDevice(hwnd);
            CreateGeometryBuffers();
            CreateIconTexture();
            CreateSceneTexture();
            ConfigureFixedFunctionPipeline();
        }

        void SetProjectionMode(ProjectionMode mode)
        {
            m_projectionMode = mode;
        }

        // F3〜F6 で選ばれた段階の描画を呼ぶ。
        void Render(RenderStage stage)
        {
            switch (stage)
            {
            case RenderStage::ClearOnly: RenderClearOnly(); break;
            case RenderStage::Sprite: RenderOneObject(m_geometry.sprite); break;
            case RenderStage::Cube: RenderOneObject(m_geometry.cube); break;
            case RenderStage::FullScene: RenderFullScene(); break;
            }
        }

        // 確認 1（F3）: 背景色で塗りつぶして表示するだけ。
        void RenderClearOnly()
        {
            // 描画先（BackBuffer）を背景色で塗りつぶす。
            ThrowIfFailed(
                m_device->Clear(0, nullptr, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER, D3DCOLOR_XRGB(24, 31, 42), 1.0f, 0),
                "IDirect3DDevice9::Clear failed.");

            // BackBuffer をウィンドウへ表示する。
            PresentFrame();
        }

        // 確認 2（F4 / F5）: BackBuffer へ直接、物体を1個だけ描く。
        void RenderOneObject(const DrawRange& range)
        {
            // 背景色と奥行き（Depth）を初期化する。
            ThrowIfFailed(
                m_device->Clear(0, nullptr, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER, D3DCOLOR_XRGB(24, 31, 42), 1.0f, 0),
                "IDirect3DDevice9::Clear failed.");
            ThrowIfFailed(m_device->BeginScene(), "IDirect3DDevice9::BeginScene failed.");

            // Icon.png を貼り、奥行き判定を有効にする。
            m_device->SetTexture(0, m_iconTexture.Get());
            m_device->SetRenderState(D3DRS_ZENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ZWRITEENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);
            SetCameraTransforms();

            // 渡された物体を1個、原点に描く。
            DrawObject(range, XMMatrixIdentity());

            ThrowIfFailed(m_device->EndScene(), "IDirect3DDevice9::EndScene failed.");
            PresentFrame();
        }

        // 完成（F6）: SceneTexture へ描いてから、それを画面へ貼る 2-pass 描画。
        void RenderFullScene()
        {
            RenderScenePass();
            RenderPresentPass();
            PresentFrame();
        }

    private:
        void CreateDevice(HWND hwnd)
        {
            // Direct3D 9 の入口（IDirect3D9）を作る。
            m_d3d.Attach(Direct3DCreate9(D3D_SDK_VERSION));
            if (!m_d3d)
            {
                throw std::runtime_error("Direct3DCreate9 failed.");
            }

            // 画面表示の条件を決める。BackBuffer と Depth 用の面もここで一緒に作られる。
            D3DPRESENT_PARAMETERS present{};
            present.Windowed = TRUE;
            present.SwapEffect = D3DSWAPEFFECT_DISCARD;
            present.BackBufferFormat = D3DFMT_UNKNOWN;
            present.BackBufferWidth = kClientWidth;
            present.BackBufferHeight = kClientHeight;
            present.EnableAutoDepthStencil = TRUE;
            present.AutoDepthStencilFormat = D3DFMT_D24S8;
            present.PresentationInterval = D3DPRESENT_INTERVAL_ONE;

            // Device を作る。頂点計算を GPU で行えない環境では CPU で行う設定で作り直す。
            HRESULT hr = m_d3d->CreateDevice(
                D3DADAPTER_DEFAULT,
                D3DDEVTYPE_HAL,
                hwnd,
                D3DCREATE_HARDWARE_VERTEXPROCESSING,
                &present,
                m_device.GetAddressOf());
            if (FAILED(hr))
            {
                hr = m_d3d->CreateDevice(
                    D3DADAPTER_DEFAULT,
                    D3DDEVTYPE_HAL,
                    hwnd,
                    D3DCREATE_SOFTWARE_VERTEXPROCESSING,
                    &present,
                    m_device.GetAddressOf());
            }
            ThrowIfFailed(hr, "IDirect3D9::CreateDevice failed.");
        }

        void PresentFrame()
        {
            // BackBuffer をウィンドウへ表示する。
            // DX9 では画面ロックなどで Device が「失われる（Lost）」ことがある。
            // その間は描画をあきらめて次のフレームへ進む（復帰処理はこの教材では扱わない）。
            const HRESULT hr = m_device->Present(nullptr, nullptr, nullptr, nullptr);
            if (hr == D3DERR_DEVICELOST)
            {
                return;
            }
            ThrowIfFailed(hr, "IDirect3DDevice9::Present failed.");
        }

        void CreateGeometryBuffers()
        {
            // CPU 側で、すべての物体の頂点と Index を作る。
            m_geometry = BuildSceneGeometry();

            // VertexBuffer を作り、Lock で書き込み先を借りて頂点をコピーする。
            const UINT vertexBytes = static_cast<UINT>(m_geometry.vertices.size() * sizeof(Vertex));
            ThrowIfFailed(
                m_device->CreateVertexBuffer(vertexBytes, 0, kVertexFVF, D3DPOOL_MANAGED, m_vertexBuffer.GetAddressOf(), nullptr),
                "IDirect3DDevice9::CreateVertexBuffer failed.");

            void* vertexDestination = nullptr;
            ThrowIfFailed(m_vertexBuffer->Lock(0, 0, &vertexDestination, 0), "IDirect3DVertexBuffer9::Lock failed.");
            std::memcpy(vertexDestination, m_geometry.vertices.data(), vertexBytes);
            ThrowIfFailed(m_vertexBuffer->Unlock(), "IDirect3DVertexBuffer9::Unlock failed.");

            // IndexBuffer も同じ手順で作る。Index は 16bit（D3DFMT_INDEX16）。
            const UINT indexBytes = static_cast<UINT>(m_geometry.indices.size() * sizeof(std::uint16_t));
            ThrowIfFailed(
                m_device->CreateIndexBuffer(indexBytes, 0, D3DFMT_INDEX16, D3DPOOL_MANAGED, m_indexBuffer.GetAddressOf(), nullptr),
                "IDirect3DDevice9::CreateIndexBuffer failed.");

            void* indexDestination = nullptr;
            ThrowIfFailed(m_indexBuffer->Lock(0, 0, &indexDestination, 0), "IDirect3DIndexBuffer9::Lock failed.");
            std::memcpy(indexDestination, m_geometry.indices.data(), indexBytes);
            ThrowIfFailed(m_indexBuffer->Unlock(), "IDirect3DIndexBuffer9::Unlock failed.");
        }

        void CreateIconTexture()
        {
            // Icon.png を BGRA の画素配列として読み込む。
            const ImageData image = LoadPngWithWIC(GetIconPath());

            // 画像と同じ大きさの Texture を作る。D3DFMT_A8R8G8B8 はメモリ上で B, G, R, A の順。
            ThrowIfFailed(
                m_device->CreateTexture(
                    image.width,
                    image.height,
                    1,
                    0,
                    D3DFMT_A8R8G8B8,
                    D3DPOOL_MANAGED,
                    m_iconTexture.GetAddressOf(),
                    nullptr),
                "IDirect3DDevice9::CreateTexture failed.");

            // LockRect で書き込み先を借り、1行ずつコピーする。
            // Texture の1行の byte 数（Pitch）は width × 4 より大きいことがあるため、まとめてコピーしない。
            D3DLOCKED_RECT locked{};
            ThrowIfFailed(m_iconTexture->LockRect(0, &locked, nullptr, 0), "IDirect3DTexture9::LockRect failed.");
            const UINT sourceRowPitch = image.width * 4;
            for (UINT y = 0; y < image.height; ++y)
            {
                std::memcpy(
                    static_cast<std::uint8_t*>(locked.pBits) + static_cast<std::size_t>(y) * locked.Pitch,
                    image.pixels.data() + static_cast<std::size_t>(y) * sourceRowPitch,
                    sourceRowPitch);
            }
            ThrowIfFailed(m_iconTexture->UnlockRect(0), "IDirect3DTexture9::UnlockRect failed.");
        }

        void CreateSceneTexture()
        {
            // 今の描画先（= BackBuffer）を覚えておく。2-pass の最後にここへ戻す。
            ThrowIfFailed(
                m_device->GetRenderTarget(0, m_backBufferSurface.GetAddressOf()),
                "IDirect3DDevice9::GetRenderTarget failed.");

            // 描画先にも Texture にもなる SceneTexture を作る（D3DUSAGE_RENDERTARGET）。
            // 描画先にする Texture は D3DPOOL_DEFAULT（GPU メモリ）に置く決まり。
            ThrowIfFailed(
                m_device->CreateTexture(
                    kClientWidth,
                    kClientHeight,
                    1,
                    D3DUSAGE_RENDERTARGET,
                    D3DFMT_A8R8G8B8,
                    D3DPOOL_DEFAULT,
                    m_sceneTexture.GetAddressOf(),
                    nullptr),
                "Create SceneTexture failed.");

            // SetRenderTarget は Texture ではなく Surface（1枚の画像面）を受け取るため、取り出しておく。
            ThrowIfFailed(
                m_sceneTexture->GetSurfaceLevel(0, m_sceneSurface.GetAddressOf()),
                "IDirect3DTexture9::GetSurfaceLevel failed.");
        }

        void ConfigureFixedFunctionPipeline()
        {
            // 頂点の形式と、読み込む VertexBuffer / IndexBuffer を設定する。
            m_device->SetFVF(kVertexFVF);
            m_device->SetStreamSource(0, m_vertexBuffer.Get(), 0, sizeof(Vertex));
            m_device->SetIndices(m_indexBuffer.Get());

            // ライトは使わず頂点色をそのまま使う。裏面も描く。
            m_device->SetRenderState(D3DRS_LIGHTING, FALSE);
            m_device->SetRenderState(D3DRS_CULLMODE, D3DCULL_NONE);

            // 最終的な色 = Texture の色 × 頂点色（alpha も同じ）。
            m_device->SetTextureStageState(0, D3DTSS_COLOROP, D3DTOP_MODULATE);
            m_device->SetTextureStageState(0, D3DTSS_COLORARG1, D3DTA_TEXTURE);
            m_device->SetTextureStageState(0, D3DTSS_COLORARG2, D3DTA_DIFFUSE);
            m_device->SetTextureStageState(0, D3DTSS_ALPHAOP, D3DTOP_MODULATE);
            m_device->SetTextureStageState(0, D3DTSS_ALPHAARG1, D3DTA_TEXTURE);
            m_device->SetTextureStageState(0, D3DTSS_ALPHAARG2, D3DTA_DIFFUSE);

            // Texture の読み方: UV が 0～1 を超えたら繰り返し、拡大縮小はなめらかに補間する。
            m_device->SetSamplerState(0, D3DSAMP_ADDRESSU, D3DTADDRESS_WRAP);
            m_device->SetSamplerState(0, D3DSAMP_ADDRESSV, D3DTADDRESS_WRAP);
            m_device->SetSamplerState(0, D3DSAMP_MINFILTER, D3DTEXF_LINEAR);
            m_device->SetSamplerState(0, D3DSAMP_MAGFILTER, D3DTEXF_LINEAR);
        }

        void SetCameraTransforms()
        {
            // 今の投影方法に合わせた View / Projection 行列を Device に設定する。
            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);
            const D3DMATRIX view = ToD3DMatrix(matrices.view);
            const D3DMATRIX projection = ToD3DMatrix(matrices.projection);
            m_device->SetTransform(D3DTS_VIEW, &view);
            m_device->SetTransform(D3DTS_PROJECTION, &projection);
        }

        void DrawObject(const DrawRange& range, FXMMATRIX world)
        {
            // この物体の位置（World 行列）を設定する。
            const D3DMATRIX d3dWorld = ToD3DMatrix(world);
            m_device->SetTransform(D3DTS_WORLD, &d3dWorld);

            // IndexBuffer の startIndex から、三角形 indexCount / 3 枚を描く。
            ThrowIfFailed(
                m_device->DrawIndexedPrimitive(
                    D3DPT_TRIANGLELIST,
                    0,
                    0,
                    static_cast<UINT>(m_geometry.vertices.size()),
                    range.startIndex,
                    range.indexCount / 3),
                "IDirect3DDevice9::DrawIndexedPrimitive failed.");
        }

        void RenderScenePass()
        {
            // 1段階目: 描画先を SceneTexture に切り替え、背景色と Depth を初期化する。
            ThrowIfFailed(m_device->SetRenderTarget(0, m_sceneSurface.Get()), "SetRenderTarget(SceneTexture) failed.");
            ThrowIfFailed(
                m_device->Clear(0, nullptr, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER, D3DCOLOR_XRGB(24, 31, 42), 1.0f, 0),
                "Clear(SceneTexture) failed.");
            ThrowIfFailed(m_device->BeginScene(), "BeginScene(scene) failed.");

            // Icon.png・奥行き判定・カメラを設定する。
            m_device->SetTexture(0, m_iconTexture.Get());
            m_device->SetRenderState(D3DRS_ZENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ZWRITEENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);
            SetCameraTransforms();

            // 不透明な物体を描く。同じ形でも World 行列を変えれば別の場所に置ける。
            DrawObject(m_geometry.floor, XMMatrixIdentity());
            DrawObject(m_geometry.cube, XMMatrixTranslation(-1.65f, 0.0f, 0.0f));
            DrawObject(m_geometry.pyramid, XMMatrixTranslation(1.65f, 0.0f, 0.0f));

            // 半透明のパネルは最後に描く。色を混ぜる設定にし、Depth は書き込まない。
            m_device->SetRenderState(D3DRS_ALPHABLENDENABLE, TRUE);
            m_device->SetRenderState(D3DRS_SRCBLEND, D3DBLEND_SRCALPHA);
            m_device->SetRenderState(D3DRS_DESTBLEND, D3DBLEND_INVSRCALPHA);
            m_device->SetRenderState(D3DRS_ZWRITEENABLE, FALSE);
            DrawObject(m_geometry.transparentPanel, XMMatrixIdentity());

            // 変えた設定を元に戻す。DX9 の設定は Device に残り続け、次の Draw にも効くため。
            m_device->SetRenderState(D3DRS_ZWRITEENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);
            ThrowIfFailed(m_device->EndScene(), "EndScene(scene) failed.");
        }

        void RenderPresentPass()
        {
            // 2段階目: 描画先を BackBuffer に戻す。
            ThrowIfFailed(m_device->SetRenderTarget(0, m_backBufferSurface.Get()), "SetRenderTarget(BackBuffer) failed.");
            ThrowIfFailed(
                m_device->Clear(0, nullptr, D3DCLEAR_TARGET, D3DCOLOR_XRGB(10, 13, 18), 1.0f, 0),
                "Clear(BackBuffer) failed.");
            ThrowIfFailed(m_device->BeginScene(), "BeginScene(present) failed.");

            // さっき描いた SceneTexture を、今度は「貼る画像」として使う。
            m_device->SetTexture(0, m_sceneTexture.Get());
            m_device->SetRenderState(D3DRS_ZENABLE, FALSE);

            // 行列は何も変換しない単位行列にし、presentQuad の -1～1 をそのまま画面の端にする。
            // DX9 だけの注意: 画素の中心と Texture の画素の中心が 0.5 画素ずれるため、
            // 四角形を左上へ 0.5 画素ずらして、ぼやけないようにする。
            const D3DMATRIX identity = ToD3DMatrix(XMMatrixIdentity());
            m_device->SetTransform(D3DTS_VIEW, &identity);
            m_device->SetTransform(D3DTS_PROJECTION, &identity);
            const XMMATRIX halfPixelOffset = XMMatrixTranslation(-1.0f / kClientWidth, 1.0f / kClientHeight, 0.0f);
            DrawObject(m_geometry.presentQuad, halfPixelOffset);

            ThrowIfFailed(m_device->EndScene(), "EndScene(present) failed.");
        }

        ComPtr<IDirect3D9> m_d3d;
        ComPtr<IDirect3DDevice9> m_device;
        ComPtr<IDirect3DVertexBuffer9> m_vertexBuffer;
        ComPtr<IDirect3DIndexBuffer9> m_indexBuffer;
        ComPtr<IDirect3DTexture9> m_iconTexture;
        ComPtr<IDirect3DTexture9> m_sceneTexture;
        ComPtr<IDirect3DSurface9> m_sceneSurface;
        ComPtr<IDirect3DSurface9> m_backBufferSurface;
        SceneGeometry m_geometry;
        ProjectionMode m_projectionMode = ProjectionMode::Perspective;
    };

    // ---------- ウィンドウ ----------

    LRESULT CALLBACK WindowProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam)
    {
        if (message == WM_DESTROY)
        {
            PostQuitMessage(0);
            return 0;
        }

        if (message == WM_KEYDOWN && wParam == VK_ESCAPE)
        {
            DestroyWindow(hwnd);
            return 0;
        }

        return DefWindowProcW(hwnd, message, wParam, lParam);
    }

    HWND CreateMainWindow(HINSTANCE instance)
    {
        WNDCLASSEXW windowClass{};
        windowClass.cbSize = sizeof(windowClass);
        windowClass.style = CS_HREDRAW | CS_VREDRAW;
        windowClass.lpfnWndProc = WindowProc;
        windowClass.hInstance = instance;
        windowClass.hCursor = LoadCursor(nullptr, IDC_ARROW);
        windowClass.lpszClassName = kWindowClassName;
        if (!RegisterClassExW(&windowClass))
        {
            return nullptr;
        }

        // 描画できる範囲（クライアント領域）が 1280×720 になるよう、枠を含めた大きさを計算する。
        RECT rect{ 0, 0, static_cast<LONG>(kClientWidth), static_cast<LONG>(kClientHeight) };
        const DWORD style = WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX;
        AdjustWindowRect(&rect, style, FALSE);

        HWND hwnd = CreateWindowExW(
            0,
            kWindowClassName,
            kWindowTitle,
            style,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            rect.right - rect.left,
            rect.bottom - rect.top,
            nullptr,
            nullptr,
            instance,
            nullptr);
        if (!hwnd)
        {
            return nullptr;
        }

        ShowWindow(hwnd, SW_SHOW);
        UpdateWindow(hwnd);
        return hwnd;
    }
}

int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int)
{
    try
    {
        // WIC は COM の仕組みで動くため、最初に COM を使える状態にする。
        ThrowIfFailed(CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED), "CoInitializeEx failed.");

        const HWND hwnd = CreateMainWindow(instance);
        if (!hwnd)
        {
            throw std::runtime_error("Window creation failed.");
        }

        Renderer renderer;
        renderer.Initialize(hwnd);
        RenderStage stage = RenderStage::FullScene;

        MSG message{};
        while (message.message != WM_QUIT)
        {
            // ウィンドウへのメッセージ（キー入力・閉じるなど）があれば先に処理する。
            if (PeekMessageW(&message, nullptr, 0, 0, PM_REMOVE))
            {
                if (message.message == WM_KEYDOWN)
                {
                    switch (message.wParam)
                    {
                    case VK_F1: renderer.SetProjectionMode(ProjectionMode::Orthographic); break;
                    case VK_F2: renderer.SetProjectionMode(ProjectionMode::Perspective); break;
                    case VK_F3: stage = RenderStage::ClearOnly; break;
                    case VK_F4: stage = RenderStage::Sprite; break;
                    case VK_F5: stage = RenderStage::Cube; break;
                    case VK_F6: stage = RenderStage::FullScene; break;
                    }
                }
                TranslateMessage(&message);
                DispatchMessageW(&message);
                continue;
            }

            // メッセージがなければ、選ばれている段階を1フレーム描く。
            renderer.Render(stage);
        }

        CoUninitialize();
        return static_cast<int>(message.wParam);
    }
    catch (const std::exception& exception)
    {
        ShowErrorMessage(exception.what());
        return -1;
    }
}

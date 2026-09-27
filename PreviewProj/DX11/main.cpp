#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>

#include <d3d11.h>       // Direct3D 11 の Device・Context・Resource・View
#include <d3dcompiler.h> // HLSL ファイルを実行時にコンパイルする
#include <DirectXMath.h> // World / View / Projection 行列の計算
#include <wincodec.h>    // WIC: Icon.png を画素の配列へ変換する
#include <wrl/client.h>  // ComPtr: COM オブジェクトを自動で解放する

#include <cstddef>    // std::size_t, offsetof
#include <cstdint>    // std::uint8_t / std::uint16_t
#include <exception>  // std::exception
#include <filesystem> // Icon.png と HLSL ファイルの場所を探す
#include <iterator>   // std::size（配列の要素数）
#include <stdexcept>  // std::runtime_error
#include <string>     // Shader のエラー文
#include <vector>     // 画素・頂点・Index の配列

using Microsoft::WRL::ComPtr;
using namespace DirectX;

#pragma comment(lib, "d3d11.lib")
#pragma comment(lib, "d3dcompiler.lib")
#pragma comment(lib, "windowscodecs.lib")
#pragma comment(lib, "ole32.lib")

namespace
{
    constexpr UINT kClientWidth = 1280;
    constexpr UINT kClientHeight = 720;
    constexpr wchar_t kWindowClassName[] = L"KCGDirectXStudyDX11Preview";
    constexpr wchar_t kWindowTitle[] = L"KCG DirectX Study - DirectX 11 Preview";

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
    // どの byte が何なのかは、CreateShaders の InputLayout で GPU に伝える。
    struct Vertex
    {
        XMFLOAT3 position;
        XMFLOAT4 color;
        XMFLOAT2 uv;
    };

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

    // Shader の cbuffer SceneConstants（register b0）と同じ形にする。
    // ConstantBuffer の大きさは 16byte の倍数でなければならない（float4x4 は 64byte）。
    struct SceneConstants
    {
        XMFLOAT4X4 worldViewProjection;
    };
    static_assert(sizeof(SceneConstants) % 16 == 0);

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

    std::filesystem::path GetShaderPath()
    {
        // main.cpp と同じフォルダーの HLSL を使う（HLSL を書き換えたら、ビルドし直さなくても次の起動で反映される）。
        const std::filesystem::path besideSource = std::filesystem::path(__FILE__).parent_path() / L"DX11SceneShader.hlsl";
        if (std::filesystem::exists(besideSource))
        {
            return besideSource;
        }

        // exe だけを別の PC へ持って行った場合は、ビルド時に exe の隣へコピーされた HLSL を使う。
        wchar_t executablePath[MAX_PATH]{};
        GetModuleFileNameW(nullptr, executablePath, MAX_PATH);
        return std::filesystem::path(executablePath).parent_path() / L"DX11SceneShader.hlsl";
    }

    ComPtr<ID3DBlob> CompileShader(const std::filesystem::path& path, const char* entryPoint, const char* target)
    {
        // Debug ビルドでは、Shader もデバッグしやすい形でコンパイルする。
        UINT flags = D3DCOMPILE_ENABLE_STRICTNESS;
#if defined(_DEBUG)
        flags |= D3DCOMPILE_DEBUG | D3DCOMPILE_SKIP_OPTIMIZATION;
#endif

        // HLSL ファイルの entryPoint 関数を、target（例: vs_5_0）の命令へコンパイルする。
        ComPtr<ID3DBlob> shader;
        ComPtr<ID3DBlob> errors;
        const HRESULT hr = D3DCompileFromFile(
            path.c_str(),
            nullptr,
            D3D_COMPILE_STANDARD_FILE_INCLUDE,
            entryPoint,
            target,
            flags,
            0,
            shader.GetAddressOf(),
            errors.GetAddressOf());

        // 失敗したら、コンパイラのエラー文（行番号つき）をそのまま表示する。
        if (FAILED(hr))
        {
            std::string message = "HLSL のコンパイルに失敗しました。\n";
            if (errors)
            {
                message.append(static_cast<const char*>(errors->GetBufferPointer()), errors->GetBufferSize());
            }
            throw std::runtime_error(message);
        }
        return shader;
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
        XMFLOAT4 color,
        float uvScale = 1.0f)
    {
        const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());
        geometry.vertices.push_back({ p0, color, { 0.0f, uvScale } });
        geometry.vertices.push_back({ p1, color, { 0.0f, 0.0f } });
        geometry.vertices.push_back({ p2, color, { uvScale, 0.0f } });
        geometry.vertices.push_back({ p3, color, { uvScale, uvScale } });

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
        XMFLOAT4 color)
    {
        const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());
        geometry.vertices.push_back({ p0, color, { 0.0f, 1.0f } });
        geometry.vertices.push_back({ p1, color, { 0.5f, 0.0f } });
        geometry.vertices.push_back({ p2, color, { 1.0f, 1.0f } });

        for (std::uint16_t index = 0; index < 3; ++index)
        {
            geometry.indices.push_back(static_cast<std::uint16_t>(base + index));
        }
    }

    SceneGeometry BuildSceneGeometry()
    {
        SceneGeometry geometry;
        const XMFLOAT4 white{ 1.0f, 1.0f, 1.0f, 1.0f };

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

        // 半透明のパネル。頂点色の alpha = 0.35。
        geometry.transparentPanel.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(
            geometry,
            { -2.7f, -0.8f, -1.8f },
            { -2.7f, 1.8f, -1.8f },
            { 2.7f, 1.8f, -1.8f },
            { 2.7f, -0.8f, -1.8f },
            { 0.25f, 0.65f, 1.0f, 0.35f },
            2.0f);
        geometry.transparentPanel.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.transparentPanel.startIndex;

        // 画面全体を覆う四角形。行列を使わず、-1～1 の座標がそのまま画面の端になる。
        geometry.presentQuad.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(geometry, { -1, -1, 0 }, { -1, 1, 0 }, { 1, 1, 0 }, { 1, -1, 0 }, white);
        geometry.presentQuad.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.presentQuad.startIndex;

        return geometry;
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
            CreateDeviceAndSwapChain(hwnd);
            CreateBackBufferView();
            CreateShaders();
            CreateGeometryBuffers();
            CreateConstantBuffer();
            CreateIconTexture();
            CreateDepthBuffer();
            CreatePipelineStates();
            CreateSceneTexture();
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
            // 描画先を BackBuffer の RTV にして、背景色で塗りつぶす。
            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            m_context->OMSetRenderTargets(1, m_backBufferRTV.GetAddressOf(), nullptr);
            m_context->ClearRenderTargetView(m_backBufferRTV.Get(), clearColor);

            // BackBuffer をウィンドウへ表示する。
            ThrowIfFailed(m_swapChain->Present(1, 0), "IDXGISwapChain::Present failed.");
        }

        // 確認 2（F4 / F5）: BackBuffer へ直接、物体を1個だけ描く。
        void RenderOneObject(const DrawRange& range)
        {
            // 描画先を BackBuffer + Depth にして、両方を初期化する。
            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            m_context->OMSetRenderTargets(1, m_backBufferRTV.GetAddressOf(), m_depthStencilView.Get());
            m_context->ClearRenderTargetView(m_backBufferRTV.Get(), clearColor);
            m_context->ClearDepthStencilView(m_depthStencilView.Get(), D3D11_CLEAR_DEPTH, 1.0f, 0);

            // 共通の設定に加え、Icon.png・奥行きあり・不透明の State を接続する。
            BindCommonPipeline();
            m_context->PSSetShaderResources(0, 1, m_iconSRV.GetAddressOf());
            m_context->OMSetDepthStencilState(m_depthWriteState.Get(), 0);
            m_context->OMSetBlendState(m_opaqueBlendState.Get(), nullptr, 0xFFFFFFFF);

            // 渡された物体を1個、原点に描く。
            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);
            DrawObject(range, XMMatrixIdentity(), matrices.view, matrices.projection);

            ThrowIfFailed(m_swapChain->Present(1, 0), "IDXGISwapChain::Present failed.");
        }

        // 完成（F6）: SceneTexture へ描いてから、それを画面へ貼る 2-pass 描画。
        void RenderFullScene()
        {
            RenderScenePass();
            RenderPresentPass();
            ThrowIfFailed(m_swapChain->Present(1, 0), "IDXGISwapChain::Present failed.");
        }

    private:
        void CreateDeviceAndSwapChain(HWND hwnd)
        {
            // SwapChain の設定: 1280×720 の BackBuffer を2枚用意し、交互に表示する。
            DXGI_SWAP_CHAIN_DESC swapChainDesc{};
            swapChainDesc.BufferDesc.Width = kClientWidth;
            swapChainDesc.BufferDesc.Height = kClientHeight;
            swapChainDesc.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
            swapChainDesc.SampleDesc.Count = 1;
            swapChainDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
            swapChainDesc.BufferCount = 2;
            swapChainDesc.OutputWindow = hwnd;
            swapChainDesc.Windowed = TRUE;
            swapChainDesc.SwapEffect = DXGI_SWAP_EFFECT_FLIP_DISCARD;

            // Debug ビルドでは Debug Layer を有効にし、API の使い方の誤りを「出力」ウィンドウへ表示させる。
            UINT flags = 0;
#if defined(_DEBUG)
            flags |= D3D11_CREATE_DEVICE_DEBUG;
#endif
            const D3D_FEATURE_LEVEL featureLevel = D3D_FEATURE_LEVEL_11_0;

            // Device（作る係）・ImmediateContext（命令する係）・SwapChain（表示する係）を一度に作る。
            HRESULT hr = D3D11CreateDeviceAndSwapChain(
                nullptr,
                D3D_DRIVER_TYPE_HARDWARE,
                nullptr,
                flags,
                &featureLevel,
                1,
                D3D11_SDK_VERSION,
                &swapChainDesc,
                m_swapChain.GetAddressOf(),
                m_device.GetAddressOf(),
                nullptr,
                m_context.GetAddressOf());

            // Debug Layer が入っていない PC では失敗するため、Debug Layer なしで作り直す。
            if (FAILED(hr) && (flags & D3D11_CREATE_DEVICE_DEBUG) != 0)
            {
                hr = D3D11CreateDeviceAndSwapChain(
                    nullptr,
                    D3D_DRIVER_TYPE_HARDWARE,
                    nullptr,
                    0,
                    &featureLevel,
                    1,
                    D3D11_SDK_VERSION,
                    &swapChainDesc,
                    m_swapChain.GetAddressOf(),
                    m_device.GetAddressOf(),
                    nullptr,
                    m_context.GetAddressOf());
            }
            ThrowIfFailed(hr, "D3D11CreateDeviceAndSwapChain failed.");
        }

        void CreateBackBufferView()
        {
            // SwapChain が持つ BackBuffer（Texture2D）を取り出す。
            ComPtr<ID3D11Texture2D> backBuffer;
            ThrowIfFailed(
                m_swapChain->GetBuffer(0, IID_PPV_ARGS(backBuffer.GetAddressOf())),
                "IDXGISwapChain::GetBuffer failed.");

            // 「描画先として使う」ための View（RTV）を作る。Draw の描画先には Texture ではなく View を渡す。
            ThrowIfFailed(
                m_device->CreateRenderTargetView(backBuffer.Get(), nullptr, m_backBufferRTV.GetAddressOf()),
                "CreateRenderTargetView(BackBuffer) failed.");
        }

        void CreateShaders()
        {
            // HLSL ファイルの VSMain / PSMain を、それぞれ Shader Model 5.0 でコンパイルする。
            const std::filesystem::path shaderPath = GetShaderPath();
            const ComPtr<ID3DBlob> vertexShaderCode = CompileShader(shaderPath, "VSMain", "vs_5_0");
            const ComPtr<ID3DBlob> pixelShaderCode = CompileShader(shaderPath, "PSMain", "ps_5_0");

            // コンパイル結果から VertexShader / PixelShader オブジェクトを作る。
            ThrowIfFailed(
                m_device->CreateVertexShader(
                    vertexShaderCode->GetBufferPointer(),
                    vertexShaderCode->GetBufferSize(),
                    nullptr,
                    m_vertexShader.GetAddressOf()),
                "CreateVertexShader failed.");
            ThrowIfFailed(
                m_device->CreatePixelShader(
                    pixelShaderCode->GetBufferPointer(),
                    pixelShaderCode->GetBufferSize(),
                    nullptr,
                    m_pixelShader.GetAddressOf()),
                "CreatePixelShader failed.");

            // InputLayout: Vertex の各メンバーを、HLSL の POSITION / COLOR / TEXCOORD と対応させる。
            // 「何 byte 目から・どの形式で」読むかを1行ずつ書く。
            const D3D11_INPUT_ELEMENT_DESC inputElements[] =
            {
                { "POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT,    0, offsetof(Vertex, position), D3D11_INPUT_PER_VERTEX_DATA, 0 },
                { "COLOR",    0, DXGI_FORMAT_R32G32B32A32_FLOAT, 0, offsetof(Vertex, color),    D3D11_INPUT_PER_VERTEX_DATA, 0 },
                { "TEXCOORD", 0, DXGI_FORMAT_R32G32_FLOAT,       0, offsetof(Vertex, uv),       D3D11_INPUT_PER_VERTEX_DATA, 0 },
            };
            ThrowIfFailed(
                m_device->CreateInputLayout(
                    inputElements,
                    static_cast<UINT>(std::size(inputElements)),
                    vertexShaderCode->GetBufferPointer(),
                    vertexShaderCode->GetBufferSize(),
                    m_inputLayout.GetAddressOf()),
                "CreateInputLayout failed.");
        }

        void CreateGeometryBuffers()
        {
            // CPU 側で、すべての物体の頂点と Index を作る。
            m_geometry = BuildSceneGeometry();

            // VertexBuffer を作る。作成と同時に初期データ（pSysMem）をコピーする。
            // IMMUTABLE = 作った後は書き換えない。GPU が読みやすい場所に置ける。
            D3D11_BUFFER_DESC vertexDesc{};
            vertexDesc.ByteWidth = static_cast<UINT>(m_geometry.vertices.size() * sizeof(Vertex));
            vertexDesc.Usage = D3D11_USAGE_IMMUTABLE;
            vertexDesc.BindFlags = D3D11_BIND_VERTEX_BUFFER;
            D3D11_SUBRESOURCE_DATA vertexData{};
            vertexData.pSysMem = m_geometry.vertices.data();
            ThrowIfFailed(
                m_device->CreateBuffer(&vertexDesc, &vertexData, m_vertexBuffer.GetAddressOf()),
                "CreateBuffer(VertexBuffer) failed.");

            // IndexBuffer も同じ手順。BindFlags だけが違う。
            D3D11_BUFFER_DESC indexDesc{};
            indexDesc.ByteWidth = static_cast<UINT>(m_geometry.indices.size() * sizeof(std::uint16_t));
            indexDesc.Usage = D3D11_USAGE_IMMUTABLE;
            indexDesc.BindFlags = D3D11_BIND_INDEX_BUFFER;
            D3D11_SUBRESOURCE_DATA indexData{};
            indexData.pSysMem = m_geometry.indices.data();
            ThrowIfFailed(
                m_device->CreateBuffer(&indexDesc, &indexData, m_indexBuffer.GetAddressOf()),
                "CreateBuffer(IndexBuffer) failed.");
        }

        void CreateConstantBuffer()
        {
            // 物体ごとに書き換える行列（SceneConstants）を置く Buffer を作る。
            // DEFAULT = GPU 用のメモリ。中身は描画のたびに UpdateSubresource で更新する。
            D3D11_BUFFER_DESC constantDesc{};
            constantDesc.ByteWidth = sizeof(SceneConstants);
            constantDesc.Usage = D3D11_USAGE_DEFAULT;
            constantDesc.BindFlags = D3D11_BIND_CONSTANT_BUFFER;
            ThrowIfFailed(
                m_device->CreateBuffer(&constantDesc, nullptr, m_constantBuffer.GetAddressOf()),
                "CreateBuffer(ConstantBuffer) failed.");
        }

        void CreateIconTexture()
        {
            // Icon.png を BGRA の画素配列として読み込む。
            const ImageData image = LoadPngWithWIC(GetIconPath());

            // 画像と同じ大きさの Texture2D を、画素をコピーしながら作る。
            // SysMemPitch = CPU 側の画素配列で、1行が何 byte か。
            D3D11_TEXTURE2D_DESC textureDesc{};
            textureDesc.Width = image.width;
            textureDesc.Height = image.height;
            textureDesc.MipLevels = 1;
            textureDesc.ArraySize = 1;
            textureDesc.Format = DXGI_FORMAT_B8G8R8A8_UNORM;
            textureDesc.SampleDesc.Count = 1;
            textureDesc.Usage = D3D11_USAGE_IMMUTABLE;
            textureDesc.BindFlags = D3D11_BIND_SHADER_RESOURCE;
            D3D11_SUBRESOURCE_DATA textureData{};
            textureData.pSysMem = image.pixels.data();
            textureData.SysMemPitch = image.width * 4;

            ComPtr<ID3D11Texture2D> texture;
            ThrowIfFailed(
                m_device->CreateTexture2D(&textureDesc, &textureData, texture.GetAddressOf()),
                "CreateTexture2D(Icon) failed.");

            // Shader から読むための View（SRV）を作る。Shader には Texture ではなく SRV を渡す。
            ThrowIfFailed(
                m_device->CreateShaderResourceView(texture.Get(), nullptr, m_iconSRV.GetAddressOf()),
                "CreateShaderResourceView(Icon) failed.");
        }

        void CreateDepthBuffer()
        {
            // 奥行き（Depth）を記録する Texture2D を作る。1画素 = Depth 24bit + Stencil 8bit。
            D3D11_TEXTURE2D_DESC depthDesc{};
            depthDesc.Width = kClientWidth;
            depthDesc.Height = kClientHeight;
            depthDesc.MipLevels = 1;
            depthDesc.ArraySize = 1;
            depthDesc.Format = DXGI_FORMAT_D24_UNORM_S8_UINT;
            depthDesc.SampleDesc.Count = 1;
            depthDesc.Usage = D3D11_USAGE_DEFAULT;
            depthDesc.BindFlags = D3D11_BIND_DEPTH_STENCIL;

            ComPtr<ID3D11Texture2D> depthTexture;
            ThrowIfFailed(
                m_device->CreateTexture2D(&depthDesc, nullptr, depthTexture.GetAddressOf()),
                "CreateTexture2D(Depth) failed.");

            // 「Depth の書き込み先として使う」ための View（DSV）を作る。
            ThrowIfFailed(
                m_device->CreateDepthStencilView(depthTexture.Get(), nullptr, m_depthStencilView.GetAddressOf()),
                "CreateDepthStencilView failed.");
        }

        void CreatePipelineStates()
        {
            // Sampler: UV が 0～1 を超えたら繰り返し（WRAP）、拡大縮小はなめらかに補間する。
            D3D11_SAMPLER_DESC samplerDesc{};
            samplerDesc.Filter = D3D11_FILTER_MIN_MAG_MIP_LINEAR;
            samplerDesc.AddressU = D3D11_TEXTURE_ADDRESS_WRAP;
            samplerDesc.AddressV = D3D11_TEXTURE_ADDRESS_WRAP;
            samplerDesc.AddressW = D3D11_TEXTURE_ADDRESS_WRAP;
            samplerDesc.MaxAnisotropy = 1;
            samplerDesc.ComparisonFunc = D3D11_COMPARISON_NEVER;
            samplerDesc.MaxLOD = D3D11_FLOAT32_MAX;
            ThrowIfFailed(m_device->CreateSamplerState(&samplerDesc, m_sampler.GetAddressOf()), "CreateSamplerState failed.");

            // Rasterizer: 三角形を塗りつぶし、裏向きの面も描く。
            D3D11_RASTERIZER_DESC rasterizerDesc{};
            rasterizerDesc.FillMode = D3D11_FILL_SOLID;
            rasterizerDesc.CullMode = D3D11_CULL_NONE;
            rasterizerDesc.DepthClipEnable = TRUE;
            ThrowIfFailed(m_device->CreateRasterizerState(&rasterizerDesc, m_rasterizerState.GetAddressOf()), "CreateRasterizerState failed.");

            // Depth の3種類: 判定して書き込む（不透明）/ 判定だけ（半透明）/ 使わない（画面へ貼るとき）。
            D3D11_DEPTH_STENCIL_DESC depthWriteDesc{};
            depthWriteDesc.DepthEnable = TRUE;
            depthWriteDesc.DepthWriteMask = D3D11_DEPTH_WRITE_MASK_ALL;
            depthWriteDesc.DepthFunc = D3D11_COMPARISON_LESS;
            ThrowIfFailed(m_device->CreateDepthStencilState(&depthWriteDesc, m_depthWriteState.GetAddressOf()), "CreateDepthStencilState(write) failed.");

            D3D11_DEPTH_STENCIL_DESC depthReadOnlyDesc = depthWriteDesc;
            depthReadOnlyDesc.DepthWriteMask = D3D11_DEPTH_WRITE_MASK_ZERO;
            ThrowIfFailed(m_device->CreateDepthStencilState(&depthReadOnlyDesc, m_depthReadOnlyState.GetAddressOf()), "CreateDepthStencilState(read only) failed.");

            D3D11_DEPTH_STENCIL_DESC depthDisabledDesc{};
            depthDisabledDesc.DepthEnable = FALSE;
            depthDisabledDesc.DepthWriteMask = D3D11_DEPTH_WRITE_MASK_ZERO;
            depthDisabledDesc.DepthFunc = D3D11_COMPARISON_ALWAYS;
            ThrowIfFailed(m_device->CreateDepthStencilState(&depthDisabledDesc, m_depthDisabledState.GetAddressOf()), "CreateDepthStencilState(disabled) failed.");

            // Blend の2種類: 上書き（不透明）/ alpha で混ぜる（半透明）。
            // 半透明の式: 結果 = 新しい色 × alpha + 今の色 × (1 - alpha)
            D3D11_BLEND_DESC opaqueBlendDesc{};
            opaqueBlendDesc.RenderTarget[0].BlendEnable = FALSE;
            opaqueBlendDesc.RenderTarget[0].RenderTargetWriteMask = D3D11_COLOR_WRITE_ENABLE_ALL;
            ThrowIfFailed(m_device->CreateBlendState(&opaqueBlendDesc, m_opaqueBlendState.GetAddressOf()), "CreateBlendState(opaque) failed.");

            D3D11_BLEND_DESC alphaBlendDesc = opaqueBlendDesc;
            D3D11_RENDER_TARGET_BLEND_DESC& alphaTarget = alphaBlendDesc.RenderTarget[0];
            alphaTarget.BlendEnable = TRUE;
            alphaTarget.SrcBlend = D3D11_BLEND_SRC_ALPHA;
            alphaTarget.DestBlend = D3D11_BLEND_INV_SRC_ALPHA;
            alphaTarget.BlendOp = D3D11_BLEND_OP_ADD;
            alphaTarget.SrcBlendAlpha = D3D11_BLEND_ONE;
            alphaTarget.DestBlendAlpha = D3D11_BLEND_ZERO;
            alphaTarget.BlendOpAlpha = D3D11_BLEND_OP_ADD;
            ThrowIfFailed(m_device->CreateBlendState(&alphaBlendDesc, m_alphaBlendState.GetAddressOf()), "CreateBlendState(alpha) failed.");
        }

        void CreateSceneTexture()
        {
            // 描画先にも、Shader から読む Texture にもなる SceneTexture を作る。
            // BindFlags に2つの用途（RENDER_TARGET と SHADER_RESOURCE）を両方指定する。
            D3D11_TEXTURE2D_DESC sceneDesc{};
            sceneDesc.Width = kClientWidth;
            sceneDesc.Height = kClientHeight;
            sceneDesc.MipLevels = 1;
            sceneDesc.ArraySize = 1;
            sceneDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
            sceneDesc.SampleDesc.Count = 1;
            sceneDesc.Usage = D3D11_USAGE_DEFAULT;
            sceneDesc.BindFlags = D3D11_BIND_RENDER_TARGET | D3D11_BIND_SHADER_RESOURCE;
            ComPtr<ID3D11Texture2D> sceneTexture;
            ThrowIfFailed(
                m_device->CreateTexture2D(&sceneDesc, nullptr, sceneTexture.GetAddressOf()),
                "CreateTexture2D(SceneTexture) failed.");

            // 同じ Texture に、用途ごとの View を2つ作る。描くときは RTV、読むときは SRV。
            ThrowIfFailed(
                m_device->CreateRenderTargetView(sceneTexture.Get(), nullptr, m_sceneRTV.GetAddressOf()),
                "CreateRenderTargetView(SceneTexture) failed.");
            ThrowIfFailed(
                m_device->CreateShaderResourceView(sceneTexture.Get(), nullptr, m_sceneSRV.GetAddressOf()),
                "CreateShaderResourceView(SceneTexture) failed.");
        }

        void BindCommonPipeline()
        {
            // 入力: 頂点の読み方・三角形の並び・VertexBuffer・IndexBuffer。
            const UINT stride = sizeof(Vertex);
            const UINT offset = 0;
            m_context->IASetInputLayout(m_inputLayout.Get());
            m_context->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
            m_context->IASetVertexBuffers(0, 1, m_vertexBuffer.GetAddressOf(), &stride, &offset);
            m_context->IASetIndexBuffer(m_indexBuffer.Get(), DXGI_FORMAT_R16_UINT, 0);

            // Shader と、Shader が読む ConstantBuffer（b0）・Sampler（s0）。
            m_context->VSSetShader(m_vertexShader.Get(), nullptr, 0);
            m_context->VSSetConstantBuffers(0, 1, m_constantBuffer.GetAddressOf());
            m_context->PSSetShader(m_pixelShader.Get(), nullptr, 0);
            m_context->PSSetSamplers(0, 1, m_sampler.GetAddressOf());

            // 描く範囲（Viewport = 画面全体）と、三角形の塗り方。
            const D3D11_VIEWPORT viewport{ 0.0f, 0.0f, static_cast<float>(kClientWidth), static_cast<float>(kClientHeight), 0.0f, 1.0f };
            m_context->RSSetViewports(1, &viewport);
            m_context->RSSetState(m_rasterizerState.Get());
        }

        void DrawObject(const DrawRange& range, FXMMATRIX world, CXMMATRIX view, CXMMATRIX projection)
        {
            // World × View × Projection をまとめた行列を ConstantBuffer へ書き込む。
            // HLSL は列優先で行列を読むため、転置（Transpose）してから渡す。
            SceneConstants constants{};
            XMStoreFloat4x4(&constants.worldViewProjection, XMMatrixTranspose(world * view * projection));
            m_context->UpdateSubresource(m_constantBuffer.Get(), 0, nullptr, &constants, 0, 0);

            // IndexBuffer の startIndex から indexCount 個の Index を使って描く。
            m_context->DrawIndexed(range.indexCount, range.startIndex, 0);
        }

        void RenderScenePass()
        {
            // SceneTexture は前のフレームで SRV（読み取り元）として接続されたまま。
            // 同じ Texture を「読みながら描く」ことはできないので、先に SRV の接続を外す。
            ID3D11ShaderResourceView* nullSRV = nullptr;
            m_context->PSSetShaderResources(0, 1, &nullSRV);

            // 1段階目: 描画先を SceneTexture の RTV + Depth にして、両方を初期化する。
            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            m_context->OMSetRenderTargets(1, m_sceneRTV.GetAddressOf(), m_depthStencilView.Get());
            m_context->ClearRenderTargetView(m_sceneRTV.Get(), clearColor);
            m_context->ClearDepthStencilView(m_depthStencilView.Get(), D3D11_CLEAR_DEPTH, 1.0f, 0);

            // 共通の設定に加え、Icon.png・奥行きあり・不透明の State を接続する。
            BindCommonPipeline();
            m_context->PSSetShaderResources(0, 1, m_iconSRV.GetAddressOf());
            m_context->OMSetDepthStencilState(m_depthWriteState.Get(), 0);
            m_context->OMSetBlendState(m_opaqueBlendState.Get(), nullptr, 0xFFFFFFFF);
            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);

            // 不透明な物体を描く。同じ形でも World 行列を変えれば別の場所に置ける。
            DrawObject(m_geometry.floor, XMMatrixIdentity(), matrices.view, matrices.projection);
            DrawObject(m_geometry.cube, XMMatrixTranslation(-1.65f, 0.0f, 0.0f), matrices.view, matrices.projection);
            DrawObject(m_geometry.pyramid, XMMatrixTranslation(1.65f, 0.0f, 0.0f), matrices.view, matrices.projection);

            // 半透明のパネルは最後に描く。State Object を「混ぜる」「Depth は書かない」ものへ差し替える。
            m_context->OMSetBlendState(m_alphaBlendState.Get(), nullptr, 0xFFFFFFFF);
            m_context->OMSetDepthStencilState(m_depthReadOnlyState.Get(), 0);
            DrawObject(m_geometry.transparentPanel, XMMatrixIdentity(), matrices.view, matrices.projection);
        }

        void RenderPresentPass()
        {
            // 2段階目: 描画先を BackBuffer の RTV にする（Depth は使わない）。
            const float clearColor[4] = { 10.0f / 255.0f, 13.0f / 255.0f, 18.0f / 255.0f, 1.0f };
            m_context->OMSetRenderTargets(1, m_backBufferRTV.GetAddressOf(), nullptr);
            m_context->ClearRenderTargetView(m_backBufferRTV.Get(), clearColor);

            // さっき RTV で描いた SceneTexture を、今度は SRV（読み取り元）として Shader へ渡す。
            BindCommonPipeline();
            m_context->PSSetShaderResources(0, 1, m_sceneSRV.GetAddressOf());
            m_context->OMSetDepthStencilState(m_depthDisabledState.Get(), 0);
            m_context->OMSetBlendState(m_opaqueBlendState.Get(), nullptr, 0xFFFFFFFF);

            // 行列は何も変換しない単位行列にし、presentQuad の -1～1 をそのまま画面の端にする。
            DrawObject(m_geometry.presentQuad, XMMatrixIdentity(), XMMatrixIdentity(), XMMatrixIdentity());
        }

        ComPtr<ID3D11Device> m_device;
        ComPtr<ID3D11DeviceContext> m_context;
        ComPtr<IDXGISwapChain> m_swapChain;
        ComPtr<ID3D11RenderTargetView> m_backBufferRTV;
        ComPtr<ID3D11VertexShader> m_vertexShader;
        ComPtr<ID3D11PixelShader> m_pixelShader;
        ComPtr<ID3D11InputLayout> m_inputLayout;
        ComPtr<ID3D11Buffer> m_vertexBuffer;
        ComPtr<ID3D11Buffer> m_indexBuffer;
        ComPtr<ID3D11Buffer> m_constantBuffer;
        ComPtr<ID3D11ShaderResourceView> m_iconSRV;
        ComPtr<ID3D11DepthStencilView> m_depthStencilView;
        ComPtr<ID3D11SamplerState> m_sampler;
        ComPtr<ID3D11RasterizerState> m_rasterizerState;
        ComPtr<ID3D11DepthStencilState> m_depthWriteState;
        ComPtr<ID3D11DepthStencilState> m_depthReadOnlyState;
        ComPtr<ID3D11DepthStencilState> m_depthDisabledState;
        ComPtr<ID3D11BlendState> m_opaqueBlendState;
        ComPtr<ID3D11BlendState> m_alphaBlendState;
        ComPtr<ID3D11RenderTargetView> m_sceneRTV;
        ComPtr<ID3D11ShaderResourceView> m_sceneSRV;
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

#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>

#include <d3d12.h>       // Direct3D 12 の Device・Resource・Command・PSO
#include <dxgi1_6.h>     // DXGI: GPU の選択と SwapChain（画面表示）
#include <d3dcompiler.h> // HLSL のコンパイルと RootSignature の変換
#include <DirectXMath.h> // World / View / Projection 行列の計算
#include <wincodec.h>    // WIC: Icon.png を画素の配列へ変換する
#include <wrl/client.h>  // ComPtr: COM オブジェクトを自動で解放する

#include <array>      // BackBuffer 2枚の配列
#include <cstddef>    // std::size_t, offsetof
#include <cstdint>    // std::uint8_t / std::uint16_t
#include <cstring>    // std::memcpy
#include <exception>  // std::exception
#include <filesystem> // Icon.png と HLSL ファイルの場所を探す
#include <iterator>   // std::size（配列の要素数）
#include <stdexcept>  // std::runtime_error
#include <string>     // エラー文
#include <vector>     // 画素・頂点・Index の配列

using Microsoft::WRL::ComPtr;
using namespace DirectX;

#pragma comment(lib, "d3d12.lib")
#pragma comment(lib, "dxgi.lib")
#pragma comment(lib, "d3dcompiler.lib")
#pragma comment(lib, "windowscodecs.lib")
#pragma comment(lib, "ole32.lib")

namespace
{
    constexpr UINT kClientWidth = 1280;
    constexpr UINT kClientHeight = 720;
    constexpr wchar_t kWindowClassName[] = L"KCGDirectXStudyDX12Preview";
    constexpr wchar_t kWindowTitle[] = L"KCG DirectX Study - DirectX 12 Preview";

    // ---------- 定数とデータの型 ----------

    // BackBuffer の枚数と、1フレームで描く物体の数（床・立方体・四角すい・パネル）。
    constexpr UINT kFrameCount = 2;
    constexpr UINT kObjectCount = 4;

    // DescriptorHeap の中の並び順。
    // RTV Heap: [0] [1] = BackBuffer
    // SRV Heap: [0] = Icon.png
    constexpr UINT kIconSrvIndex = 0;
    constexpr UINT kSrvCount = 1;

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
    // どの byte が何なのかは、CreatePipelineStates の InputLayout で GPU に伝える。
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
    };

    // Shader の cbuffer SceneConstants（register b0）と同じ形にする。
    struct SceneConstants
    {
        XMFLOAT4X4 worldViewProjection;
    };

    // ConstantBuffer は 256byte 境界から置く決まりがある。1物体ぶんを 256byte に切り上げた間隔。
    constexpr UINT kConstantBufferStride =
        (sizeof(SceneConstants) + D3D12_CONSTANT_BUFFER_DATA_PLACEMENT_ALIGNMENT - 1)
        & ~(D3D12_CONSTANT_BUFFER_DATA_PLACEMENT_ALIGNMENT - 1);

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

    // DescriptorHeap の index 番目の場所。「Heap の先頭 + index × 1個の大きさ」で求める。
    D3D12_CPU_DESCRIPTOR_HANDLE CpuHandle(ID3D12DescriptorHeap* heap, UINT index, UINT descriptorSize)
    {
        D3D12_CPU_DESCRIPTOR_HANDLE handle = heap->GetCPUDescriptorHandleForHeapStart();
        handle.ptr += static_cast<SIZE_T>(index) * descriptorSize;
        return handle;
    }

    // Shader から見るときの場所（GPU 側の番地）も、同じ計算で求める。
    D3D12_GPU_DESCRIPTOR_HANDLE GpuHandle(ID3D12DescriptorHeap* heap, UINT index, UINT descriptorSize)
    {
        D3D12_GPU_DESCRIPTOR_HANDLE handle = heap->GetGPUDescriptorHandleForHeapStart();
        handle.ptr += static_cast<UINT64>(index) * descriptorSize;
        return handle;
    }

    // Resource の使い方（State）を before から after へ切り替える命令（Barrier）の内容を作る。
    D3D12_RESOURCE_BARRIER TransitionBarrier(ID3D12Resource* resource, D3D12_RESOURCE_STATES before, D3D12_RESOURCE_STATES after)
    {
        D3D12_RESOURCE_BARRIER barrier{};
        barrier.Type = D3D12_RESOURCE_BARRIER_TYPE_TRANSITION;
        barrier.Transition.pResource = resource;
        barrier.Transition.Subresource = D3D12_RESOURCE_BARRIER_ALL_SUBRESOURCES;
        barrier.Transition.StateBefore = before;
        barrier.Transition.StateAfter = after;
        return barrier;
    }

    std::filesystem::path GetShaderPath()
    {
        // main.cpp と同じフォルダーの HLSL を使う（HLSL を書き換えたら、ビルドし直さなくても次の起動で反映される）。
        const std::filesystem::path besideSource = std::filesystem::path(__FILE__).parent_path() / L"DX12SceneShader.hlsl";
        if (std::filesystem::exists(besideSource))
        {
            return besideSource;
        }

        // exe だけを別の PC へ持って行った場合は、ビルド時に exe の隣へコピーされた HLSL を使う。
        wchar_t executablePath[MAX_PATH]{};
        GetModuleFileNameW(nullptr, executablePath, MAX_PATH);
        return std::filesystem::path(executablePath).parent_path() / L"DX12SceneShader.hlsl";
    }

    ComPtr<ID3DBlob> CompileShader(const std::filesystem::path& path, const char* entryPoint, const char* target)
    {
        // Debug ビルドでは、Shader もデバッグしやすい形でコンパイルする。
        UINT flags = D3DCOMPILE_ENABLE_STRICTNESS;
#if defined(_DEBUG)
        flags |= D3DCOMPILE_DEBUG | D3DCOMPILE_SKIP_OPTIMIZATION;
#endif

        // HLSL ファイルの entryPoint 関数を、target（例: vs_5_1）の命令へコンパイルする。
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

    // Resource を置くメモリ（Heap）の種類を指定する。
    // DEFAULT = GPU 専用で速い。UPLOAD = CPU から書き込める（GPU からも読める）。
    D3D12_HEAP_PROPERTIES HeapProperties(D3D12_HEAP_TYPE type)
    {
        D3D12_HEAP_PROPERTIES properties{};
        properties.Type = type;
        properties.CPUPageProperty = D3D12_CPU_PAGE_PROPERTY_UNKNOWN;
        properties.MemoryPoolPreference = D3D12_MEMORY_POOL_UNKNOWN;
        properties.CreationNodeMask = 1;
        properties.VisibleNodeMask = 1;
        return properties;
    }

    // size byte のただの Buffer（1次元のメモリ）を作るための設定。
    D3D12_RESOURCE_DESC BufferDescription(UINT64 size)
    {
        D3D12_RESOURCE_DESC desc{};
        desc.Dimension = D3D12_RESOURCE_DIMENSION_BUFFER;
        desc.Width = size;
        desc.Height = 1;
        desc.DepthOrArraySize = 1;
        desc.MipLevels = 1;
        desc.Format = DXGI_FORMAT_UNKNOWN;
        desc.SampleDesc.Count = 1;
        desc.Layout = D3D12_TEXTURE_LAYOUT_ROW_MAJOR;
        desc.Flags = D3D12_RESOURCE_FLAG_NONE;
        return desc;
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
        ~Renderer()
        {
            // 毎フレーム GPU の完了を待っているので、ここで GPU が Resource を使っていることはない。
            if (m_fenceEvent)
            {
                CloseHandle(m_fenceEvent);
            }
        }

        void Initialize(HWND hwnd)
        {
            EnableDebugLayer();
            CreateDeviceAndSwapChain(hwnd);
            CreateDescriptorHeaps();
            CreateBackBufferViews();
            CreateCommandObjects();
            CreateFence();
            CreateRootSignature();
            CreatePipelineStates();
            UploadSceneResources();
            CreateConstantBuffer();
            CreateDepthBuffer();
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
            BeginFrame();

            // 今の BackBuffer の RTV を描画先にして、背景色で塗りつぶす。
            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            const D3D12_CPU_DESCRIPTOR_HANDLE rtv = CpuHandle(m_rtvHeap.Get(), m_frameIndex, m_rtvDescriptorSize);
            m_commandList->OMSetRenderTargets(1, &rtv, FALSE, nullptr);
            m_commandList->ClearRenderTargetView(rtv, clearColor, 0, nullptr);

            EndFrame();
        }

        // 確認 2（F4 / F5）: BackBuffer へ直接、物体を1個だけ描く。
        void RenderOneObject(const DrawRange& range)
        {
            BeginFrame();

            // 描画先を BackBuffer + Depth にして、両方を初期化する。
            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            const D3D12_CPU_DESCRIPTOR_HANDLE rtv = CpuHandle(m_rtvHeap.Get(), m_frameIndex, m_rtvDescriptorSize);
            const D3D12_CPU_DESCRIPTOR_HANDLE dsv = m_dsvHeap->GetCPUDescriptorHandleForHeapStart();
            m_commandList->OMSetRenderTargets(1, &rtv, FALSE, &dsv);
            m_commandList->ClearRenderTargetView(rtv, clearColor, 0, nullptr);
            m_commandList->ClearDepthStencilView(dsv, D3D12_CLEAR_FLAG_DEPTH, 1.0f, 0, 0, nullptr);

            // 共通の設定に加え、不透明用 PSO と Icon.png の SRV（t0）を指定する。
            BindCommonPipeline();
            m_commandList->SetPipelineState(m_opaquePSO.Get());
            m_commandList->SetGraphicsRootDescriptorTable(1, GpuHandle(m_srvHeap.Get(), kIconSrvIndex, m_srvDescriptorSize));

            // 渡された物体を1個、原点に描く。
            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);
            DrawObject(0, range, XMMatrixIdentity(), matrices.view, matrices.projection);

            EndFrame();
        }

        // 完成（F6）: 床・立方体・四角すい・半透明パネルを並べて描く。
        void RenderFullScene()
        {
            BeginFrame();

            // 描画先を BackBuffer + Depth にして、両方を初期化する。
            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            const D3D12_CPU_DESCRIPTOR_HANDLE rtv = CpuHandle(m_rtvHeap.Get(), m_frameIndex, m_rtvDescriptorSize);
            const D3D12_CPU_DESCRIPTOR_HANDLE dsv = m_dsvHeap->GetCPUDescriptorHandleForHeapStart();
            m_commandList->OMSetRenderTargets(1, &rtv, FALSE, &dsv);
            m_commandList->ClearRenderTargetView(rtv, clearColor, 0, nullptr);
            m_commandList->ClearDepthStencilView(dsv, D3D12_CLEAR_FLAG_DEPTH, 1.0f, 0, 0, nullptr);

            // 共通の設定に加え、不透明用 PSO と Icon.png の SRV（t0）を指定する。
            BindCommonPipeline();
            m_commandList->SetPipelineState(m_opaquePSO.Get());
            m_commandList->SetGraphicsRootDescriptorTable(1, GpuHandle(m_srvHeap.Get(), kIconSrvIndex, m_srvDescriptorSize));
            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);

            // 不透明な物体を描く。物体ごとに別の objectIndex（ConstantBuffer の場所）を使う。
            DrawObject(0, m_geometry.floor, XMMatrixIdentity(), matrices.view, matrices.projection);
            DrawObject(1, m_geometry.cube, XMMatrixTranslation(-1.65f, 0.0f, 0.0f), matrices.view, matrices.projection);
            DrawObject(2, m_geometry.pyramid, XMMatrixTranslation(1.65f, 0.0f, 0.0f), matrices.view, matrices.projection);

            // 半透明のパネルは最後に、半透明用の PSO へ切り替えて描く。
            m_commandList->SetPipelineState(m_alphaBlendPSO.Get());
            DrawObject(3, m_geometry.transparentPanel, XMMatrixIdentity(), matrices.view, matrices.projection);

            EndFrame();
        }

    private:
        void EnableDebugLayer()
        {
#if defined(_DEBUG)
            // Debug ビルドでは Debug Layer を有効にし、API の使い方の誤りを「出力」ウィンドウへ表示させる。
            // Device を作る前に有効にする必要がある。
            ComPtr<ID3D12Debug> debug;
            if (SUCCEEDED(D3D12GetDebugInterface(IID_PPV_ARGS(debug.GetAddressOf()))))
            {
                debug->EnableDebugLayer();
                m_debugLayerEnabled = true;
            }
#endif
        }

        void CreateDeviceAndSwapChain(HWND hwnd)
        {
            // DXGI Factory（GPU と画面を扱う入口）と、Device（Resource などを作る係）を作る。
            const UINT factoryFlags = m_debugLayerEnabled ? DXGI_CREATE_FACTORY_DEBUG : 0;
            ThrowIfFailed(CreateDXGIFactory2(factoryFlags, IID_PPV_ARGS(m_factory.GetAddressOf())), "CreateDXGIFactory2 failed.");
            ThrowIfFailed(
                D3D12CreateDevice(nullptr, D3D_FEATURE_LEVEL_11_0, IID_PPV_ARGS(m_device.GetAddressOf())),
                "D3D12CreateDevice failed.");

            // CommandQueue（記録した命令を GPU へ送る窓口）を作る。
            D3D12_COMMAND_QUEUE_DESC queueDesc{};
            queueDesc.Type = D3D12_COMMAND_LIST_TYPE_DIRECT;
            ThrowIfFailed(
                m_device->CreateCommandQueue(&queueDesc, IID_PPV_ARGS(m_commandQueue.GetAddressOf())),
                "CreateCommandQueue failed.");

            // SwapChain（BackBuffer 2枚を交互に表示する仕組み）を作る。DX12 では Queue を渡して作る。
            DXGI_SWAP_CHAIN_DESC1 swapChainDesc{};
            swapChainDesc.Width = kClientWidth;
            swapChainDesc.Height = kClientHeight;
            swapChainDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
            swapChainDesc.SampleDesc.Count = 1;
            swapChainDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
            swapChainDesc.BufferCount = kFrameCount;
            swapChainDesc.SwapEffect = DXGI_SWAP_EFFECT_FLIP_DISCARD;

            ComPtr<IDXGISwapChain1> swapChain1;
            ThrowIfFailed(
                m_factory->CreateSwapChainForHwnd(m_commandQueue.Get(), hwnd, &swapChainDesc, nullptr, nullptr, swapChain1.GetAddressOf()),
                "CreateSwapChainForHwnd failed.");

            // 「今どちらの BackBuffer に描くか」を調べられる IDXGISwapChain3 として使う。
            ThrowIfFailed(swapChain1.As(&m_swapChain), "IDXGISwapChain3 is not supported.");
            m_frameIndex = m_swapChain->GetCurrentBackBufferIndex();
        }

        void CreateDescriptorHeaps()
        {
            // RTV（描画先）用の DescriptorHeap: BackBuffer 2枚。
            D3D12_DESCRIPTOR_HEAP_DESC rtvHeapDesc{};
            rtvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_RTV;
            rtvHeapDesc.NumDescriptors = kFrameCount;
            ThrowIfFailed(m_device->CreateDescriptorHeap(&rtvHeapDesc, IID_PPV_ARGS(m_rtvHeap.GetAddressOf())), "CreateDescriptorHeap(RTV) failed.");

            // DSV（Depth の書き込み先）用の DescriptorHeap: 1個。
            D3D12_DESCRIPTOR_HEAP_DESC dsvHeapDesc{};
            dsvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_DSV;
            dsvHeapDesc.NumDescriptors = 1;
            ThrowIfFailed(m_device->CreateDescriptorHeap(&dsvHeapDesc, IID_PPV_ARGS(m_dsvHeap.GetAddressOf())), "CreateDescriptorHeap(DSV) failed.");

            // SRV（Shader から読む Texture）用の DescriptorHeap: Icon.png の1個。
            // Shader から見えるように SHADER_VISIBLE を付ける。
            D3D12_DESCRIPTOR_HEAP_DESC srvHeapDesc{};
            srvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_CBV_SRV_UAV;
            srvHeapDesc.NumDescriptors = kSrvCount;
            srvHeapDesc.Flags = D3D12_DESCRIPTOR_HEAP_FLAG_SHADER_VISIBLE;
            ThrowIfFailed(m_device->CreateDescriptorHeap(&srvHeapDesc, IID_PPV_ARGS(m_srvHeap.GetAddressOf())), "CreateDescriptorHeap(SRV) failed.");

            // Descriptor 1個の大きさ（byte）は GPU によって違うので、Device に問い合わせる。
            m_rtvDescriptorSize = m_device->GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE_RTV);
            m_srvDescriptorSize = m_device->GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE_CBV_SRV_UAV);
        }

        void CreateBackBufferViews()
        {
            // BackBuffer を1枚ずつ取り出し、RTV Heap の [0] [1] に RTV を書き込む。
            for (UINT i = 0; i < kFrameCount; ++i)
            {
                ThrowIfFailed(
                    m_swapChain->GetBuffer(i, IID_PPV_ARGS(m_backBuffers[i].GetAddressOf())),
                    "IDXGISwapChain::GetBuffer failed.");
                m_device->CreateRenderTargetView(m_backBuffers[i].Get(), nullptr, CpuHandle(m_rtvHeap.Get(), i, m_rtvDescriptorSize));
            }
        }

        void CreateCommandObjects()
        {
            // CommandAllocator（命令を記録するメモリ）と CommandList（命令を書き込む係）を作る。
            ThrowIfFailed(
                m_device->CreateCommandAllocator(D3D12_COMMAND_LIST_TYPE_DIRECT, IID_PPV_ARGS(m_commandAllocator.GetAddressOf())),
                "CreateCommandAllocator failed.");
            ThrowIfFailed(
                m_device->CreateCommandList(
                    0,
                    D3D12_COMMAND_LIST_TYPE_DIRECT,
                    m_commandAllocator.Get(),
                    nullptr,
                    IID_PPV_ARGS(m_commandList.GetAddressOf())),
                "CreateCommandList failed.");

            // 作った直後の CommandList は「記録中」。記録を始めるときに Reset するので、いったん閉じておく。
            ThrowIfFailed(m_commandList->Close(), "ID3D12GraphicsCommandList::Close failed.");
        }

        void CreateFence()
        {
            // Fence（GPU がどこまで終わったかを示す番号）と、待つための Event を作る。
            ThrowIfFailed(
                m_device->CreateFence(0, D3D12_FENCE_FLAG_NONE, IID_PPV_ARGS(m_fence.GetAddressOf())),
                "CreateFence failed.");
            m_fenceEvent = CreateEventW(nullptr, FALSE, FALSE, nullptr);
            if (!m_fenceEvent)
            {
                throw std::runtime_error("CreateEventW failed.");
            }
        }

        void ExecuteCommandList()
        {
            // 記録を閉じ、CommandQueue へ渡して GPU に実行させる。
            ThrowIfFailed(m_commandList->Close(), "ID3D12GraphicsCommandList::Close failed.");
            ID3D12CommandList* lists[] = { m_commandList.Get() };
            m_commandQueue->ExecuteCommandLists(1, lists);
        }

        void WaitForGpu()
        {
            // Queue に「ここまで終わったら Fence を signalValue にして」と頼む。
            const UINT64 signalValue = ++m_fenceValue;
            ThrowIfFailed(m_commandQueue->Signal(m_fence.Get(), signalValue), "ID3D12CommandQueue::Signal failed.");

            // GPU がまだそこまで進んでいなければ、進むまで CPU を止めて待つ。
            if (m_fence->GetCompletedValue() < signalValue)
            {
                ThrowIfFailed(m_fence->SetEventOnCompletion(signalValue, m_fenceEvent), "ID3D12Fence::SetEventOnCompletion failed.");
                WaitForSingleObject(m_fenceEvent, INFINITE);
            }
        }

        void BeginFrame()
        {
            // 命令の記録を始める。前のフレームの GPU 処理は終わっている（WaitForGpu 済み）ので、メモリを再利用できる。
            ThrowIfFailed(m_commandAllocator->Reset(), "ID3D12CommandAllocator::Reset failed.");
            ThrowIfFailed(m_commandList->Reset(m_commandAllocator.Get(), nullptr), "ID3D12GraphicsCommandList::Reset failed.");

            // 今の BackBuffer を「表示用（PRESENT）」から「描画先（RENDER_TARGET）」へ切り替える。
            const D3D12_RESOURCE_BARRIER toRenderTarget = TransitionBarrier(
                m_backBuffers[m_frameIndex].Get(),
                D3D12_RESOURCE_STATE_PRESENT,
                D3D12_RESOURCE_STATE_RENDER_TARGET);
            m_commandList->ResourceBarrier(1, &toRenderTarget);
        }

        void EndFrame()
        {
            // BackBuffer を「描画先」から「表示用」へ戻す。
            const D3D12_RESOURCE_BARRIER toPresent = TransitionBarrier(
                m_backBuffers[m_frameIndex].Get(),
                D3D12_RESOURCE_STATE_RENDER_TARGET,
                D3D12_RESOURCE_STATE_PRESENT);
            m_commandList->ResourceBarrier(1, &toPresent);

            // 記録した命令を GPU へ送り、BackBuffer の表示を予約する。
            ExecuteCommandList();
            ThrowIfFailed(m_swapChain->Present(1, 0), "IDXGISwapChain::Present failed.");

            // GPU が終わるまで待ち、次に描く BackBuffer の番号を取得する。
            WaitForGpu();
            m_frameIndex = m_swapChain->GetCurrentBackBufferIndex();
        }

        void CreateRootSignature()
        {
            // Root Parameter 0: ConstantBuffer（b0）。GPU 上の番地を直接渡す。
            D3D12_ROOT_PARAMETER rootParameters[2]{};
            rootParameters[0].ParameterType = D3D12_ROOT_PARAMETER_TYPE_CBV;
            rootParameters[0].Descriptor.ShaderRegister = 0;
            rootParameters[0].ShaderVisibility = D3D12_SHADER_VISIBILITY_VERTEX;

            // Root Parameter 1: Texture（t0）。SRV Heap の中の場所（Descriptor Table）を渡す。
            D3D12_DESCRIPTOR_RANGE srvRange{};
            srvRange.RangeType = D3D12_DESCRIPTOR_RANGE_TYPE_SRV;
            srvRange.NumDescriptors = 1;
            srvRange.BaseShaderRegister = 0;
            srvRange.OffsetInDescriptorsFromTableStart = D3D12_DESCRIPTOR_RANGE_OFFSET_APPEND;
            rootParameters[1].ParameterType = D3D12_ROOT_PARAMETER_TYPE_DESCRIPTOR_TABLE;
            rootParameters[1].DescriptorTable.NumDescriptorRanges = 1;
            rootParameters[1].DescriptorTable.pDescriptorRanges = &srvRange;
            rootParameters[1].ShaderVisibility = D3D12_SHADER_VISIBILITY_PIXEL;

            // Sampler（s0）は変更しないので、RootSignature に直接埋め込む（Static Sampler）。
            D3D12_STATIC_SAMPLER_DESC sampler{};
            sampler.Filter = D3D12_FILTER_MIN_MAG_MIP_LINEAR;
            sampler.AddressU = D3D12_TEXTURE_ADDRESS_MODE_WRAP;
            sampler.AddressV = D3D12_TEXTURE_ADDRESS_MODE_WRAP;
            sampler.AddressW = D3D12_TEXTURE_ADDRESS_MODE_WRAP;
            sampler.MaxAnisotropy = 1;
            sampler.ComparisonFunc = D3D12_COMPARISON_FUNC_NEVER;
            sampler.MaxLOD = D3D12_FLOAT32_MAX;
            sampler.ShaderRegister = 0;
            sampler.ShaderVisibility = D3D12_SHADER_VISIBILITY_PIXEL;

            D3D12_ROOT_SIGNATURE_DESC rootDesc{};
            rootDesc.NumParameters = static_cast<UINT>(std::size(rootParameters));
            rootDesc.pParameters = rootParameters;
            rootDesc.NumStaticSamplers = 1;
            rootDesc.pStaticSamplers = &sampler;
            rootDesc.Flags = D3D12_ROOT_SIGNATURE_FLAG_ALLOW_INPUT_ASSEMBLER_INPUT_LAYOUT;

            // 設定を GPU 用のデータへ変換（Serialize）してから、RootSignature を作る。
            ComPtr<ID3DBlob> serialized;
            ComPtr<ID3DBlob> errors;
            const HRESULT hr = D3D12SerializeRootSignature(&rootDesc, D3D_ROOT_SIGNATURE_VERSION_1, serialized.GetAddressOf(), errors.GetAddressOf());
            if (FAILED(hr))
            {
                std::string message = "D3D12SerializeRootSignature failed.\n";
                if (errors)
                {
                    message.append(static_cast<const char*>(errors->GetBufferPointer()), errors->GetBufferSize());
                }
                throw std::runtime_error(message);
            }
            ThrowIfFailed(
                m_device->CreateRootSignature(0, serialized->GetBufferPointer(), serialized->GetBufferSize(), IID_PPV_ARGS(m_rootSignature.GetAddressOf())),
                "CreateRootSignature failed.");
        }

        void CreatePipelineStates()
        {
            // HLSL の VSMain / PSMain を、それぞれ Shader Model 5.1 でコンパイルする。
            const std::filesystem::path shaderPath = GetShaderPath();
            const ComPtr<ID3DBlob> vertexShaderCode = CompileShader(shaderPath, "VSMain", "vs_5_1");
            const ComPtr<ID3DBlob> pixelShaderCode = CompileShader(shaderPath, "PSMain", "ps_5_1");

            // InputLayout: Vertex の各メンバーを、HLSL の POSITION / COLOR / TEXCOORD と対応させる。
            const D3D12_INPUT_ELEMENT_DESC inputElements[] =
            {
                { "POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT,    0, offsetof(Vertex, position), D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },
                { "COLOR",    0, DXGI_FORMAT_R32G32B32A32_FLOAT, 0, offsetof(Vertex, color),    D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },
                { "TEXCOORD", 0, DXGI_FORMAT_R32G32_FLOAT,       0, offsetof(Vertex, uv),       D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },
            };

            // Rasterizer: 三角形を塗りつぶし、裏向きの面も描く。
            D3D12_RASTERIZER_DESC rasterizer{};
            rasterizer.FillMode = D3D12_FILL_MODE_SOLID;
            rasterizer.CullMode = D3D12_CULL_MODE_NONE;
            rasterizer.DepthClipEnable = TRUE;

            // Blend: 上書き（不透明）。
            D3D12_BLEND_DESC opaqueBlend{};
            opaqueBlend.RenderTarget[0].BlendEnable = FALSE;
            opaqueBlend.RenderTarget[0].RenderTargetWriteMask = D3D12_COLOR_WRITE_ENABLE_ALL;

            // Depth: 手前にあるときだけ描き、Depth を書き込む。
            D3D12_DEPTH_STENCIL_DESC depthWrite{};
            depthWrite.DepthEnable = TRUE;
            depthWrite.DepthWriteMask = D3D12_DEPTH_WRITE_MASK_ALL;
            depthWrite.DepthFunc = D3D12_COMPARISON_FUNC_LESS;

            // ここまでの設定と Shader・描画先の形式をまとめて、1つの PSO（Pipeline State Object）にする。
            D3D12_GRAPHICS_PIPELINE_STATE_DESC opaqueDesc{};
            opaqueDesc.pRootSignature = m_rootSignature.Get();
            opaqueDesc.VS = { vertexShaderCode->GetBufferPointer(), vertexShaderCode->GetBufferSize() };
            opaqueDesc.PS = { pixelShaderCode->GetBufferPointer(), pixelShaderCode->GetBufferSize() };
            opaqueDesc.InputLayout = { inputElements, static_cast<UINT>(std::size(inputElements)) };
            opaqueDesc.RasterizerState = rasterizer;
            opaqueDesc.BlendState = opaqueBlend;
            opaqueDesc.DepthStencilState = depthWrite;
            opaqueDesc.SampleMask = UINT_MAX;
            opaqueDesc.PrimitiveTopologyType = D3D12_PRIMITIVE_TOPOLOGY_TYPE_TRIANGLE;
            opaqueDesc.NumRenderTargets = 1;
            opaqueDesc.RTVFormats[0] = DXGI_FORMAT_R8G8B8A8_UNORM;
            opaqueDesc.DSVFormat = DXGI_FORMAT_D24_UNORM_S8_UINT;
            opaqueDesc.SampleDesc.Count = 1;
            ThrowIfFailed(m_device->CreateGraphicsPipelineState(&opaqueDesc, IID_PPV_ARGS(m_opaquePSO.GetAddressOf())), "CreateGraphicsPipelineState(opaque) failed.");

            // 半透明用 PSO: 不透明用をコピーし、Blend を「alpha で混ぜる」、Depth を「書き込まない」に変える。
            // DX12 では Blend だけを後から差し替えられないため、PSO ごと別に作る。
            D3D12_GRAPHICS_PIPELINE_STATE_DESC alphaDesc = opaqueDesc;
            D3D12_RENDER_TARGET_BLEND_DESC& alphaTarget = alphaDesc.BlendState.RenderTarget[0];
            alphaTarget.BlendEnable = TRUE;
            alphaTarget.SrcBlend = D3D12_BLEND_SRC_ALPHA;
            alphaTarget.DestBlend = D3D12_BLEND_INV_SRC_ALPHA;
            alphaTarget.BlendOp = D3D12_BLEND_OP_ADD;
            alphaTarget.SrcBlendAlpha = D3D12_BLEND_ONE;
            alphaTarget.DestBlendAlpha = D3D12_BLEND_ZERO;
            alphaTarget.BlendOpAlpha = D3D12_BLEND_OP_ADD;
            alphaDesc.DepthStencilState.DepthWriteMask = D3D12_DEPTH_WRITE_MASK_ZERO;
            ThrowIfFailed(m_device->CreateGraphicsPipelineState(&alphaDesc, IID_PPV_ARGS(m_alphaBlendPSO.GetAddressOf())), "CreateGraphicsPipelineState(alpha) failed.");
        }

        void CreateDefaultBuffer(
            const void* data,
            UINT64 byteSize,
            D3D12_RESOURCE_STATES finalState,
            ComPtr<ID3D12Resource>& defaultBuffer,
            ComPtr<ID3D12Resource>& uploadBuffer)
        {
            // GPU 用（DEFAULT）と、CPU から書き込む転送用（UPLOAD）の Buffer を同じ大きさで作る。
            // Buffer は作成直後、必ず COMMON（特定の用途なし）という State になる。
            const D3D12_HEAP_PROPERTIES defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);
            const D3D12_HEAP_PROPERTIES uploadHeap = HeapProperties(D3D12_HEAP_TYPE_UPLOAD);
            const D3D12_RESOURCE_DESC bufferDesc = BufferDescription(byteSize);
            ThrowIfFailed(
                m_device->CreateCommittedResource(&defaultHeap, D3D12_HEAP_FLAG_NONE, &bufferDesc, D3D12_RESOURCE_STATE_COMMON, nullptr, IID_PPV_ARGS(defaultBuffer.GetAddressOf())),
                "CreateCommittedResource(default buffer) failed.");
            ThrowIfFailed(
                m_device->CreateCommittedResource(&uploadHeap, D3D12_HEAP_FLAG_NONE, &bufferDesc, D3D12_RESOURCE_STATE_GENERIC_READ, nullptr, IID_PPV_ARGS(uploadBuffer.GetAddressOf())),
                "CreateCommittedResource(upload buffer) failed.");

            // 転送用 Buffer を Map して CPU からデータを書き込む。
            void* mapped = nullptr;
            const D3D12_RANGE noRead{ 0, 0 };
            ThrowIfFailed(uploadBuffer->Map(0, &noRead, &mapped), "ID3D12Resource::Map failed.");
            std::memcpy(mapped, data, static_cast<std::size_t>(byteSize));
            uploadBuffer->Unmap(0, nullptr);

            // GPU 用 Buffer を「コピー先」にしてから、転送用 → GPU 用へのコピー命令を記録する。
            const D3D12_RESOURCE_BARRIER toCopyDest = TransitionBarrier(defaultBuffer.Get(), D3D12_RESOURCE_STATE_COMMON, D3D12_RESOURCE_STATE_COPY_DEST);
            m_commandList->ResourceBarrier(1, &toCopyDest);
            m_commandList->CopyBufferRegion(defaultBuffer.Get(), 0, uploadBuffer.Get(), 0, byteSize);

            // コピーが終わったら、本来の使い方（VertexBuffer など）へ切り替える。
            const D3D12_RESOURCE_BARRIER toFinalState = TransitionBarrier(defaultBuffer.Get(), D3D12_RESOURCE_STATE_COPY_DEST, finalState);
            m_commandList->ResourceBarrier(1, &toFinalState);
        }

        void CreateGeometryBuffers(ComPtr<ID3D12Resource>& vertexUpload, ComPtr<ID3D12Resource>& indexUpload)
        {
            // CPU 側で、すべての物体の頂点と Index を作る。
            m_geometry = BuildSceneGeometry();

            // VertexBuffer を GPU 用メモリに作り、View（どこから何 byte ずつ読むか）を用意する。
            const UINT vertexBytes = static_cast<UINT>(m_geometry.vertices.size() * sizeof(Vertex));
            CreateDefaultBuffer(m_geometry.vertices.data(), vertexBytes, D3D12_RESOURCE_STATE_VERTEX_AND_CONSTANT_BUFFER, m_vertexBuffer, vertexUpload);
            m_vertexBufferView.BufferLocation = m_vertexBuffer->GetGPUVirtualAddress();
            m_vertexBufferView.SizeInBytes = vertexBytes;
            m_vertexBufferView.StrideInBytes = sizeof(Vertex);

            // IndexBuffer も同じ手順。Index は 16bit（R16_UINT）。
            const UINT indexBytes = static_cast<UINT>(m_geometry.indices.size() * sizeof(std::uint16_t));
            CreateDefaultBuffer(m_geometry.indices.data(), indexBytes, D3D12_RESOURCE_STATE_INDEX_BUFFER, m_indexBuffer, indexUpload);
            m_indexBufferView.BufferLocation = m_indexBuffer->GetGPUVirtualAddress();
            m_indexBufferView.SizeInBytes = indexBytes;
            m_indexBufferView.Format = DXGI_FORMAT_R16_UINT;
        }

        void CreateIconTexture(ComPtr<ID3D12Resource>& textureUpload)
        {
            // Icon.png を BGRA の画素配列として読み込み、同じ大きさの Texture を GPU 用メモリに作る。
            const ImageData image = LoadPngWithWIC(GetIconPath());
            D3D12_RESOURCE_DESC textureDesc{};
            textureDesc.Dimension = D3D12_RESOURCE_DIMENSION_TEXTURE2D;
            textureDesc.Width = image.width;
            textureDesc.Height = image.height;
            textureDesc.DepthOrArraySize = 1;
            textureDesc.MipLevels = 1;
            textureDesc.Format = DXGI_FORMAT_B8G8R8A8_UNORM;
            textureDesc.SampleDesc.Count = 1;
            textureDesc.Layout = D3D12_TEXTURE_LAYOUT_UNKNOWN;
            const D3D12_HEAP_PROPERTIES defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);
            ThrowIfFailed(
                m_device->CreateCommittedResource(&defaultHeap, D3D12_HEAP_FLAG_NONE, &textureDesc, D3D12_RESOURCE_STATE_COPY_DEST, nullptr, IID_PPV_ARGS(m_iconTexture.GetAddressOf())),
                "CreateCommittedResource(Icon texture) failed.");

            // 転送用 Buffer の並べ方を Device に聞く。GPU へのコピーでは1行を 256byte の倍数に揃える必要がある。
            D3D12_PLACED_SUBRESOURCE_FOOTPRINT footprint{};
            UINT rowCount = 0;
            UINT64 rowBytes = 0;
            UINT64 uploadBytes = 0;
            m_device->GetCopyableFootprints(&textureDesc, 0, 1, 0, &footprint, &rowCount, &rowBytes, &uploadBytes);

            // 転送用 Buffer を作り、画素を1行ずつ（行の間隔 = RowPitch）書き込む。
            const D3D12_HEAP_PROPERTIES uploadHeap = HeapProperties(D3D12_HEAP_TYPE_UPLOAD);
            const D3D12_RESOURCE_DESC uploadDesc = BufferDescription(uploadBytes);
            ThrowIfFailed(
                m_device->CreateCommittedResource(&uploadHeap, D3D12_HEAP_FLAG_NONE, &uploadDesc, D3D12_RESOURCE_STATE_GENERIC_READ, nullptr, IID_PPV_ARGS(textureUpload.GetAddressOf())),
                "CreateCommittedResource(Icon upload) failed.");

            std::uint8_t* mapped = nullptr;
            const D3D12_RANGE noRead{ 0, 0 };
            ThrowIfFailed(textureUpload->Map(0, &noRead, reinterpret_cast<void**>(&mapped)), "ID3D12Resource::Map failed.");
            const UINT sourceRowPitch = image.width * 4;
            for (UINT y = 0; y < rowCount; ++y)
            {
                std::memcpy(
                    mapped + footprint.Offset + static_cast<std::size_t>(y) * footprint.Footprint.RowPitch,
                    image.pixels.data() + static_cast<std::size_t>(y) * sourceRowPitch,
                    sourceRowPitch);
            }
            textureUpload->Unmap(0, nullptr);

            // 「転送用 Buffer → Texture」のコピー命令と、Shader から読む State への Barrier を記録する。
            D3D12_TEXTURE_COPY_LOCATION destination{};
            destination.pResource = m_iconTexture.Get();
            destination.Type = D3D12_TEXTURE_COPY_TYPE_SUBRESOURCE_INDEX;
            destination.SubresourceIndex = 0;
            D3D12_TEXTURE_COPY_LOCATION source{};
            source.pResource = textureUpload.Get();
            source.Type = D3D12_TEXTURE_COPY_TYPE_PLACED_FOOTPRINT;
            source.PlacedFootprint = footprint;
            m_commandList->CopyTextureRegion(&destination, 0, 0, 0, &source, nullptr);

            const D3D12_RESOURCE_BARRIER barrier = TransitionBarrier(m_iconTexture.Get(), D3D12_RESOURCE_STATE_COPY_DEST, D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE);
            m_commandList->ResourceBarrier(1, &barrier);

            // SRV Heap の [kIconSrvIndex] に、Shader から読むための SRV を書き込む。
            D3D12_SHADER_RESOURCE_VIEW_DESC srvDesc{};
            srvDesc.Shader4ComponentMapping = D3D12_DEFAULT_SHADER_4_COMPONENT_MAPPING;
            srvDesc.Format = textureDesc.Format;
            srvDesc.ViewDimension = D3D12_SRV_DIMENSION_TEXTURE2D;
            srvDesc.Texture2D.MipLevels = 1;
            m_device->CreateShaderResourceView(m_iconTexture.Get(), &srvDesc, CpuHandle(m_srvHeap.Get(), kIconSrvIndex, m_srvDescriptorSize));
        }

        void UploadSceneResources()
        {
            // 転送命令の記録を始める。
            ThrowIfFailed(m_commandAllocator->Reset(), "ID3D12CommandAllocator::Reset failed.");
            ThrowIfFailed(m_commandList->Reset(m_commandAllocator.Get(), nullptr), "ID3D12GraphicsCommandList::Reset failed.");

            // 転送用 Buffer は、GPU のコピーが終わるまで解放してはいけないので、ここで持っておく。
            ComPtr<ID3D12Resource> vertexUpload;
            ComPtr<ID3D12Resource> indexUpload;
            ComPtr<ID3D12Resource> textureUpload;
            CreateGeometryBuffers(vertexUpload, indexUpload);
            CreateIconTexture(textureUpload);

            // 記録した転送命令を GPU で実行し、終わるまで待つ。関数を抜けると転送用 Buffer は解放される。
            ExecuteCommandList();
            WaitForGpu();
        }

        void CreateConstantBuffer()
        {
            // 物体ごとの行列を置く ConstantBuffer を、CPU から毎フレーム書ける UPLOAD メモリに作る。
            // 物体1個ぶんを 256byte ずつ離して、kObjectCount 個ぶん確保する。
            const D3D12_HEAP_PROPERTIES uploadHeap = HeapProperties(D3D12_HEAP_TYPE_UPLOAD);
            const D3D12_RESOURCE_DESC constantDesc = BufferDescription(static_cast<UINT64>(kConstantBufferStride) * kObjectCount);
            ThrowIfFailed(
                m_device->CreateCommittedResource(&uploadHeap, D3D12_HEAP_FLAG_NONE, &constantDesc, D3D12_RESOURCE_STATE_GENERIC_READ, nullptr, IID_PPV_ARGS(m_constantBuffer.GetAddressOf())),
                "CreateCommittedResource(ConstantBuffer) failed.");

            // Map したままにして、描画のたびに m_mappedConstants へ書き込む。
            const D3D12_RANGE noRead{ 0, 0 };
            ThrowIfFailed(m_constantBuffer->Map(0, &noRead, reinterpret_cast<void**>(&m_mappedConstants)), "ID3D12Resource::Map failed.");
        }

        void CreateDepthBuffer()
        {
            // 奥行き（Depth）を記録する Texture を GPU 用メモリに作る。最初から Depth の書き込み用 State にする。
            D3D12_RESOURCE_DESC depthDesc{};
            depthDesc.Dimension = D3D12_RESOURCE_DIMENSION_TEXTURE2D;
            depthDesc.Width = kClientWidth;
            depthDesc.Height = kClientHeight;
            depthDesc.DepthOrArraySize = 1;
            depthDesc.MipLevels = 1;
            depthDesc.Format = DXGI_FORMAT_D24_UNORM_S8_UINT;
            depthDesc.SampleDesc.Count = 1;
            depthDesc.Layout = D3D12_TEXTURE_LAYOUT_UNKNOWN;
            depthDesc.Flags = D3D12_RESOURCE_FLAG_ALLOW_DEPTH_STENCIL;

            // Clear に使う値を作成時に伝えておくと、GPU が Clear を速く行える。
            D3D12_CLEAR_VALUE clearValue{};
            clearValue.Format = depthDesc.Format;
            clearValue.DepthStencil.Depth = 1.0f;
            const D3D12_HEAP_PROPERTIES defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);
            ThrowIfFailed(
                m_device->CreateCommittedResource(&defaultHeap, D3D12_HEAP_FLAG_NONE, &depthDesc, D3D12_RESOURCE_STATE_DEPTH_WRITE, &clearValue, IID_PPV_ARGS(m_depthBuffer.GetAddressOf())),
                "CreateCommittedResource(Depth) failed.");

            // DSV Heap の [0] に DSV を書き込む。
            m_device->CreateDepthStencilView(m_depthBuffer.Get(), nullptr, m_dsvHeap->GetCPUDescriptorHandleForHeapStart());
        }

        void BindCommonPipeline()
        {
            // RootSignature と、Shader が参照する DescriptorHeap を指定する。
            m_commandList->SetGraphicsRootSignature(m_rootSignature.Get());
            ID3D12DescriptorHeap* heaps[] = { m_srvHeap.Get() };
            m_commandList->SetDescriptorHeaps(1, heaps);

            // 描く範囲。DX12 では Viewport に加えて Scissor（切り抜く範囲）も必ず指定する。
            const D3D12_VIEWPORT viewport{ 0.0f, 0.0f, static_cast<float>(kClientWidth), static_cast<float>(kClientHeight), 0.0f, 1.0f };
            const D3D12_RECT scissor{ 0, 0, static_cast<LONG>(kClientWidth), static_cast<LONG>(kClientHeight) };
            m_commandList->RSSetViewports(1, &viewport);
            m_commandList->RSSetScissorRects(1, &scissor);

            // 入力: 三角形の並び・VertexBuffer・IndexBuffer。
            m_commandList->IASetPrimitiveTopology(D3D_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
            m_commandList->IASetVertexBuffers(0, 1, &m_vertexBufferView);
            m_commandList->IASetIndexBuffer(&m_indexBufferView);
        }

        void DrawObject(UINT objectIndex, const DrawRange& range, FXMMATRIX world, CXMMATRIX view, CXMMATRIX projection)
        {
            // この物体専用の場所（objectIndex 番目の 256byte）へ、転置した WVP 行列を書き込む。
            // 物体ごとに場所を分けるのは、GPU が実際に描くのは命令を送った後だから。
            // 同じ場所を上書きすると、全部の物体が最後に書いた行列で描かれてしまう。
            SceneConstants constants{};
            XMStoreFloat4x4(&constants.worldViewProjection, XMMatrixTranspose(world * view * projection));
            std::memcpy(m_mappedConstants + static_cast<std::size_t>(objectIndex) * kConstantBufferStride, &constants, sizeof(constants));

            // Root Parameter 0（b0）にその場所の GPU 番地を指定し、Index を使って描く命令を記録する。
            const D3D12_GPU_VIRTUAL_ADDRESS address = m_constantBuffer->GetGPUVirtualAddress() + static_cast<UINT64>(objectIndex) * kConstantBufferStride;
            m_commandList->SetGraphicsRootConstantBufferView(0, address);
            m_commandList->DrawIndexedInstanced(range.indexCount, 1, range.startIndex, 0, 0);
        }

        bool m_debugLayerEnabled = false;
        ComPtr<IDXGIFactory6> m_factory;
        ComPtr<ID3D12Device> m_device;
        ComPtr<ID3D12CommandQueue> m_commandQueue;
        ComPtr<IDXGISwapChain3> m_swapChain;
        std::array<ComPtr<ID3D12Resource>, kFrameCount> m_backBuffers;
        UINT m_frameIndex = 0;

        ComPtr<ID3D12DescriptorHeap> m_rtvHeap;
        ComPtr<ID3D12DescriptorHeap> m_dsvHeap;
        ComPtr<ID3D12DescriptorHeap> m_srvHeap;
        UINT m_rtvDescriptorSize = 0;
        UINT m_srvDescriptorSize = 0;

        ComPtr<ID3D12CommandAllocator> m_commandAllocator;
        ComPtr<ID3D12GraphicsCommandList> m_commandList;
        ComPtr<ID3D12Fence> m_fence;
        UINT64 m_fenceValue = 0;
        HANDLE m_fenceEvent = nullptr;

        ComPtr<ID3D12RootSignature> m_rootSignature;
        ComPtr<ID3D12PipelineState> m_opaquePSO;
        ComPtr<ID3D12PipelineState> m_alphaBlendPSO;

        SceneGeometry m_geometry;
        ComPtr<ID3D12Resource> m_vertexBuffer;
        ComPtr<ID3D12Resource> m_indexBuffer;
        D3D12_VERTEX_BUFFER_VIEW m_vertexBufferView{};
        D3D12_INDEX_BUFFER_VIEW m_indexBufferView{};
        ComPtr<ID3D12Resource> m_iconTexture;
        ComPtr<ID3D12Resource> m_constantBuffer;
        std::uint8_t* m_mappedConstants = nullptr;
        ComPtr<ID3D12Resource> m_depthBuffer;
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

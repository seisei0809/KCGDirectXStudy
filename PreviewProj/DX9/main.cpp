#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>
#include <d3d9.h>
#include <DirectXMath.h>
#include <wincodec.h>
#include <wrl/client.h>

#include <filesystem>
#include <vector>

using Microsoft::WRL::ComPtr;
using namespace DirectX;

#pragma comment(lib, "windowscodecs.lib")
#pragma comment(lib, "ole32.lib")

namespace
{
    constexpr UINT kClientWidth = 1280;
    constexpr UINT kClientHeight = 720;
    constexpr wchar_t kWindowClassName[] = L"KCGDirectXStudyDX9";
    constexpr wchar_t kWindowTitle[] = L"KCG DirectX Study - DirectX 9 Preview";

    enum class ProjectionMode
    {
        Orthographic2D,
        Perspective3D,
    };

    enum class PreviewStage
    {
        ClearOnly,
        OneObject,
        FullScene,
    };

    struct ViewProjectionMatrices
    {
        XMMATRIX view;
        XMMATRIX projection;
    };

    ViewProjectionMatrices BuildViewProjection(ProjectionMode mode)
    {
        if (mode == ProjectionMode::Orthographic2D)
        {
            const float aspect = static_cast<float>(kClientWidth) / static_cast<float>(kClientHeight);
            return {
                XMMatrixLookAtLH(
                    XMVectorSet(0.0f, 0.0f, -10.0f, 1.0f),
                    XMVectorSet(0.0f, 0.0f, 0.0f, 1.0f),
                    XMVectorSet(0.0f, 1.0f, 0.0f, 0.0f)),
                XMMatrixOrthographicLH(6.0f * aspect, 6.0f, 0.1f, 100.0f),
            };
        }

        return {
            XMMatrixLookAtLH(
                XMVectorSet(0.0f, 3.2f, 7.5f, 1.0f),
                XMVectorSet(0.0f, -0.1f, 0.0f, 1.0f),
                XMVectorSet(0.0f, 1.0f, 0.0f, 0.0f)),
            XMMatrixPerspectiveFovLH(
                XMConvertToRadians(60.0f),
                static_cast<float>(kClientWidth) / static_cast<float>(kClientHeight),
                0.1f,
                100.0f),
        };
    }

    void ThrowIfFailed(HRESULT hr, const char* message);

    struct ImageData
    {
        UINT width = 0;
        UINT height = 0;
        std::vector<std::uint8_t> pixels;
    };

    std::filesystem::path GetIconPath()
    {
        wchar_t executablePath[MAX_PATH]{};
        GetModuleFileNameW(nullptr, executablePath, MAX_PATH);

        std::filesystem::path directory = std::filesystem::path(executablePath).parent_path();
        for (int i = 0; i < 5; ++i)
        {
            const auto candidate = directory / L"Icon.png";
            if (std::filesystem::exists(candidate))
            {
                return candidate;
            }
            directory = directory.parent_path();
        }

        return std::filesystem::path(__FILE__).parent_path().parent_path() / L"Icon.png";
    }

    ImageData LoadPngWithWIC(const std::filesystem::path& path)
    {
        // WIC Factory
        ComPtr<IWICImagingFactory> factory;
        ThrowIfFailed(
            CoCreateInstance(
                CLSID_WICImagingFactory,
                nullptr,
                CLSCTX_INPROC_SERVER,
                IID_PPV_ARGS(factory.GetAddressOf())),
            "CoCreateInstance(CLSID_WICImagingFactory) failed.");

        // PNG Decoder
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

        // Pixel Format Conversion
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

        ImageData image;
        ThrowIfFailed(converter->GetSize(&image.width, &image.height), "IWICBitmapSource::GetSize failed.");
        const UINT rowPitch = image.width * 4;
        image.pixels.resize(static_cast<size_t>(rowPitch) * image.height);
        ThrowIfFailed(
            converter->CopyPixels(
                nullptr,
                rowPitch,
                static_cast<UINT>(image.pixels.size()),
                image.pixels.data()),
            "IWICBitmapSource::CopyPixels failed.");

        return image;
    }

    // --------------------
    // Vertex format
    // --------------------
    // FVF(Flexible Vertex Format) で頂点レイアウトを Device に指定します。
    // 頂点データは位置・頂点色・UV を保持します。
    struct Vertex
    {
        float x, y, z;
        DWORD color;
        float u, v;
    };

    constexpr DWORD kVertexFVF = D3DFVF_XYZ | D3DFVF_DIFFUSE | D3DFVF_TEX1;

    struct DrawRange
    {
        UINT startIndex = 0;
        UINT indexCount = 0;
    };

    struct SceneGeometry
    {
        std::vector<Vertex> vertices;
        std::vector<std::uint16_t> indices;
        DrawRange floor;
        DrawRange sprite2D;
        DrawRange cube;
        DrawRange pyramid;
        DrawRange transparentPanel;
        DrawRange presentQuad;
    };

    // --------------------
    // Utility
    // --------------------
    void ThrowIfFailed(HRESULT hr, const char* message)
    {
        if (FAILED(hr))
        {
            throw std::runtime_error(message);
        }
    }

    D3DMATRIX ToD3DMatrix(FXMMATRIX matrix)
    {
        XMFLOAT4X4 stored{};
        XMStoreFloat4x4(&stored, matrix);

        static_assert(sizeof(D3DMATRIX) == sizeof(XMFLOAT4X4));
        D3DMATRIX result{};
        std::memcpy(&result, &stored, sizeof(result));
        return result;
    }

    void AppendQuad(
        SceneGeometry& geometry,
        XMFLOAT3 p0,
        XMFLOAT3 p1,
        XMFLOAT3 p2,
        XMFLOAT3 p3,
        DWORD color,
        float uvScale = 1.0f)
    {
        const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());

        geometry.vertices.push_back({ p0.x, p0.y, p0.z, color, 0.0f, uvScale });
        geometry.vertices.push_back({ p1.x, p1.y, p1.z, color, 0.0f, 0.0f });
        geometry.vertices.push_back({ p2.x, p2.y, p2.z, color, uvScale, 0.0f });
        geometry.vertices.push_back({ p3.x, p3.y, p3.z, color, uvScale, uvScale });

        geometry.indices.insert(
            geometry.indices.end(),
            { base, static_cast<std::uint16_t>(base + 1), static_cast<std::uint16_t>(base + 2),
              base, static_cast<std::uint16_t>(base + 2), static_cast<std::uint16_t>(base + 3) });
    }

    void AppendTriangle(
        SceneGeometry& geometry,
        XMFLOAT3 p0,
        XMFLOAT3 p1,
        XMFLOAT3 p2,
        DWORD color)
    {
        const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());
        geometry.vertices.push_back({ p0.x, p0.y, p0.z, color, 0.0f, 1.0f });
        geometry.vertices.push_back({ p1.x, p1.y, p1.z, color, 0.5f, 0.0f });
        geometry.vertices.push_back({ p2.x, p2.y, p2.z, color, 1.0f, 1.0f });
        geometry.indices.insert(
            geometry.indices.end(),
            { base, static_cast<std::uint16_t>(base + 1), static_cast<std::uint16_t>(base + 2) });
    }

    SceneGeometry BuildSceneGeometry()
    {
        SceneGeometry geometry;
        const DWORD white = D3DCOLOR_ARGB(255, 255, 255, 255);

        geometry.sprite2D.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(
            geometry,
            { -2.0f, -2.0f, 0.0f },
            { -2.0f,  2.0f, 0.0f },
            {  2.0f,  2.0f, 0.0f },
            {  2.0f, -2.0f, 0.0f },
            white);
        geometry.sprite2D.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.sprite2D.startIndex;

        // Floor
        // Texture の繰り返しを確認できるよう、UV は 0～4 の範囲を使用します。
        geometry.floor.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(
            geometry,
            { -5.0f, -1.25f, -5.0f },
            { -5.0f, -1.25f,  5.0f },
            {  5.0f, -1.25f,  5.0f },
            {  5.0f, -1.25f, -5.0f },
            white,
            4.0f);
        geometry.floor.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.floor.startIndex;

        // Cube
        // 面ごとに頂点を分け、各面で独立した UV を持てるようにします。
        geometry.cube.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(geometry, { -1,-1,-1 }, { -1, 1,-1 }, { 1, 1,-1 }, { 1,-1,-1 }, white);
        AppendQuad(geometry, {  1,-1, 1 }, {  1, 1, 1 }, {-1, 1, 1 }, {-1,-1, 1 }, white);
        AppendQuad(geometry, { -1,-1, 1 }, { -1, 1, 1 }, {-1, 1,-1 }, {-1,-1,-1 }, white);
        AppendQuad(geometry, {  1,-1,-1 }, {  1, 1,-1 }, { 1, 1, 1 }, { 1,-1, 1 }, white);
        AppendQuad(geometry, { -1, 1,-1 }, { -1, 1, 1 }, { 1, 1, 1 }, { 1, 1,-1 }, white);
        AppendQuad(geometry, { -1,-1, 1 }, { -1,-1,-1 }, { 1,-1,-1 }, { 1,-1, 1 }, white);
        geometry.cube.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.cube.startIndex;

        // Pyramid
        geometry.pyramid.startIndex = static_cast<UINT>(geometry.indices.size());

        const XMFLOAT3 top{ 0.0f, 1.1f, 0.0f };
        const XMFLOAT3 p0{ -1.0f, -1.0f, -1.0f };
        const XMFLOAT3 p1{ -1.0f, -1.0f,  1.0f };
        const XMFLOAT3 p2{  1.0f, -1.0f,  1.0f };
        const XMFLOAT3 p3{  1.0f, -1.0f, -1.0f };

        AppendQuad(geometry, p1, p0, p3, p2, white);
        AppendTriangle(geometry, p0, top, p1, white);
        AppendTriangle(geometry, p1, top, p2, white);
        AppendTriangle(geometry, p2, top, p3, white);
        AppendTriangle(geometry, p3, top, p0, white);
        geometry.pyramid.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.pyramid.startIndex;

        // Transparent panel
        geometry.transparentPanel.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(
            geometry,
            { -2.7f, -0.8f, 1.8f },
            { -2.7f,  1.8f, 1.8f },
            {  2.7f,  1.8f, 1.8f },
            {  2.7f, -0.8f, 1.8f },
            D3DCOLOR_ARGB(90, 64, 166, 255),
            2.0f);
        geometry.transparentPanel.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.transparentPanel.startIndex;

        // Fullscreen quad
        geometry.presentQuad.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(
            geometry,
            { -1.0f, -1.0f, 0.0f },
            { -1.0f,  1.0f, 0.0f },
            {  1.0f,  1.0f, 0.0f },
            {  1.0f, -1.0f, 0.0f },
            white);
        geometry.presentQuad.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.presentQuad.startIndex;

        return geometry;
    }

    // --------------------
    // Renderer
    // --------------------
    class Renderer
    {
    public:
        void Initialize(HWND hwnd)
        {
            CreateDevice(hwnd);
            CreateSceneResources();
            CreateOffscreenRenderTarget();
            ConfigureFixedFunctionPipeline();
        }

        void SetProjectionMode(ProjectionMode mode)
        {
            m_projectionMode = mode;
        }

        void Render()
        {
            // Two-pass frame
            RenderScenePass();
            RenderPresentPass();
            ThrowIfFailed(m_device->Present(nullptr, nullptr, nullptr, nullptr), "IDirect3DDevice9::Present failed.");
        }

        void RenderPreviewStage(PreviewStage stage)
        {
            if (stage == PreviewStage::FullScene)
            {
                Render();
                return;
            }

            if (stage == PreviewStage::OneObject && m_projectionMode == ProjectionMode::Orthographic2D)
            {
                Render();
                return;
            }

            ThrowIfFailed(m_device->SetRenderTarget(0, m_backBufferSurface.Get()), "SetRenderTarget(preview) failed.");
            ThrowIfFailed(
                m_device->Clear(
                    0,
                    nullptr,
                    D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER,
                    D3DCOLOR_XRGB(24, 31, 42),
                    1.0f,
                    0),
                "Clear preview target failed.");

            if (stage == PreviewStage::ClearOnly)
            {
                ThrowIfFailed(m_device->Present(nullptr, nullptr, nullptr, nullptr), "Present preview failed.");
                return;
            }

            ThrowIfFailed(m_device->BeginScene(), "BeginScene(preview) failed.");
            m_device->SetTexture(0, m_texture.Get());
            m_device->SetRenderState(D3DRS_ZENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ZWRITEENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);

            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);
            const D3DMATRIX view = ToD3DMatrix(matrices.view);
            const D3DMATRIX projection = ToD3DMatrix(matrices.projection);
            m_device->SetTransform(D3DTS_VIEW, &view);
            m_device->SetTransform(D3DTS_PROJECTION, &projection);
            DrawObject(m_geometry.cube, XMMatrixIdentity());

            ThrowIfFailed(m_device->EndScene(), "EndScene(preview) failed.");
            ThrowIfFailed(m_device->Present(nullptr, nullptr, nullptr, nullptr), "Present preview failed.");
        }

    private:
        void CreateDevice(HWND hwnd)
        {
            // Direct3D 9 object / Device
            m_d3d.Attach(Direct3DCreate9(D3D_SDK_VERSION));
            if (!m_d3d)
            {
                throw std::runtime_error("Direct3DCreate9 failed.");
            }

            D3DPRESENT_PARAMETERS present{};
            present.Windowed = TRUE;
            present.SwapEffect = D3DSWAPEFFECT_DISCARD;
            present.BackBufferFormat = D3DFMT_UNKNOWN;
            present.BackBufferWidth = kClientWidth;
            present.BackBufferHeight = kClientHeight;
            present.EnableAutoDepthStencil = TRUE;
            present.AutoDepthStencilFormat = D3DFMT_D24S8;
            present.PresentationInterval = D3DPRESENT_INTERVAL_ONE;

            HRESULT hr = m_d3d->CreateDevice(
                D3DADAPTER_DEFAULT,
                D3DDEVTYPE_HAL,
                hwnd,
                D3DCREATE_HARDWARE_VERTEXPROCESSING,
                &present,
                m_device.GetAddressOf());

            // Hardware Vertex Processing で Device を作成できない場合は
            // Software Vertex Processing で再試行します。
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

        void CreateSceneResources()
        {
            // Geometry buffer
            m_geometry = BuildSceneGeometry();

            const UINT vertexBytes = static_cast<UINT>(m_geometry.vertices.size() * sizeof(Vertex));
            ThrowIfFailed(
                m_device->CreateVertexBuffer(
                    vertexBytes,
                    0,
                    kVertexFVF,
                    D3DPOOL_MANAGED,
                    m_vertexBuffer.GetAddressOf(),
                    nullptr),
                "CreateVertexBuffer failed.");

            void* vertexDestination = nullptr;
            ThrowIfFailed(m_vertexBuffer->Lock(0, 0, &vertexDestination, 0), "VertexBuffer::Lock failed.");
            std::memcpy(vertexDestination, m_geometry.vertices.data(), vertexBytes);
            ThrowIfFailed(m_vertexBuffer->Unlock(), "VertexBuffer::Unlock failed.");

            const UINT indexBytes = static_cast<UINT>(m_geometry.indices.size() * sizeof(std::uint16_t));
            ThrowIfFailed(
                m_device->CreateIndexBuffer(
                    indexBytes,
                    0,
                    D3DFMT_INDEX16,
                    D3DPOOL_MANAGED,
                    m_indexBuffer.GetAddressOf(),
                    nullptr),
                "CreateIndexBuffer failed.");

            void* indexDestination = nullptr;
            ThrowIfFailed(m_indexBuffer->Lock(0, 0, &indexDestination, 0), "IndexBuffer::Lock failed.");
            std::memcpy(indexDestination, m_geometry.indices.data(), indexBytes);
            ThrowIfFailed(m_indexBuffer->Unlock(), "IndexBuffer::Unlock failed.");

            // PNG Texture
            const ImageData image = LoadPngWithWIC(GetIconPath());
            ThrowIfFailed(
                m_device->CreateTexture(
                    image.width,
                    image.height,
                    1,
                    0,
                    D3DFMT_A8R8G8B8,
                    D3DPOOL_MANAGED,
                    m_texture.GetAddressOf(),
                    nullptr),
                "CreateTexture failed.");

            D3DLOCKED_RECT locked{};
            ThrowIfFailed(m_texture->LockRect(0, &locked, nullptr, 0), "Texture::LockRect failed.");

            const UINT sourceRowPitch = image.width * 4;
            for (UINT y = 0; y < image.height; ++y)
            {
                std::memcpy(
                    static_cast<std::uint8_t*>(locked.pBits) + static_cast<size_t>(y) * locked.Pitch,
                    image.pixels.data() + static_cast<size_t>(y) * sourceRowPitch,
                    sourceRowPitch);
            }

            ThrowIfFailed(m_texture->UnlockRect(0), "Texture::UnlockRect failed.");
        }

        void CreateOffscreenRenderTarget()
        {
            // BackBuffer Surface
            ThrowIfFailed(
                m_device->GetRenderTarget(0, m_backBufferSurface.GetAddressOf()),
                "GetRenderTarget failed.");

            // RenderTarget Texture
            // DX9 では Texture を D3DUSAGE_RENDERTARGET 付きで作り、その Surface を SetRenderTarget へ渡します。
            // Scene 描画用の RenderTarget Texture を作成します。
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
                "Create render target texture failed.");
            ThrowIfFailed(
                m_sceneTexture->GetSurfaceLevel(0, m_sceneSurface.GetAddressOf()),
                "GetSurfaceLevel failed.");
        }

        void ConfigureFixedFunctionPipeline()
        {
            // Fixed Function Pipeline state
            // DX9 では Shader を書かなくても、Device に頂点形式・Texture・Depth・Blend などの
            // Device に描画状態を設定します。
            m_device->SetFVF(kVertexFVF);
            m_device->SetStreamSource(0, m_vertexBuffer.Get(), 0, sizeof(Vertex));
            m_device->SetIndices(m_indexBuffer.Get());

            m_device->SetRenderState(D3DRS_ZENABLE, TRUE);
            m_device->SetRenderState(D3DRS_LIGHTING, FALSE);
            m_device->SetRenderState(D3DRS_CULLMODE, D3DCULL_NONE);

            m_device->SetTextureStageState(0, D3DTSS_COLOROP, D3DTOP_MODULATE);
            m_device->SetTextureStageState(0, D3DTSS_COLORARG1, D3DTA_TEXTURE);
            m_device->SetTextureStageState(0, D3DTSS_COLORARG2, D3DTA_DIFFUSE);
            m_device->SetTextureStageState(0, D3DTSS_ALPHAOP, D3DTOP_MODULATE);
            m_device->SetTextureStageState(0, D3DTSS_ALPHAARG1, D3DTA_TEXTURE);
            m_device->SetTextureStageState(0, D3DTSS_ALPHAARG2, D3DTA_DIFFUSE);

            m_device->SetSamplerState(0, D3DSAMP_ADDRESSU, D3DTADDRESS_WRAP);
            m_device->SetSamplerState(0, D3DSAMP_ADDRESSV, D3DTADDRESS_WRAP);
            m_device->SetSamplerState(0, D3DSAMP_MINFILTER, D3DTEXF_LINEAR);
            m_device->SetSamplerState(0, D3DSAMP_MAGFILTER, D3DTEXF_LINEAR);

        }

        void RenderScenePass()
        {
            // Scene Pass -> Offscreen RenderTarget
            ThrowIfFailed(m_device->SetRenderTarget(0, m_sceneSurface.Get()), "SetRenderTarget(scene) failed.");
            ThrowIfFailed(
                m_device->Clear(
                    0,
                    nullptr,
                    D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER,
                    D3DCOLOR_XRGB(24, 31, 42),
                    1.0f,
                    0),
                "Clear scene target failed.");

            ThrowIfFailed(m_device->BeginScene(), "BeginScene(scene) failed.");

            m_device->SetTexture(0, m_texture.Get());
            m_device->SetRenderState(D3DRS_ZENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ZWRITEENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);

            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);
            const D3DMATRIX view = ToD3DMatrix(matrices.view);
            const D3DMATRIX projection = ToD3DMatrix(matrices.projection);
            m_device->SetTransform(D3DTS_VIEW, &view);
            m_device->SetTransform(D3DTS_PROJECTION, &projection);

            if (m_projectionMode == ProjectionMode::Orthographic2D)
            {
                DrawObject(m_geometry.sprite2D, XMMatrixIdentity());
                ThrowIfFailed(m_device->EndScene(), "EndScene(scene) failed.");
                return;
            }

            DrawObject(m_geometry.floor, XMMatrixIdentity());
            DrawObject(m_geometry.cube, XMMatrixTranslation(-1.65f, 0.0f, 0.0f));
            DrawObject(m_geometry.pyramid, XMMatrixTranslation(1.65f, 0.0f, 0.0f));

            // Alpha Blend state
            m_device->SetRenderState(D3DRS_ALPHABLENDENABLE, TRUE);
            m_device->SetRenderState(D3DRS_SRCBLEND, D3DBLEND_SRCALPHA);
            m_device->SetRenderState(D3DRS_DESTBLEND, D3DBLEND_INVSRCALPHA);
            m_device->SetRenderState(D3DRS_ZWRITEENABLE, FALSE);
            DrawObject(m_geometry.transparentPanel, XMMatrixIdentity());

            m_device->SetRenderState(D3DRS_ZWRITEENABLE, TRUE);
            m_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);
            ThrowIfFailed(m_device->EndScene(), "EndScene(scene) failed.");
        }

        void RenderPresentPass()
        {
            // Present Pass -> BackBuffer
            ThrowIfFailed(m_device->SetRenderTarget(0, m_backBufferSurface.Get()), "SetRenderTarget(backbuffer) failed.");
            ThrowIfFailed(
                m_device->Clear(0, nullptr, D3DCLEAR_TARGET, D3DCOLOR_XRGB(10, 13, 18), 1.0f, 0),
                "Clear backbuffer failed.");

            ThrowIfFailed(m_device->BeginScene(), "BeginScene(present) failed.");

            m_device->SetRenderState(D3DRS_ZENABLE, FALSE);
            m_device->SetRenderState(D3DRS_ALPHABLENDENABLE, FALSE);
            m_device->SetTexture(0, m_sceneTexture.Get());

            const D3DMATRIX identity = ToD3DMatrix(XMMatrixIdentity());
            m_device->SetTransform(D3DTS_WORLD, &identity);
            m_device->SetTransform(D3DTS_VIEW, &identity);
            m_device->SetTransform(D3DTS_PROJECTION, &identity);
            DrawObject(m_geometry.presentQuad, XMMatrixIdentity());

            ThrowIfFailed(m_device->EndScene(), "EndScene(present) failed.");

        }

        void DrawObject(const DrawRange& range, FXMMATRIX world)
        {
            // Per-object state + Draw call
            const D3DMATRIX d3dWorld = ToD3DMatrix(world);
            m_device->SetTransform(D3DTS_WORLD, &d3dWorld);

            ThrowIfFailed(
                m_device->DrawIndexedPrimitive(
                    D3DPT_TRIANGLELIST,
                    0,
                    0,
                    static_cast<UINT>(m_geometry.vertices.size()),
                    range.startIndex,
                    range.indexCount / 3),
                "DrawIndexedPrimitive failed.");
        }

        ComPtr<IDirect3D9> m_d3d;
        ComPtr<IDirect3DDevice9> m_device;
        ComPtr<IDirect3DVertexBuffer9> m_vertexBuffer;
        ComPtr<IDirect3DIndexBuffer9> m_indexBuffer;
        ComPtr<IDirect3DTexture9> m_texture;
        ComPtr<IDirect3DTexture9> m_sceneTexture;
        ComPtr<IDirect3DSurface9> m_sceneSurface;
        ComPtr<IDirect3DSurface9> m_backBufferSurface;
        SceneGeometry m_geometry;
        ProjectionMode m_projectionMode = ProjectionMode::Perspective3D;
    };

    // --------------------
    // Win32 window
    // --------------------
    LRESULT CALLBACK WindowProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam)
    {
        switch (message)
        {
        case WM_DESTROY:
            PostQuitMessage(0);
            return 0;
        case WM_KEYDOWN:
            if (wParam == VK_ESCAPE)
            {
                DestroyWindow(hwnd);
                return 0;
            }
            break;
        default:
            break;
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
            throw std::runtime_error("RegisterClassExW failed.");
        }

        RECT windowRect{ 0, 0, static_cast<LONG>(kClientWidth), static_cast<LONG>(kClientHeight) };
        const DWORD style = WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX;
        AdjustWindowRect(&windowRect, style, FALSE);

        HWND hwnd = CreateWindowExW(
            0,
            kWindowClassName,
            kWindowTitle,
            style,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            windowRect.right - windowRect.left,
            windowRect.bottom - windowRect.top,
            nullptr,
            nullptr,
            instance,
            nullptr);

        if (!hwnd)
        {
            throw std::runtime_error("CreateWindowExW failed.");
        }

        ShowWindow(hwnd, SW_SHOW);
        UpdateWindow(hwnd);
        return hwnd;
    }
}

// --------------------
// Application entry point
// --------------------
int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int)
{
    try
    {
        ThrowIfFailed(CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED), "CoInitializeEx failed.");
        const HWND hwnd = CreateMainWindow(instance);

        Renderer renderer;
        renderer.Initialize(hwnd);
        PreviewStage previewStage = PreviewStage::FullScene;

        MSG message{};

        while (message.message != WM_QUIT)
        {
            if (PeekMessageW(&message, nullptr, 0, 0, PM_REMOVE))
            {
                TranslateMessage(&message);
                DispatchMessageW(&message);
                continue;
            }

            if (GetAsyncKeyState(VK_F1) & 0x8000) renderer.SetProjectionMode(ProjectionMode::Orthographic2D);
            if (GetAsyncKeyState(VK_F2) & 0x8000) renderer.SetProjectionMode(ProjectionMode::Perspective3D);
            if (GetAsyncKeyState(VK_F3) & 0x8000) previewStage = PreviewStage::ClearOnly;
            if (GetAsyncKeyState(VK_F4) & 0x8000) previewStage = PreviewStage::OneObject;
            if (GetAsyncKeyState(VK_F5) & 0x8000) previewStage = PreviewStage::FullScene;
            renderer.RenderPreviewStage(previewStage);
        }

        CoUninitialize();
        return static_cast<int>(message.wParam);
    }
    catch (const std::exception& exception)
    {
        MessageBoxA(nullptr, exception.what(), "DX9 Preview Error", MB_OK | MB_ICONERROR);
        return -1;
    }
}

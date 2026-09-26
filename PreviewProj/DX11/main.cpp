#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>
#include <d3d11.h>
#include <d3dcompiler.h>
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
    constexpr wchar_t kWindowClassName[] = L"KCGDirectXStudyDX11";
    constexpr wchar_t kWindowTitle[] = L"KCG DirectX Study - DirectX 11 Preview";

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
            converter->CopyPixels(nullptr, rowPitch, static_cast<UINT>(image.pixels.size()), image.pixels.data()),
            "IWICBitmapSource::CopyPixels failed.");
        return image;
    }

    // --------------------
    // Scene data
    // --------------------
    struct Vertex
    {
        XMFLOAT3 position;
        XMFLOAT4 color;
        XMFLOAT2 uv;
    };

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

    // ConstantBuffer は 16 byte 境界に合わせます。
    // Scene 描画に使用する WorldViewProjection 行列を保持します。
    struct alignas(16) SceneConstants
    {
        XMFLOAT4X4 worldViewProjection;
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
        XMFLOAT4 color)
    {
        const std::uint16_t base = static_cast<std::uint16_t>(geometry.vertices.size());
        geometry.vertices.push_back({ p0, color, { 0.0f, 1.0f } });
        geometry.vertices.push_back({ p1, color, { 0.5f, 0.0f } });
        geometry.vertices.push_back({ p2, color, { 1.0f, 1.0f } });
        geometry.indices.insert(
            geometry.indices.end(),
            { base, static_cast<std::uint16_t>(base + 1), static_cast<std::uint16_t>(base + 2) });
    }

    SceneGeometry BuildSceneGeometry()
    {
        SceneGeometry geometry;

        const XMFLOAT4 white{ 1.0f, 1.0f, 1.0f, 1.0f };

        geometry.sprite2D.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(
            geometry,
            { -2.0f, -2.0f, 0.0f },
            { -2.0f,  2.0f, 0.0f },
            {  2.0f,  2.0f, 0.0f },
            {  2.0f, -2.0f, 0.0f },
            white);
        geometry.sprite2D.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.sprite2D.startIndex;

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

        geometry.cube.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(geometry, { -1,-1,-1 }, { -1, 1,-1 }, { 1, 1,-1 }, { 1,-1,-1 }, white);
        AppendQuad(geometry, {  1,-1, 1 }, {  1, 1, 1 }, {-1, 1, 1 }, {-1,-1, 1 }, white);
        AppendQuad(geometry, { -1,-1, 1 }, { -1, 1, 1 }, {-1, 1,-1 }, {-1,-1,-1 }, white);
        AppendQuad(geometry, {  1,-1,-1 }, {  1, 1,-1 }, { 1, 1, 1 }, { 1,-1, 1 }, white);
        AppendQuad(geometry, { -1, 1,-1 }, { -1, 1, 1 }, { 1, 1, 1 }, { 1, 1,-1 }, white);
        AppendQuad(geometry, { -1,-1, 1 }, { -1,-1,-1 }, { 1,-1,-1 }, { 1,-1, 1 }, white);
        geometry.cube.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.cube.startIndex;

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
        // 半透明描画用の板ポリゴンです。
        geometry.transparentPanel.startIndex = static_cast<UINT>(geometry.indices.size());
        AppendQuad(
            geometry,
            { -2.7f, -0.8f, 1.8f },
            { -2.7f,  1.8f, 1.8f },
            {  2.7f,  1.8f, 1.8f },
            {  2.7f, -0.8f, 1.8f },
            { 0.25f, 0.65f, 1.0f, 0.35f },
            2.0f);
        geometry.transparentPanel.indexCount = static_cast<UINT>(geometry.indices.size()) - geometry.transparentPanel.startIndex;

        // Fullscreen quad
        // Present Pass では WVP を Identity にし、この -1～1 の座標をそのまま Clip Space として使います。
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

    std::filesystem::path GetShaderPath()
    {
        // Shader location
        // PostBuild で exe と同じ場所へコピーした Shader を最優先します。
        wchar_t executablePath[MAX_PATH]{};
        GetModuleFileNameW(nullptr, executablePath, MAX_PATH);
        const auto besideExe = std::filesystem::path(executablePath).parent_path() / L"DX11SceneShader.hlsl";
        if (std::filesystem::exists(besideExe))
        {
            return besideExe;
        }

        // Visual Studio からの実行など、Source directory を直接参照できる場合の fallback です。
        return std::filesystem::path(__FILE__).parent_path() / L"DX11SceneShader.hlsl";
    }

    ComPtr<ID3DBlob> CompileShader(const std::filesystem::path& path, const char* entryPoint, const char* target)
    {
        UINT flags = D3DCOMPILE_ENABLE_STRICTNESS;
#if defined(_DEBUG)
        flags |= D3DCOMPILE_DEBUG | D3DCOMPILE_SKIP_OPTIMIZATION;
#endif

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

        if (FAILED(hr))
        {
            std::string message = "D3DCompileFromFile failed.";
            if (errors)
            {
                message.append("\n");
                message.append(static_cast<const char*>(errors->GetBufferPointer()), errors->GetBufferSize());
            }
            throw std::runtime_error(message);
        }

        return shader;
    }

    // --------------------
    // Renderer
    // --------------------
    class Renderer
    {
    public:
        void Initialize(HWND hwnd)
        {
            CreateDeviceAndSwapChain(hwnd);
            CreateRenderTargets();
            CreateShadersAndInputLayout();
            CreateSceneResources();
            CreatePipelineResources();
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
            ThrowIfFailed(m_swapChain->Present(1, 0), "IDXGISwapChain::Present failed.");
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

            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            m_context->OMSetRenderTargets(1, m_backBufferRenderTargetView.GetAddressOf(), m_depthStencilView.Get());
            m_context->ClearRenderTargetView(m_backBufferRenderTargetView.Get(), clearColor);
            m_context->ClearDepthStencilView(m_depthStencilView.Get(), D3D11_CLEAR_DEPTH, 1.0f, 0);

            if (stage == PreviewStage::ClearOnly)
            {
                ThrowIfFailed(m_swapChain->Present(1, 0), "Preview Present failed.");
                return;
            }

            BindCommonPipeline();
            m_context->PSSetShaderResources(0, 1, m_iconTextureView.GetAddressOf());
            m_context->OMSetDepthStencilState(m_depthWriteState.Get(), 0);
            const float blendFactor[4] = { 0.0f, 0.0f, 0.0f, 0.0f };
            m_context->OMSetBlendState(m_opaqueBlendState.Get(), blendFactor, 0xFFFFFFFFu);

            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);
            DrawObject(m_geometry.cube, XMMatrixIdentity(), matrices.view, matrices.projection);
            ThrowIfFailed(m_swapChain->Present(1, 0), "Preview Present failed.");
        }

    private:
        void BindCommonPipeline()
        {
            // Input Assembler / Shader binding
            const UINT stride = sizeof(Vertex);
            const UINT offset = 0;
            m_context->IASetInputLayout(m_inputLayout.Get());
            m_context->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
            m_context->IASetVertexBuffers(0, 1, m_vertexBuffer.GetAddressOf(), &stride, &offset);
            m_context->IASetIndexBuffer(m_indexBuffer.Get(), DXGI_FORMAT_R16_UINT, 0);

            m_context->VSSetShader(m_vertexShader.Get(), nullptr, 0);
            m_context->VSSetConstantBuffers(0, 1, m_constantBuffer.GetAddressOf());
            m_context->PSSetShader(m_pixelShader.Get(), nullptr, 0);
            m_context->PSSetSamplers(0, 1, m_sampler.GetAddressOf());

            m_context->RSSetViewports(1, &m_viewport);
            m_context->RSSetState(m_rasterizerState.Get());
        }

        void RenderScenePass()
        {
            // SRV -> RTV hazard release
            // 前 Frame の Present Pass で SceneTexture を SRV として Bind しています。
            // 同じ Resource を RTV として使う前に SRV slot から外します。
            ID3D11ShaderResourceView* nullSrv = nullptr;
            m_context->PSSetShaderResources(0, 1, &nullSrv);

            // Offscreen RenderTarget
            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            m_context->OMSetRenderTargets(1, m_sceneRenderTargetView.GetAddressOf(), m_depthStencilView.Get());
            m_context->ClearRenderTargetView(m_sceneRenderTargetView.Get(), clearColor);
            m_context->ClearDepthStencilView(m_depthStencilView.Get(), D3D11_CLEAR_DEPTH, 1.0f, 0);

            BindCommonPipeline();
            m_context->PSSetShaderResources(0, 1, m_iconTextureView.GetAddressOf());
            m_context->OMSetDepthStencilState(m_depthWriteState.Get(), 0);

            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);
            const XMMATRIX view = matrices.view;
            const XMMATRIX projection = matrices.projection;

            // Opaque state
            const float blendFactor[4] = { 0.0f, 0.0f, 0.0f, 0.0f };
            m_context->OMSetBlendState(m_opaqueBlendState.Get(), blendFactor, 0xFFFFFFFFu);

            if (m_projectionMode == ProjectionMode::Orthographic2D)
            {
                DrawObject(m_geometry.sprite2D, XMMatrixIdentity(), view, projection);
                return;
            }

            DrawObject(m_geometry.floor, XMMatrixIdentity(), view, projection);
            DrawObject(m_geometry.cube, XMMatrixTranslation(-1.65f, 0.0f, 0.0f), view, projection);
            DrawObject(m_geometry.pyramid, XMMatrixTranslation(1.65f, 0.0f, 0.0f), view, projection);

            // Alpha Blend state
            m_context->OMSetBlendState(m_alphaBlendState.Get(), blendFactor, 0xFFFFFFFFu);
            m_context->OMSetDepthStencilState(m_depthReadOnlyState.Get(), 0);
            DrawObject(m_geometry.transparentPanel, XMMatrixIdentity(), view, projection);
        }

        void RenderPresentPass()
        {
            // BackBuffer as RenderTarget
            const float clearColor[4] = { 0.04f, 0.05f, 0.07f, 1.0f };
            m_context->OMSetRenderTargets(1, m_backBufferRenderTargetView.GetAddressOf(), nullptr);
            m_context->ClearRenderTargetView(m_backBufferRenderTargetView.Get(), clearColor);

            BindCommonPipeline();

            // Same Texture2D, different View
            // Scene Pass では RTV として使った Texture2D を、ここでは SRV として Shader から読みます。
            m_context->PSSetShaderResources(0, 1, m_sceneShaderResourceView.GetAddressOf());

            const float blendFactor[4] = { 0.0f, 0.0f, 0.0f, 0.0f };
            m_context->OMSetBlendState(m_opaqueBlendState.Get(), blendFactor, 0xFFFFFFFFu);
            m_context->OMSetDepthStencilState(m_depthDisabledState.Get(), 0);
            DrawObject(
                m_geometry.presentQuad,
                XMMatrixIdentity(),
                XMMatrixIdentity(),
                XMMatrixIdentity());
        }

        void CreateDeviceAndSwapChain(HWND hwnd)
        {
            // Device / ImmediateContext / SwapChain
            DXGI_SWAP_CHAIN_DESC swapChainDesc{};
            swapChainDesc.BufferDesc.Width = kClientWidth;
            swapChainDesc.BufferDesc.Height = kClientHeight;
            swapChainDesc.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
            swapChainDesc.SampleDesc.Count = 1;
            swapChainDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
            swapChainDesc.BufferCount = 2;
            swapChainDesc.OutputWindow = hwnd;
            swapChainDesc.Windowed = TRUE;
            swapChainDesc.SwapEffect = DXGI_SWAP_EFFECT_DISCARD;

            UINT flags = 0;
#if defined(_DEBUG)
            flags |= D3D11_CREATE_DEVICE_DEBUG;
#endif
            constexpr D3D_FEATURE_LEVEL requestedLevels[] = { D3D_FEATURE_LEVEL_11_0 };
            D3D_FEATURE_LEVEL createdLevel{};

            HRESULT hr = D3D11CreateDeviceAndSwapChain(
                nullptr,
                D3D_DRIVER_TYPE_HARDWARE,
                nullptr,
                flags,
                requestedLevels,
                1,
                D3D11_SDK_VERSION,
                &swapChainDesc,
                m_swapChain.GetAddressOf(),
                m_device.GetAddressOf(),
                &createdLevel,
                m_context.GetAddressOf());

#if defined(_DEBUG)
            // Debug Layer を使用できない場合は Debug flag を外して再試行します。
            if (FAILED(hr))
            {
                m_swapChain.Reset();
                m_device.Reset();
                m_context.Reset();
                hr = D3D11CreateDeviceAndSwapChain(
                    nullptr,
                    D3D_DRIVER_TYPE_HARDWARE,
                    nullptr,
                    0,
                    requestedLevels,
                    1,
                    D3D11_SDK_VERSION,
                    &swapChainDesc,
                    m_swapChain.GetAddressOf(),
                    m_device.GetAddressOf(),
                    &createdLevel,
                    m_context.GetAddressOf());
            }
#endif

            ThrowIfFailed(hr, "D3D11CreateDeviceAndSwapChain failed.");
        }

        void CreateRenderTargets()
        {
            // BackBuffer RTV
            ComPtr<ID3D11Texture2D> backBuffer;
            ThrowIfFailed(
                m_swapChain->GetBuffer(0, IID_PPV_ARGS(backBuffer.GetAddressOf())),
                "SwapChain::GetBuffer failed.");
            ThrowIfFailed(
                m_device->CreateRenderTargetView(backBuffer.Get(), nullptr, m_backBufferRenderTargetView.GetAddressOf()),
                "CreateRenderTargetView failed.");

            // Offscreen Texture2D -> RTV + SRV
            // 同じ Resource を「描画先」と「Shader から読む Texture」の2つの View で扱います。
            D3D11_TEXTURE2D_DESC sceneDesc{};
            sceneDesc.Width = kClientWidth;
            sceneDesc.Height = kClientHeight;
            sceneDesc.MipLevels = 1;
            sceneDesc.ArraySize = 1;
            sceneDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
            sceneDesc.SampleDesc.Count = 1;
            sceneDesc.Usage = D3D11_USAGE_DEFAULT;
            sceneDesc.BindFlags = D3D11_BIND_RENDER_TARGET | D3D11_BIND_SHADER_RESOURCE;

            ThrowIfFailed(
                m_device->CreateTexture2D(&sceneDesc, nullptr, m_sceneTexture.GetAddressOf()),
                "Create offscreen texture failed.");
            ThrowIfFailed(
                m_device->CreateRenderTargetView(m_sceneTexture.Get(), nullptr, m_sceneRenderTargetView.GetAddressOf()),
                "Create offscreen RTV failed.");
            ThrowIfFailed(
                m_device->CreateShaderResourceView(m_sceneTexture.Get(), nullptr, m_sceneShaderResourceView.GetAddressOf()),
                "Create offscreen SRV failed.");

            // Depth Texture -> DSV

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
            ThrowIfFailed(m_device->CreateTexture2D(&depthDesc, nullptr, depthTexture.GetAddressOf()), "Create depth texture failed.");
            ThrowIfFailed(
                m_device->CreateDepthStencilView(depthTexture.Get(), nullptr, m_depthStencilView.GetAddressOf()),
                "CreateDepthStencilView failed.");

            m_viewport.TopLeftX = 0.0f;
            m_viewport.TopLeftY = 0.0f;
            m_viewport.Width = static_cast<float>(kClientWidth);
            m_viewport.Height = static_cast<float>(kClientHeight);
            m_viewport.MinDepth = 0.0f;
            m_viewport.MaxDepth = 1.0f;
        }

        void CreateShadersAndInputLayout()
        {
            // Programmable pipeline
            // Vertex Shader の入力に対応する InputLayout を作成します。
            const auto shaderPath = GetShaderPath();
            const ComPtr<ID3DBlob> vertexBytecode = CompileShader(shaderPath, "VSMain", "vs_5_0");
            const ComPtr<ID3DBlob> pixelBytecode = CompileShader(shaderPath, "PSMain", "ps_5_0");

            ThrowIfFailed(
                m_device->CreateVertexShader(
                    vertexBytecode->GetBufferPointer(),
                    vertexBytecode->GetBufferSize(),
                    nullptr,
                    m_vertexShader.GetAddressOf()),
                "CreateVertexShader failed.");
            ThrowIfFailed(
                m_device->CreatePixelShader(
                    pixelBytecode->GetBufferPointer(),
                    pixelBytecode->GetBufferSize(),
                    nullptr,
                    m_pixelShader.GetAddressOf()),
                "CreatePixelShader failed.");

            constexpr D3D11_INPUT_ELEMENT_DESC inputElements[] =
            {
                { "POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT, 0, offsetof(Vertex, position), D3D11_INPUT_PER_VERTEX_DATA, 0 },
                { "COLOR",    0, DXGI_FORMAT_R32G32B32A32_FLOAT, 0, offsetof(Vertex, color), D3D11_INPUT_PER_VERTEX_DATA, 0 },
                { "TEXCOORD", 0, DXGI_FORMAT_R32G32_FLOAT,   0, offsetof(Vertex, uv),       D3D11_INPUT_PER_VERTEX_DATA, 0 },
            };

            ThrowIfFailed(
                m_device->CreateInputLayout(
                    inputElements,
                    static_cast<UINT>(std::size(inputElements)),
                    vertexBytecode->GetBufferPointer(),
                    vertexBytecode->GetBufferSize(),
                    m_inputLayout.GetAddressOf()),
                "CreateInputLayout failed.");
        }

        void CreateSceneResources()
        {
            // Vertex / Index buffer
            m_geometry = BuildSceneGeometry();

            D3D11_BUFFER_DESC vertexDesc{};
            vertexDesc.ByteWidth = static_cast<UINT>(m_geometry.vertices.size() * sizeof(Vertex));
            vertexDesc.Usage = D3D11_USAGE_IMMUTABLE;
            vertexDesc.BindFlags = D3D11_BIND_VERTEX_BUFFER;
            D3D11_SUBRESOURCE_DATA vertexData{};
            vertexData.pSysMem = m_geometry.vertices.data();
            ThrowIfFailed(m_device->CreateBuffer(&vertexDesc, &vertexData, m_vertexBuffer.GetAddressOf()), "Create vertex buffer failed.");

            D3D11_BUFFER_DESC indexDesc{};
            indexDesc.ByteWidth = static_cast<UINT>(m_geometry.indices.size() * sizeof(std::uint16_t));
            indexDesc.Usage = D3D11_USAGE_IMMUTABLE;
            indexDesc.BindFlags = D3D11_BIND_INDEX_BUFFER;
            D3D11_SUBRESOURCE_DATA indexData{};
            indexData.pSysMem = m_geometry.indices.data();
            ThrowIfFailed(m_device->CreateBuffer(&indexDesc, &indexData, m_indexBuffer.GetAddressOf()), "Create index buffer failed.");

            // Constant buffer
            D3D11_BUFFER_DESC constantDesc{};
            constantDesc.ByteWidth = sizeof(SceneConstants);
            constantDesc.Usage = D3D11_USAGE_DEFAULT;
            constantDesc.BindFlags = D3D11_BIND_CONSTANT_BUFFER;
            ThrowIfFailed(m_device->CreateBuffer(&constantDesc, nullptr, m_constantBuffer.GetAddressOf()), "Create constant buffer failed.");

            // PNG Texture + SRV
            const ImageData image = LoadPngWithWIC(GetIconPath());

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
            ThrowIfFailed(m_device->CreateTexture2D(&textureDesc, &textureData, texture.GetAddressOf()), "Create texture failed.");
            ThrowIfFailed(m_device->CreateShaderResourceView(texture.Get(), nullptr, m_iconTextureView.GetAddressOf()), "Create SRV failed.");
        }

        void CreatePipelineResources()
        {
            // Sampler state
            D3D11_SAMPLER_DESC samplerDesc{};
            samplerDesc.Filter = D3D11_FILTER_MIN_MAG_MIP_LINEAR;
            samplerDesc.AddressU = D3D11_TEXTURE_ADDRESS_WRAP;
            samplerDesc.AddressV = D3D11_TEXTURE_ADDRESS_WRAP;
            samplerDesc.AddressW = D3D11_TEXTURE_ADDRESS_WRAP;
            samplerDesc.MaxLOD = D3D11_FLOAT32_MAX;
            ThrowIfFailed(m_device->CreateSamplerState(&samplerDesc, m_sampler.GetAddressOf()), "CreateSamplerState failed.");

            // DepthStencilState
            D3D11_DEPTH_STENCIL_DESC depthWriteDesc{};
            depthWriteDesc.DepthEnable = TRUE;
            depthWriteDesc.DepthWriteMask = D3D11_DEPTH_WRITE_MASK_ALL;
            depthWriteDesc.DepthFunc = D3D11_COMPARISON_LESS;
            ThrowIfFailed(
                m_device->CreateDepthStencilState(&depthWriteDesc, m_depthWriteState.GetAddressOf()),
                "Create depth write state failed.");

            D3D11_DEPTH_STENCIL_DESC depthReadOnlyDesc = depthWriteDesc;
            depthReadOnlyDesc.DepthWriteMask = D3D11_DEPTH_WRITE_MASK_ZERO;
            ThrowIfFailed(
                m_device->CreateDepthStencilState(&depthReadOnlyDesc, m_depthReadOnlyState.GetAddressOf()),
                "Create depth read-only state failed.");

            D3D11_DEPTH_STENCIL_DESC depthDisabledDesc{};
            depthDisabledDesc.DepthEnable = FALSE;
            ThrowIfFailed(
                m_device->CreateDepthStencilState(&depthDisabledDesc, m_depthDisabledState.GetAddressOf()),
                "Create depth disabled state failed.");

            // BlendState
            D3D11_BLEND_DESC opaqueBlendDesc{};
            opaqueBlendDesc.RenderTarget[0].BlendEnable = FALSE;
            opaqueBlendDesc.RenderTarget[0].RenderTargetWriteMask = D3D11_COLOR_WRITE_ENABLE_ALL;
            ThrowIfFailed(
                m_device->CreateBlendState(&opaqueBlendDesc, m_opaqueBlendState.GetAddressOf()),
                "Create opaque blend state failed.");

            D3D11_BLEND_DESC alphaBlendDesc = opaqueBlendDesc;
            auto& target = alphaBlendDesc.RenderTarget[0];
            target.BlendEnable = TRUE;
            target.SrcBlend = D3D11_BLEND_SRC_ALPHA;
            target.DestBlend = D3D11_BLEND_INV_SRC_ALPHA;
            target.BlendOp = D3D11_BLEND_OP_ADD;
            target.SrcBlendAlpha = D3D11_BLEND_ONE;
            target.DestBlendAlpha = D3D11_BLEND_ZERO;
            target.BlendOpAlpha = D3D11_BLEND_OP_ADD;
            ThrowIfFailed(
                m_device->CreateBlendState(&alphaBlendDesc, m_alphaBlendState.GetAddressOf()),
                "Create alpha blend state failed.");

            // Rasterizer state
            // 両面を描画するため Cull を無効化します。
            D3D11_RASTERIZER_DESC rasterizerDesc{};
            rasterizerDesc.FillMode = D3D11_FILL_SOLID;
            rasterizerDesc.CullMode = D3D11_CULL_NONE;
            rasterizerDesc.DepthClipEnable = TRUE;
            ThrowIfFailed(m_device->CreateRasterizerState(&rasterizerDesc, m_rasterizerState.GetAddressOf()), "CreateRasterizerState failed.");
        }

        void DrawObject(const DrawRange& range, FXMMATRIX world, FXMMATRIX view, FXMMATRIX projection)
        {
            // Per-object ConstantBuffer
            SceneConstants constants{};
            XMStoreFloat4x4(&constants.worldViewProjection, XMMatrixTranspose(world * view * projection));
            m_context->UpdateSubresource(m_constantBuffer.Get(), 0, nullptr, &constants, 0, 0);

            m_context->DrawIndexed(range.indexCount, range.startIndex, 0);
        }

        ComPtr<ID3D11Device> m_device;
        ComPtr<ID3D11DeviceContext> m_context;
        ComPtr<IDXGISwapChain> m_swapChain;
        ComPtr<ID3D11RenderTargetView> m_backBufferRenderTargetView;
        ComPtr<ID3D11Texture2D> m_sceneTexture;
        ComPtr<ID3D11RenderTargetView> m_sceneRenderTargetView;
        ComPtr<ID3D11ShaderResourceView> m_sceneShaderResourceView;
        ComPtr<ID3D11DepthStencilView> m_depthStencilView;
        ComPtr<ID3D11VertexShader> m_vertexShader;
        ComPtr<ID3D11PixelShader> m_pixelShader;
        ComPtr<ID3D11InputLayout> m_inputLayout;
        ComPtr<ID3D11Buffer> m_vertexBuffer;
        ComPtr<ID3D11Buffer> m_indexBuffer;
        ComPtr<ID3D11Buffer> m_constantBuffer;
        ComPtr<ID3D11ShaderResourceView> m_iconTextureView;
        ComPtr<ID3D11SamplerState> m_sampler;
        ComPtr<ID3D11DepthStencilState> m_depthWriteState;
        ComPtr<ID3D11DepthStencilState> m_depthReadOnlyState;
        ComPtr<ID3D11DepthStencilState> m_depthDisabledState;
        ComPtr<ID3D11BlendState> m_opaqueBlendState;
        ComPtr<ID3D11BlendState> m_alphaBlendState;
        ComPtr<ID3D11RasterizerState> m_rasterizerState;
        D3D11_VIEWPORT m_viewport{};
        SceneGeometry m_geometry;
        ProjectionMode m_projectionMode = ProjectionMode::Perspective3D;
    };

    // --------------------
    // Win32 window
    // --------------------
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
            throw std::runtime_error("RegisterClassExW failed.");
        }

        RECT rect{ 0, 0, static_cast<LONG>(kClientWidth), static_cast<LONG>(kClientHeight) };
        const DWORD style = WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX;
        AdjustWindowRect(&rect, style, FALSE);

        HWND hwnd = CreateWindowExW(
            0, kWindowClassName, kWindowTitle, style,
            CW_USEDEFAULT, CW_USEDEFAULT,
            rect.right - rect.left, rect.bottom - rect.top,
            nullptr, nullptr, instance, nullptr);
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
        MessageBoxA(nullptr, exception.what(), "DX11 Preview Error", MB_OK | MB_ICONERROR);
        return -1;
    }
}

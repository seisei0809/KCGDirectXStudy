#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>
#include <d3d12.h>
#include <dxgi1_6.h>
#include <d3dcompiler.h>
#include <DirectXMath.h>
#include <wincodec.h>
#include <wrl/client.h>

#include <array>
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
    constexpr UINT kFrameCount = 2;
    constexpr UINT kObjectCount = 5;
    constexpr wchar_t kWindowClassName[] = L"KCGDirectXStudyDX12";
    constexpr wchar_t kWindowTitle[] = L"KCG DirectX Study - DirectX 12 Preview";

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

    struct alignas(16) SceneConstants
    {
        XMFLOAT4X4 worldViewProjection;
    };

    constexpr UINT AlignConstantBuffer(UINT byteSize)
    {
        return (byteSize + D3D12_CONSTANT_BUFFER_DATA_PLACEMENT_ALIGNMENT - 1)
            & ~(D3D12_CONSTANT_BUFFER_DATA_PLACEMENT_ALIGNMENT - 1);
    }

    constexpr UINT kConstantBufferStride = AlignConstantBuffer(sizeof(SceneConstants));

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

    D3D12_RESOURCE_DESC BufferDescription(UINT64 size)
    {
        D3D12_RESOURCE_DESC desc{};
        desc.Dimension = D3D12_RESOURCE_DIMENSION_BUFFER;
        desc.Alignment = 0;
        desc.Width = size;
        desc.Height = 1;
        desc.DepthOrArraySize = 1;
        desc.MipLevels = 1;
        desc.Format = DXGI_FORMAT_UNKNOWN;
        desc.SampleDesc.Count = 1;
        desc.SampleDesc.Quality = 0;
        desc.Layout = D3D12_TEXTURE_LAYOUT_ROW_MAJOR;
        desc.Flags = D3D12_RESOURCE_FLAG_NONE;
        return desc;
    }

    D3D12_RESOURCE_BARRIER TransitionBarrier(
        ID3D12Resource* resource,
        D3D12_RESOURCE_STATES before,
        D3D12_RESOURCE_STATES after)
    {
        D3D12_RESOURCE_BARRIER barrier{};
        barrier.Type = D3D12_RESOURCE_BARRIER_TYPE_TRANSITION;
        barrier.Flags = D3D12_RESOURCE_BARRIER_FLAG_NONE;
        barrier.Transition.pResource = resource;
        barrier.Transition.Subresource = D3D12_RESOURCE_BARRIER_ALL_SUBRESOURCES;
        barrier.Transition.StateBefore = before;
        barrier.Transition.StateAfter = after;
        return barrier;
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
        wchar_t executablePath[MAX_PATH]{};
        GetModuleFileNameW(nullptr, executablePath, MAX_PATH);
        const auto besideExe = std::filesystem::path(executablePath).parent_path() / L"DX12SceneShader.hlsl";
        if (std::filesystem::exists(besideExe))
        {
            return besideExe;
        }
        return std::filesystem::path(__FILE__).parent_path() / L"DX12SceneShader.hlsl";
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
            path.c_str(), nullptr, D3D_COMPILE_STANDARD_FILE_INCLUDE,
            entryPoint, target, flags, 0,
            shader.GetAddressOf(), errors.GetAddressOf());

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
        ~Renderer()
        {
            if (m_fenceEvent)
            {
                CloseHandle(m_fenceEvent);
            }
        }

        void Initialize(HWND hwnd)
        {
            EnableDebugLayer();
            CreateDeviceAndSwapChain(hwnd);
            CreateDescriptorHeapsAndRenderTargets();
            CreateCommandObjects();
            CreateFence();
            CreateRootSignatureAndPipelineState();
            CreateDepthBuffer();
            CreateOffscreenRenderTarget();
            CreateSceneResources();
            SubmitInitializationCommands();
        }

        void SetProjectionMode(ProjectionMode mode)
        {
            m_projectionMode = mode;
        }

        void SubmitInitializationCommands()
        {
            ThrowIfFailed(m_commandList->Close(), "Initial CommandList::Close failed.");
            ID3D12CommandList* lists[] = { m_commandList.Get() };
            m_commandQueue->ExecuteCommandLists(1, lists);
            WaitForGpu();

            m_vertexUpload.Reset();
            m_indexUpload.Reset();
            m_textureUpload.Reset();
        }

        void Render()
        {
            // Command recording begin
            // 前フレームの GPU 処理完了後に CommandAllocator を再利用します。
            ThrowIfFailed(m_commandAllocator->Reset(), "CommandAllocator::Reset failed.");
            ThrowIfFailed(m_commandList->Reset(m_commandAllocator.Get(), m_opaquePipelineState.Get()), "CommandList::Reset failed.");

            m_commandList->SetGraphicsRootSignature(m_rootSignature.Get());
            ID3D12DescriptorHeap* shaderVisibleHeaps[] = { m_srvHeap.Get() };
            m_commandList->SetDescriptorHeaps(1, shaderVisibleHeaps);
            m_commandList->RSSetViewports(1, &m_viewport);
            m_commandList->RSSetScissorRects(1, &m_scissorRect);

            m_commandList->IASetPrimitiveTopology(D3D_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
            m_commandList->IASetVertexBuffers(0, 1, &m_vertexBufferView);
            m_commandList->IASetIndexBuffer(&m_indexBufferView);

            // SceneTexture: PIXEL_SHADER_RESOURCE -> RENDER_TARGET
            auto sceneToRenderTarget = TransitionBarrier(
                m_sceneTexture.Get(),
                D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE,
                D3D12_RESOURCE_STATE_RENDER_TARGET);
            m_commandList->ResourceBarrier(1, &sceneToRenderTarget);

            D3D12_CPU_DESCRIPTOR_HANDLE sceneRtv = m_rtvHeap->GetCPUDescriptorHandleForHeapStart();
            sceneRtv.ptr += static_cast<SIZE_T>(kFrameCount) * m_rtvDescriptorSize;
            const D3D12_CPU_DESCRIPTOR_HANDLE dsv = m_dsvHeap->GetCPUDescriptorHandleForHeapStart();
            m_commandList->OMSetRenderTargets(1, &sceneRtv, FALSE, &dsv);

            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            m_commandList->ClearRenderTargetView(sceneRtv, clearColor, 0, nullptr);
            m_commandList->ClearDepthStencilView(dsv, D3D12_CLEAR_FLAG_DEPTH, 1.0f, 0, 0, nullptr);

            // Scene Pass: Icon Texture SRV
            D3D12_GPU_DESCRIPTOR_HANDLE iconSrv = m_srvHeap->GetGPUDescriptorHandleForHeapStart();
            m_commandList->SetGraphicsRootDescriptorTable(1, iconSrv);
            m_commandList->SetPipelineState(m_opaquePipelineState.Get());

            const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);
            const XMMATRIX view = matrices.view;
            const XMMATRIX projection = matrices.projection;

            if (m_projectionMode == ProjectionMode::Orthographic2D)
            {
                DrawObject(0, m_geometry.sprite2D, XMMatrixIdentity(), view, projection);
            }
            else
            {
                DrawObject(0, m_geometry.floor, XMMatrixIdentity(), view, projection);
                DrawObject(1, m_geometry.cube, XMMatrixTranslation(-1.65f, 0.0f, 0.0f), view, projection);
                DrawObject(2, m_geometry.pyramid, XMMatrixTranslation(1.65f, 0.0f, 0.0f), view, projection);

                // Blend is part of PSO
                // AlphaBlend を有効にした PSO へ切り替えます。
                m_commandList->SetPipelineState(m_alphaBlendPipelineState.Get());
                DrawObject(3, m_geometry.transparentPanel, XMMatrixIdentity(), view, projection);
            }

            // SceneTexture: RENDER_TARGET -> PIXEL_SHADER_RESOURCE
            auto sceneToShaderResource = TransitionBarrier(
                m_sceneTexture.Get(),
                D3D12_RESOURCE_STATE_RENDER_TARGET,
                D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE);
            m_commandList->ResourceBarrier(1, &sceneToShaderResource);

            // BackBuffer: PRESENT -> RENDER_TARGET
            auto backBufferToRenderTarget = TransitionBarrier(
                m_renderTargets[m_frameIndex].Get(),
                D3D12_RESOURCE_STATE_PRESENT,
                D3D12_RESOURCE_STATE_RENDER_TARGET);
            m_commandList->ResourceBarrier(1, &backBufferToRenderTarget);

            D3D12_CPU_DESCRIPTOR_HANDLE backBufferRtv = m_rtvHeap->GetCPUDescriptorHandleForHeapStart();
            backBufferRtv.ptr += static_cast<SIZE_T>(m_frameIndex) * m_rtvDescriptorSize;
            m_commandList->OMSetRenderTargets(1, &backBufferRtv, FALSE, nullptr);
            const float backBufferClear[4] = { 0.04f, 0.05f, 0.07f, 1.0f };
            m_commandList->ClearRenderTargetView(backBufferRtv, backBufferClear, 0, nullptr);

            // Present Pass: SceneTexture SRV
            D3D12_GPU_DESCRIPTOR_HANDLE sceneSrv = m_srvHeap->GetGPUDescriptorHandleForHeapStart();
            sceneSrv.ptr += static_cast<UINT64>(m_srvDescriptorSize);
            m_commandList->SetGraphicsRootDescriptorTable(1, sceneSrv);
            m_commandList->SetPipelineState(m_presentPipelineState.Get());
            DrawObject(
                4,
                m_geometry.presentQuad,
                XMMatrixIdentity(),
                XMMatrixIdentity(),
                XMMatrixIdentity());

            // BackBuffer: RENDER_TARGET -> PRESENT
            auto backBufferToPresent = TransitionBarrier(
                m_renderTargets[m_frameIndex].Get(),
                D3D12_RESOURCE_STATE_RENDER_TARGET,
                D3D12_RESOURCE_STATE_PRESENT);
            m_commandList->ResourceBarrier(1, &backBufferToPresent);

            ThrowIfFailed(m_commandList->Close(), "CommandList::Close failed.");
            ID3D12CommandList* lists[] = { m_commandList.Get() };
            m_commandQueue->ExecuteCommandLists(1, lists);
            ThrowIfFailed(m_swapChain->Present(1, 0), "SwapChain::Present failed.");

            // CommandAllocator を次フレームで再利用する前に GPU 完了を待ちます。
            WaitForGpu();
            m_frameIndex = m_swapChain->GetCurrentBackBufferIndex();
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

            ThrowIfFailed(m_commandAllocator->Reset(), "Preview CommandAllocator::Reset failed.");
            ID3D12PipelineState* initialPipelineState =
                stage == PreviewStage::OneObject ? m_opaquePipelineState.Get() : nullptr;
            ThrowIfFailed(
                m_commandList->Reset(m_commandAllocator.Get(), initialPipelineState),
                "Preview CommandList::Reset failed.");

            if (stage == PreviewStage::OneObject)
            {
                m_commandList->SetGraphicsRootSignature(m_rootSignature.Get());
                ID3D12DescriptorHeap* shaderVisibleHeaps[] = { m_srvHeap.Get() };
                m_commandList->SetDescriptorHeaps(1, shaderVisibleHeaps);
                m_commandList->RSSetViewports(1, &m_viewport);
                m_commandList->RSSetScissorRects(1, &m_scissorRect);
                m_commandList->IASetPrimitiveTopology(D3D_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
                m_commandList->IASetVertexBuffers(0, 1, &m_vertexBufferView);
                m_commandList->IASetIndexBuffer(&m_indexBufferView);
            }

            auto backBufferToRenderTarget = TransitionBarrier(
                m_renderTargets[m_frameIndex].Get(),
                D3D12_RESOURCE_STATE_PRESENT,
                D3D12_RESOURCE_STATE_RENDER_TARGET);
            m_commandList->ResourceBarrier(1, &backBufferToRenderTarget);

            D3D12_CPU_DESCRIPTOR_HANDLE backBufferRtv = m_rtvHeap->GetCPUDescriptorHandleForHeapStart();
            backBufferRtv.ptr += static_cast<SIZE_T>(m_frameIndex) * m_rtvDescriptorSize;
            const D3D12_CPU_DESCRIPTOR_HANDLE dsv = m_dsvHeap->GetCPUDescriptorHandleForHeapStart();
            m_commandList->OMSetRenderTargets(
                1,
                &backBufferRtv,
                FALSE,
                stage == PreviewStage::OneObject ? &dsv : nullptr);

            const float clearColor[4] = { 24.0f / 255.0f, 31.0f / 255.0f, 42.0f / 255.0f, 1.0f };
            m_commandList->ClearRenderTargetView(backBufferRtv, clearColor, 0, nullptr);

            if (stage == PreviewStage::OneObject)
            {
                m_commandList->ClearDepthStencilView(dsv, D3D12_CLEAR_FLAG_DEPTH, 1.0f, 0, 0, nullptr);
                m_commandList->SetGraphicsRootDescriptorTable(1, m_srvHeap->GetGPUDescriptorHandleForHeapStart());
                const ViewProjectionMatrices matrices = BuildViewProjection(m_projectionMode);
                DrawObject(0, m_geometry.cube, XMMatrixIdentity(), matrices.view, matrices.projection);
            }

            auto backBufferToPresent = TransitionBarrier(
                m_renderTargets[m_frameIndex].Get(),
                D3D12_RESOURCE_STATE_RENDER_TARGET,
                D3D12_RESOURCE_STATE_PRESENT);
            m_commandList->ResourceBarrier(1, &backBufferToPresent);

            ThrowIfFailed(m_commandList->Close(), "Preview CommandList::Close failed.");
            ID3D12CommandList* lists[] = { m_commandList.Get() };
            m_commandQueue->ExecuteCommandLists(1, lists);
            ThrowIfFailed(m_swapChain->Present(1, 0), "Preview SwapChain::Present failed.");
            WaitForGpu();
            m_frameIndex = m_swapChain->GetCurrentBackBufferIndex();
        }

    private:
        void EnableDebugLayer()
        {
#if defined(_DEBUG)
            // Debug Layer
            // Debug Interface を取得できた場合のみ Debug Layer を有効化します。
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
            // Factory / Device
            UINT factoryFlags = 0;
#if defined(_DEBUG)
            if (m_debugLayerEnabled)
            {
                factoryFlags |= DXGI_CREATE_FACTORY_DEBUG;
            }
#endif
            ThrowIfFailed(CreateDXGIFactory2(factoryFlags, IID_PPV_ARGS(m_factory.GetAddressOf())), "CreateDXGIFactory2 failed.");
            ThrowIfFailed(
                D3D12CreateDevice(nullptr, D3D_FEATURE_LEVEL_11_0, IID_PPV_ARGS(m_device.GetAddressOf())),
                "D3D12CreateDevice failed.");

            // CommandQueue
            D3D12_COMMAND_QUEUE_DESC queueDesc{};
            queueDesc.Type = D3D12_COMMAND_LIST_TYPE_DIRECT;
            queueDesc.Priority = D3D12_COMMAND_QUEUE_PRIORITY_NORMAL;
            queueDesc.Flags = D3D12_COMMAND_QUEUE_FLAG_NONE;
            ThrowIfFailed(m_device->CreateCommandQueue(&queueDesc, IID_PPV_ARGS(m_commandQueue.GetAddressOf())), "CreateCommandQueue failed.");

            // SwapChain
            DXGI_SWAP_CHAIN_DESC1 swapDesc{};
            swapDesc.Width = kClientWidth;
            swapDesc.Height = kClientHeight;
            swapDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
            swapDesc.SampleDesc.Count = 1;
            swapDesc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
            swapDesc.BufferCount = kFrameCount;
            swapDesc.SwapEffect = DXGI_SWAP_EFFECT_FLIP_DISCARD;

            ComPtr<IDXGISwapChain1> swapChain1;
            ThrowIfFailed(
                m_factory->CreateSwapChainForHwnd(
                    m_commandQueue.Get(), hwnd, &swapDesc, nullptr, nullptr, swapChain1.GetAddressOf()),
                "CreateSwapChainForHwnd failed.");
            ThrowIfFailed(swapChain1.As(&m_swapChain), "Query IDXGISwapChain3 failed.");
            m_factory->MakeWindowAssociation(hwnd, DXGI_MWA_NO_ALT_ENTER);
            m_frameIndex = m_swapChain->GetCurrentBackBufferIndex();
        }

        void CreateDescriptorHeapsAndRenderTargets()
        {
            // RTV DescriptorHeap
            D3D12_DESCRIPTOR_HEAP_DESC rtvHeapDesc{};
            rtvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_RTV;
            // BackBuffer 2 枚 + Offscreen RenderTarget 1 枚。
            rtvHeapDesc.NumDescriptors = kFrameCount + 1;
            ThrowIfFailed(m_device->CreateDescriptorHeap(&rtvHeapDesc, IID_PPV_ARGS(m_rtvHeap.GetAddressOf())), "Create RTV heap failed.");
            m_rtvDescriptorSize = m_device->GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE_RTV);

            D3D12_CPU_DESCRIPTOR_HANDLE rtv = m_rtvHeap->GetCPUDescriptorHandleForHeapStart();
            for (UINT i = 0; i < kFrameCount; ++i)
            {
                ThrowIfFailed(m_swapChain->GetBuffer(i, IID_PPV_ARGS(m_renderTargets[i].GetAddressOf())), "SwapChain::GetBuffer failed.");
                m_device->CreateRenderTargetView(m_renderTargets[i].Get(), nullptr, rtv);
                rtv.ptr += m_rtvDescriptorSize;
            }

            // DSV DescriptorHeap
            D3D12_DESCRIPTOR_HEAP_DESC dsvHeapDesc{};
            dsvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_DSV;
            dsvHeapDesc.NumDescriptors = 1;
            ThrowIfFailed(m_device->CreateDescriptorHeap(&dsvHeapDesc, IID_PPV_ARGS(m_dsvHeap.GetAddressOf())), "Create DSV heap failed.");

            // Shader-visible SRV DescriptorHeap
            D3D12_DESCRIPTOR_HEAP_DESC srvHeapDesc{};
            srvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_CBV_SRV_UAV;
            // 0: Icon Texture, 1: Offscreen Scene Texture
            srvHeapDesc.NumDescriptors = 2;
            srvHeapDesc.Flags = D3D12_DESCRIPTOR_HEAP_FLAG_SHADER_VISIBLE;
            ThrowIfFailed(m_device->CreateDescriptorHeap(&srvHeapDesc, IID_PPV_ARGS(m_srvHeap.GetAddressOf())), "Create SRV heap failed.");
            m_srvDescriptorSize = m_device->GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE_CBV_SRV_UAV);
        }

        void CreateCommandObjects()
        {
            // CommandAllocator / GraphicsCommandList
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
        }

        void CreateFence()
        {
            // CPU / GPU synchronization
            ThrowIfFailed(m_device->CreateFence(0, D3D12_FENCE_FLAG_NONE, IID_PPV_ARGS(m_fence.GetAddressOf())), "CreateFence failed.");
            m_fenceEvent = CreateEventW(nullptr, FALSE, FALSE, nullptr);
            if (!m_fenceEvent)
            {
                throw std::runtime_error("CreateEventW failed.");
            }
        }

        void CreateRootSignatureAndPipelineState()
        {
            // RootSignature
            // Root parameter 0 : b0 ConstantBuffer を GPU virtual address で直接指定。
            // Root parameter 1 : t0 Texture SRV を DescriptorTable 経由で指定。
            D3D12_DESCRIPTOR_RANGE srvRange{};
            srvRange.RangeType = D3D12_DESCRIPTOR_RANGE_TYPE_SRV;
            srvRange.NumDescriptors = 1;
            srvRange.BaseShaderRegister = 0;
            srvRange.RegisterSpace = 0;
            srvRange.OffsetInDescriptorsFromTableStart = D3D12_DESCRIPTOR_RANGE_OFFSET_APPEND;

            D3D12_ROOT_PARAMETER rootParameters[2]{};
            rootParameters[0].ParameterType = D3D12_ROOT_PARAMETER_TYPE_CBV;
            rootParameters[0].Descriptor.ShaderRegister = 0;
            rootParameters[0].Descriptor.RegisterSpace = 0;
            rootParameters[0].ShaderVisibility = D3D12_SHADER_VISIBILITY_ALL;

            rootParameters[1].ParameterType = D3D12_ROOT_PARAMETER_TYPE_DESCRIPTOR_TABLE;
            rootParameters[1].DescriptorTable.NumDescriptorRanges = 1;
            rootParameters[1].DescriptorTable.pDescriptorRanges = &srvRange;
            rootParameters[1].ShaderVisibility = D3D12_SHADER_VISIBILITY_PIXEL;

            D3D12_STATIC_SAMPLER_DESC sampler{};
            sampler.Filter = D3D12_FILTER_MIN_MAG_MIP_LINEAR;
            sampler.AddressU = D3D12_TEXTURE_ADDRESS_MODE_WRAP;
            sampler.AddressV = D3D12_TEXTURE_ADDRESS_MODE_WRAP;
            sampler.AddressW = D3D12_TEXTURE_ADDRESS_MODE_WRAP;
            sampler.MipLODBias = 0.0f;
            sampler.MaxAnisotropy = 1;
            sampler.ComparisonFunc = D3D12_COMPARISON_FUNC_ALWAYS;
            sampler.BorderColor = D3D12_STATIC_BORDER_COLOR_OPAQUE_BLACK;
            sampler.MinLOD = 0.0f;
            sampler.MaxLOD = D3D12_FLOAT32_MAX;
            sampler.ShaderRegister = 0;
            sampler.RegisterSpace = 0;
            sampler.ShaderVisibility = D3D12_SHADER_VISIBILITY_PIXEL;

            D3D12_ROOT_SIGNATURE_DESC rootDesc{};
            rootDesc.NumParameters = static_cast<UINT>(std::size(rootParameters));
            rootDesc.pParameters = rootParameters;
            rootDesc.NumStaticSamplers = 1;
            rootDesc.pStaticSamplers = &sampler;
            rootDesc.Flags = D3D12_ROOT_SIGNATURE_FLAG_ALLOW_INPUT_ASSEMBLER_INPUT_LAYOUT;

            ComPtr<ID3DBlob> serializedRoot;
            ComPtr<ID3DBlob> rootErrors;
            const HRESULT serializeHr = D3D12SerializeRootSignature(
                &rootDesc,
                D3D_ROOT_SIGNATURE_VERSION_1,
                serializedRoot.GetAddressOf(),
                rootErrors.GetAddressOf());
            if (FAILED(serializeHr))
            {
                std::string message = "D3D12SerializeRootSignature failed.";
                if (rootErrors)
                {
                    message.append("\n");
                    message.append(static_cast<const char*>(rootErrors->GetBufferPointer()), rootErrors->GetBufferSize());
                }
                throw std::runtime_error(message);
            }

            ThrowIfFailed(
                m_device->CreateRootSignature(
                    0,
                    serializedRoot->GetBufferPointer(),
                    serializedRoot->GetBufferSize(),
                    IID_PPV_ARGS(m_rootSignature.GetAddressOf())),
                "CreateRootSignature failed.");

            // PipelineStateObject
            const auto shaderPath = GetShaderPath();
            const ComPtr<ID3DBlob> vertexShader = CompileShader(shaderPath, "VSMain", "vs_5_1");
            const ComPtr<ID3DBlob> pixelShader = CompileShader(shaderPath, "PSMain", "ps_5_1");

            constexpr D3D12_INPUT_ELEMENT_DESC inputLayout[] =
            {
                { "POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT, 0, offsetof(Vertex, position), D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },
                { "COLOR",    0, DXGI_FORMAT_R32G32B32A32_FLOAT, 0, offsetof(Vertex, color), D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },
                { "TEXCOORD", 0, DXGI_FORMAT_R32G32_FLOAT,   0, offsetof(Vertex, uv),       D3D12_INPUT_CLASSIFICATION_PER_VERTEX_DATA, 0 },
            };

            D3D12_RASTERIZER_DESC rasterizer{};
            rasterizer.FillMode = D3D12_FILL_MODE_SOLID;
            rasterizer.CullMode = D3D12_CULL_MODE_NONE;
            rasterizer.FrontCounterClockwise = FALSE;
            rasterizer.DepthBias = D3D12_DEFAULT_DEPTH_BIAS;
            rasterizer.DepthBiasClamp = D3D12_DEFAULT_DEPTH_BIAS_CLAMP;
            rasterizer.SlopeScaledDepthBias = D3D12_DEFAULT_SLOPE_SCALED_DEPTH_BIAS;
            rasterizer.DepthClipEnable = TRUE;
            rasterizer.MultisampleEnable = FALSE;
            rasterizer.AntialiasedLineEnable = FALSE;
            rasterizer.ForcedSampleCount = 0;
            rasterizer.ConservativeRaster = D3D12_CONSERVATIVE_RASTERIZATION_MODE_OFF;

            D3D12_BLEND_DESC opaqueBlend{};
            opaqueBlend.AlphaToCoverageEnable = FALSE;
            opaqueBlend.IndependentBlendEnable = FALSE;
            D3D12_RENDER_TARGET_BLEND_DESC renderTargetBlend{};
            renderTargetBlend.BlendEnable = FALSE;
            renderTargetBlend.LogicOpEnable = FALSE;
            renderTargetBlend.SrcBlend = D3D12_BLEND_ONE;
            renderTargetBlend.DestBlend = D3D12_BLEND_ZERO;
            renderTargetBlend.BlendOp = D3D12_BLEND_OP_ADD;
            renderTargetBlend.SrcBlendAlpha = D3D12_BLEND_ONE;
            renderTargetBlend.DestBlendAlpha = D3D12_BLEND_ZERO;
            renderTargetBlend.BlendOpAlpha = D3D12_BLEND_OP_ADD;
            renderTargetBlend.LogicOp = D3D12_LOGIC_OP_NOOP;
            renderTargetBlend.RenderTargetWriteMask = D3D12_COLOR_WRITE_ENABLE_ALL;
            for (auto& target : opaqueBlend.RenderTarget)
            {
                target = renderTargetBlend;
            }

            D3D12_DEPTH_STENCIL_DESC depthStencil{};
            depthStencil.DepthEnable = TRUE;
            depthStencil.DepthWriteMask = D3D12_DEPTH_WRITE_MASK_ALL;
            depthStencil.DepthFunc = D3D12_COMPARISON_FUNC_LESS;
            depthStencil.StencilEnable = FALSE;
            depthStencil.StencilReadMask = D3D12_DEFAULT_STENCIL_READ_MASK;
            depthStencil.StencilWriteMask = D3D12_DEFAULT_STENCIL_WRITE_MASK;
            depthStencil.FrontFace = { D3D12_STENCIL_OP_KEEP, D3D12_STENCIL_OP_KEEP, D3D12_STENCIL_OP_KEEP, D3D12_COMPARISON_FUNC_ALWAYS };
            depthStencil.BackFace = depthStencil.FrontFace;

            D3D12_GRAPHICS_PIPELINE_STATE_DESC pso{};
            pso.pRootSignature = m_rootSignature.Get();
            pso.VS = { vertexShader->GetBufferPointer(), vertexShader->GetBufferSize() };
            pso.PS = { pixelShader->GetBufferPointer(), pixelShader->GetBufferSize() };
            pso.BlendState = opaqueBlend;
            pso.SampleMask = UINT_MAX;
            pso.RasterizerState = rasterizer;
            pso.DepthStencilState = depthStencil;
            pso.InputLayout = { inputLayout, static_cast<UINT>(std::size(inputLayout)) };
            pso.PrimitiveTopologyType = D3D12_PRIMITIVE_TOPOLOGY_TYPE_TRIANGLE;
            pso.NumRenderTargets = 1;
            pso.RTVFormats[0] = DXGI_FORMAT_R8G8B8A8_UNORM;
            pso.DSVFormat = DXGI_FORMAT_D24_UNORM_S8_UINT;
            pso.SampleDesc.Count = 1;

            // Opaque PSO
            ThrowIfFailed(
                m_device->CreateGraphicsPipelineState(&pso, IID_PPV_ARGS(m_opaquePipelineState.GetAddressOf())),
                "Create opaque PSO failed.");

            // Alpha Blend PSO
            // DX12 では BlendState だけを OM に後付けするのではなく、Blend を含んだ別 PSO を作ります。
            D3D12_GRAPHICS_PIPELINE_STATE_DESC alphaPso = pso;
            auto& alphaTarget = alphaPso.BlendState.RenderTarget[0];
            alphaTarget.BlendEnable = TRUE;
            alphaTarget.SrcBlend = D3D12_BLEND_SRC_ALPHA;
            alphaTarget.DestBlend = D3D12_BLEND_INV_SRC_ALPHA;
            alphaTarget.BlendOp = D3D12_BLEND_OP_ADD;
            alphaTarget.SrcBlendAlpha = D3D12_BLEND_ONE;
            alphaTarget.DestBlendAlpha = D3D12_BLEND_ZERO;
            alphaTarget.BlendOpAlpha = D3D12_BLEND_OP_ADD;
            alphaPso.DepthStencilState.DepthWriteMask = D3D12_DEPTH_WRITE_MASK_ZERO;
            ThrowIfFailed(
                m_device->CreateGraphicsPipelineState(&alphaPso, IID_PPV_ARGS(m_alphaBlendPipelineState.GetAddressOf())),
                "Create alpha blend PSO failed.");

            // Present PSO
            // Fullscreen Quad 用 PSO では Depth を無効化します。
            D3D12_GRAPHICS_PIPELINE_STATE_DESC presentPso = pso;
            presentPso.DepthStencilState.DepthEnable = FALSE;
            presentPso.DepthStencilState.DepthWriteMask = D3D12_DEPTH_WRITE_MASK_ZERO;
            presentPso.DSVFormat = DXGI_FORMAT_UNKNOWN;
            ThrowIfFailed(
                m_device->CreateGraphicsPipelineState(&presentPso, IID_PPV_ARGS(m_presentPipelineState.GetAddressOf())),
                "Create present PSO failed.");
        }

        void CreateDepthBuffer()
        {
            // Depth resource + DSV
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

            D3D12_CLEAR_VALUE clearValue{};
            clearValue.Format = DXGI_FORMAT_D24_UNORM_S8_UINT;
            clearValue.DepthStencil.Depth = 1.0f;
            clearValue.DepthStencil.Stencil = 0;
            const auto heap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);

            ThrowIfFailed(
                m_device->CreateCommittedResource(
                    &heap,
                    D3D12_HEAP_FLAG_NONE,
                    &depthDesc,
                    D3D12_RESOURCE_STATE_DEPTH_WRITE,
                    &clearValue,
                    IID_PPV_ARGS(m_depthBuffer.GetAddressOf())),
                "Create depth resource failed.");
            m_device->CreateDepthStencilView(m_depthBuffer.Get(), nullptr, m_dsvHeap->GetCPUDescriptorHandleForHeapStart());

        }

        void CreateOffscreenRenderTarget()
        {
            // Offscreen RenderTarget Resource
            D3D12_RESOURCE_DESC sceneDesc{};
            sceneDesc.Dimension = D3D12_RESOURCE_DIMENSION_TEXTURE2D;
            sceneDesc.Width = kClientWidth;
            sceneDesc.Height = kClientHeight;
            sceneDesc.DepthOrArraySize = 1;
            sceneDesc.MipLevels = 1;
            sceneDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
            sceneDesc.SampleDesc.Count = 1;
            sceneDesc.Layout = D3D12_TEXTURE_LAYOUT_UNKNOWN;
            sceneDesc.Flags = D3D12_RESOURCE_FLAG_ALLOW_RENDER_TARGET;

            D3D12_CLEAR_VALUE clearValue{};
            clearValue.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
            clearValue.Color[0] = 24.0f / 255.0f;
            clearValue.Color[1] = 31.0f / 255.0f;
            clearValue.Color[2] = 42.0f / 255.0f;
            clearValue.Color[3] = 1.0f;

            const auto defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);
            ThrowIfFailed(
                m_device->CreateCommittedResource(
                    &defaultHeap,
                    D3D12_HEAP_FLAG_NONE,
                    &sceneDesc,
                    D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE,
                    &clearValue,
                    IID_PPV_ARGS(m_sceneTexture.GetAddressOf())),
                "Create offscreen render target failed.");

            // RTV Descriptor
            D3D12_CPU_DESCRIPTOR_HANDLE sceneRtv = m_rtvHeap->GetCPUDescriptorHandleForHeapStart();
            sceneRtv.ptr += static_cast<SIZE_T>(kFrameCount) * m_rtvDescriptorSize;
            m_device->CreateRenderTargetView(m_sceneTexture.Get(), nullptr, sceneRtv);

            // SRV Descriptor
            D3D12_SHADER_RESOURCE_VIEW_DESC sceneSrvDesc{};
            sceneSrvDesc.Shader4ComponentMapping = D3D12_DEFAULT_SHADER_4_COMPONENT_MAPPING;
            sceneSrvDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
            sceneSrvDesc.ViewDimension = D3D12_SRV_DIMENSION_TEXTURE2D;
            sceneSrvDesc.Texture2D.MipLevels = 1;

            D3D12_CPU_DESCRIPTOR_HANDLE sceneSrv = m_srvHeap->GetCPUDescriptorHandleForHeapStart();
            sceneSrv.ptr += static_cast<SIZE_T>(m_srvDescriptorSize);
            m_device->CreateShaderResourceView(m_sceneTexture.Get(), &sceneSrvDesc, sceneSrv);
        }

        void CreateDefaultBuffer(
            const void* sourceData,
            UINT64 byteSize,
            D3D12_RESOURCE_STATES finalState,
            ComPtr<ID3D12Resource>& defaultBuffer,
            ComPtr<ID3D12Resource>& uploadBuffer)
        {
            // UploadHeap -> DefaultHeap copy
            // UploadHeap から DefaultHeap へ Buffer データをコピーします。
            const auto defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);
            const auto uploadHeap = HeapProperties(D3D12_HEAP_TYPE_UPLOAD);
            const auto bufferDesc = BufferDescription(byteSize);

            ThrowIfFailed(
                m_device->CreateCommittedResource(
                    &defaultHeap,
                    D3D12_HEAP_FLAG_NONE,
                    &bufferDesc,
                    D3D12_RESOURCE_STATE_COPY_DEST,
                    nullptr,
                    IID_PPV_ARGS(defaultBuffer.GetAddressOf())),
                "Create default buffer failed.");
            ThrowIfFailed(
                m_device->CreateCommittedResource(
                    &uploadHeap,
                    D3D12_HEAP_FLAG_NONE,
                    &bufferDesc,
                    D3D12_RESOURCE_STATE_GENERIC_READ,
                    nullptr,
                    IID_PPV_ARGS(uploadBuffer.GetAddressOf())),
                "Create upload buffer failed.");

            void* mapped = nullptr;
            D3D12_RANGE readRange{ 0, 0 };
            ThrowIfFailed(uploadBuffer->Map(0, &readRange, &mapped), "Upload buffer Map failed.");
            std::memcpy(mapped, sourceData, static_cast<std::size_t>(byteSize));
            uploadBuffer->Unmap(0, nullptr);

            m_commandList->CopyBufferRegion(defaultBuffer.Get(), 0, uploadBuffer.Get(), 0, byteSize);
            auto barrier = TransitionBarrier(defaultBuffer.Get(), D3D12_RESOURCE_STATE_COPY_DEST, finalState);
            m_commandList->ResourceBarrier(1, &barrier);
        }

        void CreateSceneResources()
        {
            m_geometry = BuildSceneGeometry();

            // Viewport / Scissor
            m_viewport = { 0.0f, 0.0f, static_cast<float>(kClientWidth), static_cast<float>(kClientHeight), 0.0f, 1.0f };
            m_scissorRect = { 0, 0, static_cast<LONG>(kClientWidth), static_cast<LONG>(kClientHeight) };

            // Vertex / Index buffers
            const UINT64 vertexBytes = m_geometry.vertices.size() * sizeof(Vertex);
            CreateDefaultBuffer(
                m_geometry.vertices.data(),
                vertexBytes,
                D3D12_RESOURCE_STATE_VERTEX_AND_CONSTANT_BUFFER,
                m_vertexBuffer,
                m_vertexUpload);
            m_vertexBufferView.BufferLocation = m_vertexBuffer->GetGPUVirtualAddress();
            m_vertexBufferView.SizeInBytes = static_cast<UINT>(vertexBytes);
            m_vertexBufferView.StrideInBytes = sizeof(Vertex);

            const UINT64 indexBytes = m_geometry.indices.size() * sizeof(std::uint16_t);
            CreateDefaultBuffer(
                m_geometry.indices.data(),
                indexBytes,
                D3D12_RESOURCE_STATE_INDEX_BUFFER,
                m_indexBuffer,
                m_indexUpload);
            m_indexBufferView.BufferLocation = m_indexBuffer->GetGPUVirtualAddress();
            m_indexBufferView.SizeInBytes = static_cast<UINT>(indexBytes);
            m_indexBufferView.Format = DXGI_FORMAT_R16_UINT;

            // Per-object ConstantBuffer
            // Root CBV は 256 byte alignment が必要です。複数 Draw が同じ GPU address を使うと
            // 最後に書いた値だけが見えるため、object ごとに独立した 256 byte slot を確保します。
            const UINT64 constantBytes = static_cast<UINT64>(kConstantBufferStride) * kObjectCount;
            const auto uploadHeap = HeapProperties(D3D12_HEAP_TYPE_UPLOAD);
            const auto constantDesc = BufferDescription(constantBytes);
            ThrowIfFailed(
                m_device->CreateCommittedResource(
                    &uploadHeap,
                    D3D12_HEAP_FLAG_NONE,
                    &constantDesc,
                    D3D12_RESOURCE_STATE_GENERIC_READ,
                    nullptr,
                    IID_PPV_ARGS(m_constantBuffer.GetAddressOf())),
                "Create constant buffer failed.");

            D3D12_RANGE noRead{ 0, 0 };
            ThrowIfFailed(
                m_constantBuffer->Map(0, &noRead, reinterpret_cast<void**>(&m_mappedConstants)),
                "ConstantBuffer::Map failed.");

            // PNG Texture DefaultHeap + UploadHeap
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

            const auto defaultHeap = HeapProperties(D3D12_HEAP_TYPE_DEFAULT);
            ThrowIfFailed(
                m_device->CreateCommittedResource(
                    &defaultHeap,
                    D3D12_HEAP_FLAG_NONE,
                    &textureDesc,
                    D3D12_RESOURCE_STATE_COPY_DEST,
                    nullptr,
                    IID_PPV_ARGS(m_texture.GetAddressOf())),
                "Create texture resource failed.");

            D3D12_PLACED_SUBRESOURCE_FOOTPRINT footprint{};
            UINT numRows = 0;
            UINT64 rowSize = 0;
            UINT64 uploadSize = 0;
            m_device->GetCopyableFootprints(&textureDesc, 0, 1, 0, &footprint, &numRows, &rowSize, &uploadSize);

            const auto textureUploadDesc = BufferDescription(uploadSize);
            ThrowIfFailed(
                m_device->CreateCommittedResource(
                    &uploadHeap,
                    D3D12_HEAP_FLAG_NONE,
                    &textureUploadDesc,
                    D3D12_RESOURCE_STATE_GENERIC_READ,
                    nullptr,
                    IID_PPV_ARGS(m_textureUpload.GetAddressOf())),
                "Create texture upload resource failed.");

            std::uint8_t* mappedTexture = nullptr;
            ThrowIfFailed(
                m_textureUpload->Map(0, &noRead, reinterpret_cast<void**>(&mappedTexture)),
                "TextureUpload::Map failed.");
            const UINT sourceRowPitch = image.width * 4;
            for (UINT y = 0; y < numRows; ++y)
            {
                std::memcpy(
                    mappedTexture + footprint.Offset + static_cast<SIZE_T>(y) * footprint.Footprint.RowPitch,
                    image.pixels.data() + static_cast<SIZE_T>(y) * sourceRowPitch,
                    sourceRowPitch);
            }
            m_textureUpload->Unmap(0, nullptr);

            D3D12_TEXTURE_COPY_LOCATION destination{};
            destination.pResource = m_texture.Get();
            destination.Type = D3D12_TEXTURE_COPY_TYPE_SUBRESOURCE_INDEX;
            destination.SubresourceIndex = 0;

            D3D12_TEXTURE_COPY_LOCATION source{};
            source.pResource = m_textureUpload.Get();
            source.Type = D3D12_TEXTURE_COPY_TYPE_PLACED_FOOTPRINT;
            source.PlacedFootprint = footprint;
            m_commandList->CopyTextureRegion(&destination, 0, 0, 0, &source, nullptr);

            auto textureBarrier = TransitionBarrier(
                m_texture.Get(),
                D3D12_RESOURCE_STATE_COPY_DEST,
                D3D12_RESOURCE_STATE_PIXEL_SHADER_RESOURCE);
            m_commandList->ResourceBarrier(1, &textureBarrier);

            D3D12_SHADER_RESOURCE_VIEW_DESC srv{};
            srv.Shader4ComponentMapping = D3D12_DEFAULT_SHADER_4_COMPONENT_MAPPING;
            srv.Format = DXGI_FORMAT_B8G8R8A8_UNORM;
            srv.ViewDimension = D3D12_SRV_DIMENSION_TEXTURE2D;
            srv.Texture2D.MipLevels = 1;
            m_device->CreateShaderResourceView(m_texture.Get(), &srv, m_srvHeap->GetCPUDescriptorHandleForHeapStart());
        }

        void DrawObject(
            UINT objectIndex,
            const DrawRange& range,
            FXMMATRIX world,
            FXMMATRIX view,
            FXMMATRIX projection)
        {
            // ConstantBuffer slot + Root CBV
            SceneConstants constants{};
            XMStoreFloat4x4(&constants.worldViewProjection, XMMatrixTranspose(world * view * projection));

            std::uint8_t* destination = m_mappedConstants + static_cast<SIZE_T>(objectIndex) * kConstantBufferStride;
            std::memcpy(destination, &constants, sizeof(constants));

            const D3D12_GPU_VIRTUAL_ADDRESS address =
                m_constantBuffer->GetGPUVirtualAddress() + static_cast<UINT64>(objectIndex) * kConstantBufferStride;
            m_commandList->SetGraphicsRootConstantBufferView(0, address);
            m_commandList->DrawIndexedInstanced(range.indexCount, 1, range.startIndex, 0, 0);
        }

        void WaitForGpu()
        {
            // Fence signal / wait
            const UINT64 signalValue = ++m_fenceValue;
            ThrowIfFailed(m_commandQueue->Signal(m_fence.Get(), signalValue), "CommandQueue::Signal failed.");

            if (m_fence->GetCompletedValue() < signalValue)
            {
                ThrowIfFailed(m_fence->SetEventOnCompletion(signalValue, m_fenceEvent), "Fence::SetEventOnCompletion failed.");
                WaitForSingleObject(m_fenceEvent, INFINITE);
            }
        }

        bool m_debugLayerEnabled = false;
        ComPtr<IDXGIFactory6> m_factory;
        ComPtr<ID3D12Device> m_device;
        ComPtr<ID3D12CommandQueue> m_commandQueue;
        ComPtr<IDXGISwapChain3> m_swapChain;
        std::array<ComPtr<ID3D12Resource>, kFrameCount> m_renderTargets;

        ComPtr<ID3D12DescriptorHeap> m_rtvHeap;
        ComPtr<ID3D12DescriptorHeap> m_dsvHeap;
        ComPtr<ID3D12DescriptorHeap> m_srvHeap;
        UINT m_rtvDescriptorSize = 0;
        UINT m_srvDescriptorSize = 0;
        UINT m_frameIndex = 0;

        ComPtr<ID3D12CommandAllocator> m_commandAllocator;
        ComPtr<ID3D12GraphicsCommandList> m_commandList;
        ComPtr<ID3D12RootSignature> m_rootSignature;
        ComPtr<ID3D12PipelineState> m_opaquePipelineState;
        ComPtr<ID3D12PipelineState> m_alphaBlendPipelineState;
        ComPtr<ID3D12PipelineState> m_presentPipelineState;

        ComPtr<ID3D12Resource> m_depthBuffer;
        ComPtr<ID3D12Resource> m_sceneTexture;
        ComPtr<ID3D12Resource> m_vertexBuffer;
        ComPtr<ID3D12Resource> m_vertexUpload;
        ComPtr<ID3D12Resource> m_indexBuffer;
        ComPtr<ID3D12Resource> m_indexUpload;
        ComPtr<ID3D12Resource> m_texture;
        ComPtr<ID3D12Resource> m_textureUpload;
        ComPtr<ID3D12Resource> m_constantBuffer;
        std::uint8_t* m_mappedConstants = nullptr;

        D3D12_VERTEX_BUFFER_VIEW m_vertexBufferView{};
        D3D12_INDEX_BUFFER_VIEW m_indexBufferView{};
        D3D12_VIEWPORT m_viewport{};
        D3D12_RECT m_scissorRect{};
        SceneGeometry m_geometry;
        ProjectionMode m_projectionMode = ProjectionMode::Perspective3D;

        ComPtr<ID3D12Fence> m_fence;
        UINT64 m_fenceValue = 0;
        HANDLE m_fenceEvent = nullptr;
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
        MessageBoxA(nullptr, exception.what(), "DX12 Preview Error", MB_OK | MB_ICONERROR);
        return -1;
    }
}

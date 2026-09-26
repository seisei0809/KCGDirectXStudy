#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>

// TODO 01: DirectX 11 の include / using / pragma をここに追加する。

namespace
{
    constexpr UINT kClientWidth = 1280;
    constexpr UINT kClientHeight = 720;
    constexpr wchar_t kWindowClassName[] = L"KCGDirectXStudyDX11Practice";
    constexpr wchar_t kWindowTitle[] = L"KCG DirectX Study - DirectX 11 Practice";

    // TODO 02: ProjectionMode / ViewProjectionMatrices をここに追加する。
    // TODO 03: ImageData をここに追加する。
    // TODO 04: Vertex をここに追加する。
    // TODO 05: DrawRange / SceneGeometry をここに追加する。
    // TODO HELPER: Helper / Geometry 関数をここに追加する。
    // TODO 06: Renderer の枠をここに追加する。

    // --------------------
    // Window procedure
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

    // --------------------
    // Window creation
    // --------------------
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
    const HWND hwnd = CreateMainWindow(instance);
    if (!hwnd)
    {
        MessageBoxW(nullptr, L"Window creation failed.", L"DirectX 11 Practice Error", MB_OK | MB_ICONERROR);
        return -1;
    }

    // TODO: DirectX 11 の初期化をここに追加する。

    MSG message{};
    while (message.message != WM_QUIT)
    {
        if (PeekMessageW(&message, nullptr, 0, 0, PM_REMOVE))
        {
            TranslateMessage(&message);
            DispatchMessageW(&message);
            continue;
        }

        // TODO: DirectX 11 の入力・描画をここに追加する。
        WaitMessage();
    }

    // TODO: DirectX 11 の終了処理をここに追加する。
    return static_cast<int>(message.wParam);
}

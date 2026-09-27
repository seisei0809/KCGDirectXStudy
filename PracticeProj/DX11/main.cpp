#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>

// 進め方
//   1. ブラウザで docs/reference.html を開き、上のタブで「DirectX 11」を選ぶ。
//   2. Reference の手順を上から順に進める。書く場所は「TODO 1」「TODO: CreateDevice」のような
//      文字で示されるので、Ctrl + F で検索して見つける。
//   3. コードはコピー＆ペーストせず、見本を見ながら自分で入力する（コメントも書き写す）。
//   4. 1手順書くごとに Ctrl + Shift + B でビルドし、エラーが 0 件なのを確かめてから次へ進む。

// TODO 1: include などの宣言。この行を消して、ここに書く。

namespace
{
    constexpr UINT kClientWidth = 1280;
    constexpr UINT kClientHeight = 720;
    constexpr wchar_t kWindowClassName[] = L"KCGDirectXStudyDX11Practice";
    constexpr wchar_t kWindowTitle[] = L"KCG DirectX Study - DirectX 11 Practice";

    // ---------- データの型 ----------

    // TODO 2: データの型。この行を消して、ここに書く。

    // ---------- 補助関数 ----------

    // TODO 3: 補助関数は、この行のすぐ上へ順番に書き足していく。この行は最後まで消さない。

    // ---------- Renderer ----------

    // TODO 4: Renderer クラス。この行を消して、ここに書く。

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

// TODO 5: この行から下（wWinMain 全体）を消して、ここに書き直す。
int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int)
{
    const HWND hwnd = CreateMainWindow(instance);
    if (!hwnd)
    {
        MessageBoxW(nullptr, L"Window creation failed.", kWindowTitle, MB_OK | MB_ICONERROR);
        return -1;
    }

    // まだ DirectX は使っていない。ウィンドウが閉じられるまでメッセージを処理するだけ。
    MSG message{};
    while (GetMessageW(&message, nullptr, 0, 0) > 0)
    {
        TranslateMessage(&message);
        DispatchMessageW(&message);
    }
    return static_cast<int>(message.wParam);
}

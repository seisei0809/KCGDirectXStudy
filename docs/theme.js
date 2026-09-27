// ダーク / ライトの切り替え。既定はダーク。選んだ方はこのブラウザに保存する。
// ページが一瞬白く光らないよう、<head> の中で読み込む。
(function () {
  const KEY = "kcg-directx-theme";
  let theme = "dark";
  try {
    theme = localStorage.getItem(KEY) === "light" ? "light" : "dark";
  } catch {
    // 保存できない環境では毎回ダークで表示する。
  }
  document.documentElement.dataset.theme = theme;

  function label() {
    return document.documentElement.dataset.theme === "dark" ? "☀ ライト" : "☾ ダーク";
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.textContent = label();
      button.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(KEY, next);
        } catch {
          // 保存できなくても切り替えは行う。
        }
        document.querySelectorAll("[data-theme-toggle]").forEach(other => { other.textContent = label(); });
      });
    });
  });
})();

// include.js
async function loadHTML(id, file) {
  const container = document.getElementById(id);
  if (!container) {
    console.warn(`container "${id}" が見つかりません。 file=${file}`);
    return false;
  }
  try {
    const res = await fetch(file, { cache: "no-cache" });
    if (!res.ok)
      throw new Error(`${file} を取得できませんでした (${res.status})`);
    const text = await res.text();
    container.innerHTML = text;
    return true;
  } catch (err) {
    console.error("loadHTML error:", err);
    container.innerHTML = `<div style="color:#c00;padding:8px;">読み込みエラー: ${file}</div>`;
    return false;
  }
}

// 共通パーツ読み込み
document.addEventListener("DOMContentLoaded", () => {
  const loadPartials = async () => {
    const includes = document.querySelectorAll("[data-include]");
    for (const el of includes) {
      const file = el.getAttribute("data-include");
      if (!file) continue;

      try {
        const response = await fetch(file, { cache: "no-cache" });
        if (!response.ok)
          throw new Error(`${file} を取得できません (${response.status})`);

        const html = await response.text();
        el.innerHTML = html;

        // === terminal.html 読み込み検知 ===
        if (file.includes("terminal.html")) {
          const script = document.createElement("script");
          script.src = "assets/js/terminal.js";
          script.defer = true;
          document.body.appendChild(script);
        }
      } catch (err) {
        console.error("loadPartials error:", err);
        el.innerHTML = "読み込みエラー";
      }
    }

    // ヘッダーが読み込まれたあとに menu.js を初期化
    if (window.initHamburgerMenu) {
      window.initHamburgerMenu();
    }
  };

  loadPartials();
});

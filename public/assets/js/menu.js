// グローバル関数として公開（include.jsから呼び出すため）
window.initHamburgerMenu = () => {
  const hamburger = document.querySelector(".hamburger-overlay");
  const nav = document.querySelector(".nav-overlay");

  if (!hamburger || !nav) return;

  // ハンバーガーボタン押下
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    nav.classList.toggle("active");

    const isOpen = hamburger.classList.contains("active");
    hamburger.setAttribute("aria-expanded", isOpen);
    nav.setAttribute("aria-hidden", !isOpen);

    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // ESCキーで閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("active")) {
      hamburger.classList.remove("active");
      nav.classList.remove("active");
      hamburger.setAttribute("aria-expanded", false);
      nav.setAttribute("aria-hidden", true);
      document.body.style.overflow = "";
    }
  });

  // メニューのリンククリックで閉じる
  document.querySelectorAll(".nav-overlay__link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      nav.classList.remove("active");
      hamburger.setAttribute("aria-expanded", false);
      nav.setAttribute("aria-hidden", true);
      document.body.style.overflow = "";
    });
  });
};

// LINE バナーのスクロール制御
function initLineBanner() {
  const lineBanner = document.querySelector(".line-banner");
  const scrollThreshold = 100; // 100pxスクロールしたら表示

  if (!lineBanner) {
    // バナーがまだ読み込まれていない場合は少し待つ
    setTimeout(initLineBanner, 100);
    return;
  }

  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > scrollThreshold) {
      // 下にスクロールしたら表示
      lineBanner.classList.add("visible");
    } else {
      // 最上部に戻ったら非表示
      lineBanner.classList.remove("visible");
    }
  }

  // スクロールイベント
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // 初回チェック
  handleScroll();
}

// DOMContentLoadedとwindow.onloadの両方で試行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLineBanner);
} else {
  initLineBanner();
}

window.addEventListener("load", initLineBanner);

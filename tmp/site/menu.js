// ハンバーガーメニューのクリックイベント
document.querySelector('.humburger').addEventListener('click', function() {
    const sideMenu = document.querySelector('.side-menu');
    const frame7 = document.querySelector('.frame-7');
    
    // サイドメニューを表示・非表示にする
    sideMenu.classList.toggle('open');
    
    // バナーの位置を変更（サイドメニューが開くとき）
    if (sideMenu.classList.contains('open')) {
      frame7.style.right = '285px'; // サイドメニューが開くときに右に移動（35px + 200px）
    } else {
      frame7.style.right = '35px'; // サイドメニューが閉じたときに元に戻す
    }
  });
  
  // サイドメニュー以外の部分がクリックされたときにメニューを隠す
  document.addEventListener('click', function(event) {
    const sideMenu = document.querySelector('.side-menu');
    const humburger = document.querySelector('.humburger');
    if (!sideMenu.contains(event.target) && !humburger.contains(event.target)) {
      sideMenu.classList.remove('open');
      document.querySelector('.frame-7').style.right = '35px'; // バナーを元に戻す
    }
  });
  
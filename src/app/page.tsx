"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
  useEffect(() => {
    // ハンバーガーメニューのクリックイベント
    const hamburger = document.querySelector(".humburger");
    const sideMenu = document.querySelector(".side-menu");
    const frame7 = document.querySelector(".frame-7") as HTMLElement;

    if (hamburger && sideMenu && frame7) {
      hamburger.addEventListener("click", function () {
        // サイドメニューを表示・非表示にする
        sideMenu.classList.toggle("open");

        // バナーの位置を変更（サイドメニューが開くとき）
        if (sideMenu.classList.contains("open")) {
          frame7.style.right = "285px"; // サイドメニューが開くときに右に移動（35px + 200px）
        } else {
          frame7.style.right = "35px"; // サイドメニューが閉じたときに元に戻す
        }
      });

      // サイドメニュー以外の部分がクリックされたときにメニューを隠す
      document.addEventListener("click", function (event) {
        if (
          !sideMenu.contains(event.target as Node) &&
          !hamburger.contains(event.target as Node)
        ) {
          sideMenu.classList.remove("open");
          if (frame7) {
            frame7.style.right = "35px"; // バナーを元に戻す
          }
        }
      });
    }
  }, []);

  return (
    <>
      <div className="background"></div>
      <div className="frame-7">
        <div className="frame-6">
          <div className="line">
            <span>
              <span className="line-span">
                予約はこちらから！
                <br />
              </span>
              <span className="line-span2">（公式LINEに移動します）</span>
            </span>
          </div>
          <Image
            className="frame"
            src="./frame0.svg"
            alt="予約アイコン"
            width={24}
            height={24}
          />
        </div>
      </div>

      <header>
        <div className="header">
          <Image
            className="humburger"
            src="./humburger0.svg"
            alt="メニュー"
            width={24}
            height={24}
          />
          <div className="div">顔シューティング（仮）</div>
        </div>
        {/* ハンバーガーメニューが開いたときに表示されるメニュー */}
        <div className="side-menu">
          <ul>
            <li>
              <a
                href="https://www.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                トップ
              </a>
            </li>
            <li>
              <a
                href="https://www.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                もっと詳しく
              </a>
            </li>
            <li>
              <a
                href="https://www.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                プレイする人へ
              </a>
            </li>
            <li>
              <a href="/api-docs">
                API ドキュメント
              </a>
            </li>
            <li>
              <a
                href="https://www.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                クレジット
              </a>
            </li>
          </ul>
        </div>
      </header>

      <div className="big-logos">
        <div className="frame-2">
          <div className="rectangle-1"></div>
          <div className="div2">でかめのロゴ</div>
        </div>
        <div className="_2-i">2I 顔シューティング(仮)!!</div>
      </div>

      <div className="div3">
        説明文をここに入力する
        <br />
        ああああああああ
        <br />
        ダミーテキスト
        <br />
        <br />
        ダミーテキスト１
        <br />
        aiueoaiueoaiueo
        <br />
        <br />
        ダミーテキスト２
        <br />
        いろはにほへとちりぬるを
        <br />
        <br />
        あのイーハトーヴォの透き通った風
        <br />
        こんにちは
      </div>

      <div className="buttons">
        <a href="https://www.google.com" className="kuwasiku">
          <div className="div4">もっと詳しく</div>
          <Image
            className="frame2"
            src="./frame1.svg"
            alt="矢印"
            width={20}
            height={20}
          />
        </a>
        <a href="https://www.yahoo.co.jp" className="for-players">
          <div className="div4">プレイする人へ</div>
          <Image
            className="frame3"
            src="./frame2.svg"
            alt="矢印"
            width={20}
            height={20}
          />
        </a>
      </div>

      <div className="information">
        <div className="frame-8">
          <p>ここの文章は、文化祭直前にリセットします👍️</p>
          <p>＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</p>
          <p>04/26 Webサイトプロト版公開</p>
          <p>
            04/27
            スクロールの不具合修正・ハンバーガーメニューの追加・全体的な軽量化
          </p>
          <p>04/28 デザインの調整・一部ボタンにアニメーションを追加</p>
        </div>
        <div className="div6">インフォメーション</div>
      </div>

      <div className="maps">
        <div className="frame-82">
          <div className="rectangle-2"></div>
          <div className="div5">地図画像</div>
        </div>
        <div className="div7">マップ</div>
      </div>
    </>
  );
}

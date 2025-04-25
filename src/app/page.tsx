//import Image from "next/image";
import './style.css'
import './vars.css'

export default function Home() {
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
            <span className="line-span2">（公式LINEにとぶのかな）</span>
          </span>
        </div>
        <img className="frame" src="frame0.svg" />
      </div>
      <div className="ellipse-1"></div>
      <div className="_2">
        <span>
          <span className="_2-span">2</span>
          <span className="_2-span2">
            <br />
          </span>
          <span className="_2-span3">分待ち</span>
        </span>
      </div>
    </div>
    <header>
      <div className="header">
        <img className="humburger" src="humburger0.svg" />
        <div className="div">顔シューティング（仮）</div>
      </div>
    </header>
    <div className="big-logos">
      <div className="frame-2">
        <div className="rectangle-1"></div>
        <div className="div2">でかめのロゴ</div>
      </div>
      <div className="_2-i">2I　顔シューティング！！</div>
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
      なにを書くべきかわからん
      <br />
      <br />
      ダミーテキスト２
      <br />
      そろそろネタがない
      <br />
      <br />
      あのイーハトーヴォの透き通った風
      <br />
      夏でも風にうんたらかんたら
    </div>
    <div className="buttons">
      <div className="kuwasiku">
        <div className="div4">もっと詳しく</div>
        <img className="frame2" src="frame1.svg" />
      </div>
      <div className="for-players">
        <div className="div4">プレイする人へ</div>
        <img className="frame3" src="frame2.svg" />
      </div>
    </div>
    <div className="information">
      <div className="frame-8">
        <div className="rectangle-2"></div>
        <div className="div5">スクロールボックス</div>
      </div>
      <div className="div6">インフォメーション</div>
    </div>
    <div className="maps">
      <div className="frame-82">
        <div className="rectangle-2"></div>
        <div className="div5">スクロールボックス</div>
      </div>
      <div className="div7">インフォメーション</div>
    </div>
    </>
  );
}

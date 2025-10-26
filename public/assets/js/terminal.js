/**
 * パララックス効果の設定
 */
const PARALLAX_CONFIG = {
  GRID_SPEED: -0.3,
  TERMINAL_SPEED: -0.1,
  NARROW_BREAKPOINT: 450,
};

/**
 * ターミナルエミュレーター設定
 */
const TERMINAL_CONFIG = {
  MAX_LINES: 80,
  IDLE_THRESHOLD: 15000, // 15秒
  TYPO_PROBABILITY: 0.05,
  INITIAL_DELAY: 800,
  BAR_LENGTH: 20,
  DEFAULT_PROGRESS_STEPS: 20,
  DEFAULT_PROGRESS_DURATION: 2000,
  COMMANDS_JSON_PATH: "assets/data/commands.json",
};

/**
 * ターミナル背景のパララックス変形を更新
 */
function updateTerminalTransform(terminalBg, scrollY) {
  const isNarrow = window.innerWidth <= PARALLAX_CONFIG.NARROW_BREAKPOINT;
  
  if (isNarrow) {
    terminalBg.style.transform = `translateY(${scrollY * PARALLAX_CONFIG.TERMINAL_SPEED}px)`;
    terminalBg.style.left = "0";
  } else {
    terminalBg.style.transform = `translateX(-50%) translateY(${scrollY * PARALLAX_CONFIG.TERMINAL_SPEED}px)`;
    terminalBg.style.left = "50%";
  }
}

/**
 * パララックス効果を適用
 */
function applyParallaxEffect() {
  const scrollY = window.scrollY;
  
  // グリッド背景用
  document.body.style.setProperty("--scroll-y", `${scrollY * PARALLAX_CONFIG.GRID_SPEED}px`);

  // ターミナル背景用
  const terminalBg = document.querySelector(".terminal-background");
  if (terminalBg) {
    updateTerminalTransform(terminalBg, scrollY);
  }
}

// イベントリスナー登録
window.addEventListener("scroll", applyParallaxEffect);
window.addEventListener("resize", applyParallaxEffect);

/**
 * プログレスバーのデザインパターン
 */
const PROGRESS_BAR_DESIGNS = [
  (step, total, barLength) => {
    const filled = Math.round((step / total) * barLength);
    const percent = Math.round((step / total) * 100);
    const done = "=".repeat(filled);
    const remaining = " ".repeat(barLength - filled);
    return `${step}/${total} [${done}${remaining}] ${percent}% Completed | 00:01:20 remaining`;
  },
  (step, total, barLength) => {
    const filled = Math.round((step / total) * barLength);
    const percent = Math.round((step / total) * 100);
    const done = "█".repeat(filled);
    const remaining = "-".repeat(barLength - filled);
    const speed = (Math.random() * 2 + 0.5).toFixed(1);
    const fileNum = Math.floor(Math.random() * 100);
    return `Downloading file_${fileNum}.zip [${done}${remaining}] ${percent}% ${speed}MB/s ETA: 00:01:10`;
  },
  (step, total, barLength) => {
    const filled = Math.round((step / total) * barLength);
    const percent = Math.round((step / total) * 100);
    const done = "#".repeat(filled);
    const remaining = "-".repeat(barLength - filled);
    const progress = Math.floor((step / total) * 500);
    return `${progress}/500 [${done}${remaining}] ${percent}% ETA: 00:01:30`;
  },
];

/**
 * ターミナルエミュレータークラス
 */
class TerminalEmulator {
  constructor(terminalElement) {
    if (!terminalElement) {
      throw new Error("Terminal element not found");
    }

    this.terminal = terminalElement;
    this.commands = [];
    this.dummyLines = [];
    this.lineIndex = -1;
    this.currentLine = null;
    this.charIndex = 0;
    this.isTyping = false;
    this.currentCommandLines = [];
    this.currentCommandLineIndex = 0;
    this.lastActivity = Date.now();

    this.loadCommandsAndInit();
  }

  /**
   * JSONファイルからコマンドデータを読み込んで初期化
   */
  async loadCommandsAndInit() {
    try {
      const response = await fetch(TERMINAL_CONFIG.COMMANDS_JSON_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load commands: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.commands = data.commands || [];
      this.dummyLines = data.dummyLines || [];
      
      this.init();
    } catch (error) {
      console.error("Error loading terminal commands:", error);
      // フォールバック: 空の配列で初期化
      this.commands = [];
      this.dummyLines = [];
    }
  }

  /**
   * 初期化
   */
  init() {
    this.setupActivityTracking();
    this.renderInitialDummyLines();
    setTimeout(() => this.typeCommand(), TERMINAL_CONFIG.INITIAL_DELAY);
  }

  /**
   * アクティビティトラッキングのセットアップ
   */
  setupActivityTracking() {
    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    document.addEventListener("mousemove", updateActivity);
    document.addEventListener("keydown", updateActivity);
  }

  /**
   * アイドル状態かどうかを判定
   */
  isIdle() {
    return Date.now() - this.lastActivity > TERMINAL_CONFIG.IDLE_THRESHOLD;
  }

  /**
   * ランダムなダミー行を取得
   */
  getRandomDummyLine() {
    if (this.dummyLines.length === 0) {
      return "system.initialize()";
    }
    return this.dummyLines[Math.floor(Math.random() * this.dummyLines.length)];
  }

  /**
   * 初期ダミー行を描画
   */
  renderInitialDummyLines() {
    for (let i = 0; i < TERMINAL_CONFIG.MAX_LINES; i++) {
      const dummyLine = document.createElement("div");
      dummyLine.classList.add("terminal-output");
      dummyLine.textContent = this.getRandomDummyLine();
      this.terminal.prepend(dummyLine);
    }
  }

  /**
   * 新しい行を作成
   */
  createNewLine(className = "terminal-line") {
    const line = document.createElement("div");
    line.className = className;

    this.terminal.prepend(line);

    // 行が多すぎたら下の行を削除
    while (this.terminal.children.length > TERMINAL_CONFIG.MAX_LINES) {
      this.terminal.removeChild(this.terminal.lastChild);
    }

    return line;
  }

  /**
   * 次のコマンドをタイプ
   */
  typeCommand() {
    this.lineIndex = (this.lineIndex + 1) % this.commands.length;
    const cmdObj = this.commands[this.lineIndex];

    if (cmdObj.type === "normal") {
      this.typeNormal(cmdObj.text, cmdObj.outputClass || "terminal-output");
    } else if (cmdObj.type === "progress") {
      this.typeProgressBar(cmdObj.text, cmdObj.duration || TERMINAL_CONFIG.DEFAULT_PROGRESS_DURATION);
    }
  }

  /**
   * 通常コマンドをタイプ
   */
  typeNormal(text, outputClass) {
    this.isTyping = true;
    this.currentCommandLines = text.split("\n");
    this.currentCommandLineIndex = 0;
    this.charIndex = 0;
    this.currentLine = this.createNewLine(outputClass);

    this.typeLine(outputClass);
  }

  /**
   * 1行をタイプ
   */
  typeLine(outputClass) {
    const lineText = this.currentCommandLines[this.currentCommandLineIndex];

    // タイプミス演出
    if (Math.random() < TERMINAL_CONFIG.TYPO_PROBABILITY && this.charIndex > 0) {
      this.currentLine.textContent = this.currentLine.textContent.slice(0, -1);
      setTimeout(() => this.typeLine(outputClass), 50);
      return;
    }

    if (this.charIndex < lineText.length) {
      this.currentLine.textContent += lineText[this.charIndex];
      this.charIndex++;
      const delay = this.isIdle()
        ? 100 + Math.random() * 100
        : Math.random() * 20 + 2;
      setTimeout(() => this.typeLine(outputClass), delay);
    } else if (this.currentCommandLineIndex < this.currentCommandLines.length - 1) {
      this.currentCommandLineIndex++;
      this.charIndex = 0;
      this.currentLine = this.createNewLine(outputClass);
      setTimeout(() => this.typeLine(outputClass), 50);
    } else {
      this.isTyping = false;
      const nextDelay = this.isIdle() ? 1500 : Math.random() * 500 + 50;
      setTimeout(() => this.typeCommand(), nextDelay);
    }
  }

  /**
   * プログレスバーをタイプ
   */
  typeProgressBar(command, duration = TERMINAL_CONFIG.DEFAULT_PROGRESS_DURATION, steps = TERMINAL_CONFIG.DEFAULT_PROGRESS_STEPS) {
    const line = this.createNewLine("terminal-progress");
    line.textContent = "> " + command;

    const progressLine = this.createNewLine("terminal-progress");
    let step = 0;

    const designFunc = PROGRESS_BAR_DESIGNS[Math.floor(Math.random() * PROGRESS_BAR_DESIGNS.length)];

    const stepProgress = () => {
      step++;
      progressLine.textContent = designFunc(step, steps, TERMINAL_CONFIG.BAR_LENGTH);

      if (step < steps) {
        const delay = this.isIdle() ? (duration / steps) * 2 : duration / steps;
        setTimeout(stepProgress, delay);
      } else {
        setTimeout(() => this.typeCommand(), 500);
      }
    };

    stepProgress();
  }
}

/**
 * 初期化
 */
const terminal = document.getElementById("terminal");
if (terminal) {
  new TerminalEmulator(terminal);
}

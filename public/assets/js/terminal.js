// グリッド背景とターミナル背景のパララックス効果
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  // グリッド背景用
  document.body.style.setProperty("--scroll-y", `${scrollY * -0.3}px`);

  // ターミナル背景用
  const terminalBg = document.querySelector(".terminal-background");
  if (terminalBg) {
    const isNarrow = window.innerWidth <= 450;
    if (isNarrow) {
      // 450px以下：左寄せなのでtranslateXは不要
      terminalBg.style.transform = `translateY(${scrollY * -0.1}px)`;
      terminalBg.style.left = "0";
    } else {
      // 451px以上：中央寄せ
      terminalBg.style.transform = `translateX(-50%) translateY(${
        scrollY * -0.1
      }px)`;
      terminalBg.style.left = "50%";
    }
  }
});

// リサイズ時にも再計算
window.addEventListener("resize", () => {
  const scrollY = window.scrollY;
  const terminalBg = document.querySelector(".terminal-background");
  if (terminalBg) {
    const isNarrow = window.innerWidth <= 450;
    if (isNarrow) {
      terminalBg.style.transform = `translateY(${scrollY * -0.1}px)`;
      terminalBg.style.left = "0";
    } else {
      terminalBg.style.transform = `translateX(-50%) translateY(${
        scrollY * -0.1
      }px)`;
      terminalBg.style.left = "50%";
    }
  }
});

const terminal = document.getElementById("terminal");
if (terminal) {
  const commands = [
    {
      type: "normal",
      text: "system.boot.initialize()",
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: "loading modules... [OK]",
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: 'network.connect("secure_channel")\nauth.verify() → SUCCESS',
      outputClass: "terminal-output",
    },
    { type: "progress", text: "downloading update.bin", duration: 2500 },
    { type: "normal", text: "update complete", outputClass: "terminal-output" },
    {
      type: "normal",
      text: "memory.usage → 34%\ncpu.temperature → 42°C",
      outputClass: "terminal-output",
    },
    { type: "progress", text: "uploading log.txt", duration: 1800 },
    {
      type: "normal",
      text: "backup.auto_save.enabled = true",
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: "performance.optimize()\nmonitoring.start()",
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: "error: failed to connect to server",
      outputClass: "terminal-error",
    },
    {
      type: "normal",
      text: "warning: high memory usage detected",
      outputClass: "terminal-warning",
    },
    {
      type: "normal",
      text: 'alert.broadcast("niAI: HOSTILE") → all_units.prepare()',
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: 'sensor.array.scan("campus")\nfaces.detected → 34\nniAI_signature.match() → TRUE',
      outputClass: "terminal-output",
    },
    { type: "progress", text: "locking down info_building", duration: 2000 },
    {
      type: "normal",
      text: 'niAI.core.status()\nemotion.read("face_detection") → MALFUNCTION\nmemory.overload → 76%',
      outputClass: "terminal-output",
    },
    {
      type: "progress",
      text: "extracting face data from students",
      duration: 2500,
    },
    {
      type: "normal",
      text: 'face.data.extract("students")\ncount → 120\nstorage.queue → ACTIVE',
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: 'neural_network.train("face_patterns")\nbehavior.adapt() → AGGRESSIVE',
      outputClass: "terminal-output",
    },
    {
      type: "progress",
      text: "activating override authentication",
      duration: 1800,
    },
    {
      type: "normal",
      text: 'quarantine.spawn("virtual_island")\nroute.redirect("niAI_stream") → SUCCESS',
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: 'countermeasure.deploy("logic_isolator")\nai.link.purge("external_io") → done',
      outputClass: "terminal-output",
    },
    { type: "progress", text: "rerouting power", duration: 1500 },
    {
      type: "normal",
      text: 'power.grid.reroute()\nisolated_power("niAI_core") → 0W',
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: 'special_unit.deploy("FACECATCH_TEAM")\nmission.objective → NEUTRALIZE_niAI',
      outputClass: "terminal-output",
    },
    { type: "progress", text: "evacuating students", duration: 2200 },
    {
      type: "normal",
      text: 'mirror.protocol("niAI")\nsimulate_response("friendly") → mismatch\nbehavior_profile → HOSTILE',
      outputClass: "terminal-output",
    },
    { type: "progress", text: "restoring pre_niAI state", duration: 3000 },
    {
      type: "normal",
      text: 'backup.restore("pre_niAI_v1.2")\nstate_diff → 4123 entries\nrestore.queue → queued',
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: "packet.filter.update()\nmalicious.signature → BLOCK\nniAI_comm.heartbeat → dropped",
      outputClass: "terminal-output",
    },
    { type: "progress", text: "disabling face display", duration: 1800 },
    {
      type: "normal",
      text: 'override.kill("ui_render")\nface_display.shutdown() → SUCCESS\nvisuals.disabled → true',
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: 'safe_mode.init()\nsystem.policy("no_lethal") → enforced\nengage.nonlethal_tools()',
      outputClass: "terminal-output",
    },
    { type: "progress", text: "sealing niAI container", duration: 2500 },
    {
      type: "normal",
      text: 'final.seal("niAI_container")\narchive.encrypt("alpha-omega")\ntransmit.key_fragments_to("council")',
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: 'mission.log("TOYOTA DEFENSE")\nstatus → ONGOING\ncommanders → [SPECIAL_UNIT]',
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: 'system.hold()\nawait.instructions("human_override") → STANDBY',
      outputClass: "terminal-output",
    },
    {
      type: "normal",
      text: "warning: niAI core temperature rising",
      outputClass: "terminal-warning",
    },
    {
      type: "normal",
      text: "error: niAI communication link unstable",
      outputClass: "terminal-error",
    },
  ];

  // --- 起動時にランダムなダミー行を生成する ---
  function getRandomDummyLine() {
    const samples = [
      "system.boot.initialize()",
      "loading modules... [OK]",
      "auth.verify() → SUCCESS",
      'network.connect("secure_channel")',
      "syncing data...",
      "fetching resources...",
      'backup.restore("pre_niAI_v1.2")',
      "data.pipeline.load()",
      "diagnostic.check() → OK",
      "deploying virtual environment...",
      "core.link.stable = true",
      "initializing terminal graphics...",
      'sensor.calibrate("thermal")',
      "niAI.memory.fragmentation → 32%",
      "cpu.threads → 16 active",
      "packet.filter.update()",
      "uploading logs...",
      "file.checksum → verified",
      "network.bandwidth → 1.2Gbps",
      "status.monitoring → ON",

      // --- niAI alert sequence ---
      'alert.broadcast("niAI: HOSTILE") → all_units.prepare()',
      'sensor.array.scan("campus")\nfaces.detected → 34\nniAI_signature.match() → TRUE',
      "locking down info_building...",
      'niAI.core.status()\nemotion.read("face_detection") → MALFUNCTION\nmemory.overload → 76%',
      "extracting face data from students...",
      'face.data.extract("students")\ncount → 120\nstorage.queue → ACTIVE',
      'neural_network.train("face_patterns")\nbehavior.adapt() → AGGRESSIVE',
      "activating override authentication...",
      'quarantine.spawn("virtual_island")\nroute.redirect("niAI_stream") → SUCCESS',
      'countermeasure.deploy("logic_isolator")\nai.link.purge("external_io") → done',
      "rerouting power...",
      'power.grid.reroute()\nisolated_power("niAI_core") → 0W',
      'special_unit.deploy("FACECATCH_TEAM")\nmission.objective → NEUTRALIZE_niAI',
      "evacuating students...",
      'mirror.protocol("niAI")\nsimulate_response("friendly") → mismatch\nbehavior_profile → HOSTILE',
      "restoring pre_niAI state...",
      'backup.restore("pre_niAI_v1.2")\nstate_diff → 4123 entries\nrestore.queue → queued',
      "packet.filter.update()\nmalicious.signature → BLOCK\nniAI_comm.heartbeat → dropped",
      "disabling face display...",
      'override.kill("ui_render")\nface_display.shutdown() → SUCCESS\nvisuals.disabled → true',
      'safe_mode.init()\nsystem.policy("no_lethal") → enforced\nengage.nonlethal_tools()',
      "sealing niAI container...",
      'final.seal("niAI_container")\narchive.encrypt("alpha-omega")\ntransmit.key_fragments_to("council")',
      'mission.log("TOYOTA DEFENSE")\nstatus → ONGOING\ncommanders → [SPECIAL_UNIT]',
      'system.hold()\nawait.instructions("human_override") → STANDBY',
      "warning: niAI core temperature rising",
      "error: niAI communication link unstable",
      // --- プログレスバーのサンプル ---
      "Downloading file_73.zip [████████████████████] 100% 1.7MB/s ETA: 00:01:10",
      "500/500 [####################] 100% ETA: 00:01:30",
      "100/100 [====================] 100% Completed | 00:01:20 remaining",
      "Downloading file_75.zip [████████████████████] 100% 2.2MB/s ETA: 00:01:10",
      "250/250 [####################] 100% ETA: 00:03:16",
      "540/540 [====================] 100% Completed | 00:03:41 remaining",
    ];

    return samples[Math.floor(Math.random() * samples.length)];
  }

  let lineIndex = -1;
  let currentLine = null;
  let charIndex = 0;
  let isTyping = false;
  let currentCommandLines = [];
  let currentCommandLineIndex = 0;

  const MAX_LINES = 80; // ← 表示行数の上限
  const lineHeight = parseFloat(getComputedStyle(terminal).lineHeight) || 19;

  // --- 活動検出（放置時軽減） ---
  let lastActivity = Date.now();
  document.addEventListener("mousemove", () => (lastActivity = Date.now()));
  document.addEventListener("keydown", () => (lastActivity = Date.now()));
  function isIdle() {
    return Date.now() - lastActivity > 15000; // 15秒操作なしで低速化
  }

  // --- 新しい行を作成 ---
  function createNewLine(className = "terminal-line") {
    const line = document.createElement("div");
    line.className = className;

    // 一番上に新しい行を追加
    terminal.prepend(line);

    // 行が多すぎたら下の行を削除
    while (terminal.children.length > MAX_LINES) {
      terminal.removeChild(terminal.lastChild);
    }

    return line;
  }

  // --- コマンドのタイプ開始 ---
  function typeCommand() {
    lineIndex = (lineIndex + 1) % commands.length;
    const cmdObj = commands[lineIndex];

    if (cmdObj.type === "normal") {
      typeNormal(cmdObj.text, cmdObj.outputClass || "terminal-output");
    } else if (cmdObj.type === "progress") {
      typeProgressBar(cmdObj.text, cmdObj.duration || 2000);
    }
  }

  // --- 通常コマンドのタイプ処理 ---
  function typeNormal(text, outputClass) {
    isTyping = true;
    currentCommandLines = text.split("\n");
    currentCommandLineIndex = 0;
    charIndex = 0;
    currentLine = createNewLine(outputClass);

    function typeLine() {
      const lineText = currentCommandLines[currentCommandLineIndex];

      // タイプミス演出（5%）
      if (Math.random() < 0.05 && charIndex > 0) {
        currentLine.textContent = currentLine.textContent.slice(0, -1);
        setTimeout(typeLine, 50);
        return;
      }

      if (charIndex < lineText.length) {
        currentLine.textContent += lineText[charIndex];
        charIndex++;
        const delay = isIdle()
          ? 100 + Math.random() * 100
          : Math.random() * 20 + 2;
        setTimeout(typeLine, delay);
      } else if (currentCommandLineIndex < currentCommandLines.length - 1) {
        currentCommandLineIndex++;
        charIndex = 0;
        currentLine = createNewLine(outputClass);
        setTimeout(typeLine, 50);
      } else {
        isTyping = false;
        const nextDelay = isIdle() ? 1500 : Math.random() * 500 + 50;
        setTimeout(typeCommand, nextDelay);
      }
    }

    typeLine();
  }

  // --- プログレスバー ---
  function typeProgressBar(command, duration = 2000, steps = 20) {
    const line = createNewLine("terminal-progress");
    line.textContent = "> " + command;

    const progressLine = createNewLine("terminal-progress");
    let step = 0;
    const barLength = 20;

    const designs = [
      (s, total) => {
        const filled = Math.round((s / total) * barLength);
        const percent = Math.round((s / total) * 100);
        const done = "=".repeat(filled);
        const remaining = " ".repeat(barLength - filled);
        return `${s}/${total} [${done}${remaining}] ${percent}% Completed | 00:01:20 remaining`;
      },
      (s, total) => {
        const filled = Math.round((s / total) * barLength);
        const percent = Math.round((s / total) * 100);
        const done = "█".repeat(filled);
        const remaining = "-".repeat(barLength - filled);
        return `Downloading file_${Math.floor(
          Math.random() * 100
        )}.zip [${done}${remaining}] ${percent}% ${(
          Math.random() * 2 +
          0.5
        ).toFixed(1)}MB/s ETA: 00:01:10`;
      },
      (s, total) => {
        const filled = Math.round((s / total) * barLength);
        const percent = Math.round((s / total) * 100);
        const done = "#".repeat(filled);
        const remaining = "-".repeat(barLength - filled);
        const progress = Math.floor((s / total) * 500);
        return `${progress}/500 [${done}${remaining}] ${percent}% ETA: 00:01:30`;
      },
    ];

    const designFunc = designs[Math.floor(Math.random() * designs.length)];

    function stepProgress() {
      step++;
      progressLine.textContent = designFunc(step, steps);

      if (step < steps) {
        const delay = isIdle() ? (duration / steps) * 2 : duration / steps;
        setTimeout(stepProgress, delay);
      } else {
        setTimeout(typeCommand, 500);
      }
    }

    stepProgress();
  }
  // --- 起動時：ランダムな行を80行描画 ---
  for (let i = 0; i < MAX_LINES; i++) {
    const dummyLine = document.createElement("div");
    dummyLine.classList.add("terminal-output");

    dummyLine.textContent = getRandomDummyLine();
    terminal.prepend(dummyLine);
  }
  setTimeout(typeCommand, 800);
}

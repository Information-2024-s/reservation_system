"use client";

import { useEffect, useRef } from "react";

interface Command {
  type: "normal" | "progress";
  text: string;
  outputClass?: string;
  duration?: number;
}

interface CommandData {
  commands: Command[];
  dummyLines: string[];
}

const TERMINAL_CONFIG = {
  MAX_LINES: 80,
  IDLE_THRESHOLD: 15000,
  TYPO_PROBABILITY: 0.05,
  INITIAL_DELAY: 800,
  BAR_LENGTH: 20,
  DEFAULT_PROGRESS_STEPS: 20,
  DEFAULT_PROGRESS_DURATION: 2000,
  COMMANDS_JSON_PATH: "/assets/data/commands.json",
};

const PROGRESS_BAR_DESIGNS = [
  (step: number, total: number, barLength: number) => {
    const filled = Math.round((step / total) * barLength);
    const percent = Math.round((step / total) * 100);
    const done = "=".repeat(filled);
    const remaining = " ".repeat(barLength - filled);
    return `${step}/${total} [${done}${remaining}] ${percent}% Completed | 00:01:20 remaining`;
  },
  (step: number, total: number, barLength: number) => {
    const filled = Math.round((step / total) * barLength);
    const percent = Math.round((step / total) * 100);
    const done = "█".repeat(filled);
    const remaining = "-".repeat(barLength - filled);
    const speed = (Math.random() * 2 + 0.5).toFixed(1);
    const fileNum = Math.floor(Math.random() * 100);
    return `Downloading file_${fileNum}.zip [${done}${remaining}] ${percent}% ${speed}MB/s ETA: 00:01:10`;
  },
  (step: number, total: number, barLength: number) => {
    const filled = Math.round((step / total) * barLength);
    const percent = Math.round((step / total) * 100);
    const done = "#".repeat(filled);
    const remaining = "-".repeat(barLength - filled);
    const progress = Math.floor((step / total) * 500);
    return `${progress}/500 [${done}${remaining}] ${percent}% ETA: 00:01:30`;
  },
];

class TerminalEmulator {
  private terminal: HTMLElement;
  private commands: Command[] = [];
  private dummyLines: string[] = [];
  private lineIndex = -1;
  private currentLine: HTMLElement | null = null;
  private charIndex = 0;
  private isTyping = false;
  private currentCommandLines: string[] = [];
  private currentCommandLineIndex = 0;
  private lastActivity = Date.now();

  constructor(terminalElement: HTMLElement) {
    this.terminal = terminalElement;
    this.loadCommandsAndInit();
  }

  async loadCommandsAndInit() {
    try {
      const response = await fetch(TERMINAL_CONFIG.COMMANDS_JSON_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load commands: ${response.statusText}`);
      }

      const data: CommandData = await response.json();
      this.commands = data.commands || [];
      this.dummyLines = data.dummyLines || [];

      this.init();
    } catch (error) {
      console.error("Error loading terminal commands:", error);
      this.commands = [];
      this.dummyLines = [];
    }
  }

  init() {
    this.setupActivityTracking();
    this.renderInitialDummyLines();
    setTimeout(() => this.typeCommand(), TERMINAL_CONFIG.INITIAL_DELAY);
  }

  setupActivityTracking() {
    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    document.addEventListener("mousemove", updateActivity);
    document.addEventListener("keydown", updateActivity);
  }

  isIdle() {
    return Date.now() - this.lastActivity > TERMINAL_CONFIG.IDLE_THRESHOLD;
  }

  getRandomDummyLine() {
    if (this.dummyLines.length === 0) {
      return "system.initialize()";
    }
    return this.dummyLines[Math.floor(Math.random() * this.dummyLines.length)];
  }

  renderInitialDummyLines() {
    for (let i = 0; i < TERMINAL_CONFIG.MAX_LINES; i++) {
      const dummyLine = document.createElement("div");
      dummyLine.classList.add("terminal-output");
      dummyLine.textContent = this.getRandomDummyLine();
      this.terminal.prepend(dummyLine);
    }
  }

  createNewLine(className = "terminal-line") {
    const line = document.createElement("div");
    line.className = className;

    this.terminal.prepend(line);

    while (this.terminal.children.length > TERMINAL_CONFIG.MAX_LINES) {
      const lastChild = this.terminal.lastChild;
      if (lastChild) {
        this.terminal.removeChild(lastChild);
      }
    }

    return line;
  }

  typeCommand() {
    if (this.commands.length === 0) return;

    this.lineIndex = (this.lineIndex + 1) % this.commands.length;
    const cmdObj = this.commands[this.lineIndex];

    if (cmdObj.type === "normal") {
      this.typeNormal(cmdObj.text, cmdObj.outputClass || "terminal-output");
    } else if (cmdObj.type === "progress") {
      this.typeProgressBar(
        cmdObj.text,
        cmdObj.duration || TERMINAL_CONFIG.DEFAULT_PROGRESS_DURATION
      );
    }
  }

  typeNormal(text: string, outputClass: string) {
    this.isTyping = true;
    this.currentCommandLines = text.split("\n");
    this.currentCommandLineIndex = 0;
    this.charIndex = 0;
    this.currentLine = this.createNewLine(outputClass);

    this.typeLine(outputClass);
  }

  typeLine(outputClass: string) {
    const lineText = this.currentCommandLines[this.currentCommandLineIndex];

    if (
      Math.random() < TERMINAL_CONFIG.TYPO_PROBABILITY &&
      this.charIndex > 0
    ) {
      this.currentLine!.textContent = this.currentLine!.textContent!.slice(
        0,
        -1
      );
      setTimeout(() => this.typeLine(outputClass), 50);
      return;
    }

    if (this.charIndex < lineText.length) {
      this.currentLine!.textContent += lineText[this.charIndex];
      this.charIndex++;
      const delay = this.isIdle()
        ? 100 + Math.random() * 100
        : Math.random() * 20 + 2;
      setTimeout(() => this.typeLine(outputClass), delay);
    } else if (
      this.currentCommandLineIndex <
      this.currentCommandLines.length - 1
    ) {
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

  typeProgressBar(
    command: string,
    duration = TERMINAL_CONFIG.DEFAULT_PROGRESS_DURATION,
    steps = TERMINAL_CONFIG.DEFAULT_PROGRESS_STEPS
  ) {
    const line = this.createNewLine("terminal-progress");
    line.textContent = "> " + command;

    const progressLine = this.createNewLine("terminal-progress");
    let step = 0;

    const designFunc =
      PROGRESS_BAR_DESIGNS[
        Math.floor(Math.random() * PROGRESS_BAR_DESIGNS.length)
      ];

    const stepProgress = () => {
      step++;
      progressLine.textContent = designFunc(
        step,
        steps,
        TERMINAL_CONFIG.BAR_LENGTH
      );

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

export default function TerminalBackground() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      new TerminalEmulator(terminalRef.current);
    }
  }, []);

  return (
    <div ref={terminalRef} className="terminal-background" id="terminal" />
  );
}

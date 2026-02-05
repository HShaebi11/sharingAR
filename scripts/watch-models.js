"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const MODELS_DIR = path.resolve(__dirname, "..", "models");
const DEBOUNCE_MS = 2000;

let timeout = null;

function runCommit() {
  const child = spawn("node", [path.join(__dirname, "commit-models.js")], {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });
  child.on("close", (code) => {
    if (code !== 0) {
      // commit-models exits 0 when no changes; ignore
    }
  });
}

function scheduleCommit(filename) {
  if (filename && !filename.toLowerCase().endsWith(".usdz")) return;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    timeout = null;
    runCommit();
  }, DEBOUNCE_MS);
}

console.log("Watching models/ for .usdz changes (debounce", DEBOUNCE_MS / 1000, "s). Ctrl+C to stop.");
fs.watch(MODELS_DIR, { recursive: false }, (event, filename) => {
  if (filename) scheduleCommit(filename);
});

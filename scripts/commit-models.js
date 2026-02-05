"use strict";

const { execSync } = require("child_process");
const path = require("path");

const MODELS_DIR = "models";
const root = path.resolve(__dirname, "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", cwd: root, ...opts });
}

try {
  run(`git add ${MODELS_DIR}/`);
  const staged = run("git diff --cached --name-only");
  const files = staged.trim() ? staged.trim().split("\n") : [];

  if (files.length === 0) {
    console.log("No changes in models/ to commit.");
    process.exit(0);
  }

  run('git commit -m "Add/update .usdz models"');
  run("git push");
  console.log("Committed and pushed", files.length, "file(s) in models/.");
} catch (err) {
  if (err.status === 1 && err.stdout !== undefined) {
    console.error(err.stdout.trim() || err.message);
  } else {
    console.error(err.message);
  }
  process.exit(err.status ?? 1);
}

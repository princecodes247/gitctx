#!/usr/bin/env node
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { getRealGitExecutable } from "../core/git/executable.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// If bypass is set, jump straight to real git
if (process.env.GITCTX_BYPASS === "1") {
  const realGit = getRealGitExecutable();
  const child = spawn(realGit, process.argv.slice(2), {
    stdio: "inherit",
    env: process.env,
  });
  child.on("close", (code) => process.exit(code || 0));
} else {
  // Otherwise, route to gitctx main CLI
  const gitctxBin = path.join(__dirname, "..", "cli", "index.js");
  
  // Notice we use process.execPath to run the node executable
  // and we pass all arguments to gitctx.
  const child = spawn(process.execPath, [gitctxBin, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: process.env,
  });
  child.on("close", (code) => process.exit(code || 0));
}

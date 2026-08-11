import { command } from "commandstruct";
import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";
import { getBinDir, ensureConfigDirs } from "../core/config/index.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function addPathToRC(rcPath: string, binDir: string) {
  if (fs.existsSync(rcPath)) {
    const content = fs.readFileSync(rcPath, "utf8");
    const pathExport = `export PATH="${binDir}:$PATH"`;
    if (!content.includes(pathExport)) {
      fs.appendFileSync(rcPath, `\n# GitCtx\n${pathExport}\n`);
    }
  }
}

export const enableCmd = command("enable")
  .describe("Enable transparent Git routing")
  .action(() => {
    ensureConfigDirs();
    const binDir = getBinDir();
    const shimPath = path.join(binDir, "git");
    
    // Path to the compiled shim/git.js
    const targetShim = path.resolve(__dirname, "..", "shim", "git.js");
    
    // Create an executable bash script instead of symlink to avoid node resolution issues on Windows/symlinks
    const scriptContent = `#!/usr/bin/env bash\nnode "${targetShim}" "$@"\n`;
    fs.writeFileSync(shimPath, scriptContent, { mode: 0o755 });

    const homeDir = os.homedir();
    addPathToRC(path.join(homeDir, ".bashrc"), binDir);
    addPathToRC(path.join(homeDir, ".zshrc"), binDir);

    console.log(chalk.green("✓ Transparent mode enabled."));
    console.log("Please restart your terminal or run:");
    console.log(`  export PATH="${binDir}:$PATH"`);
  });

export const disableCmd = command("disable")
  .describe("Disable transparent Git routing")
  .action(() => {
    const binDir = getBinDir();
    const shimPath = path.join(binDir, "git");
    if (fs.existsSync(shimPath)) {
      fs.unlinkSync(shimPath);
    }
    console.log(chalk.green("✓ Transparent mode disabled."));
    console.log(chalk.yellow("Note: You may want to manually remove the PATH export from your ~/.bashrc or ~/.zshrc."));
  });

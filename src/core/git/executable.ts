import path from "path";
import fs from "fs";
import { getBinDir } from "../config/index.js";

export function getRealGitExecutable(): string {
  const envPath = process.env.PATH || "";
  const paths = envPath.split(path.delimiter);
  const gitctxBinDir = getBinDir();
  const isWin = process.platform === "win32";
  const gitExecutableName = isWin ? "git.exe" : "git";

  for (const dir of paths) {
    // Skip our own shim directory
    if (dir === gitctxBinDir || path.resolve(dir) === path.resolve(gitctxBinDir)) {
      continue;
    }

    const fullPath = path.join(dir, gitExecutableName);
    if (fs.existsSync(fullPath)) {
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isFile() || stats.isSymbolicLink()) {
          // Check if executable
          fs.accessSync(fullPath, fs.constants.X_OK);
          return fullPath;
        }
      } catch (e) {
        // Ignore access errors
      }
    }
  }

  throw new Error("Could not locate real Git executable in PATH");
}

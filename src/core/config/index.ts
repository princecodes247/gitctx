import os from "os";
import path from "path";
import fs from "fs";

export function getGitCtxDir(): string {
  return path.join(os.homedir(), ".gitctx");
}

export function getProfilesDir(): string {
  return path.join(getGitCtxDir(), "profiles");
}

export function getKeysDir(): string {
  return path.join(getGitCtxDir(), "keys");
}

export function getBinDir(): string {
  return path.join(getGitCtxDir(), "bin");
}

export function getConfigFile(): string {
  return path.join(getGitCtxDir(), "config.yaml");
}

export function ensureConfigDirs(): void {
  const dirs = [getGitCtxDir(), getProfilesDir(), getKeysDir(), getBinDir()];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

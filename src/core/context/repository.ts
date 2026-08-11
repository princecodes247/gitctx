import { execSync } from "child_process";

export function getGitRemoteUrl(remoteName: string = "origin"): string | null {
  try {
    const stdout = execSync(`git config --get remote.${remoteName}.url`, { encoding: "utf8" });
    return stdout.trim();
  } catch (err) {
    return null;
  }
}

export function getRepoProfileLink(): string | null {
  try {
    const stdout = execSync(`git config --get gitctx.profile`, { encoding: "utf8" });
    return stdout.trim();
  } catch (err) {
    return null;
  }
}

export function linkRepoProfile(profileName: string): void {
  execSync(`git config gitctx.profile "${profileName}"`);
}

export function unlinkRepoProfile(): void {
  try {
    execSync(`git config --unset gitctx.profile`);
  } catch (err) {
    // Ignore error if it was not set
  }
}

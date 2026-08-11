import { spawn } from "child_process";
import { getRealGitExecutable } from "./executable.js";
import { createGitEnvironment } from "./environment.js";
import { Profile } from "../profiles/profile.js";

export function executeGit(args: string[], profile: Profile | null): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const gitPath = getRealGitExecutable();
      const env = createGitEnvironment(profile);

      const child = spawn(gitPath, args, {
        stdio: "inherit",
        env,
      });

      child.on("close", (code) => {
        resolve(code || 0);
      });

      child.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

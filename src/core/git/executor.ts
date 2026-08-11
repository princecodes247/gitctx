import { spawn } from "child_process";
import { getRealGitExecutable } from "./executable.js";
import { createGitEnvironment } from "./environment.js";
import { Profile } from "../profiles/profile.js";

export function executeGit(args: string[], profile: Profile | null): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const gitPath = getRealGitExecutable();
      const env = createGitEnvironment(profile);
      const modifiedArgs = [...args];
      
      if (env.GITCTX_HTTPS_TOKEN) {
        // Inject credential helper to git arguments
        // We MUST prepend an empty credential.helper first to clear any system/global helpers (like OSX Keychain or gh cli)
        const helperCmd = `!f() { echo "username=\${GITCTX_HTTPS_USER:-git}"; echo "password=\${GITCTX_HTTPS_TOKEN}"; }; f`;
        modifiedArgs.unshift("-c", "credential.helper=", "-c", `credential.helper=${helperCmd}`);
      }

      const child = spawn(gitPath, modifiedArgs, {
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

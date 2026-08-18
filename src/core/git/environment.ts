import { Profile } from "../profiles/profile.js";
import fs from "fs";

export function createGitEnvironment(profile: Profile | null): NodeJS.ProcessEnv {
  const env = { ...process.env };
  
  if (profile) {
    // We pass configuration to Git via GIT_CONFIG_PARAMETERS or via arguments.
    // However, environment variables for Git user identity are standard:
    env.GIT_AUTHOR_NAME = profile.identity.name;
    env.GIT_AUTHOR_EMAIL = profile.identity.email;
    env.GIT_COMMITTER_NAME = profile.identity.name;
    env.GIT_COMMITTER_EMAIL = profile.identity.email;

    if (profile.auth.type === "ssh" && profile.auth.key) {
      const expandedKey = profile.auth.key.replace(/^~/, process.env.HOME || "");
      env.GIT_SSH_COMMAND = `ssh -i "${expandedKey}" -o IdentitiesOnly=yes`;
    } else if (profile.auth.type === "https" && profile.auth.key && fs.existsSync(profile.auth.key)) {
      const token = fs.readFileSync(profile.auth.key, "utf8").trim();
      env.GITCTX_HTTPS_TOKEN = token;
      env.GITCTX_HTTPS_USER = profile.identity.name;
    }
  }

  return env;
}

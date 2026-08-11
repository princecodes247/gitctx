import { Profile } from "../profiles/profile.js";
import { getRealGitExecutable } from "./executable.js";

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
      env.GIT_SSH_COMMAND = `ssh -i ${profile.auth.key} -o IdentitiesOnly=yes`;
    }
  }

  return env;
}

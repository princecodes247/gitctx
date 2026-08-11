import { GitProvider, ProviderIdentity, AuthStatus } from "./provider.js";
import { Profile, ProviderContext } from "../core/profiles/profile.js";

export class GitHubProvider implements GitProvider {
  name = "github";

  detectRemote(remote: string): ProviderContext | null {
    // E.g., git@github.com:company/project.git or https://github.com/company/project.git
    if (remote.includes("github.com")) {
      const parts = remote.match(/github\.com[:/](.+)\/(.+)\.git/);
      if (parts && parts.length === 3) {
        return {
          provider: this.name,
          organization: parts[1],
          repository: parts[2],
        };
      }
      return { provider: this.name };
    }
    return null;
  }

  async resolveIdentity(profile: Profile): Promise<ProviderIdentity> {
    // Dummy implementation for MVP
    return { username: profile.identity.name };
  }

  async validateAuthentication(profile: Profile): Promise<AuthStatus> {
    // Dummy implementation for MVP. Could run `ssh -T git@github.com`
    return { valid: true };
  }
}

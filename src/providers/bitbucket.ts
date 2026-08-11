import { GitProvider, ProviderIdentity, AuthStatus } from "./provider.js";
import { Profile, ProviderContext } from "../core/profiles/profile.js";

export class BitbucketProvider implements GitProvider {
  name = "bitbucket";

  detectRemote(remote: string): ProviderContext | null {
    if (remote.includes("bitbucket.org")) {
      const parts = remote.match(/bitbucket\.org[:/](.+)\/(.+)\.git/);
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
    return { username: profile.identity.name };
  }

  async validateAuthentication(profile: Profile): Promise<AuthStatus> {
    return { valid: true };
  }
}

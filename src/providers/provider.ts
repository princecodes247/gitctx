import { ProviderContext, Profile } from "../core/profiles/profile.js";

export interface ProviderIdentity {
  username: string;
  id?: string;
}

export interface AuthStatus {
  valid: boolean;
  message?: string;
}

export interface GitProvider {
  name: string;

  detectRemote(remote: string): ProviderContext | null;

  resolveIdentity(profile: Profile): Promise<ProviderIdentity>;

  validateAuthentication(profile: Profile): Promise<AuthStatus>;
}

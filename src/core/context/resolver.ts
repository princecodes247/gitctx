import { Profile } from "../profiles/profile.js";
import { loadProfile } from "../profiles/store.js";
import { getRepoProfileLink } from "./repository.js";

// Currently resolves based on explicitly linked repo profiles
// In the future: remote rules, directory rules
export function resolveProfile(explicitProfileName?: string): Profile | null {
  let profileName = explicitProfileName;

  if (!profileName) {
    // 1. Repo linked profile
    profileName = getRepoProfileLink() || undefined;
  }

  // TODO: Add Directory rules and Remote/organization rules here.

  if (profileName) {
    return loadProfile(profileName);
  }

  return null;
}

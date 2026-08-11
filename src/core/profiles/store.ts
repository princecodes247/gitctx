import fs from "fs";
import path from "path";
import yaml from "yaml";
import { Profile } from "./profile.js";
import { getProfilesDir } from "../config/index.js";

export function saveProfile(profile: Profile): void {
  const profilesDir = getProfilesDir();
  const filePath = path.join(profilesDir, `${profile.name}.yaml`);
  const content = yaml.stringify(profile);
  fs.writeFileSync(filePath, content, "utf8");
}

export function loadProfile(name: string): Profile | null {
  const profilesDir = getProfilesDir();
  const filePath = path.join(profilesDir, `${name}.yaml`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, "utf8");
  return yaml.parse(content) as Profile;
}

export function listProfiles(): Profile[] {
  const profilesDir = getProfilesDir();
  if (!fs.existsSync(profilesDir)) {
    return [];
  }
  const files = fs.readdirSync(profilesDir).filter((file) => file.endsWith(".yaml"));
  const profiles: Profile[] = [];
  for (const file of files) {
    const name = file.replace(/\.yaml$/, "");
    const profile = loadProfile(name);
    if (profile) {
      profiles.push(profile);
    }
  }
  return profiles;
}

export function removeProfile(name: string): boolean {
  const profilesDir = getProfilesDir();
  const filePath = path.join(profilesDir, `${name}.yaml`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

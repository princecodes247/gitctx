import { command } from "commandstruct";
import { resolveProfile } from "../core/context/resolver.js";
import { getRepoProfileLink, getGitRemoteUrl } from "../core/context/repository.js";
import { getRealGitExecutable } from "../core/git/executable.js";
import chalk from "chalk";
import fs from "fs";
import { getBinDir } from "../core/config/index.js";
import path from "path";

export const statusCmd = command("status")
  .describe("Show GitCtx status")
  .action(() => {
    console.log(chalk.bold("GitCtx\n"));
    
    const profile = resolveProfile();
    const remote = getGitRemoteUrl();

    console.log(`Remote:\n  ${remote || "none"}\n`);
    
    if (profile) {
      console.log(`Profile:\n  ${profile.name}\n`);
      console.log(`Identity:\n  ${profile.identity.name} <${profile.identity.email}>\n`);
      console.log(`Authentication:\n  ${profile.auth.type}`);
      if (profile.auth.key) {
        console.log(`  ${profile.auth.key}`);
      }
    } else {
      console.log(`Profile:\n  none\n`);
    }

    const binDir = getBinDir();
    const shimExists = fs.existsSync(path.join(binDir, "git"));
    console.log(`\nMode:\n  ${shimExists ? "transparent" : "explicit"}`);
  });

export const explainCmd = command("explain")
  .describe("Explain profile resolution")
  .action(() => {
    console.log(chalk.bold("Resolution:\n"));
    const repoLink = getRepoProfileLink();
    console.log(`  Repository mapping: ${repoLink || "none"}`);
    // TODO: show directory/organization rules here
    
    const profile = resolveProfile();
    console.log(`  Matched profile: ${profile ? profile.name : "none"}\n`);
  });

export const doctorCmd = command("doctor")
  .describe("Check GitCtx system health")
  .action(() => {
    console.log(chalk.bold("GitCtx Doctor\n"));
    
    try {
      const gitPath = getRealGitExecutable();
      console.log(chalk.green("✓ Real Git found at:") + ` ${gitPath}`);
    } catch {
      console.log(chalk.red("✗ Real Git executable not found in PATH"));
    }
    
    const binDir = getBinDir();
    const shimExists = fs.existsSync(path.join(binDir, "git"));
    if (shimExists) {
      console.log(chalk.green("✓ Transparent mode enabled"));
    } else {
      console.log(chalk.yellow("! Transparent mode disabled"));
    }
  });

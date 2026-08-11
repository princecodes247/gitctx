import { command, arg } from "commandstruct";
import { executeGit } from "../core/git/executor.js";
import { loadProfile } from "../core/profiles/store.js";
import chalk from "chalk";

export const runCmd = command("run")
  .describe("Run a Git command with a specific profile")
  .args({
    profile: arg(),
    gitArgs: arg().optional(),  // actually commandstruct's restArgs is better, but we can't easily capture it in the signature here without rest params, so we will use action(({ args, restArgs }))
  })
  .action(async ({ args, restArgs }) => {
    const profileName = args.profile;
    const profile = loadProfile(profileName);

    if (!profile) {
      console.error(chalk.red(`Profile '${profileName}' not found.`));
      process.exit(1);
    }

    try {
      // restArgs contains the commands after --
      const exitCode = await executeGit(restArgs, profile);
      process.exit(exitCode);
    } catch (err: any) {
      console.error(err.message);
      process.exit(1);
    }
  });

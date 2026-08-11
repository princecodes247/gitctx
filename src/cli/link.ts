import { command, arg } from "commandstruct";
import { linkRepoProfile, unlinkRepoProfile } from "../core/context/repository.js";
import { loadProfile } from "../core/profiles/store.js";
import chalk from "chalk";

export const linkCmd = command("link")
  .describe("Link current repository to a profile")
  .args({ profile: arg() })
  .action(({ args }) => {
    const profile = loadProfile(args.profile);
    if (!profile) {
      console.log(chalk.red(`Profile '${args.profile}' not found.`));
      return;
    }
    try {
      linkRepoProfile(args.profile);
      console.log(chalk.green(`✓ Repository linked to profile '${args.profile}'.`));
    } catch (err: any) {
      console.log(chalk.red("Failed to link repository:"), err.message);
    }
  });

export const unlinkCmd = command("unlink")
  .describe("Unlink current repository from its profile")
  .action(() => {
    try {
      unlinkRepoProfile();
      console.log(chalk.green(`✓ Repository unlinked.`));
    } catch (err: any) {
      console.log(chalk.red("Failed to unlink repository:"), err.message);
    }
  });

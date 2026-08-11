import { command } from "commandstruct";
import { ensureConfigDirs } from "../core/config/index.js";
import chalk from "chalk";

export const setupCmd = command("setup")
  .describe("Initialize GitCtx configuration directories")
  .action(() => {
    try {
      ensureConfigDirs();
      console.log(chalk.green("✓ GitCtx setup complete."));
    } catch (err: any) {
      console.error(chalk.red("Failed to setup GitCtx:"), err.message);
    }
  });

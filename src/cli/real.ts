import { command } from "commandstruct";
import { executeGit } from "../core/git/executor.js";

export const realCmd = command("real")
  .describe("Execute real git directly bypassing GitCtx")
  .action(async ({ restArgs }) => {
    try {
      // Pass null profile to avoid setting any gitctx environment variables
      const exitCode = await executeGit(restArgs, null);
      process.exit(exitCode);
    } catch (err: any) {
      console.error(err.message);
      process.exit(1);
    }
  });

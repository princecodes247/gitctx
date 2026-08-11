#!/usr/bin/env node
import "dotenv/config";
import { program } from "commandstruct";
import { setupCmd } from "./setup.js";
import { profileCmd } from "./profile.js";
import { linkCmd, unlinkCmd } from "./link.js";
import { statusCmd, explainCmd, doctorCmd } from "./status.js";
import { runCmd } from "./run.js";
import { enableCmd, disableCmd } from "./enable.js";
import { realCmd } from "./real.js";
import { executeGit } from "../core/git/executor.js";
import { resolveProfile } from "../core/context/resolver.js";
import { ensureConfigDirs } from "../core/config/index.js";

const gitctxCommands = [
  "setup",
  "profile",
  "link",
  "unlink",
  "status",
  "explain",
  "doctor",
  "run",
  "real",
  "enable",
  "disable",
  "--help",
  "-h",
  "--version",
  "-v",
];

async function main() {
  const args = process.argv.slice(2);
  const isGitCtxCommand = args.length > 0 && gitctxCommands.includes(args[0]);

  const prog = program("gitctx")
    .describe("Context-aware Git identities and authentication.")
    .commands(
      setupCmd,
      profileCmd,
      linkCmd,
      unlinkCmd,
      statusCmd,
      explainCmd,
      doctorCmd,
      runCmd,
      realCmd,
      enableCmd,
      disableCmd
    )
    .build();
  if (isGitCtxCommand) {
    // We are running a gitctx command
    ensureConfigDirs();

    prog.run();
  } else {
    // We are running a git command
    try {
      // For any arbitrary git command, we want to resolve the profile
      const profile = resolveProfile();
      const exitCode = await executeGit(args, profile);
      process.exit(exitCode);
    } catch (err: any) {
      console.error(err.message);
      process.exit(1);
    }
  }
}

main().catch(console.error);

import { command, arg, flag } from "commandstruct";
import { input, select, confirm } from "@inquirer/prompts";
import { saveProfile, listProfiles, removeProfile, loadProfile } from "../core/profiles/store.js";
import { getKeysDir } from "../core/config/index.js";
import { startDeviceFlow, pollForToken } from "../providers/github-auth.js";
import { startBitbucketAuth } from "../providers/bitbucket-auth.js";
import fs from "fs";
import path from "path";
import chalk from "chalk";

function listAction() {
  const profiles = listProfiles();
  if (profiles.length === 0) {
    console.log("No profiles found.");
    return;
  }
  console.log("NAME\t\tPROVIDER\tAUTH");
  for (const p of profiles) {
    console.log(`${p.name}\t\t${p.provider}\t\t${p.auth.type}`);
  }
}

export const profileCmd = command("profile")
  .describe("Manage GitCtx profiles")
  .subcommands(
    command("add")
      .describe("Add a new profile")
      .args({ name: arg().optional() })
      .flags({
        provider: flag("Provider (github or bitbucket)").optionalParam("string"),
        name: flag("Git user.name").optionalParam("string"),
        email: flag("Git user.email").optionalParam("string"),
        key: flag("Path to SSH key").optionalParam("string"),
      })
      .action(async ({ args, flags }) => {
        try {
          let profileName = args.name;
          if (!profileName) {
            profileName = await input({ message: "Profile name:" });
          }

          const provider = flags.provider || await select({
            message: "Provider:",
            choices: [
              { name: "GitHub", value: "github" },
              { name: "Bitbucket", value: "bitbucket" }
            ]
          });
          const gitName = flags.name || await input({ message: "Git name:" });
          const gitEmail = flags.email || await input({ message: "Git email:" });

          console.log("\nAuthentication method:");
          let authType = await select({
            message: "Select authentication method",
            choices: [
              { name: "SSH", value: "ssh" },
              { name: "HTTPS", value: "https" }
            ]
          });

          let sshKey = flags.key;

          if (provider.toLowerCase() === "github") {
            console.log("\nGitHub authentication\n");
            console.log("GitCtx needs to authenticate this profile.\n");

            const githubAuth = await select({
              message: "Choose authentication flow",
              choices: [
                { name: "Login with GitHub", value: "login" },
                { name: "Use existing SSH key", value: "existing_ssh" },
                { name: "Create new SSH key", value: "new_ssh" }
              ]
            });

            if (githubAuth === "existing_ssh") {
              sshKey = sshKey || await input({ message: "Path to SSH key:", default: "~/.ssh/id_ed25519" });
            } else if (githubAuth === "new_ssh") {
              console.log(chalk.yellow("Creating new SSH keys is not fully implemented yet."));
              sshKey = sshKey || await input({ message: "Path to save new SSH key:", default: `~/.gitctx/keys/${profileName}` });
            } else if (githubAuth === "login") {
              const deviceFlow = await startDeviceFlow();
              console.log(`\nPlease open: ${chalk.blue.underline(deviceFlow.verification_uri)}`);
              console.log(`And enter code: ${chalk.bold.yellow(deviceFlow.user_code)}\n`);
              console.log("Waiting for authentication...");
              
              const token = await pollForToken(deviceFlow.device_code, deviceFlow.interval);
              
              const tokenPath = path.join(getKeysDir(), `${profileName}.token`);
              fs.writeFileSync(tokenPath, token, { mode: 0o600 });
              
              sshKey = tokenPath;
              authType = "https"; // Force HTTPS for token-based auth
              console.log(chalk.green("✓ Authenticated successfully with GitHub."));
            }
          } else if (provider.toLowerCase() === "bitbucket") {
            console.log("\nBitbucket authentication\n");
            console.log("GitCtx needs to authenticate this profile.\n");

            const bbAuth = await select({
              message: "Choose authentication flow",
              choices: [
                { name: "Login with Bitbucket", value: "login" },
                { name: "Use existing SSH key", value: "existing_ssh" },
                { name: "Create new SSH key", value: "new_ssh" }
              ]
            });

            if (bbAuth === "existing_ssh") {
              sshKey = sshKey || await input({ message: "Path to SSH key:", default: "~/.ssh/id_ed25519" });
            } else if (bbAuth === "new_ssh") {
              console.log(chalk.yellow("Creating new SSH keys is not fully implemented yet."));
              sshKey = sshKey || await input({ message: "Path to save new SSH key:", default: `~/.gitctx/keys/${profileName}` });
            } else if (bbAuth === "login") {
              const token = await startBitbucketAuth();
              
              const tokenPath = path.join(getKeysDir(), `${profileName}.token`);
              fs.writeFileSync(tokenPath, token, { mode: 0o600 });
              
              sshKey = tokenPath;
              authType = "https"; // Force HTTPS for token-based auth
              console.log(chalk.green("✓ Authenticated successfully with Bitbucket."));
            }
          }

          saveProfile({
            name: profileName,
            provider: provider.toLowerCase(),
            identity: {
              name: gitName,
              email: gitEmail,
            },
            auth: {
              type: authType as "ssh" | "https",
              key: sshKey,
            },
          });
          console.log(chalk.green(`\n✓ Profile '${profileName}' created.`));
        } catch (err: any) {
          if (err.name === 'ExitPromptError') {
            console.log(chalk.yellow("\nCanceled."));
            process.exit(0);
          }
          throw err;
        }
      }),

    command("list")
      .describe("List all profiles")
      .action(listAction),

    command("show")
      .describe("Show profile details")
      .args({ name: arg() })
      .action(({ args }) => {
        const profile = loadProfile(args.name);
        if (!profile) {
          console.log(chalk.red(`Profile '${args.name}' not found.`));
          return;
        }
        console.log(JSON.stringify(profile, null, 2));
      }),

    command("remove")
      .describe("Remove a profile")
      .args({ name: arg() })
      .flags({
        deleteKey: flag("Delete associated SSH key").preserveCase()
      })
      .action(async ({ args, flags }) => {
        const profile = loadProfile(args.name);
        if (!profile) {
          console.log(chalk.red(`Profile '${args.name}' not found.`));
          return;
        }

        let shouldDeleteKey = flags.deleteKey;
        if (!shouldDeleteKey && profile.auth.type === "ssh" && profile.auth.key && fs.existsSync(profile.auth.key)) {
           try {
              shouldDeleteKey = await confirm({ message: `Delete the associated SSH key (${profile.auth.key})?`, default: false });
           } catch (err: any) {
              if (err.name === 'ExitPromptError') {
                console.log(chalk.yellow("\nCanceled."));
                process.exit(0);
              }
              throw err;
           }
        }

        if (shouldDeleteKey && profile.auth.key && fs.existsSync(profile.auth.key)) {
           fs.unlinkSync(profile.auth.key);
           console.log(chalk.green(`✓ Deleted SSH key: ${profile.auth.key}`));
        }

        if (removeProfile(args.name)) {
          console.log(chalk.green(`✓ Profile '${args.name}' removed.`));
        } else {
          console.log(chalk.red(`Failed to remove profile '${args.name}'.`));
        }
      })
  ).action(listAction);

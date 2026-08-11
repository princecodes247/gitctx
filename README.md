# GitCtx

GitCtx is a CLI tool for developers who work with multiple Git accounts, identities, and hosting providers. 

It allows you to manage multiple GitHub, Bitbucket, and other Git profiles seamlessly **without manually switching credentials, SSH keys, or global Git configuration**. It strictly isolates your identities using dynamic environment injection, ensuring you never accidentally commit or push as the wrong person.

## Features

- **Strict Identity Isolation**: Injects `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_SSH_COMMAND`, and a custom `credential.helper` dynamically per command.
- **Automated Authentication**: Fully supports OAuth Device Flow (GitHub), automated SSH Key generation, and Local Loopback OAuth (Bitbucket - *Currently under development*).
- **Two Usage Modes**: Use it explicitly (`gitctx run work clone ...`) or transparently by enabling a Git shim (`git clone ...`).
- **Context-Aware**: Link profiles to specific directories so Git automatically knows who you are based on where you are working.

## Installation

### From Source
```bash
git clone https://github.com/your-username/gitctx.git
cd gitctx
npm install
npm run build
npm link
```

## Usage

### 1. Creating a Profile

Add a new profile and follow the interactive prompts to authenticate:

```bash
gitctx profile add work
```
You can choose to authenticate via:
- **OAuth / Device Flow** (Automatically handles and securely stores tokens)
- **Existing SSH Key**
- **Generate New SSH Key** (Automatically generates an ed25519 key and displays the public key for you to copy)

### 2. Linking a Profile to a Directory

To make GitCtx automatically use a profile for a specific repository:

```bash
cd my-work-repo
gitctx link work
```

Now, any Git command run in this directory via GitCtx will use the `work` identity.

### 3. Running Commands

#### Explicit Mode
You can invoke Git explicitly through GitCtx:

```bash
# Run a command using a specific profile
gitctx run work push origin main

# Run a command using the profile linked to the current directory
gitctx push origin main
```

#### Transparent Mode (Recommended)
You can configure GitCtx to act as a seamless shim for the standard `git` command. Once enabled, you just use `git` normally, and GitCtx intercepts it to inject the correct identity!

```bash
# Enable the shim (adds ~/.gitctx/bin to your PATH)
gitctx enable

# Now just use Git normally!
git push origin main
```

To disable transparent mode:
```bash
gitctx disable
```

### 4. Diagnostics

To check which profile GitCtx will use in your current directory, run:
```bash
gitctx status
# or
gitctx explain
```

To verify your system configuration:
```bash
gitctx doctor
```

## How It Works

GitCtx does **not** modify your global `~/.gitconfig` or rely on flaky SSH aliases (like editing `~/.ssh/config` to use `work-github.com`). 

Instead, it intercepts the execution of the `git` binary and dynamically injects environment variables:
- **Identity**: `GIT_AUTHOR_NAME` and `GIT_AUTHOR_EMAIL`
- **SSH Auth**: `GIT_SSH_COMMAND="ssh -i ~/.gitctx/keys/work -o IdentitiesOnly=yes"`
- **HTTPS Auth**: `credential.helper='!f() { echo ... }; f'`

This guarantees that Git only has access to the exact credentials assigned to the active profile for the duration of that single command.

## License
MIT

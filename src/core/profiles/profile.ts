export interface GitIdentity {
  name: string;
  email: string;
}

export interface GitAuth {
  type: "ssh" | "https";
  key?: string; // path to the SSH key
}

export interface ProviderContext {
  provider: string; // e.g. "github", "bitbucket"
  organization?: string;
  repository?: string;
}

export interface Profile {
  name: string;
  provider: string;
  identity: GitIdentity;
  auth: GitAuth;
}

import chalk from "chalk";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "Ov23liJd5YtzgrPvaxcZ";

export interface DeviceFlowStartResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export async function startDeviceFlow(): Promise<DeviceFlowStartResponse> {
  const response = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: "repo read:org",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start GitHub device flow: ${response.statusText}`);
  }

  return response.json() as Promise<DeviceFlowStartResponse>;
}

export async function pollForToken(deviceCode: string, interval: number): Promise<string> {
  let polling = true;

  while (polling) {
    await new Promise((resolve) => setTimeout(resolve, interval * 1000));

    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        device_code: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      return data.access_token;
    }

    if (data.error) {
      switch (data.error) {
        case "authorization_pending":
          // User hasn't authorized yet, continue polling
          break;
        case "slow_down":
          // GitHub tells us to slow down, increase interval
          interval += 5;
          break;
        case "expired_token":
          throw new Error("Device code expired. Please try again.");
        case "access_denied":
          throw new Error("Authentication canceled by user.");
        default:
          throw new Error(`GitHub authentication error: ${data.error_description || data.error}`);
      }
    }
  }

  throw new Error("Failed to authenticate.");
}

import http from "http";
import { URL } from "url";
import open from "open";
import chalk from "chalk";

const BITBUCKET_CLIENT_ID = process.env.BITBUCKET_CLIENT_ID;
const BITBUCKET_CLIENT_SECRET = process.env.BITBUCKET_CLIENT_SECRET;
const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

export async function startBitbucketAuth(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (!BITBUCKET_CLIENT_ID || !BITBUCKET_CLIENT_SECRET) {
        return reject(new Error("BITBUCKET_CLIENT_ID and BITBUCKET_CLIENT_SECRET must be set in your environment."));
      }

      try {
        if (!req.url) return;
        const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
        
        if (parsedUrl.pathname === "/callback") {
          const code = parsedUrl.searchParams.get("code");
          
          if (!code) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end("<h1>Authentication Failed</h1><p>No code returned.</p>");
            server.close();
            return reject(new Error("No code returned from Bitbucket."));
          }

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end("<h1>Success!</h1><p>You can close this window and return to your terminal.</p>");
          
          server.close();

          console.log(chalk.blue("Got authorization code, exchanging for token..."));

          const credentials = Buffer.from(`${BITBUCKET_CLIENT_ID}:${BITBUCKET_CLIENT_SECRET}`).toString("base64");
          
          const tokenResponse = await fetch("https://bitbucket.org/site/oauth2/access_token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": `Basic ${credentials}`,
              "Accept": "application/json",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: code,
            }),
          });

          if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            return reject(new Error(`Failed to get token: ${tokenResponse.statusText} - ${errText}`));
          }

          const data = await tokenResponse.json();
          resolve(data.access_token);
        }
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(PORT, () => {
      if (!BITBUCKET_CLIENT_ID || !BITBUCKET_CLIENT_SECRET) {
        server.close();
        return reject(new Error("BITBUCKET_CLIENT_ID and BITBUCKET_CLIENT_SECRET must be set in your environment."));
      }
      const authUrl = `https://bitbucket.org/site/oauth2/authorize?client_id=${BITBUCKET_CLIENT_ID}&response_type=code`;
      console.log(`\nOpening browser to authenticate with Bitbucket...`);
      console.log(`If it doesn't open automatically, navigate to:\n${chalk.underline.blue(authUrl)}\n`);
      open(authUrl);
    });

    // Timeout after 3 minutes
    setTimeout(() => {
      server.close();
      reject(new Error("Authentication timed out after 3 minutes."));
    }, 3 * 60 * 1000);
  });
}

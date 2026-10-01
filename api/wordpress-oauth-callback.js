const crypto = require("crypto");

const REDIRECT_URI = "https://convertfiles24.com/api/wordpress-oauth-callback";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        return separator === -1
          ? [part, ""]
          : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      }),
  );
}

function stateIsValid(receivedState, cookieValue, secret) {
  if (!receivedState || !cookieValue) return false;

  const [storedState, storedSignature] = cookieValue.split(".");
  if (!storedState || !storedSignature || storedState !== receivedState) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(storedState)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const actual = Buffer.from(storedSignature, "utf8");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function renderPage(response, status, title, message, token = "") {
  const tokenSection = token
    ? `<section class="token"><p>Copy this token now and save it in Vercel as <strong>WORDPRESS_ACCESS_TOKEN</strong>. Do not share it in chat or screenshots.</p><textarea readonly rows="5" aria-label="WordPress access token">${escapeHtml(token)}</textarea></section>`
    : "";

  response.status(status).send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><title>${escapeHtml(title)} | ConvertFiles24</title>
<style>body{font-family:Arial,sans-serif;background:#f6f4ef;color:#171717;margin:0;padding:32px}.card{max-width:720px;margin:8vh auto;background:#fff;border:1px solid #ddd7cc;border-radius:18px;padding:32px;box-shadow:0 16px 50px #00000012}h1{margin-top:0}p{line-height:1.65;color:#4d4a44}.token{margin-top:24px;padding-top:20px;border-top:1px solid #e5e0d8}textarea{box-sizing:border-box;width:100%;padding:14px;border:1px solid #bbb;border-radius:10px;font:14px/1.5 monospace;resize:none}</style>
</head><body><main class="card"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${tokenSection}</main></body></html>`);
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
  );
  response.setHeader(
    "Set-Cookie",
    "cf24_wp_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/wordpress-oauth-callback; Max-Age=0",
  );

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return renderPage(response, 405, "Method not allowed", "Open the OAuth start URL instead.");
  }

  const clientId = process.env.WORDPRESS_CLIENT_ID;
  const clientSecret = process.env.WORDPRESS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return renderPage(response, 503, "Configuration incomplete", "WordPress OAuth environment variables are missing.");
  }

  const cookies = parseCookies(request.headers.cookie);
  const state = Array.isArray(request.query?.state) ? request.query.state[0] : request.query?.state;
  const code = Array.isArray(request.query?.code) ? request.query.code[0] : request.query?.code;

  if (!stateIsValid(state, cookies.cf24_wp_oauth_state, clientSecret)) {
    return renderPage(response, 400, "Authorization failed", "The OAuth state was missing or invalid. Start the connection again.");
  }

  if (!code) {
    return renderPage(response, 400, "Authorization cancelled", "WordPress.com did not return an authorization code.");
  }

  try {
    const tokenResponse = await fetch("https://public-api.wordpress.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || typeof tokenData.access_token !== "string") {
      console.error("WordPress OAuth token exchange failed", {
        status: tokenResponse.status,
        error: tokenData.error || "unknown_error",
      });
      return renderPage(response, 502, "Connection failed", "WordPress.com could not complete the token exchange. Try connecting again.");
    }

    return renderPage(
      response,
      200,
      "WordPress connected",
      "The access token was created successfully. Complete the final secure environment-variable step below.",
      tokenData.access_token,
    );
  } catch (error) {
    console.error("WordPress OAuth callback failed", {
      name: error?.name,
      message: error?.message,
    });
    return renderPage(response, 500, "Connection failed", "An unexpected error occurred while connecting WordPress.com.");
  }
};

module.exports.config = { maxDuration: 30 };

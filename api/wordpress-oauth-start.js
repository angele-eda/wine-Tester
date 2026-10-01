const crypto = require("crypto");

const REDIRECT_URI = "https://convertfiles24.com/api/wordpress-oauth-callback";
const WORDPRESS_BLOG = "convertfiles24.wordpress.com";

function signState(state, secret) {
  return crypto.createHmac("sha256", secret).update(state).digest("hex");
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const clientId = process.env.WORDPRESS_CLIENT_ID;
  const clientSecret = process.env.WORDPRESS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return response.status(503).json({
      error: "WordPress OAuth is not configured yet",
    });
  }

  const state = crypto.randomBytes(24).toString("hex");
  const signature = signState(state, clientSecret);
  const cookieValue = `${state}.${signature}`;

  response.setHeader(
    "Set-Cookie",
    `cf24_wp_oauth_state=${cookieValue}; HttpOnly; Secure; SameSite=Lax; Path=/api/wordpress-oauth-callback; Max-Age=600`,
  );

  const authorizeUrl = new URL("https://public-api.wordpress.com/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("blog", WORDPRESS_BLOG);
  authorizeUrl.searchParams.set("scope", "posts");
  authorizeUrl.searchParams.set("state", state);

  return response.redirect(302, authorizeUrl.toString());
};

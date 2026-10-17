const crypto = require("crypto");
const { createFeaturedImage, removeImage } = require("./ai-trends-image");

const SITE = "aicreatortrends.wordpress.com";
const API = `https://public-api.wordpress.com/wp/v2/sites/${SITE}/posts`;
const OPENAI = "https://api.openai.com/v1/responses";
const THEMES = [
  "AI-assisted video and short-form content workflows",
  "Prompt engineering and creative briefs for small businesses",
  "Responsible use of generative images and content credentials",
  "Accessibility and human review of AI-generated content",
  "Measuring creator productivity without misleading metrics",
  "Practical AI tools for independent creators",
  "Workflow automation and digital publishing quality checks",
  "Social platforms, copyright and clear AI disclosures",
  "Reusable content templates and editorial operations",
  "Selecting the right AI model for a creative task",
  "Improving research and fact-checking with AI assistance",
  "Safe sharing and file management for AI creators"
];

function seoul() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit",
    day: "2-digit", weekday: "short"
  }).formatToParts(new Date());
  const v = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return { date: `${v.year}-${v.month}-${v.day}`, weekday: v.weekday };
}

function authorized(req) {
  const expected = process.env.CRON_SECRET;
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function request(url, options = {}, timeout = 60000) {
  const r = await fetch(url, { ...options, signal: AbortSignal.timeout(timeout) });
  if (!r.ok) {
    const error = new Error(`HTTP ${r.status} from ${new URL(url).host}`);
    error.status = r.status;
    throw error;
  }
  return r.json();
}

function textOf(payload) {
  if (payload.output_text) return payload.output_text;
  return (payload.output || []).flatMap(x => x.content || [])
    .filter(x => x.type === "output_text").map(x => x.text).join("");
}

async function recentPosts(token) {
  return request(`${API}?status=publish&per_page=20&_fields=title,slug`, {
    headers: { Authorization: `Bearer ${token}` }
  }, 12000);
}

async function sendReport(subject, message) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.BLOG_REPORT_FROM_EMAIL;
  const to = process.env.BLOG_REPORT_TO_EMAIL;
  if (!key || !from || !to) return;
  try {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: {
      Authorization: `Bearer ${key}`, "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: [to], subject, text: message }),
    signal: AbortSignal.timeout(10000)
  });
  if (!r.ok) console.error("Email report failed", r.status);
  } catch (error) {
    console.error("Email report unavailable", error.message);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!authorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const { date, weekday } = seoul();
  if (weekday !== "Mon" && weekday !== "Thu") return res.status(200).json({ status: "skipped" });

  const token = process.env.AI_TRENDS_WORDPRESS_ACCESS_TOKEN || process.env.WORDPRESS_ACCESS_TOKEN;
  const aiKey = process.env.OPENAI_API_KEY;
  if (!token || !aiKey) {
    console.error("AI blog publisher missing WORDPRESS_ACCESS_TOKEN or OPENAI_API_KEY");
    return res.status(503).json({ error: "Missing server configuration" });
  }

  const slug = `ai-creator-trends-${date.replaceAll("-", "")}`;
  try {
    const existing = await request(`${API}?slug=${slug}&per_page=1`, {
      headers: { Authorization: `Bearer ${token}` }
    }, 12000);
    if (existing.length) return res.status(200).json({ status: "already-published", url: existing[0].link });

    const published = await recentPosts(token);
    const priorTitles = published.map(p => (p.title?.rendered || "").replace(/<[^>]*>/g, ""));
    const [y, m, d] = date.split("-").map(Number);
    const weeks = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(2026, 9, 19)) / (7 * 86400000));
    const theme = THEMES[Math.abs(weeks * 2 + (weekday === "Thu" ? 1 : 0)) % THEMES.length];

    const schema = {
      type: "object", additionalProperties: false,
      properties: {
        title: { type: "string" }, excerpt: { type: "string" },
        content_html: { type: "string" }
      },
      required: ["title", "excerpt", "content_html"]
    };
    const response = await request(OPENAI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.AI_BLOG_TEXT_MODEL || "gpt-5-mini",
        store: false,
        instructions: "You write original, practical English blog tutorials for AI & Creator Trends. Avoid invented news, citations, statistics, releases, prices, policy claims and quotations. Favor durable how-to guidance, realistic examples and clear limitations. Return only the requested structured JSON. HTML must use p,h2,h3,ul,ol,li,strong,em tags, not scripts, images or h1.",
        input: `Write an original 800-1100 word SEO tutorial on: ${theme}. Avoid duplicating these existing titles: ${priorTitles.join("; ")}. Use an actionable specific title, useful numbered steps, pitfalls, a brief FAQ and a human-review reminder. Date: ${date}.`,
        text: { format: { type: "json_schema", name: "ai_creator_blog_article", strict: true, schema } },
        max_output_tokens: 4800
      })
    }, 90000);
    const article = JSON.parse(textOf(response));
    if (![article.title, article.excerpt, article.content_html].every(x => typeof x === "string" && x.trim())) {
      throw new Error("Incomplete generated article");
    }
    if (/<\s*(script|iframe|style|img|form)\b/i.test(article.content_html)) {
      throw new Error("Unsafe generated HTML");
    }
    // Image is optional: never block the article when a model or upload fails.
    let media = null;
    try {
      media = await createFeaturedImage(article, slug, token, aiKey);
    } catch (imageError) {
      console.error("AI Trends image unavailable; publishing article without image", {
        date, reason: imageError.message
      });
    }

    // A second instance might have published while the image was being generated.
    const beforePublish = await request(`${API}?slug=${slug}&per_page=1`, {
      headers: { Authorization: `Bearer ${token}` }
    }, 12000);
    if (beforePublish.length) {
      if (media) await removeImage(media.id, token);
      return res.status(200).json({ status: "already-published", url: beforePublish[0].link });
    }

    let created;
    try {
      created = await request(API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: article.title, excerpt: article.excerpt,
          content: article.content_html, slug, status: "publish",
          featured_media: media ? media.id : 0
        })
      }, 20000);
    } catch (publishError) {
      // Recover a successful publish after an ambiguous timeout, avoiding duplicates.
      let recovered = [];
      try {
        recovered = await request(`${API}?slug=${slug}&per_page=1`, {
          headers: { Authorization: `Bearer ${token}` }
        }, 12000);
      } catch (_) { /* Preserve the original publish error. */ }
      if (!recovered.length) {
        if (media) await removeImage(media.id, token);
        throw publishError;
      }
      created = recovered[0];
    }

    const imageStatus = !media ? "text-only" :
      Number(created.featured_media) === Number(media.id) ? "attached" : "attachment-unconfirmed";
    if (imageStatus === "attachment-unconfirmed") {
      console.error("AI Trends post published but featured image attachment unconfirmed", {
        date, postId: created.id, mediaId: media.id
      });
    }
    console.info("AI Trends article published", { date, postId: created.id, url: created.link, imageStatus });
    await sendReport(
      `[AI & Creator Trends] Published: ${article.title}`,
      `Published ${date}: ${created.link}\nFeatured image: ${imageStatus}`
    );
    return res.status(200).json({
      status: "published", date, postId: created.id, url: created.link, imageStatus
    });
  } catch (error) {
    console.error("AI Trends scheduled publishing failed", { date, error: error.message });
    await sendReport(`[AI & Creator Trends] Publishing failed ${date}`, error.message);
    return res.status(500).json({ error: "Automatic publishing failed" });
  }
};
module.exports.config = { maxDuration: 300 };

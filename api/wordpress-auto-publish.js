const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const WORDPRESS_POSTS_URL =
  "https://public-api.wordpress.com/wp/v2/sites/convertfiles24.wordpress.com/posts";

const TRIAL_TOPICS = {
  "2026-10-05": {
    title: "How to Reduce Image File Size Without Losing Visible Quality",
    slug: "reduce-image-file-size-without-losing-quality",
    toolUrl: "https://convertfiles24.com/image-compress/",
  },
  "2026-10-08": {
    title: "HEIC vs JPG: Which Image Format Should You Use?",
    slug: "heic-vs-jpg-which-format-to-use",
    toolUrl: "https://convertfiles24.com/heic-jpg/",
  },
  "2026-10-12": {
    title: "How to Merge PDF Files Safely in Your Browser",
    slug: "how-to-merge-pdf-files-safely",
    toolUrl: "https://convertfiles24.com/pdf-merge/",
  },
  "2026-10-15": {
    title: "WAV vs MP3: File Size, Quality, and Best Uses Explained",
    slug: "wav-vs-mp3-file-size-quality-best-uses",
    toolUrl: "https://convertfiles24.com/audio-tools/",
  },
  "2026-10-19": {
    title: "Best Video Compression Settings for Smaller, Clearer Files",
    slug: "best-video-compression-settings",
    toolUrl: "https://convertfiles24.com/video-tools/",
  },
  "2026-10-22": {
    title: "How to Convert M4A to MP3 Without Unnecessary Quality Loss",
    slug: "convert-m4a-to-mp3-with-good-quality",
    toolUrl: "https://convertfiles24.com/audio-tools/",
  },
  "2026-10-26": {
    title: "How to Create a QR Code That Scans Reliably",
    slug: "how-to-create-a-reliable-qr-code",
    toolUrl: "https://convertfiles24.com/qr-code/",
  },
  "2026-10-29": {
    title: "How to Resize Images Without Stretching or Distortion",
    slug: "resize-images-without-stretching",
    toolUrl: "https://convertfiles24.com/image-resize/",
  },
};

const articleSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    content_html: { type: "string" },
  },
  required: ["title", "excerpt", "content_html"],
  additionalProperties: false,
};

function extractOutputText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  return (response.output || [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("");
}

function getKoreanDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.authorization || "";
  return Boolean(cronSecret) && authorization === `Bearer ${cronSecret}`;
}

async function findExistingPost(slug, accessToken) {
  const url = new URL(WORDPRESS_POSTS_URL);
  url.searchParams.set("slug", slug);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("context", "edit");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error(`WordPress duplicate check failed (${response.status})`);
  const posts = await response.json();
  return Array.isArray(posts) ? posts[0] || null : null;
}

async function generateArticle(topic, apiKey) {
  const openAIResponse = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.6-luna",
      store: false,
      reasoning: { effort: "low" },
      instructions:
        "You are the editorial writer for ConvertFiles24, a privacy-focused browser-based file conversion website. Write accurate, original, people-first English content. Return only the requested structured output. Use clean semantic HTML in content_html with p, h2, h3, ul, ol, li, strong, em, and a tags only. Never include scripts, styles, forms, iframes, images, or unsupported claims.",
      input: `Write a complete English SEO article with this exact title: ${topic.title}. Aim for 900 to 1,200 useful words without filler. Explain the subject in plain language, include practical steps, common mistakes, and a concise FAQ. Naturally link once to the relevant ConvertFiles24 tool: ${topic.toolUrl}. The excerpt must be one or two sentences. Do not include an h1 because WordPress renders the post title separately.`,
      text: {
        format: {
          type: "json_schema",
          name: "convertfiles24_blog_article",
          strict: true,
          schema: articleSchema,
        },
      },
      max_output_tokens: 5000,
    }),
  });

  if (!openAIResponse.ok) {
    throw new Error(`OpenAI article generation failed (${openAIResponse.status})`);
  }

  const openAIData = await openAIResponse.json();
  const article = JSON.parse(extractOutputText(openAIData));
  const values = [article?.title, article?.excerpt, article?.content_html];
  if (!values.every((value) => typeof value === "string" && value.trim())) {
    throw new Error("OpenAI returned an incomplete article");
  }
  if (/<\s*(script|style|iframe|form|img)\b/i.test(article.content_html)) {
    throw new Error("OpenAI returned unsupported HTML");
  }
  return article;
}

async function publishArticle(topic, article, accessToken) {
  const response = await fetch(WORDPRESS_POSTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: article.title.trim(),
      excerpt: article.excerpt.trim(),
      content: article.content_html.trim(),
      slug: topic.slug,
      status: "publish",
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`WordPress publishing failed (${response.status})`);
  }
  return data;
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorized(request)) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  const koreanDate = getKoreanDate();
  const topic = TRIAL_TOPICS[koreanDate];
  if (!topic) {
    return response.status(200).json({
      ok: true,
      status: "skipped",
      date: koreanDate,
      reason: "Outside the October 2026 trial publishing dates",
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const accessToken = process.env.WORDPRESS_ACCESS_TOKEN;
  if (!apiKey || !accessToken) {
    return response.status(503).json({
      error: "Automatic publishing is not fully configured",
      missing: [
        !apiKey ? "OPENAI_API_KEY" : null,
        !accessToken ? "WORDPRESS_ACCESS_TOKEN" : null,
      ].filter(Boolean),
    });
  }

  try {
    const existingPost = await findExistingPost(topic.slug, accessToken);
    if (existingPost) {
      return response.status(200).json({
        ok: true,
        status: "already-published",
        date: koreanDate,
        title: existingPost.title?.rendered || topic.title,
        url: existingPost.link || "",
      });
    }

    const article = await generateArticle(topic, apiKey);
    const post = await publishArticle(topic, article, accessToken);

    return response.status(200).json({
      ok: true,
      status: "published",
      date: koreanDate,
      title: post.title?.rendered || article.title,
      url: post.link || "",
      postId: post.id || null,
    });
  } catch (error) {
    console.error("Automatic WordPress publishing failed", {
      date: koreanDate,
      name: error?.name,
      message: error?.message,
    });
    return response.status(500).json({ error: "Automatic publishing failed" });
  }
};

module.exports.config = { maxDuration: 60 };

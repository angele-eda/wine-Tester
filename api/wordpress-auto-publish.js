const crypto = require("crypto");

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";
const WORDPRESS_POSTS_URL =
  "https://public-api.wordpress.com/wp/v2/sites/convertfiles24.wordpress.com/posts";
const WORDPRESS_MEDIA_URL =
  "https://public-api.wordpress.com/wp/v2/sites/convertfiles24.wordpress.com/media";
const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const MAX_ATTEMPTS = 2;
const MAX_FEATURED_IMAGE_BYTES = 200 * 1024;

const TRIAL_TOPICS = Object.freeze({
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
});

const TRIAL_DATES = Object.keys(TRIAL_TOPICS);
if (TRIAL_DATES.length !== 8) {
  throw new Error("The October trial must contain exactly eight publishing dates");
}

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

class PublishError extends Error {
  constructor(publicReason, stage, options = {}) {
    super(publicReason, options);
    this.name = "PublishError";
    this.publicReason = publicReason;
    this.stage = stage;
  }
}

function extractOutputText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  return (response.output || [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlToText(html) {
  return String(html)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h2|h3|li|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getKoreanDateInfo() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    weekday: values.weekday,
  };
}

function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.authorization || "";
  if (!cronSecret || !authorization.startsWith("Bearer ")) return false;

  const received = Buffer.from(authorization.slice("Bearer ".length), "utf8");
  const expected = Buffer.from(cronSecret, "utf8");
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function getConfiguration() {
  const values = {
    openAIKey: process.env.OPENAI_API_KEY,
    wordpressToken: process.env.WORDPRESS_ACCESS_TOKEN,
    resendKey: process.env.RESEND_API_KEY,
    reportFrom: process.env.BLOG_REPORT_FROM_EMAIL,
    reportTo: process.env.BLOG_REPORT_TO_EMAIL,
  };
  const environmentNames = {
    openAIKey: "OPENAI_API_KEY",
    wordpressToken: "WORDPRESS_ACCESS_TOKEN",
    resendKey: "RESEND_API_KEY",
    reportFrom: "BLOG_REPORT_FROM_EMAIL",
    reportTo: "BLOG_REPORT_TO_EMAIL",
  };
  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([name]) => environmentNames[name]);
  return { ...values, missing };
}

function isRetryableStatus(status) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

async function fetchWithRetry(url, options, label, timeoutMs = 10000) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok || !isRetryableStatus(response.status) || attempt === MAX_ATTEMPTS) {
        return response;
      }
      lastError = new Error(`${label} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) throw error;
    }
    await sleep(750 * attempt);
  }

  throw lastError || new Error(`${label} failed`);
}

async function findExistingPost(slug, accessToken) {
  const url = new URL(WORDPRESS_POSTS_URL);
  url.searchParams.set("slug", slug);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("context", "edit");

  const response = await fetchWithRetry(
    url,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    "WordPress duplicate check",
  );

  if (!response.ok) {
    throw new PublishError(
      `WordPress duplicate check failed after ${MAX_ATTEMPTS} attempts (HTTP ${response.status}).`,
      "wordpress-check",
    );
  }

  const posts = await response.json();
  return Array.isArray(posts) ? posts[0] || null : null;
}

async function generateArticle(topic, apiKey) {
  const response = await fetchWithRetry(
    OPENAI_RESPONSES_URL,
    {
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
    },
    "OpenAI article generation",
    20000,
  );

  if (!response.ok) {
    throw new PublishError(
      `OpenAI article generation failed after ${MAX_ATTEMPTS} attempts (HTTP ${response.status}).`,
      "openai",
    );
  }

  try {
    const openAIData = await response.json();
    const article = JSON.parse(extractOutputText(openAIData));
    const values = [article?.title, article?.excerpt, article?.content_html];
    if (!values.every((value) => typeof value === "string" && value.trim())) {
      throw new Error("Incomplete article");
    }
    if (/<\s*(script|style|iframe|form|img)\b/i.test(article.content_html)) {
      throw new Error("Unsupported HTML");
    }
    return article;
  } catch (error) {
    throw new PublishError("OpenAI returned an invalid article response.", "openai-response", {
      cause: error,
    });
  }
}

async function generateFeaturedImage(topic, article, apiKey) {
  const response = await fetchWithRetry(
    OPENAI_IMAGES_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2.5-flare",
        prompt: `Create one original editorial featured image for an English ConvertFiles24 article titled "${article.title}". Topic: ${topic.title}. Show a clear visual metaphor for browser-based file conversion or file handling that matches this specific topic. Use a polished modern flat illustration with subtle depth, a dark charcoal background, warm off-white details, muted gold accents, and one restrained blue accent. Landscape composition with the main subject centered and generous safe margins. No words, letters, numbers, logos, brand marks, watermarks, recognizable people, screenshots, or copyrighted characters. The image must be professional, calm, and suitable for a privacy-focused utility blog.`,
        n: 1,
        size: "1200x640",
        quality: "low",
        output_format: "jpeg",
        output_compression: 45,
        background: "opaque",
        moderation: "auto",
      }),
    },
    "OpenAI featured image generation",
    90000,
  );

  if (!response.ok) {
    throw new PublishError(
      `OpenAI featured image generation failed after ${MAX_ATTEMPTS} attempts (HTTP ${response.status}).`,
      "openai-image",
    );
  }

  try {
    const data = await response.json();
    const encodedImage = data?.data?.[0]?.b64_json;
    if (typeof encodedImage !== "string" || !encodedImage) {
      throw new Error("Missing image data");
    }

    const buffer = Buffer.from(encodedImage, "base64");
    const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8;
    if (!isJpeg || buffer.length > MAX_FEATURED_IMAGE_BYTES) {
      throw new Error("Invalid or oversized featured image");
    }

    return {
      buffer,
      contentType: "image/jpeg",
      filename: `${topic.slug}.jpg`,
      altText: `Editorial illustration for ${article.title}`.slice(0, 125),
    };
  } catch (error) {
    throw new PublishError(
      "OpenAI returned an invalid featured image or an image larger than 200 KB.",
      "openai-image-response",
      { cause: error },
    );
  }
}

async function deleteMedia(mediaId, accessToken) {
  if (!mediaId) return;
  const response = await fetchWithRetry(
    `${WORDPRESS_MEDIA_URL}/${encodeURIComponent(mediaId)}?force=true`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    "WordPress media cleanup",
    15000,
  );
  if (!response.ok && response.status !== 404) {
    throw new PublishError(
      `WordPress media cleanup failed (HTTP ${response.status}).`,
      "wordpress-media-cleanup",
    );
  }
}

async function cleanupMediaQuietly(mediaId, accessToken) {
  try {
    await deleteMedia(mediaId, accessToken);
  } catch (error) {
    console.error("Unused WordPress media could not be removed", {
      mediaId,
      stage: error?.stage || "wordpress-media-cleanup",
      message: error?.publicReason || "Media cleanup failed",
    });
  }
}

async function uploadFeaturedImage(image, article, accessToken) {
  const uploadResponse = await fetchWithRetry(
    WORDPRESS_MEDIA_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": image.contentType,
        "Content-Disposition": `attachment; filename="${image.filename}"`,
      },
      body: image.buffer,
    },
    "WordPress featured image upload",
    30000,
  );

  const uploadedMedia = await uploadResponse.json().catch(() => ({}));
  if (!uploadResponse.ok || !uploadedMedia?.id) {
    throw new PublishError(
      `WordPress featured image upload failed after ${MAX_ATTEMPTS} attempts (HTTP ${uploadResponse.status}).`,
      "wordpress-media-upload",
    );
  }

  const metadataResponse = await fetchWithRetry(
    `${WORDPRESS_MEDIA_URL}/${encodeURIComponent(uploadedMedia.id)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: article.title.trim(),
        alt_text: image.altText,
        caption: `Featured image for ${article.title.trim()}`,
      }),
    },
    "WordPress featured image metadata",
    15000,
  );

  if (!metadataResponse.ok) {
    await cleanupMediaQuietly(uploadedMedia.id, accessToken);
    throw new PublishError(
      `WordPress featured image metadata update failed (HTTP ${metadataResponse.status}).`,
      "wordpress-media-metadata",
    );
  }

  const media = await metadataResponse.json().catch(() => uploadedMedia);
  return {
    id: media.id || uploadedMedia.id,
    sourceUrl: media.source_url || uploadedMedia.source_url || "",
    altText: image.altText,
  };
}

async function deleteDuplicatePost(postId, accessToken) {
  if (!postId) return;
  const response = await fetchWithRetry(
    `${WORDPRESS_POSTS_URL}/${encodeURIComponent(postId)}?force=true`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    "WordPress duplicate cleanup",
  );
  if (!response.ok) {
    throw new PublishError(
      `A duplicate post was detected but cleanup failed (HTTP ${response.status}).`,
      "wordpress-cleanup",
    );
  }
}

async function publishArticle(topic, article, featuredMediaId, accessToken) {
  let lastFailure;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
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
          featured_media: featuredMediaId,
        }),
        signal: AbortSignal.timeout(12000),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) return data;
      lastFailure = new Error(`HTTP ${response.status}`);
      if (!isRetryableStatus(response.status) || attempt === MAX_ATTEMPTS) break;
    } catch (error) {
      lastFailure = error;
      if (attempt === MAX_ATTEMPTS) break;
    }

    const recoveredPost = await findExistingPost(topic.slug, accessToken);
    if (recoveredPost) return recoveredPost;
    await sleep(1000);
  }

  throw new PublishError(
    `WordPress publishing failed after ${MAX_ATTEMPTS} attempts.`,
    "wordpress-publish",
    { cause: lastFailure },
  );
}

function normalizePost(post, fallbackArticle, fallbackTitle, featuredImageUrl = "") {
  return {
    id: post?.id || null,
    slug: post?.slug || "",
    title: post?.title?.rendered || fallbackArticle?.title || fallbackTitle,
    content: post?.content?.rendered || fallbackArticle?.content_html || "",
    url: post?.link || "",
    featuredImageUrl,
    publishedAt: post?.date_gmt
      ? `${post.date_gmt}Z`
      : post?.date || new Date().toISOString(),
  };
}

async function sendEmail({ resendKey, reportFrom, reportTo, subject, html, text, idempotencyKey }) {
  const response = await fetchWithRetry(
    RESEND_EMAILS_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({ from: reportFrom, to: [reportTo], subject, html, text }),
    },
    "Email report",
  );

  if (!response.ok) {
    throw new PublishError(
      `Email delivery failed after ${MAX_ATTEMPTS} attempts (HTTP ${response.status}).`,
      "email",
    );
  }
}

async function sendSuccessEmail(date, post, configuration) {
  const safeTitle = escapeHtml(post.title);
  const safeUrl = escapeHtml(post.url);
  const safeTime = escapeHtml(post.publishedAt);
  const safeImageUrl = escapeHtml(post.featuredImageUrl || "");
  const bodyHtml = post.content || "<p>No article body was returned by WordPress.</p>";
  const textBody = htmlToText(post.content);
  const imageHtml = safeImageUrl
    ? `<p><img src="${safeImageUrl}" alt="${safeTitle}" style="display:block;width:100%;max-width:1200px;height:auto"></p>`
    : "";
  const imageText = post.featuredImageUrl
    ? `\nFeatured image: ${post.featuredImageUrl}`
    : "";

  await sendEmail({
    ...configuration,
    subject: `[ConvertFiles24] Published: ${post.title}`,
    idempotencyKey: `cf24-blog-${date}-success`,
    html: `<h1>${safeTitle}</h1><p><strong>Published URL:</strong> <a href="${safeUrl}">${safeUrl}</a></p><p><strong>Published at:</strong> ${safeTime}</p>${imageHtml}<hr>${bodyHtml}`,
    text: `Title: ${post.title}\nPublished URL: ${post.url}\nPublished at: ${post.publishedAt}${imageText}\n\n${textBody}`,
  });
}

async function sendFailureEmail(date, reason, configuration) {
  const occurredAt = new Date().toISOString();
  await sendEmail({
    ...configuration,
    subject: `[ConvertFiles24] Automatic publishing failed (${date})`,
    idempotencyKey: `cf24-blog-${date}-failure`,
    html: `<h1>Automatic publishing failed</h1><p><strong>Reason:</strong> ${escapeHtml(reason)}</p><p><strong>Time:</strong> ${escapeHtml(occurredAt)}</p>`,
    text: `Automatic publishing failed\nReason: ${reason}\nTime: ${occurredAt}`,
  });
}

async function runScheduledPublish(date, topic, configuration) {
  const existingPost = await findExistingPost(topic.slug, configuration.wordpressToken);
  if (existingPost) {
    const normalized = normalizePost(existingPost, null, topic.title);
    await sendSuccessEmail(date, normalized, configuration);
    return { status: "already-published", post: normalized };
  }

  const article = await generateArticle(topic, configuration.openAIKey);
  const secondCheck = await findExistingPost(topic.slug, configuration.wordpressToken);
  if (secondCheck) {
    const normalized = normalizePost(secondCheck, article, topic.title);
    await sendSuccessEmail(date, normalized, configuration);
    return { status: "already-published", post: normalized };
  }

  const featuredImage = await generateFeaturedImage(topic, article, configuration.openAIKey);
  const thirdCheck = await findExistingPost(topic.slug, configuration.wordpressToken);
  if (thirdCheck) {
    const normalized = normalizePost(thirdCheck, article, topic.title);
    await sendSuccessEmail(date, normalized, configuration);
    return { status: "already-published", post: normalized };
  }

  const media = await uploadFeaturedImage(
    featuredImage,
    article,
    configuration.wordpressToken,
  );
  let createdPost;
  try {
    createdPost = await publishArticle(
      topic,
      article,
      media.id,
      configuration.wordpressToken,
    );
  } catch (error) {
    await cleanupMediaQuietly(media.id, configuration.wordpressToken);
    throw error;
  }

  let normalized = normalizePost(
    createdPost,
    article,
    topic.title,
    Number(createdPost?.featured_media) === Number(media.id) ? media.sourceUrl : "",
  );
  const returnedFeaturedMediaId = Number(createdPost?.featured_media || 0);

  if (normalized.slug !== topic.slug) {
    await deleteDuplicatePost(normalized.id, configuration.wordpressToken);
    await cleanupMediaQuietly(media.id, configuration.wordpressToken);
    const originalPost = await findExistingPost(topic.slug, configuration.wordpressToken);
    if (!originalPost) {
      throw new PublishError(
        "A concurrent duplicate run was detected and no original post could be found.",
        "duplicate-check",
      );
    }
    normalized = normalizePost(originalPost, article, topic.title);
  } else if (returnedFeaturedMediaId && returnedFeaturedMediaId !== Number(media.id)) {
    await cleanupMediaQuietly(media.id, configuration.wordpressToken);
  }

  await sendSuccessEmail(date, normalized, configuration);
  return { status: "published", post: normalized };
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (!["GET", "POST"].includes(request.method)) {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorized(request)) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  if (process.env.AUTO_PUBLISH_ENABLED !== "true") {
    return response.status(200).json({ ok: true, status: "disabled" });
  }

  const { date, weekday } = getKoreanDateInfo();
  const topic = TRIAL_TOPICS[date];
  const validTrialDate =
    date.startsWith("2026-10-") &&
    (weekday === "Mon" || weekday === "Thu") &&
    Boolean(topic) &&
    TRIAL_DATES.indexOf(date) >= 0 &&
    TRIAL_DATES.indexOf(date) < 8;

  if (!validTrialDate) {
    return response.status(200).json({
      ok: true,
      status: "skipped",
      date,
      reason: "Outside the eight October 2026 Monday/Thursday publishing dates",
    });
  }

  const configuration = getConfiguration();
  if (configuration.missing.length) {
    const reason = `Missing required server configuration: ${configuration.missing.join(", ")}.`;
    if (configuration.resendKey && configuration.reportFrom && configuration.reportTo) {
      try {
        await sendFailureEmail(date, reason, configuration);
      } catch (emailError) {
        console.error("Failure email could not be sent", {
          date,
          stage: emailError?.stage || "email",
          message: emailError?.publicReason || "Email delivery failed",
        });
      }
    }
    return response.status(503).json({ error: "Automatic publishing is not fully configured" });
  }

  try {
    const result = await runScheduledPublish(date, topic, configuration);
    return response.status(200).json({
      ok: true,
      status: result.status,
      date,
      title: result.post.title,
      url: result.post.url,
      postId: result.post.id,
    });
  } catch (error) {
    const reason =
      error instanceof PublishError
        ? error.publicReason
        : "An unexpected automatic publishing error occurred.";

    console.error("Automatic WordPress publishing failed", {
      date,
      stage: error?.stage || "unexpected",
      message: reason,
    });

    if (error?.stage !== "email") {
      try {
        await sendFailureEmail(date, reason, configuration);
      } catch (emailError) {
        console.error("Failure email could not be sent", {
          date,
          stage: emailError?.stage || "email",
          message: emailError?.publicReason || "Email delivery failed",
        });
      }
    }

    return response.status(500).json({ error: "Automatic publishing failed" });
  }
};

module.exports.config = { maxDuration: 300 };

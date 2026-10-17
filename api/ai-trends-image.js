"use strict";

// AI & Creator Trends editorial featured images.
// Image errors are non-fatal for publishing; callers handle the fallback.
const MEDIA_API = "https://public-api.wordpress.com/wp/v2/sites/aicreatortrends.wordpress.com/media";
const IMAGE_API = "https://api.openai.com/v1/images/generations";
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

async function generateImage(article, slug, apiKey) {
  const response = await fetch(IMAGE_API, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.AI_BLOG_IMAGE_MODEL || "gpt-image-1-mini",
      prompt: [
        "Create an original, high-quality editorial featured image for an English blog article.",
        "Article title: " + article.title,
        "Article summary: " + article.excerpt.slice(0, 450),
        "Premium modern technology magazine style, sophisticated but accessible.",
        "Navy, blue, muted violet and subtle off-white accents.",
        "Illustrate the specific AI creator or productivity concept using a visual metaphor.",
        "Landscape composition; frame important objects in the central 16:9 safe area so a theme can crop the edges.",
        "Simple clear focal point, balanced negative space, nuanced lighting and clean professional rendering.",
        "No text, typography, letters, watermarks, logos, brand names, people, copied artworks or interfaces."
      ].join("\n"),
      n: 1,
      size: "1536x1024",
      quality: "low",
      output_format: "jpeg",
      output_compression: 40
    }),
    signal: AbortSignal.timeout(90000)
  });
  if (!response.ok) throw new Error("Image generation HTTP " + response.status);
  const result = await response.json();
  const base64 = result && result.data && result.data[0] && result.data[0].b64_json;
  if (!base64 || typeof base64 !== "string") throw new Error("Image generation returned no image");
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length < 1000 || buffer.length > MAX_IMAGE_BYTES ||
      buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("Image generation returned invalid or oversized JPEG");
  }
  return {
    buffer,
    filename: slug + ".jpg",
    altText: ("Editorial illustration: " + article.title).slice(0, 125)
  };
}

async function removeImage(mediaId, token) {
  if (!mediaId) return;
  try {
    const response = await fetch(MEDIA_API + "/" + encodeURIComponent(mediaId) + "?force=true", {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok && response.status !== 404) {
      console.error("AI Trends: unused image cleanup HTTP", response.status);
    }
  } catch (error) {
    console.error("AI Trends: unused image cleanup failed", error.message);
  }
}

async function uploadImage(article, image, token) {
  const response = await fetch(MEDIA_API, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "image/jpeg",
      "Content-Disposition": 'attachment; filename="' + image.filename + '"'
    },
    body: image.buffer,
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error("WordPress image upload HTTP " + response.status);
  const media = await response.json();
  if (!media || !media.id) throw new Error("WordPress image upload returned no media ID");
  try {
    const update = await fetch(MEDIA_API + "/" + encodeURIComponent(media.id), {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: article.title,
        alt_text: image.altText,
        caption: "Illustration for " + article.title
      }),
      signal: AbortSignal.timeout(15000)
    });
    if (!update.ok) throw new Error("WordPress image metadata HTTP " + update.status);
    const result = await update.json();
    return { id: media.id, url: result.source_url || media.source_url || "" };
  } catch (error) {
    await removeImage(media.id, token);
    throw error;
  }
}

async function createFeaturedImage(article, slug, token, apiKey) {
  const generated = await generateImage(article, slug, apiKey);
  return uploadImage(article, generated, token);
}

module.exports = { createFeaturedImage, removeImage };

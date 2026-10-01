const crypto = require("crypto");

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

const blogDraftSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    slug: { type: "string" },
    body: { type: "string" },
  },
  required: ["title", "summary", "slug", "body"],
  additionalProperties: false,
};

function extractOutputText(response) {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  return (response.output || [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("");
}

function isValidDraft(draft) {
  return ["title", "summary", "slug", "body"].every(
    (field) => typeof draft?.[field] === "string" && draft[field].trim().length > 0,
  );
}

function secretsMatch(received, expected) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const adminSecret = process.env.ADMIN_API_SECRET;
  const authorization = request.headers.authorization || "";
  const receivedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!adminSecret) {
    return response.status(404).json({ error: "Not found" });
  }

  if (!secretsMatch(receivedSecret, adminSecret)) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(500).json({ error: "OPENAI_API_KEY is not configured" });
  }

  try {
    const openAIResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        store: false,
        reasoning: { effort: "low" },
        instructions:
          "You are the editorial writer for ConvertFiles24, a privacy-focused browser-based file conversion website. Write accurate, original, people-first English content. Do not claim that every conversion happens locally unless the article explicitly limits that statement to supported ConvertFiles24 tools. Return only the requested structured output.",
        input:
          "Create one useful English SEO article titled around how to compress a video without making it blurry. Write for ordinary users, explain resolution, bitrate, codec, and practical quality settings in plain language, and naturally mention the ConvertFiles24 Video Tools page at https://convertfiles24.com/video-tools/. The summary should be one or two sentences. The slug must be lowercase ASCII words separated by hyphens. The body must be complete Markdown with an introduction, helpful H2 sections, a short step-by-step workflow, common mistakes, and a concise FAQ. Aim for 900 to 1,200 words without filler.",
        text: {
          format: {
            type: "json_schema",
            name: "convertfiles24_blog_draft",
            strict: true,
            schema: blogDraftSchema,
          },
        },
        max_output_tokens: 5000,
      }),
    });

    if (!openAIResponse.ok) {
      console.error("OpenAI Responses API request failed", {
        status: openAIResponse.status,
        requestId: openAIResponse.headers.get("x-request-id"),
      });
      return response.status(502).json({ error: "Blog draft generation failed" });
    }

    const openAIData = await openAIResponse.json();
    const outputText = extractOutputText(openAIData);
    const draft = JSON.parse(outputText);

    if (!isValidDraft(draft)) {
      throw new Error("The generated draft did not match the expected shape");
    }

    return response.status(200).json({
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      slug: draft.slug.trim(),
      body: draft.body.trim(),
    });
  } catch (error) {
    console.error("Unable to generate blog draft", {
      name: error?.name,
      message: error?.message,
    });
    return response.status(500).json({ error: "Unable to generate blog draft" });
  }
};

module.exports.config = {
  maxDuration: 60,
};

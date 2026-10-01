const generateButton = document.getElementById("generateButton");
const draftStatus = document.getElementById("draftStatus");
const draftResult = document.getElementById("draftResult");
const resultTitle = document.getElementById("resultTitle");
const resultSummary = document.getElementById("resultSummary");
const resultSlug = document.getElementById("resultSlug");
const resultBody = document.getElementById("resultBody");

function setStatus(message, isError = false) {
  draftStatus.textContent = message;
  draftStatus.classList.toggle("is-error", isError);
}

generateButton.addEventListener("click", async () => {
  generateButton.disabled = true;
  generateButton.textContent = "Generating…";
  draftResult.hidden = true;
  setStatus("Generating a new draft. Please keep this page open.");

  try {
    const response = await fetch("/api/blog-draft-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    const requiredFields = ["title", "summary", "slug", "body"];
    const isValid = requiredFields.every(
      (field) => typeof data[field] === "string" && data[field].trim().length > 0,
    );

    if (!isValid) {
      throw new Error("The API returned an incomplete draft.");
    }

    resultTitle.textContent = data.title;
    resultSummary.textContent = data.summary;
    resultSlug.textContent = data.slug;
    resultBody.textContent = data.body;
    draftResult.hidden = false;
    setStatus("Draft generated successfully. Nothing was published to WordPress.");
  } catch (error) {
    setStatus(error.message || "Unable to generate a draft.", true);
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = draftResult.hidden ? "Try again" : "Generate another draft";
  }
});

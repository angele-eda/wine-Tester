const tools = {
  converter: { name: "File Converter", icon: "sync_alt", formats: ["PNG", "JPG", "WebP", "PDF"] },
  merge: { name: "Merge PDF", icon: "call_merge", formats: ["PDF"] },
  split: { name: "Split PDF", icon: "content_cut", formats: ["PDF"] },
  compress: { name: "Compress PDF", icon: "compress", formats: ["PDF"] },
  "pdf-jpg": { name: "PDF to JPG", icon: "image", formats: ["JPG", "PNG"] },
  "jpg-pdf": { name: "JPG to PDF", icon: "picture_as_pdf", formats: ["PDF"] },
  "image-ico": { name: "Image to ICO", icon: "web_asset", formats: ["ICO"] },
  favicon: { name: "Favicon Generator", icon: "app_shortcut", formats: ["Favicon files (.zip)"] }
};

const root = document.documentElement;
const themeButton = document.querySelector("#themeButton");
const mobileThemeButton = document.querySelector("#mobileThemeButton");
const themeIcon = document.querySelector("#themeIcon");
const securityImage = document.querySelector("#securityImage");
const securitySource = document.querySelector("#securitySource");
const languageButton = document.querySelector("#languageButton");
const languageMenu = document.querySelector("#languageMenu");
const languageLabel = document.querySelector("#languageLabel");
const mobileMenuButton = document.querySelector("#mobileMenuButton");
const mobileNav = document.querySelector("#mobileNav");
const dialog = document.querySelector("#workspaceDialog");
const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const fileList = document.querySelector("#fileList");
const clearButton = document.querySelector("#clearButton");
const convertButton = document.querySelector("#convertButton");
const convertLabel = document.querySelector("#convertLabel");
const formatSelect = document.querySelector("#formatSelect");
const qualityRange = document.querySelector("#qualityRange");
const qualityOutput = document.querySelector("#qualityOutput");
const successPanel = document.querySelector("#successPanel");
const toast = document.querySelector("#toast");

document.querySelectorAll(".material-symbols-outlined").forEach((icon) => {
  icon.classList.add("notranslate");
  icon.setAttribute("translate", "no");
});

let selectedFiles = [];
let currentTool = tools.converter;
let toastTimer;
let downloadResult = null;

const savedTheme = localStorage.getItem("convertfiles24-theme");
setTheme(savedTheme === "light" ? "light" : "dark");

themeButton.addEventListener("click", toggleTheme);
mobileThemeButton.addEventListener("click", toggleTheme);

function toggleTheme() {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("convertfiles24-theme", theme);
  const dark = theme === "dark";
  themeIcon.textContent = dark ? "dark_mode" : "light_mode";
  themeButton.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  mobileThemeButton.textContent = dark ? "Switch to light mode" : "Switch to dark mode";
  securityImage.src = dark ? "assets/security-dark.png" : "assets/security-light.png";
  securitySource.srcset = securityImage.src;
}

languageButton.addEventListener("click", () => {
  const isOpen = languageButton.getAttribute("aria-expanded") === "true";
  languageButton.setAttribute("aria-expanded", String(!isOpen));
  languageMenu.hidden = isOpen;
});

languageMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-language]");
  if (!option) return;
  languageLabel.textContent = option.dataset.language;
  languageMenu.hidden = true;
  languageButton.setAttribute("aria-expanded", "false");
  showToast(option.dataset.language === "한국어" ? "한국어 번역은 다음 단계에서 연결됩니다." : "Language set to English.");
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".language-wrap")) {
    languageMenu.hidden = true;
    languageButton.setAttribute("aria-expanded", "false");
  }
});

mobileMenuButton.addEventListener("click", () => {
  const open = mobileMenuButton.getAttribute("aria-expanded") === "true";
  mobileMenuButton.setAttribute("aria-expanded", String(!open));
  mobileNav.hidden = open;
});

mobileNav.addEventListener("click", () => {
  mobileNav.hidden = true;
  mobileMenuButton.setAttribute("aria-expanded", "false");
});

document.querySelectorAll(".tool-card").forEach((card) => {
  card.addEventListener("click", () => openWorkspace(card.dataset.tool, card.dataset.accept));
});

function openWorkspace(toolKey, accept) {
  currentTool = tools[toolKey] || tools.converter;
  document.querySelector("#workspaceTitle").textContent = currentTool.name;
  document.querySelector("#dialogToolIcon").textContent = currentTool.icon;
  fileInput.accept = accept || "";
  formatSelect.innerHTML = currentTool.formats.map((format) => `<option>${format}</option>`).join("");
  resetWorkspace();
  dialog.showModal();
}

document.querySelector("#closeDialogButton").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dropZone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => setFiles(Array.from(fileInput.files || [])));

["dragenter", "dragover"].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.add("dragover");
}));

["dragleave", "drop"].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragover");
}));

dropZone.addEventListener("drop", (event) => setFiles(Array.from(event.dataTransfer.files || [])));
clearButton.addEventListener("click", resetWorkspace);

qualityRange.addEventListener("input", () => {
  qualityOutput.value = `${qualityRange.value}%`;
});

convertButton.addEventListener("click", async () => {
  if (!selectedFiles.length || convertButton.classList.contains("processing")) return;
  convertButton.classList.add("processing");
  convertButton.disabled = true;
  convertLabel.textContent = "Processing locally...";
  successPanel.hidden = true;
  downloadResult = null;
  try {
    downloadResult = await processFiles();
    convertButton.classList.remove("processing");
    convertButton.disabled = false;
    convertLabel.textContent = `Convert ${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}`;
    successPanel.hidden = false;
    document.querySelectorAll(".file-status").forEach((status) => { status.textContent = "READY"; });
  } catch (error) {
    convertButton.classList.remove("processing");
    convertButton.disabled = false;
    convertLabel.textContent = `Convert ${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}`;
    showToast(error.message || "Could not process this file.");
  }
});

document.querySelector("#downloadButton").addEventListener("click", () => {
  if (!downloadResult) {
    showToast("Convert files first.");
    return;
  }
  downloadBlob(downloadResult.blob, downloadResult.name);
});

function setFiles(files) {
  selectedFiles = files;
  downloadResult = null;
  successPanel.hidden = true;
  renderFiles();
}

function resetWorkspace() {
  selectedFiles = [];
  downloadResult = null;
  fileInput.value = "";
  successPanel.hidden = true;
  convertButton.classList.remove("processing");
  renderFiles();
}

async function processFiles() {
  if (currentTool.name === "Image to ICO") {
    const imageFile = firstImageFile();
    const icoBlob = await createIcoBlob(imageFile, [16, 32, 48, 64, 128, 256]);
    return { blob: icoBlob, name: `${baseName(imageFile.name)}.ico` };
  }

  if (currentTool.name === "Favicon Generator") {
    const imageFile = firstImageFile();
    const sizes = [16, 32, 48, 180, 192, 512];
    const icoBlob = await createIcoBlob(imageFile, [16, 32, 48, 64, 128, 256]);

    if (!window.JSZip) {
      return { blob: icoBlob, name: "favicon.ico" };
    }

    const zip = new JSZip();
    zip.file("favicon.ico", icoBlob);
    for (const size of sizes) {
      const pngBlob = await createPngBlob(imageFile, size);
      zip.file(`favicon-${size}x${size}.png`, pngBlob);
    }
    zip.file("site.webmanifest", JSON.stringify({
      icons: [
        { src: "favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "favicon-512x512.png", sizes: "512x512", type: "image/png" }
      ]
    }, null, 2));
    const zipBlob = await zip.generateAsync({ type: "blob" });
    return { blob: zipBlob, name: `${baseName(imageFile.name)}-favicon-files.zip` };
  }

  await new Promise((resolve) => window.setTimeout(resolve, 600));
  return { blob: new Blob(["ConvertFiles24 local processing preview."], { type: "text/plain" }), name: "convertfiles24-preview.txt" };
}

function firstImageFile() {
  const imageFile = selectedFiles.find((file) => file.type.startsWith("image/"));
  if (!imageFile) throw new Error("Choose a JPG or PNG image first.");
  return imageFile;
}

async function createIcoBlob(file, sizes) {
  const pngBuffers = [];
  for (const size of sizes) {
    const pngBlob = await createPngBlob(file, size);
    pngBuffers.push(await pngBlob.arrayBuffer());
  }

  const headerSize = 6;
  const entrySize = 16;
  const imageOffset = headerSize + entrySize * pngBuffers.length;
  const totalSize = imageOffset + pngBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  const bytes = new Uint8Array(totalSize);
  const view = new DataView(bytes.buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, pngBuffers.length, true);

  let offset = imageOffset;
  pngBuffers.forEach((buffer, index) => {
    const size = sizes[index];
    const entry = headerSize + entrySize * index;
    view.setUint8(entry, size >= 256 ? 0 : size);
    view.setUint8(entry + 1, size >= 256 ? 0 : size);
    view.setUint8(entry + 2, 0);
    view.setUint8(entry + 3, 0);
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, buffer.byteLength, true);
    view.setUint32(entry + 12, offset, true);
    bytes.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });

  return new Blob([bytes], { type: "image/x-icon" });
}

async function createPngBlob(file, size) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, size, size);

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - sourceSize) / 2;
  const sourceY = (image.naturalHeight - sourceSize) / 2;
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create image output."));
    }, "image/png");
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    image.src = url;
  });
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function baseName(name) {
  return String(name).replace(/\.[^.]+$/, "") || "convertfiles24";
}

function renderFiles() {
  convertButton.disabled = selectedFiles.length === 0;
  convertLabel.textContent = selectedFiles.length ? `Convert ${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}` : "Convert files";
  if (!selectedFiles.length) {
    fileList.innerHTML = '<p class="empty-state">No files selected yet.</p>';
    return;
  }
  fileList.innerHTML = selectedFiles.map((file) => `
    <div class="file-row">
      <span class="file-type">${escapeHtml(extension(file.name))}</span>
      <span><strong title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</strong><small>${formatBytes(file.size)} · processed locally</small></span>
      <span class="file-status">QUEUED</span>
    </div>`).join("");
}

function extension(name) {
  const part = String(name).split(".").pop();
  return (part || "FILE").slice(0, 4).toUpperCase();
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2600);
}

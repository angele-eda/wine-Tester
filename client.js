const tools = {
  converter: { name: "File Converter", icon: "sync_alt", formats: ["PNG", "JPG", "WebP", "PDF"] },
  merge: { name: "Merge PDF", icon: "call_merge", formats: ["PDF"] },
  split: { name: "Split PDF", icon: "content_cut", formats: ["PDF"] },
  compress: { name: "Compress PDF", icon: "compress", formats: ["PDF"] },
  "pdf-jpg": { name: "PDF to JPG", icon: "image", formats: ["JPG", "PNG"] },
  "jpg-pdf": { name: "JPG to PDF", icon: "picture_as_pdf", formats: ["PDF"] },
  "image-ico": { name: "Image to ICO", icon: "web_asset", formats: ["ICO"] },
  favicon: { name: "Favicon Generator", icon: "app_shortcut", formats: ["ICO", "PNG", "SVG"] }
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

convertButton.addEventListener("click", () => {
  if (!selectedFiles.length || convertButton.classList.contains("processing")) return;
  convertButton.classList.add("processing");
  convertButton.disabled = true;
  convertLabel.textContent = "Processing locally...";
  successPanel.hidden = true;
  window.setTimeout(() => {
    convertButton.classList.remove("processing");
    convertButton.disabled = false;
    convertLabel.textContent = `Convert ${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}`;
    successPanel.hidden = false;
    document.querySelectorAll(".file-status").forEach((status) => { status.textContent = "READY"; });
  }, 900);
});

document.querySelector("#downloadButton").addEventListener("click", () => {
  showToast("Download is ready in the working converter build.");
});

function setFiles(files) {
  selectedFiles = files;
  successPanel.hidden = true;
  renderFiles();
}

function resetWorkspace() {
  selectedFiles = [];
  fileInput.value = "";
  successPanel.hidden = true;
  convertButton.classList.remove("processing");
  renderFiles();
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

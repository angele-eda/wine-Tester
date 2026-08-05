const tools = {
  converter: { nameKey: "converterName", icon: "sync_alt", formats: ["PNG", "JPG", "WebP", "PDF"], accept: "image/*,application/pdf", multiple: true, quality: true },
  merge: { nameKey: "mergeName", icon: "call_merge", formats: ["PDF"], accept: "application/pdf", multiple: true, quality: false },
  split: { nameKey: "splitName", icon: "content_cut", formats: ["PDF pages (.zip)"], accept: "application/pdf", multiple: false, quality: false },
  compress: { nameKey: "compressName", icon: "compress", formats: ["PDF"], accept: "application/pdf", multiple: false, quality: true },
  "pdf-jpg": { nameKey: "pdfImageName", icon: "image", formats: ["JPG", "PNG"], accept: "application/pdf", multiple: false, quality: true },
  "jpg-pdf": { nameKey: "imagePdfName", icon: "picture_as_pdf", formats: ["PDF"], accept: "image/jpeg,image/png,image/webp", multiple: true, quality: false },
  "image-ico": { nameKey: "icoName", icon: "web_asset", formats: ["ICO"], accept: "image/jpeg,image/png", multiple: false, quality: true },
  favicon: { nameKey: "faviconName", icon: "app_shortcut", formats: ["Favicon files (.zip)"], accept: "image/*", multiple: false, quality: true }
};

const translations = window.CF24_I18N || {};
let currentLanguage = localStorage.getItem("convertfiles24-language");
if (!translations[currentLanguage]) {
  const browserLanguage = (navigator.language || "en").split("-")[0].toLowerCase();
  currentLanguage = translations[browserLanguage] ? browserLanguage : "en";
}

function tr(key, variables = {}) {
  let value = translations[currentLanguage]?.[key] || translations.en?.[key] || key;
  Object.entries(variables).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}

const root = document.documentElement;
const themeButton = document.querySelector("#themeButton");
const mobileThemeButton = document.querySelector("#mobileThemeButton");
const themeIcon = document.querySelector("#themeIcon");
const languageButton = document.querySelector("#languageButton");
const languageMenu = document.querySelector("#languageMenu");
const languageLabel = document.querySelector("#languageLabel");
const mobileMenuButton = document.querySelector("#mobileMenuButton");
const mobileNav = document.querySelector("#mobileNav");
const mobileNavDismiss = document.querySelector("#mobileNavDismiss");
const mobileLanguageSelect = document.querySelector("#mobileLanguageSelect");
const desktopNavLinks = [...document.querySelectorAll(".desktop-nav .nav-link")];
const toolsSection = document.querySelector("#tools");
const privacySection = document.querySelector("#privacy");
const dialog = document.querySelector("#workspaceDialog");
const workspaceBody = document.querySelector("#workspaceBody");
const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const fileList = document.querySelector("#fileList");
const clearButton = document.querySelector("#clearButton");
const convertButton = document.querySelector("#convertButton");
const convertLabel = document.querySelector("#convertLabel");
const formatSelect = document.querySelector("#formatSelect");
const qualityRange = document.querySelector("#qualityRange");
const qualityOutput = document.querySelector("#qualityOutput");
const qualitySetting = document.querySelector("#qualitySetting");
const keepNames = document.querySelector("#keepNames");
const successPanel = document.querySelector("#successPanel");
const toast = document.querySelector("#toast");

document.querySelectorAll(".material-symbols-outlined").forEach((icon) => {
  icon.classList.add("notranslate");
  icon.setAttribute("translate", "no");
  icon.setAttribute("aria-hidden", "true");
});

let selectedFiles = [];
let currentTool = tools.converter;
let toastTimer;
let downloadResult = null;
let navSelectionLockedUntil = 0;
let navScrollFrame = null;

function setActiveNav(targetId) {
  desktopNavLinks.forEach((link) => {
    const active = link.getAttribute("href") === targetId;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function updateActiveNav() {
  navScrollFrame = null;
  if (Date.now() < navSelectionLockedUntil) return;
  const headerOffset = 96;
  const atPrivacy = privacySection.getBoundingClientRect().top <= headerOffset
    || window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
  setActiveNav(atPrivacy ? "#privacy" : "#tools");
}

window.addEventListener("scroll", () => {
  if (navScrollFrame !== null) return;
  navScrollFrame = requestAnimationFrame(updateActiveNav);
}, { passive: true });

const savedTheme = localStorage.getItem("convertfiles24-theme");
setTheme(savedTheme === "dark" ? "dark" : "light");

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
  themeButton.setAttribute("aria-label", dark ? tr("switchLight") : tr("switchDark"));
  mobileThemeButton.textContent = dark ? tr("mobileLightMode") : tr("mobileDarkMode");
}

languageButton.addEventListener("click", () => {
  const isOpen = languageButton.getAttribute("aria-expanded") === "true";
  languageButton.setAttribute("aria-expanded", String(!isOpen));
  languageMenu.hidden = isOpen;
});

languageMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-language]");
  if (!option) return;
  applyLanguage(option.dataset.lang || "en", true);
  languageMenu.hidden = true;
  languageButton.setAttribute("aria-expanded", "false");
});

function applyLanguage(language, remember = false) {
  currentLanguage = translations[language] ? language : "en";
  document.documentElement.lang = currentLanguage;
  if (remember) localStorage.setItem("convertfiles24-language", currentLanguage);
  languageLabel.textContent = tr("languageName");
  mobileLanguageSelect.value = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = tr(element.dataset.i18n);
  });
  if (dialog.open) document.querySelector("#workspaceTitle").textContent = tr(currentTool.nameKey);
  document.querySelector("#closeDialogButton").setAttribute("aria-label", tr("closeWorkspace"));
  setTheme(root.dataset.theme === "dark" ? "dark" : "light");
  setMobileMenu(mobileMenuButton.getAttribute("aria-expanded") === "true");
  renderFiles();
}

document.addEventListener("click", (event) => {
  if (!event.target.closest(".language-wrap")) {
    languageMenu.hidden = true;
    languageButton.setAttribute("aria-expanded", "false");
  }
});

function setMobileMenu(open) {
  mobileMenuButton.setAttribute("aria-expanded", String(open));
  mobileMenuButton.setAttribute("aria-label", tr(open ? "closeNavigation" : "openNavigation"));
  mobileNav.hidden = !open;
  mobileNavDismiss.hidden = !open;
}

mobileMenuButton.addEventListener("click", () => {
  setMobileMenu(mobileMenuButton.getAttribute("aria-expanded") !== "true");
});

mobileNavDismiss.addEventListener("click", () => setMobileMenu(false));

mobileNav.addEventListener("click", (event) => {
  if (!event.target.closest('a, #mobileThemeButton')) return;
  setMobileMenu(false);
});

mobileLanguageSelect.addEventListener("change", () => {
  applyLanguage(mobileLanguageSelect.value, true);
  setMobileMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!languageMenu.hidden) {
    languageMenu.hidden = true;
    languageButton.setAttribute("aria-expanded", "false");
    languageButton.focus();
  }
  if (mobileMenuButton.getAttribute("aria-expanded") === "true") {
    setMobileMenu(false);
    mobileMenuButton.focus();
  }
});

document.querySelectorAll(".tool-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".tool-card.is-selected").forEach((selectedCard) => selectedCard.classList.remove("is-selected"));
    card.classList.add("is-selected");
    openWorkspace(card.dataset.tool, card.dataset.accept);
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId === "#top" ? document.querySelector("#top") : document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    if (targetId === "#top") {
      setActiveNav("#tools");
      navSelectionLockedUntil = Date.now() + 800;
      window.setTimeout(updateActiveNav, 850);
    } else if (targetId === "#tools" || targetId === "#privacy") {
      setActiveNav(targetId);
      navSelectionLockedUntil = Date.now() + 800;
      window.setTimeout(updateActiveNav, 850);
    }
    if (targetId === "#top") window.scrollTo({ top: 0, behavior: "smooth" });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `${location.pathname}${location.search}`);
  });
});

updateActiveNav();

function openWorkspace(toolKey, accept) {
  currentTool = tools[toolKey] || tools.converter;
  document.querySelector("#workspaceTitle").textContent = tr(currentTool.nameKey);
  document.querySelector("#dialogToolIcon").textContent = currentTool.icon;
  workspaceBody.hidden = false;
  successPanel.hidden = true;
  fileInput.accept = accept || currentTool.accept || "";
  fileInput.multiple = currentTool.multiple !== false;
  formatSelect.innerHTML = currentTool.formats.map((format) => `<option>${format}</option>`).join("");
  qualitySetting.hidden = !currentTool.quality;
  resetWorkspace();
  dialog.showModal();
}

document.querySelector("#closeDialogButton").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  resetWorkspace();
});
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
  convertLabel.textContent = tr("processing");
  successPanel.hidden = true;
  downloadResult = null;
  try {
    downloadResult = await processFiles();
    convertButton.classList.remove("processing");
    convertButton.disabled = false;
    convertLabel.textContent = selectedFiles.length === 1 ? tr("convertOne") : tr("convertMany", { count: selectedFiles.length });
    successPanel.hidden = false;
    document.querySelectorAll(".file-status").forEach((status) => { status.textContent = tr("ready"); });
  } catch (error) {
    convertButton.classList.remove("processing");
    convertButton.disabled = false;
    convertLabel.textContent = selectedFiles.length === 1 ? tr("convertOne") : tr("convertMany", { count: selectedFiles.length });
    showToast(error.message || "Could not process this file.");
  }
});

document.querySelector("#downloadButton").addEventListener("click", () => {
  if (!downloadResult) {
    showToast(tr("convertFiles"));
    return;
  }
  downloadBlob(downloadResult.blob, downloadResult.name);
});

function setFiles(files) {
  selectedFiles = currentTool.multiple === false ? files.slice(0, 1) : files;
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
  const quality = Number(qualityRange.value) / 100;

  if (currentTool === tools.converter) {
    const format = formatSelect.value;
    const hasPdf = selectedFiles.some((file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name));
    if (format === "PDF") {
      if (hasPdf) return selectedFiles.length > 1 ? mergePdfFiles(selectedFiles) : passthroughPdf(selectedFiles[0]);
      return createPdfFromImages(selectedFiles);
    }
    if (hasPdf) return pdfToImages(selectedFiles[0], format === "WebP" ? "PNG" : format, quality);
    const imageFile = firstImageFile();
    const mime = imageMimeFromFormat(format);
    const blob = await createImageBlob(imageFile, mime, quality);
    return { blob, name: buildOutputName(imageFile.name, format) };
  }

  if (currentTool === tools.merge) return mergePdfFiles(selectedFiles);
  if (currentTool === tools.split) return splitPdfFile(selectedFiles[0]);
  if (currentTool === tools.compress) return compressPdfFile(selectedFiles[0], quality);
  if (currentTool === tools["pdf-jpg"]) return pdfToImages(selectedFiles[0], formatSelect.value, quality);
  if (currentTool === tools["jpg-pdf"]) return createPdfFromImages(selectedFiles);

  if (currentTool === tools["image-ico"]) {
    const imageFile = firstImageFile();
    const icoBlob = await createIcoBlob(imageFile, [16, 32, 48, 64, 128, 256]);
    return { blob: icoBlob, name: `${baseName(imageFile.name)}.ico` };
  }

  if (currentTool === tools.favicon) {
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

  throw new Error("This conversion is not available.");
}

async function passthroughPdf(file) {
  const input = pdfFiles([file])[0];
  return { blob: new Blob([await input.arrayBuffer()], { type: "application/pdf" }), name: `${baseName(input.name)}.pdf` };
}

function requirePdfLib() {
  if (!window.PDFLib) throw new Error(`PDF tools are still loading. ${tr("tryAgain")}`);
  return window.PDFLib;
}

function requirePdfJs() {
  if (!window.pdfjsLib) throw new Error(`PDF preview tools are still loading. ${tr("tryAgain")}`);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "assets/pdfjs/pdf.worker.min.js";
  return window.pdfjsLib;
}

function pdfFiles(files) {
  const list = files.filter((file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name));
  if (!list.length) throw new Error(tr("choosePdf"));
  return list;
}

async function createPdfFromImages(files) {
  const images = files.filter((file) => file.type.startsWith("image/"));
  if (!images.length) throw new Error(tr("chooseImage"));
  const { PDFDocument } = requirePdfLib();
  const pdf = await PDFDocument.create();
  for (const file of images) {
    const png = await createImageBlob(file, "image/png", 1);
    const embedded = await pdf.embedPng(await png.arrayBuffer());
    const page = pdf.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
  }
  const bytes = await pdf.save({ useObjectStreams: true });
  return { blob: new Blob([bytes], { type: "application/pdf" }), name: `${baseName(images[0].name)}.pdf` };
}

async function mergePdfFiles(files) {
  const inputs = pdfFiles(files);
  if (inputs.length < 2) throw new Error(tr("mergeTwo"));
  const { PDFDocument } = requirePdfLib();
  const output = await PDFDocument.create();
  for (const file of inputs) {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  const bytes = await output.save({ useObjectStreams: true });
  return { blob: new Blob([bytes], { type: "application/pdf" }), name: "merged.pdf" };
}

async function splitPdfFile(file) {
  const input = pdfFiles([file])[0];
  const { PDFDocument } = requirePdfLib();
  if (!window.JSZip) throw new Error(`ZIP tools are still loading. ${tr("tryAgain")}`);
  const source = await PDFDocument.load(await input.arrayBuffer());
  const zip = new JSZip();
  for (let index = 0; index < source.getPageCount(); index += 1) {
    const output = await PDFDocument.create();
    const [page] = await output.copyPages(source, [index]);
    output.addPage(page);
    zip.file(`${baseName(input.name)}-page-${index + 1}.pdf`, await output.save({ useObjectStreams: true }));
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return { blob, name: `${baseName(input.name)}-pages.zip` };
}

async function renderPdfPage(page, scale, mime, quality) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const context = canvas.getContext("2d", { alpha: mime !== "image/jpeg" });
  if (mime === "image/jpeg") {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  await page.render({ canvasContext: context, viewport }).promise;
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not render this PDF page.")), mime, quality));
}

async function pdfToImages(file, format, quality) {
  const input = pdfFiles([file])[0];
  const pdfjs = requirePdfJs();
  const documentTask = pdfjs.getDocument({ data: await input.arrayBuffer() });
  const pdf = await documentTask.promise;
  const mime = format === "PNG" ? "image/png" : "image/jpeg";
  const extension = format === "PNG" ? "png" : "jpg";
  if (pdf.numPages === 1) {
    const blob = await renderPdfPage(await pdf.getPage(1), 1.7, mime, quality);
    return { blob, name: `${baseName(input.name)}-page-1.${extension}` };
  }
  if (!window.JSZip) throw new Error(`ZIP tools are still loading. ${tr("tryAgain")}`);
  const zip = new JSZip();
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const blob = await renderPdfPage(await pdf.getPage(pageNumber), 1.7, mime, quality);
    zip.file(`${baseName(input.name)}-page-${pageNumber}.${extension}`, blob);
  }
  return { blob: await zip.generateAsync({ type: "blob" }), name: `${baseName(input.name)}-${extension}.zip` };
}

async function compressPdfFile(file, quality) {
  const input = pdfFiles([file])[0];
  const pdfjs = requirePdfJs();
  const { PDFDocument } = requirePdfLib();
  const source = await pdfjs.getDocument({ data: await input.arrayBuffer() }).promise;
  const output = await PDFDocument.create();
  const renderQuality = Math.min(.86, Math.max(.48, quality));
  for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
    const page = await source.getPage(pageNumber);
    const original = page.getViewport({ scale: 1 });
    const jpeg = await renderPdfPage(page, 1.35, "image/jpeg", renderQuality);
    const embedded = await output.embedJpg(await jpeg.arrayBuffer());
    const outPage = output.addPage([original.width, original.height]);
    outPage.drawImage(embedded, { x: 0, y: 0, width: original.width, height: original.height });
  }
  const bytes = await output.save({ useObjectStreams: true });
  return { blob: new Blob([bytes], { type: "application/pdf" }), name: `${baseName(input.name)}-compressed.pdf` };
}

function firstImageFile() {
  const imageFile = selectedFiles.find((file) => file.type.startsWith("image/"));
  if (!imageFile) throw new Error(tr("chooseImage"));
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

async function createImageBlob(file, mime, quality) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");

  if (mime === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create image output."));
    }, mime, quality);
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

function imageMimeFromFormat(format) {
  if (format === "PNG") return "image/png";
  if (format === "JPG") return "image/jpeg";
  if (format === "WebP") return "image/webp";
  throw new Error("Choose PNG, JPG, or WebP for image conversion.");
}

function extensionFromFormat(format) {
  return format === "JPG" ? "jpg" : format.toLowerCase();
}

function buildOutputName(inputName, format) {
  const name = keepNames.checked ? baseName(inputName) : "convertfiles24";
  return `${name}.${extensionFromFormat(format)}`;
}

function renderFiles() {
  convertButton.disabled = selectedFiles.length === 0;
  convertLabel.textContent = selectedFiles.length ? (selectedFiles.length === 1 ? tr("convertOne") : tr("convertMany", { count: selectedFiles.length })) : tr("convertFiles");
  if (!selectedFiles.length) {
    fileList.innerHTML = `<p class="empty-state">${escapeHtml(tr("emptyFiles"))}</p>`;
    return;
  }
  fileList.innerHTML = selectedFiles.map((file) => `
    <div class="file-row">
      <span class="file-type">${escapeHtml(extension(file.name))}</span>
      <span><strong title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</strong><small>${formatBytes(file.size)} · ${escapeHtml(tr("localFile"))}</small></span>
      <span class="file-status">${escapeHtml(tr("queued"))}</span>
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

applyLanguage(currentLanguage, false);

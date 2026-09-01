const tools = {
  converter: { nameKey: "converterName", icon: "sync_alt", formats: ["PNG", "JPG", "WebP", "PDF"], accept: "image/*,application/pdf", multiple: true, quality: true, maxFiles: 30, maxFileMB: 25, maxTotalMB: 250 },
  merge: { nameKey: "mergeName", icon: "call_merge", formats: ["PDF"], accept: "application/pdf", multiple: true, quality: false, maxFiles: 100, maxFileMB: 50, maxTotalMB: 500, mobileTotalMB: 200 },
  split: { nameKey: "splitName", icon: "content_cut", formats: ["PDF pages (.zip)"], accept: "application/pdf", multiple: false, quality: false, maxFiles: 1, maxFileMB: 200, maxTotalMB: 200 },
  compress: { nameKey: "compressName", icon: "compress", formats: ["PDF"], accept: "application/pdf", multiple: false, quality: true, maxFiles: 1, maxFileMB: 200, maxTotalMB: 200 },
  "pdf-jpg": { nameKey: "pdfImageName", icon: "image", formats: ["JPG", "PNG"], accept: "application/pdf", multiple: false, quality: true, maxFiles: 1, maxFileMB: 200, maxTotalMB: 200 },
  "jpg-pdf": { nameKey: "imagePdfName", icon: "picture_as_pdf", formats: ["PDF"], accept: "image/jpeg,image/png,image/webp", multiple: true, quality: false, maxFiles: 100, maxFileMB: 25, maxTotalMB: 300, mobileTotalMB: 200 },
  "image-ico": { nameKey: "icoName", icon: "web_asset", formats: ["ICO"], accept: "image/jpeg,image/png", multiple: false, quality: true, maxFiles: 1, maxFileMB: 20, maxTotalMB: 20 },
  favicon: { nameKey: "faviconName", icon: "app_shortcut", formats: ["Favicon files (.zip)"], accept: "image/*", multiple: false, quality: true, maxFiles: 1, maxFileMB: 20, maxTotalMB: 20 },
  "heic-jpg": { nameKey: "heicJpgName", icon: "photo_camera", formats: ["JPG"], accept: ".heic,.heif,image/heic,image/heif", multiple: true, quality: true, maxFiles: 20, maxFileMB: 25, maxTotalMB: 200 },
  "image-compress": { nameKey: "imageCompressName", icon: "photo_size_select_small", formats: ["JPG / PNG / WebP"], accept: "image/jpeg,image/png,image/webp", multiple: true, quality: true, defaultQuality: 82, maxFiles: 30, maxFileMB: 25, maxTotalMB: 250 },
  "image-resize": { nameKey: "imageResizeName", icon: "aspect_ratio", formats: ["JPG", "PNG", "WebP"], accept: "image/jpeg,image/png,image/webp", multiple: false, quality: true, maxFiles: 1, maxFileMB: 25, maxTotalMB: 25 },
  "image-crop": { nameKey: "imageCropName", icon: "crop", formats: ["JPG", "PNG", "WebP"], accept: "image/jpeg,image/png,image/webp", multiple: false, quality: true, maxFiles: 1, maxFileMB: 25, maxTotalMB: 25 }
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
const mobileMenuClose = document.querySelector("#mobileMenuClose");
const mobileLanguageSelect = document.querySelector("#mobileLanguageSelect");
const desktopNavLinks = [...document.querySelectorAll(".desktop-nav .nav-link")];
const toolsSection = document.querySelector("#tools");
const privacySection = document.querySelector("#privacy");
const toolGrid = document.querySelector(".tool-grid");
const defaultToolOrder = [...toolGrid.children];
const dialog = document.querySelector("#workspaceDialog");
const workspaceBody = document.querySelector("#workspaceBody");
const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const dropTitle = document.querySelector("#dropTitle");
const dropCopy = document.querySelector("#dropCopy");
const chooseFilesLabel = document.querySelector("#chooseFilesLabel");
const fileLimitText = document.querySelector("#fileLimitText");
const fileList = document.querySelector("#fileList");
const clearButton = document.querySelector("#clearButton");
const convertButton = document.querySelector("#convertButton");
const convertLabel = document.querySelector("#convertLabel");
const formatSelect = document.querySelector("#formatSelect");
const qualityRange = document.querySelector("#qualityRange");
const qualityOutput = document.querySelector("#qualityOutput");
const qualitySetting = document.querySelector("#qualitySetting");
const resizeSettings = document.querySelector("#resizeSettings");
const resizeWidth = document.querySelector("#resizeWidth");
const resizeHeight = document.querySelector("#resizeHeight");
const maintainAspect = document.querySelector("#maintainAspect");
const cropEditor = document.querySelector("#cropEditor");
const cropCanvas = document.querySelector("#cropCanvas");
const keepNames = document.querySelector("#keepNames");
const successPanel = document.querySelector("#successPanel");
const toast = document.querySelector("#toast");
const freeInfoDialog = document.querySelector("#freeInfoDialog");
const backToTopButton = document.querySelector("#backToTopButton");

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
let toolsOrderedForPhone = null;
let resizeSourceSize = null;
let cropImage = null;
let cropSelection = null;
let cropInteraction = null;

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
  updateResponsiveWorkspaceCopy();
  if (dialog.open) document.querySelector("#workspaceTitle").textContent = tr(currentTool.nameKey);
  document.querySelector("#closeDialogButton").setAttribute("aria-label", tr("closeWorkspace"));
  backToTopButton.setAttribute("aria-label", tr("backToTop"));
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
  mobileMenuClose.setAttribute("aria-label", tr("closeNavigation"));
  mobileNav.hidden = !open;
  mobileNavDismiss.hidden = !open;
  root.classList.toggle("mobile-menu-open", open);
  updateBackToTop();
}

mobileMenuButton.addEventListener("click", () => {
  setMobileMenu(mobileMenuButton.getAttribute("aria-expanded") !== "true");
});

mobileNavDismiss.addEventListener("click", () => setMobileMenu(false));
mobileMenuClose.addEventListener("click", () => {
  setMobileMenu(false);
  mobileMenuButton.focus();
});

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

document.querySelectorAll("[data-benefit-action]").forEach((card) => {
  card.addEventListener("click", () => {
    const action = card.dataset.benefitAction;
    if (action === "privacy") {
      document.querySelector("#privacy")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (action === "tools") {
      const featuredCard = document.querySelector('[data-tool="converter"]');
      document.querySelector("#tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
      featuredCard?.classList.remove("benefit-highlight");
      window.requestAnimationFrame(() => featuredCard?.classList.add("benefit-highlight"));
      window.setTimeout(() => featuredCard?.classList.remove("benefit-highlight"), 1700);
      return;
    }
    if (action === "free") {
      freeInfoDialog?.showModal();
      updateBackToTop();
    }
  });
});

document.querySelector("#closeFreeInfoButton")?.addEventListener("click", () => freeInfoDialog.close());
document.querySelector("#confirmFreeInfoButton")?.addEventListener("click", () => freeInfoDialog.close());
freeInfoDialog?.addEventListener("click", (event) => {
  if (event.target === freeInfoDialog) freeInfoDialog.close();
});
freeInfoDialog?.addEventListener("close", updateBackToTop);

function updateBackToTop() {
  const overlayOpen = mobileMenuButton.getAttribute("aria-expanded") === "true" || dialog.open || freeInfoDialog?.open;
  backToTopButton.hidden = window.innerWidth > 680 || window.scrollY < 500 || overlayOpen;
}

backToTopButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
window.addEventListener("scroll", updateBackToTop, { passive: true });
window.addEventListener("resize", updateBackToTop);

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
  resizeSettings.hidden = currentTool !== tools["image-resize"];
  qualityRange.value = String(currentTool.defaultQuality || 92);
  qualityOutput.value = `${qualityRange.value}%`;
  updateFileLimitText();
  resetWorkspace();
  dialog.showModal();
  updateBackToTop();
}

document.querySelector("#closeDialogButton").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  resetWorkspace();
  updateBackToTop();
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

resizeWidth.addEventListener("input", () => {
  if (!maintainAspect.checked || !resizeSourceSize || !resizeWidth.value) return;
  resizeHeight.value = String(Math.max(1, Math.round(Number(resizeWidth.value) / resizeSourceSize.ratio)));
});

resizeHeight.addEventListener("input", () => {
  if (!maintainAspect.checked || !resizeSourceSize || !resizeHeight.value) return;
  resizeWidth.value = String(Math.max(1, Math.round(Number(resizeHeight.value) * resizeSourceSize.ratio)));
});

cropCanvas.addEventListener("pointerdown", startCropInteraction);
cropCanvas.addEventListener("pointermove", moveCropInteraction);
cropCanvas.addEventListener("pointerup", endCropInteraction);
cropCanvas.addEventListener("pointercancel", endCropInteraction);

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
  const limits = currentLimits();
  if (files.length > limits.maxFiles) {
    showToast(tr("tooManyFiles", { count: limits.maxFiles }));
    fileInput.value = "";
    return;
  }
  const oversized = files.find((file) => file.size > limits.maxFileBytes);
  if (oversized) {
    showToast(tr("fileTooLarge", { size: limits.maxFileMB }));
    fileInput.value = "";
    return;
  }
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > limits.maxTotalBytes) {
    showToast(tr("totalTooLarge", { size: limits.maxTotalMB }));
    fileInput.value = "";
    return;
  }
  selectedFiles = files;
  downloadResult = null;
  successPanel.hidden = true;
  renderFiles();
  prepareSpecialImageTool().catch((error) => {
    showToast(error.message || tr("tryAgain"));
    resetWorkspace();
  });
}

function resetWorkspace() {
  selectedFiles = [];
  downloadResult = null;
  fileInput.value = "";
  successPanel.hidden = true;
  convertButton.classList.remove("processing");
  resizeSourceSize = null;
  cropImage = null;
  cropSelection = null;
  cropInteraction = null;
  resizeWidth.value = "";
  resizeHeight.value = "";
  cropEditor.hidden = true;
  dropZone.hidden = false;
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
  if (currentTool === tools["heic-jpg"]) return convertHeicToJpg(selectedFiles, quality);
  if (currentTool === tools["image-compress"]) return compressImageFiles(selectedFiles, quality);
  if (currentTool === tools["image-resize"]) return resizeImageFile(selectedFiles[0], quality);
  if (currentTool === tools["image-crop"]) return cropImageFile(selectedFiles[0], quality);

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

function heicFiles(files) {
  const list = files.filter((file) => /\.(heic|heif)$/i.test(file.name) || /image\/hei[cf]/i.test(file.type));
  if (!list.length) throw new Error(tr("chooseHeic"));
  return list;
}

async function convertHeicToJpg(files, quality) {
  if (typeof window.heic2any !== "function") throw new Error(`HEIC tools are still loading. ${tr("tryAgain")}`);
  const inputs = heicFiles(files);
  const outputs = [];

  try {
    for (let fileIndex = 0; fileIndex < inputs.length; fileIndex += 1) {
      const file = inputs[fileIndex];
      const converted = await window.heic2any({ blob: file, toType: "image/jpeg", quality });
      const blobs = Array.isArray(converted) ? converted : [converted];
      for (let imageIndex = 0; imageIndex < blobs.length; imageIndex += 1) {
        const fileSuffix = inputs.length > 1 ? `-${fileIndex + 1}` : "";
        const imageSuffix = blobs.length > 1 ? `-${imageIndex + 1}` : "";
        const outputBase = keepNames.checked ? baseName(file.name) : "convertfiles24";
        outputs.push({ blob: blobs[imageIndex], name: `${outputBase}${fileSuffix}${imageSuffix}.jpg` });
      }
    }
  } catch (error) {
    throw new Error(tr("heicConvertError"));
  }

  if (outputs.length === 1) return outputs[0];
  if (!window.JSZip) throw new Error(`ZIP tools are still loading. ${tr("tryAgain")}`);
  const zip = new JSZip();
  outputs.forEach((output) => zip.file(output.name, output.blob));
  return { blob: await zip.generateAsync({ type: "blob" }), name: "convertfiles24-heic-jpg.zip" };
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

async function compressImageFiles(files, quality) {
  const images = files.filter((file) => /image\/(jpeg|png|webp)/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name));
  if (!images.length) throw new Error(tr("chooseCompressImage"));

  const outputs = [];
  for (const file of images) {
    const mime = compressedImageMime(file);
    const encoded = await createImageBlob(file, mime, quality);
    const blob = encoded.size < file.size ? encoded : file;
    outputs.push({ blob, name: `${baseName(file.name)}-compressed.${extensionFromMime(mime)}` });
  }

  if (outputs.length === 1) return outputs[0];
  if (!window.JSZip) throw new Error(`ZIP tools are still loading. ${tr("tryAgain")}`);
  const zip = new JSZip();
  outputs.forEach((output) => zip.file(output.name, output.blob));
  return { blob: await zip.generateAsync({ type: "blob" }), name: "convertfiles24-compressed-images.zip" };
}

function compressedImageMime(file) {
  if (/png/i.test(file.type) || /\.png$/i.test(file.name)) return "image/png";
  if (/webp/i.test(file.type) || /\.webp$/i.test(file.name)) return "image/webp";
  return "image/jpeg";
}

function extensionFromMime(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

async function prepareSpecialImageTool() {
  if (!selectedFiles.length || (currentTool !== tools["image-resize"] && currentTool !== tools["image-crop"])) return;
  const image = await loadImage(selectedFiles[0]);
  selectImageOutputFormat(selectedFiles[0]);

  if (currentTool === tools["image-resize"]) {
    resizeSourceSize = { width: image.naturalWidth, height: image.naturalHeight, ratio: image.naturalWidth / image.naturalHeight };
    resizeWidth.value = String(image.naturalWidth);
    resizeHeight.value = String(image.naturalHeight);
    return;
  }

  cropImage = image;
  dropZone.hidden = true;
  cropEditor.hidden = false;
  await new Promise((resolve) => requestAnimationFrame(resolve));
  setupCropCanvas();
}

function selectImageOutputFormat(file) {
  const mime = compressedImageMime(file);
  const format = mime === "image/jpeg" ? "JPG" : mime === "image/webp" ? "WebP" : "PNG";
  formatSelect.value = format;
}

function setupCropCanvas() {
  if (!cropImage) return;
  const availableWidth = Math.max(240, cropEditor.clientWidth - 28);
  const scale = Math.min(1, availableWidth / cropImage.naturalWidth, 330 / cropImage.naturalHeight);
  cropCanvas.width = Math.max(1, Math.round(cropImage.naturalWidth * scale));
  cropCanvas.height = Math.max(1, Math.round(cropImage.naturalHeight * scale));
  cropSelection = {
    x: cropCanvas.width * .1,
    y: cropCanvas.height * .1,
    width: cropCanvas.width * .8,
    height: cropCanvas.height * .8
  };
  drawCropCanvas();
}

function cropPointerPosition(event) {
  const rect = cropCanvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(cropCanvas.width, (event.clientX - rect.left) * cropCanvas.width / rect.width)),
    y: Math.max(0, Math.min(cropCanvas.height, (event.clientY - rect.top) * cropCanvas.height / rect.height))
  };
}

function startCropInteraction(event) {
  if (!cropImage || !cropSelection) return;
  event.preventDefault();
  const point = cropPointerPosition(event);
  const inside = point.x >= cropSelection.x && point.x <= cropSelection.x + cropSelection.width
    && point.y >= cropSelection.y && point.y <= cropSelection.y + cropSelection.height;
  cropInteraction = inside
    ? { mode: "move", offsetX: point.x - cropSelection.x, offsetY: point.y - cropSelection.y }
    : { mode: "create", startX: point.x, startY: point.y };
  if (!inside) cropSelection = { x: point.x, y: point.y, width: 1, height: 1 };
  cropCanvas.setPointerCapture?.(event.pointerId);
}

function moveCropInteraction(event) {
  if (!cropInteraction || !cropSelection) return;
  event.preventDefault();
  const point = cropPointerPosition(event);
  if (cropInteraction.mode === "move") {
    cropSelection.x = Math.max(0, Math.min(cropCanvas.width - cropSelection.width, point.x - cropInteraction.offsetX));
    cropSelection.y = Math.max(0, Math.min(cropCanvas.height - cropSelection.height, point.y - cropInteraction.offsetY));
  } else {
    cropSelection.x = Math.min(cropInteraction.startX, point.x);
    cropSelection.y = Math.min(cropInteraction.startY, point.y);
    cropSelection.width = Math.abs(point.x - cropInteraction.startX);
    cropSelection.height = Math.abs(point.y - cropInteraction.startY);
  }
  drawCropCanvas();
}

function endCropInteraction(event) {
  if (!cropInteraction) return;
    if (cropCanvas.hasPointerCapture?.(event.pointerId)) {
      cropCanvas.releasePointerCapture(event.pointerId);
    }
  cropInteraction = null;
  drawCropCanvas();
}

function drawCropCanvas() {
  if (!cropImage || !cropSelection) return;
  const context = cropCanvas.getContext("2d");
  context.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
  context.drawImage(cropImage, 0, 0, cropCanvas.width, cropCanvas.height);
  context.fillStyle = "rgba(5, 12, 28, .58)";
  context.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
  context.save();
  context.beginPath();
  context.rect(cropSelection.x, cropSelection.y, cropSelection.width, cropSelection.height);
  context.clip();
  context.drawImage(cropImage, 0, 0, cropCanvas.width, cropCanvas.height);
  context.restore();
  context.strokeStyle = "#60a5fa";
  context.lineWidth = 2;
  context.setLineDash([6, 4]);
  context.strokeRect(cropSelection.x, cropSelection.y, cropSelection.width, cropSelection.height);
  context.setLineDash([]);
}

async function resizeImageFile(file, quality) {
  const width = Math.round(Number(resizeWidth.value));
  const height = Math.round(Number(resizeHeight.value));
  if (!width || !height || width < 1 || height < 1 || width > 12000 || height > 12000) throw new Error(tr("invalidDimensions"));
  const image = await loadImage(file);
  const mime = imageMimeFromFormat(formatSelect.value);
  const blob = await renderImageRegion(image, 0, 0, image.naturalWidth, image.naturalHeight, width, height, mime, quality);
  return { blob, name: `${baseName(file.name)}-${width}x${height}.${extensionFromMime(mime)}` };
}

async function cropImageFile(file, quality) {
  if (!cropImage || !cropSelection || cropSelection.width < 4 || cropSelection.height < 4) throw new Error(tr("selectCropArea"));
  const scaleX = cropImage.naturalWidth / cropCanvas.width;
  const scaleY = cropImage.naturalHeight / cropCanvas.height;
  const sourceX = Math.round(cropSelection.x * scaleX);
  const sourceY = Math.round(cropSelection.y * scaleY);
  const sourceWidth = Math.max(1, Math.round(cropSelection.width * scaleX));
  const sourceHeight = Math.max(1, Math.round(cropSelection.height * scaleY));
  const mime = imageMimeFromFormat(formatSelect.value);
  const blob = await renderImageRegion(cropImage, sourceX, sourceY, sourceWidth, sourceHeight, sourceWidth, sourceHeight, mime, quality);
  return { blob, name: `${baseName(file.name)}-cropped.${extensionFromMime(mime)}` };
}

function renderImageRegion(image, sourceX, sourceY, sourceWidth, sourceHeight, width, height, mime, quality) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (mime === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error(tr("imageProcessError"))), mime, quality);
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
  dialog.classList.toggle("has-files", selectedFiles.length > 0);
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

function updateResponsiveWorkspaceCopy() {
  const isPhone = window.innerWidth <= 600;
  dropTitle.textContent = tr(isPhone ? "mobileDropTitle" : "dropTitle");
  dropCopy.textContent = tr(isPhone ? "mobileDropCopy" : "dropCopy");
  chooseFilesLabel.textContent = tr(isPhone ? "mobileChooseFiles" : "chooseFiles");
  updateFileLimitText();
}

function currentLimits() {
  const mobile = window.innerWidth <= 600;
  const maxTotalMB = mobile && currentTool.mobileTotalMB ? currentTool.mobileTotalMB : currentTool.maxTotalMB;
  return {
    maxFiles: currentTool.maxFiles,
    maxFileMB: currentTool.maxFileMB,
    maxTotalMB,
    maxFileBytes: currentTool.maxFileMB * 1024 * 1024,
    maxTotalBytes: maxTotalMB * 1024 * 1024
  };
}

function updateFileLimitText() {
  const limits = currentLimits();
  fileLimitText.textContent = limits.maxFiles === 1
    ? tr("singleFileLimit", { size: limits.maxFileMB })
    : tr("multipleFileLimit", { count: limits.maxFiles, fileSize: limits.maxFileMB, totalSize: limits.maxTotalMB });
}

window.addEventListener("resize", updateResponsiveWorkspaceCopy);

function updateResponsiveToolOrder() {
  const isPhone = window.innerWidth <= 600;
  if (toolsOrderedForPhone === isPhone) return;
  toolsOrderedForPhone = isPhone;
  if (isPhone) {
    const heicCard = toolGrid.querySelector('[data-tool="heic-jpg"]');
    if (heicCard) toolGrid.prepend(heicCard);
    return;
  }
  defaultToolOrder.forEach((card) => toolGrid.append(card));
}

window.addEventListener("resize", updateResponsiveToolOrder);

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

updateResponsiveToolOrder();
applyLanguage(currentLanguage, false);

(() => {
  const footerOnly = document.currentScript?.dataset.footerOnly === "true";
  const imageTools = [
    ["fileConverter", "/convert/"],
    ["editImage", null, true],
    ["idPhoto", null, true],
    ["imageToIco", "/image-ico/"],
    ["faviconGenerator", "/favicon/"],
    ["heicToJpg", "/heic-jpg/"],
    ["compressImages", "/image-compress/"],
    ["resizeImages", "/image-resize/"],
    ["cropImages", "/image-crop/"],
    ["qrCode", "/qr-code/"]
  ];
  const pdfTools = [
    ["mergePdf", "/pdf-merge/"],
    ["splitPdf", "/split-pdf/"],
    ["compressPdf", "/compress-pdf/"],
    ["pdfToImages", "/pdf-jpg/"],
    ["imagesToPdf", "/jpg-pdf/"],
    ["organizePdf", "/pdf-organize/"],
    ["rotatePdf", "/rotate-pdf/"],
    ["deletePdfPages", "/delete-pdf-pages/"],
    ["extractPdfPages", "/extract-pdf-pages/"]
  ];
  const copy = {
    en: {home:"Home",imageTools:"Image Tools",pdfTools:"PDF Tools",blog:"Blog",about:"About",privacy:"Privacy Policy",terms:"Terms of Service",cookie:"Cookie Policy",disclaimer:"Disclaimer",contact:"Contact",menu:"Menu",language:"Language",theme:"Theme",comingSoon:"Coming soon",fileConverter:"File Converter",editImage:"Image Editor",idPhoto:"ID Photo / Passport Photo",imageToIco:"Image to ICO",faviconGenerator:"Favicon Generator",heicToJpg:"HEIC to JPG",compressImages:"Compress Images",resizeImages:"Resize Images",cropImages:"Crop Images",qrCode:"QR Code Generator",mergePdf:"Merge PDF",splitPdf:"Split PDF",compressPdf:"Compress PDF",pdfToImages:"PDF to JPG / PNG",imagesToPdf:"JPG / PNG to PDF",organizePdf:"Organize PDF",rotatePdf:"Rotate PDF",deletePdfPages:"Delete PDF Pages",extractPdfPages:"Extract PDF Pages"},
    ko: {home:"홈",imageTools:"이미지 도구",pdfTools:"PDF 도구",blog:"블로그",about:"소개",privacy:"개인정보처리방침",terms:"이용약관",cookie:"쿠키 정책",disclaimer:"면책 조항",contact:"문의",menu:"메뉴",language:"언어",theme:"화면 모드",comingSoon:"준비중",fileConverter:"파일 변환기",editImage:"이미지 편집",idPhoto:"증명사진/여권사진",imageToIco:"이미지를 ICO로",faviconGenerator:"파비콘 생성기",heicToJpg:"HEIC를 JPG로",compressImages:"이미지 압축",resizeImages:"이미지 크기 조절",cropImages:"이미지 자르기",qrCode:"QR 코드 만들기",mergePdf:"PDF 합치기",splitPdf:"PDF 분할",compressPdf:"PDF 압축",pdfToImages:"PDF를 JPG / PNG로",imagesToPdf:"JPG / PNG를 PDF로",organizePdf:"PDF 페이지 정리",rotatePdf:"PDF 회전",deletePdfPages:"PDF 페이지 삭제",extractPdfPages:"PDF 페이지 추출"},
    ja: {home:"ホーム",imageTools:"画像ツール",pdfTools:"PDF ツール",blog:"ブログ",about:"概要",privacy:"プライバシーポリシー",terms:"利用規約",cookie:"Cookie ポリシー",disclaimer:"免責事項",contact:"お問い合わせ",menu:"メニュー",language:"言語",theme:"表示モード",comingSoon:"準備中",fileConverter:"ファイル変換",editImage:"画像編集",idPhoto:"証明写真 / パスポート写真",imageToIco:"画像を ICO に変換",faviconGenerator:"ファビコン生成",heicToJpg:"HEIC を JPG に変換",compressImages:"画像圧縮",resizeImages:"画像サイズ変更",cropImages:"画像切り抜き",qrCode:"QR コード生成",mergePdf:"PDF 結合",splitPdf:"PDF 分割",compressPdf:"PDF 圧縮",pdfToImages:"PDF を JPG / PNG に変換",imagesToPdf:"JPG / PNG を PDF に変換",organizePdf:"PDF ページ整理",rotatePdf:"PDF を回転",deletePdfPages:"PDF ページを削除",extractPdfPages:"PDF ページを抽出"},
    es: {home:"Inicio",imageTools:"Herramientas de imagen",pdfTools:"Herramientas PDF",blog:"Blog",about:"Acerca de",privacy:"Política de privacidad",terms:"Términos de servicio",cookie:"Política de cookies",disclaimer:"Aviso legal",contact:"Contacto",menu:"Menú",language:"Idioma",theme:"Tema",comingSoon:"Próximamente",fileConverter:"Convertidor de archivos",editImage:"Editar imagen",idPhoto:"Foto de identificación / pasaporte",imageToIco:"Imagen a ICO",faviconGenerator:"Generador de favicon",heicToJpg:"HEIC a JPG",compressImages:"Comprimir imágenes",resizeImages:"Redimensionar imágenes",cropImages:"Recortar imágenes",qrCode:"Generador de códigos QR",mergePdf:"Unir PDF",splitPdf:"Dividir PDF",compressPdf:"Comprimir PDF",pdfToImages:"PDF a JPG / PNG",imagesToPdf:"JPG / PNG a PDF",organizePdf:"Organizar PDF",rotatePdf:"Girar PDF",deletePdfPages:"Eliminar páginas PDF",extractPdfPages:"Extraer páginas PDF"}
  };
  Object.assign(copy.en,{relatedTools:"Related tools",rotatePdf:"Rotate PDF",deletePdfPages:"Delete PDF Pages",extractPdfPages:"Extract PDF Pages"});
  Object.assign(copy.ko,{relatedTools:"관련 도구",rotatePdf:"PDF 회전",deletePdfPages:"PDF 페이지 삭제",extractPdfPages:"PDF 페이지 추출"});
  Object.assign(copy.ja,{relatedTools:"関連ツール",rotatePdf:"PDF を回転",deletePdfPages:"PDF ページを削除",extractPdfPages:"PDF ページを抽出"});
  Object.assign(copy.es,{relatedTools:"Herramientas relacionadas",rotatePdf:"Girar PDF",deletePdfPages:"Eliminar páginas PDF",extractPdfPages:"Extraer páginas PDF"});
  const language = () => {
    const value = document.querySelector("#languageSelect")?.value || document.documentElement.lang || localStorage.getItem("convertfiles24-language") || "en";
    return copy[value] ? value : "en";
  };
  const link = (key, href, mobile = false) => `<a href="${href}" data-cf24-label="${key}"${mobile ? "" : ""}>${copy.en[key]}</a>`;
  const toolItem = ([label, href, disabled], mobile = false) => disabled
    ? `<span class="cf24-disabled-item" aria-disabled="true"><span data-cf24-label="${label}">${copy.en[label]}</span><span class="cf24-coming-soon" data-cf24-label="comingSoon">${copy.en.comingSoon}</span></span>`
    : link(label, href, mobile);
  const menu = (key, tools, mobile = false) => `<details class="${mobile ? "cf24-mobile-menu" : "cf24-menu"}"><summary data-cf24-label="${key}">${copy.en[key]}</summary><div class="${mobile ? "cf24-mobile-dropdown" : "cf24-dropdown"}">${tools.map(tool => toolItem(tool, mobile)).join("")}</div></details>`;
  function primaryMarkup(mobile = false) {
    return `${link("home", "/", mobile)}${menu("imageTools", imageTools, mobile)}${menu("pdfTools", pdfTools, mobile)}${link("blog", "/blog", mobile)}${link("about", "/about/", mobile)}`;
  }
  function translate() {
    const labels = copy[language()];
    document.querySelectorAll("[data-cf24-label]").forEach(element => { element.textContent = labels[element.dataset.cf24Label] || copy.en[element.dataset.cf24Label]; });
  }
  function buildDesktop() {
    const shell = document.querySelector(".desktop-nav, .nav-actions");
    if (!shell || shell.querySelector(".cf24-primary-nav")) return;
    const languageControl = shell.querySelector("#languageSelect")?.closest("label");
    const themeButton = shell.querySelector("#themeButton");
    const primary = document.createElement("div");
    primary.className = "cf24-primary-nav";
    primary.setAttribute("aria-label", "Primary navigation");
    primary.innerHTML = primaryMarkup();
    shell.replaceChildren(primary);
    if (languageControl) shell.append(languageControl);
    if (themeButton) shell.append(themeButton);
  }
  function buildMobile() {
    const content = document.querySelector(".mobile-menu-content");
    if (!content || content.querySelector(".cf24-mobile-links")) return;
    content.querySelectorAll(":scope > a").forEach(element => element.remove());
    const links = document.createElement("div");
    links.className = "cf24-mobile-links";
    links.innerHTML = primaryMarkup(true);
    content.prepend(links);
  }
  function buildSharedMobile() {
    const header = document.querySelector(".site-header"), shell = header?.querySelector(".nav-shell");
    if (!header || !shell || shell.querySelector(".mobile-menu-button, .cf24-shared-mobile-button")) return;
    header.classList.add("cf24-shared-header");
    const button = document.createElement("button");
    button.className = "cf24-shared-mobile-button"; button.type = "button"; button.setAttribute("aria-label", "Open navigation"); button.setAttribute("aria-expanded", "false"); button.innerHTML = '<span class="cf24-hamburger-lines" aria-hidden="true"><i></i><i></i><i></i></span>';
    const overlay = document.createElement("button");
    overlay.className = "cf24-shared-mobile-overlay"; overlay.type = "button"; overlay.hidden = true; overlay.setAttribute("aria-label", "Close navigation");
    const panel = document.createElement("div");
    panel.className = "cf24-shared-mobile-panel"; panel.hidden = true;
    panel.innerHTML = `<div class="cf24-shared-mobile-header"><strong data-cf24-label="menu">Menu</strong><button class="cf24-shared-mobile-close" type="button" aria-label="Close navigation">×</button></div><div class="cf24-shared-mobile-content"><div class="cf24-mobile-links">${primaryMarkup(true)}</div><div class="cf24-shared-mobile-controls"><label><span data-cf24-label="language">Language</span><select id="mobileLanguageSelect"><option value="en">EN</option><option value="ko">KO</option><option value="ja">JP</option><option value="es">ES</option></select></label><button class="cf24-shared-mobile-theme" type="button" data-cf24-label="theme">Theme</button></div></div>`;
    shell.append(button); header.append(overlay, panel);
    const close = () => { panel.hidden = true; overlay.hidden = true; button.setAttribute("aria-expanded", "false"); };
    button.addEventListener("click", () => { const open = panel.hidden; panel.hidden = !open; overlay.hidden = !open; button.setAttribute("aria-expanded", String(open)); });
    overlay.addEventListener("click", close); panel.querySelector(".cf24-shared-mobile-close").addEventListener("click", close); panel.querySelectorAll("a").forEach(anchor => anchor.addEventListener("click", close));
    const desktopLanguage = document.querySelector("#languageSelect"), mobileLanguage = panel.querySelector("#mobileLanguageSelect");
    mobileLanguage.value = desktopLanguage?.value || language();
    mobileLanguage.addEventListener("change", () => { if (desktopLanguage) { desktopLanguage.value = mobileLanguage.value; desktopLanguage.dispatchEvent(new Event("change", {bubbles:true})); } else { localStorage.setItem("convertfiles24-language", mobileLanguage.value); document.documentElement.lang = mobileLanguage.value; translate(); } });
    panel.querySelector(".cf24-shared-mobile-theme").addEventListener("click", () => document.querySelector("#themeButton")?.click());
  }
  function buildFooter() {
    const footer = document.querySelector("footer");
    if (!footer) return;
    let nav = footer.querySelector("nav");
    if (!nav) { nav = document.createElement("nav"); footer.append(nav); }
    nav.classList.add("cf24-footer-nav");
    nav.setAttribute("aria-label", "Footer navigation");
    nav.innerHTML = `${link("privacy", "/privacy/")}${link("terms", "/terms/")}${link("cookie", "/cookie-policy")}${link("disclaimer", "/disclaimer")}${link("contact", "/contact")}`;
  }
  function markCurrentPage() {
    const currentPath = `${location.pathname.replace(/\/+$/, "") || "/"}/`.replace("//", "/");
    document.querySelectorAll(".cf24-mobile-dropdown a[href]").forEach(anchor => {
      const anchorPath = `${new URL(anchor.href, location.origin).pathname.replace(/\/+$/, "") || "/"}/`.replace("//", "/");
      if (anchorPath === currentPath) anchor.setAttribute("aria-current", "page");
    });
  }
  function closeMenus(event) {
    document.querySelectorAll(".cf24-menu[open]").forEach(menuElement => {
      if (!menuElement.contains(event.target)) menuElement.removeAttribute("open");
    });
  }
  function init() {
    if (!footerOnly) { buildDesktop(); buildMobile(); buildSharedMobile(); }
    buildFooter(); markCurrentPage(); translate();
    document.querySelectorAll(".cf24-menu").forEach(menuElement => menuElement.addEventListener("toggle", () => {
      if (menuElement.open) document.querySelectorAll(".cf24-menu[open]").forEach(other => { if (other !== menuElement) other.removeAttribute("open"); });
    }));
    document.addEventListener("click", closeMenus);
    document.addEventListener("keydown", event => { if (event.key === "Escape") document.querySelectorAll(".cf24-menu[open]").forEach(element => element.removeAttribute("open")); });
    document.addEventListener("change", event => { if (event.target.matches("#languageSelect, #mobileLanguageSelect")) setTimeout(translate); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

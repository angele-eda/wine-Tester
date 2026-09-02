const translations = {
  en: { allTools:"All tools",home:"Home",title:"Resize Images",local:"LOCAL IMAGE TOOL",subtitle:"Change image width and height while keeping the proportions you need.",ad:"Advertisement",selectTitle:"Select an image",dropTitle:"Choose an image to resize",dropCopy:"Choose a JPG, PNG or WebP image from your device",choose:"Choose image",limit:"1 file · Maximum 25 MB",replace:"Replace",settings:"Resize settings",width:"Width",height:"Height",ratio:"Keep aspect ratio",format:"Output format",quality:"Quality",privateTitle:"Private on-device processing",privateCopy:"Your image is never uploaded to a server.",action:"Resize image",done:"Image resized",download:"Download",exactTitle:"Exact dimensions",exactCopy:"Enter the width and height you need, up to 12,000 pixels.",safeTitle:"Files stay private",safeCopy:"All resizing happens locally in your browser.",deviceTitle:"Works on any device",deviceCopy:"Resize photos on desktop, tablet and mobile.",privacy:"Privacy Policy",terms:"Terms of Service",badFile:"Choose a JPG, PNG or WebP image under 25 MB.",badSize:"Enter a width and height between 1 and 12,000 pixels.",failed:"This image could not be resized."},
  ko: { allTools:"모든 도구",home:"홈",title:"이미지 크기 조절",local:"로컬 이미지 도구",subtitle:"필요한 비율을 유지하면서 이미지의 가로와 세로 크기를 변경하세요.",ad:"광고 영역",selectTitle:"이미지 선택",dropTitle:"크기를 조절할 이미지를 선택하세요",dropCopy:"기기에서 JPG, PNG 또는 WebP 이미지를 선택하세요",choose:"이미지 선택",limit:"파일 1개 · 최대 25MB",replace:"다른 이미지",settings:"크기 설정",width:"가로",height:"세로",ratio:"가로세로 비율 유지",format:"출력 형식",quality:"품질",privateTitle:"안전한 기기 내 처리",privateCopy:"이미지는 서버로 업로드되지 않습니다.",action:"이미지 크기 조절",done:"크기 조절 완료",download:"다운로드",exactTitle:"정확한 크기 지정",exactCopy:"최대 12,000픽셀까지 원하는 가로와 세로를 입력하세요.",safeTitle:"파일은 안전하게",safeCopy:"모든 작업은 브라우저에서 로컬로 처리됩니다.",deviceTitle:"모든 기기에서 사용",deviceCopy:"PC, 태블릿과 모바일에서 사진 크기를 조절하세요.",privacy:"개인정보처리방침",terms:"이용약관",badFile:"25MB 이하의 JPG, PNG 또는 WebP 이미지를 선택하세요.",badSize:"가로와 세로를 1~12,000픽셀로 입력하세요.",failed:"이미지 크기를 조절하지 못했습니다."},
  ja: { allTools:"すべてのツール",home:"ホーム",title:"画像サイズ変更",local:"ローカル画像ツール",subtitle:"必要な縦横比を保ちながら画像の幅と高さを変更します。",ad:"広告",selectTitle:"画像を選択",dropTitle:"サイズを変更する画像を選択",dropCopy:"端末からJPG、PNG、WebP画像を選択してください",choose:"画像を選択",limit:"1ファイル・最大25MB",replace:"変更",settings:"サイズ設定",width:"幅",height:"高さ",ratio:"縦横比を維持",format:"出力形式",quality:"品質",privateTitle:"端末内で安全に処理",privateCopy:"画像はサーバーにアップロードされません。",action:"画像サイズを変更",done:"サイズ変更完了",download:"ダウンロード",exactTitle:"正確なサイズ",exactCopy:"最大12,000ピクセルまで幅と高さを指定できます。",safeTitle:"ファイルを非公開に",safeCopy:"すべてブラウザ内で処理されます。",deviceTitle:"どの端末でも利用可能",deviceCopy:"PC、タブレット、スマートフォンで使えます。",privacy:"プライバシーポリシー",terms:"利用規約",badFile:"25MB以下のJPG、PNG、WebP画像を選択してください。",badSize:"幅と高さは1〜12,000ピクセルで入力してください。",failed:"画像のサイズを変更できませんでした。"},
  es: { allTools:"Todas las herramientas",home:"Inicio",title:"Redimensionar imágenes",local:"HERRAMIENTA LOCAL",subtitle:"Cambia el ancho y alto de la imagen manteniendo las proporciones que necesitas.",ad:"Publicidad",selectTitle:"Selecciona una imagen",dropTitle:"Elige una imagen para redimensionar",dropCopy:"Selecciona una imagen JPG, PNG o WebP de tu dispositivo",choose:"Elegir imagen",limit:"1 archivo · Máximo 25 MB",replace:"Cambiar",settings:"Ajustes de tamaño",width:"Ancho",height:"Alto",ratio:"Mantener proporción",format:"Formato de salida",quality:"Calidad",privateTitle:"Procesamiento privado",privateCopy:"La imagen nunca se sube a un servidor.",action:"Redimensionar imagen",done:"Imagen redimensionada",download:"Descargar",exactTitle:"Dimensiones exactas",exactCopy:"Introduce el ancho y alto, hasta 12.000 píxeles.",safeTitle:"Archivos privados",safeCopy:"Todo se procesa localmente en el navegador.",deviceTitle:"Funciona en cualquier dispositivo",deviceCopy:"Úsalo en ordenador, tableta y móvil.",privacy:"Política de privacidad",terms:"Términos de servicio",badFile:"Elige una imagen JPG, PNG o WebP de menos de 25 MB.",badSize:"Introduce un ancho y alto entre 1 y 12.000 píxeles.",failed:"No se pudo redimensionar la imagen."}
};

translations.en.scale = "Size scale";
translations.ko.scale = "크기 비율";
translations.ja.scale = "サイズ比率";
translations.es.scale = "Escala de tamaño";

const $ = (selector) => document.querySelector(selector);
const fileInput = $("#fileInput"), dropZone = $("#dropZone"), preview = $("#preview"), previewImage = $("#previewImage");
const widthInput = $("#widthInput"), heightInput = $("#heightInput"), keepRatio = $("#keepRatio"), formatSelect = $("#formatSelect");
const scaleInput = $("#scaleInput");
const qualityInput = $("#qualityInput"), qualityOutput = $("#qualityOutput"), resizeButton = $("#resizeButton"), result = $("#result"), message = $("#message");
let currentFile = null, image = null, ratio = 1, resultBlob = null, resultName = "";
let language = localStorage.getItem("convertfiles24-language") || (navigator.language || "en").slice(0,2);
if (!translations[language]) language = "en";

function t(key) { return translations[language][key] || translations.en[key] || key; }
function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
  $("#languageSelect").value = language;
  scaleInput.parentElement.setAttribute("aria-label", t("scale"));
  document.title = `${t("title")} | ConvertFiles24`;
}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("convertfiles24-theme", theme);
  $("#themeIcon").textContent = theme === "dark" ? "dark_mode" : "light_mode";
}
$("#themeButton").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
$("#languageSelect").addEventListener("change", (event) => { language = event.target.value; localStorage.setItem("convertfiles24-language", language); applyLanguage(); });

function openPicker() { fileInput.click(); }
dropZone.addEventListener("click", openPicker);
$("#replaceButton").addEventListener("click", openPicker);
fileInput.addEventListener("change", () => loadFile(fileInput.files?.[0]));
["dragenter","dragover"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add("dragover"); }));
["dragleave","drop"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove("dragover"); }));
dropZone.addEventListener("drop", (event) => loadFile(event.dataTransfer.files?.[0]));

function loadFile(file) {
  message.textContent = "";
  if (!file || !["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 25 * 1024 * 1024) { message.textContent = t("badFile"); return; }
  const url = URL.createObjectURL(file);
  const nextImage = new Image();
  nextImage.onload = () => {
    if (previewImage.src.startsWith("blob:")) URL.revokeObjectURL(previewImage.src);
    currentFile = file; image = nextImage; ratio = image.naturalWidth / image.naturalHeight;
    scaleInput.value = "100";
    updatePreviewScale(100);
    previewImage.src = url; widthInput.value = image.naturalWidth; heightInput.value = image.naturalHeight;
    $("#fileName").textContent = file.name; $("#fileMeta").textContent = `${image.naturalWidth} × ${image.naturalHeight} px · ${formatBytes(file.size)}`;
    formatSelect.value = file.type; if (![...formatSelect.options].some((option) => option.value === file.type)) formatSelect.value = "image/png";
    dropZone.hidden = true; preview.hidden = false; result.hidden = true; resultBlob = null;
    [widthInput,heightInput,keepRatio,formatSelect,qualityInput,scaleInput,resizeButton].forEach((el) => { el.disabled = false; });
  };
  nextImage.onerror = () => { URL.revokeObjectURL(url); message.textContent = t("badFile"); };
  nextImage.src = url;
}

function syncScale(percent) {
  const clamped = Math.max(10, Math.min(200, Math.round(percent)));
  scaleInput.value = String(clamped);
  updatePreviewScale(clamped);
}

function updatePreviewScale(percent) {
  const value = Math.max(10, Math.min(200, Number(percent) || 100));
  previewImage.style.setProperty("--preview-scale", String(Math.min(1, value / 100)));
}

widthInput.addEventListener("input", () => {
  if (keepRatio.checked && image && widthInput.value) {
    heightInput.value = Math.max(1, Math.round(Number(widthInput.value) / ratio));
    syncScale(Number(widthInput.value) / image.naturalWidth * 100);
  }
  result.hidden = true;
});
heightInput.addEventListener("input", () => {
  if (keepRatio.checked && image && heightInput.value) {
    widthInput.value = Math.max(1, Math.round(Number(heightInput.value) * ratio));
    syncScale(Number(heightInput.value) / image.naturalHeight * 100);
  }
  result.hidden = true;
});
scaleInput.addEventListener("input", () => {
  if (!image) return;
  const scale = Number(scaleInput.value) / 100;
  widthInput.value = Math.max(1, Math.round(image.naturalWidth * scale));
  heightInput.value = Math.max(1, Math.round(image.naturalHeight * scale));
  updatePreviewScale(scaleInput.value);
  result.hidden = true;
});
keepRatio.addEventListener("change", () => {
  scaleInput.disabled = !image;
  if (keepRatio.checked && image) {
    heightInput.value = Math.max(1, Math.round(Number(widthInput.value) / ratio));
    syncScale(Number(widthInput.value) / image.naturalWidth * 100);
  }
});
qualityInput.addEventListener("input", () => { qualityOutput.value = `${qualityInput.value}%`; });

resizeButton.addEventListener("click", async () => {
  const width = Math.round(Number(widthInput.value)), height = Math.round(Number(heightInput.value));
  if (!image || width < 1 || height < 1 || width > 12000 || height > 12000) { message.textContent = t("badSize"); return; }
  message.textContent = ""; resizeButton.disabled = true;
  try {
    const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
    const context = canvas.getContext("2d"); context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
    if (formatSelect.value === "image/jpeg") { context.fillStyle = "#fff"; context.fillRect(0,0,width,height); }
    context.drawImage(image,0,0,width,height);
    resultBlob = await new Promise((resolve,reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(), formatSelect.value, Number(qualityInput.value)/100));
    const extension = formatSelect.value === "image/jpeg" ? "jpg" : formatSelect.value.split("/")[1];
    resultName = `${currentFile.name.replace(/\.[^.]+$/,"")}-${width}x${height}.${extension}`;
    $("#resultMeta").textContent = `${width} × ${height} px · ${formatBytes(resultBlob.size)}`; result.hidden = false;
  } catch (_) { message.textContent = t("failed"); }
  resizeButton.disabled = false;
});
$("#downloadButton").addEventListener("click", () => { if (!resultBlob) return; const url=URL.createObjectURL(resultBlob), link=document.createElement("a"); link.href=url; link.download=resultName; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); });
function formatBytes(bytes) { return bytes < 1024*1024 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1024/1024).toFixed(1)} MB`; }

setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
applyLanguage();

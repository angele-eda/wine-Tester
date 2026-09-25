const $ = selector => document.querySelector(selector);
const modes = {
  wav: {extension:"wav",accept:".wav,audio/wav,audio/x-wav",mime:["audio/wav","audio/wave","audio/x-wav","audio/vnd.wave"]},
  m4a: {extension:"m4a",accept:".m4a,audio/mp4,audio/x-m4a",mime:["audio/mp4","audio/x-m4a"]},
  mp4: {extension:"mp4",accept:".mp4,video/mp4",mime:["video/mp4"]}
};
const copy = {
  en:{eyebrow:"Audio tools",title:"Convert to MP3",subtitle:"Convert WAV and M4A or extract audio from MP4, directly in your browser.",caption:"WAV → MP3 · M4A → MP3 · MP4 → MP3",selectLabel:"Select a {type} file",dropTitle:"Choose a {type} file",dropCopy:"Select a file or drag it here",choose:"Choose file",limit:"{type} · up to 200 MB",replace:"Replace",quality:"MP3 quality",before:"Before",estimate:"Estimated time",after:"After",mobileTitle:"Mobile device notice",mobileCopy:"Large files can use substantial memory and warm your device. Keep this tab open.",largeTitle:"Large file warning",largeCopy:"Conversion may take several minutes and use substantial memory.",continue:"Continue",privateTitle:"Processed on your device",privateCopy:"Your file is never uploaded to a server.",cancel:"Cancel",convert:"Convert to MP3",download:"Download MP3",supportTitle:"Supported files and limits",supportCopy:"WAV, M4A, or MP4 input according to the selected tool. Maximum 200 MB. Codec support depends on the source file.",why:"Why ConvertFiles24",featureTitle:"Private browser conversion",noUpload:"No uploads",noUploadCopy:"Your media stays on your device.",qualityTitle:"Choose quality",qualityCopy:"Pick the MP3 bitrate that suits your needs.",devices:"Works in your browser",devicesCopy:"No app or account is required.",privacy:"Privacy Policy",terms:"Terms",invalid:"Choose a {type} file up to 200 MB.",empty:"This file is empty. Choose another file.",loading:"Loading the audio engine…",processing:"Converting in your browser…",ready:"MP3 ready · {size} · {seconds}s",failed:"This file could not be decoded or converted. Check that it is a valid {type} file.",noAudio:"No readable audio track was found. Choose a file with sound.",memory:"Your browser ran out of memory. Try a shorter or smaller file.",cancelled:"Conversion cancelled.",pending:"Keep this tab open until conversion finishes.",about:"About {time}",audioLabel:"Audio file"},
  ko:{eyebrow:"오디오 도구",title:"MP3 변환",subtitle:"WAV와 M4A를 변환하거나 MP4에서 오디오를 브라우저 안에서 추출하세요.",caption:"WAV → MP3 · M4A → MP3 · MP4 → MP3",selectLabel:"{type} 파일 선택",dropTitle:"{type} 파일을 선택하세요",dropCopy:"파일을 선택하거나 이곳에 끌어놓으세요",choose:"파일 선택",limit:"{type} · 최대 200 MB",replace:"다른 파일",quality:"MP3 음질",before:"변환 전",estimate:"예상 시간",after:"변환 후",mobileTitle:"모바일 기기 안내",mobileCopy:"큰 파일은 메모리를 많이 쓰고 기기가 뜨거워질 수 있습니다. 탭을 열어두세요.",largeTitle:"큰 파일 경고",largeCopy:"변환에 몇 분이 걸리고 메모리를 많이 사용할 수 있습니다.",continue:"계속 진행",privateTitle:"기기에서 안전하게 처리",privateCopy:"파일은 서버로 업로드되지 않습니다.",cancel:"취소",convert:"MP3로 변환",download:"MP3 다운로드",supportTitle:"지원 파일 및 제한",supportCopy:"선택한 도구에 맞는 WAV, M4A 또는 MP4 파일. 최대 200 MB. 원본 코덱에 따라 지원 여부가 달라집니다.",why:"CONVERTFILES24를 선택하는 이유",featureTitle:"브라우저에서 안전하게 오디오 변환",noUpload:"업로드 없음",noUploadCopy:"파일은 기기 안에만 남습니다.",qualityTitle:"음질 선택",qualityCopy:"필요에 맞는 MP3 비트레이트를 선택하세요.",devices:"브라우저에서 실행",devicesCopy:"앱 설치나 가입이 필요 없습니다.",privacy:"개인정보처리방침",terms:"이용약관",invalid:"200 MB 이하의 {type} 파일을 선택하세요.",empty:"빈 파일입니다. 다른 파일을 선택하세요.",loading:"오디오 엔진을 불러오는 중…",processing:"브라우저에서 변환 중…",ready:"MP3 준비 완료 · {size} · {seconds}초 소요",failed:"파일을 해독하거나 변환하지 못했습니다. 올바른 {type} 파일인지 확인하세요.",noAudio:"읽을 수 있는 오디오가 없습니다. 소리가 있는 파일을 선택하세요.",memory:"브라우저 메모리가 부족합니다. 더 짧거나 작은 파일을 사용하세요.",cancelled:"변환을 취소했습니다.",pending:"변환이 끝날 때까지 이 탭을 열어두세요.",about:"약 {time}",audioLabel:"오디오 파일"},
  ja:{eyebrow:"音声ツール",title:"MP3に変換",subtitle:"WAVやM4Aの変換、MP4からの音声抽出をブラウザ内で行います。",caption:"WAV → MP3 · M4A → MP3 · MP4 → MP3",selectLabel:"{type}ファイルを選択",dropTitle:"{type}ファイルを選択",dropCopy:"ファイルを選ぶか、ここにドラッグしてください",choose:"ファイルを選択",limit:"{type} · 最大200 MB",replace:"別のファイル",quality:"MP3音質",before:"変換前",estimate:"予想時間",after:"変換後",mobileTitle:"モバイル端末の注意",mobileCopy:"大きなファイルはメモリを多く使い、端末が熱くなることがあります。タブを開いたままにしてください。",largeTitle:"大容量ファイルの警告",largeCopy:"変換に数分かかり、多くのメモリを使用する場合があります。",continue:"続行",privateTitle:"端末内で処理",privateCopy:"ファイルはサーバーにアップロードされません。",cancel:"キャンセル",convert:"MP3に変換",download:"MP3をダウンロード",supportTitle:"対応ファイルと制限",supportCopy:"選択したツールに応じてWAV、M4A、MP4を入力。最大200 MB。対応コーデックは元ファイルによります。",why:"ConvertFiles24を選ぶ理由",featureTitle:"ブラウザで安全に変換",noUpload:"アップロードなし",noUploadCopy:"ファイルは端末内に残ります。",qualityTitle:"音質を選択",qualityCopy:"MP3のビットレートを選べます。",devices:"ブラウザで動作",devicesCopy:"アプリや登録は不要です。",privacy:"プライバシーポリシー",terms:"利用規約",invalid:"200 MB以下の{type}ファイルを選択してください。",empty:"ファイルが空です。別のファイルを選択してください。",loading:"音声エンジンを読み込み中…",processing:"ブラウザ内で変換中…",ready:"MP3完成 · {size} · {seconds}秒",failed:"ファイルを読み込み・変換できませんでした。有効な{type}ファイルか確認してください。",noAudio:"読み取れる音声がありません。音声付きのファイルを選んでください。",memory:"ブラウザのメモリが不足しています。小さいファイルをお試しください。",cancelled:"変換をキャンセルしました。",pending:"完了までタブを開いたままにしてください。",about:"約{time}",audioLabel:"音声ファイル"},
  es:{eyebrow:"Herramientas de audio",title:"Convertir a MP3",subtitle:"Convierte WAV y M4A o extrae el audio de MP4 directamente en tu navegador.",caption:"WAV → MP3 · M4A → MP3 · MP4 → MP3",selectLabel:"Selecciona un archivo {type}",dropTitle:"Elige un archivo {type}",dropCopy:"Selecciona un archivo o arrástralo aquí",choose:"Elegir archivo",limit:"{type} · hasta 200 MB",replace:"Cambiar",quality:"Calidad MP3",before:"Antes",estimate:"Tiempo estimado",after:"Después",mobileTitle:"Aviso para móviles",mobileCopy:"Los archivos grandes pueden usar mucha memoria y calentar el dispositivo. Mantén esta pestaña abierta.",largeTitle:"Archivo grande",largeCopy:"La conversión puede tardar varios minutos y usar mucha memoria.",continue:"Continuar",privateTitle:"Procesado en tu dispositivo",privateCopy:"El archivo no se sube a ningún servidor.",cancel:"Cancelar",convert:"Convertir a MP3",download:"Descargar MP3",supportTitle:"Archivos y límites",supportCopy:"Entrada WAV, M4A o MP4 según la herramienta elegida. Máximo 200 MB. La compatibilidad depende del códec.",why:"Por qué ConvertFiles24",featureTitle:"Conversión privada en el navegador",noUpload:"Sin subidas",noUploadCopy:"El archivo permanece en tu dispositivo.",qualityTitle:"Elige la calidad",qualityCopy:"Selecciona la tasa de bits MP3 que necesites.",devices:"Funciona en tu navegador",devicesCopy:"Sin aplicación ni cuenta.",privacy:"Política de privacidad",terms:"Términos",invalid:"Elige un archivo {type} de hasta 200 MB.",empty:"El archivo está vacío. Elige otro archivo.",loading:"Cargando el motor de audio…",processing:"Convirtiendo en tu navegador…",ready:"MP3 listo · {size} · {seconds}s",failed:"No se pudo leer o convertir el archivo. Comprueba que sea un {type} válido.",noAudio:"No se encontró audio legible. Elige un archivo con sonido.",memory:"El navegador se quedó sin memoria. Prueba con un archivo más pequeño.",cancelled:"Conversión cancelada.",pending:"Mantén esta pestaña abierta hasta que termine.",about:"Aprox. {time}",audioLabel:"Archivo de audio"}
};
let lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("convertfiles24-language") || "en";
if (!copy[lang]) lang = "en";
let mode = modes[new URLSearchParams(location.search).get("mode")] ? new URLSearchParams(location.search).get("mode") : "wav";
let file = null, outputURL = "", engine = null, running = false, completed = false, cancelled = false, duration = 0, lastLog = "", generation = 0;
const isMobile = matchMedia("(max-width:700px)").matches || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
const t = (key, values = {}) => (copy[lang][key] || copy.en[key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
const fmt = bytes => bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
const clock = seconds => seconds < 60 ? `${Math.round(seconds)}s` : `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
function status(key, error = false, values = {}) { $("#status").textContent = t(key, values); $("#status").className = error ? "status error" : "status success"; }
function clearOutput() { if (outputURL) URL.revokeObjectURL(outputURL); outputURL = ""; $("#downloadButton").hidden = true; $("#downloadButton").removeAttribute("href"); $("#afterValue").textContent = "—"; $("#status").textContent = ""; $("#status").className = "status"; $("#progressWrap").hidden = true; $("#progressBar").value = 0; }
function progress(value, message) { $("#progressWrap").hidden = false; $("#progressBar").value = value; $("#progressLabel").textContent = `${value}%`; $("#progressStage").textContent = message; $("#cancelButton").hidden = value >= 100; }
function refresh() {
  const type = mode.toUpperCase();
  $("#fileInput").accept = modes[mode].accept;
  $("#selectLabel").textContent = t("selectLabel", {type});
  $("#dropTitle").textContent = t("dropTitle", {type});
  $("#limit").textContent = t("limit", {type});
  $("#processButton").disabled = !file || running || completed || (!$("#largeWarning").hidden && !$("#largeConfirm").checked);
  if (file) {
    $("#beforeValue").textContent = fmt(file.size);
    $("#fileMeta").textContent = `${fmt(file.size)} · ${duration ? clock(duration) : "—"}`;
    $("#estimateValue").textContent = t("about", {time:clock(Math.max(8, Math.max(duration || 0, file.size / 1800000) * (isMobile ? 1.8 : 1)))});
  }
}
function applyLanguage() {
  document.documentElement.lang = lang;
  $("#languageSelect").value = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  refresh();
}
function resetFile() {
  file = null; duration = 0; completed = false; clearOutput();
  $("#fileInput").value = ""; $("#selected").hidden = true; $("#dropZone").hidden = false;
  $("#infoGrid").hidden = true; $("#largeWarning").hidden = true; $("#largeConfirm").checked = false;
  refresh();
}
async function choose(candidate) {
  if (running) return;
  resetFile();
  if (!candidate) return;
  const expected = modes[mode];
  if (!candidate.name.toLowerCase().endsWith(`.${expected.extension}`) || candidate.size > 200 * 1048576) { status("invalid", true, {type:mode.toUpperCase()}); return; }
  if (!candidate.size) { status("empty", true); return; }
  if (candidate.type && !expected.mime.includes(candidate.type)) { status("invalid", true, {type:mode.toUpperCase()}); return; }
  file = candidate;
  $("#fileName").textContent = candidate.name; $("#selected").hidden = false;
  $("#dropZone").hidden = true; $("#infoGrid").hidden = false;
  const large = candidate.size > (isMobile ? 50 : 100) * 1048576;
  $("#largeWarning").hidden = !large; $("#largeConfirm").checked = !large;
  const media = document.createElement(mode === "mp4" ? "video" : "audio");
  const url = URL.createObjectURL(candidate);
  await new Promise(resolve => {
    media.onloadedmetadata = () => { duration = Number.isFinite(media.duration) ? media.duration : 0; resolve(); };
    media.onerror = resolve;
    setTimeout(resolve, 1500);
    media.src = url;
  });
  media.removeAttribute("src"); media.load(); URL.revokeObjectURL(url);
  refresh();
}
function loadScript(src) { return new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = src; script.onload = resolve; script.onerror = reject; document.head.append(script); }); }
async function getEngine() {
  if (engine) return engine;
  progress(2, t("loading"));
  if (!window.FFmpegWASM) await loadScript("/assets/ffmpeg/0.12.15/ffmpeg.js");
  const instance = new FFmpegWASM.FFmpeg();
  instance.on("progress", ({progress: fraction}) => { if (running && Number.isFinite(fraction)) progress(Math.max(5, Math.min(99, Math.round(fraction * 100))), t("processing")); });
  instance.on("log", ({message}) => { lastLog = (lastLog + "\n" + message).slice(-4000); });
  await instance.load({coreURL:"/assets/ffmpeg/0.12.15/ffmpeg-core.js",wasmURL:"/assets/ffmpeg/0.12.15/ffmpeg-core.wasm"});
  engine = instance;
  return instance;
}
async function convert() {
  if (!file || running || completed || (!$("#largeWarning").hidden && !$("#largeConfirm").checked)) return;
  clearOutput(); running = true; cancelled = false; lastLog = ""; const current = ++generation;
  $("#processButton").disabled = true; $("#fileInput").disabled = true; $("#qualitySelect").disabled = true;
  document.querySelectorAll(".mode-tabs button").forEach(button => button.disabled = true);
  progress(1, t("loading")); status("pending");
  const started = performance.now(), input = `input.${modes[mode].extension}`, output = "output.mp3";
  let ffmpeg;
  try {
    ffmpeg = await getEngine();
    if (cancelled || current !== generation) return;
    await ffmpeg.writeFile(input, new Uint8Array(await file.arrayBuffer()));
    if (cancelled || current !== generation) return;
    const bitrate = $("#qualitySelect").value;
    const code = await ffmpeg.exec(["-y","-i",input,"-map","0:a:0","-vn","-sn","-dn","-c:a","libmp3lame","-ar","44100","-b:a",`${bitrate}k`,"-id3v2_version","3",output]);
    if (cancelled || current !== generation) return;
    if (code !== 0) throw new Error(lastLog || `FFmpeg exited with code ${code}`);
    const bytes = await ffmpeg.readFile(output);
    if (!bytes?.byteLength) throw new Error("Empty output");
    const blob = new Blob([bytes], {type:"audio/mpeg"});
    outputURL = URL.createObjectURL(blob);
    $("#downloadButton").href = outputURL;
    $("#downloadButton").download = `${file.name.replace(/\.[^.]+$/, "")}.mp3`;
    $("#downloadButton").hidden = false; $("#afterValue").textContent = fmt(blob.size);
    completed = true; progress(100, t("ready", {size:fmt(blob.size),seconds:((performance.now() - started) / 1000).toFixed(1)}));
    status("ready", false, {size:fmt(blob.size),seconds:((performance.now() - started) / 1000).toFixed(1)});
  } catch (error) {
    console.error("[audio-tools]", error);
    if (!cancelled) status(/matches no streams|stream map|output file.*no streams/i.test(String(error) + lastLog) ? "noAudio" : /memory|allocation|out of bounds/i.test(String(error)) ? "memory" : "failed", true, {type:mode.toUpperCase()});
  } finally {
    if (ffmpeg && !cancelled) { try { await ffmpeg.deleteFile(input); } catch (_) {} try { await ffmpeg.deleteFile(output); } catch (_) {} }
    if (current === generation) {
      running = false; $("#fileInput").disabled = false; $("#qualitySelect").disabled = false;
      document.querySelectorAll(".mode-tabs button").forEach(button => button.disabled = false);
      if (!completed) $("#progressWrap").hidden = true;
      refresh();
    }
  }
}
function cancel() {
  if (!running) return;
  cancelled = true; generation++;
  if (engine) { engine.terminate(); engine = null; }
  running = false; $("#fileInput").disabled = false; $("#qualitySelect").disabled = false;
  document.querySelectorAll(".mode-tabs button").forEach(button => button.disabled = false);
  $("#progressWrap").hidden = true; status("cancelled"); refresh();
}
document.querySelectorAll(".mode-tabs button").forEach(button => button.addEventListener("click", () => {
  if (running || mode === button.dataset.mode) return;
  mode = button.dataset.mode;
  const url = new URL(location.href); url.searchParams.set("mode", mode); history.replaceState({}, "", url);
  document.querySelectorAll(".mode-tabs button").forEach(tab => { tab.classList.toggle("active", tab === button); tab.setAttribute("aria-selected", String(tab === button)); });
  resetFile(); refresh();
}));
$("#dropZone").onclick = () => $("#fileInput").click();
$("#replaceButton").onclick = () => $("#fileInput").click();
$("#fileInput").onchange = event => choose(event.target.files[0]);
["dragenter","dragover"].forEach(name => $("#dropZone").addEventListener(name, event => { event.preventDefault(); event.currentTarget.classList.add("dragging"); }));
["dragleave","drop"].forEach(name => $("#dropZone").addEventListener(name, event => { event.preventDefault(); event.currentTarget.classList.remove("dragging"); }));
$("#dropZone").addEventListener("drop", event => choose(event.dataTransfer.files[0]));
$("#largeConfirm").onchange = refresh;
$("#processButton").onclick = convert;
$("#cancelButton").onclick = cancel;
$("#languageSelect").onchange = event => { lang = event.target.value; localStorage.setItem("convertfiles24-language", lang); const url = new URL(location.href); url.searchParams.set("lang", lang); history.replaceState({}, "", url); applyLanguage(); };
const renderTheme = () => { $("#themeIcon").textContent = document.documentElement.dataset.theme === "dark" ? "☾" : "☀"; };
$("#themeButton").onclick = () => { const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = theme; localStorage.setItem("convertfiles24-theme", theme); renderTheme(); };
$("#mobileNote").hidden = !isMobile;
document.querySelectorAll(".mode-tabs button").forEach(button => { button.classList.toggle("active", button.dataset.mode === mode); button.setAttribute("aria-selected", String(button.dataset.mode === mode)); });
renderTheme(); applyLanguage();

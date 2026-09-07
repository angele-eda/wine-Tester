(() => {
  const $ = (selector) => document.querySelector(selector);
  const ui = {
    input: $("#fileInput"), drop: $("#dropZone"), selected: $("#selectedFile"),
    name: $("#fileName"), meta: $("#fileMeta"), replace: $("#replaceButton"),
    formats: $("#formatFieldset"), convert: $("#convertButton"), status: $("#status"),
    download: $("#downloadButton"), language: $("#languageSelect"), theme: $("#themeButton"), themeIcon: $("#themeIcon")
  };
  const copy = {
    en:{allTools:"All tools",privacy:"Privacy",eyebrow:"File tools",title:"File Converter",subtitle:"Convert JPG, PNG, WebP and PDF formats instantly with local processing.",formatCaption:"Convert in any direction · JPG, PNG, WebP, PDF",selectLabel:"Select file",dropTitle:"Choose a file to convert",dropCopy:"JPG, PNG, WebP or PDF from your device",choose:"Choose file",limit:"1 file · up to 25MB",replace:"Replace",convertTo:"Convert to",localTitle:"Processed on your device",localCopy:"Files are never uploaded to a server.",convert:"Convert file",download:"Download converted file",processing:"Converting on your device…",ready:"Your converted file is ready.",badType:"Choose a JPG, PNG, WebP or PDF file.",tooLarge:"Choose a file no larger than 25MB.",failed:"This file could not be converted.",why:"Why ConvertFiles24",featureTitle:"Built for speed and privacy",privateTitle:"Private by design",privateCopy:"Your files never leave your device. All processing happens locally in your browser.",anyTitle:"Any format, either way",anyCopy:"Convert between JPG, PNG, WebP and PDF in any direction.",worksTitle:"Works everywhere",worksCopy:"Export ready for any platform, app, or website.",copyright:"© 2026 ConvertFiles24. Client-side excellence.",privacyPolicy:"Privacy Policy",terms:"Terms of Service"},
    ko:{allTools:"모든 도구",privacy:"개인정보 보호",eyebrow:"파일 도구",title:"파일 변환기",subtitle:"JPG, PNG, WebP, PDF 형식을 기기에서 빠르게 변환하세요.",formatCaption:"자유롭게 변환 · JPG, PNG, WebP, PDF",selectLabel:"파일 선택",dropTitle:"변환할 파일을 선택하세요",dropCopy:"기기에서 JPG, PNG, WebP 또는 PDF 파일을 선택하세요",choose:"파일 선택",limit:"파일 1개 · 최대 25MB",replace:"다른 파일",convertTo:"변환 형식",localTitle:"기기에서 안전하게 처리",localCopy:"파일은 서버로 업로드되지 않습니다.",convert:"파일 변환",download:"변환 파일 다운로드",processing:"기기에서 변환 중…",ready:"변환 파일이 준비되었습니다.",badType:"JPG, PNG, WebP 또는 PDF 파일을 선택하세요.",tooLarge:"25MB 이하의 파일을 선택하세요.",failed:"파일을 변환하지 못했습니다.",why:"ConvertFiles24를 선택하는 이유",featureTitle:"빠르고 안전한 파일 변환",privateTitle:"개인정보 보호 설계",privateCopy:"파일은 기기 밖으로 전송되지 않으며 모든 작업은 브라우저에서 처리됩니다.",anyTitle:"원하는 형식으로 변환",anyCopy:"JPG, PNG, WebP, PDF 형식을 원하는 방향으로 변환할 수 있습니다.",worksTitle:"모든 기기에서 사용",worksCopy:"PC, 태블릿, 스마트폰의 브라우저에서 바로 사용할 수 있습니다.",copyright:"© 2026 ConvertFiles24. 안전한 기기 내 파일 처리.",privacyPolicy:"개인정보처리방침",terms:"이용약관"},
    ja:{allTools:"すべてのツール",privacy:"プライバシー",eyebrow:"ファイルツール",title:"ファイル変換",subtitle:"JPG、PNG、WebP、PDFを端末内ですばやく変換できます。",formatCaption:"自由に変換 · JPG、PNG、WebP、PDF",selectLabel:"ファイルを選択",dropTitle:"変換するファイルを選択してください",dropCopy:"端末からJPG、PNG、WebPまたはPDFを選択してください",choose:"ファイルを選択",limit:"1ファイル · 最大25MB",replace:"別のファイル",convertTo:"変換形式",localTitle:"端末内で安全に処理",localCopy:"ファイルがサーバーにアップロードされることはありません。",convert:"ファイルを変換",download:"変換したファイルをダウンロード",processing:"端末内で変換中…",ready:"変換したファイルの準備ができました。",badType:"JPG、PNG、WebPまたはPDFファイルを選択してください。",tooLarge:"25MB以下のファイルを選択してください。",failed:"ファイルを変換できませんでした。",why:"ConvertFiles24が選ばれる理由",featureTitle:"高速で安全なファイル変換",privateTitle:"プライバシーを重視した設計",privateCopy:"ファイルが端末の外に送信されることはなく、すべての処理はブラウザ内で行われます。",anyTitle:"希望の形式に変換",anyCopy:"JPG、PNG、WebP、PDFを自由な方向に変換できます。",worksTitle:"あらゆる端末で利用可能",worksCopy:"PC、タブレット、スマートフォンのブラウザですぐに利用できます。",copyright:"© 2026 ConvertFiles24. 安全なローカルファイルツール。",privacyPolicy:"プライバシーポリシー",terms:"利用規約"},
    es:{allTools:"Todas las herramientas",privacy:"Privacidad",eyebrow:"Herramientas de archivos",title:"Convertidor de archivos",subtitle:"Convierte JPG, PNG, WebP y PDF rápidamente en tu dispositivo.",formatCaption:"Conversión flexible · JPG, PNG, WebP, PDF",selectLabel:"Seleccionar archivo",dropTitle:"Elige un archivo para convertir",dropCopy:"Elige un archivo JPG, PNG, WebP o PDF de tu dispositivo",choose:"Elegir archivo",limit:"1 archivo · máximo 25 MB",replace:"Otro archivo",convertTo:"Convertir a",localTitle:"Procesamiento seguro en tu dispositivo",localCopy:"Los archivos nunca se suben a un servidor.",convert:"Convertir archivo",download:"Descargar archivo convertido",processing:"Convirtiendo en tu dispositivo…",ready:"El archivo convertido está listo.",badType:"Elige un archivo JPG, PNG, WebP o PDF.",tooLarge:"Elige un archivo de 25 MB o menos.",failed:"No se pudo convertir este archivo.",why:"Por qué elegir ConvertFiles24",featureTitle:"Conversión rápida y privada",privateTitle:"Privacidad desde el diseño",privateCopy:"Tus archivos nunca salen del dispositivo. Todo se procesa localmente en el navegador.",anyTitle:"Convierte al formato que quieras",anyCopy:"Convierte entre JPG, PNG, WebP y PDF en cualquier dirección.",worksTitle:"Funciona en todos tus dispositivos",worksCopy:"Úsalo directamente en el navegador de tu PC, tableta o móvil.",copyright:"© 2026 ConvertFiles24. Herramientas locales y privadas.",privacyPolicy:"Política de privacidad",terms:"Términos de servicio"}
  };
  const supportedLanguages = ["en", "ko", "ja", "es"];
  const urlLanguage = new URL(location.href).searchParams.get("lang");
  const savedLanguage = (()=>{try{return localStorage.getItem("convertfiles24-language")}catch(_){return null}})();
  const browserLanguage = (navigator.language || "en").split("-")[0].toLowerCase();
  let lang = supportedLanguages.includes(urlLanguage) ? urlLanguage : supportedLanguages.includes(savedLanguage) ? savedLanguage : supportedLanguages.includes(browserLanguage) ? browserLanguage : "en";
  let files = [];
  let resultUrl = "";
  const accepted = /^(image\/(jpeg|png|webp)|application\/pdf)$/i;

  function renderLanguage(){
    document.documentElement.lang=lang; ui.language.value=lang;
    document.querySelectorAll("[data-i18n]").forEach(node=>{const key=node.dataset.i18n;if(copy[lang][key])node.textContent=copy[lang][key]});
    const multipleText={en:{title:"Choose files to convert",choose:"Choose files",limit:"Up to 10 files · 25MB each"},ko:{title:"변환할 파일을 선택하세요",choose:"파일 선택",limit:"최대 10개 · 파일당 25MB"},ja:{title:"変換するファイルを選択してください",choose:"ファイルを選択",limit:"最大10ファイル · 1ファイル25MB"},es:{title:"Elige archivos para convertir",choose:"Elegir archivos",limit:"Hasta 10 archivos · 25 MB cada uno"}}[lang];
    document.querySelector('[data-i18n="dropTitle"]').textContent=multipleText.title;
    document.querySelector('[data-i18n="choose"]').textContent=multipleText.choose;
    document.querySelector('[data-i18n="limit"]').textContent=multipleText.limit;
    if(files.length>1)ui.name.textContent=fileCountLabel(files.length);
  }
  function renderTheme(){ui.themeIcon.textContent=document.documentElement.dataset.theme==="dark"?"☾":"☀"}
  function clearResult(){if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl="";ui.download.hidden=true;ui.download.removeAttribute("href");ui.status.textContent="";ui.status.className="status";ui.convert.classList.remove("completed")}
  function fileCountLabel(count){return lang==="ko"?`${count}개 파일 선택`:lang==="ja"?`${count}ファイルを選択`:lang==="es"?`${count} archivos seleccionados`:`${count} files selected`}
  function setFiles(candidates){
    clearResult();
    const next=[...candidates];
    if(!next.length)return;
    if(next.length>10)return showError(lang==="ko"?"파일은 최대 10개까지 선택할 수 있습니다.":lang==="ja"?"選択できるファイルは最大10個です。":lang==="es"?"Puedes seleccionar hasta 10 archivos.":"You can select up to 10 files.");
    if(next.some(candidate=>!accepted.test(candidate.type||typeFromName(candidate.name))))return showError(copy[lang].badType);
    if(next.some(candidate=>candidate.size>25*1024*1024))return showError(copy[lang].tooLarge);
    files=next;
    const totalSize=files.reduce((sum,item)=>sum+item.size,0);
    const types=[...new Set(files.map(item=>(item.type||typeFromName(item.name)).replace("image/","").toUpperCase()))].join(", ");
    ui.name.textContent=files.length===1?files[0].name:fileCountLabel(files.length);
    ui.meta.textContent=`${formatBytes(totalSize)} · ${types}`;ui.selected.hidden=false;ui.drop.hidden=true;ui.convert.disabled=false;
  }
  function showError(message){ui.status.textContent=message;ui.status.className="status error"}
  function typeFromName(name){const ext=name.split(".").pop().toLowerCase();return ext==="pdf"?"application/pdf":ext==="jpg"||ext==="jpeg"?"image/jpeg":`image/${ext}`}
  function formatBytes(bytes){if(bytes<1024)return`${bytes} B`;if(bytes<1048576)return`${(bytes/1024).toFixed(1)} KB`;return`${(bytes/1048576).toFixed(1)} MB`}
  function baseName(name){return name.replace(/\.[^.]+$/,"")}
  function canvasBlob(canvas,mime,quality=.92){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Canvas export failed")),mime,quality))}
  function loadImage(blob){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(blob),image=new Image();image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Image decode failed"))};image.src=url})}
  async function imageToImage(source,target){const image=await loadImage(source),canvas=document.createElement("canvas");canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext("2d");if(target==="jpg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height)}ctx.drawImage(image,0,0);const mime=target==="jpg"?"image/jpeg":`image/${target}`;return{blob:await canvasBlob(canvas,mime,target==="png"?1:.92),name:`${baseName(source.name)}.${target}`}}
  async function imageToPdf(source){if(!window.PDFLib)throw new Error("PDF tools are not ready");const image=await loadImage(source),canvas=document.createElement("canvas");canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);const jpg=await canvasBlob(canvas,"image/jpeg",.94),pdf=await PDFLib.PDFDocument.create(),embedded=await pdf.embedJpg(await jpg.arrayBuffer()),page=pdf.addPage([image.naturalWidth,image.naturalHeight]);page.drawImage(embedded,{x:0,y:0,width:image.naturalWidth,height:image.naturalHeight});return{blob:new Blob([await pdf.save()],{type:"application/pdf"}),name:`${baseName(source.name)}.pdf`}}
  async function pdfToImages(source,target){
    if(!window.pdfjsLib)throw new Error("PDF renderer is not ready");pdfjsLib.GlobalWorkerOptions.workerSrc="/assets/pdfjs/pdf.worker.min.js";
    const pdf=await pdfjsLib.getDocument({data:await source.arrayBuffer()}).promise,items=[];
    for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){const page=await pdf.getPage(pageNo),viewport=page.getViewport({scale:2}),canvas=document.createElement("canvas");canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const ctx=canvas.getContext("2d");if(target==="jpg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height)}await page.render({canvasContext:ctx,viewport}).promise;const mime=target==="jpg"?"image/jpeg":`image/${target}`;items.push({blob:await canvasBlob(canvas,mime,target==="png"?1:.92),name:`${baseName(source.name)}-${pageNo}.${target}`})}
    if(items.length===1)return items[0];if(!window.JSZip)throw new Error("ZIP tools are not ready");const zip=new JSZip();items.forEach(item=>zip.file(item.name,item.blob));return{blob:await zip.generateAsync({type:"blob"}),name:`${baseName(source.name)}-${target}.zip`}
  }
  async function convertOne(source,target){
    const type=source.type||typeFromName(source.name);
    if(type==="application/pdf"){
      if(target==="pdf")return{blob:source.slice(0,source.size,"application/pdf"),name:`${baseName(source.name)}.pdf`};
      return pdfToImages(source,target);
    }
    if(target==="pdf")return imageToPdf(source);
    return imageToImage(source,target);
  }
  async function convert(){
    const target=document.querySelector('input[name="output"]:checked').value;
    const results=[];
    for(const source of files)results.push(await convertOne(source,target));
    if(results.length===1)return results[0];
    if(!window.JSZip)throw new Error("ZIP tools are not ready");
    const zip=new JSZip(),used=new Set();
    results.forEach((item,index)=>{let name=item.name;if(used.has(name))name=`${index+1}-${name}`;used.add(name);zip.file(name,item.blob)});
    return{blob:await zip.generateAsync({type:"blob"}),name:"converted-files.zip"};
  }

  ui.drop.addEventListener("click",()=>ui.input.click()); ui.replace.addEventListener("click",()=>ui.input.click()); ui.input.addEventListener("change",()=>setFiles(ui.input.files));
  ["dragenter","dragover"].forEach(event=>ui.drop.addEventListener(event,e=>{e.preventDefault();ui.drop.classList.add("dragging")}));["dragleave","drop"].forEach(event=>ui.drop.addEventListener(event,e=>{e.preventDefault();ui.drop.classList.remove("dragging")}));ui.drop.addEventListener("drop",e=>setFiles(e.dataTransfer.files));
  ui.formats.addEventListener("change",clearResult);
  ui.convert.addEventListener("click",async()=>{if(!files.length)return;clearResult();ui.convert.disabled=true;ui.status.textContent=copy[lang].processing;try{const result=await convert();resultUrl=URL.createObjectURL(result.blob);ui.download.href=resultUrl;ui.download.download=result.name;ui.download.hidden=false;ui.status.textContent=`${copy[lang].ready} · ${formatBytes(result.blob.size)}`;ui.status.className="status success";ui.convert.classList.add("completed")}catch(error){console.error(error);showError(copy[lang].failed)}finally{ui.convert.disabled=false}});
  ui.language.addEventListener("change",()=>{lang=ui.language.value;try{localStorage.setItem("convertfiles24-language",lang)}catch(_){}const url=new URL(location.href);url.searchParams.set("lang",lang);history.replaceState(null,"",url);renderLanguage()});
  ui.theme.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;try{localStorage.setItem("convertfiles24-theme",next)}catch(_){}renderTheme()});
  addEventListener("beforeunload",()=>{if(resultUrl)URL.revokeObjectURL(resultUrl)});renderLanguage();renderTheme();
})();

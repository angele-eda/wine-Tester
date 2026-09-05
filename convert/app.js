(() => {
  const $ = (selector) => document.querySelector(selector);
  const ui = {
    input: $("#fileInput"), drop: $("#dropZone"), selected: $("#selectedFile"),
    name: $("#fileName"), meta: $("#fileMeta"), replace: $("#replaceButton"),
    formats: $("#formatFieldset"), convert: $("#convertButton"), status: $("#status"),
    download: $("#downloadButton"), language: $("#languageSelect"), theme: $("#themeButton"), themeIcon: $("#themeIcon")
  };
  const copy = {
    en:{allTools:"All tools",privacy:"Privacy",eyebrow:"File tools",title:"File Converter",subtitle:"Convert JPG, PNG, WebP and PDF formats instantly with local processing.",formatCaption:"Convert in any direction · JPG, PNG, WebP, PDF",selectLabel:"Select file",dropTitle:"Choose a file to convert",dropCopy:"JPG, PNG, WebP or PDF from your device",choose:"Choose file",limit:"1 file · up to 25MB",replace:"Replace",convertTo:"Convert to",localTitle:"Processed on your device",localCopy:"Files are never uploaded to a server.",convert:"Convert file",download:"Download converted file",processing:"Converting on your device…",ready:"Your converted file is ready.",badType:"Choose a JPG, PNG, WebP or PDF file.",tooLarge:"Choose a file no larger than 25MB.",failed:"This file could not be converted."},
    ko:{allTools:"모든 도구",privacy:"개인정보 보호",eyebrow:"파일 도구",title:"파일 변환기",subtitle:"JPG, PNG, WebP, PDF 형식을 기기에서 빠르게 변환하세요.",formatCaption:"자유롭게 변환 · JPG, PNG, WebP, PDF",selectLabel:"파일 선택",dropTitle:"변환할 파일을 선택하세요",dropCopy:"기기에서 JPG, PNG, WebP 또는 PDF 파일을 선택하세요",choose:"파일 선택",limit:"파일 1개 · 최대 25MB",replace:"다른 파일",convertTo:"변환 형식",localTitle:"기기에서 안전하게 처리",localCopy:"파일은 서버로 업로드되지 않습니다.",convert:"파일 변환",download:"변환 파일 다운로드",processing:"기기에서 변환 중…",ready:"변환 파일이 준비되었습니다.",badType:"JPG, PNG, WebP 또는 PDF 파일을 선택하세요.",tooLarge:"25MB 이하의 파일을 선택하세요.",failed:"파일을 변환하지 못했습니다."}
  };
  let lang = new URL(location.href).searchParams.get("lang") === "ko" ? "ko" : (navigator.language || "").toLowerCase().startsWith("ko") ? "ko" : "en";
  let file = null;
  let resultUrl = "";
  const accepted = /^(image\/(jpeg|png|webp)|application\/pdf)$/i;

  function renderLanguage(){
    document.documentElement.lang=lang; ui.language.value=lang;
    document.querySelectorAll("[data-i18n]").forEach(node=>{const key=node.dataset.i18n;if(copy[lang][key])node.textContent=copy[lang][key]});
  }
  function renderTheme(){ui.themeIcon.textContent=document.documentElement.dataset.theme==="dark"?"☾":"☀"}
  function clearResult(){if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl="";ui.download.hidden=true;ui.download.removeAttribute("href");ui.status.textContent="";ui.status.className="status"}
  function setFile(candidate){
    clearResult();
    if(!candidate)return;
    const type=candidate.type||typeFromName(candidate.name);
    if(!accepted.test(type)){return showError(copy[lang].badType)}
    if(candidate.size>25*1024*1024){return showError(copy[lang].tooLarge)}
    file=candidate;ui.name.textContent=file.name;ui.meta.textContent=`${formatBytes(file.size)} · ${type.replace("image/","").toUpperCase()}`;ui.selected.hidden=false;ui.drop.hidden=true;ui.formats.disabled=false;ui.convert.disabled=false;
  }
  function showError(message){ui.status.textContent=message;ui.status.className="status error"}
  function typeFromName(name){const ext=name.split(".").pop().toLowerCase();return ext==="pdf"?"application/pdf":ext==="jpg"||ext==="jpeg"?"image/jpeg":`image/${ext}`}
  function formatBytes(bytes){if(bytes<1024)return`${bytes} B`;if(bytes<1048576)return`${(bytes/1024).toFixed(1)} KB`;return`${(bytes/1048576).toFixed(1)} MB`}
  function baseName(name){return name.replace(/\.[^.]+$/,"")}
  function canvasBlob(canvas,mime,quality=.92){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Canvas export failed")),mime,quality))}
  function loadImage(blob){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(blob),image=new Image();image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Image decode failed"))};image.src=url})}
  async function imageToImage(target){const image=await loadImage(file),canvas=document.createElement("canvas");canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext("2d");if(target==="jpg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height)}ctx.drawImage(image,0,0);const mime=target==="jpg"?"image/jpeg":`image/${target}`;return{blob:await canvasBlob(canvas,mime,target==="png"?1:.92),name:`${baseName(file.name)}.${target}`}}
  async function imageToPdf(){if(!window.PDFLib)throw new Error("PDF tools are not ready");const image=await loadImage(file),canvas=document.createElement("canvas");canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);const jpg=await canvasBlob(canvas,"image/jpeg",.94),pdf=await PDFLib.PDFDocument.create(),embedded=await pdf.embedJpg(await jpg.arrayBuffer()),page=pdf.addPage([image.naturalWidth,image.naturalHeight]);page.drawImage(embedded,{x:0,y:0,width:image.naturalWidth,height:image.naturalHeight});return{blob:new Blob([await pdf.save()],{type:"application/pdf"}),name:`${baseName(file.name)}.pdf`}}
  async function pdfToImages(target){
    if(!window.pdfjsLib)throw new Error("PDF renderer is not ready");pdfjsLib.GlobalWorkerOptions.workerSrc="/assets/pdfjs/pdf.worker.min.js";
    const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise,items=[];
    for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){const page=await pdf.getPage(pageNo),viewport=page.getViewport({scale:2}),canvas=document.createElement("canvas");canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const ctx=canvas.getContext("2d");if(target==="jpg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height)}await page.render({canvasContext:ctx,viewport}).promise;const mime=target==="jpg"?"image/jpeg":`image/${target}`;items.push({blob:await canvasBlob(canvas,mime,target==="png"?1:.92),name:`${baseName(file.name)}-${pageNo}.${target}`})}
    if(items.length===1)return items[0];if(!window.JSZip)throw new Error("ZIP tools are not ready");const zip=new JSZip();items.forEach(item=>zip.file(item.name,item.blob));return{blob:await zip.generateAsync({type:"blob"}),name:`${baseName(file.name)}-${target}.zip`}
  }
  async function convert(){
    const target=document.querySelector('input[name="output"]:checked').value,type=file.type||typeFromName(file.name);
    if(type==="application/pdf"){
      if(target==="pdf")return{blob:file.slice(0,file.size,"application/pdf"),name:`${baseName(file.name)}.pdf`};
      return pdfToImages(target);
    }
    if(target==="pdf")return imageToPdf();
    return imageToImage(target);
  }

  ui.drop.addEventListener("click",()=>ui.input.click()); ui.replace.addEventListener("click",()=>ui.input.click()); ui.input.addEventListener("change",()=>setFile(ui.input.files[0]));
  ["dragenter","dragover"].forEach(event=>ui.drop.addEventListener(event,e=>{e.preventDefault();ui.drop.classList.add("dragging")}));["dragleave","drop"].forEach(event=>ui.drop.addEventListener(event,e=>{e.preventDefault();ui.drop.classList.remove("dragging")}));ui.drop.addEventListener("drop",e=>setFile(e.dataTransfer.files[0]));
  ui.convert.addEventListener("click",async()=>{if(!file)return;clearResult();ui.convert.disabled=true;ui.status.textContent=copy[lang].processing;try{const result=await convert();resultUrl=URL.createObjectURL(result.blob);ui.download.href=resultUrl;ui.download.download=result.name;ui.download.hidden=false;ui.status.textContent=`${copy[lang].ready} · ${formatBytes(result.blob.size)}`;ui.status.className="status success"}catch(error){console.error(error);showError(copy[lang].failed)}finally{ui.convert.disabled=false}});
  ui.language.addEventListener("change",()=>{lang=ui.language.value;const url=new URL(location.href);url.searchParams.set("lang",lang);history.replaceState(null,"",url);renderLanguage()});
  ui.theme.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;try{localStorage.setItem("convertfiles24-theme",next)}catch(_){}renderTheme()});
  addEventListener("beforeunload",()=>{if(resultUrl)URL.revokeObjectURL(resultUrl)});renderLanguage();renderTheme();
})();

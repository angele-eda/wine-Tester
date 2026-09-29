const $ = selector => document.querySelector(selector);
pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/pdfjs/pdf.worker.min.js";

const mode = document.body.dataset.pdfTool;
let file = null;
let pdf = null;
let pages = [];
let resultUrl = "";

const common = {
  en:{allTools:"All tools",privacy:"Privacy",eyebrow:"PDF tool",selectLabel:"Select a PDF",dropCopy:"Select a file or drag it here",choose:"Choose PDF",limit:"1 PDF · up to 100 pages · 100MB",replace:"Other PDF",localTitle:"Processed on your device",localCopy:"Your PDF is never uploaded to a server.",download:"Download PDF",why:"Why ConvertFiles24",privateTitle:"Private by design",privateCopy:"The file stays on your device.",copyright:"© 2026 ConvertFiles24. Safe local PDF tools.",privacyPolicy:"Privacy Policy",terms:"Terms",page:n=>`Page ${n}`,meta:(n,s)=>`${n} pages · ${s}`,bad:"Choose a valid PDF under 100MB.",many:"PDFs with up to 100 pages are supported.",working:"Saving PDF…",failed:"Could not process this PDF."},
  ko:{allTools:"모든 도구",privacy:"개인정보 보호",eyebrow:"PDF 도구",selectLabel:"PDF 선택",dropCopy:"파일을 선택하거나 이곳에 끌어놓으세요",choose:"PDF 선택",limit:"PDF 1개 · 최대 100페이지 · 100MB",replace:"다른 PDF",localTitle:"기기에서 안전하게 처리",localCopy:"PDF는 서버로 업로드되지 않습니다.",download:"PDF 다운로드",why:"CONVERTFILES24를 선택하는 이유",privateTitle:"개인정보 보호 설계",privateCopy:"파일은 기기에만 남습니다.",copyright:"© 2026 ConvertFiles24. 안전한 기기 내 PDF 도구.",privacyPolicy:"개인정보처리방침",terms:"이용약관",page:n=>`${n}페이지`,meta:(n,s)=>`${n}페이지 · ${s}`,bad:"100MB 이하의 올바른 PDF를 선택하세요.",many:"최대 100페이지 PDF까지 지원합니다.",working:"PDF를 저장하는 중…",failed:"PDF를 처리하지 못했습니다."}
};
const tools = {
  rotate:{
    en:{title:"Rotate PDF",subtitle:"Rotate PDF pages to the direction you need.",caption:"Rotate pages left or right",dropTitle:"Choose a PDF to rotate",hint:"Rotate each page left or right, then save your PDF.",save:"Save rotated PDF",featureTitle:"Easy PDF page rotation",controlTitle:"Page-by-page rotation",controlCopy:"Rotate every page to the direction you need.",cleanTitle:"Preserve PDF quality",cleanCopy:"Save the rotated pages as one clean PDF.",ready:s=>`Rotated PDF ready · ${s}`},
    ko:{title:"PDF 회전",subtitle:"PDF 페이지를 원하는 방향으로 회전하세요.",caption:"페이지별 왼쪽 · 오른쪽 회전",dropTitle:"회전할 PDF를 선택하세요",hint:"각 페이지를 왼쪽 또는 오른쪽으로 회전한 뒤 저장하세요.",save:"회전한 PDF 저장",featureTitle:"간편한 PDF 페이지 회전",controlTitle:"페이지별 회전",controlCopy:"각 페이지를 원하는 방향으로 회전하세요.",cleanTitle:"PDF 품질 유지",cleanCopy:"회전한 페이지를 하나의 PDF로 저장합니다.",ready:s=>`회전한 PDF가 준비되었습니다 · ${s}`}
  },
  delete:{
    en:{title:"Delete PDF Pages",subtitle:"Remove unwanted pages from your PDF.",caption:"Select pages · remove · save",dropTitle:"Choose a PDF to edit",hint:"Select the pages you want to remove. At least one page must remain.",save:"Save PDF without selected pages",featureTitle:"Remove unwanted PDF pages",controlTitle:"Clear page selection",controlCopy:"Mark only the pages you no longer need.",cleanTitle:"One clean PDF",cleanCopy:"Keep the remaining pages in their original order.",selected:n=>`${n} page${n===1?"":"s"} selected for deletion`,empty:"Keep at least one page.",ready:s=>`Updated PDF ready · ${s}`},
    ko:{title:"PDF 페이지 삭제",subtitle:"필요 없는 PDF 페이지를 선택해서 삭제하세요.",caption:"페이지 선택 · 삭제 · 저장",dropTitle:"페이지를 삭제할 PDF를 선택하세요",hint:"삭제할 페이지를 선택하세요. 한 페이지 이상은 남겨야 합니다.",save:"선택한 페이지를 제외하고 저장",featureTitle:"불필요한 PDF 페이지 삭제",controlTitle:"명확한 페이지 선택",controlCopy:"필요 없는 페이지만 선택해서 삭제하세요.",cleanTitle:"하나의 깔끔한 PDF",cleanCopy:"남은 페이지를 원래 순서대로 저장합니다.",selected:n=>`${n}개 페이지 삭제 선택`,empty:"페이지를 한 장 이상 남겨야 합니다.",ready:s=>`수정한 PDF가 준비되었습니다 · ${s}`}
  },
  extract:{
    en:{title:"Extract PDF Pages",subtitle:"Select specific pages and save them as a new PDF.",caption:"Select pages · create a new PDF",dropTitle:"Choose a PDF to extract pages",hint:"Select the pages you want in the new PDF.",save:"Save selected pages",featureTitle:"Extract the PDF pages you need",controlTitle:"Precise page selection",controlCopy:"Choose specific pages from the original PDF.",cleanTitle:"A new focused PDF",cleanCopy:"Save selected pages in their original order.",selected:n=>`${n} page${n===1?"":"s"} selected`,empty:"Select at least one page.",ready:s=>`Extracted PDF ready · ${s}`},
    ko:{title:"PDF 페이지 추출",subtitle:"필요한 PDF 페이지만 선택해서 새 PDF로 저장하세요.",caption:"페이지 선택 · 새 PDF 저장",dropTitle:"페이지를 추출할 PDF를 선택하세요",hint:"새 PDF에 포함할 페이지를 선택하세요.",save:"선택한 페이지 저장",featureTitle:"필요한 PDF 페이지만 추출",controlTitle:"정확한 페이지 선택",controlCopy:"원본 PDF에서 필요한 페이지만 선택하세요.",cleanTitle:"새로운 맞춤 PDF",cleanCopy:"선택한 페이지를 원래 순서대로 저장합니다.",selected:n=>`${n}개 페이지 선택`,empty:"페이지를 한 장 이상 선택하세요.",ready:s=>`추출한 PDF가 준비되었습니다 · ${s}`}
  }
};
tools.rotate.ja={title:"PDFを回転",subtitle:"PDFページを必要な向きに回転します。",caption:"ページを左または右に回転",dropTitle:"回転するPDFを選択",hint:"各ページを左または右に回転してからPDFを保存します。",save:"回転したPDFを保存",featureTitle:"簡単なPDFページ回転",controlTitle:"ページごとの回転",controlCopy:"各ページを必要な向きに回転できます。",cleanTitle:"PDF品質を維持",cleanCopy:"回転したページを1つのPDFとして保存します。",ready:s=>`回転したPDFの準備ができました · ${s}`};
tools.rotate.es={title:"Girar PDF",subtitle:"Gira las páginas del PDF en la dirección que necesites.",caption:"Girar páginas a la izquierda o derecha",dropTitle:"Elige un PDF para girar",hint:"Gira cada página a la izquierda o derecha y guarda el PDF.",save:"Guardar PDF girado",featureTitle:"Rotación sencilla de páginas PDF",controlTitle:"Rotación página por página",controlCopy:"Gira cada página en la dirección que necesites.",cleanTitle:"Conserva la calidad del PDF",cleanCopy:"Guarda las páginas giradas en un único PDF.",ready:s=>`PDF girado listo · ${s}`};
tools.delete.ja={title:"PDFページを削除",subtitle:"不要なページをPDFから削除します。",caption:"ページを選択 · 削除 · 保存",dropTitle:"編集するPDFを選択",hint:"削除するページを選択してください。少なくとも1ページは残す必要があります。",save:"選択したページを除いて保存",featureTitle:"不要なPDFページを削除",controlTitle:"わかりやすいページ選択",controlCopy:"不要なページだけを選択して削除します。",cleanTitle:"すっきりした1つのPDF",cleanCopy:"残りのページを元の順序で保存します。",selected:n=>`${n}ページを削除対象に選択`,empty:"少なくとも1ページ残してください。",ready:s=>`更新したPDFの準備ができました · ${s}`};
tools.delete.es={title:"Eliminar páginas PDF",subtitle:"Elimina páginas no deseadas de tu PDF.",caption:"Seleccionar páginas · eliminar · guardar",dropTitle:"Elige un PDF para editar",hint:"Selecciona las páginas que quieres eliminar. Debe quedar al menos una.",save:"Guardar PDF sin las páginas seleccionadas",featureTitle:"Elimina páginas PDF no deseadas",controlTitle:"Selección clara de páginas",controlCopy:"Marca solo las páginas que ya no necesitas.",cleanTitle:"Un único PDF limpio",cleanCopy:"Conserva las páginas restantes en su orden original.",selected:n=>`${n} página${n===1?"":"s"} seleccionada${n===1?"":"s"} para eliminar`,empty:"Conserva al menos una página.",ready:s=>`PDF actualizado listo · ${s}`};
tools.extract.ja={title:"PDFページを抽出",subtitle:"必要なPDFページを選択して新しいPDFとして保存します。",caption:"ページを選択 · 新しいPDFを作成",dropTitle:"ページを抽出するPDFを選択",hint:"新しいPDFに含めるページを選択してください。",save:"選択したページを保存",featureTitle:"必要なPDFページを抽出",controlTitle:"正確なページ選択",controlCopy:"元のPDFから必要なページを選択します。",cleanTitle:"目的に合った新しいPDF",cleanCopy:"選択したページを元の順序で保存します。",selected:n=>`${n}ページを選択`,empty:"少なくとも1ページ選択してください。",ready:s=>`抽出したPDFの準備ができました · ${s}`};
tools.extract.es={title:"Extraer páginas PDF",subtitle:"Selecciona páginas específicas y guárdalas como un nuevo PDF.",caption:"Seleccionar páginas · crear un PDF nuevo",dropTitle:"Elige un PDF para extraer páginas",hint:"Selecciona las páginas que quieres incluir en el nuevo PDF.",save:"Guardar páginas seleccionadas",featureTitle:"Extrae las páginas PDF que necesitas",controlTitle:"Selección precisa de páginas",controlCopy:"Elige páginas específicas del PDF original.",cleanTitle:"Un nuevo PDF enfocado",cleanCopy:"Guarda las páginas seleccionadas en su orden original.",selected:n=>`${n} página${n===1?"":"s"} seleccionada${n===1?"":"s"}`,empty:"Selecciona al menos una página.",ready:s=>`PDF extraído listo · ${s}`};
common.ja={allTools:"すべてのツール",privacy:"プライバシー",eyebrow:"PDFツール",selectLabel:"PDFを選択",dropCopy:"ファイルを選択するか、ここにドラッグしてください",choose:"PDFを選択",limit:"PDF 1ファイル · 最大100ページ · 100MB",replace:"別のPDF",localTitle:"端末内で安全に処理",localCopy:"PDFがサーバーにアップロードされることはありません。",download:"PDFをダウンロード",why:"ConvertFiles24が選ばれる理由",privateTitle:"プライバシー重視",privateCopy:"ファイルは端末内にのみ残ります。",copyright:"© 2026 ConvertFiles24. 安全なローカルPDFツール。",privacyPolicy:"プライバシーポリシー",terms:"利用規約",page:n=>`${n}ページ`,meta:(n,s)=>`${n}ページ · ${s}`,bad:"100MB以下の有効なPDFを選択してください。",many:"最大100ページのPDFに対応しています。",working:"PDFを保存中…",failed:"このPDFを処理できませんでした。"};
common.es={allTools:"Todas las herramientas",privacy:"Privacidad",eyebrow:"Herramienta PDF",selectLabel:"Seleccionar un PDF",dropCopy:"Selecciona un archivo o arrástralo aquí",choose:"Elegir PDF",limit:"1 PDF · hasta 100 páginas · 100 MB",replace:"Otro PDF",localTitle:"Procesado en tu dispositivo",localCopy:"Tu PDF nunca se sube a un servidor.",download:"Descargar PDF",why:"Por qué elegir ConvertFiles24",privateTitle:"Privacidad desde el diseño",privateCopy:"El archivo permanece en tu dispositivo.",copyright:"© 2026 ConvertFiles24. Herramientas PDF locales y seguras.",privacyPolicy:"Política de privacidad",terms:"Términos",page:n=>`Página ${n}`,meta:(n,s)=>`${n} páginas · ${s}`,bad:"Elige un PDF válido de menos de 100 MB.",many:"Se admiten PDF de hasta 100 páginas.",working:"Guardando PDF…",failed:"No se pudo procesar este PDF."};
let lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("convertfiles24-language") || "en";
if (!common[lang]) lang = "en";
const tr = key => tools[mode][lang][key] ?? common[lang][key] ?? tools[mode].en[key] ?? common.en[key];
const formatSize = bytes => bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(1)} MB`;

function clearResult(){ if(resultUrl) URL.revokeObjectURL(resultUrl); resultUrl=""; $("#downloadButton").hidden=true; $("#status").textContent=""; }
function updateSelection(){
  const count=pages.filter(page=>page.selected).length;
  let note=$("#selectionCount");
  if(mode!=="rotate"&&!note){note=document.createElement("p");note.id="selectionCount";note.className="selection-count";$("#pageList").after(note);}
  if(note) note.textContent=tr("selected")(count);
  $("#saveButton").disabled=!file||(mode==="extract"&&count===0)||(mode==="delete"&&count===pages.length);
}
function i18n(){
  document.documentElement.lang=lang; $("#languageSelect").value=lang;
  document.querySelectorAll("[data-i18n]").forEach(element=>{const value=tr(element.dataset.i18n);if(typeof value==="string")element.textContent=value;});
  updateSelection();
}
async function loadPdf(nextFile){
  clearResult();
  if(!nextFile||(!/\.pdf$/i.test(nextFile.name)&&nextFile.type!=="application/pdf")||nextFile.size>104857600)return showError("bad");
  try{
    file=nextFile; pdf=await pdfjsLib.getDocument({data:new Uint8Array(await nextFile.arrayBuffer())}).promise;
    if(pdf.numPages>100)return showError("many");
    pages=Array.from({length:pdf.numPages},(_,index)=>({source:index,rotation:0,selected:false}));
    $("#fileName").textContent=nextFile.name; $("#fileMeta").textContent=tr("meta")(pdf.numPages,formatSize(nextFile.size));
    $("#dropZone").hidden=true; $("#summary").hidden=false; $("#pageList").hidden=false; $("#orderHint").hidden=false;
    await renderPages(); updateSelection();
  }catch(error){console.error(error);showError("bad");}
}
async function renderPages(){
  const list=$("#pageList"); list.innerHTML="";
  for(let index=0;index<pages.length;index++){
    const item=pages[index],card=document.createElement("article");
    card.className=`page-card${item.selected?mode==="delete"?" is-removed":" is-selected":""}`;
    const actions=mode==="rotate"?'<div class="page-actions two"><button data-action="left" aria-label="Rotate left"><span class="material-symbols-outlined">rotate_left</span></button><button data-action="right" aria-label="Rotate right"><span class="material-symbols-outlined">rotate_right</span></button></div>':`<div class="page-actions one"><button data-action="select" class="${item.selected?"is-active":""} ${mode==="delete"?"is-remove":""}" aria-pressed="${item.selected}"><span class="material-symbols-outlined">${mode==="delete"?"delete":"check"}</span></button></div>`;
    card.innerHTML=`<div class="page-preview"><canvas style="--rotation:${item.rotation}deg"></canvas></div><span class="page-label">${tr("page")(index+1)}</span>${actions}`;
    card.querySelectorAll("button").forEach(button=>button.onclick=()=>{
      if(button.dataset.action==="left") item.rotation=(item.rotation+270)%360;
      else if(button.dataset.action==="right") item.rotation=(item.rotation+90)%360;
      else item.selected=!item.selected;
      clearResult(); renderPages(); updateSelection();
    });
    list.append(card);
    const sourcePage=await pdf.getPage(item.source+1),viewport=sourcePage.getViewport({scale:.35}),canvas=card.querySelector("canvas");
    canvas.width=viewport.width; canvas.height=viewport.height;
    await sourcePage.render({canvasContext:canvas.getContext("2d"),viewport}).promise;
  }
}
function showError(key){$("#status").textContent=tr(key);$("#status").className="status error";}
$("#dropZone").onclick=()=>$("#fileInput").click(); $("#replaceButton").onclick=()=>$("#fileInput").click(); $("#fileInput").onchange=event=>loadPdf(event.target.files[0]);
["dragover","drop"].forEach(name=>$("#dropZone").addEventListener(name,event=>event.preventDefault())); $("#dropZone").addEventListener("drop",event=>loadPdf(event.dataTransfer.files[0]));
$("#saveButton").onclick=async()=>{
  clearResult(); const selected=pages.filter(page=>page.selected).length;
  if(mode==="extract"&&selected===0)return showError("empty"); if(mode==="delete"&&selected===pages.length)return showError("empty");
  $("#status").textContent=tr("working");
  try{
    const source=await PDFLib.PDFDocument.load(await file.arrayBuffer()),output=await PDFLib.PDFDocument.create();
    const included=pages.filter(page=>mode==="rotate"||(mode==="delete"?!page.selected:page.selected));
    for(const item of included){const [page]=await output.copyPages(source,[item.source]);if(mode==="rotate")page.setRotation(PDFLib.degrees((page.getRotation().angle+item.rotation)%360));output.addPage(page);}
    const blob=new Blob([await output.save()],{type:"application/pdf"}); resultUrl=URL.createObjectURL(blob);
    $("#downloadButton").href=resultUrl; $("#downloadButton").download=`${mode}-pdf.pdf`; $("#downloadButton").hidden=false; $("#status").textContent=tr("ready")(formatSize(blob.size)); $("#status").className="status";
  }catch(error){console.error(error);showError("failed");}
};
$("#languageSelect").onchange=event=>{lang=event.target.value;localStorage.setItem("convertfiles24-language",lang);const url=new URL(location.href);url.searchParams.set("lang",lang);history.replaceState({},"",url);i18n();renderPages();};
$("#themeButton").onclick=()=>{const value=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=value;localStorage.setItem("convertfiles24-theme",value);$("#themeIcon").textContent=value==="dark"?"☾":"☀";};
$("#themeIcon").textContent=document.documentElement.dataset.theme==="dark"?"☾":"☀"; i18n();

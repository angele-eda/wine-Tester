(function(){
  var storedTheme = "light";
  try { storedTheme = localStorage.getItem("convertfiles24-theme") === "dark" ? "dark" : "light"; } catch (_) {}
  document.documentElement.dataset.theme = storedTheme;
  var current = new URL(window.location.href);
  var lang = current.searchParams.get("lang") || document.documentElement.lang || "en";
  var embedded = current.searchParams.get("embed") === "1";
  if (embedded) document.body.classList.add("cf24-embed");
  if (embedded) return;
  var isKo = String(lang).toLowerCase().startsWith("ko");
  var legacyLanguage = document.querySelector(".langSelect");
  if (legacyLanguage && legacyLanguage.value) isKo = legacyLanguage.value === "ko";
  var unifiedRoutes = ["/convert/", "/pdf-merge/", "/split-pdf/", "/compress-pdf/", "/pdf-jpg/", "/jpg-pdf/"];
  var isUnifiedTool = unifiedRoutes.indexOf(current.pathname) !== -1;
  if (isUnifiedTool) {
    var copy = {
      "/convert/": { en:["File Converter","Convert JPG, PNG, WebP and PDF files quickly on your device."], ko:["파일 변환기","JPG, PNG, WebP, PDF 파일을 기기에서 빠르게 변환하세요."] },
      "/pdf-merge/": { en:["Merge PDF","Combine multiple PDF documents into one file."], ko:["PDF 합치기","여러 PDF 문서를 하나의 파일로 합치세요."] },
      "/split-pdf/": { en:["Split PDF","Separate PDF pages into individual files."], ko:["PDF 나누기","PDF 페이지를 원하는 범위의 파일로 분리하세요."] },
      "/compress-pdf/": { en:["Compress PDF","Reduce PDF file size while keeping clear visual quality."], ko:["PDF 압축","보기 좋은 품질을 유지하면서 PDF 용량을 줄이세요."] },
      "/pdf-jpg/": { en:["PDF to JPG / PNG","Turn every PDF page into a high-quality JPG or PNG image."], ko:["PDF를 JPG / PNG로","PDF의 각 페이지를 JPG 또는 PNG 이미지로 변환하세요."] },
      "/jpg-pdf/": { en:["JPG / PNG to PDF","Create one PDF from your JPG or PNG image sequence."], ko:["JPG / PNG를 PDF로","JPG 또는 PNG 이미지 여러 장을 하나의 PDF로 만드세요."] }
    }[current.pathname][isKo ? "ko" : "en"];
    var toolIcon = {"/convert/":"swap_horiz","/pdf-merge/":"merge","/split-pdf/":"content_cut","/compress-pdf/":"compress","/pdf-jpg/":"image","/jpg-pdf/":"picture_as_pdf"}[current.pathname];
    document.body.classList.add("cf24-unified-page");
    var wrap = document.querySelector(".wrap");
    var top = wrap && wrap.querySelector(":scope > .top");
    if (top) {
      var title = top.querySelector("h1");
      var subtitle = top.querySelector(".sub");
      if (title) title.textContent = copy[0];
      if (subtitle) subtitle.textContent = copy[1];
      if (title && !top.querySelector(".cf24-eyebrow")) {
        var eyebrow = document.createElement("p");
        eyebrow.className = "cf24-eyebrow";
        eyebrow.textContent = isKo ? "파일 도구" : "FILE TOOLS";
        title.parentNode.insertBefore(eyebrow, title);
      }
    }
    var existingPanel = wrap && wrap.querySelector(":scope > .grid, :scope > .stageWrap");
    if (existingPanel) existingPanel.classList.add("cf24-unified-grid");
    if (wrap && !existingPanel) {
      var cards = Array.prototype.filter.call(wrap.children, function(node){ return node.classList && node.classList.contains("card"); });
      if (cards.length >= 2) {
        var panel = document.createElement("div");
        panel.className = "cf24-unified-grid";
        wrap.insertBefore(panel, cards[0]);
        cards.forEach(function(card){ panel.appendChild(card); });
      }
    }
    var activePanel = wrap && wrap.querySelector(".cf24-unified-grid");
    if (activePanel) {
      var panelCards = activePanel.querySelectorAll(":scope > .card");
      if (panelCards[0] && panelCards[0].querySelector("h2")) panelCards[0].querySelector("h2").textContent = isKo ? "파일 선택" : "Select files";
      if (panelCards[1] && panelCards[1].querySelector("h2")) panelCards[1].querySelector("h2").textContent = isKo ? "출력 설정" : "Output settings";
      var dropTitle = activePanel.querySelector("#drop_title, .dropTitle, .uploadTitle");
      var dropCopy = activePanel.querySelector("#drop_hint, .dropHint, .uploadSub");
      if (dropTitle) dropTitle.textContent = isKo ? "변환할 파일을 선택하세요" : "Choose files to process";
      if (dropCopy) dropCopy.textContent = isKo ? "기기에서 파일을 선택해 바로 작업할 수 있습니다" : "Choose files from your device to get started";
      var dropZone = activePanel.querySelector(".drop, .uploadBox, .dropzone, .dropZone");
      if (dropZone) {
        var dropIcon = dropZone.querySelector(".dropEmoji, .dropIcon");
        if (!dropIcon) { dropIcon = document.createElement("span"); dropZone.insertBefore(dropIcon, dropZone.firstChild); }
        dropIcon.className = "material-symbols-outlined cf24-drop-icon notranslate";
        dropIcon.setAttribute("translate", "no");
        dropIcon.textContent = toolIcon;
        if (!dropZone.querySelector(".cf24-choose")) {
          var choose = document.createElement("b");
          choose.className = "cf24-choose";
          choose.textContent = isKo ? "파일 선택" : "Choose files";
          if (dropCopy) dropCopy.parentNode.insertBefore(choose, dropCopy); else dropZone.appendChild(choose);
        }
      }
      var actionButton = activePanel.querySelector("#convert, #mergeBtn, #downloadBtn, #compressBtn, #convertBtn");
      if (actionButton) {
        var actionLabels = {
          "/convert/": ["Convert files","파일 변환"],
          "/pdf-merge/": ["Merge PDF","PDF 합치기"],
          "/split-pdf/": ["Split PDF","PDF 나누기"],
          "/compress-pdf/": ["Compress PDF","PDF 압축"],
          "/pdf-jpg/": ["Convert to images","이미지로 변환"],
          "/jpg-pdf/": ["Create PDF","PDF 만들기"]
        }[current.pathname];
        actionButton.innerHTML = '<span>' + actionLabels[isKo ? 1 : 0] + '</span><span class="material-symbols-outlined notranslate" translate="no">arrow_forward</span>';
        if (!activePanel.querySelector(".cf24-privacy")) {
          var privacy = document.createElement("div");
          privacy.className = "cf24-privacy";
          privacy.innerHTML = '<span class="material-symbols-outlined notranslate" translate="no">lock</span><div><strong>' + (isKo ? '안전한 기기 내 처리' : 'Private on-device processing') + '</strong><small>' + (isKo ? '파일은 서버로 업로드되지 않습니다.' : 'Your files are never uploaded to a server.') + '</small></div>';
          var actionAnchor = actionButton.parentNode.classList && actionButton.parentNode.classList.contains("row") ? actionButton.parentNode : actionButton;
          actionAnchor.parentNode.insertBefore(privacy, actionAnchor);
        }
      }
    }
  }
  var bar = document.createElement("header");
  bar.className = "cf24-bar";
  bar.innerHTML =
    '<a class="cf24-brand" href="/">' +
      '<span class="cf24-brand-mark notranslate" translate="no"><svg viewBox="0 0 24 24" fill="none"><path d="M4 9a8 8 0 0 1 14-5M18 4v5h-5M20 15a8 8 0 0 1-14 5M6 20v-5h5"/></svg></span>' +
      '<span class="notranslate" translate="no">ConvertFiles24</span>' +
    '</a>' +
    '<nav class="cf24-nav">' +
      '<a href="/#tools">' + (isKo ? '모든 도구' : 'All tools') + '</a>' +
      '<a href="/privacy/">' + (isKo ? '개인정보 보호' : 'Privacy') + '</a>' +
      '<label class="cf24-language"><span aria-hidden="true">◎</span><select aria-label="Language"><option value="en">EN</option><option value="ko">KO</option></select></label>' +
      '<button class="cf24-theme" type="button" aria-label="Switch theme">' + (storedTheme === "dark" ? '☾' : '☀') + '</button>' +
    '</nav>';
  document.body.insertBefore(bar, document.body.firstChild);
  var themeButton = bar.querySelector(".cf24-theme");
  var headerLanguage = bar.querySelector(".cf24-language select");
  headerLanguage.value = isKo ? "ko" : "en";
  headerLanguage.addEventListener("change", function(){ current.searchParams.set("lang", headerLanguage.value); window.location.href = current.toString(); });
  themeButton.addEventListener("click", function(){
    var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    themeButton.textContent = next === "dark" ? "☾" : "☀";
    try { localStorage.setItem("convertfiles24-theme", next); } catch (_) {}
  });
})();

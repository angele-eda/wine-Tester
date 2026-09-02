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
  var bar = document.createElement("header");
  bar.className = "cf24-bar";
  bar.innerHTML =
    '<a class="cf24-brand" href="/">' +
      '<span class="cf24-brand-mark notranslate" translate="no"><svg viewBox="0 0 24 24" fill="none"><path d="M4 9a8 8 0 0 1 14-5M18 4v5h-5M20 15a8 8 0 0 1-14 5M6 20v-5h5"/></svg></span>' +
      '<span class="notranslate" translate="no">ConvertFiles24</span>' +
    '</a>' +
    '<nav class="cf24-nav">' +
      '<a href="/">' + (isKo ? '모든 도구' : 'All tools') + '</a>' +
      '<a href="/privacy/">' + (isKo ? '개인정보 보호' : 'Privacy') + '</a>' +
      '<button class="cf24-theme" type="button" aria-label="Switch theme">' + (storedTheme === "dark" ? '☾' : '☀') + '</button>' +
    '</nav>';
  document.body.insertBefore(bar, document.body.firstChild);
  var themeButton = bar.querySelector(".cf24-theme");
  themeButton.addEventListener("click", function(){
    var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    themeButton.textContent = next === "dark" ? "☾" : "☀";
    try { localStorage.setItem("convertfiles24-theme", next); } catch (_) {}
  });
})();

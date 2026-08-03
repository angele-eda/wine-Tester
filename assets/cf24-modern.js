(function(){
  var current = new URL(window.location.href);
  var lang = current.searchParams.get("lang") || document.documentElement.lang || "en";
  var isKo = String(lang).toLowerCase().startsWith("ko");
  var bar = document.createElement("header");
  bar.className = "cf24-bar";
  bar.innerHTML =
    '<a class="cf24-brand" href="/">' +
      '<span class="cf24-brand-mark">C</span>' +
      '<span>ConvertFiles<b>24</b></span>' +
    '</a>' +
    '<nav class="cf24-nav">' +
      '<a href="/">' + (isKo ? '모든 도구' : 'All tools') + '</a>' +
      '<a href="/privacy/">' + (isKo ? '개인정보 보호' : 'Privacy') + '</a>' +
    '</nav>';
  document.body.insertBefore(bar, document.body.firstChild);
})();

(() => {
  const languageSelect = document.querySelector("#languageSelect");
  const themeButton = document.querySelector("#themeButton");
  const themeIcon = document.querySelector("#themeIcon");
  let language = (new URLSearchParams(location.search).get("lang") || localStorage.getItem("convertfiles24-language") || navigator.language || "en").slice(0,2).toLowerCase();
  if (!["en","ko","ja","es"].includes(language)) language = "en";
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("convertfiles24-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☾" : "☀";
  }
  languageSelect.value = language;
  document.documentElement.lang = language;
  setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  themeButton.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  languageSelect.addEventListener("change", event => {
    language = event.target.value;
    localStorage.setItem("convertfiles24-language", language);
    document.documentElement.lang = language;
    const url = new URL(location.href); url.searchParams.set("lang", language); history.replaceState({}, "", url);
  });
})();

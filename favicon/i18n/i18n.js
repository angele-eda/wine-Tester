/* favicon/i18n/i18n.js */
(function () {
  "use strict";

  const STR = window.CF24_FAVICON_STRINGS || {};
  if (!STR || !STR.en) return;

  const LS_LANG = "cf24_favicon_lang";
  const LS_MANUAL = "cf24_favicon_lang_manual";

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const el = byId(id);
    if (!el || typeof text !== "string") return;
    el.textContent = text;
  }

  function detectLang() {
    const qp = new URL(location.href).searchParams.get("lang");
    const q = (qp || "").toLowerCase();
    if (q && STR[q]) return q;

    const manual = localStorage.getItem(LS_MANUAL) === "1";
    const saved = localStorage.getItem(LS_LANG);
    if (manual && saved && STR[saved]) return saved;

    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("ko")) return "ko";
    if (nav.startsWith("ja")) return "ja";
    if (nav.startsWith("es")) return "es";
    return "en";
  }

  function applyLang(lang, isManual) {
    if (!STR[lang]) lang = "en";
    const t = STR[lang];

    document.documentElement.lang = lang;

    localStorage.setItem(LS_LANG, lang);
    if (isManual) {
      localStorage.setItem(LS_MANUAL, "1");
    }

    const sel = byId("fav_langSelect");
    if (sel) sel.value = lang;

    setText("fav_brand_sub", t.brandSub);
    setText("fav_hero_title", t.heroTitle);
    setText("fav_hero_sub", t.heroSub);

    setText("fav_c1_title", t.c1?.title || "");
    setText("fav_c1_desc", t.c1?.desc || "");
    setText("fav_c1_tag", t.c1?.tag || "");
    setText("fav_c1_btn", t.start);

    setText("fav_c2_title", t.c2?.title || "");
    setText("fav_c2_desc", t.c2?.desc || "");
    setText("fav_c2_tag", t.c2?.tag || "");
    setText("fav_c2_btn", t.start);

    setText("fav_c3_title", t.c3?.title || "");
    setText("fav_c3_desc", t.c3?.desc || "");
    setText("fav_c3_tag", t.c3?.tag || "");
    setText("fav_c3_btn", t.start);

    setText("fav_c4_title", t.c4?.title || "");
    setText("fav_c4_desc", t.c4?.desc || "");
    setText("fav_c4_tag", t.c4?.tag || "");
    setText("fav_c4_btn", t.start);

    setText("fav_footer_brand", t.footerBrand);
    setText("fav_footer_about", t.footerAbout);
  }

  applyLang(detectLang(), false);

  const sel = byId("fav_langSelect");
  if (sel) {
    sel.addEventListener("change", function (e) {
      applyLang(e.target.value, true);
    });
  }

  window.CF24_FAVICON_I18N = {
    apply: function (lang) {
      applyLang(lang, true);
    },
    current: function () {
      return document.documentElement.lang || "en";
    },
  };
})();

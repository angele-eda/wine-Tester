(() => {
  const languageSelect = document.querySelector("#languageSelect");
  const themeButton = document.querySelector("#themeButton");
  const themeIcon = document.querySelector("#themeIcon");
  const copy = {
    en: {seoTitle:"Contact ConvertFiles24 | Support and Feedback",seoDescription:"Contact ConvertFiles24 for support, bug reports, privacy questions, and feedback about our browser-based file tools.",ogDescription:"Get support or share feedback about ConvertFiles24.",eyebrow:"Support",title:"Contact ConvertFiles24",subtitle:"Questions, feedback, or a problem with a tool? We would like to hear from you.",cardEyebrow:"Contact and support",cardTitle:"Send us your question",cardCopy:"Use the ConvertFiles24 support page for bug reports, privacy questions, and general feedback. Please do not attach private or sensitive files.",button:"Open support page",note:"We review submitted requests and use them to improve the service."},
    ko: {seoTitle:"ConvertFiles24 문의 | 지원 및 의견",seoDescription:"ConvertFiles24 도구 지원, 오류 신고, 개인정보 관련 문의 및 서비스 개선 의견을 전달하세요.",ogDescription:"ConvertFiles24에 지원을 요청하거나 의견을 전달하세요.",eyebrow:"지원",title:"ConvertFiles24 문의",subtitle:"도구 이용 중 문제나 궁금한 점, 개선 의견이 있다면 알려주세요.",cardEyebrow:"문의 및 지원",cardTitle:"문의 내용을 보내주세요",cardCopy:"오류 신고, 개인정보 관련 문의 및 일반 의견은 ConvertFiles24 지원 페이지를 이용해 주세요. 개인 정보나 민감한 파일은 첨부하지 마세요.",button:"지원 페이지 열기",note:"접수된 내용을 검토하여 서비스 개선에 활용합니다."},
    ja: {seoTitle:"ConvertFiles24 お問い合わせ | サポートとご意見",seoDescription:"ConvertFiles24のサポート、不具合報告、プライバシーに関するお問い合わせ、ご意見はこちらから。",ogDescription:"ConvertFiles24のサポートを受ける、またはご意見をお寄せください。",eyebrow:"サポート",title:"ConvertFiles24 お問い合わせ",subtitle:"ご質問、不具合、ツールへのご意見をお聞かせください。",cardEyebrow:"お問い合わせとサポート",cardTitle:"お問い合わせを送信",cardCopy:"不具合報告、プライバシーに関するご質問、一般的なご意見はサポートページをご利用ください。個人情報や機密ファイルは添付しないでください。",button:"サポートページを開く",note:"お寄せいただいた内容を確認し、サービス改善に活用します。"},
    es: {seoTitle:"Contacto ConvertFiles24 | Soporte y comentarios",seoDescription:"Contacta con ConvertFiles24 para obtener soporte, informar errores, hacer preguntas de privacidad o enviar comentarios.",ogDescription:"Obtén soporte o comparte tus comentarios sobre ConvertFiles24.",eyebrow:"Soporte",title:"Contacto ConvertFiles24",subtitle:"¿Tienes preguntas, comentarios o algún problema con una herramienta? Queremos saberlo.",cardEyebrow:"Contacto y soporte",cardTitle:"Envíanos tu consulta",cardCopy:"Usa la página de soporte de ConvertFiles24 para informar errores, consultar sobre privacidad o enviar comentarios. No adjuntes archivos privados ni confidenciales.",button:"Abrir página de soporte",note:"Revisamos las solicitudes enviadas y las usamos para mejorar el servicio."}
  };
  let language = (new URLSearchParams(location.search).get("lang") || localStorage.getItem("convertfiles24-language") || navigator.language || "en").slice(0,2).toLowerCase();
  if (!copy[language]) language = "en";
  function render() {
    const labels = copy[language];
    document.documentElement.lang = language;
    document.title = labels.seoTitle;
    document.querySelector('meta[name="description"]').content = labels.seoDescription;
    document.querySelector('meta[property="og:title"]').content = labels.seoTitle;
    document.querySelector('meta[property="og:description"]').content = labels.ogDescription;
    document.querySelectorAll("[data-contact]").forEach(element => { element.textContent = labels[element.dataset.contact]; });
  }
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("convertfiles24-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☾" : "☀";
  }
  languageSelect.value = language;
  render();
  setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  themeButton.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  languageSelect.addEventListener("change", event => {
    language = event.target.value;
    localStorage.setItem("convertfiles24-language", language);
    const url = new URL(location.href); url.searchParams.set("lang", language); history.replaceState({}, "", url);
    render();
  });
})();

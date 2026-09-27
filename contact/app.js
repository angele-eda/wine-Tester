(() => {
  const languageSelect = document.querySelector("#languageSelect");
  const themeButton = document.querySelector("#themeButton");
  const themeIcon = document.querySelector("#themeIcon");
  const form = document.querySelector("#contactForm");
  const submitButton = document.querySelector("#contactSubmit");
  const status = document.querySelector("#contactStatus");
  const copy = {
    en: {seoTitle:"Contact ConvertFiles24 | Support and Feedback",seoDescription:"Contact ConvertFiles24 for support, bug reports, privacy questions, and feedback about our browser-based file tools.",ogDescription:"Get support or share feedback about ConvertFiles24.",eyebrow:"Support",title:"Contact ConvertFiles24",subtitle:"Questions, feedback, or a problem with a tool? We would like to hear from you.",cardEyebrow:"Contact and support",cardTitle:"Send us your question",cardCopy:"Send a message to the ConvertFiles24 team. Do not include passwords or other sensitive information.",nameLabel:"Name",emailLabel:"Email",messageLabel:"Message",directEmail:"Prefer email? Send a message to",button:"Send message",note:"Your message is sent through FormSubmit to our support email. On the first submission, approve the verification email sent to our inbox to activate delivery.",privacyBefore:"FormSubmit may retain submissions for up to 30 days. See its",privacyLink:"privacy policy",sending:"Sending your message…",success:"Your submission was accepted. If this is your first use, approve the FormSubmit verification email in our inbox to activate delivery.",failure:"We could not send your message. Please try again later."},
    ko: {seoTitle:"ConvertFiles24 문의 | 지원 및 의견",seoDescription:"ConvertFiles24 도구 지원, 오류 신고, 개인정보 관련 문의 및 서비스 개선 의견을 전달하세요.",ogDescription:"ConvertFiles24에 지원을 요청하거나 의견을 전달하세요.",eyebrow:"지원",title:"ConvertFiles24 문의",subtitle:"도구 이용 중 문제나 궁금한 점, 개선 의견이 있다면 알려주세요.",cardEyebrow:"문의 및 지원",cardTitle:"문의 내용을 보내주세요",cardCopy:"ConvertFiles24 팀에 문의를 보내주세요. 비밀번호나 민감한 정보는 입력하지 마세요.",nameLabel:"이름",emailLabel:"이메일 주소",messageLabel:"문의 내용",directEmail:"직접 이메일을 보내려면",button:"문의 보내기",note:"문의 내용은 FormSubmit을 거쳐 지원 이메일로 전달됩니다. 첫 제출 후에는 수신함으로 전송된 확인 메일을 승인해야 메일 전달이 활성화됩니다.",privacyBefore:"FormSubmit은 제출 내용을 최대 30일간 보관할 수 있습니다. 자세한 내용은",privacyLink:"개인정보 처리방침",sending:"문의 내용을 보내는 중…",success:"문의가 접수되었습니다. 처음 이용하신다면 지원 메일함에서 FormSubmit 확인 메일을 승인해야 메일 전달이 활성화됩니다.",failure:"문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요."},
    ja: {seoTitle:"ConvertFiles24 お問い合わせ | サポートとご意見",seoDescription:"ConvertFiles24のサポート、不具合報告、プライバシーに関するお問い合わせ、ご意見はこちらから。",ogDescription:"ConvertFiles24のサポートを受ける、またはご意見をお寄せください。",eyebrow:"サポート",title:"ConvertFiles24 お問い合わせ",subtitle:"ご質問、不具合、ツールへのご意見をお聞かせください。",cardEyebrow:"お問い合わせとサポート",cardTitle:"お問い合わせを送信",cardCopy:"ConvertFiles24 チームにメッセージをお送りください。パスワードなどの機密情報は入力しないでください。",nameLabel:"お名前",emailLabel:"メールアドレス",messageLabel:"お問い合わせ内容",directEmail:"メールで直接連絡する場合はこちら:",button:"送信する",note:"メッセージは FormSubmit を通じてサポート用メールに届きます。初回送信後、受信箱に届く確認メールを承認すると配信が有効になります。",privacyBefore:"FormSubmit は送信内容を最大30日間保持する場合があります。詳細は",privacyLink:"プライバシーポリシー",sending:"送信中…",success:"お問い合わせが受け付けられました。初回利用の場合は、受信箱に届いた FormSubmit の確認メールを承認してください。",failure:"送信できませんでした。しばらくしてからもう一度お試しください。"},
    es: {seoTitle:"Contacto ConvertFiles24 | Soporte y comentarios",seoDescription:"Contacta con ConvertFiles24 para obtener soporte, informar errores, hacer preguntas de privacidad o enviar comentarios.",ogDescription:"Obtén soporte o comparte tus comentarios sobre ConvertFiles24.",eyebrow:"Soporte",title:"Contacto ConvertFiles24",subtitle:"¿Tienes preguntas, comentarios o algún problema con una herramienta? Queremos saberlo.",cardEyebrow:"Contacto y soporte",cardTitle:"Envíanos tu consulta",cardCopy:"Envía un mensaje al equipo de ConvertFiles24. No incluyas contraseñas ni otra información confidencial.",nameLabel:"Nombre",emailLabel:"Correo electrónico",messageLabel:"Mensaje",directEmail:"Si prefieres escribirnos por correo:",button:"Enviar mensaje",note:"Tu mensaje se envía a nuestro correo de soporte a través de FormSubmit. En el primer envío, aprueba el correo de verificación recibido para activar la entrega.",privacyBefore:"FormSubmit puede conservar los envíos hasta 30 días. Consulta su",privacyLink:"política de privacidad",sending:"Enviando mensaje…",success:"Se aceptó tu envío. Si es la primera vez, aprueba el correo de verificación de FormSubmit para activar la entrega.",failure:"No se pudo enviar el mensaje. Inténtalo de nuevo más tarde."}
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
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const labels = copy[language];
    submitButton.disabled = true;
    status.className = "contact-status is-sending";
    status.textContent = labels.sending;
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {"Content-Type":"application/json", "Accept":"application/json"},
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== "true")) throw new Error("FormSubmit rejected the request");
      form.reset();
      status.className = "contact-status is-success";
      status.textContent = labels.success;
    } catch (_) {
      status.className = "contact-status is-error";
      status.textContent = labels.failure;
    } finally {
      submitButton.disabled = false;
    }
  });
})();

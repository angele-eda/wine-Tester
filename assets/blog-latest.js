(() => {
  const endpoint = "https://public-api.wordpress.com/wp/v2/sites/convertfiles24.wordpress.com/posts?per_page=3&_embed=1";
  const copy = {
    en:{eyebrow:"ConvertFiles24 Blog",title:"Latest guides",desc:"Practical tips for images, PDFs, video and audio.",all:"View all posts",loading:"Loading latest posts…",empty:"No posts are available yet.",error:"Latest posts could not be loaded.",read:"Read article",image:"Blog image"},
    ko:{eyebrow:"ConvertFiles24 블로그",title:"최신 활용 가이드",desc:"이미지·PDF·비디오·오디오를 더 쉽게 다루는 실용적인 팁.",all:"블로그 전체 보기",loading:"최신 글을 불러오는 중…",empty:"아직 표시할 글이 없습니다.",error:"최신 글을 불러오지 못했습니다.",read:"글 읽기",image:"블로그 이미지"},
    ja:{eyebrow:"ConvertFiles24 ブログ",title:"最新ガイド",desc:"画像・PDF・動画・音声を扱うための実用的なヒント。",all:"ブログを見る",loading:"最新記事を読み込み中…",empty:"表示できる記事はまだありません。",error:"最新記事を読み込めませんでした。",read:"記事を読む",image:"ブログ画像"},
    es:{eyebrow:"Blog de ConvertFiles24",title:"Guías recientes",desc:"Consejos prácticos para imágenes, PDF, vídeo y audio.",all:"Ver todos los artículos",loading:"Cargando artículos…",empty:"Todavía no hay artículos disponibles.",error:"No se pudieron cargar los artículos.",read:"Leer artículo",image:"Imagen del blog"}
  };
  const lang = () => {
    const value = document.documentElement.lang || localStorage.getItem("convertfiles24-language") || "en";
    return copy[value] ? value : "en";
  };
  const strip = (html="") => {
    const doc = new DOMParser().parseFromString(html,"text/html");
    return (doc.body.textContent || "").replace(/\s+/g," ").trim();
  };
  const formatDate = (value,l) => {
    try { return new Intl.DateTimeFormat(l === "ko" ? "ko-KR" : l === "ja" ? "ja-JP" : l === "es" ? "es-ES" : "en-US",{year:"numeric",month:"short",day:"numeric"}).format(new Date(value)); }
    catch { return ""; }
  };
  const getImage = post => post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
  function labels(){
    const t=copy[lang()];
    document.querySelectorAll("[data-blog-copy]").forEach(el=>{ const k=el.dataset.blogCopy; if(t[k]) el.textContent=t[k]; });
  }
  async function load(){
    const grid=document.querySelector("#latestBlogGrid");
    if(!grid) return;
    labels();
    const t=copy[lang()];
    grid.innerHTML=`<div class="latest-blog-status">${t.loading}</div>`;
    try{
      const response=await fetch(endpoint,{headers:{Accept:"application/json"}});
      if(!response.ok) throw new Error("HTTP "+response.status);
      const posts=await response.json();
      if(!Array.isArray(posts)||!posts.length){grid.innerHTML=`<div class="latest-blog-status">${t.empty}</div>`;return;}
      grid.innerHTML="";
      posts.slice(0,3).forEach(post=>{
        const a=document.createElement("a");
        a.className="latest-blog-card";
        a.href=post.link;
        a.target="_blank";
        a.rel="noopener noreferrer";
        const image=getImage(post);
        const title=strip(post.title?.rendered||"");
        const excerpt=strip(post.excerpt?.rendered||"");
        a.innerHTML=`
          <div class="latest-blog-image${image?"":" is-placeholder"}">${image?`<img src="${image}" alt="" loading="lazy" decoding="async">`:`<span>${t.image}</span>`}</div>
          <div class="latest-blog-body">
            <span class="latest-blog-date">${formatDate(post.date,lang())}</span>
            <h3 class="latest-blog-title"></h3>
            <p class="latest-blog-excerpt"></p>
            <span class="latest-blog-read">${t.read} →</span>
          </div>`;
        a.querySelector(".latest-blog-title").textContent=title;
        a.querySelector(".latest-blog-excerpt").textContent=excerpt;
        grid.append(a);
      });
    }catch(error){
      console.error("Latest blog posts failed to load",error);
      grid.innerHTML=`<div class="latest-blog-status">${t.error}</div>`;
    }
  }
  document.addEventListener("change",e=>{if(e.target.matches("#languageSelect,#mobileLanguageSelect")) setTimeout(()=>{labels();load();},0);});
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",load); else load();
})();

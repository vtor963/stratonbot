// ProfitsBet Scraper - v2 funciona com Next.js hidratado
console.log('[profits-scraper v2] injetado em', location.href);

async function waitForApp() {
  // Next.js hidrata depois, espera conteúdo real aparecer
  for(let i=0;i<20;i++){
    if(document.querySelector('main, [class*="grid"], form') && document.body.innerText.trim().length>200) break;
    await new Promise(r=>setTimeout(r,500));
  }
}

function scrapePage() {
  const data = {
    url: location.href,
    title: document.title,
    html: document.documentElement.outerHTML.slice(0, 200000), // limita 200k
    sections: [],
    colors: [],
    fonts: [],
    images: [...document.images].map(i=>({src:i.src, alt:i.alt, w:i.width, h:i.height})),
    links: [...document.links].map(a=>({href:a.href, text:a.textContent.trim().slice(0,80)})),
    forms: [...document.forms].map(f=>({action:f.action, fields:[...f.elements].map(e=>({tag:e.tagName, type:e.type, name:e.name||e.id, placeholder:e.placeholder||''}))})),
    styles: [...document.styleSheets].slice(0,5).map(s=>{try{return [...s.cssRules].slice(0,20).map(r=>r.cssText).join('\n').slice(0,5000)}catch(e){return 'cors-blocked '+s.href}}),
    viewport: {w:innerWidth, h:innerHeight},
    timestamp: new Date().toISOString()
  };
  // seções por landmarks e divs grandes
  document.querySelectorAll('header,main,section,form,nav,footer,[class*="grid"],[class*="flex"]').forEach((el,i)=>{
    if(i>30) return;
    const rect = el.getBoundingClientRect();
    if(rect.height<40 || rect.width<100) return;
    data.sections.push({
      tag: el.tagName,
      cls: el.className?.toString().slice(0,200),
      text: el.innerText?.slice(0,300).replace(/\n+/g,' | '),
      rect: {x:Math.round(rect.x), y:Math.round(rect.y), w:Math.round(rect.width), h:Math.round(rect.height)}
    });
  });
  // cores computadas
  const colorSet = new Set();
  document.querySelectorAll('*').forEach(el=>{
    const cs = getComputedStyle(el);
    if(cs.color) colorSet.add(cs.color);
    if(cs.backgroundColor && cs.backgroundColor!=='rgba(0, 0, 0, 0)') colorSet.add(cs.backgroundColor);
    if(colorSet.size>40) return;
  });
  data.colors = [...colorSet].slice(0,40);
  data.fonts = [...new Set([...document.querySelectorAll('*')].map(el=>getComputedStyle(el).fontFamily))].slice(0,10);
  return data;
}

async function getFullSourceWithInlineStyles(){
  // tenta inline <link rel=stylesheet> para o HTML ficar 100% offline
  const clone = document.documentElement.cloneNode(true);
  const links = [...clone.querySelectorAll('link[rel="stylesheet"]')];
  for(const link of links){
    const href = link.getAttribute('href');
    if(!href || href.startsWith('chrome-')) continue;
    try{
      const abs = new URL(href, location.href).href;
      const css = await fetch(abs).then(r=>r.text()).then(t=>t.slice(0,200000)).catch(()=>null);
      if(css){
        const style = document.createElement('style');
        style.textContent = '/* inlined from '+href+' */\n' + css;
        link.replaceWith(style);
      }
    }catch(e){}
    // limita para não travar
    if(clone.outerHTML.length>800000) break;
  }
  // injeta base href para imagens relativas funcionarem
  let html = '<!DOCTYPE html>\n' + clone.outerHTML;
  if(!html.includes('<base')) {
    html = html.replace('<head>', '<head><base href="'+location.origin+'/">');
  }
  return html.slice(0, 900000);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=>{
  if(msg.type==='SCRAPE'){
    (async()=>{
      await waitForApp();
      const d = scrapePage();
      chrome.storage.local.get(['profits_scrapes'], res=>{
        const arr = res.profits_scrapes||[];
        arr.push(d);
        chrome.storage.local.set({profits_scrapes: arr, last_scrape: d});
      });
      sendResponse(d);
    })();
    return true;
  }
  if(msg.type==='DOWNLOAD_SOURCE'){
    (async()=>{
      await waitForApp();
      const html = await getFullSourceWithInlineStyles();
      // salva também
      chrome.storage.local.get(['profits_scrapes'], res=>{
        const arr = res.profits_scrapes||[];
        arr.push({url: location.href, title: document.title, html: html.slice(0,500000), timestamp: new Date().toISOString(), type:'source'});
        chrome.storage.local.set({profits_scrapes: arr});
      });
      sendResponse({html, url: location.href, title: document.title});
    })();
    return true;
  }
  if(msg.type==='GET_LAST'){
    chrome.storage.local.get(['last_scrape'], r=> sendResponse(r.last_scrape));
    return true;
  }
});

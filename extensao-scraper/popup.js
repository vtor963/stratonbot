const logEl = document.getElementById('log');
function log(m){ logEl.style.display='block'; logEl.textContent += m+'\n'; logEl.scrollTop=logEl.scrollHeight; console.log(m); }

document.getElementById('scan').addEventListener('click', async ()=>{
  logEl.textContent=''; log('⏳ Lendo '+ (await chrome.tabs.query({active:true,currentWindow:true}))[0].url +' ... (aguarda hidratação Next.js 2s)');
  const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  // reinjeta content se necessário (pra páginas já abertas antes de instalar)
  try{ await chrome.scripting.executeScript({target:{tabId:tab.id}, files:['content.js']}); }catch(e){}
  try{
    const res = await chrome.tabs.sendMessage(tab.id, {type:'SCRAPE'});
    if(!res || !res.html){ throw new Error('resposta vazia - recarregue a página (F5) e tente de novo'); }
    log('✅ Seções: '+res.sections.length);
    log('🖼️ Imagens: '+res.images.length);
    log('🔗 Links: '+res.links.length);
    log('🎨 Cores: '+res.colors.slice(0,5).join(', '));
    log('📄 HTML: '+res.html.length+' chars');
    log('--- Salvo em storage.local.profits_scrapes ('+res.url+')');
    if(res.html.length<5000) log('⚠️ HTML muito pequeno - provavelmente página ainda carregando, espere 3s e clique de novo');
  }catch(e){ log('❌ Erro: '+e.message+'\nDica: 1) Recarregue a página com F5 2) Clique em Atualizar na chrome://extensions 3) Clique de novo em Ler'); }
});

document.getElementById('downloadSource').addEventListener('click', async ()=>{
  logEl.textContent=''; log('⬇️ Baixando código-fonte...');
  const [tab]=await chrome.tabs.query({active:true, currentWindow:true});
  try{ await chrome.scripting.executeScript({target:{tabId:tab.id}, files:['content.js']}); }catch(e){}
  try{
    const res = await chrome.tabs.sendMessage(tab.id, {type:'DOWNLOAD_SOURCE'});
    if(!res || !res.html) throw new Error('Não retornou HTML');
    // tenta inline CSS antes de baixar
    let html = res.html;
    // baixa via data URL
    const blob = new Blob([html], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = new URL(tab.url).pathname.replace(/[^a-z0-9]/gi,'_').replace(/^_+/,'') || 'index';
    a.href = url; a.download = `profits_${slug}_${Date.now()}.html`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 2000);
    // também salva no storage para exportar depois
    const {profits_sources=[]} = await chrome.storage.local.get(['profits_sources']);
    profits_sources.push({url: tab.url, html: html.slice(0,500000), timestamp: new Date().toISOString()});
    await chrome.storage.local.set({profits_sources});
    log('✅ Código-fonte baixado! ('+ (html.length/1000).toFixed(1) +' KB)');
    log('   Salvo em storage.profits_sources ('+profits_sources.length+' páginas)');
    log('   Abra o arquivo HTML baixado para testar offline.');
  }catch(e){ log('❌ Erro: '+e.message); }
});

document.getElementById('capture').addEventListener('click', async ()=>{
  logEl.textContent=''; log('📸 Capturando...');
  const [tab]=await chrome.tabs.query({active:true, currentWindow:true});
  chrome.tabs.captureVisibleTab(null,{format:'png', quality:100}, dataUrl=>{
    const a=document.createElement('a'); a.href=dataUrl; a.download=`profits-${Date.now()}.png`; a.click();
    log('✅ Print baixado!');
  });
});

document.getElementById('export').addEventListener('click', async ()=>{
  const {profits_scrapes=[], last_scrape} = await chrome.storage.local.get(['profits_scrapes','last_scrape']);
  const blob=new Blob([JSON.stringify({profits_scrapes, last_scrape},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`profits-scrape-${Date.now()}.json`; a.click();
  log('💾 Exportado '+profits_scrapes.length+' páginas');
});

document.getElementById('routes').addEventListener('click', async ()=>{
  logEl.textContent=''; const routes=['/','/sign-in','/sign-up','/forgot-password','/dashboard','/wallet','/games','/affiliates'];
  for(const r of routes){
    log('🔍 Testando https://app.profitsbet.co'+r);
    try{ const res=await fetch('https://app.profitsbet.co'+r,{method:'HEAD'}); log(' -> '+res.status+' '+res.ok); }catch(e){ log(' -> erro '+e.message); }
  }
  log('Dica: navegue manualmente pra cada rota e clique em "Ler site inteiro"');
});

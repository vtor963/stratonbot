var S=Object.defineProperty;var w=(a,e,t)=>e in a?S(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var p=(a,e,t)=>w(a,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();function E(a){const e=document.documentElement;e.style.setProperty("--bg-main",a.backgroundMain),e.style.setProperty("--bg-grid",a.backgroundGrid),e.style.setProperty("--primary-neon",a.primaryNeon),e.style.setProperty("--win-color",a.winHighlight);const t=f(a.primaryNeon),i=f(a.winHighlight);t&&e.style.setProperty("--primary-neon-rgb",`${t.r}, ${t.g}, ${t.b}`),i&&e.style.setProperty("--win-color-rgb",`${i.r}, ${i.g}, ${i.b}`)}function f(a){const e=a.replace("#",""),t=parseInt(e,16);return isNaN(t)?null:{r:t>>16&255,g:t>>8&255,b:t&255}}function b(a,e,t){const i=a.find(s=>s.id===e);return(i==null?void 0:i.assets[t])||(i==null?void 0:i.assets.idle)||""}class x{constructor(e){p(this,"container");p(this,"config");p(this,"reels",[]);p(this,"reelStrips",[]);p(this,"isSpinning",!1);p(this,"onSpinComplete");p(this,"onWinAnimationComplete");p(this,"symbolSize",120);p(this,"visibleRows",3);p(this,"bufferRows",3);p(this,"spinDuration",1200);p(this,"stopStagger",150);p(this,"easing","cubic-bezier(0.23, 1, 0.32, 1)");this.container=e.container,this.config=e.config,this.onSpinComplete=e.onSpinComplete,this.onWinAnimationComplete=e.onWinAnimationComplete,this.injectTheme(),this.buildUI()}injectTheme(){E(this.config.theme.colors);const e=document.documentElement;e.style.setProperty("--symbol-size",`${this.symbolSize}px`),e.style.setProperty("--visible-rows",`${this.visibleRows}`),e.style.setProperty("--buffer-rows",`${this.bufferRows}`),e.style.setProperty("--spin-duration",`${this.spinDuration}ms`),e.style.setProperty("--stop-stagger",`${this.stopStagger}ms`),e.style.setProperty("--easing",this.easing)}buildUI(){this.container.innerHTML="",this.container.className="slot-engine-container";const{columns:e,rows:t}=this.config.gameMetadata.grid;this.visibleRows=t;const i=document.createElement("div");i.className="slot-grid",i.style.cssText=`
      display: grid;
      grid-template-columns: repeat(${e}, var(--symbol-size));
      gap: 4px;
      background: var(--bg-grid);
      padding: 8px;
      border-radius: 12px;
      border: 2px solid var(--primary-neon);
      box-shadow: 
        0 0 20px rgba(var(--primary-neon-rgb), 0.3),
        inset 0 0 40px rgba(0, 0, 0, 0.5);
    `;for(let s=0;s<e;s++){const n=document.createElement("div");n.className="slot-reel",n.style.cssText=`
        position: relative;
        width: var(--symbol-size);
        height: calc(var(--symbol-size) * var(--visible-rows));
        overflow: hidden;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.3);
      `;const o=document.createElement("div");o.className="reel-strip",o.style.cssText=`
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        will-change: transform;
        transition: transform var(--spin-duration) var(--easing);
      `,n.appendChild(o),i.appendChild(n),this.reels.push(n)}this.container.appendChild(i),this.initializeReelStrips()}initializeReelStrips(){const{columns:e,rows:t}=this.config.gameMetadata.grid,i=this.config.symbols.map(s=>s.id);this.reelStrips=[];for(let s=0;s<e;s++){const n=[],o=t+this.bufferRows*2;for(let r=0;r<o;r++){const l=i[Math.floor(Math.random()*i.length)];n.push({symbolId:l,state:"idle"})}this.reelStrips.push(n)}this.renderReelStrips()}renderReelStrips(){this.reels.forEach((e,t)=>{const i=e.querySelector(".reel-strip");i&&(i.innerHTML="",this.reelStrips[t].forEach(s=>{const n=document.createElement("div");n.className="reel-symbol",n.style.cssText=`
          width: var(--symbol-size);
          height: var(--symbol-size);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        `;const o=document.createElement("img");o.src=b(this.config.symbols,s.symbolId,s.state),o.alt=s.symbolId,o.style.cssText=`
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
          transition: filter 0.1s ease;
        `,s.state==="spin"&&(o.style.filter="blur(4px)"),n.appendChild(o),i.appendChild(n)}))})}updateConfig(e){this.config=e,this.injectTheme(),this.initializeReelStrips()}async spinToResult(e){var t;this.isSpinning||(this.isSpinning=!0,this.prepareReelStripsForResult(e),this.setAllReelsState("spin"),this.renderReelStrips(),await this.animateSpin(e),this.isSpinning=!1,(t=this.onSpinComplete)==null||t.call(this,e))}prepareReelStripsForResult(e){const{columns:t,rows:i}=this.config.gameMetadata.grid,s=this.config.symbols.map(n=>n.id);for(let n=0;n<t;n++){const o=[];for(let r=0;r<this.bufferRows;r++){const l=s[Math.floor(Math.random()*s.length)];o.push({symbolId:l,state:"idle"})}for(let r=i-1;r>=0;r--)o.push({symbolId:e[n][r],state:"spin"});for(let r=0;r<this.bufferRows;r++){const l=s[Math.floor(Math.random()*s.length)];o.push({symbolId:l,state:"idle"})}this.reelStrips[n]=o}}setAllReelsState(e){this.reelStrips.forEach(t=>{t.forEach(i=>{i.state=e})})}async animateSpin(e){const t=this.symbolSize,s=-(this.bufferRows*t),n=this.reels.map((o,r)=>new Promise(l=>{const c=o.querySelector(".reel-strip");if(!c){l();return}const h=r*this.stopStagger;setTimeout(()=>{c.style.transition=`transform ${this.spinDuration}ms ${this.easing}`,c.style.transform=`translateY(${s}px)`;const d=()=>{c.removeEventListener("transitionend",d),this.snapReelToFinal(r),l()};c.addEventListener("transitionend",d)},h)}));await Promise.all(n),this.setAllReelsState("idle"),this.renderReelStrips(),this.triggerWinAnimations(e)}snapReelToFinal(e){const i=this.reels[e].querySelector(".reel-strip");i&&(i.style.transition="none",i.style.transform=`translateY(${-this.bufferRows*this.symbolSize}px)`)}triggerWinAnimations(e){const{columns:t,rows:i}=this.config.gameMetadata.grid,s=new Map;for(let o=0;o<t;o++)for(let r=0;r<i;r++){const l=e[o][r];s.set(l,(s.get(l)||0)+1)}let n=!1;for(let o=0;o<t;o++)for(let r=0;r<i;r++){const l=e[o][r];s.get(l)&&s.get(l)>=3&&(this.animateSymbolWin(o,r),n=!0)}n&&this.onWinAnimationComplete&&setTimeout(()=>this.onWinAnimationComplete,1500)}animateSymbolWin(e,t){const s=this.reels[e].querySelector(".reel-strip");if(!s)return;const n=this.bufferRows+(this.visibleRows-1-t),o=s.children[n];if(!o)return;const r=o.querySelector("img");if(!r)return;const l=this.reelStrips[e][n].symbolId;r.src=b(this.config.symbols,l,"win"),r.style.filter="none",o.style.animation="win-pulse 1s ease-in-out 3",o.style.zIndex="10",o.style.transform="scale(1.1)",o.style.filter="drop-shadow(0 0 10px var(--win-color)) drop-shadow(0 0 20px var(--win-color))"}destroy(){this.container.innerHTML="",this.reels=[],this.reelStrips=[]}}function C(a){return new x(a)}const g={gameMetadata:{gameId:"slot_base_01",grid:{columns:3,rows:3}},theme:{colors:{backgroundMain:"#0B0C10",backgroundGrid:"#1F2833",primaryNeon:"#00FFCC",winHighlight:"#FF007F"}},symbols:[{id:"SYM_WILD",name:"Wild (Dragão Dourado)",assets:{idle:"https://via.placeholder.com/120x120/FFD700/000000?text=DRAGÃO",spin:"https://via.placeholder.com/120x120/FFD700/000000?text=DRAGÃO_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=DRAGÃO_WIN"}},{id:"SYM_HIGH_1",name:"Alto 1 (Olho do Dragão)",assets:{idle:"https://via.placeholder.com/120x120/FF4444/FFFFFF?text=OLHO",spin:"https://via.placeholder.com/120x120/FF4444/FFFFFF?text=OLHO_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=OLHO_WIN"}},{id:"SYM_HIGH_2",name:"Alto 2 (Escama)",assets:{idle:"https://via.placeholder.com/120x120/00CC88/FFFFFF?text=ESCAMA",spin:"https://via.placeholder.com/120x120/00CC88/FFFFFF?text=ESCAMA_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=ESCAMA_WIN"}},{id:"SYM_LOW_1",name:"Baixo 1 (Moeda)",assets:{idle:"https://via.placeholder.com/120x120/FFD700/000000?text=MOEDA",spin:"https://via.placeholder.com/120x120/FFD700/000000?text=MOEDA_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=MOEDA_WIN"}},{id:"SYM_LOW_2",name:"Baixo 2 (Gema)",assets:{idle:"https://via.placeholder.com/120x120/8844FF/FFFFFF?text=GEMA",spin:"https://via.placeholder.com/120x120/8844FF/FFFFFF?text=GEMA_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=GEMA_WIN"}},{id:"SYM_LOW_3",name:"Baixo 3 (Runas)",assets:{idle:"https://via.placeholder.com/120x120/FF8800/FFFFFF?text=RUNA",spin:"https://via.placeholder.com/120x120/FF8800/FFFFFF?text=RUNA_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=RUNA_WIN"}}]};function L(a,e){return{id:a,name:e,assets:{idle:"",spin:"",win:""}}}function y(a){var t,i,s,n,o,r,l;const e=[];return(t=a.gameMetadata)!=null&&t.gameId||e.push("gameId é obrigatório"),(!((s=(i=a.gameMetadata)==null?void 0:i.grid)!=null&&s.columns)||!((o=(n=a.gameMetadata)==null?void 0:n.grid)!=null&&o.rows))&&e.push("Grid inválido"),(r=a.theme)!=null&&r.colors||e.push("Tema de cores obrigatório"),(!a.symbols||a.symbols.length===0)&&e.push("Pelo menos 1 símbolo necessário"),(l=a.symbols)==null||l.forEach((c,h)=>{var d,m,u;c.id||e.push(`Símbolo ${h}: id obrigatório`),(d=c.assets)!=null&&d.idle||e.push(`${c.id}: asset idle obrigatório`),(m=c.assets)!=null&&m.spin||e.push(`${c.id}: asset spin obrigatório`),(u=c.assets)!=null&&u.win||e.push(`${c.id}: asset win obrigatório`)}),{valid:e.length===0,errors:e}}function $(a){try{return JSON.parse(a)}catch{return null}}function v(){return`slot_${Date.now().toString(36)}_${Math.random().toString(36).substr(2,5)}`}const I="modulepreload",R=function(a){return"/"+a},F={},A=function(e,t,i){let s=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),r=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));s=Promise.allSettled(t.map(l=>{if(l=R(l),l in F)return;F[l]=!0;const c=l.endsWith(".css"),h=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${h}`))return;const d=document.createElement("link");if(d.rel=c?"stylesheet":I,c||(d.as="script"),d.crossOrigin="",d.href=l,r&&d.setAttribute("nonce",r),document.head.appendChild(d),c)return new Promise((m,u)=>{d.addEventListener("load",m),d.addEventListener("error",()=>u(new Error(`Unable to preload CSS for ${l}`)))})}))}function n(o){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=o,window.dispatchEvent(r),!r.defaultPrevented)throw o}return s.then(o=>{for(const r of o||[])r.status==="rejected"&&n(r.reason);return e().catch(n)})};function M(a="image/*"){const e=document.createElement("input");return e.type="file",e.accept=a,e.style.display="none",e}function B(a,e){const t=new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),i=URL.createObjectURL(t),s=document.createElement("a");s.href=i,s.download=e,s.click(),URL.revokeObjectURL(i)}async function P(a){const e=await _(a),t=URL.createObjectURL(e),i=document.createElement("a");i.href=t,i.download=`${a.gameMetadata.gameId}_theme.zip`,i.click(),URL.revokeObjectURL(t)}async function _(a){const e=(await A(async()=>{const{default:s}=await import("./jszip.min-BQ7-ZQoZ.js").then(n=>n.j);return{default:s}},[])).default,t=new e;t.file("config.json",JSON.stringify(a,null,2));const i=t.folder("assets");if(!i)throw new Error("Erro ao criar pasta assets");for(const s of a.symbols){const n=i.folder(s.id);if(n){for(const[o,r]of Object.entries(s.assets))if(r&&typeof r=="string"&&r.startsWith("data:")){const l=r.split(",")[1];n.file(`${o}.png`,l,{base64:!0})}}}return t.generateAsync({type:"blob"})}class N{constructor(){p(this,"config",{...g});p(this,"engine",null);p(this,"assetInputs",new Map);p(this,"logEl",null);p(this,"spinBtn",null);p(this,"exportJsonBtn",null);p(this,"exportZipBtn",null)}async init(){this.render(),this.bindEvents(),await this.initEngine(),this.log("info","Theme Builder carregado. Arraste imagens ou clique para upload.")}render(){const e=document.getElementById("app");e&&(e.innerHTML=`
      <header class="builder-header">
        <h1 class="builder-title">🎰 Slot Theme Builder</h1>
        <div class="builder-actions">
          <button id="btn-load-config" class="btn btn-secondary">📂 Carregar JSON</button>
          <button id="btn-save-config" class="btn btn-secondary">💾 Salvar JSON</button>
          <button id="btn-new-theme" class="btn btn-secondary">🆕 Novo Tema</button>
        </div>
      </header>

      <div class="main-content">
        <aside class="panel" style="width: 420px;">
          <div class="panel-title">🎨 Cores do Tema</div>
          <div class="color-group" id="colors-panel"></div>

          <div class="panel-title" style="margin-top: 24px;">🐉 Símbolos</div>
          <div class="symbols-list" id="symbols-list"></div>
          <button id="btn-add-symbol" class="add-symbol-btn">+ Adicionar Símbolo</button>

          <div class="export-panel">
            <div class="panel-title">📦 Exportar</div>
            <div class="export-buttons">
              <button id="btn-export-json" class="export-btn export-btn-json" disabled>
                📄 Exportar config.json
              </button>
              <button id="btn-export-zip" class="export-btn export-btn-zip" disabled>
                📦 Exportar Pacote Completo (.zip)
              </button>
            </div>
          </div>

          <div class="log-panel" id="log-panel"></div>
        </aside>

        <main class="panel preview-panel" style="flex: 1; min-width: 0;">
          <div class="preview-header">
            <span class="preview-title">🔴 Preview Ao Vivo</span>
            <button id="btn-spin" class="spin-btn" disabled>GIRAR</button>
          </div>
          <div id="slot-container" style="width: 100%; max-width: 500px; margin: 0 auto;"></div>
          <p style="text-align: center; color: #666; font-size: 12px; margin-top: 12px;">
            O motor usa apenas CSS transform + cubic-bezier. Zero canvas, 60fps garantido.
          </p>
        </main>
      </div>

      <input type="file" id="file-config-loader" accept=".json" style="display: none;">
    `,this.logEl=document.getElementById("log-panel"),this.spinBtn=document.getElementById("btn-spin"),this.exportJsonBtn=document.getElementById("btn-export-json"),this.exportZipBtn=document.getElementById("btn-export-zip"),this.renderColorsPanel(),this.renderSymbolsList())}renderColorsPanel(){const e=document.getElementById("colors-panel");if(!e)return;const{colors:t}=this.config.theme;e.innerHTML=`
      <div class="color-row">
        <span class="color-label">Background Principal</span>
        <input type="color" class="color-input" data-color="backgroundMain" value="${t.backgroundMain}">
        <span class="color-hex" data-hex="backgroundMain">${t.backgroundMain}</span>
      </div>
      <div class="color-row">
        <span class="color-label">Background Grid</span>
        <input type="color" class="color-input" data-color="backgroundGrid" value="${t.backgroundGrid}">
        <span class="color-hex" data-hex="backgroundGrid">${t.backgroundGrid}</span>
      </div>
      <div class="color-row">
        <span class="color-label">Neon Primário</span>
        <input type="color" class="color-input" data-color="primaryNeon" value="${t.primaryNeon}">
        <span class="color-hex" data-hex="primaryNeon">${t.primaryNeon}</span>
      </div>
      <div class="color-row">
        <span class="color-label">Destaque Vitória</span>
        <input type="color" class="color-input" data-color="winHighlight" value="${t.winHighlight}">
        <span class="color-hex" data-hex="winHighlight">${t.winHighlight}</span>
      </div>
    `,e.querySelectorAll(".color-input").forEach(i=>{i.addEventListener("input",s=>this.handleColorChange(s.target))})}renderSymbolsList(){const e=document.getElementById("symbols-list");e&&(this.assetInputs.clear(),e.innerHTML="",this.config.symbols.forEach((t,i)=>{const s=this.createSymbolCard(t,i);e.appendChild(s)}))}createSymbolCard(e,t){const i=document.createElement("div");i.className="symbol-card",i.dataset.symbolId=e.id;const s=[{key:"idle",label:"IDLE (Parado)"},{key:"spin",label:"SPIN (Blur)"},{key:"win",label:"WIN (Glow)"}],n=new Map;return s.forEach(({key:o})=>{const r=M("image/*");r.dataset.symbolId=e.id,r.dataset.state=o,n.set(o,r),document.body.appendChild(r)}),this.assetInputs.set(e.id,n),i.innerHTML=`
      <div class="symbol-header">
        <span class="symbol-id">${e.id}</span>
        <input type="text" class="symbol-name-input" value="${e.name}" data-field="name">
        <div class="symbol-actions">
          <button class="btn-icon" data-action="duplicate" title="Duplicar">📋</button>
          <button class="btn-icon" data-action="delete" title="Excluir">🗑️</button>
        </div>
      </div>
      <div class="asset-rows">
        ${s.map(({key:o,label:r})=>`
          <div class="asset-row">
            <span class="asset-label">${r}</span>
            <div class="asset-dropzone" data-symbol-id="${e.id}" data-state="${o}">
              ${e.assets[o]?`
                <img class="asset-preview" src="${e.assets[o]}" alt="${o}">
              `:`
                <span class="asset-dropzone-text">Arraste ou clique para ${o==="idle"?"carregar":"opcional"}</span>
              `}
            </div>
          </div>
        `).join("")}
        <div class="asset-actions">
          <button class="btn-small btn-danger" data-action="clear-all" data-symbol-id="${e.id}">Limpar Tudo</button>
        </div>
      </div>
    `,this.bindSymbolCardEvents(i,e),i}bindSymbolCardEvents(e,t){var i;(i=e.querySelector(".symbol-name-input"))==null||i.addEventListener("change",s=>{t.name=s.target.value}),e.querySelectorAll('[data-action="duplicate"]').forEach(s=>{s.addEventListener("click",()=>this.duplicateSymbol(t.id))}),e.querySelectorAll('[data-action="delete"]').forEach(s=>{s.addEventListener("click",()=>this.deleteSymbol(t.id))}),e.querySelectorAll('[data-action="clear-all"]').forEach(s=>{s.addEventListener("click",()=>this.clearSymbolAssets(t.id))}),e.querySelectorAll(".asset-dropzone").forEach(s=>{var c;const n=s,o=n.dataset.symbolId,r=n.dataset.state,l=(c=this.assetInputs.get(o))==null?void 0:c.get(r);n.addEventListener("click",()=>l.click()),n.addEventListener("dragover",h=>{h.preventDefault(),n.classList.add("drag-over")}),n.addEventListener("dragleave",()=>n.classList.remove("drag-over")),n.addEventListener("drop",h=>{var u;const d=h;h.preventDefault(),n.classList.remove("drag-over");const m=(u=d.dataTransfer)==null?void 0:u.files[0];m&&this.handleAssetFile(o,r,m,n)}),l.addEventListener("change",()=>{var d;const h=(d=l.files)==null?void 0:d[0];h&&this.handleAssetFile(o,r,h,n)})})}async handleAssetFile(e,t,i,s){if(!i.type.startsWith("image/")){this.log("error","Apenas imagens permitidas");return}if(i.size>5*1024*1024){this.log("error","Arquivo > 5MB");return}const n=await O(i),o=this.config.symbols.find(r=>r.id===e);o&&(o.assets[t]=n,this.updateDropzonePreview(s,n),this.log("success",`${e}.${t} atualizado`),this.updateEngineConfig())}updateDropzonePreview(e,t){e.classList.add("has-image"),e.innerHTML=`<img class="asset-preview" src="${t}" alt="">`}handleColorChange(e){const t=e.dataset.color,i=document.querySelector(`[data-hex="${t}"]`);this.config.theme.colors[t]=e.value,i&&(i.textContent=e.value),this.updateEngineConfig()}async initEngine(){const e=document.getElementById("slot-container");e&&(this.engine=C({container:e,config:this.config,onSpinComplete:()=>this.enableSpinButton(),onWinAnimationComplete:()=>this.log("success","Animação de vitória concluída")}),this.spinBtn.disabled=!1,this.exportJsonBtn.disabled=!1,this.exportZipBtn.disabled=!1)}updateEngineConfig(){this.engine&&this.engine.updateConfig(this.config)}bindEvents(){var e,t,i,s,n,o,r,l;(e=document.getElementById("btn-spin"))==null||e.addEventListener("click",()=>this.spin()),(t=document.getElementById("btn-add-symbol"))==null||t.addEventListener("click",()=>this.addSymbol()),(i=document.getElementById("btn-export-json"))==null||i.addEventListener("click",()=>this.exportJSON()),(s=document.getElementById("btn-export-zip"))==null||s.addEventListener("click",()=>this.exportZIP()),(n=document.getElementById("btn-save-config"))==null||n.addEventListener("click",()=>this.exportJSON()),(o=document.getElementById("btn-load-config"))==null||o.addEventListener("click",()=>this.loadConfig()),(r=document.getElementById("btn-new-theme"))==null||r.addEventListener("click",()=>this.newTheme()),(l=document.getElementById("file-config-loader"))==null||l.addEventListener("change",c=>{var d;const h=(d=c.target.files)==null?void 0:d[0];h&&this.loadConfigFile(h)})}spin(){if(!this.engine||this.spinBtn.disabled)return;this.spinBtn.disabled=!0,this.log("info","Girando...");const{columns:e,rows:t}=this.config.gameMetadata.grid,i=this.config.symbols.map(n=>n.id),s=[];for(let n=0;n<e;n++){s[n]=[];for(let o=0;o<t;o++){const r=i[Math.floor(Math.random()*i.length)];s[n][o]=r}}this.engine.spinToResult(s)}enableSpinButton(){this.spinBtn.disabled=!1}addSymbol(){const e=`SYM_CUSTOM_${Date.now().toString(36).toUpperCase()}`,t=L(e,`Novo Símbolo ${this.config.symbols.length+1}`);this.config.symbols.push(t),this.renderSymbolsList(),this.updateEngineConfig(),this.log("success",`Símbolo ${e} adicionado`)}duplicateSymbol(e){const t=this.config.symbols.find(n=>n.id===e);if(!t)return;const i=`${e}_COPY_${Date.now().toString(36)}`,s={id:i,name:`${t.name} (Cópia)`,assets:{...t.assets}};this.config.symbols.push(s),this.renderSymbolsList(),this.updateEngineConfig(),this.log("success",`Símbolo duplicado: ${i}`)}deleteSymbol(e){if(this.config.symbols.length<=1){this.log("error","Mínimo 1 símbolo necessário");return}this.config.symbols=this.config.symbols.filter(t=>t.id!==e),this.renderSymbolsList(),this.updateEngineConfig(),this.log("warn",`Símbolo ${e} removido`)}clearSymbolAssets(e){const t=this.config.symbols.find(i=>i.id===e);t&&(t.assets={idle:"",spin:"",win:""},this.renderSymbolsList(),this.updateEngineConfig(),this.log("warn",`Assets de ${e} limpos`))}exportJSON(){const e=y(this.config);if(!e.valid){this.log("error",`Config inválida: ${e.errors.join(", ")}`);return}B(this.config,`${this.config.gameMetadata.gameId}_config.json`),this.log("success","config.json baixado")}async exportZIP(){const e=y(this.config);if(!e.valid){this.log("error",`Config inválida: ${e.errors.join(", ")}`);return}try{this.log("info","Gerando pacote .zip..."),await P(this.config),this.log("success","Pacote .zip baixado com config.json + assets/")}catch(t){this.log("error",`Erro ao gerar ZIP: ${t}`)}}loadConfig(){document.getElementById("file-config-loader").click()}loadConfigFile(e){const t=new FileReader;t.onload=i=>{var s;try{const n=(s=i.target)==null?void 0:s.result,o=$(n);o?(this.config=o,this.config.gameMetadata.gameId=v(),this.renderColorsPanel(),this.renderSymbolsList(),this.updateEngineConfig(),this.log("success","Configuração carregada do arquivo")):this.log("error","JSON inválido")}catch{this.log("error","Erro ao ler arquivo")}},t.readAsText(e)}newTheme(){this.config={...g,gameMetadata:{...g.gameMetadata,gameId:v()}},this.renderColorsPanel(),this.renderSymbolsList(),this.updateEngineConfig(),this.log("info","Novo tema criado")}log(e,t){if(!this.logEl)return;const i=new Date().toLocaleTimeString(),s=document.createElement("div");for(s.className=`log-entry ${e}`,s.textContent=`[${i}] ${t}`,this.logEl.insertBefore(s,this.logEl.firstChild);this.logEl.children.length>50;)this.logEl.removeChild(this.logEl.lastChild)}}function O(a){return new Promise((e,t)=>{const i=new FileReader;i.onload=()=>e(i.result),i.onerror=t,i.readAsDataURL(a)})}new N().init();
//# sourceMappingURL=index-BRLUrtVh.js.map

var S=Object.defineProperty;var v=(r,e,o)=>e in r?S(r,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):r[e]=o;var c=(r,e,o)=>v(r,typeof e!="symbol"?e+"":e,o);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&t(n)}).observe(document,{childList:!0,subtree:!0});function o(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(i){if(i.ep)return;i.ep=!0;const s=o(i);fetch(i.href,s)}})();function R(r){const e=document.documentElement;e.style.setProperty("--bg-main",r.backgroundMain),e.style.setProperty("--bg-grid",r.backgroundGrid),e.style.setProperty("--primary-neon",r.primaryNeon),e.style.setProperty("--win-color",r.winHighlight);const o=b(r.primaryNeon),t=b(r.winHighlight);o&&e.style.setProperty("--primary-neon-rgb",`${o.r}, ${o.g}, ${o.b}`),t&&e.style.setProperty("--win-color-rgb",`${t.r}, ${t.g}, ${t.b}`)}function b(r){const e=r.replace("#",""),o=parseInt(e,16);return isNaN(o)?null:{r:o>>16&255,g:o>>8&255,b:o&255}}function w(r,e,o){const t=r.find(i=>i.id===e);return(t==null?void 0:t.assets[o])||(t==null?void 0:t.assets.idle)||""}async function I(r){const e={},o=r.map(async t=>{const[i,s,n]=await Promise.all([f(t.assets.idle),f(t.assets.spin),f(t.assets.win)]);e[t.id]={idle:i,spin:s,win:n}});return await Promise.all(o),e}function f(r){return new Promise((e,o)=>{const t=new Image;t.crossOrigin="anonymous",t.onload=()=>e(t),t.onerror=()=>o(new Error(`Failed to load image: ${r}`)),t.src=r})}class E{constructor(e){c(this,"container");c(this,"config");c(this,"reels",[]);c(this,"reelStrips",[]);c(this,"isSpinning",!1);c(this,"onSpinComplete");c(this,"onWinAnimationComplete");c(this,"symbolSize",120);c(this,"visibleRows",3);c(this,"bufferRows",3);c(this,"spinDuration",1500);c(this,"stopStagger",200);c(this,"easing","cubic-bezier(0.23, 1, 0.32, 1)");this.container=e.container,this.config=e.config,this.onSpinComplete=e.onSpinComplete,this.onWinAnimationComplete=e.onWinAnimationComplete,this.injectTheme(),this.buildUI()}injectTheme(){R(this.config.theme.colors);const e=document.documentElement;e.style.setProperty("--symbol-size",`${this.symbolSize}px`),e.style.setProperty("--visible-rows",`${this.visibleRows}`),e.style.setProperty("--buffer-rows",`${this.bufferRows}`),e.style.setProperty("--spin-duration",`${this.spinDuration}ms`),e.style.setProperty("--stop-stagger",`${this.stopStagger}ms`),e.style.setProperty("--easing",this.easing)}buildUI(){this.container.innerHTML="",this.container.className="slot-engine-container";const{columns:e,rows:o}=this.config.gameMetadata.grid;this.visibleRows=o;const t=document.createElement("div");t.className="slot-grid",t.style.cssText=`
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
    `;for(let i=0;i<e;i++){const s=document.createElement("div");s.className="slot-reel",s.style.cssText=`
        position: relative;
        width: var(--symbol-size);
        height: calc(var(--symbol-size) * var(--visible-rows));
        overflow: hidden;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.3);
      `;const n=document.createElement("div");n.className="reel-strip",n.style.cssText=`
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        will-change: transform;
        transition: transform var(--spin-duration) var(--easing);
      `,s.appendChild(n),t.appendChild(s),this.reels.push(s)}this.container.appendChild(t),this.initializeReelStrips()}initializeReelStrips(){const{columns:e,rows:o}=this.config.gameMetadata.grid,t=this.config.symbols.map(i=>i.id);this.reelStrips=[];for(let i=0;i<e;i++){const s=[],n=o+this.bufferRows*2;for(let l=0;l<n;l++){const a=t[Math.floor(Math.random()*t.length)];s.push({symbolId:a,state:"idle"})}this.reelStrips.push(s)}this.renderReelStrips()}renderReelStrips(){this.reels.forEach((e,o)=>{const t=e.querySelector(".reel-strip");t&&(t.innerHTML="",this.reelStrips[o].forEach(i=>{const s=document.createElement("div");s.className="reel-symbol",s.style.cssText=`
          width: var(--symbol-size);
          height: var(--symbol-size);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        `;const n=document.createElement("img");n.src=w(this.config.symbols,i.symbolId,i.state),n.alt=i.symbolId,n.style.cssText=`
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
          transition: filter 0.1s ease;
        `,i.state==="spin"&&(n.style.filter="blur(4px)"),s.appendChild(n),t.appendChild(s)}))})}async initialize(){await I(this.config.symbols),this.renderReelStrips()}async spinToResult(e){var o;this.isSpinning||(this.isSpinning=!0,this.prepareReelStripsForResult(e),this.setAllReelsState("spin"),this.renderReelStrips(),await this.animateSpin(e),this.isSpinning=!1,(o=this.onSpinComplete)==null||o.call(this,e))}prepareReelStripsForResult(e){const{columns:o,rows:t}=this.config.gameMetadata.grid,i=this.config.symbols.map(s=>s.id);for(let s=0;s<o;s++){const n=[];for(let l=0;l<this.bufferRows;l++){const a=i[Math.floor(Math.random()*i.length)];n.push({symbolId:a,state:"idle"})}for(let l=t-1;l>=0;l--)n.push({symbolId:e[s][l],state:"spin"});for(let l=0;l<this.bufferRows;l++){const a=i[Math.floor(Math.random()*i.length)];n.push({symbolId:a,state:"idle"})}this.reelStrips[s]=n}}setAllReelsState(e){this.reelStrips.forEach(o=>{o.forEach(t=>{t.state=e})})}async animateSpin(e){const o=this.symbolSize,i=-(this.bufferRows*o),s=this.reels.map((n,l)=>new Promise(a=>{const d=n.querySelector(".reel-strip");if(!d){a();return}const x=l*this.stopStagger;setTimeout(()=>{d.style.transition=`transform ${this.spinDuration}ms ${this.easing}`,d.style.transform=`translateY(${i}px)`;const y=()=>{d.removeEventListener("transitionend",y),this.snapReelToFinal(l),a()};d.addEventListener("transitionend",y)},x)}));await Promise.all(s),this.setAllReelsState("idle"),this.renderReelStrips(),this.triggerWinAnimations(e)}snapReelToFinal(e){const t=this.reels[e].querySelector(".reel-strip");t&&(t.style.transition="none",t.style.transform=`translateY(${-this.bufferRows*this.symbolSize}px)`)}triggerWinAnimations(e){const{columns:o,rows:t}=this.config.gameMetadata.grid,i=new Map;for(let n=0;n<o;n++)for(let l=0;l<t;l++){const a=e[n][l];i.set(a,(i.get(a)||0)+1)}let s=!1;for(let n=0;n<o;n++)for(let l=0;l<t;l++){const a=e[n][l];i.get(a)&&i.get(a)>=3&&(this.animateSymbolWin(n,l),s=!0)}s&&this.onWinAnimationComplete&&setTimeout(()=>this.onWinAnimationComplete,1500)}animateSymbolWin(e,o){const i=this.reels[e].querySelector(".reel-strip");if(!i)return;const s=this.bufferRows+(this.visibleRows-1-o),n=i.children[s];if(!n)return;const l=n.querySelector("img");if(!l)return;const a=this.reelStrips[e][s].symbolId;l.src=w(this.config.symbols,a,"win"),l.style.filter="none",n.style.animation="win-pulse 1s ease-in-out 3",n.style.zIndex="10",n.style.transform="scale(1.1)",n.style.filter="drop-shadow(0 0 10px var(--win-color)) drop-shadow(0 0 20px var(--win-color))"}destroy(){this.container.innerHTML="",this.reels=[],this.reelStrips=[]}}function C(r){return new E(r)}const g={gameMetadata:{gameId:"slot_base_01",grid:{columns:3,rows:3}},theme:{colors:{backgroundMain:"#0B0C10",backgroundGrid:"#1F2833",primaryNeon:"#00FFCC",winHighlight:"#FF007F"}},symbols:[{id:"SYM_WILD",assets:{idle:"https://via.placeholder.com/120x120/00FFCC/000000?text=WILD",spin:"https://via.placeholder.com/120x120/00FFCC/000000?text=WILD_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=WILD_WIN"}},{id:"SYM_LOW_1",assets:{idle:"https://via.placeholder.com/120x120/45A29E/FFFFFF?text=CHIP",spin:"https://via.placeholder.com/120x120/45A29E/FFFFFF?text=CHIP_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=CHIP_WIN"}},{id:"SYM_LOW_2",assets:{idle:"https://via.placeholder.com/120x120/8A2BE2/FFFFFF?text=GEM",spin:"https://via.placeholder.com/120x120/8A2BE2/FFFFFF?text=GEM_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=GEM_WIN"}},{id:"SYM_LOW_3",assets:{idle:"https://via.placeholder.com/120x120/FFD700/000000?text=COIN",spin:"https://via.placeholder.com/120x120/FFD700/000000?text=COIN_BLUR",win:"https://via.placeholder.com/120x120/FF007F/FFFFFF?text=COIN_WIN"}}]},F=document.getElementById("app");let h,p=1e4;const m=100;function M(r){const{columns:e,rows:o}=r.gameMetadata.grid,t=r.symbols.map(s=>s.id),i=[];for(let s=0;s<e;s++){i[s]=[];for(let n=0;n<o;n++){const l=t[Math.floor(Math.random()*t.length)];i[s][n]=l}}return i}function L(r){const{columns:e,rows:o}=r.gameMetadata.grid,t=r.symbols.map(n=>n.id),i=t[Math.floor(Math.random()*t.length)],s=[];for(let n=0;n<e;n++){s[n]=[];for(let l=0;l<o;l++)Math.random()<.7?s[n][l]=i:s[n][l]=t[Math.floor(Math.random()*t.length)]}return s}async function P(){h=C({container:F,config:g,onSpinComplete:r=>{console.log("Spin complete:",r),u()},onWinAnimationComplete:()=>{console.log("Win animation complete")}}),await h.initialize(),T(),u()}function T(){const r=document.getElementById("spin-btn"),e=document.getElementById("force-win-btn");r==null||r.addEventListener("click",async()=>{if(p<m){alert("Saldo insuficiente!");return}p-=m,u(),r.disabled=!0,e.disabled=!0;const o=M(g);await h.spinToResult(o),r.disabled=!1,e.disabled=!1}),e==null||e.addEventListener("click",async()=>{if(p<m){alert("Saldo insuficiente!");return}p-=m,u(),r.disabled=!0,e.disabled=!0;const o=L(g);await h.spinToResult(o),r.disabled=!1,e.disabled=!1})}function u(){const r=document.getElementById("balance");r&&(r.textContent=p.toLocaleString())}function A(){F.innerHTML=`
    <div style="text-align: center; width: 100%; max-width: 500px;">
      <h1 style="font-size: 28px; font-weight: 800; background: linear-gradient(90deg, var(--primary-neon), var(--win-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
        Slot Engine 3x3
      </h1>
      <p style="color: var(--primary-neon); font-size: 14px; margin-bottom: 24px;">Camaleão White-Label Renderer</p>
      
      <div id="app" style="margin-bottom: 24px;"></div>
      
      <div class="game-info">
        <div>Saldo: <span id="balance" style="font-weight: 700;">10000</span></div>
        <div>Aposta: <span style="font-weight: 700;">${m}</span></div>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button id="spin-btn" class="spin-button">GIRAR</button>
        <button id="force-win-btn" class="spin-button" style="background: linear-gradient(135deg, var(--win-color), var(--primary-neon));">FORÇAR VITÓRIA</button>
      </div>
    </div>
  `}A();P().catch(console.error);
//# sourceMappingURL=index-P8y9WNqI.js.map

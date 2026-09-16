chrome.runtime.onInstalled.addListener(()=>console.log('profits scraper instalado'));
chrome.action.onClicked.addListener(tab=>{ console.log('clicked',tab.url); });

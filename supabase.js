// StratonPay Bets - Supabase 100% seguro (Auth + RLS por auth.uid())
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
export const supabase = createClient(
  'https://xkmxqjnprqoxbscpfzmg.supabase.co',
  'sb_publishable_IwpOfl9X9q4h22nU6pmVBw_rE-G6ViI'
);

// Normaliza linha do Supabase -> objeto usado no app (vitrine completa)
function mapPlatform(r){
  return {
    id:r.id, nome:r.nome, desc:r.descricao, layout:r.layout, img:r.img,
    badges:r.badges, dominio:r.dominio,
    slug:r.slug||'',
    theme:r.theme||{}, oferta:r.oferta||{}, gateway:r.gateway||{},
    depMin:r.dep_min??20, depMax:r.dep_max??10000,
    saqMin:r.saq_min??20, saqMax:r.saq_max??10000,
    rtp:r.rtp||'medio', suporte:r.suporte||'',
    whatsapp:r.whatsapp||'', telegram:r.telegram||'', instagram:r.instagram||'',
    published:!!r.published
  };
}
function unmapPlatform(p){
  return {
    id:p.id, nome:p.nome, descricao:p.desc||'', layout:p.layout||'',
    img:p.img||'', badges:p.badges||[], dominio:p.dominio||'',
    slug:(p.slug||'').toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,40)||null,
    theme:p.theme||{}, oferta:p.oferta||{}, gateway:{ provider:p.gateway?.provider||'manual', url:p.gateway?.url||'', client_id:p.gateway?.client_id||'' },
    dep_min:p.depMin??20, dep_max:p.depMax??10000,
    saq_min:p.saqMin??20, saq_max:p.saqMax??10000,
    rtp:p.rtp||'medio', suporte:p.suporte||'',
    whatsapp:p.whatsapp||'', telegram:p.telegram||'', instagram:p.instagram||'',
    published:!!p.published
  };
}
export async function getSession(){
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export async function getUser(){
  const { data } = await supabase.auth.getUser();
  return data.user;
}
export function getOwnerEmailSync(){
  try{ const u=JSON.parse(localStorage.getItem('profits_user')||'{}'); return (u.email||'').toLowerCase(); }catch{ return ''; }
}

// Fallback keys (enquanto migra, mantém compatibilidade)
export function getPlataformasKey(){ 
  const e = getOwnerEmailSync();
  return 'platforms_' + (e||'anon');
}
export function getPerfilKey(){ return 'straton_profile_' + (getOwnerEmailSync()||'anon'); }

// Plataformas 100% por conta (RLS: auth.uid() = owner_id)
export async function sbLoadPlatforms(){
  const session = await getSession();
  const user = session?.user;
  if(!user){
    // fallback anon (dev) - localStorage por email
    const email = getOwnerEmailSync();
    if(!email) return JSON.parse(localStorage.getItem(getPlataformasKey())||'[]');
    try{
      const { data, error } = await supabase.from('platforms').select('*').eq('owner_email', email).order('created_at', {ascending:false});
      if(error) throw error;
      return (data||[]).map(mapPlatform);
    }catch(e){
      return JSON.parse(localStorage.getItem(getPlataformasKey())||'[]');
    }
  }
  try{
    const { data, error } = await supabase.from('platforms').select('*').eq('owner_id', user.id).order('created_at', {ascending:false});
    if(error) throw error;
    return (data||[]).map(mapPlatform);
  }catch(e){
    console.warn('sbLoadPlatforms secure fallback', e.message);
    return JSON.parse(localStorage.getItem(getPlataformasKey())||'[]');
  }
}
export async function sbSavePlatforms(list){
  // sempre espelha no localStorage
  try{ localStorage.setItem(getPlataformasKey(), JSON.stringify(list)); }catch{}
  const session = await getSession();
  const user = session?.user;
  if(!user){
    const email = getOwnerEmailSync();
    if(!email) return;
    // anon upsert por owner_email (RLS antigo allow all)
    for(const p of list){
      try{ await supabase.from('platforms').upsert({ id:p.id, owner_email:email, owner_id: null, ...unmapPlatform(p), nome:p.nome }, {onConflict:'id'}); }catch(e){}
    }
    return;
  }
  for(const p of list){
    try{
      await supabase.from('platforms').upsert({
        id: p.id,
        owner_id: user.id,
        owner_email: user.email,
        ...unmapPlatform(p),
        nome: p.nome,
      }, {onConflict:'id'});
    }catch(e){ console.warn('sbSavePlatforms', e.message); }
  }
}

// Vitrine pública: acha plataforma por slug ou dominio (oferta, tema, gateway público)
export async function sbLoadPublicPlatform(slugOrDomain){
  const s = (slugOrDomain||'').toLowerCase().trim();
  if(!s) return null;
  try{
    let { data } = await supabase.from('platforms').select('*').eq('slug', s).limit(1).maybeSingle();
    if(!data){
      const r2 = await supabase.from('platforms').select('*').eq('dominio', s).limit(1).maybeSingle();
      data = r2.data;
    }
    if(data) return mapPlatform(data);
  }catch(e){}
  // fallback: procura no localStorage de qualquer conta (demo local)
  try{
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(k && k.startsWith('platforms_')){
        const arr = JSON.parse(localStorage.getItem(k)||'[]');
        const f = (arr||[]).find(x=> (x.slug||'').toLowerCase()===s || (x.dominio||'').toLowerCase()===s || x.id===s);
        if(f) return f;
      }
    }
  }catch{}
  return null;
}

// Carteira do jogador na plataforma (local primeiro, Supabase quando der)
export function getPlayerKey(platformId){ return 'player_' + platformId; }
export function getPlayer(platformId){
  try{ return JSON.parse(localStorage.getItem(getPlayerKey(platformId))||'null'); }catch{ return null; }
}
export function savePlayer(platformId, player){
  try{ localStorage.setItem(getPlayerKey(platformId), JSON.stringify(player)); }catch{}
}
export async function sbUpsertPlayer(platformId, player){
  savePlayer(platformId, player);
  try{
    const payload = { platform_id: platformId, nome: player.nome||'', email: player.email||'', cpf: player.cpf||'', pix_key: player.pix_key||'', saldo: player.saldo||0, bonus: player.bonus||0 };
    if(player.id) payload.id = player.id;
    const { data, error } = await supabase.from('platform_players').upsert(payload, {onConflict:'id'}).select().single();
    if(!error && data){ savePlayer(platformId, { ...player, id: data.id, saldo: Number(data.saldo||0) }); return data; }
  }catch(e){}
  return player;
}
export async function sbCreateTransaction(tx){
  try{ await supabase.from('platform_transactions').insert(tx); }catch(e){}
  try{
    const k = 'txs_' + tx.platform_id;
    const arr = JSON.parse(localStorage.getItem(k)||'[]');
    arr.unshift({ ...tx, created_at: new Date().toISOString() });
    localStorage.setItem(k, JSON.stringify(arr.slice(0,100)));
  }catch{}
}
export async function sbCreateBet(bet){
  try{ await supabase.from('platform_bets').insert(bet); }catch(e){}
}

// Perfil 100% por conta
export async function sbLoadPerfil(){
  const session = await getSession();
  const user = session?.user;
  if(user){
    try{
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if(error && error.code!=='PGRST116') throw error;
      if(data) return { primeiroNome: data.primeiro_nome||'', ultimoNome: data.ultimo_nome||'', email: data.email, cpf: data.cpf||'', cnpj: data.cnpj||'', cep: data.cep||'', bairro: data.bairro||'', endereco: data.endereco||'', numero: data.numero||'', uf: data.uf||'', cidade: data.cidade||'' };
    }catch(e){}
  }
  // fallback anon por email
  const email = getOwnerEmailSync();
  if(email){
    try{
      const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
      if(data) return { primeiroNome: data.primeiro_nome||'', ultimoNome: data.ultimo_nome||'', email: data.email, cpf: data.cpf||'', cnpj: data.cnpj||'', cep: data.cep||'', bairro: data.bairro||'', endereco: data.endereco||'', numero: data.numero||'', uf: data.uf||'', cidade: data.cidade||'' };
    }catch(e){}
  }
  try{ return JSON.parse(localStorage.getItem(getPerfilKey())||'null'); }catch{ return null; }
}
export async function sbSavePerfil(perfil){
  try{ localStorage.setItem(getPerfilKey(), JSON.stringify(perfil)); }catch{}
  try{ localStorage.setItem('profits_user', JSON.stringify({email:perfil.email, name:(perfil.primeiroNome+' '+perfil.ultimoNome).trim(), cpf:perfil.cpf})); }catch{}
  const session = await getSession();
  const user = session?.user;
  if(user){
    try{
      await supabase.from('profiles').upsert({
        id: user.id,
        email: perfil.email,
        primeiro_nome: perfil.primeiroNome,
        ultimo_nome: perfil.ultimoNome,
        cpf: perfil.cpf,
        cnpj: perfil.cnpj||'',
        cep: perfil.cep||'',
        bairro: perfil.bairro||'',
        endereco: perfil.endereco||'',
        numero: perfil.numero||'',
        uf: perfil.uf||'',
        cidade: perfil.cidade||''
      }, {onConflict:'id'});
      return;
    }catch(e){ console.warn('sbSavePerfil secure', e.message); }
  }
  // anon fallback por email
  const email = getOwnerEmailSync() || perfil.email;
  if(email){
    try{
      await supabase.from('profiles').upsert({
        email: email,
        primeiro_nome: perfil.primeiroNome,
        ultimo_nome: perfil.ultimoNome,
        cpf: perfil.cpf,
        cnpj: perfil.cnpj||'',
        cep: perfil.cep||'',
        bairro: perfil.bairro||'',
        endereco: perfil.endereco||'',
        numero: perfil.numero||'',
        uf: perfil.uf||'',
        cidade: perfil.cidade||''
      }, {onConflict:'email'});
    }catch(e){}
  }
}

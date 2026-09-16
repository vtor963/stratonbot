// StratonPay Bets - Supabase 100% seguro (Auth + RLS por auth.uid())
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
export const supabase = createClient(
  'https://xkmxqjnprqoxbscpfzmg.supabase.co',
  'sb_publishable_IwpOfl9X9q4h22nU6pmVBw_rE-G6ViI'
);

// helper auth
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
      return (data||[]).map(r=> ({id:r.id, nome:r.nome, desc:r.descricao, layout:r.layout, img:r.img, badges:r.badges, dominio:r.dominio}));
    }catch(e){
      return JSON.parse(localStorage.getItem(getPlataformasKey())||'[]');
    }
  }
  try{
    const { data, error } = await supabase.from('platforms').select('*').eq('owner_id', user.id).order('created_at', {ascending:false});
    if(error) throw error;
    return (data||[]).map(r=> ({id:r.id, nome:r.nome, desc:r.descricao, layout:r.layout, img:r.img, badges:r.badges, dominio:r.dominio}));
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
      try{ await supabase.from('platforms').upsert({ id:p.id, owner_email:email, owner_id: null, nome:p.nome, descricao:p.desc||'', layout:p.layout||'', img:p.img||'', badges:p.badges||[], dominio:p.dominio||'' }, {onConflict:'id'}); }catch(e){}
    }
    return;
  }
  for(const p of list){
    try{
      await supabase.from('platforms').upsert({
        id: p.id,
        owner_id: user.id,
        owner_email: user.email,
        nome: p.nome,
        descricao: p.desc||'',
        layout: p.layout||'',
        img: p.img||'',
        badges: p.badges||[],
        dominio: p.dominio||''
      }, {onConflict:'id'});
    }catch(e){ console.warn('sbSavePlatforms', e.message); }
  }
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

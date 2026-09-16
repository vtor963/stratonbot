-- StratonPay Bets - v2 multi-tenant estilo Profits
-- Roda no Supabase Dashboard > SQL Editor (depois do supabase.sql / supabase-secure.sql)
-- Nada é apagado, só adiciona colunas/tabelas que faltavam pro fluxo oferta -> deposito -> aposta -> saque

-- 1) colunas novas em platforms (slug público, tema, oferta, gateway, limites)
alter table public.platforms add column if not exists slug text;
alter table public.platforms add column if not exists theme jsonb default '{}'::jsonb;
alter table public.platforms add column if not exists oferta jsonb default '{}'::jsonb;
alter table public.platforms add column if not exists gateway jsonb default '{}'::jsonb;
alter table public.platforms add column if not exists dep_min numeric default 20;
alter table public.platforms add column if not exists dep_max numeric default 10000;
alter table public.platforms add column if not exists saq_min numeric default 20;
alter table public.platforms add column if not exists saq_max numeric default 10000;
alter table public.platforms add column if not exists rtp text default 'medio';
alter table public.platforms add column if not exists suporte text default '';
alter table public.platforms add column if not exists whatsapp text default '';
alter table public.platforms add column if not exists telegram text default '';
alter table public.platforms add column if not exists instagram text default '';
alter table public.platforms add column if not exists published boolean default false;
alter table public.platforms add column if not exists updated_at timestamp with time zone default now();

-- slug único (quando preenchido). Plataformas antigas ganham slug do id
update public.platforms set slug = lower(regexp_replace(coalesce(nome,'plat') || '-' || substring(id from 1 for 4), '[^a-z0-9]+', '', 'g')) where slug is null;
create unique index if not exists idx_platforms_slug on public.platforms(slug);
create index if not exists idx_platforms_dominio on public.platforms(dominio);

-- 2) jogadores de cada plataforma (quem aposta na página pública, não é o dono)
create table if not exists public.platform_players (
  id uuid primary key default uuid_generate_v4(),
  platform_id text not null references public.platforms(id) on delete cascade,
  nome text,
  email text,
  cpf text,
  pix_key text,
  saldo numeric default 0,
  bonus numeric default 0,
  created_at timestamp with time zone default now()
);
create index if not exists idx_players_platform on public.platform_players(platform_id);
create index if not exists idx_players_email on public.platform_players(platform_id, email);

-- 3) transações (depósito/saque) por plataforma
create table if not exists public.platform_transactions (
  id uuid primary key default uuid_generate_v4(),
  platform_id text not null references public.platforms(id) on delete cascade,
  player_id uuid references public.platform_players(id) on delete set null,
  tipo text not null check (tipo in ('deposito','saque')),
  valor numeric not null check (valor > 0),
  status text not null default 'pendente' check (status in ('pendente','pago','recusado','processamento')),
  gateway text default 'manual',
  gateway_id text,
  qrcode text,
  pix_copia_cola text,
  created_at timestamp with time zone default now()
);
create index if not exists idx_trans_platform on public.platform_transactions(platform_id, created_at desc);

-- 4) apostas por plataforma (para o Teste/Blaze embutido)
create table if not exists public.platform_bets (
  id uuid primary key default uuid_generate_v4(),
  platform_id text not null references public.platforms(id) on delete cascade,
  player_id uuid references public.platform_players(id) on delete set null,
  jogo text not null default 'demo',
  valor numeric not null check (valor > 0),
  multiplicador numeric default 0,
  retorno numeric default 0,
  resultado text default 'pendente' check (resultado in ('win','loss','pendente')),
  created_at timestamp with time zone default now()
);
create index if not exists idx_bets_platform on public.platform_bets(platform_id, created_at desc);

-- 5) RLS: leitura pública da vitrine (oferta/tema), escrita via anon com publishable
-- Se você usa o supabase-secure.sql (owner = auth.uid), liberamos SELECT público só do necessário
alter table public.platforms enable row level security;
alter table public.platform_players enable row level security;
alter table public.platform_transactions enable row level security;
alter table public.platform_bets enable row level security;

-- limpa policies antigas conflitantes se existirem
drop policy if exists "platforms_public_read" on public.platforms;
create policy "platforms_public_read" on public.platforms for select using (true);

drop policy if exists "players_public_all" on public.platform_players;
create policy "players_public_all" on public.platform_players for all using (true) with check (true);

drop policy if exists "trans_public_all" on public.platform_transactions;
create policy "trans_public_all" on public.platform_transactions for all using (true) with check (true);

drop policy if exists "bets_public_all" on public.platform_transactions;
drop policy if exists "bets_public_all" on public.platform_bets;
create policy "bets_public_all" on public.platform_bets for all using (true) with check (true);

-- IMPORTANTE: as chaves secretas do gateway (client_secret) NÃO devem ficar no frontend.
-- Guarda só url + client_id por plataforma. O secret vai numa Edge Function depois.

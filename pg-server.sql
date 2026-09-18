-- StratonPay PG Server - tabelas no Supabase (sem VPS)
-- Roda no Dashboard > SQL Editor. Nada existente e alterado.

-- Sessoes de jogo (token atk entregue ao cliente PG)
create table if not exists public.pg_sessions (
  token text primary key,
  platform_id text not null,
  player_id uuid references public.platform_players(id) on delete cascade,
  game text not null default 'fortune-tiger',
  created_at timestamp with time zone default now()
);
create index if not exists idx_pgsess_player on public.pg_sessions(player_id);

-- Giros com idempotencia (round_id unico evita duplicar credito)
create table if not exists public.pg_spins (
  id uuid primary key default uuid_generate_v4(),
  platform_id text not null,
  player_id uuid references public.platform_players(id) on delete set null,
  game text not null default 'fortune-tiger',
  round_id text unique not null,
  bet numeric not null check (bet > 0),
  win numeric not null default 0,
  result text not null default 'pendente' check (result in ('ganho','perda','bonus','pendente')),
  payload jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);
create index if not exists idx_pgspins_player on public.pg_spins(platform_id, player_id, created_at desc);

-- Ajustes de probabilidade por plataforma (mesma ideia do motor original)
create table if not exists public.pg_config (
  platform_id text primary key,
  prob_ganho numeric default 0.18,
  prob_bonus numeric default 0.06,
  created_at timestamp with time zone default now()
);

-- RLS: escrita e leitura via service key nas functions da Vercel.
-- Leitura publica da config nao e necessaria; sessoes e giros ficam restritos.
alter table public.pg_sessions enable row level security;
alter table public.pg_spins enable row level security;
alter table public.pg_config enable row level security;

drop policy if exists "pgsess_service" on public.pg_sessions;
create policy "pgsess_service" on public.pg_sessions for all using (false) with check (false);

drop policy if exists "pgspins_service" on public.pg_spins;
create policy "pgspins_service" on public.pg_spins for all using (false) with check (false);

drop policy if exists "pgconfig_service" on public.pg_config;
create policy "pgconfig_service" on public.pg_config for all using (false) with check (false);

-- NOTA: policies acima bloqueiam anon. As functions usam SUPABASE_SERVICE_KEY
-- (service_role passa direto pelo RLS). Nunca exponha essa chave no front.

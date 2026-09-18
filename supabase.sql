-- StratonPay Bets - Supabase tabelas (roda no Dashboard > SQL Editor)
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  email text primary key,
  primeiro_nome text,
  ultimo_nome text,
  cpf text,
  cnpj text,
  cep text,
  bairro text,
  endereco text,
  numero text,
  uf text,
  cidade text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.platforms (
  id text primary key,
  owner_email text not null,
  nome text not null,
  descricao text,
  layout text,
  img text,
  badges jsonb,
  dominio text,
  created_at timestamp with time zone default now()
);

-- RLS permissivo para anon com publishable (usa owner_email como filtro no app)
alter table public.profiles enable row level security;
alter table public.platforms enable row level security;

drop policy if exists "allow all profiles" on public.profiles;
create policy "allow all profiles" on public.profiles for all using (true) with check (true);

drop policy if exists "allow all platforms" on public.platforms;
create policy "allow all platforms" on public.platforms for all using (true) with check (true);

-- indices
create index if not exists idx_platforms_owner on public.platforms(owner_email);
create index if not exists idx_profiles_email on public.profiles(email);

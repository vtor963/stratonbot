-- 100% SEGURO - StratonPay Bets
-- Roda em https://supabase.com/dashboard/project/xkmxqjnprqoxbscpfzmg/sql/new

-- 1) profiles vinculado ao auth.users (RLS por auth.uid())
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  primeiro_nome text,
  ultimo_nome text,
  cpf text,
  cnpj text,
  phone text,
  cep text,
  bairro text,
  endereco text,
  numero text,
  uf text,
  cidade text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2) platforms por dono (owner = auth.uid)
create table if not exists public.platforms (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_email text not null,
  nome text not null,
  descricao text,
  layout text,
  img text,
  badges jsonb,
  dominio text,
  created_at timestamp with time zone default now()
);

-- 3) RLS
alter table public.profiles enable row level security;
alter table public.platforms enable row level security;

drop policy if exists "profiles_is_owner" on public.profiles;
create policy "profiles_is_owner" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "platforms_is_owner" on public.platforms;
create policy "platforms_is_owner" on public.platforms
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- 4) funcao para criar perfil automaticamente no signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, primeiro_nome, ultimo_nome)
  values (new.id, new.email, split_part(new.raw_user_meta_data->>'name',' ',1), substring(new.raw_user_meta_data->>'name' from position(' ' in new.raw_user_meta_data->>'name')+1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5) indices
create index if not exists idx_platforms_owner on public.platforms(owner_id);
create index if not exists idx_profiles_email on public.profiles(email);

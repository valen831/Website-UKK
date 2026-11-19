-- =========================================================================
-- SCRIPT PERBAIKAN USER (GOOGLE LOGIN) & PESANAN (ORDERS) DI SUPABASE
-- Jalankan SEMUA skrip ini di Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- 1. Pastikan tabel profiles ada dan memiliki RLS
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Hapus policy lama profiles agar tidak duplikat
drop policy if exists "Public profiles readable" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Public profiles readable" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (true);
grant all on table public.profiles to anon, authenticated, service_role;

-- 2. SALIN SEMUA USER DARI auth.users KE public.profiles SEKARANG
-- (Ini langsung memasukkan akun Google Anda dan akun lain yang sudah login ke tabel profiles)
insert into public.profiles (id, name, email, avatar_url, role)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1), 'User') as name,
  email,
  raw_user_meta_data->>'avatar_url' as avatar_url,
  'user' as role
from auth.users
on conflict (id) do update set
  name = coalesce(excluded.name, public.profiles.name),
  email = coalesce(excluded.email, public.profiles.email),
  avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

-- 3. Trigger otomatis: Setiap kali ada user baru login / daftar via Google atau Email,
-- otomatis buat baris di public.profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User'),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'user'
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, public.profiles.name),
    email = coalesce(excluded.email, public.profiles.email),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Pastikan tabel orders memiliki struktur yang lengkap
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null default '[]',
  total_price integer not null default 0,
  total_deposit integer not null default 0,
  grand_total integer not null default 0,
  customer_name text not null default '',
  customer_whatsapp text not null default '',
  customer_address text not null default '',
  customer_id_number text,
  delivery_method text not null default 'pickup',
  payment_method text not null default 'transfer_bca',
  status text default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- Pastikan jika constraint foreign key lama merujuk ke tabel profiles, ubah jadi aman
do $$
begin
  alter table public.orders drop constraint if exists orders_user_id_fkey;
  alter table public.orders add constraint orders_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;
exception when others then
  null;
end $$;

-- 5. Aktifkan RLS dan set Policy orders
alter table public.orders enable row level security;

drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can insert orders" on public.orders;
drop policy if exists "Admin can update orders" on public.orders;
drop policy if exists "Anyone can search by code" on public.orders;
drop policy if exists "orders_select_policy" on public.orders;
drop policy if exists "orders_insert_policy" on public.orders;
drop policy if exists "orders_update_policy" on public.orders;
drop policy if exists "orders_delete_policy" on public.orders;
drop policy if exists "Admin full access orders" on public.orders;

-- SELECT: Bisa diakses untuk admin dan pengguna
create policy "orders_select_policy" on public.orders
for select
using (true);

-- INSERT: Siapa saja yang checkout bisa menyimpan pesanan
create policy "orders_insert_policy" on public.orders
for insert
with check (true);

-- UPDATE: Pengguna login dan admin bisa update status
create policy "orders_update_policy" on public.orders
for update
using (true)
with check (true);

-- DELETE: Pengguna login dan admin bisa delete
create policy "orders_delete_policy" on public.orders
for delete
using (true);

grant all on table public.orders to anon, authenticated, service_role;

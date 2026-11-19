-- =========================================================================
-- SCRIPT PERBAIKAN PERMISSION & RLS ORDERS DI SUPABASE
-- Jalankan SEMUA skrip ini di Supabase Dashboard -> SQL Editor -> Run
-- (Pastikan copy SEMUA teks dari baris 1 sampai akhir, jangan ada yang terpotong)
-- =========================================================================

-- 1. Pastikan tabel orders memiliki struktur yang lengkap
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

-- 2. Pastikan RLS aktif pada tabel orders
alter table public.orders enable row level security;

-- 3. Hapus semua policy lama pada tabel orders agar bersih dan tidak bentrok
drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can insert orders" on public.orders;
drop policy if exists "Admin can update orders" on public.orders;
drop policy if exists "Anyone can search by code" on public.orders;
drop policy if exists "orders_select_policy" on public.orders;
drop policy if exists "orders_insert_policy" on public.orders;
drop policy if exists "orders_update_policy" on public.orders;
drop policy if exists "orders_delete_policy" on public.orders;
drop policy if exists "Admin full access orders" on public.orders;

-- 4. Buat policy baru langsung tanpa function eksternal (mencegah error "function is_admin does not exist")

-- SELECT: Semua user dan admin dapat melihat data pesanan (untuk tracking dan admin panel)
create policy "orders_select_policy" on public.orders
for select
using (true);

-- INSERT: Siapa saja yang checkout dapat membuat pesanan
create policy "orders_insert_policy" on public.orders
for insert
with check (true);

-- UPDATE: Admin atau user terautentikasi dapat mengupdate status pesanan
create policy "orders_update_policy" on public.orders
for update
using (
  auth.uid() is not null
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  auth.uid() is not null
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- DELETE: Hanya user login yang berhak menghapus pesanan
create policy "orders_delete_policy" on public.orders
for delete
using (auth.uid() is not null);

-- 5. Berikan hak akses tabel ke role PostgreSQL anon & authenticated
grant all on table public.orders to anon, authenticated, service_role;

-- 6. Helper function is_admin (opsional)
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

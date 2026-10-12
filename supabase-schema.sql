-- ============================================
-- Schema Supabase untuk RentaGo Rental App
-- ============================================

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
create policy "Public profiles readable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Items table (barang sewaan)
create table items (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  category text not null,
  description text,
  specifications jsonb default '{}',
  price_per_day integer not null,
  deposit integer not null,
  images text[] default '{}',
  stock integer default 1,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  featured boolean default false,
  available boolean default true,
  booked_dates text[] default '{}',
  created_at timestamptz default now()
);

alter table items enable row level security;
create policy "Items readable by all" on items for select using (true);
create policy "Admin can insert items" on items for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin can update items" on items for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin can delete items" on items for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Orders table (pesanan)
create table orders (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  user_id uuid references profiles(id),
  items jsonb not null default '[]',
  total_price integer not null,
  total_deposit integer not null,
  grand_total integer not null,
  customer_name text not null,
  customer_whatsapp text not null,
  customer_address text not null,
  customer_id_number text,
  delivery_method text not null check (delivery_method in ('pickup', 'delivery')),
  payment_method text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'active', 'returned', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

alter table orders enable row level security;
create policy "Users can view own orders" on orders for select using (
  auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert orders" on orders for insert with check (auth.uid() = user_id);
create policy "Admin can update orders" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
-- Lookup pesanan by code untuk guest
create policy "Anyone can search by code" on orders for select using (true);

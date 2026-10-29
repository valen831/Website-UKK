-- Jalankan perintah ini di Supabase SQL Editor jika dashboard sudah tidak ngelag
-- Perintah ini membuat trigger handle_new_user menjadi aman (tidak membatalkan signup jika profiles gagal)

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  return new;
end;
$$ language plpgsql security definer;

-- Pastikan trigger terpasang
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

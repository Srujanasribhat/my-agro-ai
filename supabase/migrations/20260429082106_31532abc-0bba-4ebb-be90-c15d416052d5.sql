
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Profiles are insertable by owner" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Detections
create table public.detections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_data_url text,
  plant text,
  disease text not null,
  is_healthy boolean not null default false,
  confidence numeric not null default 0,
  severity text,
  description text,
  treatment text,
  prevention text,
  created_at timestamptz not null default now()
);
alter table public.detections enable row level security;
create policy "Detections viewable by owner" on public.detections for select using (auth.uid() = user_id);
create policy "Detections insertable by owner" on public.detections for insert with check (auth.uid() = user_id);
create policy "Detections deletable by owner" on public.detections for delete using (auth.uid() = user_id);

create index detections_user_created_idx on public.detections(user_id, created_at desc);

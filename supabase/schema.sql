-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  email text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table profiles enable row level security;

-- Drop existing policies to recreate them safely
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- WATCHLISTS
create table if not exists watchlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  imdb_id text not null,
  title text not null,
  poster_url text,
  year text, 
  watched boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index check (Supabase doesn't support IF NOT EXISTS on indexes in old postgres, but generally safe to create if table is new)
-- To be safe, we'll use a do block or just assume it exists if table exists
do $$
begin
  if not exists (select 1 from pg_class where relname = 'watchlists_user_imdb_unique') then
    create unique index watchlists_user_imdb_unique on watchlists (user_id, imdb_id);
  end if;
end $$;

-- RLS for Watchlists
alter table watchlists enable row level security;
drop policy if exists "Users can view their own watchlist." on watchlists;
drop policy if exists "Users can insert into own watchlist." on watchlists;
drop policy if exists "Users can delete from own watchlist." on watchlists;

create policy "Watchlists are viewable by everyone." on watchlists for select using (true);
create policy "Users can insert into own watchlist." on watchlists for insert with check (auth.uid() = user_id);
create policy "Users can delete from own watchlist." on watchlists for delete using (auth.uid() = user_id);
create policy "Users can update own watchlist." on watchlists for update using (auth.uid() = user_id);


-- THEATRES
create table if not exists theatres (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references profiles(id) not null,
  name text not null,
  invite_code text unique not null default gen_random_uuid()::text,
  merge_mode text check (merge_mode in ('union', 'intersection', 'xor')) default 'intersection',
  last_picked_imdb_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Theatres
alter table theatres enable row level security;
drop policy if exists "Theatres viewable by invite code or participants." on theatres;
drop policy if exists "Users can create theatres." on theatres;
drop policy if exists "Host can update theatre." on theatres;

create policy "Users can create theatres." on theatres for insert with check (auth.uid() = host_id);
create policy "Theatres viewable by invite code or participants." on theatres for select using (true); 
create policy "Host can update theatre." on theatres for update using (auth.uid() = host_id);


-- THEATRE SESSIONS
create table if not exists theatre_sessions (
  id uuid default gen_random_uuid() primary key,
  theatre_id uuid references theatres(id) not null,
  user_id uuid references profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

do $$
begin
  if not exists (select 1 from pg_class where relname = 'theatre_sessions_unique') then
    create unique index theatre_sessions_unique on theatre_sessions (theatre_id, user_id);
  end if;
end $$;

-- RLS for Theatre Sessions
alter table theatre_sessions enable row level security;
drop policy if exists "Participants can view sessions for their theatres." on theatre_sessions;
drop policy if exists "Users can join a theatre." on theatre_sessions;
drop policy if exists "Users can leave a theatre." on theatre_sessions;

create policy "Participants can view sessions for their theatres." on theatre_sessions for select using (true);
create policy "Users can join a theatre." on theatre_sessions for insert with check (auth.uid() = user_id);
create policy "Users can leave a theatre." on theatre_sessions for delete using (auth.uid() = user_id);


-- FUNCTION to handle new user signup automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, email, avatar_url)
  values (
    new.id, 
    coalesce(
      new.raw_user_meta_data->>'username', 
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ), 
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger check: Drop and recreate to ensure it's fresh
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for public profiles
create table users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  google_id text unique,
  created_at timestamptz default now(),
  last_login_at timestamptz
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table users enable row level security;

create policy "Public profiles are viewable by everyone." on users
  for select using (true);

create policy "Users can insert their own profile." on users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on users
  for update using (auth.uid() = id);

-- Function to handle new user signup (Optional but recommended for auto-sync)
-- tailored for the user's request of "storing login data" manually via client-side or
-- we can do it via trigger. The user asked for a table.
-- The implementation I'll build will handle the insertion on login success in the client
-- to make it simpler to understand as a "prototype".

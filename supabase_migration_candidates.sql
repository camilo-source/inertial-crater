create table all_candidates (
  candidate_id uuid references users(id) on delete cascade not null primary key,
  full_name text,
  role text,
  location text,
  seniority text,
  status text,
  summary text,
  linkedin_url text,
  skills text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies
alter table all_candidates enable row level security;

create policy "Candidates are viewable by everyone." on all_candidates
  for select using (true);

create policy "Users can insert their own candidate profile." on all_candidates
  for insert with check (auth.uid() = candidate_id);

create policy "Users can update their own candidate profile." on all_candidates
  for update using (auth.uid() = candidate_id);

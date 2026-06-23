-- Emails table for AI inbox
create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  from_name text not null,
  from_email text not null,
  subject text not null,
  body text not null default '',
  category text,
  is_read boolean not null default false,
  is_starred boolean not null default false,
  received_at timestamptz not null default now(),
  ai_summary text,
  ai_actions jsonb default '[]'::jsonb,
  ai_draft text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.emails enable row level security;

create policy "Users can view own emails"
  on public.emails for select
  using (auth.uid() = user_id);

create policy "Users can insert own emails"
  on public.emails for insert
  with check (auth.uid() = user_id);

create policy "Users can update own emails"
  on public.emails for update
  using (auth.uid() = user_id);

create policy "Users can delete own emails"
  on public.emails for delete
  using (auth.uid() = user_id);

-- Index for performance
create index emails_user_id_received_at on public.emails(user_id, received_at desc);
